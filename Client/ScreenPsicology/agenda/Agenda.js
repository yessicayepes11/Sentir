document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    initViewToggle();
    initCalendarNav();
    renderAgenda();
    initAgendaFilters();
    initAddAppointment();
    applyAgendaPrefill();
    document.addEventListener('sentir:datos', () => { refrescarDispoCalendario(); renderAgenda(); });
});


function applyAgendaPrefill() {
    const params = new URLSearchParams(window.location.search);
    const student = params.get('student');
    if (!student || params.get('followup') !== '1') return;

    // El seguimiento se agenda en una franja libre (ver openFollowupModal)
    document.addEventListener('sentir:datos', () => openFollowupModal(student), { once: true });

    // Limpiar los parámetros para que el formulario no vuelva a abrirse al refrescar.
    window.history.replaceState({}, document.title, window.location.pathname);
}

let agendaViewMode = 'list';
let calendarCursor = new Date();
let dateFilter = null;
let agendaFilter = 'all';

/* Estados de una cita y cómo se muestran */
const ESTADO_CITA = {
    'Pendiente': { label: 'Por aceptar', cls: 'pending', icon: 'fa-hourglass-half' },
    'Programada': { label: 'Programada', cls: 'scheduled', icon: 'fa-calendar-check' },
    'Realizada': { label: 'Realizada', cls: 'done', icon: 'fa-circle-check' },
    'No asistió': { label: 'No asistió', cls: 'missed', icon: 'fa-user-xmark' }
};

const citasPendientes = () => getAgenda().filter(a => a.estado === 'Pendiente');
const citasDeLaAgenda = () => getAgenda().filter(a => a.estado !== 'Pendiente');

function renderAgendaSummary() {
    const all = citasDeLaAgenda();
    const today = todayISO();
    const todayCount = all.filter(a => a.fecha === today && a.estado === 'Programada').length;
    const upcomingCount = all.filter(a => a.fecha > today && a.estado === 'Programada').length;
    const pendientes = citasPendientes().length;

    document.getElementById('agendaSummary').innerHTML = `
        <div class="agenda-summary-card today">
            <div class="agenda-summary-icon"><i class="fa-solid fa-calendar-day"></i></div>
            <div class="agenda-summary-text"><strong>${todayCount}</strong><span>CITAS HOY</span></div>
        </div>
        <div class="agenda-summary-card upcoming">
            <div class="agenda-summary-icon"><i class="fa-solid fa-calendar-week"></i></div>
            <div class="agenda-summary-text"><strong>${upcomingCount}</strong><span>PRÓXIMAS</span></div>
        </div>
        <div class="agenda-summary-card ${pendientes ? 'pending' : ''}">
            <div class="agenda-summary-icon"><i class="fa-solid fa-hourglass-half"></i></div>
            <div class="agenda-summary-text"><strong>${pendientes}</strong><span>POR ACEPTAR</span></div>
        </div>
    `;
}

/* Solicitudes de los estudiantes que esperan respuesta */
function renderPendientes() {
    const caja = document.getElementById('pendingRequests');
    if (!caja) return;
    const lista = citasPendientes().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    if (!lista.length) { caja.innerHTML = ''; caja.hidden = true; return; }

    caja.hidden = false;
    caja.innerHTML = `
        <div class="pending-head">
            <h3><i class="fa-solid fa-hourglass-half"></i> Citas por aceptar <span>${lista.length}</span></h3>
            <p>Solicitudes que hicieron los estudiantes. Al aceptarlas o rechazarlas se les avisa.</p>
        </div>
        <div class="pending-list">
            ${lista.map(a => `
                <div class="pending-card" data-id="${a.id}">
                    <div class="pending-when">
                        <strong>${formatDayLabel(a.fecha).replace(/^./, c => c.toUpperCase())}</strong>
                        <span>${hora12Corta(a.hora)}${a.conHorario ? '' : ' · horario propuesto'}</span>
                    </div>
                    <div class="pending-info">
                        <h4>${escaparHTML(a.nombre)} <small>Grado ${escaparHTML(a.grado)}</small></h4>
                        <p>${escaparHTML(a.descripcion)}</p>
                    </div>
                    <div class="pending-actions">
                        <button type="button" class="pa-accept" data-accion="aceptar"><i class="fa-solid fa-check"></i> Aceptar</button>
                        <button type="button" class="pa-other" data-accion="otro"><i class="fa-solid fa-clock-rotate-left"></i> Otro horario</button>
                        <button type="button" class="pa-reject" data-accion="rechazar"><i class="fa-solid fa-xmark"></i> Rechazar</button>
                    </div>
                </div>`).join('')}
        </div>`;

    caja.querySelectorAll('.pending-card').forEach(card => {
        const cita = getAgenda().find(a => a.id === card.dataset.id);
        card.querySelector('[data-accion="aceptar"]').addEventListener('click', () => aceptarCita(cita));
        card.querySelector('[data-accion="otro"]').addEventListener('click', () => openFollowupModal(cita.nombre, { cita }));
        card.querySelector('[data-accion="rechazar"]').addEventListener('click', () => rechazarCita(cita));
    });
}

