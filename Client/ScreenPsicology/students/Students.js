document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderStudents();
    initFiltersAndSearch();
    initAddStudentModal();
    initCloseProcess();

    // Estudiantes en proceso de terapia (los carga sentir-shared.js desde la base de datos)
    document.addEventListener('sentir:datos', renderStudents);
    applyUrlParams();
});

function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const openStudent = params.get('open');

    if (query) {
        document.getElementById('studentsSearch').value = query;
        applyFilters();
    }
    if (openStudent) {
        setTimeout(() => openStudentPanel(openStudent), 250);
    }
}

const RISK_CONFIG = {
    high: { label: 'RIESGO ALTO', badgeClass: 'high', moodClass: 'sad', color: 'EF4444' },
    medium: { label: 'RIESGO MEDIO', badgeClass: 'medium', moodClass: 'neutral', color: 'F59E0B' },
    stable: { label: 'ESTABLE', badgeClass: 'stable', moodClass: 'happy', color: '22C55E' }
};

let currentFilter = 'all';
let currentOrigin = 'all';

const ORIGEN_PROCESO = {
    docente: { label: 'Reporte docente', icon: 'fa-chalkboard-user', cls: 'teacher' },
    formulario: { label: 'Pidió ayuda', icon: 'fa-hand-holding-heart', cls: 'student' },
    chat: { label: 'Chat Sentir IA', icon: 'fa-brain', cls: 'ai' },
    psicologia: { label: 'Añadido por psicología', icon: 'fa-user-doctor', cls: 'psychology' }
};

function escaparTexto(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Solo los estudiantes que tienen un proceso de terapia activo
function getStudentsEnProceso() {
    return getStudents().filter(s => s.proceso);
}

function renderStudents() {
    const students = getStudentsEnProceso();
    const grid = document.getElementById('studentsGrid');

    grid.innerHTML = students.map(s => {
        const cfg = RISK_CONFIG[s.risk];
        return `
        <div class="mini-student-card" data-risk="${s.risk}" data-origin="${s.proceso.origen}" data-name="${escaparTexto(s.name.toLowerCase())} ${escaparTexto(String(s.grade).toLowerCase())}" data-id="${s.id.toLowerCase()}" data-fullname="${escaparTexto(s.name)}" role="button" tabindex="0">
            <span class="badge-risk ${cfg.badgeClass}">${cfg.label}</span>
            <img src="${s.avatar}" class="mini-avatar" alt="${s.name}">
            <h4>${s.name}</h4>
            <p>Grado: ${s.grade} • ID: ${s.id}</p>
            <span class="signal-source-badge ${(ORIGEN_PROCESO[s.proceso.origen] || ORIGEN_PROCESO.formulario).cls} process-origin"><i class="fa-solid ${(ORIGEN_PROCESO[s.proceso.origen] || ORIGEN_PROCESO.formulario).icon}"></i>${(ORIGEN_PROCESO[s.proceso.origen] || ORIGEN_PROCESO.formulario).label}</span>
            <span class="mood-pill ${cfg.moodClass}">${s.mood === 'happy' ? '😊' : s.mood === 'neutral' ? '😐' : '😔'} ${escaparTexto(s.moodText)}</span>
            <p class="process-since"><i class="fa-solid fa-calendar-day"></i> En proceso desde ${formatCaseDate(s.proceso.fechaInicio)}</p>
        </div>`;
    }).join('');

    grid.querySelectorAll('.mini-student-card').forEach(card => {
        const openCard = () => openStudentPanel(card.dataset.fullname);
        card.addEventListener('click', openCard);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCard();
            }
        });
    });

    updateChipCounts(students);
    applyFilters();
}

function updateChipCounts(students) {
    const porOrigen = (o) => students.filter(s => s.proceso && s.proceso.origen === o).length;
    const poner = (id, n) => { const el = document.getElementById(id); if (el) el.innerText = n; };
    poner('countOriginAll', students.length);
    poner('countOriginDocente', porOrigen('docente'));
    poner('countOriginFormulario', porOrigen('formulario'));
    poner('countOriginChat', porOrigen('chat'));
    poner('countOriginPsicologia', porOrigen('psicologia'));

    document.getElementById('countAll').innerText = students.length.toLocaleString('es-CO');
    const high = students.filter(s => s.risk === 'high').length;
    const medium = students.filter(s => s.risk === 'medium').length;
    const stable = students.filter(s => s.risk === 'stable').length;
    document.getElementById('countHigh').innerText = high;
    document.getElementById('countMedium').innerText = medium;
    document.getElementById('countStable').innerText = stable.toLocaleString('es-CO');

    renderOverviewBar(students.length, high, medium, stable);
}

