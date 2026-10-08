/* ==========================================================================
   SENTIR — NÚCLEO COMPARTIDO ENTRE TODOS LOS MÓDULOS
   (Inicio, Estudiantes, Agenda, Alertas, Control de Actividades, Perfil)
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. CONFIGURACIÓN DE LA PSICÓLOGA (editar aquí una sola vez)
   -------------------------------------------------------------------------- */
// ✅ Ya con la foto real de la psicóloga (Sentir/assets/psicologa-avatar.png)
// El perfil real se carga desde la base de datos (ver "DATOS REALES" más abajo)
const SENTIR_DEFAULT_PROFILE = {
    name: 'Cargando…',
    role: 'Psicóloga Escolar',
    licencia: '',
    experiencia: '',
    avatar: '../assets/psicologa-avatar.png',
    email: '',
    especialidad: '',
    sedes: 'I.E. Santa Elena',
    horario: ''
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

const DEFAULT_AI_TREND = {
    group: '11°1',
    topic: 'estrés y ansiedad académica',
    currentCount: 23,
    previousCount: 20,
    currentPeriod: 'últimos 7 días',
    previousPeriod: '7 días anteriores'
};

function getAiTrend() {
    return SentirStore.get('ai_trend', null);
}

const DEFAULT_ALERTS = [
    { id: 'al1', estudiante: 'Mateo Silva', grado: '11°1', hora: 'Hoy · 10:05 a.m.', motivo: 'Activó el botón de emergencia: dice sentirse muy mal y no quiere estar solo.', estado: 'Nueva', source: 'student' },
    { id: 'al2', estudiante: 'Daniel Ortiz', grado: '11°2', hora: 'Hoy · 08:40 a.m.', motivo: 'Activó el botón de emergencia por un conflicto grave con compañeros (posible caso de bullying).', estado: 'En atención', source: 'student' }
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

function getStudents() { return SentirStore.get('students', []); }
function saveStudents(list) { SentirStore.set('students', list); }
function getAlerts() { return SentirStore.get('alerts', []); }
function saveAlerts(list) { SentirStore.set('alerts', list); }
function getInterventions() { return SentirStore.get('interventions', {}); }
function saveInterventions(obj) { SentirStore.set('interventions', obj); }
function getGuardians() { return SentirStore.get('guardians', {}); }
function getAgenda() { return SentirStore.get('agenda', []); }
function saveAgenda(list) { SentirStore.set('agenda', list); }
function getActivities() { return SentirStore.get('activities', DEFAULT_ACTIVITIES); }
function saveActivities(list) { SentirStore.set('activities', list); }

/* Trae de la base de datos las intervenciones del estudiante y las deja en la
   memoria del módulo (las usan el historial y el expediente en PDF). */
async function cargarIntervenciones(name) {
    const student = getStudents().find(s => s.name === name);
    if (!student || !student.idUsuario) return getStudentHistory(name);

    const datos = await sentirApi('/intervenciones/' + student.idUsuario);
    const lista = (datos.intervenciones || []).map(iv => {
        const partes = [];
        // Quita el punto final que ya traiga el texto, para no repetirlo
        const sinPunto = (texto) => String(texto || '').trim().replace(/[.\s]+$/, '');
        if (iv.factores) partes.push(`Factores: ${sinPunto(iv.factores)}.`);
        partes.push(`Situación: ${sinPunto(iv.situacion)}.`);
        if (iv.causas) partes.push(`Causas: ${sinPunto(iv.causas)}.`);
        partes.push(`Proceso realizado: ${sinPunto(iv.proceso)}.`);
        if (iv.avance) partes.push(`Avance: ${sinPunto(iv.avance)}.`);
        if (iv.observaciones) partes.push(`Observaciones: ${sinPunto(iv.observaciones)}.`);
        return {
            id: iv.id,
            fechaISO: iv.fecha || '',
            fecha: iv.fecha ? new Date(iv.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha',
            titulo: iv.psicologa ? `Intervención · ${iv.psicologa}` : 'Intervención registrada',
            detalle: partes.join(' ')
        };
    });

    const todas = getInterventions();
    todas[name] = lista;
    saveInterventions(todas);
    return lista;
}

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
    return all[name] || [];
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
        const goHome = () => { window.location.href = logo.dataset.logoHome; };
        logo.setAttribute('role', 'link');
        logo.setAttribute('tabindex', '0');
        logo.setAttribute('aria-label', 'Ir al inicio de Psicología');
        logo.addEventListener('click', goHome);
        logo.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goHome();
            }
        });
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

    const wrap = bell.closest('.notification-wrap') || bell.parentElement;
    refrescarNotificaciones();
    setInterval(refrescarNotificaciones, 60000);   // revisa avisos nuevos cada minuto

    const setOpen = (open) => {
        dropdown.classList.toggle('show', open);
        bell.setAttribute('aria-expanded', String(open));
        if (open) {
            const firstItem = dropdown.querySelector('[role="menuitem"]');
            if (firstItem) requestAnimationFrame(() => firstItem.focus());
            // Al abrir, los avisos que se ven quedan como leídos
            setTimeout(() => { if (dropdown.classList.contains('show')) marcarNotificacionesLeidas(); }, 1500);
        }
    };

    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !dropdown.classList.contains('show');
        setOpen(open);
        bell.style.transform = 'scale(1.08)';
        setTimeout(() => bell.style.transform = 'scale(1)', 180);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('show')) {
            setOpen(false);
            bell.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!wrap || !wrap.contains(e.target)) setOpen(false);
    });
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

function performPsychologistLogout() {
    ['sentir_psych_session', 'sentir_psych_login_at', 'sentir_psych_last_activity', 'sentir_psych_email', 'sentir_psych_role', 'usuarioSentir']
        .forEach(key => sessionStorage.removeItem(key));
    window.location.replace('/Client/administrativo.html');
}

// Botón "Cerrar sesión" en el encabezado de todas las pantallas (junto al perfil):
// siempre visible, también en celular, donde la barra lateral está oculta
function addHeaderLogoutButton() {
    const header = document.querySelector('.header-profile');
    if (!header || header.querySelector('.header-logout-btn')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'header-logout-btn';
    button.dataset.action = 'logout';
    button.title = 'Cerrar sesión';
    button.setAttribute('aria-label', 'Cerrar sesión');
    button.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Cerrar sesión</span>';
    header.appendChild(button);
}

function initLogoutButtons() {
    addHeaderLogoutButton();
    document.querySelectorAll('[data-action="logout"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.confirm('¿Deseas cerrar sesión?')) performPsychologistLogout();
        });
    });
}

function initPsychologistProfileMenu() {
    const profileContainer = document.querySelector('.profile-info');
    if (!profileContainer) return;

    profileContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const existing = document.getElementById('profileDropdownMenu');
        if (existing) {
            existing.remove();
            profileContainer.setAttribute('aria-expanded', 'false');
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.id = 'profileDropdownMenu';
        dropdown.style.cssText = `
            position: absolute; top: 75px; right: 30px; width: 220px; background: white; border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; overflow: hidden; z-index: 1500;
            animation: fadeIn 0.2s ease forwards;
        `;
        dropdown.innerHTML = `
            <div style="padding:12px 16px; font-size:11px; font-weight:700; color:var(--text-muted); background:var(--bg-light);">SESIÓN ACTIVA</div>
            <div class="p-item" data-action="perfil" role="button" tabindex="0" style="padding:12px 16px; font-size:12px; border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-id-card" style="margin-right:10px; color:var(--morado-sentir)"></i> Mi Licencia Profesional</div>
            <div class="p-item" data-action="turnos" role="button" tabindex="0" style="padding:12px 16px; font-size:12px; border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-clock-rotate-left" style="margin-right:10px; color:var(--morado-sentir)"></i> Historial de Turnos</div>
            <div class="p-item" data-action="salir" role="button" tabindex="0" style="padding:12px 16px; font-size:12px; color:var(--riesgo-alto); cursor:pointer;"><i class="fa-solid fa-right-from-bracket" style="margin-right:10px;"></i> Cerrar Sesión</div>
        `;
        document.body.appendChild(dropdown);
        profileContainer.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-label', 'Opciones del perfil');

        dropdown.querySelectorAll('.p-item').forEach(item => {
            item.setAttribute('role', 'menuitem');
            item.addEventListener('mouseenter', () => item.style.background = '#F8FAFC');
            item.addEventListener('mouseleave', () => item.style.background = 'transparent');

            const activateItem = () => {
                const action = item.dataset.action;
                if (action === 'perfil') window.location.href = resolveModulePath('perfil.html');
                else if (action === 'turnos') openShiftHistoryModal();
                else if (action === 'salir') { dropdown.remove(); profileContainer.setAttribute('aria-expanded', 'false'); performPsychologistLogout(); return; }
                dropdown.remove();
                profileContainer.setAttribute('aria-expanded', 'false');
            };

            item.addEventListener('click', activateItem);
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateItem();
                }
            });
        });

        document.addEventListener('click', () => { if (dropdown.isConnected) dropdown.remove(); profileContainer.setAttribute('aria-expanded', 'false'); }, { once: true });
        dropdown.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                dropdown.remove();
                profileContainer.setAttribute('aria-expanded', 'false');
                profileContainer.focus();
            }
        });
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


