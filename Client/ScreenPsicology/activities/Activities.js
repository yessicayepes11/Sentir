/* ==========================================================================
   CONTROL DE ACTIVIDADES (psicología)
   Las actividades se guardan en la base de datos (tabla relajacion) y se
   publican para los estudiantes en Recursos → "Actividades de tu psicóloga".
   - Nueva actividad: con archivo (imagen, audio, video o PDF) y/o enlace (URL).
   - Crear con IA: la IA propone la actividad y la psicóloga la revisa antes de publicar.
   - Sugerir: le llega al estudiante a la campanita y al correo.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    document.getElementById('activitiesSearch').addEventListener('input', renderActivities);
    document.getElementById('addActivityBtn').addEventListener('click', () => openActivityModal(null));
    const ia = document.getElementById('aiActivityBtn');
    if (ia) ia.addEventListener('click', openAiActivityModal);
    cargarActividades();
});

let TIPOS_BASE = ['Respiración', 'Mindfulness', 'Movimiento', 'Escritura terapéutica', 'Arte terapia', 'Música', 'Autocuidado', 'Juego y creatividad'];
let NIVELES = ['Todos', 'Bienestar general', 'Estable', 'Riesgo bajo', 'Riesgo medio', 'Riesgo alto', 'Acompañamiento cercano'];
let actividades = [];
let currentTypeFilter = 'all';

const ACTIVITY_ICONS = { 'Respiración': 'fa-wind', 'Mindfulness': 'fa-brain', 'Movimiento': 'fa-person-walking', 'Escritura terapéutica': 'fa-pen-nib', 'Arte terapia': 'fa-palette', 'Música': 'fa-music', 'Autocuidado': 'fa-hand-holding-heart', 'Juego y creatividad': 'fa-puzzle-piece' };
const ACTIVITY_COLORS = {
    'Respiración': 'linear-gradient(135deg, #65B8FF, #0284C7)',
    'Mindfulness': 'linear-gradient(135deg, #B8A8FF, #6C4DF6)',
    'Movimiento': 'linear-gradient(135deg, #34D399, #059669)',
    'Escritura terapéutica': 'linear-gradient(135deg, #FBBF24, #D97706)',
    'Arte terapia': 'linear-gradient(135deg, #F472B6, #DB2777)',
    'Música': 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    'Autocuidado': 'linear-gradient(135deg, #FDA4AF, #E11D48)',
    'Juego y creatividad': 'linear-gradient(135deg, #5EEAD4, #0D9488)',
    'Otro': 'linear-gradient(135deg, #94A3B8, #475569)'
};
const NIVEL_CLASE = {
    'Todos': 'todos', 'Bienestar general': 'todos', 'Estable': 'todos',
    'Riesgo bajo': 'bajo', 'Riesgo medio': 'medio', 'Riesgo alto': 'alto', 'Acompañamiento cercano': 'alto'
};

async function cargarActividades() {
    const grid = document.getElementById('activitiesGrid');
    grid.innerHTML = '<p class="history-empty"><i class="fa-solid fa-spinner fa-spin"></i> Cargando actividades…</p>';
    try {
        const datos = await sentirApi('/actividades');
        actividades = datos.actividades || [];
        if (Array.isArray(datos.tipos) && datos.tipos.length) TIPOS_BASE = datos.tipos;
        if (Array.isArray(datos.niveles) && datos.niveles.length) NIVELES = datos.niveles;
        renderTypeChips();
        renderActivities();
    } catch (error) {
        grid.innerHTML = `<p class="history-empty"><i class="fa-solid fa-plug-circle-xmark"></i> ${escaparHTML(error.message)}</p>`;
    }
}

function tiposEnUso() {
    const propios = actividades.map(a => a.tipo).filter(t => !TIPOS_BASE.includes(t));
    return [...TIPOS_BASE, ...new Set(propios)];
}

function renderTypeChips() {
    const chipsContainer = document.getElementById('activitiesChips');
    const conActividades = tiposEnUso().filter(t => actividades.some(a => a.tipo === t));
    if (currentTypeFilter !== 'all' && !conActividades.includes(currentTypeFilter)) currentTypeFilter = 'all';
    chipsContainer.innerHTML = `<button class="chip ${currentTypeFilter === 'all' ? 'active' : ''}" data-filter="all">Todas</button>` +
        conActividades.map(t => `<button class="chip ${currentTypeFilter === t ? 'active' : ''}" data-filter="${escaparHTML(t)}">${escaparHTML(t)}</button>`).join('');

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
    let lista = actividades.slice();

    renderActivitiesSummary(lista);

    if (currentTypeFilter !== 'all') lista = lista.filter(a => a.tipo === currentTypeFilter);
    if (query) lista = lista.filter(a => `${a.titulo} ${a.tipo} ${a.descripcion} ${a.nivel}`.toLowerCase().includes(query));

    const grid = document.getElementById('activitiesGrid');
    const emptyMsg = document.getElementById('activitiesEmptyMsg');

    if (!lista.length) {
        grid.innerHTML = '';
        emptyMsg.style.display = 'block';
        emptyMsg.innerText = actividades.length ? 'No hay actividades que coincidan con tu búsqueda.' : 'Aún no hay actividades. Crea una o pídele una a la IA.';
        return;
    }
    emptyMsg.style.display = 'none';

    grid.innerHTML = lista.map(a => `
        <div class="activity-card" data-id="${a.id}">
            <div class="activity-card-top">
                <div class="activity-icon" style="background:${ACTIVITY_COLORS[a.tipo] || ACTIVITY_COLORS['Otro']}"><i class="fa-solid ${ACTIVITY_ICONS[a.tipo] || 'fa-spa'}"></i></div>
                <div class="activity-tags">
                    ${a.generadaPor ? '<span class="activity-ai-tag" title="Propuesta por IA y revisada por psicología"><i class="fa-solid fa-wand-magic-sparkles"></i> IA</span>' : ''}
                    <span class="activity-type-tag">${escaparHTML(a.tipo)}</span>
                </div>
            </div>
            <h4>${escaparHTML(a.titulo)}</h4>
            <p class="activity-desc">${escaparHTML(a.descripcion)}</p>
            ${a.pasos.length ? `<details class="activity-steps"><summary>${a.pasos.length} pasos</summary><ol>${a.pasos.map(p => `<li>${escaparHTML(p)}</li>`).join('')}</ol></details>` : ''}
            <div class="activity-meta-row">
                <span><i class="fa-solid fa-calendar"></i> ${formatSpanishDate(a.fecha)}</span>
                ${a.duracion ? `<span><i class="fa-solid fa-clock"></i> ${a.duracion} min</span>` : ''}
                <span class="activity-level-tag ${NIVEL_CLASE[a.nivel] || 'todos'}">${escaparHTML(a.nivel)}</span>
            </div>
            ${a.url ? `<a class="activity-file-link" href="${escaparHTML(a.url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-link"></i> ${escaparHTML(dominio(a.url))}</a>` : ''}
            ${a.archivo ? `<a class="activity-file-link" href="${escaparHTML(a.archivo)}" target="_blank" rel="noopener"><i class="fa-solid fa-paperclip"></i> ${escaparHTML(a.archivoNombre || 'Archivo adjunto')}</a>` : ''}
            ${a.sugerencias ? `<span class="activity-suggested"><i class="fa-solid fa-paper-plane"></i> Sugerida ${a.sugerencias} ${a.sugerencias === 1 ? 'vez' : 'veces'}</span>` : ''}
            <div class="activity-card-actions">
                <button class="activity-action-btn suggest-btn" data-action="suggest"><i class="fa-solid fa-paper-plane"></i> Sugerir</button>
                <button class="activity-action-btn edit-btn" data-action="edit"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="activity-action-btn delete-btn" data-action="delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.activity-card').forEach(card => {
        const actividad = actividades.find(a => String(a.id) === card.dataset.id);
        card.querySelector('[data-action="suggest"]').addEventListener('click', () => suggestActivity(actividad));
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openActivityModal(actividad));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteActivity(actividad));
    });
}

function dominio(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return 'Enlace'; }
}

function renderActivitiesSummary(lista) {
    const byType = {};
    lista.forEach(a => { byType[a.tipo] = (byType[a.tipo] || 0) + 1; });
    const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const conIA = lista.filter(a => a.generadaPor).length;

    document.getElementById('activitiesSummary').innerHTML = `
        <span class="activities-summary-icon"><i class="fa-solid fa-layer-group"></i></span>
        <span class="activities-summary-count"><strong>${lista.length}</strong> actividad${lista.length !== 1 ? 'es' : ''} publicada${lista.length !== 1 ? 's' : ''} para los estudiantes</span>
        ${topTypes.map(([tipo, count]) => `<span class="activities-summary-pill">${escaparHTML(tipo)} <b>${count}</b></span>`).join('')}
        ${conIA ? `<span class="activities-summary-pill"><i class="fa-solid fa-wand-magic-sparkles"></i> Con IA <b>${conIA}</b></span>` : ''}
    `;
}

function formatSpanishDate(fechaISO) {
    if (!fechaISO) return 'Sin fecha';
    return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------- Sugerir a un estudiante (aviso a la campanita + correo) ---------- */
