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

    // Datos reales de la base de datos (los carga sentir-shared.js)
    document.addEventListener('sentir:datos', (event) => {
        renderWelcome();
        renderMood(event.detail.inicio.animo);
        renderKpis();
        renderCasesPreview();
        renderPendingFollowups();
        renderAiInsight();
    });
});

/* Estado anímico general de la institución (diario emocional, últimos 30 días) */
function renderMood(animo) {
    if (!animo) return;
    window.sentirAnimo = animo;

    const titulo = document.getElementById('moodStatusTitle');
    if (titulo) titulo.innerText = animo.etiqueta;

    const valores = { happy: animo.positivo, neutral: animo.neutral, sad: animo.bajo };
    document.querySelectorAll('.mood-emoji').forEach(pill => {
        const objetivo = valores[pill.dataset.mood] || 0;
        pill.dataset.value = objetivo;
        pill.title = `${animo.registros} registros de ánimo en los últimos 30 días`;
        const porcentaje = pill.querySelector('.mood-percent');
        let actual = 0;
        const paso = Math.max(1, objetivo / 24);
        const intervalo = setInterval(() => {
            actual += paso;
            if (actual >= objetivo) { porcentaje.innerText = objetivo + '%'; clearInterval(intervalo); }
            else porcentaje.innerText = Math.floor(actual) + '%';
        }, 25);
    });
}

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
    const animo = window.sentirAnimo || { positivo: 0, neutral: 0, bajo: 0, registros: 0 };
    const data = [
        { key: 'happy', emoji: '😊', label: 'Ánimo Positivo', value: animo.positivo },
        { key: 'neutral', emoji: '😐', label: 'Ánimo Neutral', value: animo.neutral },
        { key: 'sad', emoji: '😔', label: 'Ánimo Bajo', value: animo.bajo }
    ];
    const MOOD_INSIGHTS = {
        happy: `😊 El ${animo.positivo}% de los registros del diario (últimos 30 días) son de ánimo positivo ("Muy bien" o "Bien").`,
        neutral: `😐 El ${animo.neutral}% de los registros son de ánimo neutral ("Regular"). Vale la pena reforzar espacios de pausa activa.`,
        sad: `😔 El ${animo.bajo}% de los registros son de ánimo bajo ("Mal" o "Muy mal"). Es el grupo de mayor prioridad: revisa los casos activos en Alertas.`
    };

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
            <div><h3>Estado Anímico Institucional</h3><p>${animo.registros} registros del diario emocional en los últimos 30 días</p></div>
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
    const k = (window.sentirInicio && window.sentirInicio.kpis) || {};
    const students = getStudents();
    const alertasActivas = k.alertasActivas ?? getAlerts().filter(a => a.estado !== 'Resuelta').length;
    const riesgoAlto = k.riesgoAlto ?? students.filter(s => s.risk === 'high').length;

    const kpis = [
        { icon: 'fa-users', label: 'Evaluados', value: k.evaluados ?? 0, cls: '', info: 'Estudiantes que registraron su ánimo en el diario en los últimos 30 días.' },
        { icon: 'fa-triangle-exclamation', label: 'Riesgo Alto', value: riesgoAlto, cls: 'alert', goto: () => window.location.href = '../alerts/Alerts.html' },
        { icon: 'fa-bell', label: 'Alertas Activas', value: alertasActivas, cls: 'urgent', goto: () => window.location.href = '../alerts/Alerts.html' },
        { icon: 'fa-circle-check', label: 'Casos Cerrados', value: k.casosCerrados ?? 0, cls: '', info: 'Solicitudes de ayuda y alertas marcadas como resueltas.' }
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
        const activate = kpis[i].goto || (() => showToast({ title: kpis[i].label, message: kpis[i].info || 'Cifra acumulada del período actual.', icon: 'fa-chart-line', type: 'info' }));
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
    const priority = students.filter(s => s.risk === 'high').slice(0, 3);
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

/* --------------------------------------------------------------------------
   ACCESOS RÁPIDOS
   -------------------------------------------------------------------------- */

// Ventana para elegir un estudiante (por nombre o identificación)
function elegirEstudiante(titulo, descripcion, alElegir) {
    const estudiantes = getStudents().filter(s => s.idUsuario).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-user-graduate"></i></div>
            <div><h3>${escaparHTML(titulo)}</h3><p>${escaparHTML(descripcion)}</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field">
                <div class="ap-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="eeBuscar" placeholder="Nombre o número de identificación" autocomplete="off"></div>
            </div>
            <div class="ap-results" id="eeLista"></div>
        </div>
        <div class="sentir-modal-actions"><button class="modal-btn-cancel" id="eeCancel">Cancelar</button></div>
    `);
    const buscar = overlay.querySelector('#eeBuscar');
    const lista = overlay.querySelector('#eeLista');
    const pintar = () => {
        const q = buscar.value.toLowerCase().trim();
        const encontrados = estudiantes.filter(s => !q || s.name.toLowerCase().includes(q) || String(s.idUsuario).includes(q)).slice(0, 25);
        lista.innerHTML = encontrados.length ? encontrados.map(s => `
            <button type="button" class="ap-result" data-nombre="${escaparHTML(s.name)}">
                <img src="${s.avatar}" alt="">
                <span class="ap-result-info"><strong>${escaparHTML(s.name)}</strong><small>ID ${s.idUsuario} · Grado ${escaparHTML(s.grade)}</small></span>
                <i class="fa-solid fa-chevron-right ap-check"></i>
            </button>`).join('') : '<p class="ap-hint"><i class="fa-solid fa-user-slash"></i> No hay estudiantes que coincidan.</p>';
        lista.querySelectorAll('[data-nombre]').forEach(b => b.addEventListener('click', () => {
            closeSentirModal(overlay);
            alElegir(b.dataset.nombre);
        }));
    };
    buscar.addEventListener('input', pintar);
    pintar();
    setTimeout(() => buscar.focus(), 50);
    overlay.querySelector('#eeCancel').addEventListener('click', () => closeSentirModal(overlay));
}

function initQuickActions() {
    // Reporte PDF con la información actual
    document.getElementById('qaExportPdf').addEventListener('click', openReportPreviewModal);

    // Derivación externa: se elige el estudiante y se guarda en la base de datos (tabla derivacion)
    document.getElementById('qaExternalReferral').addEventListener('click', () => {
        elegirEstudiante('Registrar derivación externa', 'Elige al estudiante que vas a remitir a una EPS o entidad externa', (nombre) => openMedicalReferralModal(nombre));
    });

    // Notificar a Coordinación: aviso en su campanita + correo
    document.getElementById('qaNotifyCoord').addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-envelope-open-text"></i></div>
                <div><h3>Notificar a Coordinación</h3><p>Les llegará a su campanita de notificaciones y a su correo</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field"><label>PARA</label>
                    <select id="coordDestino">
                        <option value="ambas">Coordinación académica y de convivencia</option>
                        <option value="academica">Coordinación académica</option>
                        <option value="convivencia">Coordinación de convivencia</option>
                    </select>
                </div>
                <div class="modal-field"><label>ASUNTO</label><input type="text" id="coordSubject" maxlength="120" placeholder="Ej. Caso prioritario - seguimiento requerido"></div>
                <div class="modal-field"><label>MENSAJE</label><textarea id="coordMessage" rows="4" maxlength="2000" placeholder="Describe la situación que Coordinación debe conocer (evita datos sensibles innecesarios)..."></textarea></div>
                <p class="modal-error" id="coordError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="coordCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="coordConfirm"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
            </div>
        `);
        const $ = (sel) => overlay.querySelector(sel);
        const error = (t) => { $('#coordError span').innerText = t; $('#coordError').classList.add('show'); };
        overlay.addEventListener('input', () => $('#coordError').classList.remove('show'));
        $('#coordCancel').addEventListener('click', () => closeSentirModal(overlay));
        $('#coordConfirm').addEventListener('click', async (e) => {
            const mensaje = $('#coordMessage').value.trim();
            if (mensaje.length < 5) return error('Escribe el mensaje para Coordinación.');
            const boton = e.currentTarget;
            boton.disabled = true;
            boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando…';
            try {
                const r = await sentirApi('/coordinacion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destino: $('#coordDestino').value, asunto: $('#coordSubject').value.trim(), mensaje })
                });
                closeSentirModal(overlay);
                showToast({ title: 'Mensaje enviado', message: `Llegó a ${r.enviados} persona${r.enviados === 1 ? '' : 's'} de Coordinación (campanita y correo).`, icon: 'fa-envelope-open-text', type: 'success' });
            } catch (err) {
                error(err.message);
                boton.disabled = false;
                boton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar';
            }
        });
    });
}