/* --------------------------------------------------------------------------
   CONTEXTO DE CASO — origen de señal, próxima acción y acceso
   -------------------------------------------------------------------------- */
const SIGNAL_SOURCE_CONFIG = {
    student: { label: 'Solicitud del estudiante', icon: 'fa-hand-holding-heart', cls: 'student' },
    teacher: { label: 'Reporte docente', icon: 'fa-chalkboard-user', cls: 'teacher' },
    ai: { label: 'Detectado por SENTIR AI', icon: 'fa-brain', cls: 'ai' }
};

function getSignalSource(studentName, explicitSource) {
    if (explicitSource && SIGNAL_SOURCE_CONFIG[explicitSource]) return SIGNAL_SOURCE_CONFIG[explicitSource];
    const activeAlert = getAlerts().find(a => a.estudiante === studentName && a.estado !== 'Resuelta');
    if (activeAlert) return SIGNAL_SOURCE_CONFIG[activeAlert.source] || SIGNAL_SOURCE_CONFIG.student;
    return SIGNAL_SOURCE_CONFIG.ai;
}

function renderSignalSourceBadge(studentName, explicitSource) {
    const source = getSignalSource(studentName, explicitSource);
    return `<span class="signal-source-badge ${source.cls}"><i class="fa-solid ${source.icon}"></i>${source.label}</span>`;
}


function getCaseSignalReason(studentName) {
    const activeAlert = getAlerts().find(a => a.estudiante === studentName && a.estado !== 'Resuelta');
    if (activeAlert) return activeAlert.motivo;
    return 'SENTIR AI identificó un patrón sostenido de riesgo que requiere seguimiento cercano.';
}

function getNextStudentAgenda(studentName) {
    const student = getStudents().find(s => s.name === studentName);
    const ahora = new Date();
    const horaAhora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const hoy = todayISO();
    return getAgenda()
        .filter(a => a.estado === 'Programada')
        .filter(a => (student && a.idUsuario ? String(a.idUsuario) === String(student.idUsuario) : a.nombre === studentName)
            && (a.fecha > hoy || (a.fecha === hoy && a.hora > horaAhora)))
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0] || null;
}

function goToAgendaForStudent(studentName) {
    openFollowupModal(studentName);
}

/* --------------------------------------------------------------------------
   AGENDAR / REPROGRAMAR CITA
   La cita ocupa una franja de "Mi disponibilidad" (o una fecha y hora nueva,
   que se agrega a la disponibilidad) y se guarda en la tabla cita.
   Al estudiante le llega una notificación.
   opciones.cita: cita existente → reprogramar (o aceptar con otro horario si estaba pendiente)
   -------------------------------------------------------------------------- */
const TIPOS_CITA = ['Seguimiento de caso', 'Sesión individual', 'Reunión con acudiente', 'Reunión con docente', 'Consulta breve'];

function hora12Corta(hora) {
    const [h, m] = String(hora).split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}

async function openFollowupModal(studentName, opciones = {}) {
    const editar = opciones.cita || null;
    const student = getStudents().find(s => s.name === studentName)
        || (editar ? { name: editar.nombre, grade: editar.grado, idUsuario: editar.idUsuario } : null);
    if (!student || !student.idUsuario) {
        showToast({ title: 'Sin datos', message: 'No se encontró al estudiante en la base de datos.', icon: 'fa-circle-exclamation', type: 'urgent' });
        return;
    }

    const proximas = getAgenda()
        .filter(a => a.estado === 'Programada' && String(a.idUsuario) === String(student.idUsuario) && a.fecha >= todayISO())
        .filter(a => !editar || a.idCita !== editar.idCita)
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    const eraPendiente = editar && editar.estado === 'Pendiente';
    const titulo = !editar ? 'Agendar cita' : eraPendiente ? 'Proponer otro horario' : 'Reprogramar cita';
    const textoBoton = !editar ? 'Agendar cita' : eraPendiente ? 'Aceptar con este horario' : 'Guardar cambios';

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid ${editar ? 'fa-calendar-days' : 'fa-calendar-plus'}"></i></div>
            <div><h3>${titulo}</h3><p>${escaparHTML(student.name)} · Grado ${escaparHTML(student.grade)} · Se le avisará al estudiante</p></div>
        </div>
        <div class="sentir-modal-body" id="fuBody"><p class="history-empty"><i class="fa-solid fa-spinner fa-spin"></i> Buscando horarios libres…</p></div>
        <div class="sentir-modal-actions" id="fuActions"><button class="modal-btn-cancel" id="fuCancel">Cancelar</button></div>
    `);
    const $ = (sel) => overlay.querySelector(sel);
    $('#fuCancel').addEventListener('click', () => closeSentirModal(overlay));

    let franjas = [];
    try {
        franjas = (await sentirApi('/disponibilidad/libres?dias=30')).franjas || [];
    } catch (error) {
        $('#fuBody').innerHTML = `<p class="history-empty">${escaparHTML(error.message)}</p>`;
        return;
    }

    const proximasHTML = proximas.length ? `
        <div class="fu-upcoming"><i class="fa-solid fa-circle-info"></i> Ya tiene ${proximas.length === 1 ? 'una cita' : proximas.length + ' citas'}:
            ${proximas.slice(0, 3).map(a => `<strong>${escaparHTML(a.titulo)}</strong> el ${formatCaseDate(a.fecha).toLowerCase()} a las ${hora12Corta(a.hora)}`).join('; ')}
        </div>` : '';
    const actualHTML = editar ? `
        <div class="fu-upcoming"><i class="fa-solid fa-clock-rotate-left"></i> ${eraPendiente ? 'El estudiante pidió' : 'Horario actual'}:
            <strong>${formatCaseDate(editar.fecha).toLowerCase()} a las ${hora12Corta(editar.hora)}</strong>
        </div>` : '';

    const dias = [...new Set(franjas.map(f => f.fecha))];
    let diaElegido = dias[0] || null;
    let franjaElegida = null;
    // Sin franjas libres se escribe directamente la fecha y la hora
    let modo = franjas.length ? 'disponibilidad' : 'manual';

    const tipoInicial = editar ? (TIPOS_CITA.includes(editar.titulo) ? editar.titulo : 'Otro') : TIPOS_CITA[0];
    const tipoOtroInicial = editar && tipoInicial === 'Otro' && editar.titulo !== 'Solicitud del estudiante' ? editar.titulo : '';
    const motivoInicial = editar ? editar.descripcion : (student.proceso && student.proceso.motivo ? 'Seguimiento: ' + student.proceso.motivo : '');

    $('#fuBody').innerHTML = `
        ${actualHTML}${proximasHTML}
        <div class="modal-field"><label>TIPO DE CITA</label>
            <select id="fuTipo">${TIPOS_CITA.map(t => `<option value="${t}" ${t === tipoInicial ? 'selected' : ''}>${t}</option>`).join('')}<option value="Otro" ${tipoInicial === 'Otro' ? 'selected' : ''}>Otro</option></select>
        </div>
        <div class="modal-field" id="fuOtroCampo" ${tipoInicial === 'Otro' ? '' : 'hidden'}><label>¿CUÁL? (TIPO DE CITA)</label>
            <input type="text" id="fuTipoOtro" maxlength="60" placeholder="Ej. Taller grupal, Orientación vocacional..." value="${escaparHTML(tipoOtroInicial)}">
        </div>

        <div class="modal-field"><label>${editar ? 'NUEVO HORARIO' : 'HORARIO'}</label>
            <div class="period-tabs fu-modo" id="fuModo">
                <button type="button" data-modo="disponibilidad" ${franjas.length ? '' : 'disabled'}><i class="fa-solid fa-business-time"></i> De mi disponibilidad${franjas.length ? ` (${franjas.length})` : ''}</button>
                <button type="button" data-modo="manual"><i class="fa-solid fa-pen-to-square"></i> Otra fecha y hora</button>
            </div>
        </div>

        <div data-fu="disponibilidad">
            <div class="modal-field"><label>DÍA</label><div class="fu-days" id="fuDias"></div></div>
            <div class="modal-field"><label>HORA</label><div class="fu-hours" id="fuHoras"></div></div>
        </div>

        <div data-fu="manual">
            ${franjas.length ? '' : '<p class="fu-note"><i class="fa-solid fa-circle-info"></i> No tienes horarios libres en los próximos 30 días. Escribe la fecha y la hora: se agregará a tu disponibilidad.</p>'}
            <div class="modal-field-row fu-manual">
                <div class="modal-field"><label>FECHA</label><input type="date" id="fuFecha" min="${todayISO()}" value="${editar && editar.fecha >= todayISO() ? editar.fecha : addDaysISO(1)}"></div>
                <div class="modal-field"><label>HORA</label><input type="time" id="fuHora" step="300" value="${editar ? editar.hora : '08:00'}"></div>
            </div>
            <div class="modal-field"><label>DURACIÓN</label>
                <select id="fuDuracion">${[15, 20, 30, 45, 60, 90, 120].map(d => `<option value="${d}" ${d === Number(editar && editar.duracion || 60) ? 'selected' : ''}>${d < 60 ? d + ' min' : d === 60 ? '1 hora' : d === 90 ? '1 h 30 min' : '2 horas'}</option>`).join('')}</select>
            </div>
        </div>

        <div class="modal-field"><label>MOTIVO DE LA CITA</label>
            <textarea id="fuMotivo" rows="3" placeholder="Ej. Revisar avances del plan de seguridad acordado.">${escaparHTML(motivoInicial)}</textarea>
        </div>
        <p class="modal-error" id="fuError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>`;
    $('#fuActions').insertAdjacentHTML('beforeend', `<button class="modal-btn-confirm" id="fuSave"><i class="fa-solid fa-check"></i> ${textoBoton}</button>`);

    const errorMsg = $('#fuError');
    const mostrarError = (texto) => { errorMsg.querySelector('span').innerText = texto; errorMsg.classList.add('show'); };
    overlay.addEventListener('input', () => errorMsg.classList.remove('show'));

    $('#fuTipo').addEventListener('change', () => {
        const otro = $('#fuTipo').value === 'Otro';
        $('#fuOtroCampo').hidden = !otro;
        if (otro) $('#fuTipoOtro').focus();
    });

    const mostrarModo = () => {
        overlay.querySelectorAll('#fuModo [data-modo]').forEach(b => b.classList.toggle('active', b.dataset.modo === modo));
        overlay.querySelectorAll('[data-fu]').forEach(el => { el.hidden = el.dataset.fu !== modo; });
        errorMsg.classList.remove('show');
    };
    overlay.querySelectorAll('#fuModo [data-modo]').forEach(b => b.addEventListener('click', () => { modo = b.dataset.modo; mostrarModo(); }));

    const pintarDias = () => {
        $('#fuDias').innerHTML = dias.map(fecha => {
            const d = new Date(fecha + 'T12:00:00');
            const libres = franjas.filter(f => f.fecha === fecha).length;
            return `<button type="button" class="fu-day ${fecha === diaElegido ? 'active' : ''}" data-dia="${fecha}">
                <span>${d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')}</span>
                <strong>${d.getDate()}</strong>
                <small>${d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')} · ${libres}</small>
            </button>`;
        }).join('');
        $('#fuDias').querySelectorAll('[data-dia]').forEach(b => b.addEventListener('click', () => {
            diaElegido = b.dataset.dia; franjaElegida = null; pintarDias(); pintarHoras();
        }));
    };
    const pintarHoras = () => {
        $('#fuHoras').innerHTML = franjas.filter(f => f.fecha === diaElegido).map(f => `
            <button type="button" class="fu-hour ${franjaElegida && franjaElegida.id === f.id ? 'active' : ''}" data-franja="${f.id}">
                ${hora12Corta(f.hora)}<small>${f.duracion} min</small>
            </button>`).join('');
        $('#fuHoras').querySelectorAll('[data-franja]').forEach(b => b.addEventListener('click', () => {
            franjaElegida = franjas.find(f => String(f.id) === b.dataset.franja);
            errorMsg.classList.remove('show');
            pintarHoras();
        }));
    };
    pintarDias();
    pintarHoras();
    mostrarModo();

    $('#fuSave').addEventListener('click', async () => {
        const motivo = $('#fuMotivo').value.trim();
        const tipo = $('#fuTipo').value;
        const tipoOtro = $('#fuTipoOtro').value.trim();
        if (tipo === 'Otro' && tipoOtro.length < 3) return mostrarError('Escribe cuál es el tipo de cita.');

        let horario;
        if (modo === 'disponibilidad') {
            if (!franjaElegida) return mostrarError('Elige la hora de la cita.');
            horario = { idDisponibilidad: franjaElegida.id, fecha: franjaElegida.fecha, hora: franjaElegida.hora };
        } else {
            const fecha = $('#fuFecha').value, hora = $('#fuHora').value;
            if (!fecha || !hora) return mostrarError('Elige la fecha y la hora de la cita.');
            if (new Date(`${fecha}T${hora}:00`) <= new Date()) return mostrarError('La fecha y hora de la cita deben ser futuras.');
            horario = { fecha, hora, duracion: Number($('#fuDuracion').value) };
        }
        if (motivo.length < 5) return mostrarError('Escribe el motivo de la cita.');

        const boton = $('#fuSave');
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';
        try {
            await sentirApi(editar ? `/citas/${editar.idCita}` : '/citas', {
                method: editar ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUsuario: student.idUsuario, ...horario, tipo, tipoOtro, motivo })
            });
            closeSentirModal(overlay);
            showToast({
                title: !editar ? 'Cita agendada' : eraPendiente ? 'Cita aceptada' : 'Cita reprogramada',
                message: `${student.name}: ${formatCaseDate(horario.fecha).toLowerCase()} a las ${hora12Corta(horario.hora)}. Se le avisó al estudiante.`,
                icon: 'fa-calendar-check', type: 'success'
            });
            cargarDatosReales();
        } catch (error) {
            mostrarError(error.message);
            boton.disabled = false;
            boton.innerHTML = `<i class="fa-solid fa-check"></i> ${textoBoton}`;
        }
    });
}