function suggestActivity(actividad) {
    if (!actividad) return;
    const estudiantes = getStudents().filter(s => s.idUsuario).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    let elegido = null;

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-paper-plane"></i></div>
            <div><h3>Sugerir actividad</h3><p>"${escaparHTML(actividad.titulo)}" · Le llegará un aviso al estudiante (campanita y correo)</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>ESTUDIANTE</label>
                <div class="ap-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="sgBuscar" placeholder="Nombre o número de identificación" autocomplete="off"></div>
            </div>
            <div class="ap-results" id="sgLista"></div>
            <div class="modal-field"><label>NOTA PARA EL ESTUDIANTE (OPCIONAL)</label><textarea id="suggestNote" rows="2" maxlength="600" placeholder="Ej. Practícala antes de la evaluación de la próxima semana."></textarea></div>
            <p class="modal-error" id="sgError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="suggestCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="suggestConfirm"><i class="fa-solid fa-check"></i> Sugerir actividad</button>
        </div>
    `);
    const $ = (sel) => overlay.querySelector(sel);
    const error = (t) => { $('#sgError span').innerText = t; $('#sgError').classList.add('show'); };

    const pintar = () => {
        const q = $('#sgBuscar').value.toLowerCase().trim();
        const encontrados = estudiantes.filter(s => !q || s.name.toLowerCase().includes(q) || String(s.idUsuario).includes(q)).slice(0, 25);
        $('#sgLista').innerHTML = encontrados.length ? encontrados.map(s => `
            <button type="button" class="ap-result ${elegido && elegido.idUsuario === s.idUsuario ? 'selected' : ''}" data-id="${s.idUsuario}">
                <img src="${s.avatar}" alt="">
                <span class="ap-result-info"><strong>${escaparHTML(s.name)}</strong><small>ID ${s.idUsuario} · Grado ${escaparHTML(s.grade)}</small></span>
                <i class="fa-solid fa-circle-check ap-check"></i>
            </button>`).join('') : '<p class="ap-hint"><i class="fa-solid fa-user-slash"></i> No hay estudiantes que coincidan.</p>';
        $('#sgLista').querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => {
            elegido = estudiantes.find(s => String(s.idUsuario) === b.dataset.id);
            $('#sgError').classList.remove('show');
            pintar();
        }));
    };
    $('#sgBuscar').addEventListener('input', pintar);
    pintar();

    $('#suggestCancel').addEventListener('click', () => closeSentirModal(overlay));
    $('#suggestConfirm').addEventListener('click', async (e) => {
        if (!elegido) return error('Elige a qué estudiante le vas a sugerir la actividad.');
        const boton = e.currentTarget;
        boton.disabled = true;
        try {
            await sentirApi(`/actividades/${actividad.id}/sugerir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUsuario: elegido.idUsuario, nota: $('#suggestNote').value.trim() })
            });
            closeSentirModal(overlay);
            showToast({ title: 'Actividad sugerida', message: `${elegido.name} recibió el aviso y la verá primero en sus recursos.`, icon: 'fa-paper-plane', type: 'success' });
            cargarActividades();
        } catch (err) {
            error(err.message);
            boton.disabled = false;
        }
    });
}

