document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderAlerts();
    renderRiskCases();
    initRiskChips();
});

const ALERT_STATUS_CLASS = { 'Nueva': '', 'En atención': 'is-attended', 'Resuelta': 'is-resolved' };

function renderAlerts() {
    const alerts = getAlerts();
    const list = document.getElementById('alertsList');

    if (!alerts.length) {
        list.innerHTML = `<div class="alerts-empty"><i class="fa-solid fa-circle-check" style="font-size:20px; color:var(--riesgo-estable); display:block; margin-bottom:8px;"></i>No hay alertas activas en este momento.</div>`;
        document.getElementById('alertsCountBadge').innerText = '0';
        return;
    }

    const activas = alerts.filter(a => a.estado !== 'Resuelta').length;
    document.getElementById('alertsCountBadge').innerText = activas;

    // Ordenar: Nuevas primero, luego En atención, luego Resueltas
    const order = { 'Nueva': 0, 'En atención': 1, 'Resuelta': 2 };
    const sorted = [...alerts].sort((a, b) => order[a.estado] - order[b.estado]);

    list.innerHTML = sorted.map(a => `
        <div class="alert-card ${ALERT_STATUS_CLASS[a.estado]}" data-id="${a.id}" role="group" tabindex="0" aria-label="Alerta de ${a.estudiante}">
            <div class="alert-card-main">
                <span class="alert-pulse-dot"></span>
                <div class="alert-card-info">
                    <h4>${a.estudiante}</h4>
                    <p class="alert-meta">Grado ${a.grado} · ${a.hora}</p>
                    ${renderSignalSourceBadge(a.estudiante, a.source || 'student')}
                    <p class="alert-reason">${a.motivo}</p>
                </div>
            </div>
            <div class="alert-card-actions">
                <span class="alert-status-tag">${a.estado.toUpperCase()}</span>
                ${a.estado !== 'Resuelta' ? `<button class="btn-attend-alert" data-action="attend"><i class="fa-solid fa-hand-holding-heart"></i> Atender Ahora</button>` : ''}
                ${a.estado !== 'Resuelta' ? `<button class="btn-resolve-alert" data-action="resolve">Marcar Resuelta</button>` : ''}
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.alert-card').forEach(card => {
        const id = card.dataset.id;
        const attendBtn = card.querySelector('[data-action="attend"]');
        const resolveBtn = card.querySelector('[data-action="resolve"]');

        if (attendBtn) {
            attendBtn.addEventListener('click', () => {
                updateAlertStatus(id, 'En atención');
                const alertData = getAlerts().find(a => a.id === id);
                openStudentPanel(alertData.estudiante);
            });
        }
        if (resolveBtn) {
            resolveBtn.addEventListener('click', () => {
                updateAlertStatus(id, 'Resuelta');
                showToast({ title: 'Alerta resuelta', message: 'La alerta se marcó como atendida y resuelta.', icon: 'fa-circle-check', type: 'success' });
            });
        }
    });
}

function updateAlertStatus(id, estado) {
    const alerts = getAlerts();
    const alert = alerts.find(a => a.id === id);
    if (alert) alert.estado = estado;
    saveAlerts(alerts);
    renderAlerts();
    initSidebarActiveState(); // refresca el badge de alertas nuevas
}

let currentRiskFilter = 'all';

function renderRiskCases() {
    const students = getStudents().filter(s => s.risk === 'high' || s.risk === 'medium');
    const container = document.getElementById('riskCasesList');
    const filtered = currentRiskFilter === 'all' ? students : students.filter(s => s.risk === currentRiskFilter);

    document.getElementById('riskCountBadge').innerText = filtered.length;

    if (!filtered.length) {
        container.innerHTML = `<p class="alerts-empty">No hay casos que coincidan con este filtro.</p>`;
        return;
    }

    container.innerHTML = filtered.map(s => `
        <div class="student-case-card" data-name="${s.name}" role="button" tabindex="0">
            <div class="card-header">
                <div class="student-profile">
                    <img src="${s.avatar}" alt="${s.name}" class="student-case-avatar">
                    <div><h4>${s.name}</h4><p>Grado: ${s.grade} • ID: ${s.id} • ${s.caseNumber}</p></div>
                </div>
            </div>
            <div class="case-body">
                ${renderSignalSourceBadge(s.name, 'ai')}
                <p class="emotional-state">Estado Emocional: <span class="${s.risk === 'high' ? 'high-risk-text' : 'medium-risk-text'}">${s.moodText}</span></p>
                <p class="detection-reason"><strong>Motivo de seguimiento:</strong> Sentir AI identificó patrones sostenidos que requieren acompañamiento del área de psicología.</p>
            </div>
            <div class="card-footer">
                <span class="badge-risk ${s.risk === 'high' ? 'high' : 'medium'}">${s.risk === 'high' ? 'RIESGO ALTO' : 'RIESGO MEDIO'}</span>
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

function initRiskChips() {
    document.querySelectorAll('#riskChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#riskChips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentRiskFilter = chip.dataset.filter;
            renderRiskCases();
        });
    });
}