/* Citas guardadas en la base de datos, en el formato de la agenda del módulo */
async function cargarCitasReales() {
    const { citas } = await sentirApi('/citas');
    const deBD = (citas || []).map(c => ({
        id: 'cita-' + c.id,
        idCita: c.id,
        idUsuario: c.idUsuario,
        fecha: c.fecha,
        hora: c.hora,
        duracion: c.duracion,
        titulo: c.tipo,
        origen: c.origen,
        nombre: c.estudiante,
        grado: c.grado,
        descripcion: c.motivo,
        estado: c.estado,
        observacion: c.observacion,
        conHorario: c.conHorario,
        sinAsignar: c.sinAsignar,
        enBD: true
    }));
    // La agenda es solo lo que está en la base de datos (las citas de ejemplo del navegador se descartan)
    SentirStore.set('agenda', deBD);
}

function formatCaseDate(fechaISO) {
    if (!fechaISO) return 'Sin registro reciente';
    if (fechaISO === todayISO()) return 'Hoy';
    return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function renderStudentCaseContext(student) {
    const panel = document.getElementById('detailPanel');
    if (!panel || !student) return;

    const source = getSignalSource(student.name);
    const sourceTag = panel.querySelector('.panel-sub-tag');
    if (sourceTag) sourceTag.innerHTML = `<i class="fa-solid ${source.icon}"></i> ${source.label}`;

    let context = document.getElementById('panelCaseContext');
    if (!context) {
        context = document.createElement('div');
        context.id = 'panelCaseContext';
        context.className = 'panel-case-context';
        const timeline = document.getElementById('panelRiskTimeline');
        if (timeline && timeline.parentNode) timeline.insertAdjacentElement('afterend', context);
    }

    const lastRisk = student.riskHistory && student.riskHistory.length ? student.riskHistory[student.riskHistory.length - 1] : null;
    const ultima = student.ultimaActualizacion || (lastRisk ? { fecha: lastRisk.fecha, tipo: 'Alerta registrada' } : null);
    const next = getNextStudentAgenda(student.name);
    const nextText = next
        ? `${formatCaseDate(next.fecha)} · ${hora12Corta(next.hora)}<small>${escaparHTML(next.titulo)}</small>`
        : 'Sin seguimiento programado <button type="button" class="case-context-link" id="caseScheduleLink"><i class="fa-solid fa-calendar-plus"></i> Agendar</button>';

    context.innerHTML = `
        <div class="case-context-grid">
            <div class="case-context-item">
                <span><i class="fa-solid fa-clock-rotate-left"></i> Última actualización</span>
                <strong>${ultima ? `${formatCaseDate(ultima.fecha)}<small>${escaparHTML(ultima.tipo)}</small>` : 'Sin registro reciente'}</strong>
            </div>
            <div class="case-context-item">
                <span><i class="fa-solid fa-calendar-check"></i> Próxima acción</span>
                <strong>${nextText}</strong>
            </div>
        </div>
    `;
    const link = context.querySelector('#caseScheduleLink');
    if (link) link.addEventListener('click', () => openFollowupModal(student.name));
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

    // El botón hamburguesa solo existe en celular/tablet (≤900px): ahí "toggled" = menú lateral abierto.
    // En escritorio el menú lateral siempre está visible y el botón se oculta (ver sentir-shared.css).
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* preferencia antigua de "ocultar menú" */ }

    function setToggled(toggled) {
        if (!isMobile()) toggled = false;
        container.classList.toggle('sidebar-toggled', toggled);
        backdrop.classList.toggle('show', toggled && isMobile());
        document.body.classList.toggle('sidebar-open', toggled && isMobile());
        toggleBtn.setAttribute('aria-label', toggled ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        toggleBtn.setAttribute('aria-expanded', String(toggled));
    }

    // Siempre arranca con el menú cerrado (en escritorio está fijo y visible)
    setToggled(false);

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

    // Al pasar de celular a escritorio (o al revés) el menú vuelve a su estado normal
    let eraMovil = isMobile();
    window.addEventListener('resize', () => {
        if (isMobile() !== eraMovil) {
            eraMovil = isMobile();
            setToggled(false);
        }
    });

    // Escape cierra el menú en celular; al elegir una opción también se cierra
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobile() && container.classList.contains('sidebar-toggled')) {
            setToggled(false);
            toggleBtn.focus();
        }
    });
    sidebar.querySelectorAll('a.nav-item').forEach(a => a.addEventListener('click', () => { if (isMobile()) setToggled(false); }));
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
    renderStudentCaseContext(student);
    cargarIntervenciones(name).catch(() => {});

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
    let scheduleBtn = document.getElementById('panelScheduleBtn');

    if (!scheduleBtn) {
        const actions = panel.querySelector('.panel-actions');
        if (actions) {
            scheduleBtn = document.createElement('button');
            scheduleBtn.type = 'button';
            scheduleBtn.id = 'panelScheduleBtn';
            scheduleBtn.className = 'btn-action-trigger followup-btn';
            scheduleBtn.innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Agendar Seguimiento';
            const history = document.getElementById('viewInterventionHistoryBtn');
            if (history) actions.insertBefore(scheduleBtn, history); else actions.appendChild(scheduleBtn);
        }
    }

    if (registerBtn) registerBtn.addEventListener('click', () => openRegisterInterventionModal(currentName()));
    if (historyBtn) historyBtn.addEventListener('click', () => openInterventionHistoryModal(currentName()));
    if (contactBtn) contactBtn.addEventListener('click', () => openContactGuardianModal(currentName()));
    if (deriveBtn) deriveBtn.addEventListener('click', () => openMedicalReferralModal(currentName()));
    if (scheduleBtn) scheduleBtn.addEventListener('click', () => goToAgendaForStudent(currentName()));
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