function renderOverviewBar(total, high, medium, stable) {
    const bar = document.getElementById('studentsOverviewBar');
    const legend = document.getElementById('studentsOverviewLegend');
    if (!total) {
        bar.innerHTML = '';
        legend.innerHTML = '<span class="overview-legend-item">Aún no hay estudiantes en proceso de terapia.</span>';
        return;
    }

    const pct = (n) => (n / total) * 100;
    bar.innerHTML = `
        <span class="seg-high" style="width:${pct(high)}%"></span>
        <span class="seg-medium" style="width:${pct(medium)}%"></span>
        <span class="seg-stable" style="width:${pct(stable)}%"></span>
    `;
    legend.innerHTML = `
        <span class="overview-legend-item"><span class="overview-legend-dot high"></span> Riesgo Alto · ${high} (${pct(high).toFixed(0)}%)</span>
        <span class="overview-legend-item"><span class="overview-legend-dot medium"></span> Riesgo Medio · ${medium} (${pct(medium).toFixed(0)}%)</span>
        <span class="overview-legend-item"><span class="overview-legend-dot stable"></span> Estable · ${stable} (${pct(stable).toFixed(0)}%)</span>
    `;
}

function applyFilters() {
    const grid = document.getElementById('studentsGrid');
    const searchInput = document.getElementById('studentsSearch');
    const query = searchInput.value.toLowerCase().trim();
    const cards = Array.from(grid.querySelectorAll('.mini-student-card'));
    let visible = 0;

    cards.forEach(card => {
        const matchesRisk = currentFilter === 'all' || card.dataset.risk === currentFilter;
        const matchesOrigin = currentOrigin === 'all' || card.dataset.origin === currentOrigin;
        const matchesQuery = query === '' || card.dataset.name.includes(query) || card.dataset.id.includes(query);
        const show = matchesRisk && matchesOrigin && matchesQuery;
        card.style.display = show ? 'block' : 'none';
        if (show) visible++;
    });

    document.getElementById('studentsEmptyMsg').style.display = visible === 0 ? 'block' : 'none';
}

function initFiltersAndSearch() {
    document.querySelectorAll('#studentsChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#studentsChips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter;
            applyFilters();
        });
    });
    document.querySelectorAll('#originChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#originChips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentOrigin = chip.dataset.origin;
            applyFilters();
        });
    });
    document.getElementById('studentsSearch').addEventListener('input', applyFilters);
}


