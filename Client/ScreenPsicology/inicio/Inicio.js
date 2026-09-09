document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderWelcome();
    renderKpis();
    renderCasesPreview();
    renderAgendaWidget();
    initQuickActions();
    initCreateGroupWorkshop();
    document.getElementById('goToAlertsBtn').addEventListener('click', () => window.location.href = '../alertas/Alertas.html');
});

function renderWelcome() {
    const profile = getPsychProfile();
    const firstName = profile.name.split(' ')[0];
    document.getElementById('welcomeTitle').innerText = `¡Hola de nuevo, ${firstName}!`;
}

function renderKpis() {
    const students = getStudents();
    const alertasNuevas = getAlerts().filter(a => a.estado !== 'Resuelta').length;
    const riesgoAlto = students.filter(s => s.risk === 'high').length;

    const kpis = [
        { icon: 'fa-users', label: 'Evaluados', value: 1240, cls: '' },
        { icon: 'fa-triangle-exclamation', label: 'Riesgo Alto', value: riesgoAlto, cls: 'alert', goto: () => window.location.href = '../alertas/Alertas.html' },
        { icon: 'fa-bell', label: 'Alertas Activas', value: alertasNuevas, cls: 'urgent', goto: () => window.location.href = '../alertas/Alertas.html' },
        { icon: 'fa-circle-check', label: 'Casos Cerrados', value: 45, cls: '' }
    ];

    const grid = document.getElementById('homeKpiGrid');
    grid.innerHTML = kpis.map((k, i) => `
        <div class="kpi-card ${k.cls}" data-index="${i}">
            <i class="fa-solid ${k.icon} kpi-icon"></i>
            <h3 class="counter-number">${k.value}</h3>
            <p>${k.label}</p>
        </div>
    `).join('');

    grid.querySelectorAll('.kpi-card').forEach((card, i) => {
        if (kpis[i].goto) card.addEventListener('click', kpis[i].goto);
        else card.addEventListener('click', () => showToast({ title: kpis[i].label, message: 'Cifra acumulada del período actual.', icon: 'fa-chart-line', type: 'info' }));
    });

    animateCounters(grid);
}

function animateCounters(scope) {
    scope.querySelectorAll('.counter-number').forEach(el => {
        const target = parseInt(el.innerText.replace(/,/g, ''), 10);
        if (isNaN(target)) return;
        let start = 0;
        const steps = 30;
        const inc = target / steps;
        const interval = setInterval(() => {
            start += inc;
            if (start >= target) { el.innerText = target.toLocaleString('es-CO'); clearInterval(interval); }
            else el.innerText = Math.floor(start).toLocaleString('es-CO');
        }, 1000 / steps);
    });
}