async function openInterventionHistoryModal(studentName) {
    let history = getStudentHistory(studentName);
    try {
        history = await cargarIntervenciones(studentName);
    } catch (error) {
        showToast({ title: 'Sin conexión', message: 'No se pudo cargar el historial desde el servidor.', icon: 'fa-plug-circle-xmark', type: 'urgent' });
    }

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <div><h3>Historial de Intervenciones</h3><p>${studentName} · Proceso de acompañamiento psicológico</p></div>
        </div>
        <div class="sentir-modal-body">
            ${history.length ? `
            <div class="hist-filter">
                <div class="filter-chips hist-chips">
                    <button class="chip active" data-rango="todo">Todo</button>
                    <button class="chip" data-rango="7">Últimos 7 días</button>
                    <button class="chip" data-rango="30">Últimos 30 días</button>
                    <button class="chip" data-rango="anio">Este año</button>
                </div>
                <div class="modal-field-row">
                    <div class="modal-field"><label>DESDE</label><input type="date" id="histDesde" max="${todayISO()}"></div>
                    <div class="modal-field"><label>HASTA</label><input type="date" id="histHasta" max="${todayISO()}"></div>
                </div>
                <p class="hist-count" id="histCount"></p>
            </div>` : ''}
            <div class="history-timeline" id="histLista"></div>
        </div>
        <div class="sentir-modal-actions"><button class="modal-btn-cancel" id="closeHistoryModal">Cerrar</button></div>
    `);
    overlay.querySelector('#closeHistoryModal').addEventListener('click', () => closeSentirModal(overlay));

    const lista = overlay.querySelector('#histLista');
    const pintar = (items) => {
        lista.innerHTML = items.length
            ? items.map(item => `
                <div class="history-entry">
                    <div class="history-entry-dot"></div>
                    <div class="history-entry-content">
                        <div class="history-entry-top"><strong>${item.titulo}</strong><span>${item.fecha}</span></div>
                        <p>${item.detalle}</p>
                    </div>
                </div>`).join('')
            : history.length
                ? '<p class="history-empty"><i class="fa-solid fa-calendar-xmark" style="display:block; font-size:20px; margin-bottom:8px; color:var(--lavanda);"></i>No hay intervenciones en ese rango de fechas.</p>'
                : '<p class="history-empty"><i class="fa-solid fa-folder-open" style="display:block; font-size:20px; margin-bottom:8px; color:var(--lavanda);"></i>Este estudiante aún no registra intervenciones previas.</p>';
    };

    if (!history.length) return pintar([]);

    const desde = overlay.querySelector('#histDesde');
    const hasta = overlay.querySelector('#histHasta');
    const chips = overlay.querySelectorAll('.hist-chips .chip');
    const contador = overlay.querySelector('#histCount');
    const isoDeHace = (dias) => { const d = new Date(); d.setDate(d.getDate() - dias); return d.toLocaleDateString('en-CA'); };

    const filtrar = () => {
        if (desde.value && hasta.value && desde.value > hasta.value) {
            contador.innerText = 'La fecha "desde" no puede ser posterior a "hasta".';
            contador.classList.add('error');
            return pintar([]);
        }
        contador.classList.remove('error');
        const items = history.filter(h => {
            if (!h.fechaISO) return !desde.value && !hasta.value;
            return (!desde.value || h.fechaISO >= desde.value) && (!hasta.value || h.fechaISO <= hasta.value);
        });
        contador.innerText = `Mostrando ${items.length} de ${history.length} intervenciones`;
        pintar(items);
    };

    chips.forEach(chip => chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.toggle('active', c === chip));
        const rango = chip.dataset.rango;
        hasta.value = rango === 'todo' ? '' : todayISO();
        desde.value = rango === 'todo' ? '' : rango === 'anio' ? `${new Date().getFullYear()}-01-01` : isoDeHace(Number(rango) - 1);
        filtrar();
    }));
    [desde, hasta].forEach(input => input.addEventListener('change', () => {
        chips.forEach(c => c.classList.remove('active'));
        filtrar();
    }));

    filtrar();
}

function openRegisterInterventionModal(studentName) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-notes-medical"></i></div>
            <div><h3>Registrar Intervención</h3><p>${studentName} · Se sumará al historial de acompañamiento</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>FECHA</label><input type="date" id="ivDate" value="${todayISO()}" max="${todayISO()}"></div>
            <div class="modal-field"><label>FACTORES IDENTIFICADOS</label><textarea id="ivFactors" rows="2" placeholder="Ej. Ansiedad, aislamiento social..."></textarea></div>
            <div class="modal-field"><label>SITUACIÓN</label><textarea id="ivSituation" rows="2" placeholder="Describe la situación actual"></textarea></div>
            <div class="modal-field"><label>CAUSAS IDENTIFICADAS</label><textarea id="ivCauses" rows="2" placeholder="Posibles causas asociadas"></textarea></div>
            <div class="modal-field"><label>PROCESO REALIZADO</label><textarea id="ivProcess" rows="2" placeholder="Acciones y estrategias aplicadas"></textarea></div>
            <div class="modal-field"><label>AVANCE / EVOLUCIÓN</label><textarea id="ivProgress" rows="2" placeholder="Evolución observada"></textarea></div>
            <div class="modal-field"><label>OBSERVACIONES</label><textarea id="ivObservations" rows="2" placeholder="Acuerdos, próximos pasos, remisiones..."></textarea></div>
            <p class="modal-error" id="ivError"><i class="fa-solid fa-circle-exclamation"></i> <span>Describe al menos la situación y el proceso realizado.</span></p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="ivCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="ivConfirm"><i class="fa-solid fa-check"></i> Guardar Intervención</button>
        </div>
    `);

    overlay.querySelector('#ivCancel').addEventListener('click', () => closeSentirModal(overlay));
    overlay.querySelector('#ivConfirm').addEventListener('click', async () => {
        const errorMsg = overlay.querySelector('#ivError');
        const mostrarError = (texto) => {
            errorMsg.querySelector('span').innerText = texto;
            errorMsg.classList.add('show');
        };

        const situation = overlay.querySelector('#ivSituation').value.trim();
        const process = overlay.querySelector('#ivProcess').value.trim();
        if (!situation || !process) return mostrarError('Describe al menos la situación y el proceso realizado.');
        errorMsg.classList.remove('show');

        const student = getStudents().find(s => s.name === studentName);
        if (!student || !student.idUsuario) return mostrarError('No se encontró al estudiante en la base de datos.');

        const boton = overlay.querySelector('#ivConfirm');
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';

        try {
            const resultado = await sentirApi('/intervenciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idUsuario: student.idUsuario,
                    fecha: overlay.querySelector('#ivDate').value,
                    factores: overlay.querySelector('#ivFactors').value.trim(),
                    situacion: situation,
                    causas: overlay.querySelector('#ivCauses').value.trim(),
                    proceso: process,
                    avance: overlay.querySelector('#ivProgress').value.trim(),
                    observaciones: overlay.querySelector('#ivObservations').value.trim()
                })
            });

            closeSentirModal(overlay);
            showToast({
                title: 'Intervención registrada',
                message: `Se guardó en el historial de ${studentName}.` + (resultado.alertasEnAtencion ? ' Sus alertas nuevas pasaron a "En atención".' : ''),
                icon: 'fa-notes-medical',
                type: 'success'
            });

            cargarIntervenciones(studentName).catch(() => {});
            cargarDatosReales();   // actualiza alertas, casos y cifras
        } catch (error) {
            mostrarError(error.message);
            boton.disabled = false;
            boton.innerHTML = '<i class="fa-solid fa-check"></i> Guardar Intervención';
        }
    });
}