/* ---------- Eliminar ---------- */
async function deleteActivity(actividad) {
    if (!actividad) return;
    if (!confirm(`¿Eliminar "${actividad.titulo}"? Dejará de aparecer en los recursos de los estudiantes.`)) return;
    try {
        await sentirApi(`/actividades/${actividad.id}`, { method: 'DELETE' });
        showToast({ title: 'Actividad eliminada', message: 'Se quitó del catálogo y de los recursos de los estudiantes.', icon: 'fa-trash', type: 'info' });
        cargarActividades();
    } catch (error) {
        showToast({ title: 'No se pudo eliminar', message: error.message, icon: 'fa-circle-exclamation', type: 'urgent' });
    }
}

/* ---------- Crear con IA: la IA propone, la psicóloga revisa y publica ---------- */
function openAiActivityModal() {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <div><h3>Crear actividad con IA</h3><p>Cuéntale a la IA qué necesitas. Podrás revisar y editar la propuesta antes de publicarla.</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>¿PARA QUÉ ES LA ACTIVIDAD?</label>
                <textarea id="iaTema" rows="3" maxlength="300" placeholder="Ej. Nervios antes de un examen, tristeza por un duelo, conflictos con compañeros, dormir mejor..."></textarea>
            </div>
            <div class="modal-field-row">
                <div class="modal-field"><label>TIPO (OPCIONAL)</label>
                    <select id="iaTipo"><option value="">La IA elige</option>${TIPOS_BASE.map(t => `<option value="${escaparHTML(t)}">${escaparHTML(t)}</option>`).join('')}</select>
                </div>
                <div class="modal-field"><label>NIVEL RECOMENDADO</label>
                    <select id="iaNivel">${NIVELES.map(n => `<option value="${escaparHTML(n)}">${escaparHTML(n)}</option>`).join('')}</select>
                </div>
            </div>
            <p class="modal-error" id="iaError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="iaCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="iaGenerar"><i class="fa-solid fa-wand-magic-sparkles"></i> Generar propuesta</button>
        </div>
    `);
    const $ = (sel) => overlay.querySelector(sel);
    setTimeout(() => $('#iaTema').focus(), 50);
    $('#iaCancel').addEventListener('click', () => closeSentirModal(overlay));
    $('#iaGenerar').addEventListener('click', async (e) => {
        const pedido = { tema: $('#iaTema').value.trim(), tipo: $('#iaTipo').value, nivel: $('#iaNivel').value };
        if (pedido.tema.length < 3 && !pedido.tipo) {
            $('#iaError span').innerText = 'Escribe para qué es la actividad o elige un tipo.';
            $('#iaError').classList.add('show');
            return;
        }
        const boton = e.currentTarget;
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> La IA está creando…';
        try {
            const { borrador } = await generarConIA(pedido);
            closeSentirModal(overlay);
            openActivityModal(null, { ...borrador, pedidoIA: pedido });
        } catch (error) {
            $('#iaError span').innerText = error.message;
            $('#iaError').classList.add('show');
            boton.disabled = false;
            boton.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar propuesta';
        }
    });
}

function generarConIA(pedido) {
    return sentirApi('/actividades/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    });
}

/* ---------- Nueva / editar actividad ---------- */
function openActivityModal(existing, borrador = null) {
    const datos = existing || borrador || {};
    const isEdit = !!existing;
    const tipoActual = datos.tipo || TIPOS_BASE[0];
    const esOtro = !TIPOS_BASE.includes(tipoActual);

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid ${borrador ? 'fa-wand-magic-sparkles' : 'fa-spa'}"></i></div>
            <div><h3>${isEdit ? 'Editar actividad' : borrador ? 'Revisa la propuesta de la IA' : 'Nueva actividad de bienestar'}</h3>
            <p>Se publicará en los recursos de los estudiantes</p></div>
        </div>
        <div class="sentir-modal-body">
            ${borrador ? `<p class="fu-note ai-note"><i class="fa-solid fa-wand-magic-sparkles"></i> Propuesta creada con IA. Revísala y ajústala antes de publicar.
                <button type="button" class="ai-again" id="actOtraIA"><i class="fa-solid fa-rotate"></i> Pedir otra</button></p>` : ''}
            <div class="modal-field"><label>TÍTULO</label><input type="text" id="actTitulo" maxlength="120" placeholder="Ej. Respiración 4-7-8" value="${escaparHTML(datos.titulo || '')}"></div>
            <div class="modal-field"><label>DESCRIPCIÓN</label><textarea id="actDescripcion" rows="3" maxlength="1500" placeholder="Explica en qué consiste la actividad...">${escaparHTML(datos.descripcion || '')}</textarea></div>
            <div class="modal-field-row">
                <div class="modal-field"><label>TIPO</label>
                    <select id="actTipo">${TIPOS_BASE.map(t => `<option value="${escaparHTML(t)}" ${t === tipoActual ? 'selected' : ''}>${escaparHTML(t)}</option>`).join('')}<option value="Otro" ${esOtro ? 'selected' : ''}>Otro</option></select>
                </div>
                <div class="modal-field"><label>FECHA</label><input type="date" id="actFecha" value="${datos.fecha || todayISO()}"></div>
            </div>
            <div class="modal-field" id="actTipoOtroCampo" ${esOtro ? '' : 'hidden'}><label>¿CUÁL? (ESCRIBE LA CATEGORÍA)</label>
                <input type="text" id="actTipoOtro" maxlength="60" placeholder="Ej. Musicoterapia, Gratitud, Contacto con la naturaleza..." value="${esOtro ? escaparHTML(tipoActual) : ''}">
            </div>
            <div class="modal-field-row">
                <div class="modal-field"><label>NIVEL RECOMENDADO</label>
                    <select id="actNivel">${NIVELES.map(l => `<option value="${escaparHTML(l)}" ${(datos.nivel || 'Todos') === l ? 'selected' : ''}>${escaparHTML(l)}</option>`).join('')}</select>
                </div>
                <div class="modal-field"><label>DURACIÓN (MINUTOS)</label><input type="number" id="actDuracion" min="0" max="240" value="${datos.duracion || ''}" placeholder="Ej. 5"></div>
            </div>
            <div class="modal-field"><label>PASOS (UNO POR LÍNEA, OPCIONAL)</label>
                <textarea id="actPasos" rows="4" placeholder="Siéntate cómodo&#10;Inhala contando hasta 4&#10;...">${escaparHTML((datos.pasos || []).join('\n'))}</textarea>
            </div>
            <div class="modal-field"><label>ENLACE / URL (OPCIONAL — video, audio, artículo)</label>
                <div class="ap-search"><i class="fa-solid fa-link"></i><input type="url" id="actUrl" maxlength="500" placeholder="https://www.youtube.com/watch?v=..." value="${escaparHTML(datos.url || '')}"></div>
            </div>
            <div class="modal-field">
                <label>ARCHIVO (OPCIONAL — imagen, audio, video o PDF de apoyo, máx. 25 MB)</label>
                <div class="file-upload-box ${datos.archivo ? 'has-file' : ''}" id="fileUploadBox">
                    <input type="file" id="actArchivo" accept="image/*,audio/*,video/*,.pdf" class="file-upload-input">
                    <label for="actArchivo" class="file-upload-label">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span class="file-upload-text" id="fileUploadText">${escaparHTML(datos.archivo ? (datos.archivoNombre || 'Archivo adjunto') : 'Ningún archivo seleccionado')}</span>
                        <span class="file-upload-btn">Elegir archivo</span>
                    </label>
                </div>
                ${isEdit && datos.archivo ? '<label class="file-remove"><input type="checkbox" id="actQuitarArchivo"> Quitar el archivo actual</label>' : ''}
            </div>
            <p class="modal-error" id="actError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="actCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="actConfirm"><i class="fa-solid fa-check"></i> ${isEdit ? 'Guardar cambios' : 'Publicar actividad'}</button>
        </div>
    `);
    const $ = (sel) => overlay.querySelector(sel);
    const mostrarError = (t) => { $('#actError span').innerText = t; $('#actError').classList.add('show'); };
    overlay.addEventListener('input', () => $('#actError').classList.remove('show'));

    $('#actCancel').addEventListener('click', () => closeSentirModal(overlay));
    $('#actTipo').addEventListener('change', () => {
        const otro = $('#actTipo').value === 'Otro';
        $('#actTipoOtroCampo').hidden = !otro;
        if (otro) $('#actTipoOtro').focus();
    });

    const fileInput = $('#actArchivo');
    fileInput.addEventListener('change', () => {
        const archivo = fileInput.files[0];
        if (archivo && archivo.size > 25 * 1024 * 1024) {
            fileInput.value = '';
            return mostrarError('El archivo pesa más de 25 MB.');
        }
        $('#fileUploadText').innerText = archivo ? archivo.name : 'Ningún archivo seleccionado';
        $('#fileUploadBox').classList.toggle('has-file', Boolean(archivo));
    });

    const otraIA = $('#actOtraIA');
    if (otraIA) otraIA.addEventListener('click', async () => {
        otraIA.disabled = true;
        otraIA.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creando…';
        try {
            const { borrador: nuevo } = await generarConIA(borrador.pedidoIA || { tipo: borrador.tipo, nivel: borrador.nivel });
            closeSentirModal(overlay);
            openActivityModal(null, { ...nuevo, pedidoIA: borrador.pedidoIA });
        } catch (error) {
            mostrarError(error.message);
            otraIA.disabled = false;
            otraIA.innerHTML = '<i class="fa-solid fa-rotate"></i> Pedir otra';
        }
    });

    $('#actConfirm').addEventListener('click', async (e) => {
        const titulo = $('#actTitulo').value.trim();
        const descripcion = $('#actDescripcion').value.trim();
        const tipo = $('#actTipo').value === 'Otro' ? $('#actTipoOtro').value.trim() : $('#actTipo').value;
        const url = $('#actUrl').value.trim();
        if (titulo.length < 3) return mostrarError('Escribe el título de la actividad.');
        if (descripcion.length < 10) return mostrarError('Escribe una descripción de al menos 10 caracteres.');
        if (tipo.length < 3) return mostrarError('Escribe cuál es la categoría de la actividad.');
        if (url && !/^https?:\/\/\S+\.\S+/i.test(url)) return mostrarError('El enlace debe empezar por http:// o https://');

        const form = new FormData();
        form.append('titulo', titulo);
        form.append('descripcion', descripcion);
        form.append('tipo', tipo);
        form.append('fecha', $('#actFecha').value || todayISO());
        form.append('nivel', $('#actNivel').value);
        form.append('duracion', $('#actDuracion').value || '0');
        form.append('pasos', $('#actPasos').value);
        form.append('url', url);
        if (borrador && borrador.generadaPor) form.append('generadaPor', borrador.generadaPor);
        if (fileInput.files[0]) form.append('archivo', fileInput.files[0]);
        if ($('#actQuitarArchivo') && $('#actQuitarArchivo').checked) form.append('quitarArchivo', '1');

        const boton = e.currentTarget;
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';
        try {
            await sentirApi(isEdit ? `/actividades/${existing.id}` : '/actividades', { method: isEdit ? 'PUT' : 'POST', body: form });
            closeSentirModal(overlay);
            showToast({
                title: isEdit ? 'Actividad actualizada' : 'Actividad publicada',
                message: `"${titulo}" ya aparece en los recursos de los estudiantes.`,
                icon: 'fa-spa', type: 'success'
            });
            cargarActividades();
        } catch (error) {
            mostrarError(error.message);
            boton.disabled = false;
            boton.innerHTML = `<i class="fa-solid fa-check"></i> ${isEdit ? 'Guardar cambios' : 'Publicar actividad'}`;
        }
    });
}
