/* ==========================================================================
   SENTIR — NÚCLEO COMPARTIDO ENTRE TODOS LOS MÓDULOS
   (Inicio, Estudiantes, Agenda, Alertas, Control de Actividades, Perfil)
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. CONFIGURACIÓN DE LA PSICÓLOGA (editar aquí una sola vez)
   -------------------------------------------------------------------------- */
// ✅ Ya con la foto real de la psicóloga (Sentir/assets/psicologa-avatar.png)
const SENTIR_DEFAULT_PROFILE = {
    name: 'Jannette Cardeño',
    role: 'Psicóloga Escolar',
    licencia: 'Lic. Psicología N.° 45210',
    experiencia: '8 años de experiencia',
    avatar: '../assets/psicologa-avatar.png',
    email: 'jannette.cardeno@sentir.edu.co',
    especialidad: 'Psicología Educativa y Clínica Infanto-Juvenil',
    sedes: 'Sede Principal · Sede Norte',
    horario: 'Lunes a Viernes · 7:00am – 3:00pm'
};

function getPsychProfile() {
    return SentirStore.get('psych_profile', SENTIR_DEFAULT_PROFILE);
}

function setPsychProfile(partialUpdate) {
    const current = getPsychProfile();
    const updated = { ...current, ...partialUpdate };
    SentirStore.set('psych_profile', updated);
    renderHeaderProfile();
    return updated;
}

/* --------------------------------------------------------------------------
   1. ALMACENAMIENTO LOCAL (simula backend mientras se desarrolla la API real)
   -------------------------------------------------------------------------- */
const SentirStore = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem('sentir_' + key);
            if (raw === null) {
                if (fallback !== undefined) this.set(key, fallback);
                return fallback;
            }
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },
    set(key, value) {
        localStorage.setItem('sentir_' + key, JSON.stringify(value));
    }
};

