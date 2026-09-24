document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderWelcome();
    renderKpis();
    renderCasesPreview();
    renderAgendaWidget();
    renderPendingFollowups();
    initQuickActions();
    renderAiInsight();
    initCreateGroupWorkshop();
    initHeaderSearch();
    initMoodStats();
    document.getElementById('goToAlertsBtn').addEventListener('click', () => window.location.href = '../alerts/Alerts.html');
});

function initMoodStats() {
    const pills = document.querySelectorAll('.mood-emoji');

    // Animación de conteo al cargar la página (efecto "wow" estadístico)
    pills.forEach(pill => {
        const target = parseInt(pill.dataset.value, 10);
        const percentEl = pill.querySelector('.mood-percent');
        let start = 0;
        const steps = 24;
        const inc = target / steps;
        const interval = setInterval(() => {
            start += inc;
            if (start >= target) { percentEl.innerText = target + '%'; clearInterval(interval); }
            else percentEl.innerText = Math.floor(start) + '%';
        }, 600 / steps);
    });

    pills.forEach(pill => {
        pill.addEventListener('click', () => openMoodStatsModal(pill.dataset.mood));
    });
}

const MOOD_INSIGHTS = {
    happy: '😊 El 62% de los estudiantes reporta un ánimo positivo esta semana. Los grados 7° y 8° muestran el mayor bienestar general.',
    neutral: '😐 El 24% reporta un ánimo neutral. Suele asociarse a cargas académicas puntuales; vale la pena reforzar espacios de pausa activa.',
    sad: '😔 El 14% reporta ánimo bajo. Es el grupo más pequeño, pero el de mayor prioridad: revisa los casos activos en Alertas.'
};

