document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    initViewToggle();
    initCalendarNav();
    renderAgenda();
    initAgendaFilters();
    initAddAppointment();
    applyAgendaPrefill();
});


function applyAgendaPrefill() {
    const params = new URLSearchParams(window.location.search);
    const student = params.get('student');
    if (!student || params.get('followup') !== '1') return;

    const grade = params.get('grade') || '';
    setTimeout(() => openAppointmentModal(null, {
        titulo: 'Seguimiento de Caso',
        nombre: student,
        grado: grade,
        descripcion: 'Seguimiento psicológico programado desde el expediente del estudiante.'
    }), 120);

    // Limpiar los parámetros para que el formulario no vuelva a abrirse al refrescar.
    window.history.replaceState({}, document.title, window.location.pathname);
}

let agendaViewMode = 'list';
let calendarCursor = new Date();
let dateFilter = null;

function renderAgendaSummary() {
    const all = getAgenda();
    const today = todayISO();
    const todayCount = all.filter(a => a.fecha === today).length;
    const upcomingCount = all.filter(a => a.fecha > today).length;

    document.getElementById('agendaSummary').innerHTML = `
        <div class="agenda-summary-card today">
            <div class="agenda-summary-icon"><i class="fa-solid fa-calendar-day"></i></div>
            <div class="agenda-summary-text"><strong>${todayCount}</strong><span>CITAS HOY</span></div>
        </div>
        <div class="agenda-summary-card upcoming">
            <div class="agenda-summary-icon"><i class="fa-solid fa-calendar-week"></i></div>
            <div class="agenda-summary-text"><strong>${upcomingCount}</strong><span>PRÓXIMAS</span></div>
        </div>
        <div class="agenda-summary-card">
            <div class="agenda-summary-icon"><i class="fa-solid fa-calendar-check"></i></div>
            <div class="agenda-summary-text"><strong>${all.length}</strong><span>TOTAL AGENDADAS</span></div>
        </div>
    `;
}

let agendaFilter = 'all';

function renderAgenda() {
    renderAgendaSummary();
    if (typeof renderCalendar === 'function') renderCalendar();
    const query = document.getElementById('agendaSearch').value.toLowerCase().trim();
    let items = getAgenda().slice().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    const today = todayISO();
    if (dateFilter) {
        items = items.filter(a => a.fecha === dateFilter);
    } else {
        if (agendaFilter === 'today') items = items.filter(a => a.fecha === today);
        if (agendaFilter === 'upcoming') items = items.filter(a => a.fecha > today);
    }

    if (query) {
        items = items.filter(a =>
            a.nombre.toLowerCase().includes(query) ||
            a.titulo.toLowerCase().includes(query) ||
            a.grado.toLowerCase().includes(query)
        );
    }

    const container = document.getElementById('agendaColumns');
    const emptyMsg = document.getElementById('agendaEmptyMsg');

    if (!items.length) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    // Agrupar por fecha
    const groups = {};
    items.forEach(a => { (groups[a.fecha] = groups[a.fecha] || []).push(a); });

    container.innerHTML = Object.keys(groups).map(fecha => {
        const label = formatDayLabel(fecha);
        const cards = groups[fecha].map(a => `
            <div class="appointment-card" data-id="${a.id}">
                <div class="appointment-time"><strong>${a.hora}</strong><span>hora</span></div>
                <div class="appointment-info">
                    <h4>${a.titulo}</h4>
                    <p class="appt-meta">${a.nombre} · Grado ${a.grado}</p>
                    <p class="appt-desc">${a.descripcion || 'Sin descripción adicional.'}</p>
                </div>
                <div class="appointment-actions">
                    <button class="appt-icon-btn edit-btn" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="appt-icon-btn delete-btn" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        return `<div class="agenda-day-group"><div class="agenda-day-title">${label} <span>${groups[fecha].length} cita${groups[fecha].length > 1 ? 's' : ''}</span></div>${cards}</div>`;
    }).join('');

    container.querySelectorAll('.appointment-card').forEach(card => {
        const id = card.dataset.id;
        card.querySelector('.edit-btn').addEventListener('click', (e) => { e.stopPropagation(); openAppointmentModal(id); });
        card.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteAppointment(id); });
        card.addEventListener('click', () => openAppointmentModal(id));
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

function deleteAppointment(id) {
    const agenda = getAgenda().filter(a => a.id !== id);
    saveAgenda(agenda);
    renderAgenda();
    showToast({ title: 'Cita eliminada', message: 'La cita se quitó de tu agenda.', icon: 'fa-trash', type: 'info' });
}

function initAddAppointment() {
    document.getElementById('addAppointmentBtn').addEventListener('click', () => openAppointmentModal(null));
}

function openAppointmentModal(id, prefill = {}) {
    const isEdit = !!id;
    const agenda = getAgenda();
    const existing = isEdit ? agenda.find(a => a.id === id) : null;

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-calendar-plus"></i></div>
            <div><h3>${isEdit ? 'Editar Cita' : 'Nueva Cita'}</h3><p>Completa los datos de la agenda</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field-row">
                <div class="modal-field"><label>FECHA</label><input type="date" id="apFecha" value="${existing ? existing.fecha : (prefill.fecha || todayISO())}"></div>
                <div class="modal-field"><label>HORA</label><input type="time" id="apHora" value="${existing ? existing.hora : (prefill.hora || '09:00')}"></div>
            </div>
            <div class="modal-field"><label>TÍTULO</label><input type="text" id="apTitulo" placeholder="Ej. Sesión Individual, Reunión de Acudientes..." value="${existing ? existing.titulo : (prefill.titulo || '')}"></div>
            <div class="modal-field-row">
                <div class="modal-field"><label>NOMBRE (ESTUDIANTE O GRUPO)</label><input type="text" id="apNombre" placeholder="Ej. Mateo Silva" value="${existing ? existing.nombre : (prefill.nombre || '')}"></div>
                <div class="modal-field"><label>GRADO</label><input type="text" id="apGrado" placeholder="Ej. 11°1" value="${existing ? existing.grado : (prefill.grado || '')}"></div>
            </div>
            <div class="modal-field"><label>DESCRIPCIÓN</label><textarea id="apDescripcion" rows="3" placeholder="Detalles de la cita...">${existing ? existing.descripcion : (prefill.descripcion || '')}</textarea></div>
            <p class="modal-error" id="apError"><i class="fa-solid fa-circle-exclamation"></i> Completa al menos título, nombre y grado.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="apCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="apConfirm"><i class="fa-solid fa-check"></i> ${isEdit ? 'Guardar Cambios' : 'Agendar Cita'}</button>
        </div>
    `);

    overlay.querySelector('#apCancel').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#apConfirm').addEventListener('click', () => {
        const titulo = overlay.querySelector('#apTitulo').value.trim();
        const nombre = overlay.querySelector('#apNombre').value.trim();
        const grado = overlay.querySelector('#apGrado').value.trim();
        const errorMsg = overlay.querySelector('#apError');
        if (!titulo || !nombre || !grado) { errorMsg.classList.add('show'); return; }
        errorMsg.classList.remove('show');

        const record = {
            id: existing ? existing.id : 'ag' + Date.now(),
            fecha: overlay.querySelector('#apFecha').value || todayISO(),
            hora: overlay.querySelector('#apHora').value || '09:00',
            titulo, nombre, grado,
            descripcion: overlay.querySelector('#apDescripcion').value.trim()
        };

        const list = getAgenda();
        if (isEdit) {
            const idx = list.findIndex(a => a.id === id);
            list[idx] = record;
        } else {
            list.push(record);
        }
        saveAgenda(list);
        closeSentirModal(overlay);
        renderAgenda();
        showToast({ title: isEdit ? 'Cita actualizada' : 'Cita agendada', message: `${titulo} con ${nombre} el ${record.fecha} a las ${record.hora}.`, icon: 'fa-calendar-check', type: 'success' });
    });
}