/* --------------------------------------------------------------------------
   CONTACTAR ACUDIENTE (llamada, WhatsApp, contacto alternativo y registro en BD)
   -------------------------------------------------------------------------- */
const MEDIOS_CONTACTO = {
    llamada: { label: 'Llamada', icon: 'fa-phone' },
    whatsapp: { label: 'WhatsApp', icon: 'fa-brands fa-whatsapp' },
    correo: { label: 'Correo', icon: 'fa-envelope' },
    presencial: { label: 'Presencial', icon: 'fa-people-arrows' }
};

function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// WhatsApp necesita el número con indicativo de país (Colombia = 57)
function numeroWhatsApp(telefono) {
    const d = String(telefono || '').replace(/\D/g, '');
    if (d.length === 10 && d.startsWith('3')) return '57' + d;
    return d;
}

function telefonoBonito(telefono) {
    const d = String(telefono || '').replace(/\D/g, '');
    if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    if (d.length === 12 && d.startsWith('57')) return `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
    return d || 'Sin número';
}

function mensajeWhatsApp(contacto, studentName) {
    const psicologa = getPsychProfile().name || 'la psicóloga';
    const saludo = new Date().getHours() < 12 ? 'Buenos días' : 'Buenas tardes';
    return `${saludo}, ${contacto.nombre}. Le escribe ${psicologa}, del área de psicología de la institución, en relación con ${studentName}. Necesitamos comunicarnos con usted lo antes posible. ¿Me puede indicar a qué hora podemos hablar? Gracias.`;
}

async function openContactGuardianModal(studentName) {
    const student = getStudents().find(s => s.name === studentName);
    if (!student || !student.idUsuario) {
        showToast({ title: 'Sin datos', message: 'No se encontró al estudiante en la base de datos.', icon: 'fa-circle-exclamation', type: 'urgent' });
        return;
    }

    let datos = { contactos: [], registros: [] };
    let vista = 'lista';          // lista | whatsapp | alternativo | registrar
    let elegido = null;           // contacto seleccionado para WhatsApp o registro

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon" style="background:#FEF2F2; color:var(--riesgo-alto);"><i class="fa-solid fa-phone"></i></div>
            <div><h3>Contactar Acudiente</h3><p>${escaparHTML(studentName)} · Llama, escribe por WhatsApp y deja constancia del contacto</p></div>
        </div>
        <div class="sentir-modal-body" id="gcBody"><p class="history-empty"><i class="fa-solid fa-spinner fa-spin"></i> Cargando contactos…</p></div>
        <div class="sentir-modal-actions" id="gcActions"></div>
    `);
    const body = overlay.querySelector('#gcBody');
    const acciones = overlay.querySelector('#gcActions');

    const cargar = async () => {
        datos = await sentirApi('/acudientes/' + student.idUsuario);
        // El expediente en PDF usa estos contactos
        const todos = getGuardians();
        todos[studentName] = datos.contactos;
        SentirStore.set('guardians', todos);
    };

    const mostrarError = (texto) => {
        const caja = overlay.querySelector('#gcError');
        if (!caja) return showToast({ title: 'Atención', message: texto, icon: 'fa-circle-exclamation', type: 'urgent' });
        caja.querySelector('span').innerText = texto;
        caja.classList.add('show');
    };
    const errorHTML = '<p class="modal-error" id="gcError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>';

    const registrar = (payload) => sentirApi(`/acudientes/${student.idUsuario}/contactos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const pintar = () => {
        const { contactos, registros } = datos;

        if (vista === 'lista') {
            const listaHTML = contactos.length ? contactos.map((c, i) => `
                <div class="contact-entry ${c.principal ? 'is-principal' : ''}">
                    <div class="contact-entry-info">
                        <strong>${escaparHTML(c.nombre)}${c.principal ? '<span class="contact-principal-tag">ACUDIENTE</span>' : '<span class="contact-alt-tag">ALTERNATIVO</span>'}</strong>
                        <span>${escaparHTML(c.parentesco)} · ${telefonoBonito(c.telefono)}</span>
                        ${c.correo ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.correo)}" target="_blank" rel="noopener" class="contact-email-link"><i class="fa-solid fa-envelope"></i> ${escaparHTML(c.correo)}</a>` : ''}
                    </div>
                    <div class="contact-quick-actions">
                        <button type="button" class="gc-btn wa" data-wa="${i}" title="Enviar mensaje por WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                        ${c.principal ? '' : `<button type="button" class="gc-btn del" data-del="${c.id}" title="Quitar contacto alternativo"><i class="fa-solid fa-trash-can"></i></button>`}
                    </div>
                </div>`).join('')
                : '<p class="history-empty">Este estudiante no tiene acudiente registrado. Agrega un contacto alternativo.</p>';

            const historialHTML = registros.length ? registros.map(r => `
                <div class="gc-log">
                    <i class="${(MEDIOS_CONTACTO[r.medio] || MEDIOS_CONTACTO.llamada).icon.includes('fa-brands') ? '' : 'fa-solid '}${(MEDIOS_CONTACTO[r.medio] || MEDIOS_CONTACTO.llamada).icon}"></i>
                    <div>
                        <strong>${escaparHTML(r.nombre)} · ${(MEDIOS_CONTACTO[r.medio] || MEDIOS_CONTACTO.llamada).label}</strong>
                        <small>${new Date(r.fecha).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}${r.psicologa ? ' · ' + escaparHTML(r.psicologa) : ''}</small>
                        ${r.observacion ? `<p>${escaparHTML(r.observacion)}</p>` : ''}
                    </div>
                </div>`).join('')
                : '<p class="gc-empty">Aún no se ha registrado ningún contacto.</p>';

            body.innerHTML = `
                <div class="contact-list">${listaHTML}</div>
                <button class="btn-secondary" id="gcAddAlt" style="width:100%; margin-top:12px;"><i class="fa-solid fa-user-plus"></i> Agregar contacto alternativo</button>
                <h4 class="gc-subtitle"><i class="fa-solid fa-clock-rotate-left"></i> Contactos realizados</h4>
                <div class="gc-logs">${historialHTML}</div>`;
            acciones.innerHTML = `
                <button class="modal-btn-cancel" id="gcClose">Cerrar</button>
                ${contactos.length ? '<button class="modal-btn-confirm" id="gcRegister"><i class="fa-solid fa-check"></i> Registrar como Contactado</button>' : ''}`;

            body.querySelectorAll('[data-wa]').forEach(b => b.addEventListener('click', () => {
                elegido = contactos[Number(b.dataset.wa)];
                vista = 'whatsapp'; pintar();
            }));
            body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
                if (!confirm('¿Quitar este contacto alternativo?')) return;
                try {
                    await sentirApi('/acudientes/alternativos/' + b.dataset.del, { method: 'DELETE' });
                    await cargar(); pintar();
                    showToast({ title: 'Contacto eliminado', message: 'Se quitó el contacto alternativo.', icon: 'fa-trash-can', type: 'info' });
                } catch (error) { mostrarError(error.message); }
            }));
            body.querySelector('#gcAddAlt').addEventListener('click', () => { vista = 'alternativo'; pintar(); });
            acciones.querySelector('#gcClose').addEventListener('click', () => closeSentirModal(overlay));
            const regBtn = acciones.querySelector('#gcRegister');
            if (regBtn) regBtn.addEventListener('click', () => { elegido = contactos[0]; vista = 'registrar'; pintar(); });
            return;
        }

        if (vista === 'whatsapp') {
            const numero = numeroWhatsApp(elegido.telefono);
            body.innerHTML = `
                <div class="gc-selected"><i class="fa-brands fa-whatsapp"></i><div><strong>${escaparHTML(elegido.nombre)}</strong><small>${escaparHTML(elegido.parentesco)} · ${telefonoBonito(elegido.telefono)}</small></div></div>
                <div class="modal-field"><label>MENSAJE</label><textarea id="gcMensaje" rows="6">${escaparHTML(mensajeWhatsApp(elegido, studentName))}</textarea></div>
                <p class="gc-note"><i class="fa-solid fa-circle-info"></i> Se abrirá WhatsApp con el mensaje listo para enviar y el contacto quedará registrado.</p>
                ${numero.length < 10 ? '<p class="gc-warn"><i class="fa-solid fa-triangle-exclamation"></i> Este número parece incompleto. Verifícalo antes de enviar.</p>' : ''}
                ${errorHTML}`;
            acciones.innerHTML = `
                <button class="modal-btn-cancel" id="gcBack"><i class="fa-solid fa-arrow-left"></i> Atrás</button>
                <button class="modal-btn-confirm gc-wa-send" id="gcSendWa"><i class="fa-brands fa-whatsapp"></i> Enviar por WhatsApp</button>`;

            acciones.querySelector('#gcBack').addEventListener('click', () => { vista = 'lista'; pintar(); });
            acciones.querySelector('#gcSendWa').addEventListener('click', async () => {
                const mensaje = body.querySelector('#gcMensaje').value.trim();
                if (!mensaje) return mostrarError('Escribe el mensaje que quieres enviar.');
                // Se abre primero (dentro del clic) para que el navegador no bloquee la ventana
                window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener');
                try {
                    await registrar({ nombre: elegido.nombre, parentesco: elegido.parentesco, telefono: elegido.telefono, medio: 'whatsapp', mensaje, observacion: 'Mensaje enviado por WhatsApp.' });
                    await cargar();
                    vista = 'lista'; pintar();
                    showToast({ title: 'WhatsApp abierto', message: `Se registró el mensaje a ${elegido.nombre}.`, icon: 'fa-comment-dots', type: 'success' });
                } catch (error) { mostrarError(error.message); }
            });
            return;
        }

        if (vista === 'alternativo') {
            body.innerHTML = `
                <p class="gc-note" style="margin:0 0 12px;"><i class="fa-solid fa-circle-info"></i> Se guardará como acudiente alternativo de ${escaparHTML(studentName)}.</p>
                <div class="modal-field-row">
                    <div class="modal-field"><label>NOMBRE</label><input type="text" id="altName" maxlength="20" placeholder="Ej. Luz Marina"></div>
                    <div class="modal-field"><label>APELLIDO</label><input type="text" id="altSurname" maxlength="20" placeholder="Ej. Gómez Ruiz"></div>
                </div>
                <div class="modal-field-row">
                    <div class="modal-field"><label>TIPO DE DOCUMENTO</label>
                        <select id="altDocType">
                            <option value="Cédula">Cédula</option>
                            <option value="Tarjeta identidad">Tarjeta de identidad</option>
                            <option value="PPI">PPI</option>
                            <option value="Pasaporte">Pasaporte</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="modal-field"><label>NÚMERO DE DOCUMENTO</label><input type="text" id="altDoc" inputmode="numeric" maxlength="15" placeholder="Ej. 43555111"></div>
                </div>
                <div class="modal-field-row">
                    <div class="modal-field"><label>PARENTESCO</label><input type="text" id="altRelation" placeholder="Ej. Tía, abuelo, vecina"></div>
                    <div class="modal-field"><label>CELULAR</label><input type="text" id="altPhone" placeholder="300 000 0000" inputmode="numeric"></div>
                </div>
                <div class="modal-field-row">
                    <div class="modal-field"><label>OCUPACIÓN (OPCIONAL)</label><input type="text" id="altJob" placeholder="Ej. Comerciante"></div>
                    <div class="modal-field"><label>CORREO (OPCIONAL)</label><input type="email" id="altEmail" placeholder="correo@ejemplo.com"></div>
                </div>
                ${errorHTML}`;
            acciones.innerHTML = `
                <button class="modal-btn-cancel" id="gcBack"><i class="fa-solid fa-arrow-left"></i> Atrás</button>
                <button class="modal-btn-confirm" id="gcSaveAlt"><i class="fa-solid fa-check"></i> Guardar contacto</button>`;
            setTimeout(() => body.querySelector('#altName').focus(), 50);

            acciones.querySelector('#gcBack').addEventListener('click', () => { vista = 'lista'; pintar(); });
            acciones.querySelector('#gcSaveAlt').addEventListener('click', async (e) => {
                const valor = (id) => body.querySelector(id).value.trim();
                const nombre = valor('#altName');
                const apellido = valor('#altSurname');
                const documento = valor('#altDoc').replace(/\D/g, '');
                const telefono = valor('#altPhone').replace(/\D/g, '');
                if (!nombre || !apellido) return mostrarError('Escribe el nombre y el apellido del contacto.');
                if (documento.length < 5) return mostrarError('Escribe el número de documento del contacto.');
                if (!valor('#altRelation')) return mostrarError('Escribe el parentesco con el estudiante.');
                if (telefono.length < 7) return mostrarError('Escribe un número de celular válido.');
                e.currentTarget.disabled = true;
                try {
                    await sentirApi(`/acudientes/${student.idUsuario}/alternativos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre, apellido, documento,
                            tipoDocumento: body.querySelector('#altDocType').value,
                            parentesco: valor('#altRelation'),
                            ocupacion: valor('#altJob'),
                            telefono,
                            correo: valor('#altEmail')
                        })
                    });
                    await cargar();
                    vista = 'lista'; pintar();
                    showToast({ title: 'Contacto alternativo agregado', message: `${nombre} ${apellido} quedó guardado como acudiente alternativo de ${studentName}.`, icon: 'fa-user-plus', type: 'success' });
                } catch (error) {
                    mostrarError(error.message);
                    acciones.querySelector('#gcSaveAlt').disabled = false;
                }
            });
            return;
        }

        if (vista === 'registrar') {
            body.innerHTML = `
                <div class="modal-field"><label>¿A QUIÉN CONTACTASTE?</label>
                    <div class="referral-list">${contactos.map((c, i) => `
                        <label class="referral-option">
                            <input type="radio" name="gcQuien" value="${i}" ${c === elegido ? 'checked' : ''}>
                            <div><strong>${escaparHTML(c.nombre)}</strong><span>${escaparHTML(c.parentesco)} · ${telefonoBonito(c.telefono)}</span></div>
                        </label>`).join('')}
                    </div>
                </div>
                <div class="modal-field"><label>¿CÓMO FUE EL CONTACTO?</label>
                    <div class="gc-medios">${Object.entries(MEDIOS_CONTACTO).map(([clave, m], i) => `
                        <label class="gc-medio"><input type="radio" name="gcMedio" value="${clave}" ${i === 0 ? 'checked' : ''}><span><i class="${m.icon.includes('fa-brands') ? '' : 'fa-solid '}${m.icon}"></i> ${m.label}</span></label>`).join('')}
                    </div>
                </div>
                <div class="modal-field"><label>¿QUÉ SE HABLÓ? (OBSERVACIÓN)</label><textarea id="gcObs" rows="3" placeholder="Ej. Se informó a la madre sobre la situación; asistirá a reunión el jueves."></textarea></div>
                ${errorHTML}`;
            acciones.innerHTML = `
                <button class="modal-btn-cancel" id="gcBack"><i class="fa-solid fa-arrow-left"></i> Atrás</button>
                <button class="modal-btn-confirm" id="gcSaveLog"><i class="fa-solid fa-check"></i> Guardar registro</button>`;

            acciones.querySelector('#gcBack').addEventListener('click', () => { vista = 'lista'; pintar(); });
            acciones.querySelector('#gcSaveLog').addEventListener('click', async (e) => {
                const quien = body.querySelector('input[name="gcQuien"]:checked');
                if (!quien) return mostrarError('Elige a quién contactaste.');
                const contacto = contactos[Number(quien.value)];
                const boton = e.currentTarget;
                boton.disabled = true;
                try {
                    await registrar({
                        nombre: contacto.nombre,
                        parentesco: contacto.parentesco,
                        telefono: contacto.telefono,
                        medio: body.querySelector('input[name="gcMedio"]:checked').value,
                        observacion: body.querySelector('#gcObs').value.trim()
                    });
                    await cargar();
                    vista = 'lista'; pintar();
                    showToast({ title: 'Contacto registrado', message: `Quedó constancia del contacto con ${contacto.nombre}.`, icon: 'fa-phone', type: 'success' });
                    cargarDatosReales();   // las alertas nuevas del estudiante pasan a "En atención"
                } catch (error) {
                    mostrarError(error.message);
                    boton.disabled = false;
                }
            });
        }
    };

    try {
        await cargar();
        pintar();
    } catch (error) {
        body.innerHTML = `<p class="history-empty"><i class="fa-solid fa-plug-circle-xmark"></i> ${escaparHTML(error.message)}</p>`;
        acciones.innerHTML = '<button class="modal-btn-cancel" id="gcClose">Cerrar</button>';
        acciones.querySelector('#gcClose').addEventListener('click', () => closeSentirModal(overlay));
    }
}

