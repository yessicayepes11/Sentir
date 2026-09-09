document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderTypeChips();
    renderActivities();
    initActivitiesFilters();
    initAddActivity();
});

const ACTIVITY_TYPES = ['Respiración', 'Mindfulness', 'Movimiento', 'Escritura terapéutica', 'Arte terapia', 'Música', 'Otro'];
const ACTIVITY_ICONS = { 'Respiración': 'fa-wind', 'Mindfulness': 'fa-brain', 'Movimiento': 'fa-person-walking', 'Escritura terapéutica': 'fa-pen-nib', 'Arte terapia': 'fa-palette', 'Música': 'fa-music', 'Otro': 'fa-spa' };

let currentTypeFilter = 'all';

function renderTypeChips() {
    const chipsContainer = document.getElementById('activitiesChips');
    chipsContainer.innerHTML = `<button class="chip active" data-filter="all">Todas</button>` +
        ACTIVITY_TYPES.map(t => `<button class="chip" data-filter="${t}">${t}</button>`).join('');

    chipsContainer.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentTypeFilter = chip.dataset.filter;
            renderActivities();
        });
    });
}

function renderActivities() {
    const query = document.getElementById('activitiesSearch').value.toLowerCase().trim();
    let activities = getActivities();

    if (currentTypeFilter !== 'all') activities = activities.filter(a => a.tipo === currentTypeFilter);
    if (query) activities = activities.filter(a => a.titulo.toLowerCase().includes(query) || a.tipo.toLowerCase().includes(query));

    const grid = document.getElementById('activitiesGrid');
    const emptyMsg = document.getElementById('activitiesEmptyMsg');

    if (!activities.length) {
        grid.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    grid.innerHTML = activities.map(a => `
        <div class="activity-card" data-id="${a.id}">
            <div class="activity-card-top">
                <div class="activity-icon"><i class="fa-solid ${ACTIVITY_ICONS[a.tipo] || 'fa-spa'}"></i></div>
                <span class="activity-type-tag">${a.tipo}</span>
            </div>
            <h4>${a.titulo}</h4>
            <p class="activity-desc">${a.descripcion}</p>
            <div class="activity-meta-row">
                <span><i class="fa-solid fa-calendar"></i> ${formatSpanishDate(a.fecha)}</span>
                ${a.nivel ? `<span class="activity-level-tag ${a.nivel === 'Riesgo alto' ? 'alto' : a.nivel === 'Riesgo medio' ? 'medio' : 'todos'}">${a.nivel}</span>` : ''}
            </div>
            ${a.archivoNombre ? `<span class="activity-file-link"><i class="fa-solid fa-paperclip"></i> ${a.archivoNombre}</span>` : ''}
            <div class="activity-card-actions">
                <button class="activity-action-btn suggest-btn" data-action="suggest"><i class="fa-solid fa-paper-plane"></i> Sugerir</button>
                <button class="activity-action-btn edit-btn" data-action="edit"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="activity-action-btn delete-btn" data-action="delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.activity-card').forEach(card => {
        const id = card.dataset.id;
        card.querySelector('[data-action="suggest"]').addEventListener('click', () => suggestActivity(id));
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openActivityModal(id));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteActivity(id));
    });
}

function formatSpanishDate(fechaISO) {
    if (!fechaISO) return 'Sin fecha';
    return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function suggestActivity(id) {
    const activity = getActivities().find(a => a.id === id);
    if (!activity) return;
    showToast({ title: 'Actividad sugerida', message: `"${activity.titulo}" fue marcada para sugerir al estudiante en su próxima sesión.`, icon: 'fa-paper-plane', type: 'success' });
}

function deleteActivity(id) {
    const activities = getActivities().filter(a => a.id !== id);
    saveActivities(activities);
    renderActivities();
    showToast({ title: 'Actividad eliminada', message: 'Se quitó del catálogo de Control de Actividades.', icon: 'fa-trash', type: 'info' });
}

function initActivitiesFilters() {
    document.getElementById('activitiesSearch').addEventListener('input', renderActivities);
}

function initAddActivity() {
    document.getElementById('addActivityBtn').addEventListener('click', () => openActivityModal(null));
}

function openActivityModal(id) {
    const isEdit = !!id;
    const existing = isEdit ? getActivities().find(a => a.id === id) : null;

    const typeOptions = ACTIVITY_TYPES.map(t => `<option value="${t}" ${existing && existing.tipo === t ? 'selected' : ''}>${t}</option>`).join('');
    const levelOptions = ['Todos', 'Riesgo medio', 'Riesgo alto'].map(l => `<option value="${l}" ${existing && existing.nivel === l ? 'selected' : ''}>${l}</option>`).join('');

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-spa"></i></div>
            <div><h3>${isEdit ? 'Editar Actividad' : 'Nueva Actividad de Relajación'}</h3><p>Se sumará al catálogo que pueden usar los estudiantes</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>TÍTULO</label><input type="text" id="actTitulo" placeholder="Ej. Respiración 4-7-8" value="${existing ? existing.titulo : ''}"></div>
            <div class="modal-field"><label>DESCRIPCIÓN</label><textarea id="actDescripcion" rows="3" placeholder="Explica en qué consiste la actividad...">${existing ? existing.descripcion : ''}</textarea></div>
            <div class="modal-field-row">
                <div class="modal-field"><label>TIPO</label><select id="actTipo">${typeOptions}</select></div>
                <div class="modal-field"><label>FECHA</label><input type="date" id="actFecha" value="${existing ? existing.fecha : todayISO()}"></div>
            </div>
            <div class="modal-field"><label>NIVEL RECOMENDADO (OPCIONAL)</label><select id="actNivel">${levelOptions}</select></div>
            <div class="modal-field">
                <label>ARCHIVO (OPCIONAL — imagen, audio, video o PDF de apoyo)</label>
                <input type="file" id="actArchivo" accept="image/*,audio/*,video/*,.pdf">
                ${existing && existing.archivoNombre ? `<span style="font-size:11px; color:var(--text-muted);">Archivo actual: ${existing.archivoNombre}</span>` : ''}
            </div>
            <p class="modal-error" id="actError"><i class="fa-solid fa-circle-exclamation"></i> Escribe al menos el título y la descripción.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="actCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="actConfirm"><i class="fa-solid fa-check"></i> ${isEdit ? 'Guardar Cambios' : 'Publicar Actividad'}</button>
        </div>
    `);

    overlay.querySelector('#actCancel').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#actConfirm').addEventListener('click', () => {
        const titulo = overlay.querySelector('#actTitulo').value.trim();
        const descripcion = overlay.querySelector('#actDescripcion').value.trim();
        const errorMsg = overlay.querySelector('#actError');
        if (!titulo || !descripcion) { errorMsg.classList.add('show'); return; }
        errorMsg.classList.remove('show');

        const fileInput = overlay.querySelector('#actArchivo');
        const archivoNombre = fileInput.files[0] ? fileInput.files[0].name : (existing ? existing.archivoNombre : null);

        const record = {
            id: existing ? existing.id : 'act' + Date.now(),
            titulo,
            descripcion,
            tipo: overlay.querySelector('#actTipo').value,
            fecha: overlay.querySelector('#actFecha').value || todayISO(),
            nivel: overlay.querySelector('#actNivel').value,
            archivoNombre
        };

        const list = getActivities();
        if (isEdit) {
            const idx = list.findIndex(a => a.id === id);
            list[idx] = record;
        } else {
            list.unshift(record);
        }
        saveActivities(list);
        closeSentirModal(overlay);
        renderActivities();
        showToast({ title: isEdit ? 'Actividad actualizada' : 'Actividad publicada', message: `"${titulo}" ya está disponible en el catálogo.`, icon: 'fa-spa', type: 'success' });
    });
}