const DEFAULT_STUDENTS = [
    { name: 'Mateo Silva', grade: '11°1', id: '#8841', caseNumber: 'CASO-0001', risk: 'high', mood: 'sad', moodText: 'Ansiedad severa', avatar: 'https://i.pinimg.com/1200x/12/c7/aa/12c7aaba085ad70b996ecb4b25588217.jpg', riskHistory: [{ fecha: addDaysISO(-60), risk: 'medium' }, { fecha: addDaysISO(-25), risk: 'medium' }, { fecha: addDaysISO(0), risk: 'high' }] },
    { name: 'Camila Pérez', grade: '9°4', id: '#3219', caseNumber: 'CASO-0002', risk: 'medium', mood: 'neutral', moodText: 'Tristeza prolongada', avatar: 'https://i.pinimg.com/736x/7e/bc/d4/7ebcd44c2049c791c8c02304bc2ac7ad.jpg', riskHistory: [{ fecha: addDaysISO(-70), risk: 'stable' }, { fecha: addDaysISO(-20), risk: 'medium' }, { fecha: addDaysISO(0), risk: 'medium' }] },
    { name: 'Alejandro Toro Restrepo', grade: '10°3', id: '#4412', caseNumber: 'CASO-0003', risk: 'medium', mood: 'neutral', moodText: 'Estrés por rendimiento', avatar: 'https://i.pinimg.com/736x/e2/c5/a6/e2c5a6fffcfe479e16254a6984244c28.jpg', riskHistory: [{ fecha: addDaysISO(-50), risk: 'stable' }, { fecha: addDaysISO(-15), risk: 'stable' }, { fecha: addDaysISO(0), risk: 'medium' }] },
    { name: 'Carlos Mendoza', grade: '10°3', id: '#5502', caseNumber: 'CASO-0004', risk: 'stable', mood: 'happy', moodText: 'Ánimo estable', avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=65B8FF&color=fff&bold=true', riskHistory: [{ fecha: addDaysISO(-45), risk: 'stable' }, { fecha: addDaysISO(0), risk: 'stable' }] },
    { name: 'Sofía Gómez', grade: '8°2', id: '#2207', caseNumber: 'CASO-0005', risk: 'stable', mood: 'happy', moodText: 'En seguimiento leve', avatar: 'https://ui-avatars.com/api/?name=Sofia+Gomez&background=B8A8FF&color=1E1B4B&bold=true', riskHistory: [{ fecha: addDaysISO(-40), risk: 'medium' }, { fecha: addDaysISO(-10), risk: 'stable' }, { fecha: addDaysISO(0), risk: 'stable' }] },
    { name: 'Valentina Ríos', grade: '7°1', id: '#7791', caseNumber: 'CASO-0006', risk: 'stable', mood: 'happy', moodText: 'Ánimo positivo', avatar: 'https://ui-avatars.com/api/?name=Valentina+Rios&background=6C4DF6&color=fff&bold=true', riskHistory: [{ fecha: addDaysISO(-30), risk: 'stable' }, { fecha: addDaysISO(0), risk: 'stable' }] },
    { name: 'Daniel Ortiz', grade: '11°2', id: '#9034', caseNumber: 'CASO-0007', risk: 'high', mood: 'sad', moodText: 'Aislamiento social', avatar: 'https://ui-avatars.com/api/?name=Daniel+Ortiz&background=EF4444&color=fff&bold=true', riskHistory: [{ fecha: addDaysISO(-55), risk: 'medium' }, { fecha: addDaysISO(-18), risk: 'high' }, { fecha: addDaysISO(0), risk: 'high' }] },
    { name: 'Isabella Castro', grade: '6°3', id: '#1187', caseNumber: 'CASO-0008', risk: 'stable', mood: 'happy', moodText: 'Ánimo estable', avatar: 'https://ui-avatars.com/api/?name=Isabella+Castro&background=22C55E&color=fff&bold=true', riskHistory: [{ fecha: addDaysISO(-90), risk: 'high' }, { fecha: addDaysISO(-40), risk: 'medium' }, { fecha: addDaysISO(0), risk: 'stable' }] },
    { name: 'Juan Pablo Díaz', grade: '9°1', id: '#6650', caseNumber: 'CASO-0009', risk: 'medium', mood: 'neutral', moodText: 'Baja concentración', avatar: 'https://ui-avatars.com/api/?name=Juan+Diaz&background=F59E0B&color=1E1B4B&bold=true', riskHistory: [{ fecha: addDaysISO(-35), risk: 'stable' }, { fecha: addDaysISO(0), risk: 'medium' }] }
];

const DEFAULT_ALERTS = [
    { id: 'al1', estudiante: 'Mateo Silva', grado: '11°1', hora: 'Hoy · 10:05 a.m.', motivo: 'Activó el botón de emergencia: dice sentirse muy mal y no quiere estar solo.', estado: 'Nueva' },
    { id: 'al2', estudiante: 'Daniel Ortiz', grado: '11°2', hora: 'Hoy · 08:40 a.m.', motivo: 'Activó el botón de emergencia por un conflicto grave con compañeros (posible caso de bullying).', estado: 'En atención' }
];

const DEFAULT_INTERVENTIONS = {
    'Mateo Silva': [
        { fecha: '10 Jun 2026', titulo: 'Intervención por riesgo alto', detalle: 'Se identificó ansiedad severa y aislamiento social. Se activó protocolo de acompañamiento y se contactó al acudiente.' },
        { fecha: '2 Mar 2026', titulo: 'Seguimiento académico', detalle: 'Reporte docente por bajo rendimiento asociado a estrés. Se brindaron pautas de manejo del tiempo.' }
    ],
    'Isabella Castro': [
        { fecha: '22 Jul 2026', titulo: 'Caso de alto riesgo anterior', detalle: 'Episodio de aislamiento social prolongado. Acompañamiento semanal durante 6 semanas con evolución positiva.' }
    ],
    'Camila Pérez': [
        { fecha: '15 Ago 2026', titulo: 'Seguimiento de tristeza prolongada', detalle: 'Caída sostenida del ánimo durante 7 días. Se citó a sesión individual con seguimiento quincenal.' }
    ]
};

const DEFAULT_GUARDIANS = {
    'Mateo Silva': [
        { nombre: 'Marcela Silva', parentesco: 'Madre', telefono: '+57 300 123 4567', correo: 'marcela.silva@gmail.com', principal: true },
        { nombre: 'Andrés Silva', parentesco: 'Padre (alternativo)', telefono: '+57 301 987 6543', correo: 'andres.silva@gmail.com', principal: false }
    ],
    'Camila Pérez': [
        { nombre: 'Diana Pérez', parentesco: 'Madre', telefono: '+57 312 456 7890', correo: 'diana.perez@gmail.com', principal: true }
    ],
    'Alejandro Toro Restrepo': [
        { nombre: 'Luz Toro', parentesco: 'Madre', telefono: '+57 315 222 3344', correo: 'luz.toro@gmail.com', principal: true },
        { nombre: 'Colegio · Coordinación', parentesco: 'Contacto institucional (alternativo)', telefono: '+57 4 444 5566', correo: 'coordinacion@sentir.edu.co', principal: false }
    ],
    'Daniel Ortiz': [
        { nombre: 'Familia Ortiz', parentesco: 'Acudiente principal', telefono: '+57 300 555 1122', correo: 'familia.ortiz@gmail.com', principal: true }
    ]
};

function todayISO() { return new Date().toISOString().split('T')[0]; }
function addDaysISO(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; }

const DEFAULT_AGENDA = [
    { id: 'ag1', fecha: todayISO(), titulo: 'Sesión Individual', hora: '09:30', nombre: 'Carlos Mendoza', grado: '10°3', descripcion: 'Seguimiento del proceso de adaptación académica.' },
    { id: 'ag2', fecha: todayISO(), titulo: 'Seguimiento de Caso', hora: '11:00', nombre: 'Sofía Gómez', grado: '8°2', descripcion: 'Revisión de avances tras el taller de autoestima.' },
    { id: 'ag3', fecha: todayISO(), titulo: 'Reunión de Acudientes', hora: '14:30', nombre: 'Mateo Silva', grado: '11°1', descripcion: 'Reunión con acudiente por caso de riesgo alto activo.' },
    { id: 'ag4', fecha: addDaysISO(1), titulo: 'Taller Grupal', hora: '08:00', nombre: 'Grupo 11°1', grado: '11°1', descripcion: 'Taller de manejo del tiempo y respiración diafragmática.' }
];

const DEFAULT_ACTIVITIES = [
    { id: 'act1', titulo: 'Respiración 4-7-8', tipo: 'Respiración', fecha: addDaysISO(-10), nivel: 'Todos', descripcion: 'Técnica de respiración para reducir la ansiedad en momentos de crisis: inhalar 4s, sostener 7s, exhalar 8s.' },
    { id: 'act2', titulo: 'Meditación guiada', tipo: 'Mindfulness', fecha: addDaysISO(-7), nivel: 'Riesgo medio', descripcion: 'Meditación de atención plena para manejar el estrés académico antes de evaluaciones.' },
    { id: 'act3', titulo: 'Diario emocional', tipo: 'Escritura terapéutica', fecha: addDaysISO(-5), nivel: 'Todos', descripcion: 'Espacio de escritura libre para identificar y procesar las emociones del día.' },
    { id: 'act4', titulo: 'Caminata consciente', tipo: 'Movimiento', fecha: addDaysISO(-2), nivel: 'Riesgo alto', descripcion: 'Actividad física suave y guiada para liberar tensión y mejorar el estado de ánimo.' }
];

function getStudents() { return SentirStore.get('students', DEFAULT_STUDENTS); }
function saveStudents(list) { SentirStore.set('students', list); }
function getAlerts() { return SentirStore.get('alerts', DEFAULT_ALERTS); }
function saveAlerts(list) { SentirStore.set('alerts', list); }
function getInterventions() { return SentirStore.get('interventions', DEFAULT_INTERVENTIONS); }
function saveInterventions(obj) { SentirStore.set('interventions', obj); }
function getGuardians() { return SentirStore.get('guardians', DEFAULT_GUARDIANS); }
function getAgenda() { return SentirStore.get('agenda', DEFAULT_AGENDA); }
function saveAgenda(list) { SentirStore.set('agenda', list); }
function getActivities() { return SentirStore.get('activities', DEFAULT_ACTIVITIES); }
function saveActivities(list) { SentirStore.set('activities', list); }

function getStudentHistory(name) {
    const all = getInterventions();
    return all[name] || [];
}
function addInterventionRecord(name, record) {
    const all = getInterventions();
    if (!all[name]) all[name] = [];
    all[name].unshift(record);
    saveInterventions(all);
}
function getGuardianContacts(name) {
    const all = getGuardians();
    return all[name] || [{ nombre: 'Acudiente registrado', parentesco: 'Contacto principal', telefono: '+57 300 000 0000', correo: 'acudiente@correo.com', principal: true }];
}

/* --------------------------------------------------------------------------
   2. TOASTS
   -------------------------------------------------------------------------- */
function getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast({ title, message, icon = 'fa-circle-check', type = 'success' }) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `sentir-toast ${type}`;
    toast.innerHTML = `
        <div class="sentir-toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="sentir-toast-text"><strong>${title}</strong>${message ? `<p>${message}</p>` : ''}</div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3600);
}

/* --------------------------------------------------------------------------
   3. MODAL GENÉRICO
   -------------------------------------------------------------------------- */
function openSentirModal(innerHTML) {
    const overlay = document.createElement('div');
    overlay.className = 'sentir-modal-overlay';
    overlay.innerHTML = `<div class="sentir-modal-box">${innerHTML}</div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSentirModal(overlay); });
    return overlay;
}
function closeSentirModal(overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
}