function openMoodStatsModal(highlightMood) {
    const data = [
        { key: 'happy', emoji: '😊', label: 'Ánimo Positivo', value: 62 },
        { key: 'neutral', emoji: '😐', label: 'Ánimo Neutral', value: 24 },
        { key: 'sad', emoji: '😔', label: 'Ánimo Bajo', value: 14 }
    ];

    const rowsHTML = data.map(d => `
        <div class="mood-chart-row ${d.key === highlightMood ? 'is-active' : ''}">
            <span class="mood-chart-emoji">${d.emoji}</span>
            <div class="mood-chart-track"><div class="mood-chart-fill ${d.key}" data-target="${d.value}"></div></div>
            <span class="mood-chart-value">${d.value}%</span>
        </div>
    `).join('');

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-chart-simple"></i></div>
            <div><h3>Estado Anímico Institucional</h3><p>Distribución general reportada esta semana</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="mood-chart">${rowsHTML}</div>
            <div class="mood-insight">${MOOD_INSIGHTS[highlightMood]}</div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeMoodModal">Cerrar</button>
            <button class="modal-btn-confirm" id="goMoodAlerts"><i class="fa-solid fa-arrow-right"></i> Ver Alertas y Casos</button>
        </div>
    `);

    // Animar las barras tras montar el modal
    requestAnimationFrame(() => {
        overlay.querySelectorAll('.mood-chart-fill').forEach(fill => {
            setTimeout(() => { fill.style.width = fill.dataset.target + '%'; }, 80);
        });
    });

    overlay.querySelector('#closeMoodModal').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#goMoodAlerts').addEventListener('click', () => window.location.href = '../alerts/Alerts.html');
}

function initHeaderSearch() {
    const input = document.getElementById('dashboardSearch');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        document.querySelectorAll('#homeCasesPreview .student-case-card').forEach(card => {
            const name = card.dataset.name.toLowerCase();
            card.style.display = (query === '' || name.includes(query)) ? 'block' : 'none';
        });
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
            window.location.href = '../students/Students.html?q=' + encodeURIComponent(input.value.trim());
        }
    });
}

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
        { icon: 'fa-triangle-exclamation', label: 'Riesgo Alto', value: riesgoAlto, cls: 'alert', goto: () => window.location.href = '../alerts/Alerts.html' },
        { icon: 'fa-bell', label: 'Alertas Activas', value: alertasNuevas, cls: 'urgent', goto: () => window.location.href = '../alerts/Alerts.html' },
        { icon: 'fa-circle-check', label: 'Casos Cerrados', value: 45, cls: '' }
    ];

    const grid = document.getElementById('homeKpiGrid');
    grid.innerHTML = kpis.map((k, i) => `
        <div class="kpi-card ${k.cls}" data-index="${i}" role="button" tabindex="0">
            <i class="fa-solid ${k.icon} kpi-icon"></i>
            <h3 class="counter-number">${k.value}</h3>
            <p>${k.label}</p>
        </div>
    `).join('');

    grid.querySelectorAll('.kpi-card').forEach((card, i) => {
        const activate = kpis[i].goto || (() => showToast({ title: kpis[i].label, message: 'Cifra acumulada del período actual.', icon: 'fa-chart-line', type: 'info' }));
        card.addEventListener('click', activate);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activate();
            }
        });
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
        <div class="student-case-card" data-name="${s.name}" role="button" tabindex="0">
            <div class="card-header">
                <div class="student-profile">
                    <img src="${s.avatar}" alt="${s.name}" class="student-case-avatar">
                    <div><h4>${s.name}</h4><p>Grado: ${s.grade} • ID: ${s.id}</p></div>
                </div>
                <span class="time-tag">Activo</span>
            </div>
            <div class="case-body">
                ${renderSignalSourceBadge(s.name)}
                <p class="emotional-state">Estado Emocional: <span class="high-risk-text">${s.moodText}</span></p>
                <p class="detection-reason"><strong>Motivo de alerta:</strong> ${getCaseSignalReason(s.name)}</p>
            </div>
            <div class="card-footer">
                <span class="badge-risk high">RIESGO ALTO</span>
                <button class="btn-primary-action">Ver Expediente</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.student-case-card').forEach(card => {
        const openCase = () => openStudentPanel(card.dataset.name);
        card.addEventListener('click', openCase);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCase();
            }
        });
    });
}


function renderPendingFollowups() {
    const list = document.getElementById('homeFollowupsList');
    const count = document.getElementById('homeFollowupsCount');
    if (!list || !count) return;

    const riskWeight = { high: 0, medium: 1, stable: 2 };
    const pending = getStudents()
        .filter(s => s.risk === 'high' || s.risk === 'medium')
        .map(student => ({ student, next: getNextStudentAgenda(student.name) }))
        .sort((a, b) => {
            const riskDiff = riskWeight[a.student.risk] - riskWeight[b.student.risk];
            if (riskDiff !== 0) return riskDiff;
            if (a.next && !b.next) return -1;
            if (!a.next && b.next) return 1;
            return a.student.name.localeCompare(b.student.name);
        })
        .slice(0, 3);

    count.textContent = pending.length;
    if (!pending.length) {
        list.innerHTML = `<div class="followups-empty"><i class="fa-solid fa-circle-check"></i> No hay seguimientos pendientes.</div>`;
        return;
    }

    list.innerHTML = pending.map(({ student, next }) => `
        <div class="followup-item" data-name="${student.name}" role="button" tabindex="0">
            <div class="followup-avatar-wrap"><img src="${student.avatar}" alt="${student.name}"></div>
            <div class="followup-info">
                <strong>${student.name}</strong>
                <span><i class="fa-solid ${next ? 'fa-calendar-check' : 'fa-clock'}"></i>${next ? `${formatCaseDate(next.fecha)} · ${next.hora} · ${next.titulo}` : 'Seguimiento pendiente por agendar'}</span>
            </div>
            ${next ? '<i class="fa-solid fa-chevron-right followup-arrow" aria-hidden="true"></i>' : `<button class="followup-mini-action" data-schedule="${student.name}" title="Agendar seguimiento"><i class="fa-solid fa-calendar-plus"></i><span>Agendar</span></button>`}
        </div>
    `).join('');

    list.querySelectorAll('.followup-item').forEach(item => {
        const openFollowup = () => openStudentPanel(item.dataset.name);
        item.addEventListener('click', openFollowup);
        item.addEventListener('keydown', (event) => {
            if (event.target !== item) return;
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFollowup();
            }
        });
    });
    list.querySelectorAll('[data-schedule]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToAgendaForStudent(btn.dataset.schedule);
        });
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
        li.addEventListener('click', () => {
            const item = items.find(a => a.id === li.dataset.id);
            if (item) openAgendaPreviewModal(item);
        });
    });
}

function openAgendaPreviewModal(item) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon" style="background:${getAppointmentColor(item.titulo).solid}"><i class="fa-solid ${getAppointmentColor(item.titulo).icon}"></i></div>
            <div><h3>${item.titulo}</h3><p>${formatSpanishDate(item.fecha)} · ${item.hora}</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="agenda-preview-row"><i class="fa-solid fa-user"></i><span><strong>${item.nombre}</strong> · Grado ${item.grado}</span></div>
            <div class="agenda-preview-row"><i class="fa-solid fa-align-left"></i><span>${item.descripcion || 'Sin descripción adicional.'}</span></div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeAgendaPreview">Cerrar</button>
            <button class="modal-btn-confirm" id="goFullAgenda"><i class="fa-solid fa-arrow-right"></i> Ver agenda completa</button>
        </div>
    `);
    overlay.querySelector('#closeAgendaPreview').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#goFullAgenda').addEventListener('click', () => window.location.href = '../agenda/Agenda.html');
}