/* --------------------------------------------------------------------------
   SUGERENCIA DE LA IA + TIP
   La IA analiza datos agregados (sin nombres) del diario y de las alertas.
   -------------------------------------------------------------------------- */
let sugerenciaIA = null;

async function renderAiInsight(pedirOtra = false) {
    const text = document.getElementById('aiInsightText');
    const tip = document.getElementById('aiTipText');
    const trace = document.getElementById('aiTraceabilityBody');
    const meta = document.getElementById('aiInsightMeta');
    const accion = document.getElementById('createWorkshopBtn');
    const recargar = document.getElementById('aiRefreshBtn');
    if (!text || !trace || !sentirToken()) return;
    if (renderAiInsight.cargando) return;
    renderAiInsight.cargando = true;

    if (pedirOtra || !sugerenciaIA) {
        text.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sentir AI está analizando los registros de la institución…';
        if (tip) tip.textContent = '';
    }
    if (recargar) recargar.disabled = true;

    try {
        sugerenciaIA = await sentirApi('/sugerencia-ia' + (pedirOtra ? '?nueva=1' : ''));
    } catch (error) {
        text.textContent = 'No se pudo generar la sugerencia en este momento. Intenta de nuevo en unos segundos.';
        renderAiInsight.cargando = false;
        if (recargar) recargar.disabled = false;
        return;
    }
    renderAiInsight.cargando = false;
    if (recargar) recargar.disabled = false;

    const s = sugerenciaIA;
    const b = s.base || {};
    text.textContent = s.sugerencia;
    if (tip) tip.innerHTML = `💡 <strong>Tip:</strong> ${escaparHTML(s.tip)}`;
    if (meta) {
        const hace = Math.max(0, Math.round((Date.now() - new Date(s.fecha).getTime()) / 60000));
        meta.innerHTML = s.generadoPor
            ? `<i class="fa-solid fa-wand-magic-sparkles"></i> Generado con IA · ${hace < 1 ? 'ahora' : `hace ${hace} min`}`
            : '<i class="fa-solid fa-calculator"></i> Calculado sin IA (la IA no respondió)';
    }
    if (accion) {
        accion.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Crear actividad con IA${s.grupo ? ` para ${escaparHTML(s.grupo)}` : ''}`;
        accion.disabled = false;
    }

    const niveles = Object.entries(b.alertasPorNivel || {}).map(([n, c]) => `${c} ${n.toLowerCase()}`).join(', ');
    trace.innerHTML = `
        ${b.grupo && b.animoBajoSemana !== null ? `
            <div><strong>${b.animoBajoSemana}</strong><span>ánimo bajo · ${escaparHTML(b.grupo)} · 7 días</span></div>
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            <div><strong>${b.animoBajoSemanaAnterior}</strong><span>7 días anteriores</span></div>` : ''}
        <ul class="ai-base-list">
            <li>${b.registrosSemana || 0} registros en el diario emocional esta semana</li>
            <li>${b.alertasActivas || 0} alertas activas${niveles ? ` (${escaparHTML(niveles)})` : ''}</li>
            ${(b.factores || []).length ? `<li>Factores más frecuentes: ${escaparHTML(b.factores.join(', '))}</li>` : ''}
            ${b.citasPorAceptar ? `<li>${b.citasPorAceptar} citas por aceptar</li>` : ''}
        </ul>
        <p><i class="fa-solid fa-circle-info" aria-hidden="true"></i> La IA solo recibe cifras agregadas por grado, nunca nombres. Es un apoyo a la priorización y no constituye un diagnóstico.</p>
    `;
}

function initCreateGroupWorkshop() {
    const accion = document.getElementById('createWorkshopBtn');
    if (accion) accion.addEventListener('click', abrirActividadParaGrupo);
    const recargar = document.getElementById('aiRefreshBtn');
    if (recargar) recargar.addEventListener('click', () => renderAiInsight(true));
}

/* La IA crea una actividad según la sugerencia; se publica en Recursos y,
   si se elige, se sugiere a todos los estudiantes del grado (aviso + correo). */
async function abrirActividadParaGrupo() {
    const s = sugerenciaIA || {};
    const grupo = s.grupo || '';
    const delGrado = grupo ? getStudents().filter(st => st.idUsuario && String(st.grade).toLowerCase() === grupo.toLowerCase()) : [];

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <div><h3>Actividad sugerida por la IA${grupo ? ` · ${escaparHTML(grupo)}` : ''}</h3><p>Revísala antes de publicarla en los recursos de los estudiantes</p></div>
        </div>
        <div class="sentir-modal-body" id="gaBody"><p class="history-empty"><i class="fa-solid fa-spinner fa-spin"></i> La IA está creando la actividad…</p></div>
        <div class="sentir-modal-actions" id="gaActions"><button class="modal-btn-cancel" id="gaCancel">Cancelar</button></div>
    `);
    const $ = (sel) => overlay.querySelector(sel);
    $('#gaCancel').addEventListener('click', () => closeSentirModal(overlay));

    let borrador;
    const generar = async () => {
        $('#gaBody').innerHTML = '<p class="history-empty"><i class="fa-solid fa-spinner fa-spin"></i> La IA está creando la actividad…</p>';
        try {
            borrador = (await sentirApi('/actividades/generar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tema: s.temaActividad || 'bienestar emocional', tipo: s.tipoActividad || '', nivel: 'Bienestar general' })
            })).borrador;
        } catch (error) {
            $('#gaBody').innerHTML = `<p class="history-empty">${escaparHTML(error.message)}</p>`;
            return;
        }
        $('#gaBody').innerHTML = `
            <div class="modal-field"><label>TÍTULO</label><input type="text" id="gaTitulo" maxlength="120" value="${escaparHTML(borrador.titulo)}"></div>
            <div class="modal-field"><label>DESCRIPCIÓN</label><textarea id="gaDesc" rows="3">${escaparHTML(borrador.descripcion)}</textarea></div>
            <div class="modal-field"><label>PASOS (UNO POR LÍNEA)</label><textarea id="gaPasos" rows="5">${escaparHTML(borrador.pasos.join('\n'))}</textarea></div>
            <p class="fu-note"><i class="fa-solid fa-tag"></i> ${escaparHTML(borrador.tipo)} · ${borrador.duracion} min · ${escaparHTML(borrador.generadaPor)}</p>
            ${delGrado.length ? `<label class="ga-check"><input type="checkbox" id="gaSugerir" checked> Sugerirla ${delGrado.length === 1 ? 'al estudiante' : `a los ${delGrado.length} estudiantes`} del grado ${escaparHTML(grupo)} (les llega aviso y correo)</label>` : ''}
            <p class="modal-error" id="gaError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>`;
    };

    $('#gaActions').insertAdjacentHTML('beforeend', `
        <button class="modal-btn-cancel" id="gaOtra"><i class="fa-solid fa-rotate"></i> Pedir otra</button>
        <button class="modal-btn-confirm" id="gaPublicar"><i class="fa-solid fa-check"></i> Publicar</button>`);
    $('#gaOtra').addEventListener('click', generar);
    await generar();

    $('#gaPublicar').addEventListener('click', async (e) => {
        if (!borrador) return;
        const error = (t) => { const c = $('#gaError'); if (c) { c.querySelector('span').innerText = t; c.classList.add('show'); } };
        const titulo = $('#gaTitulo').value.trim();
        const descripcion = $('#gaDesc').value.trim();
        if (titulo.length < 3 || descripcion.length < 10) return error('Revisa el título y la descripción.');

        const boton = e.currentTarget;
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando…';
        try {
            const form = new FormData();
            form.append('titulo', titulo);
            form.append('descripcion', descripcion);
            form.append('tipo', borrador.tipo);
            form.append('nivel', borrador.nivel || 'Bienestar general');
            form.append('duracion', String(borrador.duracion || 0));
            form.append('pasos', $('#gaPasos').value);
            form.append('generadaPor', borrador.generadaPor || 'IA');
            const creada = await sentirApi('/actividades', { method: 'POST', body: form });

            let sugeridas = 0;
            if ($('#gaSugerir') && $('#gaSugerir').checked) {
                for (const st of delGrado) {
                    try {
                        await sentirApi(`/actividades/${creada.id}/sugerir`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ idUsuario: st.idUsuario, nota: `Actividad para el grado ${grupo}.` })
                        });
                        sugeridas += 1;
                    } catch (err) { /* sigue con los demás */ }
                }
            }
            closeSentirModal(overlay);
            showToast({
                title: 'Actividad publicada',
                message: sugeridas ? `"${titulo}" quedó en Recursos y se sugirió a ${sugeridas} estudiante${sugeridas === 1 ? '' : 's'} de ${grupo}.` : `"${titulo}" quedó en los recursos de los estudiantes.`,
                icon: 'fa-spa', type: 'success'
            });
        } catch (err) {
            error(err.message);
            boton.disabled = false;
            boton.innerHTML = '<i class="fa-solid fa-check"></i> Publicar';
        }
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