/* --------------------------------------------------------------------------
   4. HEADER, SIDEBAR, NOTIFICACIONES, PERFIL DEL MENÚ
   -------------------------------------------------------------------------- */
function renderHeaderProfile() {
    const profile = getPsychProfile();
    document.querySelectorAll('[data-role="header-avatar"]').forEach(el => el.src = profile.avatar);
    document.querySelectorAll('[data-role="header-name"]').forEach(el => el.innerText = profile.name.split(' ').slice(0, 2).join(' '));
    document.querySelectorAll('[data-role="header-role"]').forEach(el => el.innerText = profile.role);
}

function initLogoHome() {
    document.querySelectorAll('[data-logo-home]').forEach(logo => {
        logo.addEventListener('click', () => { window.location.href = logo.dataset.logoHome; });
    });
}

function initSidebarActiveState() {
    const currentPage = document.body.dataset.page;
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.classList.toggle('active', item.dataset.view === currentPage);
    });

    // Reflejar el número de alertas "Nuevas" en el badge del menú
    const alertBadge = document.getElementById('navAlertBadge');
    if (alertBadge) {
        const nuevas = getAlerts().filter(a => a.estado === 'Nueva').length;
        if (nuevas > 0) {
            alertBadge.innerText = nuevas;
            alertBadge.style.display = 'flex';
        } else {
            alertBadge.style.display = 'none';
        }
    }
}

function initNotificationDropdown() {
    const bell = document.getElementById('notifBell');
    const dropdown = document.getElementById('notifDropdown');
    if (!bell || !dropdown) return;

    const badge = bell.querySelector('.badge');
    const alertas = getAlerts().filter(a => a.estado === 'Nueva');

    dropdown.innerHTML = `<div class="notif-header">Alertas Recientes</div>` + (
        alertas.length
            ? alertas.map(a => `<div class="notif-item is-urgent" data-goto="alertas.html">🚨 ${a.estudiante} requiere atención inmediata</div>`).join('')
            : `<div class="notif-item">✅ No hay alertas nuevas por ahora</div>`
    ) + `<div class="notif-item" data-goto="agenda.html">📅 Revisa tu agenda de hoy</div>`;

    if (badge) badge.style.display = alertas.length ? 'flex' : 'none';

    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        bell.style.transform = 'scale(1.15)';
        setTimeout(() => bell.style.transform = 'scale(1)', 180);
    });

    dropdown.querySelectorAll('.notif-item[data-goto]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = resolveModulePath(item.dataset.goto);
        });
    });

    document.addEventListener('click', (e) => { if (!bell.contains(e.target)) dropdown.classList.remove('show'); });
}

// Todas las páginas están a un nivel de profundidad (ej. /agenda/Agenda.html), así que
// para ir a otro módulo simplemente subimos un nivel y entramos a la carpeta destino.
function resolveModulePath(target) {
    const map = {
        'inicio.html': '../home/Home.html',
        'estudiantes.html': '../students/Students.html',
        'agenda.html': '../agenda/Agenda.html',
        'alertas.html': '../alerts/Alerts.html',
        'actividades.html': '../activities/Activities.html',
        'perfil.html': '../profile/Profile.html'
    };
    return map[target] || target;
}