/* --------------------------------------------------------------------------
   DERIVAR A RED DE APOYO (la psicóloga escribe la EPS; se guarda en la BD)
   -------------------------------------------------------------------------- */
async function openMedicalReferralModal(studentName) {
    const student = getStudents().find(s => s.name === studentName);
    if (!student || !student.idUsuario) {
        showToast({ title: 'Sin datos', message: 'No se encontró al estudiante en la base de datos.', icon: 'fa-circle-exclamation', type: 'urgent' });
        return;
    }

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-house-medical"></i></div>
            <div><h3>Derivar a Red de Apoyo Médica</h3><p>${escaparHTML(studentName)} · Escribe la EPS o entidad a la que se remite el caso</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>NOMBRE DE LA EPS O ENTIDAD</label><input type="text" id="referralEps" maxlength="150" placeholder="Ej. Nueva EPS, Sanitas, Salud Total..."></div>
            <div class="modal-field-row">
                <div class="modal-field"><label>SERVICIO (OPCIONAL)</label><input type="text" id="referralService" maxlength="100" placeholder="Ej. Psiquiatría, Psicología clínica"></div>
                <div class="modal-field"><label>FECHA DE LA DERIVACIÓN</label><input type="date" id="referralDate" value="${todayISO()}" max="${todayISO()}"></div>
            </div>
            <div class="modal-field"><label>MOTIVO DE LA DERIVACIÓN</label><textarea id="referralNote" rows="3" placeholder="Motivo y contexto de la derivación..."></textarea></div>
            <p class="modal-error" id="referralError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
            <h4 class="gc-subtitle"><i class="fa-solid fa-clock-rotate-left"></i> Derivaciones anteriores</h4>
            <div class="gc-logs" id="referralHistory"><p class="gc-empty"><i class="fa-solid fa-spinner fa-spin"></i> Cargando…</p></div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelReferral">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmReferral"><i class="fa-solid fa-paper-plane"></i> Confirmar Derivación</button>
        </div>
    `);

    const $ = (sel) => overlay.querySelector(sel);
    const errorMsg = $('#referralError');
    const mostrarError = (texto) => { errorMsg.querySelector('span').innerText = texto; errorMsg.classList.add('show'); };
    overlay.addEventListener('input', () => errorMsg.classList.remove('show'));
    setTimeout(() => $('#referralEps').focus(), 50);

    const pintarHistorial = async () => {
        try {
            const { derivaciones } = await sentirApi('/derivaciones/' + student.idUsuario);
            $('#referralHistory').innerHTML = derivaciones.length ? derivaciones.map(d => `
                <div class="gc-log">
                    <i class="fa-solid fa-house-medical"></i>
                    <div>
                        <strong>${escaparHTML(d.eps)}${d.servicio ? ' · ' + escaparHTML(d.servicio) : ''}</strong>
                        <small>${new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}${d.psicologa ? ' · ' + escaparHTML(d.psicologa) : ''} · ${escaparHTML(d.estado)}</small>
                        <p>${escaparHTML(d.motivo)}</p>
                    </div>
                </div>`).join('')
                : '<p class="gc-empty">Este estudiante no tiene derivaciones registradas.</p>';
        } catch (error) {
            $('#referralHistory').innerHTML = `<p class="gc-empty">${escaparHTML(error.message)}</p>`;
        }
    };
    pintarHistorial();

    $('#cancelReferral').addEventListener('click', () => closeSentirModal(overlay));
    $('#confirmReferral').addEventListener('click', async () => {
        const eps = $('#referralEps').value.trim();
        const motivo = $('#referralNote').value.trim();
        if (eps.length < 2) return mostrarError('Escribe el nombre de la EPS o entidad.');
        if (motivo.length < 5) return mostrarError('Escribe el motivo de la derivación.');

        const boton = $('#confirmReferral');
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';
        try {
            await sentirApi('/derivaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idUsuario: student.idUsuario,
                    eps,
                    servicio: $('#referralService').value.trim(),
                    fecha: $('#referralDate').value || todayISO(),
                    motivo
                })
            });
            closeSentirModal(overlay);
            showToast({ title: 'Derivación confirmada', message: `${studentName} fue remitido a ${eps}.`, icon: 'fa-house-medical', type: 'success' });
            cargarDatosReales();   // las alertas nuevas del estudiante pasan a "En atención"
        } catch (error) {
            mostrarError(error.message);
            boton.disabled = false;
            boton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Confirmar Derivación';
        }
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
   7. SEGURIDAD — CIERRE AUTOMÁTICO POR INACTIVIDAD
   -------------------------------------------------------------------------- */
// Ajustes fáciles de modificar si la institución define otra política de sesión.
const SENTIR_INACTIVITY_TOTAL_MS = 15 * 60 * 1000; // 15 minutos sin actividad
const SENTIR_INACTIVITY_WARNING_MS = 45 * 1000;    // aviso 45 segundos antes

function initInactivityLogout() {
    // Evita inicializar más de una vez si algún módulo vuelve a llamar al núcleo.
    if (window.__sentirInactivityInitialized) return;
    window.__sentirInactivityInitialized = true;

    let warningTimer = null;
    let logoutTimer = null;
    let countdownTimer = null;
    let warningOpen = false;
    let remainingSeconds = Math.ceil(SENTIR_INACTIVITY_WARNING_MS / 1000);

    const clearTimers = () => {
        clearTimeout(warningTimer);
        clearTimeout(logoutTimer);
        clearInterval(countdownTimer);
    };

    const removeWarning = () => {
        const overlay = document.getElementById('inactivitySessionOverlay');
        if (overlay) overlay.remove();
        warningOpen = false;
        document.body.classList.remove('session-warning-open');
    };

    const startTimers = () => {
        clearTimers();
        warningTimer = setTimeout(showWarning, Math.max(0, SENTIR_INACTIVITY_TOTAL_MS - SENTIR_INACTIVITY_WARNING_MS));
        logoutTimer = setTimeout(() => {
            removeWarning();
            performPsychologistLogout();
        }, SENTIR_INACTIVITY_TOTAL_MS);
    };

    const continueSession = () => {
        removeWarning();
        remainingSeconds = Math.ceil(SENTIR_INACTIVITY_WARNING_MS / 1000);
        startTimers();
        showToast({
            title: 'Sesión protegida',
            message: 'Tu sesión continúa activa.',
            icon: 'fa-shield-heart',
            type: 'success'
        });
    };

    function showWarning() {
        if (warningOpen) return;
        warningOpen = true;
        remainingSeconds = Math.ceil(SENTIR_INACTIVITY_WARNING_MS / 1000);

        const overlay = document.createElement('div');
        overlay.id = 'inactivitySessionOverlay';
        overlay.className = 'session-timeout-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'sessionTimeoutTitle');
        overlay.innerHTML = `
            <div class="session-timeout-card">
                <div class="session-timeout-heading">
                    <div class="session-timeout-icon"><i class="fa-solid fa-clock"></i></div>
                    <div>
                        <h3 id="sessionTimeoutTitle">¿Sigues ahí?</h3>
                        <p>Por seguridad, tu sesión se cerrará automáticamente si no confirmas que sigues trabajando.</p>
                    </div>
                </div>

                <div class="session-countdown-wrap" aria-live="polite" aria-atomic="true">
                    <div class="session-countdown-ring">
                        <span class="session-countdown-number" id="sessionCountdown">${remainingSeconds}</span>
                        <span class="session-countdown-label">segundos</span>
                    </div>
                    <p class="session-countdown-help">Al llegar a <strong>0</strong>, volverás automáticamente al acceso de SENTIR.</p>
                </div>

                <div class="session-timeout-actions">
                    <button type="button" class="session-logout-now" id="sessionLogoutNow">
                        <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión ahora
                    </button>
                    <button type="button" class="session-continue-btn" id="sessionContinueBtn">
                        <i class="fa-solid fa-check"></i> Seguir trabajando
                    </button>
                </div>
            </div>`;

        document.body.appendChild(overlay);
        document.body.classList.add('session-warning-open');

        const countdown = overlay.querySelector('#sessionCountdown');
        const continueBtn = overlay.querySelector('#sessionContinueBtn');
        const logoutBtn = overlay.querySelector('#sessionLogoutNow');

        const endSession = () => {
            clearTimers();
            removeWarning();
            performPsychologistLogout();
        };

        continueBtn.addEventListener('click', continueSession);
        logoutBtn.addEventListener('click', endSession);

        countdownTimer = setInterval(() => {
            remainingSeconds -= 1;
            if (countdown) countdown.textContent = String(Math.max(0, remainingSeconds));

            if (remainingSeconds <= 0) {
                // El 0 se muestra visualmente y el cierre ocurre inmediatamente después.
                clearInterval(countdownTimer);
                countdownTimer = null;
                setTimeout(endSession, 180);
            }
        }, 1000);

        // La acción principal recibe el foco para que el aviso también sea usable con teclado.
        requestAnimationFrame(() => continueBtn.focus());
    }

    const registerActivity = () => {
        // Cuando el aviso ya está abierto, la persona debe confirmar explícitamente que sigue trabajando.
        if (warningOpen) return;
        sessionStorage.setItem('sentir_psych_last_activity', String(Date.now()));
        startTimers();
    };

    // Eventos deliberados de actividad. mousemove se limita para evitar reinicios excesivos.
    let lastMouseReset = 0;
    document.addEventListener('mousemove', () => {
        const now = Date.now();
        if (now - lastMouseReset > 1000) {
            lastMouseReset = now;
            registerActivity();
        }
    }, { passive: true });

    ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(eventName => {
        document.addEventListener(eventName, registerActivity, { passive: true });
    });

    startTimers();
}

/* --------------------------------------------------------------------------
   8. ARRANQUE COMÚN — cada página llama a esto en su DOMContentLoaded
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   DATOS REALES (backend /api/Psicologia)
   Trae el perfil de la psicóloga que inició sesión y el panorama de la
   institución (estudiantes, alertas, ánimo, cifras). Los guarda donde el
   módulo los lee (SentirStore) y avisa con el evento "sentir:datos" para
   que cada página se vuelva a pintar.
   -------------------------------------------------------------------------- */
const SENTIR_API = 'http://localhost:3001/api/Psicologia';

function sentirToken() {
    try {
        return JSON.parse(sessionStorage.getItem('usuarioSentir') || '{}').token || '';
    } catch (e) {
        return '';
    }
}

async function sentirApi(ruta, opciones = {}) {
    const respuesta = await fetch(SENTIR_API + ruta, {
        ...opciones,
        headers: { ...(opciones.headers || {}), Authorization: 'Bearer ' + sentirToken() }
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (respuesta.status === 401) {
        performPsychologistLogout();
        throw new Error(datos.message || 'Tu sesión venció.');
    }
    if (!respuesta.ok) throw new Error(datos.message || 'No se pudo conectar con el servidor.');
    return datos;
}

function capitalizarNombre(valor) {
    return String(valor || '').toLocaleLowerCase('es').replace(/(^|\s)(\p{L})/gu, (m, e, l) => e + l.toLocaleUpperCase('es'));
}

function aplicarPerfilReal(perfil) {
    const u = perfil.usuario;
    const nombre = capitalizarNombre(`${u.nombre} ${u.apellido}`);
    SentirStore.set('psych_profile', {
        ...getPsychProfile(),
        name: nombre,
        nombre: capitalizarNombre(u.nombre),
        apellido: capitalizarNombre(u.apellido),
        role: 'Psicóloga Escolar',
        avatar: u.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=6C4DF6&color=fff&bold=true`,
        email: u.correo,
        celular: u.celular,
        usuario: u,
        cifras: perfil.cifras
    });
    renderHeaderProfile();
}

