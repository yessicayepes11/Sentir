document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderStudents();
    initFiltersAndSearch();
    initNewStudentModal();
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

function renderStudents() {
    const students = getStudents();
    const grid = document.getElementById('studentsGrid');

    grid.innerHTML = students.map(s => {
        const cfg = RISK_CONFIG[s.risk];
        return `
        <div class="mini-student-card" data-risk="${s.risk}" data-name="${s.name.toLowerCase()}" data-id="${s.id.toLowerCase()}" data-fullname="${s.name}" role="button" tabindex="0">
            <span class="badge-risk ${cfg.badgeClass}">${cfg.label}</span>
            <img src="${s.avatar}" class="mini-avatar" alt="${s.name}">
            <h4>${s.name}</h4>
            <p>Grado: ${s.grade} • ID: ${s.id}</p>
            <span class="mood-pill ${cfg.moodClass}">${s.mood === 'happy' ? '😊' : s.mood === 'neutral' ? '😐' : '😔'} ${s.moodText}</span>
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
    if (!total) return;

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
        const matchesQuery = query === '' || card.dataset.name.includes(query) || card.dataset.id.includes(query);
        const show = matchesRisk && matchesQuery;
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
    document.getElementById('studentsSearch').addEventListener('input', applyFilters);
}

function initNewStudentModal() {
    document.getElementById('addStudentBtn').addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-user-plus"></i></div>
                <div><h3>Registrar Nuevo Estudiante</h3><p>Se sumará al ecosistema emocional de la institución</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-avatar-preview">
                    <img id="newAvatarPreview" src="https://ui-avatars.com/api/?name=Nuevo+Estudiante&background=B8A8FF&color=1E1B4B&bold=true" alt="Vista previa">
                    <span>El avatar se genera automáticamente a partir del nombre y el nivel de riesgo.</span>
                </div>
                <div class="modal-field"><label>NOMBRE COMPLETO</label><input type="text" id="newName" placeholder="Ej. Laura Jiménez Restrepo"></div>
                <div class="modal-field-row">
                    <div class="modal-field"><label>GRADO</label><input type="text" id="newGrade" placeholder="Ej. 10°2"></div>
                    <div class="modal-field"><label>ID ESTUDIANTE</label><input type="text" id="newId" placeholder="Autogenerado"></div>
                </div>
                <div class="modal-field">
                    <label>NIVEL DE RIESGO</label>
                    <div class="risk-select-group" id="newRiskGroup">
                        <div class="risk-option selected" data-risk="stable">Estable</div>
                        <div class="risk-option" data-risk="medium">Medio</div>
                        <div class="risk-option" data-risk="high">Alto</div>
                    </div>
                </div>
                <div class="modal-field"><label>NOTA EMOCIONAL (OPCIONAL)</label><input type="text" id="newMood" placeholder="Ej. Ánimo estable, buena participación"></div>
                <p class="modal-error" id="newError"><i class="fa-solid fa-circle-exclamation"></i> Escribe al menos el nombre y el grado.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="newCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="newConfirm"><i class="fa-solid fa-check"></i> Registrar Estudiante</button>
            </div>
        `);

        let selectedRisk = 'stable';
        const nameInput = overlay.querySelector('#newName');
        const avatarPreview = overlay.querySelector('#newAvatarPreview');

        function refreshPreview() {
            const name = nameInput.value.trim() || 'Nuevo Estudiante';
            avatarPreview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${RISK_CONFIG[selectedRisk].color}&color=fff&bold=true`;
        }
        nameInput.addEventListener('input', refreshPreview);

        overlay.querySelectorAll('.risk-option').forEach(opt => {
            opt.addEventListener('click', () => {
                overlay.querySelectorAll('.risk-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selectedRisk = opt.dataset.risk;
                refreshPreview();
            });
        });

        overlay.querySelector('#newCancel').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#newConfirm').addEventListener('click', () => {
            const name = nameInput.value.trim();
            const grade = overlay.querySelector('#newGrade').value.trim();
            const errorMsg = overlay.querySelector('#newError');
            if (!name || !grade) { errorMsg.classList.add('show'); return; }
            errorMsg.classList.remove('show');

            const idVal = overlay.querySelector('#newId').value.trim() || `#${Math.floor(1000 + Math.random() * 9000)}`;
            const moodVal = overlay.querySelector('#newMood').value.trim() || (selectedRisk === 'high' ? 'Requiere seguimiento cercano' : selectedRisk === 'medium' ? 'En observación' : 'Ánimo estable');
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${RISK_CONFIG[selectedRisk].color}&color=fff&bold=true`;

            const students = getStudents();
            const nextCaseNum = students.length + 1;
            students.unshift({ name, grade, id: idVal, caseNumber: 'CASO-' + String(nextCaseNum).padStart(4, '0'), risk: selectedRisk, mood: selectedRisk === 'high' ? 'sad' : selectedRisk === 'medium' ? 'neutral' : 'happy', moodText: moodVal, avatar });
            saveStudents(students);

            closeSentirModal(overlay);
            renderStudents();
            showToast({ title: 'Estudiante registrado', message: `${name} ya hace parte del ecosistema Sentir.`, icon: 'fa-user-plus', type: 'success' });
        });
    });
}