function initPsychologistProfileMenu() {
    const profileContainer = document.querySelector('.profile-info');
    if (!profileContainer) return;

    profileContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const existing = document.getElementById('profileDropdownMenu');
        if (existing) { existing.remove(); return; }

        const dropdown = document.createElement('div');
        dropdown.id = 'profileDropdownMenu';
        dropdown.style.cssText = `
            position: absolute; top: 75px; right: 30px; width: 220px; background: white; border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; overflow: hidden; z-index: 1500;
            animation: fadeIn 0.2s ease forwards;
        `;
        dropdown.innerHTML = `
            <div style="padding:12px 16px; font-size:11px; font-weight:700; color:var(--text-muted); background:var(--bg-light);">SESIÓN ACTIVA</div>
            <div class="p-item" data-action="perfil" style="padding:12px 16px; font-size:12px; border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-id-card" style="margin-right:10px; color:var(--morado-sentir)"></i> Mi Licencia Profesional</div>
            <div class="p-item" data-action="turnos" style="padding:12px 16px; font-size:12px; border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-clock-rotate-left" style="margin-right:10px; color:var(--morado-sentir)"></i> Historial de Turnos</div>
            <div class="p-item" data-action="salir" style="padding:12px 16px; font-size:12px; color:var(--riesgo-alto); cursor:pointer;"><i class="fa-solid fa-right-from-bracket" style="margin-right:10px;"></i> Cerrar Sesión</div>
        `;
        document.body.appendChild(dropdown);

        dropdown.querySelectorAll('.p-item').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = '#F8FAFC');
            item.addEventListener('mouseleave', () => item.style.background = 'transparent');
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action === 'perfil') window.location.href = resolveModulePath('perfil.html');
                else if (action === 'turnos') openShiftHistoryModal();
                else if (action === 'salir') showToast({ title: 'Sesión cerrada', message: 'Saliste de forma segura del sistema Sentir.', icon: 'fa-right-from-bracket', type: 'info' });
                dropdown.remove();
            });
        });

        document.addEventListener('click', () => dropdown.remove(), { once: true });
    });
}