function renderCasesPreview() {
    const students = getStudents();
    const priority = students.filter(s => s.risk === 'high').slice(0, 2);
    const container = document.getElementById('homeCasesPreview');

    if (!priority.length) {
        container.innerHTML = `<p class="agenda-empty">No hay casos de riesgo alto activos en este momento. 🎉</p>`;
        return;
    }

    container.innerHTML = priority.map(s => `
        <div class="student-case-card" data-name="${s.name}">
            <div class="card-header">
                <div class="student-profile">
                    <img src="${s.avatar}" alt="${s.name}" class="student-case-avatar">
                    <div><h4>${s.name}</h4><p>Grado: ${s.grade} • ID: ${s.id}</p></div>
                </div>
                <span class="time-tag">Activo</span>
            </div>
            <div class="case-body">
                <p class="emotional-state">Estado Emocional: <span class="high-risk-text">${s.moodText}</span></p>
                <p class="detection-reason"><strong>Motivo de alerta:</strong> Sentir AI detectó un patrón sostenido de riesgo que requiere seguimiento cercano.</p>
            </div>
            <div class="card-footer">
                <span class="badge-risk high">RIESGO ALTO</span>
                <button class="btn-primary-action">Ver Expediente</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.student-case-card').forEach(card => {
        card.addEventListener('click', () => openStudentPanel(card.dataset.name));
    });
}

function renderAgendaWidget() {
    const today = todayISO();
    const items = getAgenda().filter(a => a.fecha === today).sort((a, b) => a.hora.localeCompare(b.hora));
    const list = document.getElementById('homeAgendaList');

    if (!items.length) {
        list.innerHTML = `<li class="agenda-empty" style="cursor:default;">No tienes citas agendadas para hoy.</li>`;
        return;
    }

    list.innerHTML = items.map(a => `
        <li data-id="${a.id}">
            <span class="time">${a.hora}</span>
            <div class="event-details"><strong>${a.titulo}</strong><p>${a.nombre} · ${a.grado}</p></div>
        </li>
    `).join('') + `<li style="justify-content:center;"><a href="../agenda/Agenda.html" style="font-size:11px; color:var(--morado-sentir); font-weight:700; text-decoration:none;">Ver agenda completa →</a></li>`;

    list.querySelectorAll('li[data-id]').forEach(li => {
        li.addEventListener('click', () => window.location.href = '../agenda/Agenda.html');
    });
}

function initQuickActions() {
    document.getElementById('qaExportPdf').addEventListener('click', () => {
        showToast({ title: 'Generando reporte clínico', message: 'Empaquetando la información bajo cifrado seguro...', icon: 'fa-file-export', type: 'info' });
        setTimeout(() => showToast({ title: 'Reporte listo', message: 'El reporte clínico PDF fue generado y está disponible para descarga.', icon: 'fa-circle-check', type: 'success' }), 1800);
    });

    document.getElementById('qaExternalReferral').addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-square-plus"></i></div>
                <div><h3>Registrar Derivación Externa</h3><p>Remite un caso a una institución o profesional externo</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field"><label>ESTUDIANTE</label><input type="text" id="extStudent" placeholder="Nombre del estudiante"></div>
                <div class="modal-field"><label>INSTITUCIÓN O PROFESIONAL EXTERNO</label><input type="text" id="extInstitution" placeholder="Ej. EPS Sura, Hospital Mental de Antioquia..."></div>
                <div class="modal-field"><label>MOTIVO</label><textarea id="extReason" rows="3" placeholder="Describe brevemente el motivo"></textarea></div>
                <p class="modal-error" id="extError"><i class="fa-solid fa-circle-exclamation"></i> Escribe el estudiante y la institución externa.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="extCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="extConfirm"><i class="fa-solid fa-check"></i> Registrar</button>
            </div>
        `);
        overlay.querySelector('#extCancel').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#extConfirm').addEventListener('click', () => {
            const student = overlay.querySelector('#extStudent').value.trim();
            const institution = overlay.querySelector('#extInstitution').value.trim();
            const errorMsg = overlay.querySelector('#extError');
            if (!student || !institution) { errorMsg.classList.add('show'); return; }
            errorMsg.classList.remove('show');
            const reason = overlay.querySelector('#extReason').value.trim();
            addInterventionRecord(student, {
                fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
                titulo: 'Derivación externa registrada',
                detalle: `Se derivó a ${institution}.${reason ? ' Motivo: ' + reason : ''}`
            });
            closeSentirModal(overlay);
            showToast({ title: 'Derivación externa registrada', message: `${student} fue remitido a ${institution}.`, icon: 'fa-square-plus', type: 'success' });
        });
    });

    document.getElementById('qaNotifyCoord').addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-envelope-open-text"></i></div>
                <div><h3>Notificar a Coordinación</h3><p>Envía un mensaje directo al equipo de Coordinación Académica</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field"><label>ASUNTO</label><input type="text" id="coordSubject" placeholder="Ej. Caso prioritario - seguimiento requerido"></div>
                <div class="modal-field"><label>MENSAJE</label><textarea id="coordMessage" rows="4" placeholder="Describe la situación que Coordinación debe conocer..."></textarea></div>
                <p class="modal-error" id="coordError"><i class="fa-solid fa-circle-exclamation"></i> Escribe un mensaje antes de enviar.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="coordCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="coordConfirm"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
            </div>
        `);
        overlay.querySelector('#coordCancel').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#coordConfirm').addEventListener('click', () => {
            const message = overlay.querySelector('#coordMessage').value.trim();
            const errorMsg = overlay.querySelector('#coordError');
            if (!message) { errorMsg.classList.add('show'); return; }
            errorMsg.classList.remove('show');
            closeSentirModal(overlay);
            showToast({ title: 'Notificación enviada', message: 'Coordinación Académica recibió tu mensaje y dará seguimiento.', icon: 'fa-envelope-open-text', type: 'success' });
        });
    });
}

function initCreateGroupWorkshop() {
    document.getElementById('createWorkshopBtn').addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-users-gear"></i></div>
                <div><h3>Agendar Taller Grupal 11°1</h3><p>La IA preconfiguró los objetivos según la alerta detectada</p></div>
            </div>
            <div class="sentir-modal-body">
                <p class="activity-detail-text">Objetivos sugeridos: manejo del tiempo y técnicas de respiración diafragmática, para reducir el estrés académico ante los exámenes de estado.</p>
                <div class="modal-field"><label>FECHA DEL TALLER</label><input type="date" id="workshopDate" value="${todayISO()}"></div>
                <div class="modal-field"><label>NOTA PARA EL GRUPO (OPCIONAL)</label><textarea id="workshopNote" rows="2" placeholder="Ej. Traer ropa cómoda..."></textarea></div>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="cancelWorkshop">Cancelar</button>
                <button class="modal-btn-confirm" id="confirmWorkshop"><i class="fa-solid fa-check"></i> Confirmar y Notificar</button>
            </div>
        `);
        overlay.querySelector('#cancelWorkshop').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#confirmWorkshop').addEventListener('click', () => {
            const date = overlay.querySelector('#workshopDate').value || todayISO();
            const agenda = getAgenda();
            agenda.push({ id: 'ag' + Date.now(), fecha: date, titulo: 'Taller Grupal', hora: '08:00', nombre: 'Grupo 11°1', grado: '11°1', descripcion: 'Manejo del tiempo y respiración diafragmática (sugerido por Sentir AI).' });
            saveAgenda(agenda);
            closeSentirModal(overlay);
            showToast({ title: 'Taller agendado', message: 'Se notificó al grupo 11°1 y se agregó a la Agenda.', icon: 'fa-users-gear', type: 'success' });
        });
    });
}