/* =========================================================
   AÑADIR ESTUDIANTE AL PROCESO DE TERAPIA
   El estudiante ya debe estar registrado por la secretaría.
========================================================= */
function initAddStudentModal() {
    const boton = document.getElementById('addStudentBtn');
    if (!boton) return;

    boton.addEventListener('click', () => {
        const todos = getStudents()
            .filter(st => st.idUsuario)
            .sort((a, b) => a.name.localeCompare(b.name, 'es'));
        let elegido = null;

        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-user-plus"></i></div>
                <div><h3>Añadir estudiante al proceso de terapia</h3><p id="apPasoTexto">Paso 1 de 2 · Busca al estudiante por su nombre o número de identificación</p></div>
            </div>
            <div class="sentir-modal-body">
                <div id="apPaso1">
                    <div class="modal-field">
                        <label>NOMBRE O NÚMERO DE IDENTIFICACIÓN</label>
                        <div class="ap-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="apBuscar" placeholder="Ej. Misael o 5294178" autocomplete="off"></div>
                    </div>
                    <div class="ap-results" id="apResultados"></div>
                </div>
                <div id="apPaso2" hidden>
                    <div class="ap-selected" id="apSeleccionado"></div>
                    <div class="modal-field"><label>MOTIVO DEL INGRESO</label><textarea id="apMotivo" rows="4" placeholder="Ej. Remisión de coordinación, seguimiento por duelo, solicitud del acudiente..."></textarea></div>
                </div>
                <p class="modal-error" id="apError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="apCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="apSiguiente" disabled>Siguiente <i class="fa-solid fa-arrow-right"></i></button>
                <button class="modal-btn-confirm" id="apGuardar" hidden><i class="fa-solid fa-check"></i> Guardar</button>
            </div>
        `);

        const $ = (sel) => overlay.querySelector(sel);
        const buscar = $('#apBuscar');
        const resultados = $('#apResultados');
        const siguiente = $('#apSiguiente');
        const guardar = $('#apGuardar');
        const cancelar = $('#apCancel');
        const caja = $('#apError');

        const mostrarError = (texto) => { caja.querySelector('span').innerText = texto; caja.classList.add('show'); };
        const ocultarError = () => caja.classList.remove('show');

        // Lista los estudiantes que coinciden con lo que se va escribiendo
        const pintarResultados = () => {
            const q = buscar.value.toLowerCase().trim();
            if (!q) {
                resultados.innerHTML = '<p class="ap-hint"><i class="fa-solid fa-keyboard"></i> Escribe el nombre o el número de identificación del estudiante.</p>';
                return;
            }
            const coinciden = todos.filter(st => st.name.toLowerCase().includes(q) || String(st.idUsuario).includes(q));
            if (!coinciden.length) {
                resultados.innerHTML = '<p class="ap-hint"><i class="fa-solid fa-user-slash"></i> No hay estudiantes que coincidan. Si no está registrado, la secretaría debe registrarlo primero.</p>';
                return;
            }
            resultados.innerHTML = coinciden.map(st => `
                <button type="button" class="ap-result${st.proceso ? ' disabled' : ''}${elegido && elegido.idUsuario === st.idUsuario ? ' selected' : ''}" data-id="${st.idUsuario}" ${st.proceso ? 'disabled' : ''}>
                    <img src="${st.avatar}" alt="">
                    <span class="ap-result-info"><strong>${escaparTexto(st.name)}</strong><small>ID ${st.idUsuario} · Grado ${escaparTexto(st.grade)}</small></span>
                    ${st.proceso ? '<span class="ap-tag">Ya en proceso</span>' : '<i class="fa-solid fa-circle-check ap-check"></i>'}
                </button>`).join('');
        };

        resultados.addEventListener('click', (e) => {
            const item = e.target.closest('.ap-result');
            if (!item || item.disabled) return;
            elegido = todos.find(st => String(st.idUsuario) === item.dataset.id);
            resultados.querySelectorAll('.ap-result').forEach(r => r.classList.toggle('selected', r === item));
            siguiente.disabled = false;
            ocultarError();
        });
        resultados.addEventListener('dblclick', (e) => { if (e.target.closest('.ap-result:not(.disabled)')) siguiente.click(); });

        buscar.addEventListener('input', () => { ocultarError(); pintarResultados(); });
        pintarResultados();
        setTimeout(() => buscar.focus(), 50);

        const irAPaso = (paso) => {
            ocultarError();
            $('#apPaso1').hidden = paso !== 1;
            $('#apPaso2').hidden = paso !== 2;
            siguiente.hidden = paso !== 1;
            guardar.hidden = paso !== 2;
            cancelar.innerHTML = paso === 1 ? 'Cancelar' : '<i class="fa-solid fa-arrow-left"></i> Atrás';
            $('#apPasoTexto').innerText = paso === 1
                ? 'Paso 1 de 2 · Busca al estudiante por su nombre o número de identificación'
                : 'Paso 2 de 2 · Escribe el motivo del ingreso y guarda';
            if (paso === 2) {
                $('#apSeleccionado').innerHTML = `
                    <img src="${elegido.avatar}" alt="">
                    <div><strong>${escaparTexto(elegido.name)}</strong><small>ID ${elegido.idUsuario} · Grado ${escaparTexto(elegido.grade)}</small></div>`;
                setTimeout(() => $('#apMotivo').focus(), 50);
            }
        };

        siguiente.addEventListener('click', () => {
            if (!elegido) return mostrarError('Selecciona un estudiante de la lista.');
            irAPaso(2);
        });

        cancelar.addEventListener('click', () => {
            if (!$('#apPaso2').hidden) return irAPaso(1);
            closeSentirModal(overlay);
        });

        $('#apMotivo').addEventListener('input', ocultarError);

        guardar.addEventListener('click', async () => {
            const motivo = $('#apMotivo').value.trim();
            if (motivo.length < 5) return mostrarError('Escribe el motivo del ingreso.');

            guardar.disabled = true;
            guardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';
            try {
                await sentirApi('/procesos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idUsuario: elegido.idUsuario, motivo })
                });
                closeSentirModal(overlay);
                showToast({ title: 'Estudiante añadido', message: `${elegido.name} quedó en proceso de terapia.`, icon: 'fa-user-plus', type: 'success' });
                await cargarDatosReales();
            } catch (error) {
                mostrarError(error.message);
                guardar.disabled = false;
                guardar.innerHTML = '<i class="fa-solid fa-check"></i> Guardar';
            }
        });
    });
}

/* =========================================================
   CERRAR EL PROCESO DE TERAPIA (desde el expediente)
========================================================= */
function initCloseProcess() {
    const boton = document.getElementById('closeProcessBtn');
    if (!boton) return;

    boton.addEventListener('click', () => {
        const nombre = document.getElementById('detailPanel').dataset.currentStudent;
        const estudiante = getStudents().find(st => st.name === nombre);
        if (!estudiante || !estudiante.proceso) return;

        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-circle-check"></i></div>
                <div><h3>Cerrar proceso de terapia</h3><p>${escaparTexto(nombre)} · Sus alertas abiertas quedarán resueltas</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field"><label>OBSERVACIÓN DE CIERRE</label><textarea id="cpObs" rows="3" placeholder="Ej. Objetivos cumplidos, remitido a EPS, cambio de institución..."></textarea></div>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="cpCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="cpConfirm"><i class="fa-solid fa-check"></i> Cerrar proceso</button>
            </div>
        `);

        overlay.querySelector('#cpCancel').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#cpConfirm').addEventListener('click', async () => {
            const confirmar = overlay.querySelector('#cpConfirm');
            confirmar.disabled = true;
            try {
                await sentirApi(`/procesos/${estudiante.proceso.id}/cerrar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ observacion: overlay.querySelector('#cpObs').value.trim() })
                });
                closeSentirModal(overlay);
                closePanel();
                showToast({ title: 'Proceso cerrado', message: `El proceso de ${nombre} quedó cerrado.`, icon: 'fa-circle-check', type: 'success' });
                await cargarDatosReales();
            } catch (error) {
                showToast({ title: 'No se pudo cerrar', message: error.message, icon: 'fa-circle-exclamation', type: 'urgent' });
                confirmar.disabled = false;
            }
        });
    });
}