/* --------------------------------------------------------------------------
   CAMPANITA: avisos guardados en la base de datos (alertas de riesgo, solicitudes
   de ayuda, alertas de docentes y avisos de citas). Todos llegan también por correo.
   -------------------------------------------------------------------------- */
const ICONO_AVISO = {
    alerta_riesgo: '🚨', solicitud_ayuda: '🆘', alerta_docente: '👩‍🏫',
    cita_solicitada: '📅', cita_cancelada_estudiante: '🗓️'
};
let avisosPsicologia = [];

function tiempoRelativo(fecha) {
    const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `Hace ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'Ayer' : `Hace ${d} días`;
}

function pintarNotificaciones() {
    const dropdown = document.getElementById('notifDropdown');
    const bell = document.getElementById('notifBell');
    if (!dropdown || !bell) return;
    const sinLeer = avisosPsicologia.filter(a => !a.leida).length;

    dropdown.innerHTML = `<div class="notif-header">Notificaciones ${sinLeer ? `<button type="button" class="notif-readall" id="notifReadAll">Marcar todo como leído</button>` : ''}</div>`
        + (avisosPsicologia.length
            ? avisosPsicologia.slice(0, 12).map(a => `
                <button type="button" class="notif-item ${a.leida ? '' : 'is-unread'} ${['alto', 'critico'].includes(a.nivel) ? 'is-urgent' : ''}" role="menuitem"
                        data-id="${a.id}" data-goto="${String(a.tipo).startsWith('cita') ? 'agenda.html' : 'alertas.html'}">
                    <span class="notif-title">${ICONO_AVISO[a.tipo] || '🔔'} ${escaparHTML(a.titulo)}</span>
                    <span class="notif-text">${escaparHTML(String(a.mensaje).split('\n').slice(0, 2).join(' '))}</span>
                    <span class="notif-time">${tiempoRelativo(a.fecha)}</span>
                </button>`).join('')
            : '<div class="notif-item" role="status">✅ No tienes notificaciones por ahora</div>')
        + '<button type="button" class="notif-item" role="menuitem" data-goto="agenda.html">📅 Revisa tu agenda de hoy</button>';

    const badge = bell.querySelector('.badge');
    if (badge) {
        badge.textContent = sinLeer > 9 ? '9+' : sinLeer;
        badge.style.display = sinLeer ? 'flex' : 'none';
    }
    bell.setAttribute('aria-label', sinLeer ? `Abrir notificaciones: ${sinLeer} sin leer` : 'Abrir notificaciones');

    dropdown.querySelectorAll('.notif-item[data-goto]').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (item.dataset.id) await marcarNotificacionesLeidas([Number(item.dataset.id)]);
            window.location.href = resolveModulePath(item.dataset.goto);
        });
    });
    const todo = dropdown.querySelector('#notifReadAll');
    if (todo) todo.addEventListener('click', (e) => { e.stopPropagation(); marcarNotificacionesLeidas(); });
}

async function marcarNotificacionesLeidas(ids) {
    if (!avisosPsicologia.some(a => !a.leida && (!ids || ids.includes(a.id)))) return;
    try {
        await sentirApi('/notificaciones/leidas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ids ? { ids } : {})
        });
        avisosPsicologia.forEach(a => { if (!ids || ids.includes(a.id)) a.leida = true; });
        pintarNotificaciones();
    } catch (error) { /* se intentará de nuevo */ }
}

async function refrescarNotificaciones() {
    if (!sentirToken()) return;
    try {
        const datos = await sentirApi('/notificaciones');
        avisosPsicologia = datos.notificaciones || [];
    } catch (error) {
        return;
    }
    // Si el menú está abierto no se redibuja (para no mover lo que se está leyendo)
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown && dropdown.classList.contains('show')) return;
    pintarNotificaciones();
}

async function cargarDatosReales() {
    if (!sentirToken()) return null;
    try {
        const [perfil, inicio] = await Promise.all([sentirApi('/perfil'), sentirApi('/inicio')]);
        aplicarPerfilReal(perfil);
        SentirStore.set('students', inicio.estudiantes || []);
        SentirStore.set('alerts', inicio.alertas || []);
        SentirStore.set('ai_trend', inicio.tendencia || null);
        window.sentirInicio = inicio;
        await cargarCitasReales().catch(error => console.warn('Psicología: no se pudieron cargar las citas:', error.message));

        initSidebarActiveState();
        refrescarNotificaciones();
        checkForNewAlerts();

        document.dispatchEvent(new CustomEvent('sentir:datos', { detail: { perfil, inicio } }));
        const panel = document.getElementById('detailPanel');
        if (panel && panel.classList.contains('open') && panel.dataset.currentStudent) {
            renderStudentCaseContext(getStudents().find(st => st.name === panel.dataset.currentStudent));
        }
        return { perfil, inicio };
    } catch (error) {
        console.warn('Psicología: no se pudieron cargar los datos reales:', error.message);
        if (typeof showToast === 'function') {
            showToast({ title: 'Sin conexión con el servidor', message: 'No se pudieron cargar los datos. Revisa que el backend esté encendido.', icon: 'fa-plug-circle-xmark', type: 'urgent' });
        }
        return null;
    }
}

// Borra los datos de ejemplo que hayan quedado guardados en el navegador de versiones anteriores
function limpiarDatosDeEjemplo() {
    SentirStore.set('alerts', getAlerts().filter(a => String(a.id).startsWith('ayuda-')));
    SentirStore.set('students', getStudents().filter(s => s.idUsuario));
    const intervenciones = getInterventions();
    ['Mateo Silva', 'Isabella Castro', 'Camila Pérez'].forEach(nombre => { delete intervenciones[nombre]; });
    SentirStore.set('interventions', intervenciones);
    const acudientes = getGuardians();
    ['Mateo Silva', 'Isabella Castro', 'Camila Pérez', 'Sofía Ortiz'].forEach(nombre => { delete acudientes[nombre]; });
    SentirStore.set('guardians', acudientes);
    // Citas de ejemplo (ag1–ag4); las que creó la psicóloga se conservan
    SentirStore.set('agenda', getAgenda().filter(a => !['ag1', 'ag2', 'ag3', 'ag4'].includes(a.id)));
    if (!getPsychProfile().usuario) SentirStore.set('psych_profile', SENTIR_DEFAULT_PROFILE);
    const tendencia = getAiTrend();
    if (tendencia && !String(tendencia.topic || '').includes('ánimo bajo')) SentirStore.set('ai_trend', null);
}

function initSentirCore() {
    limpiarDatosDeEjemplo();
    renderHeaderProfile();
    initLogoHome();
    initSidebarActiveState();
    initNotificationDropdown();
    initPsychologistProfileMenu();
    initLogoutButtons();
    initMobileSidebar();
    initStudentPanelActions();
    initAlertWatcher();
    initInactivityLogout();
    cargarDatosReales();
}