function openShiftHistoryModal() {
    const turnos = [
        { hora: '09:30', estudiante: 'Carlos Mendoza', tipo: 'Sesión Individual', estado: 'done' },
        { hora: '11:00', estudiante: 'Sofía Gómez', tipo: 'Seguimiento de Caso', estado: 'done' },
        { hora: '13:15', estudiante: 'Valentina Ríos', tipo: 'Consulta Breve', estado: 'done' },
        { hora: '14:30', estudiante: 'Mateo Silva', tipo: 'Reunión de Acudientes', estado: 'progress' }
    ];

    const done = turnos.filter(t => t.estado === 'done').length;
    const students = getStudents().map(s => s.name);

    const listHTML = turnos.map(t => `
        <div class="shift-entry ${t.estado} ${students.includes(t.estudiante) ? 'clickable' : ''}" data-student="${t.estudiante}">
            <div class="shift-time">${t.hora}</div>
            <div class="shift-entry-info"><strong>${t.estudiante}</strong><p>${t.tipo}</p></div>
            <span class="shift-status ${t.estado}">${t.estado === 'done' ? '<i class="fa-solid fa-circle-check"></i> Atendida' : '<i class="fa-solid fa-clock"></i> En curso'}</span>
        </div>
    `).join('');

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <div><h3>Historial de Turnos de Hoy</h3><p>Sesiones atendidas y en curso en la jornada actual</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="shift-summary">
                <div class="shift-summary-bar"><div class="shift-summary-fill" style="width:${(done / turnos.length) * 100}%;"></div></div>
                <span>${done} de ${turnos.length} sesiones atendidas hoy</span>
            </div>
            <div class="shift-list">${listHTML}</div>
        </div>
        <div class="sentir-modal-actions"><button class="modal-btn-cancel" id="closeShiftModal">Cerrar</button></div>
    `);
    overlay.querySelector('#closeShiftModal').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelectorAll('.shift-entry.clickable').forEach(entry => {
        entry.addEventListener('click', () => {
            const studentName = entry.dataset.student;
            closeSentirModal(overlay);
            goToStudentExpediente(studentName);
        });
    });
}

// Navega al módulo Estudiantes y abre automáticamente el expediente del estudiante indicado
function goToStudentExpediente(studentName) {
    window.location.href = resolveModulePath('estudiantes.html') + '?open=' + encodeURIComponent(studentName);
}

function initMobileSidebar() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const container = document.querySelector('.dashboard-container');
    const sidebar = document.querySelector('.sidebar');
    if (!toggleBtn || !sidebar || !container) return;

    const MOBILE_BREAKPOINT = 900;
    const STORAGE_KEY = 'sentir_sidebar_collapsed';
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    // Telón de fondo para el modo "menú lateral" en móvil (se crea una sola vez)
    let backdrop = document.querySelector('.mobile-sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-sidebar-backdrop';
        document.body.appendChild(backdrop);
    }

    // En escritorio, "toggled" = sidebar oculto. En móvil, "toggled" = sidebar abierto como menú lateral.
    function setToggled(toggled) {
        container.classList.toggle('sidebar-toggled', toggled);
        backdrop.classList.toggle('show', toggled && isMobile());
        if (!isMobile()) {
            try { localStorage.setItem(STORAGE_KEY, toggled ? '1' : '0'); } catch (e) { /* almacenamiento no disponible */ }
        }
    }

    // Estado inicial: en escritorio se respeta la preferencia guardada; en móvil siempre arranca oculto.
    let initialToggled = false;
    if (!isMobile()) {
        try { initialToggled = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { /* ignorar */ }
    }
    setToggled(initialToggled);

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setToggled(!container.classList.contains('sidebar-toggled'));
    });

    backdrop.addEventListener('click', () => setToggled(false));

    document.addEventListener('click', (e) => {
        if (isMobile() && container.classList.contains('sidebar-toggled') &&
            !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            setToggled(false);
        }
    });

    window.addEventListener('resize', () => {
        backdrop.classList.toggle('show', isMobile() && container.classList.contains('sidebar-toggled'));
    });
}

/* --------------------------------------------------------------------------
   5. PANEL DESLIZANTE DE EXPEDIENTE (usado en Inicio, Estudiantes y Alertas)
   -------------------------------------------------------------------------- */
function openStudentPanel(name) {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');
    if (!panel || !overlay) return;

    const students = getStudents();
    const student = students.find(s => s.name === name);

    document.getElementById('panelName').innerText = name;
    document.getElementById('panelMeta').innerText = student ? `Grado: ${student.grade} • ID: ${student.id} • ${student.caseNumber || 'Sin N.° de caso'}` : '';
    document.getElementById('panelAvatar').src = student ? student.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
    panel.dataset.currentStudent = name;

    renderRiskTimeline(student);

    document.body.style.overflow = 'hidden';
    overlay.classList.add('show');
    panel.classList.add('open');
}

const RISK_LABELS = { high: 'Alto', medium: 'Medio', stable: 'Estable' };
const RISK_DOT_COLOR = { high: 'var(--riesgo-alto)', medium: 'var(--riesgo-medio)', stable: 'var(--riesgo-estable)' };

function renderRiskTimeline(student) {
    const container = document.getElementById('panelRiskTimeline');
    if (!container) return;

    if (!student || !student.riskHistory || !student.riskHistory.length) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';

    // El último punto SIEMPRE refleja el riesgo actual real del estudiante (nunca queda desactualizado)
    const history = student.riskHistory.slice(0, -1);
    const points = [...history, { fecha: todayISO(), risk: student.risk }];

    const stepsHTML = points.map((p, i) => {
        const isLast = i === points.length - 1;
        const dateLabel = isLast ? 'Hoy' : 'Hace ' + daysAgoLabel(p.fecha);
        return `
        <div class="risk-timeline-step">
            <div class="risk-timeline-dot" style="background:${RISK_DOT_COLOR[p.risk]}"></div>
            <span class="risk-timeline-label">${RISK_LABELS[p.risk]}</span>
            <span class="risk-timeline-date">${dateLabel}</span>
        </div>`;
    }).join('<div class="risk-timeline-line"></div>');

    container.innerHTML = `
        <h3 style="margin-bottom:10px;"><i class="fa-solid fa-chart-line"></i> Evolución de Riesgo</h3>
        <div class="risk-timeline">${stepsHTML}</div>
    `;
}

function daysAgoLabel(fechaISO) {
    const diffDays = Math.round((new Date(todayISO()) - new Date(fechaISO)) / 86400000);
    if (diffDays <= 0) return 'hoy';
    if (diffDays < 30) return `${diffDays}d`;
    const months = Math.round(diffDays / 30);
    return `${months} mes${months > 1 ? 'es' : ''}`;
}

function closePanel() {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function initStudentPanelActions() {
    const panel = document.getElementById('detailPanel');
    if (!panel) return;

    function currentName() { return panel.dataset.currentStudent || document.getElementById('panelName').innerText; }

    const registerBtn = document.getElementById('registerInterventionBtn');
    const historyBtn = document.getElementById('viewInterventionHistoryBtn');
    const contactBtn = document.getElementById('panelContactBtn');
    const deriveBtn = document.getElementById('panelDeriveBtn');
    const printBtn = document.getElementById('printPanelBtn');

    if (registerBtn) registerBtn.addEventListener('click', () => openRegisterInterventionModal(currentName()));
    if (historyBtn) historyBtn.addEventListener('click', () => openInterventionHistoryModal(currentName()));
    if (contactBtn) contactBtn.addEventListener('click', () => openContactGuardianModal(currentName()));
    if (deriveBtn) deriveBtn.addEventListener('click', () => openMedicalReferralModal(currentName()));
    if (printBtn) printBtn.addEventListener('click', () => printStudentExpediente(currentName()));
}

/* --------------------------------------------------------------------------
   EXPORTAR / IMPRIMIR EXPEDIENTE EN PDF (vía diálogo de impresión del navegador)
   -------------------------------------------------------------------------- */
function printStudentExpediente(name) {
    const student = getStudents().find(s => s.name === name);
    const history = getStudentHistory(name);
    const contacts = getGuardianContacts(name);
    const profile = getPsychProfile();

    const historyHTML = history.length
        ? history.map(h => `<div class="pe-entry"><strong>${h.titulo}</strong> <span>${h.fecha}</span><p>${h.detalle}</p></div>`).join('')
        : '<p>Sin intervenciones registradas.</p>';

    const contactsHTML = contacts.map(c => `<div class="pe-entry"><strong>${c.nombre}</strong> (${c.parentesco}) — ${c.telefono}${c.correo ? ' · ' + c.correo : ''}</div>`).join('');

    const riskHTML = (student && student.riskHistory)
        ? student.riskHistory.map(p => `${RISK_LABELS[p.risk]} (${p.fecha})`).join(' → ')
        : 'Sin historial de riesgo registrado.';

    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>Expediente · ${name}</title>
        <style>
            body { font-family: Arial, sans-serif; color: #1E1B4B; padding: 40px; max-width: 720px; margin: auto; }
            h1 { font-size: 20px; margin-bottom: 2px; }
            .pe-sub { color: #64748B; font-size: 12px; margin-bottom: 24px; }
            h2 { font-size: 14px; border-bottom: 2px solid #6C4DF6; padding-bottom: 6px; margin-top: 26px; color: #4E2FC7; }
            .pe-entry { margin-bottom: 10px; font-size: 12.5px; }
            .pe-entry span { color: #64748B; font-size: 11px; margin-left: 6px; }
            .pe-entry p { margin-top: 3px; color: #334155; }
            .pe-footer { margin-top: 40px; font-size: 10.5px; color: #94A3B8; }
        </style></head>
        <body>
            <h1>Expediente Psicológico — ${name}</h1>
            <p class="pe-sub">${student ? `Grado: ${student.grade} · ID: ${student.id} · ${student.caseNumber}` : ''} · Generado por ${profile.name}, ${profile.role}</p>
            <h2>Evolución de Riesgo</h2>
            <p style="font-size:12.5px;">${riskHTML}</p>
            <h2>Contactos de Acudientes</h2>
            ${contactsHTML}
            <h2>Historial de Intervenciones</h2>
            ${historyHTML}
            <p class="pe-footer">Documento generado por SENTIR el ${new Date().toLocaleDateString('es-CO')}. Uso confidencial exclusivo del área de psicología.</p>
        </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

function openInterventionHistoryModal(studentName) {
    const history = getStudentHistory(studentName);
    const listHTML = history.length
        ? history.map(item => `
            <div class="history-entry">
                <div class="history-entry-dot"></div>
                <div class="history-entry-content">
                    <div class="history-entry-top"><strong>${item.titulo}</strong><span>${item.fecha}</span></div>
                    <p>${item.detalle}</p>
                </div>
            </div>`).join('')
        : `<p class="history-empty"><i class="fa-solid fa-folder-open" style="display:block; font-size:20px; margin-bottom:8px; color:var(--lavanda);"></i>Este estudiante aún no registra intervenciones previas.</p>`;

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <div><h3>Historial de Intervenciones</h3><p>${studentName} · Proceso de acompañamiento psicológico</p></div>
        </div>
        <div class="sentir-modal-body"><div class="history-timeline">${listHTML}</div></div>
        <div class="sentir-modal-actions"><button class="modal-btn-cancel" id="closeHistoryModal">Cerrar</button></div>
    `);
    overlay.querySelector('#closeHistoryModal').addEventListener('click', () => closeSentirModal(overlay));
}