async function aceptarCita(cita) {
    try {
        await sentirApi(`/citas/${cita.idCita}/aceptar`, { method: 'PUT' });
        showToast({ title: 'Cita aceptada', message: `Se le avisó a ${cita.nombre} que su cita quedó confirmada.`, icon: 'fa-calendar-check', type: 'success' });
        await cargarDatosReales();
    } catch (error) {
        showToast({ title: 'No se pudo aceptar', message: error.message, icon: 'fa-circle-exclamation', type: 'urgent' });
    }
}

function rechazarCita(cita) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon" style="background:#FEF2F2; color:var(--riesgo-alto);"><i class="fa-solid fa-calendar-xmark"></i></div>
            <div><h3>Rechazar solicitud</h3><p>${escaparHTML(cita.nombre)} · ${formatDayLabel(cita.fecha)} a las ${hora12Corta(cita.hora)}</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>MENSAJE PARA EL ESTUDIANTE (OPCIONAL)</label>
                <textarea id="rcMotivo" rows="3" placeholder="Ej. Ese día no hay atención; puedes pedir otro horario."></textarea>
            </div>
            <p class="fu-note"><i class="fa-solid fa-circle-info"></i> Si prefieres atenderlo en otro momento, usa "Otro horario" en lugar de rechazar.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="rcCancel">Volver</button>
            <button class="modal-btn-confirm" id="rcOk" style="background:var(--riesgo-alto);"><i class="fa-solid fa-xmark"></i> Rechazar solicitud</button>
        </div>
    `);
    overlay.querySelector('#rcCancel').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#rcOk').addEventListener('click', async (e) => {
        e.currentTarget.disabled = true;
        try {
            await sentirApi(`/citas/${cita.idCita}/rechazar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo: overlay.querySelector('#rcMotivo').value.trim() })
            });
            closeSentirModal(overlay);
            showToast({ title: 'Solicitud rechazada', message: `Se le avisó a ${cita.nombre}.`, icon: 'fa-calendar-xmark', type: 'info' });
            await cargarDatosReales();
        } catch (error) {
            showToast({ title: 'No se pudo rechazar', message: error.message, icon: 'fa-circle-exclamation', type: 'urgent' });
            e.currentTarget.disabled = false;
        }
    });
}