function formatSpanishDate(fechaISO) {
    return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

function initQuickActions() {
    document.getElementById('qaExportPdf').addEventListener('click', openReportPreviewModal);

    document.getElementById('qaExternalReferral').addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-square-plus"></i></div>
                <div><h3>Registrar Derivación Externa</h3><p>Remite un caso a una institución o profesional externo</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field"><label>ESTUDIANTE</label><input type="text" id="extStudent" placeholder="Nombre del estudiante"></div>
                <div class="modal-field"><label>INSTITUCIÓN O PROFESIONAL EXTERNO</label><input type="text" id="extInstitution" placeholder="Ej. EPS, clínica especializada o profesional externo..."></div>
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

function renderAiInsight() {
    const trend = getAiTrend();
    const text = document.getElementById('aiInsightText');
    const trace = document.getElementById('aiTraceabilityBody');
    if (!trend || !text || !trace) return;

    const previous = Number(trend.previousCount) || 0;
    const current = Number(trend.currentCount) || 0;
    const variation = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
    const direction = variation > 0 ? 'incremento' : variation < 0 ? 'disminución' : 'estabilidad';
    const variationText = variation === 0 ? 'sin variación porcentual' : `${Math.abs(variation)}% de ${direction}`;

    text.innerHTML = `Se observa un <strong>${variationText}</strong> en registros asociados con ${trend.topic} en el grado <strong>${trend.group}</strong>, coincidiendo con la proximidad de los exámenes de estado.`;

    trace.innerHTML = `
        <div><strong>${current}</strong><span>${trend.currentPeriod}</span></div>
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        <div><strong>${previous}</strong><span>${trend.previousPeriod}</span></div>
        <p><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Tendencia agregada de apoyo a la priorización. Requiere revisión de la psicóloga y no constituye un diagnóstico.</p>
    `;
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

/* ==========================================================================
   REPORTE DE SEGUIMIENTO INSTITUCIONAL (real, imprimible / descargable como PDF)
   ========================================================================== */
function openReportPreviewModal() {
    const students = getStudents();
    const activeAlerts = getAlerts().filter(a => a.estado !== 'Resuelta').length;
    const high = students.filter(s => s.risk === 'high').length;
    const agendaToday = getAgenda().filter(a => a.fecha === todayISO()).length;

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-file-pdf"></i></div>
            <div><h3>Reporte general de SENTIR</h3><p>Resumen institucional listo para compartir o descargar</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="report-kpis">
                <div class="report-kpi"><strong>${students.length}</strong><span>Estudiantes</span></div>
                <div class="report-kpi"><strong>${activeAlerts}</strong><span>Alertas activas</span></div>
                <div class="report-kpi"><strong>${high}</strong><span>Riesgo alto</span></div>
                <div class="report-kpi"><strong>${agendaToday}</strong><span>Agenda de hoy</span></div>
            </div>
            <p class="activity-detail-text">El documento incluye distribución de riesgo, alertas activas, agenda del día y catálogo de actividades. No realiza diagnósticos: resume información de seguimiento institucional.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeReportPreview">Cerrar</button>
            <button class="btn-secondary" id="shareReportBtn"><i class="fa-solid fa-share-nodes"></i> Compartir</button>
            <button class="modal-btn-confirm" id="downloadReportBtn"><i class="fa-solid fa-download"></i> Descargar PDF</button>
        </div>
    `);

    overlay.querySelector('#closeReportPreview').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#downloadReportBtn').addEventListener('click', () => {
        closeSentirModal(overlay);
        showToast({ title: 'Generando reporte de seguimiento', message: 'Armando el documento con la información actual...', icon: 'fa-file-export', type: 'info' });
        setTimeout(generateGeneralFollowupReport, 400);
    });

    overlay.querySelector('#shareReportBtn').addEventListener('click', async () => {
        const summaryText = `Reporte SENTIR: ${students.length} estudiantes, ${activeAlerts} alertas activas, ${high} en riesgo alto, ${agendaToday} citas hoy.`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Reporte general de SENTIR', text: summaryText }); }
            catch (e) { /* el usuario canceló el compartir */ }
        } else {
            showToast({ title: 'Compartir no disponible aquí', message: 'Tu navegador no soporta compartir directo. Descarga el PDF y compártelo manualmente.', icon: 'fa-circle-info', type: 'info' });
        }
    });
}

function generateGeneralFollowupReport() {
    if (!window.jspdf) {
        showToast({ title: 'No se pudo generar el PDF', message: 'No se cargó la librería de PDF (revisa tu conexión) e intenta de nuevo.', icon: 'fa-circle-exclamation', type: 'info' });
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    let y = 56;

    const students = getStudents();
    const alerts = getAlerts();
    const profile = getPsychProfile();
    const high = students.filter(s => s.risk === 'high');
    const medium = students.filter(s => s.risk === 'medium');
    const activeAlerts = alerts.filter(a => a.estado !== 'Resuelta');

    const primary = [108, 77, 246];
    const primaryDark = [78, 47, 199];
    const textPrimary = [30, 27, 75];
    const textSecondary = [100, 116, 139];
    const textAux = [75, 85, 99];

    function checkPageBreak(space) {
        if (y + space > pageHeight - 50) {
            doc.addPage();
            y = 56;
        }
    }

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...textPrimary);
    doc.text('Reporte de Seguimiento Institucional · SENTIR', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...textSecondary);
    doc.text(`Generado por ${profile.name}, ${profile.role} · ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);
    y += 28;

    // KPIs
    const kpis = [
        { label: 'ESTUDIANTES', value: students.length },
        { label: 'RIESGO ALTO', value: high.length },
        { label: 'RIESGO MEDIO', value: medium.length },
        { label: 'ALERTAS ACTIVAS', value: activeAlerts.length }
    ];
    const gap = 10;
    const kpiW = (pageWidth - margin * 2 - gap * 3) / 4;
    kpis.forEach((k, i) => {
        const x = margin + i * (kpiW + gap);
        doc.setFillColor(242, 242, 253);
        doc.roundedRect(x, y, kpiW, 52, 8, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(17);
        doc.setTextColor(...primaryDark);
        doc.text(String(k.value), x + kpiW / 2, y + 26, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...textSecondary);
        doc.text(k.label, x + kpiW / 2, y + 40, { align: 'center' });
    });
    y += 78;

    function sectionTitle(title) {
        checkPageBreak(28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...primaryDark);
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(224, 224, 245);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;
    }

    function entry(title, meta, desc) {
        checkPageBreak(42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...textPrimary);
        doc.text(title, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...textSecondary);
        doc.text(meta, margin + doc.getTextWidth(title) + 10, y);
        y += 13;

        doc.setFontSize(9);
        doc.setTextColor(...textAux);
        const lines = doc.splitTextToSize(desc || '', pageWidth - margin * 2);
        lines.forEach(line => {
            checkPageBreak(12);
            doc.text(line, margin, y);
            y += 12;
        });
        y += 8;
    }

    function emptyMsg(text) {
        checkPageBreak(16);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...textSecondary);
        doc.text(text, margin, y);
        y += 18;
    }

    sectionTitle('Alertas Activas');
    if (activeAlerts.length) activeAlerts.forEach(a => entry(a.estudiante, `${a.hora} · ${a.estado}`, a.motivo));
    else emptyMsg('No hay alertas activas.');

    sectionTitle('Casos de Riesgo Alto');
    if (high.length) high.forEach(s => entry(s.name, `Grado ${s.grade} · ${s.id} · ${s.caseNumber}`, s.moodText));
    else emptyMsg('Sin casos de riesgo alto en este momento.');

    sectionTitle('Casos de Riesgo Medio');
    if (medium.length) medium.forEach(s => entry(s.name, `Grado ${s.grade} · ${s.id} · ${s.caseNumber}`, s.moodText));
    else emptyMsg('Sin casos de riesgo medio en este momento.');

    checkPageBreak(24);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...textSecondary);
    doc.text('Documento generado por SENTIR. Uso confidencial exclusivo del área de psicología.', margin, y + 10);

    doc.save(`sentir-reporte-seguimiento-${todayISO()}.pdf`);

    showToast({ title: 'Reporte descargado', message: 'El PDF se guardó en tu carpeta de descargas.', icon: 'fa-circle-check', type: 'success' });
}