function openRegisterInterventionModal(studentName) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-notes-medical"></i></div>
            <div><h3>Registrar Intervención</h3><p>${studentName} · Se sumará al historial de acompañamiento</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>FECHA</label><input type="date" id="ivDate" value="${todayISO()}"></div>
            <div class="modal-field"><label>FACTORES IDENTIFICADOS</label><textarea id="ivFactors" rows="2" placeholder="Ej. Ansiedad, aislamiento social..."></textarea></div>
            <div class="modal-field"><label>SITUACIÓN</label><textarea id="ivSituation" rows="2" placeholder="Describe la situación actual"></textarea></div>
            <div class="modal-field"><label>CAUSAS IDENTIFICADAS</label><textarea id="ivCauses" rows="2" placeholder="Posibles causas asociadas"></textarea></div>
            <div class="modal-field"><label>PROCESO REALIZADO</label><textarea id="ivProcess" rows="2" placeholder="Acciones y estrategias aplicadas"></textarea></div>
            <div class="modal-field"><label>AVANCE / EVOLUCIÓN</label><textarea id="ivProgress" rows="2" placeholder="Evolución observada"></textarea></div>
            <p class="modal-error" id="ivError"><i class="fa-solid fa-circle-exclamation"></i> Describe al menos la situación y el proceso realizado.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="ivCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="ivConfirm"><i class="fa-solid fa-check"></i> Guardar Intervención</button>
        </div>
    `);

    overlay.querySelector('#ivCancel').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#ivConfirm').addEventListener('click', () => {
        const situation = overlay.querySelector('#ivSituation').value.trim();
        const process = overlay.querySelector('#ivProcess').value.trim();
        const errorMsg = overlay.querySelector('#ivError');
        if (!situation || !process) { errorMsg.classList.add('show'); return; }
        errorMsg.classList.remove('show');

        const factors = overlay.querySelector('#ivFactors').value.trim();
        const causes = overlay.querySelector('#ivCauses').value.trim();
        const progress = overlay.querySelector('#ivProgress').value.trim();
        const dateValue = overlay.querySelector('#ivDate').value;
        const formattedDate = dateValue ? new Date(dateValue + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha';

        const parts = [];
        if (factors) parts.push(`Factores: ${factors}.`);
        parts.push(`Situación: ${situation}.`);
        if (causes) parts.push(`Causas: ${causes}.`);
        parts.push(`Proceso realizado: ${process}.`);
        if (progress) parts.push(`Avance: ${progress}.`);

        addInterventionRecord(studentName, { fecha: formattedDate, titulo: 'Intervención registrada', detalle: parts.join(' ') });
        closeSentirModal(overlay);
        showToast({ title: 'Intervención registrada', message: `Se guardó el registro en el historial de ${studentName}.`, icon: 'fa-notes-medical', type: 'success' });
    });
}

function openContactGuardianModal(studentName) {
    const contacts = getGuardianContacts(studentName);
    const listHTML = contacts.map(c => `
        <div class="contact-entry ${c.principal ? 'is-principal' : ''}">
            <div class="contact-entry-info">
                <strong>${c.nombre}${c.principal ? '<span class="contact-principal-tag">CONFIANZA</span>' : '<span class="contact-alt-tag">ALTERNATIVO</span>'}</strong>
                <span>${c.parentesco}</span>
                ${c.correo ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.correo)}" target="_blank" rel="noopener" class="contact-email-link"><i class="fa-solid fa-envelope"></i> ${c.correo}</a>` : ''}
            </div>
            <span class="contact-phone-display"><i class="fa-solid fa-phone"></i> ${c.telefono}</span>
        </div>
    `).join('');

    const hasAlternate = contacts.some(c => !c.principal);

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon" style="background:#FEF2F2; color:var(--riesgo-alto);"><i class="fa-solid fa-phone"></i></div>
            <div><h3>Contactar Acudiente</h3><p>${studentName} · Números disponibles para contacto inmediato</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="contact-list" id="contactListBody">${listHTML}</div>
            ${!hasAlternate ? `<button class="btn-secondary" id="addAltContactBtn" style="width:100%;"><i class="fa-solid fa-user-plus"></i> Agregar contacto alternativo (opcional)</button>` : ''}
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeContactModal">Cerrar</button>
            <button class="modal-btn-confirm" id="confirmContactLogged"><i class="fa-solid fa-check"></i> Registrar como Contactado</button>
        </div>
    `);

    overlay.querySelector('#closeContactModal').addEventListener('click', () => closeSentirModal(overlay));

    const addAltBtn = overlay.querySelector('#addAltContactBtn');
    if (addAltBtn) {
        addAltBtn.addEventListener('click', () => {
            const formHTML = `
                <div class="contact-entry" id="newAltContactForm" style="flex-direction:column; align-items:stretch; gap:10px;">
                    <div class="modal-field"><label>NOMBRE DEL CONTACTO ALTERNATIVO</label><input type="text" id="altName" placeholder="Ej. Tío, vecino de confianza..."></div>
                    <div class="modal-field-row">
                        <div class="modal-field"><label>PARENTESCO</label><input type="text" id="altRelation" placeholder="Ej. Tío"></div>
                        <div class="modal-field"><label>TELÉFONO</label><input type="text" id="altPhone" placeholder="+57 300 000 0000"></div>
                    </div>
                    <div class="modal-field"><label>CORREO (OPCIONAL)</label><input type="email" id="altEmail" placeholder="correo@ejemplo.com"></div>
                    <button class="modal-btn-confirm" id="saveAltContact" style="align-self:flex-end;"><i class="fa-solid fa-check"></i> Guardar Contacto</button>
                </div>`;
            addAltBtn.insertAdjacentHTML('beforebegin', formHTML);
            addAltBtn.remove();

            overlay.querySelector('#saveAltContact').addEventListener('click', () => {
                const nombre = overlay.querySelector('#altName').value.trim();
                const telefono = overlay.querySelector('#altPhone').value.trim();
                if (!nombre || !telefono) {
                    showToast({ title: 'Faltan datos', message: 'Escribe al menos el nombre y el teléfono del contacto.', icon: 'fa-circle-exclamation', type: 'info' });
                    return;
                }
                const all = getGuardians();
                if (!all[studentName]) all[studentName] = getGuardianContacts(studentName);
                all[studentName].push({
                    nombre, parentesco: (overlay.querySelector('#altRelation').value.trim() || 'Contacto alternativo') + ' (alternativo)',
                    telefono, correo: overlay.querySelector('#altEmail').value.trim(), principal: false
                });
                SentirStore.set('guardians', all);
                closeSentirModal(overlay);
                showToast({ title: 'Contacto alternativo agregado', message: `${nombre} ya queda disponible para ${studentName}.`, icon: 'fa-user-plus', type: 'success' });
            });
        });
    }

    overlay.querySelector('#confirmContactLogged').addEventListener('click', () => {
        addInterventionRecord(studentName, {
            fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            titulo: 'Acudiente contactado',
            detalle: 'Se estableció contacto telefónico con el acudiente para informar sobre la situación del estudiante.'
        });
        closeSentirModal(overlay);
        showToast({ title: 'Contacto registrado', message: `Se dejó constancia del contacto con el acudiente de ${studentName}.`, icon: 'fa-phone', type: 'success' });
    });
}