function renderAgenda() {
    renderAgendaSummary();
    actualizarContadoresAgenda();
    renderPendientes();
    const nota = document.getElementById('dateFilterNote');
    if (nota) {
        nota.hidden = !dateFilter;
        if (dateFilter) {
            const etiqueta = formatDayLabel(dateFilter);
            nota.innerHTML = `<i class="fa-solid fa-filter"></i> Citas del ${etiqueta.charAt(0).toLowerCase() + etiqueta.slice(1)} <button type="button" id="clearDateFilter">Ver todas</button>`;
            nota.querySelector('#clearDateFilter').addEventListener('click', () => {
                dateFilter = null;
                agendaFilter = 'all';
                document.querySelectorAll('#agendaChips .chip').forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
                renderAgenda();
            });
        }
    }
    if (typeof renderCalendar === 'function') renderCalendar();
    const query = document.getElementById('agendaSearch').value.toLowerCase().trim();
    let items = citasDeLaAgenda().slice().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    const today = todayISO();
    if (dateFilter) {
        items = items.filter(a => a.fecha === dateFilter);
    } else {
        if (agendaFilter === 'all') items = items.filter(a => a.fecha >= today || a.estado === 'Programada');
        if (agendaFilter === 'today') items = items.filter(a => a.fecha === today);
        if (agendaFilter === 'upcoming') items = items.filter(a => a.fecha > today);
        if (agendaFilter === 'past') items = items.filter(a => a.fecha < today || a.estado !== 'Programada').reverse();
    }

    if (query) {
        items = items.filter(a =>
            a.nombre.toLowerCase().includes(query) ||
            a.titulo.toLowerCase().includes(query) ||
            String(a.grado).toLowerCase().includes(query)
        );
    }

    const container = document.getElementById('agendaColumns');
    const emptyMsg = document.getElementById('agendaEmptyMsg');

    if (!items.length) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        emptyMsg.innerText = getAgenda().length ? 'No tienes citas que coincidan con la búsqueda.' : 'Aún no tienes citas. Usa "Nueva Cita" para agendar una.';
        return;
    }
    emptyMsg.style.display = 'none';

    // Agrupar por fecha
    const groups = {};
    items.forEach(a => { (groups[a.fecha] = groups[a.fecha] || []).push(a); });

    container.innerHTML = Object.keys(groups).map(fecha => {
        const label = formatDayLabel(fecha);
        const cards = groups[fecha].map(a => {
            const est = ESTADO_CITA[a.estado] || ESTADO_CITA.Programada;
            const editable = a.estado === 'Programada';
            return `
            <div class="appointment-card estado-${est.cls}" data-id="${a.id}">
                <div class="appointment-time"><strong>${hora12Corta(a.hora).replace(/ [ap]\. m\./, '')}</strong><span>${a.hora < '12:00' ? 'a. m.' : 'p. m.'}</span></div>
                <div class="appointment-info">
                    <h4>${escaparHTML(a.titulo)} <span class="appt-status ${est.cls}"><i class="fa-solid ${est.icon}"></i> ${est.label}</span></h4>
                    <p class="appt-meta">${escaparHTML(a.nombre)} · Grado ${escaparHTML(a.grado)}${a.origen === 'estudiante' ? ' · <i class="fa-solid fa-hand"></i> la pidió el estudiante' : ''}</p>
                    <p class="appt-desc">${escaparHTML(a.descripcion || 'Sin descripción adicional.')}</p>
                </div>
                <div class="appointment-actions">
                    ${editable ? '<button class="appt-icon-btn edit-btn" title="Reprogramar"><i class="fa-solid fa-pen"></i></button>' : ''}
                    ${editable ? '<button class="appt-icon-btn delete-btn" title="Cancelar cita"><i class="fa-solid fa-calendar-xmark"></i></button>' : ''}
                </div>
            </div>`;
        }).join('');
        return `<div class="agenda-day-group"><div class="agenda-day-title">${label} <span>${groups[fecha].length} cita${groups[fecha].length > 1 ? 's' : ''}</span></div>${cards}</div>`;
    }).join('');

    container.querySelectorAll('.appointment-card').forEach(card => {
        const id = card.dataset.id;
        const cita = getAgenda().find(a => a.id === id);
        const editBtn = card.querySelector('.edit-btn');
        const delBtn = card.querySelector('.delete-btn');
        if (editBtn) editBtn.addEventListener('click', (e) => { e.stopPropagation(); openFollowupModal(cita.nombre, { cita }); });
        if (delBtn) delBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteAppointment(id); });
        card.addEventListener('click', () => openStoredAppointment(cita));
    });
}

function formatDayLabel(fechaISO) {
    const today = todayISO();
    const tomorrow = addDaysISO(1);
    if (fechaISO === today) return 'Hoy';
    if (fechaISO === tomorrow) return 'Mañana';
    return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

function initAgendaFilters() {
    document.querySelectorAll('#agendaChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#agendaChips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            agendaFilter = chip.dataset.filter;
            dateFilter = null;
            renderAgenda();
        });
    });
    document.getElementById('agendaSearch').addEventListener('input', renderAgenda);
}

async function deleteAppointment(id) {
    const cita = getAgenda().find(a => a.id === id);
    if (!cita) return;
    if (!confirm(`¿Cancelar la cita de ${cita.nombre}? El horario volverá a quedar libre y se le avisará al estudiante.`)) return;
    try {
        await sentirApi('/citas/' + cita.idCita, { method: 'DELETE' });
        showToast({ title: 'Cita cancelada', message: `Se le avisó a ${cita.nombre}. El horario quedó libre.`, icon: 'fa-calendar-xmark', type: 'info' });
        await cargarDatosReales();
    } catch (error) {
        showToast({ title: 'No se pudo cancelar', message: error.message, icon: 'fa-circle-exclamation', type: 'urgent' });
    }
}