/* ==========================================================================
   VISTA DE CALENDARIO MENSUAL
   ========================================================================== */
function initViewToggle() {
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            agendaViewMode = btn.dataset.view;

            document.getElementById('calendarWrapper').style.display = agendaViewMode === 'calendar' ? 'block' : 'none';
            document.getElementById('agendaColumns').style.display = agendaViewMode === 'calendar' ? 'none' : 'flex';
            document.getElementById('agendaChips').style.display = agendaViewMode === 'calendar' ? 'none' : 'flex';
        });
    });
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

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('calMonthLabel');
    if (!grid || !label) return;

    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    label.innerText = calendarCursor.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayISO();

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
            return `<div class="calendar-event" style="background:${c.bg}; color:${c.solid};">
                        <span class="calendar-event-dot" style="background:${c.solid};"></span>${a.titulo} · ${a.hora}
                    </div>`;
        }).join('');

        cellsHTML += `
            <div class="calendar-day ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${cellDate}">
                <span class="calendar-day-number">${day}</span>
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
            agendaViewMode = 'list';

            document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'list'));
            document.getElementById('calendarWrapper').style.display = 'none';
            document.getElementById('agendaColumns').style.display = 'flex';
            document.getElementById('agendaChips').style.display = 'flex';
            document.querySelectorAll('#agendaChips .chip').forEach(c => c.classList.remove('active'));

            renderAgenda();
        });
    });
}

function renderCalendarLegend() {
    const legend = document.getElementById('calendarLegend');
    if (!legend || legend.dataset.rendered) return;

    const types = [...APPOINTMENT_TYPE_RULES.map(r => ({ label: r.label, color: r.color })), { label: DEFAULT_APPOINTMENT_TYPE.label, color: DEFAULT_APPOINTMENT_TYPE.color }];
    legend.innerHTML = types.map(t => `<span class="calendar-legend-item"><span class="calendar-legend-dot" style="background:${t.color}"></span>${t.label}</span>`).join('');
    legend.dataset.rendered = 'true';
}