function openMedicalReferralModal(studentName) {
    const networks = [
        { nombre: 'EPS Sura - Salud Mental', tipo: 'Red asegurada', contacto: '018000 51 15 15' },
        { nombre: 'Centro de Salud Mental Comunitario', tipo: 'Atención especializada', contacto: 'Coordinar con Coordinación Académica' },
        { nombre: 'Línea Amiga 106', tipo: 'Línea de apoyo emocional 24/7', contacto: '106' }
    ];
    const listHTML = networks.map(n => `
        <label class="referral-option">
            <input type="radio" name="referralNetwork" value="${n.nombre}">
            <div><strong>${n.nombre}</strong><span>${n.tipo} · ${n.contacto}</span></div>
        </label>
    `).join('');

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-house-medical"></i></div>
            <div><h3>Derivar a Red de Apoyo Médica</h3><p>${studentName} · Selecciona la red externa a la que se remitirá el caso</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="referral-list">${listHTML}</div>
            <div class="modal-field"><label>FECHA DE LA DERIVACIÓN</label><input type="date" id="referralDate" value="${todayISO()}"></div>
            <div class="modal-field"><label>MOTIVO (OPCIONAL)</label><textarea id="referralNote" rows="2" placeholder="Motivo y contexto de la derivación..."></textarea></div>
            <p class="modal-error" id="referralError"><i class="fa-solid fa-circle-exclamation"></i> Selecciona una red de apoyo antes de confirmar.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelReferral">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmReferral"><i class="fa-solid fa-paper-plane"></i> Confirmar Derivación</button>
        </div>
    `);

    overlay.querySelector('#cancelReferral').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#confirmReferral').addEventListener('click', () => {
        const selected = overlay.querySelector('input[name="referralNetwork"]:checked');
        const errorMsg = overlay.querySelector('#referralError');
        if (!selected) { errorMsg.classList.add('show'); return; }
        errorMsg.classList.remove('show');

        const note = overlay.querySelector('#referralNote').value.trim();
        const dateVal = overlay.querySelector('#referralDate').value || todayISO();
        const formattedDate = new Date(dateVal + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
        addInterventionRecord(studentName, {
            fecha: formattedDate,
            titulo: 'Derivación a red de apoyo médica',
            detalle: `Se derivó el caso a ${selected.value}.${note ? ' Motivo: ' + note : ''}`
        });
        closeSentirModal(overlay);
        showToast({ title: 'Derivación confirmada', message: `${studentName} fue remitido a ${selected.value}.`, icon: 'fa-house-medical', type: 'success' });
    });
}

/* --------------------------------------------------------------------------
   COLOR/ÍCONO POR TIPO DE CITA (deducido del título, usado en Inicio y Agenda)
   -------------------------------------------------------------------------- */
const APPOINTMENT_TYPE_RULES = [
    { keywords: ['acudiente'], label: 'Reunión con Acudiente', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: 'fa-user-group' },
    { keywords: ['docente', 'profesor'], label: 'Reunión con Docente', color: '#DB2777', bg: 'rgba(219,39,119,0.12)', icon: 'fa-chalkboard-user' },
    { keywords: ['taller'], label: 'Taller Grupal', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: 'fa-people-group' },
    { keywords: ['seguimiento'], label: 'Seguimiento', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', icon: 'fa-chart-line' },
    { keywords: ['orientación', 'orientacion', 'vocacional'], label: 'Orientación Vocacional', color: '#0284C7', bg: 'rgba(2,132,199,0.12)', icon: 'fa-compass' },
    { keywords: ['consulta'], label: 'Consulta Breve', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'fa-comment-medical' },
    { keywords: ['individual', 'terapia'], label: 'Sesión Individual', color: '#6C4DF6', bg: 'rgba(108,77,246,0.12)', icon: 'fa-user' }
];
const DEFAULT_APPOINTMENT_TYPE = { label: 'Cita', color: '#64748B', bg: 'rgba(100,116,139,0.12)', icon: 'fa-calendar-day' };

function getAppointmentColor(titulo) {
    const t = (titulo || '').toLowerCase();
    const match = APPOINTMENT_TYPE_RULES.find(rule => rule.keywords.some(k => t.includes(k)));
    const found = match || DEFAULT_APPOINTMENT_TYPE;
    return { solid: found.color, bg: found.bg, icon: found.icon, label: found.label };
}

/* --------------------------------------------------------------------------
   6. NOTIFICACIONES REALES DEL NAVEGADOR PARA ALERTAS NUEVAS
   -------------------------------------------------------------------------- */
function playAlertSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [880, 660].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.18);
            osc.stop(ctx.currentTime + i * 0.18 + 0.3);
        });
    } catch (e) { /* Web Audio no disponible: se omite el sonido silenciosamente */ }
}

function requestBrowserNotificationPermission() {
    if (!('Notification' in window)) {
        showToast({ title: 'No disponible', message: 'Tu navegador no soporta notificaciones del sistema.', icon: 'fa-circle-exclamation', type: 'info' });
        return;
    }
    Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
            showToast({ title: 'Notificaciones activadas', message: 'Recibirás avisos del navegador cuando llegue una alerta nueva.', icon: 'fa-bell', type: 'success' });
        } else {
            showToast({ title: 'Notificaciones no activadas', message: 'Puedes activarlas más tarde desde los permisos del sitio en tu navegador.', icon: 'fa-bell-slash', type: 'info' });
        }
    });
}

function checkForNewAlerts() {
    const seen = SentirStore.get('seen_alert_ids', []);
    const alerts = getAlerts();
    const activos = alerts.filter(a => a.estado !== 'Resuelta');
    const nuevos = activos.filter(a => !seen.includes(a.id));

    if (nuevos.length) {
        playAlertSound();
        nuevos.forEach(a => {
            showToast({ title: '🚨 Nueva alerta de estudiante', message: `${a.estudiante} (Grado ${a.grado}) necesita atención.`, icon: 'fa-triangle-exclamation', type: 'urgent' });
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('SENTIR · Nueva alerta de estudiante', {
                    body: `${a.estudiante} (Grado ${a.grado}): ${a.motivo}`,
                    icon: '../assets/logos.png.png'
                });
            }
        });
        SentirStore.set('seen_alert_ids', alerts.map(a => a.id));
        initSidebarActiveState();
        if (typeof renderAlerts === 'function') renderAlerts();
    } else {
        // Mantener sincronizado el registro de "vistas" con las que ya no están activas
        SentirStore.set('seen_alert_ids', alerts.map(a => a.id));
    }
}

function initAlertWatcher() {
    checkForNewAlerts();
    setInterval(checkForNewAlerts, 6000);
}

/* --------------------------------------------------------------------------
   7. ARRANQUE COMÚN — cada página llama a esto en su DOMContentLoaded
   -------------------------------------------------------------------------- */
function initSentirCore() {
    renderHeaderProfile();
    initLogoHome();
    initSidebarActiveState();
    initNotificationDropdown();
    initPsychologistProfileMenu();
    initMobileSidebar();
    initStudentPanelActions();
    initAlertWatcher();
}