async function cambiarEstadoCita(cita, estado) {
    try {
        await sentirApi(`/citas/${cita.idCita}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        showToast({ title: 'Cita actualizada', message: `La cita de ${cita.nombre} quedó como "${estado}".`, icon: 'fa-circle-check', type: 'success' });
        await cargarDatosReales();
    } catch (error) {
        showToast({ title: 'No se pudo actualizar', message: error.message, icon: 'fa-circle-exclamation', type: 'urgent' });
    }
}

/* "Nueva Cita": primero se elige al estudiante, luego el horario */
function initAddAppointment() {
    document.getElementById('addAppointmentBtn').addEventListener('click', openNewAppointmentPicker);
}

function openNewAppointmentPicker() {
    const estudiantes = getStudents().filter(s => s.idUsuario).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-calendar-plus"></i></div>
            <div><h3>Nueva cita</h3><p>Paso 1 de 2 · Elige al estudiante (por nombre o número de identificación)</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field">
                <div class="ap-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="ncBuscar" placeholder="Ej. Rodrigo o 1036680196" autocomplete="off"></div>
            </div>
            <div class="ap-results" id="ncLista"></div>
        </div>
        <div class="sentir-modal-actions"><button class="modal-btn-cancel" id="ncCancel">Cancelar</button></div>
    `);
    const buscar = overlay.querySelector('#ncBuscar');
    const lista = overlay.querySelector('#ncLista');
    const pintar = () => {
        const q = buscar.value.toLowerCase().trim();
        const encontrados = estudiantes.filter(s => !q || s.name.toLowerCase().includes(q) || String(s.idUsuario).includes(q)).slice(0, 30);
        lista.innerHTML = encontrados.length ? encontrados.map(s => `
            <button type="button" class="ap-result" data-nombre="${escaparHTML(s.name)}">
                <img src="${s.avatar}" alt="">
                <span class="ap-result-info"><strong>${escaparHTML(s.name)}</strong><small>ID ${s.idUsuario} · Grado ${escaparHTML(s.grade)}</small></span>
                <i class="fa-solid fa-chevron-right ap-check"></i>
            </button>`).join('')
            : '<p class="ap-hint"><i class="fa-solid fa-user-slash"></i> No hay estudiantes que coincidan.</p>';
        lista.querySelectorAll('[data-nombre]').forEach(b => b.addEventListener('click', () => {
            closeSentirModal(overlay);
            openFollowupModal(b.dataset.nombre);
        }));
    };
    buscar.addEventListener('input', pintar);
    pintar();
    setTimeout(() => buscar.focus(), 50);
    overlay.querySelector('#ncCancel').addEventListener('click', () => closeSentirModal(overlay));
}

/* ==========================================================================
   VISTA DE CALENDARIO MENSUAL
   ========================================================================== */
/* ---------- Pestañas: disponibilidad / mis citas / calendario ---------- */
const PESTANAS_AGENDA = ['disponibilidad', 'citas', 'calendario'];

function mostrarPestanaAgenda(tab) {
    if (!PESTANAS_AGENDA.includes(tab)) tab = 'citas';
    document.querySelectorAll('#agendaTabs .agenda-tab').forEach(b => {
        const activa = b.dataset.tab === tab;
        b.classList.toggle('active', activa);
        b.setAttribute('aria-selected', activa ? 'true' : 'false');
    });
    document.querySelectorAll('.agenda-panel').forEach(p => { p.hidden = p.dataset.panel !== tab; });
    agendaViewMode = tab === 'calendario' ? 'calendar' : 'list';
    if (tab === 'calendario') renderCalendar();
    try { localStorage.setItem('sentir_agenda_tab', tab); } catch (e) { /* sin almacenamiento */ }
}

function initViewToggle() {
    document.querySelectorAll('#agendaTabs .agenda-tab').forEach(b => b.addEventListener('click', () => mostrarPestanaAgenda(b.dataset.tab)));
    let inicial = (location.hash || '').replace('#', '');
    if (!PESTANAS_AGENDA.includes(inicial)) {
        try { inicial = localStorage.getItem('sentir_agenda_tab') || 'citas'; } catch (e) { inicial = 'citas'; }
    }
    mostrarPestanaAgenda(inicial);
}

function actualizarContadoresAgenda() {
    const hoy = todayISO();
    const proximas = citasDeLaAgenda().filter(a => a.fecha >= hoy && a.estado === 'Programada').length;
    const pendientes = citasPendientes().length;
    const el = document.getElementById('tabCountCitas');
    if (el) {
        el.innerText = pendientes ? `${pendientes} por aceptar` : (proximas || '');
        el.classList.toggle('alert', pendientes > 0);
    }
}

function initCalendarNav() {
    document.getElementById('calPrevBtn').addEventListener('click', () => {
        calendarCursor.setMonth(calendarCursor.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('calNextBtn').addEventListener('click', () => {
        calendarCursor.setMonth(calendarCursor.getMonth() + 1);
        renderCalendar();
    });
}

/* Disponibilidad del mes (franjas libres por día) para el calendario */
const dispoPorMes = {};
async function cargarDispoMes(year, month) {
    const clave = `${year}-${month}`;
    dispoPorMes[clave] = 'cargando';
    const desde = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const hasta = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
    try {
        const { franjas } = await sentirApi(`/disponibilidad?desde=${desde}&hasta=${hasta}`);
        const porDia = {};
        (franjas || []).forEach(f => {
            const d = (porDia[f.fecha] = porDia[f.fecha] || { libres: 0, reservadas: 0, desde: f.hora, hasta: f.hora });
            if (f.reservada) d.reservadas++; else d.libres++;
            if (f.hora < d.desde) d.desde = f.hora;
            if (f.hora > d.hasta) d.hasta = f.hora;
        });
        dispoPorMes[clave] = porDia;
    } catch (error) {
        dispoPorMes[clave] = {};
    }
    renderCalendar();
}
function refrescarDispoCalendario() {
    Object.keys(dispoPorMes).forEach(k => delete dispoPorMes[k]);
    if (agendaViewMode === 'calendar') renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('calMonthLabel');
    if (!grid || !label) return;

    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    label.innerText = calendarCursor.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase());

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayISO();

    const claveMes = `${year}-${month}`;
    if (!dispoPorMes[claveMes]) cargarDispoMes(year, month);
    const dispo = typeof dispoPorMes[claveMes] === 'object' ? dispoPorMes[claveMes] : {};

    const agendaByDate = {};
    getAgenda().forEach(a => { (agendaByDate[a.fecha] = agendaByDate[a.fecha] || []).push(a); });

    let cellsHTML = '';
    for (let i = 0; i < firstDayOfWeek; i++) cellsHTML += `<div class="calendar-day is-empty"></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = (agendaByDate[cellDate] || []).sort((a, b) => a.hora.localeCompare(b.hora));
        const isToday = cellDate === today;
        const isSelected = cellDate === dateFilter;
        const visible = dayAppointments.slice(0, 3);
        const extra = dayAppointments.length - visible.length;

        const eventsHTML = visible.map(a => {
            const c = getAppointmentColor(a.titulo);
            const pendiente = a.estado === 'Pendiente';
            return `<div class="calendar-event ${pendiente ? 'is-pending' : ''}" style="background:${c.bg}; color:${c.solid};" title="${pendiente ? 'Por aceptar' : escaparHTML(a.estado || '')}">
                        <span class="calendar-event-dot" style="background:${c.solid};"></span>${pendiente ? '⏳ ' : ''}${escaparHTML(a.titulo)} · ${a.hora}
                    </div>`;
        }).join('');

        cellsHTML += `
            <div class="calendar-day ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${cellDate}">
                <span class="calendar-day-number">${day}</span>
                ${dispo[cellDate] && dispo[cellDate].libres && cellDate >= today ? `<div class="calendar-free" title="Desde ${hora12Corta(dispo[cellDate].desde)} · última franja ${hora12Corta(dispo[cellDate].hasta)}"><i class="fa-solid fa-business-time"></i> ${dispo[cellDate].libres} libre${dispo[cellDate].libres === 1 ? '' : 's'}</div>` : ''}
                <div class="calendar-day-events">
                    ${eventsHTML}
                    ${extra > 0 ? `<div class="calendar-event-more">+${extra} más</div>` : ''}
                </div>
            </div>`;
    }

    grid.innerHTML = cellsHTML;
    renderCalendarLegend();

    grid.querySelectorAll('.calendar-day:not(.is-empty)').forEach(cell => {
        cell.addEventListener('click', () => {
            dateFilter = cell.dataset.date;
            document.querySelectorAll('#agendaChips .chip').forEach(c => c.classList.remove('active'));
            mostrarPestanaAgenda('citas');
            renderAgenda();
        });
    });
}

function renderCalendarLegend() {
    const legend = document.getElementById('calendarLegend');
    if (!legend || legend.dataset.rendered) return;

    const types = [...APPOINTMENT_TYPE_RULES.map(r => ({ label: r.label, color: r.color })), { label: DEFAULT_APPOINTMENT_TYPE.label, color: DEFAULT_APPOINTMENT_TYPE.color }];
    legend.innerHTML = types.map(t => `<span class="calendar-legend-item"><span class="calendar-legend-dot" style="background:${t.color}"></span>${t.label}</span>`).join('')
        + '<span class="calendar-legend-item">⏳ Por aceptar</span>'
        + '<span class="calendar-legend-item"><i class="fa-solid fa-business-time" style="color:var(--riesgo-estable);"></i> Horarios libres (mi disponibilidad)</span>';
    legend.dataset.rendered = 'true';
}

/* Detalle de una cita con sus acciones según el estado */
function openStoredAppointment(cita) {
    if (!cita) return;
    const est = ESTADO_CITA[cita.estado] || ESTADO_CITA.Programada;
    const pendiente = cita.estado === 'Pendiente';
    const programada = cita.estado === 'Programada';
    const yaPaso = new Date(`${cita.fecha}T${cita.hora}:00`) <= new Date();

    const acciones = pendiente
        ? `<button class="modal-btn-cancel" id="scRechazar"><i class="fa-solid fa-xmark"></i> Rechazar</button>
           <button class="modal-btn-cancel" id="scOtro"><i class="fa-solid fa-clock-rotate-left"></i> Otro horario</button>
           <button class="modal-btn-confirm" id="scAceptar"><i class="fa-solid fa-check"></i> Aceptar</button>`
        : programada
            ? `<button class="modal-btn-cancel" id="scCancelar"><i class="fa-solid fa-calendar-xmark"></i> Cancelar cita</button>
               <button class="modal-btn-cancel" id="scReprogramar"><i class="fa-solid fa-pen"></i> Reprogramar</button>
               ${yaPaso ? '<button class="modal-btn-cancel" id="scNoAsistio"><i class="fa-solid fa-user-xmark"></i> No asistió</button>' : ''}
               <button class="modal-btn-confirm" id="scRealizada"><i class="fa-solid fa-circle-check"></i> Marcar realizada</button>`
            : `<button class="modal-btn-cancel" id="scReabrir"><i class="fa-solid fa-rotate-left"></i> Volver a programada</button>
               <button class="modal-btn-confirm" id="scCerrar">Cerrar</button>`;

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid ${est.icon}"></i></div>
            <div><h3>${escaparHTML(cita.titulo)}</h3><p>${escaparHTML(cita.nombre)} · Grado ${escaparHTML(cita.grado)}</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="fu-detail">
                <p><i class="fa-solid fa-calendar-day"></i> ${formatDayLabel(cita.fecha).replace(/^./, c => c.toUpperCase())}</p>
                <p><i class="fa-solid fa-clock"></i> ${hora12Corta(cita.hora)} · ${cita.duracion || 60} min</p>
                <p class="appt-status ${est.cls}"><i class="fa-solid ${est.icon}"></i> ${est.label}</p>
            </div>
            ${cita.origen === 'estudiante' ? '<p class="fu-note"><i class="fa-solid fa-hand"></i> Esta cita la pidió el estudiante desde su espacio.</p>' : ''}
            <div class="modal-field"><label>MOTIVO</label><p class="fu-motivo">${escaparHTML(cita.descripcion)}</p></div>
            ${cita.observacion ? `<div class="modal-field"><label>OBSERVACIÓN</label><p class="fu-motivo">${escaparHTML(cita.observacion)}</p></div>` : ''}
        </div>
        <div class="sentir-modal-actions">${acciones}</div>
    `);
    const en = (sel, fn) => { const b = overlay.querySelector(sel); if (b) b.addEventListener('click', () => { closeSentirModal(overlay); fn(); }); };
    en('#scCerrar', () => {});
    en('#scAceptar', () => aceptarCita(cita));
    en('#scRechazar', () => rechazarCita(cita));
    en('#scOtro', () => openFollowupModal(cita.nombre, { cita }));
    en('#scReprogramar', () => openFollowupModal(cita.nombre, { cita }));
    en('#scCancelar', () => deleteAppointment(cita.id));
    en('#scRealizada', () => cambiarEstadoCita(cita, 'Realizada'));
    en('#scNoAsistio', () => cambiarEstadoCita(cita, 'No asistió'));
    en('#scReabrir', () => cambiarEstadoCita(cita, 'Programada'));
}
