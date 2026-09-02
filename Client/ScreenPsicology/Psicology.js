/* ==========================================================================
   SENTIR CORE ENGINE - INTERACTIVIDAD Y COMPORTAMIENTOS DINÁMICOS ADVANCED
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initViewRouter();
    initSlidingPanelActions();
    initNotificationDropdown();
    initOdometerCounters();
    initLiveFilterSearch();
    initMobileSidebar();

    // Interacciones de la vista Inicio
    initViewAllCases();
    initCreateGroupWorkshop();
    initQuickActions();
    initPsychologistProfileMenu();

    // Interacciones de las nuevas vistas
    initStudentsView();
    initMessagesView();

    // Interactividad "super wow" solicitada: nuevo estudiante, buscadores y editar perfil
    initNewStudentModal();
    initEditProfileModal();
    initAvatarShuffle();

    // Registro e historial de intervenciones psicológicas
    initInterventionModals();

    // Interactividad completa del panel de expediente (contacto, protocolo, derivación)
    initPanelPrimaryAction();
    initPanelSecondaryActions();

    // Interactividad extra: logo, KPIs, agenda, notificaciones, perfil y chat
    initLogoHome();
    initHomeInteractivity();
    initProfileInteractivity();
    initChatAttachButton();
});

/* ==========================================================================
   TOASTS — NOTIFICACIONES FLOTANTES REUTILIZABLES
   ========================================================================== */
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
        <div class="sentir-toast-text">
            <strong>${title}</strong>
            ${message ? `<p>${message}</p>` : ''}
        </div>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3400);
}

/* ==========================================================================
   MODAL GENÉRICO REUTILIZABLE
   ========================================================================== */
function openSentirModal(innerHTML) {
    const overlay = document.createElement('div');
    overlay.className = 'sentir-modal-overlay';
    overlay.innerHTML = `<div class="sentir-modal-box">${innerHTML}</div>`;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('show'));

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSentirModal(overlay);
    });

    return overlay;
}

function closeSentirModal(overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
}

/* ==========================================================================
   0°. MOTOR DE NAVEGACIÓN ENTRE VISTAS (SPA SIN RECARGA)
   ========================================================================== */
function initViewRouter() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.view');

    function updateHeaderSearchVisibility(viewKey) {
        const searchWrapper = document.getElementById('dashboardSearchWrapper');
        if (!searchWrapper) return;
        // La barra de búsqueda superior general solo se muestra en Inicio
        // (Estudiantes, Mensajes y Perfil ya tienen su propio buscador o no lo necesitan)
        const shouldHide = viewKey === 'mensajes' || viewKey === 'perfil' || viewKey === 'estudiantes';
        searchWrapper.classList.toggle('is-hidden', shouldHide);
    }

    function goToView(viewKey) {
        views.forEach(view => {
            view.classList.remove('active');
        });

        const target = document.getElementById(`view-${viewKey}`);
        if (target) {
            // Forzar reinicio de animación de entrada
            void target.offsetWidth;
            target.classList.add('active');
        }

        navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewKey));

        updateHeaderSearchVisibility(viewKey);

        // Reiniciar contadores tipo odómetro cada vez que se visita Inicio o Perfil
        if (viewKey === 'inicio' || viewKey === 'perfil') {
            initOdometerCounters(target);
        }

        // Llevar el scroll arriba al cambiar de sección
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewKey = item.dataset.view;
            goToView(viewKey);

            // Cerrar sidebar automáticamente en móvil
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('panelOverlay');
            if (window.innerWidth <= 900 && sidebar) {
                sidebar.classList.remove('active');
                sidebar.classList.remove('mobile-open');
                if (overlay) overlay.classList.remove('show');
            }
        });
    });

    // Estado inicial correcto de la barra de búsqueda al cargar la página
    const initialView = document.querySelector('.nav-item.active[data-view]');
    updateHeaderSearchVisibility(initialView ? initialView.dataset.view : 'inicio');
}

/* ==========================================================================
   1°. CONTROL DINÁMICO DEL PANEL LATERAL E INYECCIÓN DE DATOS
   ========================================================================== */
function initSlidingPanelActions() {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');

    function bindCard(card, triggerBtn) {
        triggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!panel || !overlay) return;

            const nameEl = card.querySelector('h4');
            const metaEl = card.querySelector('p');
            const avatarEl = card.querySelector('img');

            const studentName = nameEl ? nameEl.innerText : 'Estudiante';
            const studentMeta = metaEl ? metaEl.innerText : '';
            const studentAvatar = avatarEl ? avatarEl.src : '';

            document.getElementById('panelName').innerText = studentName;
            document.getElementById('panelMeta').innerText = studentMeta;
            document.getElementById('panelAvatar').src = studentAvatar;
            panel.dataset.currentStudent = studentName;

            const panelMainBtn = panel.querySelector('.panel-actions .primary-btn');
            if (panelMainBtn) {
                if (triggerBtn.innerText.includes('Protocolo')) {
                    panelMainBtn.innerHTML = `<i class="fa-solid fa-play"></i> Ejecutar Protocolo de Crisis`;
                } else {
                    panelMainBtn.innerHTML = `<i class="fa-solid fa-file-medical"></i> Asignar Test de Ansiedad (GAD-7)`;
                }
            }

            document.body.style.overflow = 'hidden';
            overlay.classList.add('show');
            panel.classList.add('open');
        });
    }

    // Tarjetas grandes de casos prioritarios (Inicio)
    document.querySelectorAll('.student-case-card').forEach(card => {
        const btn = card.querySelector('.btn-primary-action');
        if (btn) bindCard(card, btn);
    });

    // Mini tarjetas de la vista Estudiantes (todo el card es clicable)
    document.querySelectorAll('.mini-student-card').forEach(card => bindMiniStudentCard(card));
}

function bindMiniStudentCard(card) {
    card.addEventListener('click', () => {
        const panel = document.getElementById('detailPanel');
        const overlay = document.getElementById('panelOverlay');
        if (!panel || !overlay) return;

        const name = card.querySelector('h4').innerText;
        const meta = card.querySelector('p').innerText;
        const avatar = card.querySelector('img').src;
        const risk = card.dataset.risk;

        document.getElementById('panelName').innerText = name;
        document.getElementById('panelMeta').innerText = meta;
        document.getElementById('panelAvatar').src = avatar;
        panel.dataset.currentStudent = name;

        const panelMainBtn = panel.querySelector('.panel-actions .primary-btn');
        if (panelMainBtn) {
            panelMainBtn.innerHTML = risk === 'high'
                ? `<i class="fa-solid fa-play"></i> Ejecutar Protocolo de Crisis`
                : `<i class="fa-solid fa-file-medical"></i> Asignar Test de Ansiedad (GAD-7)`;
        }

        document.body.style.overflow = 'hidden';
        overlay.classList.add('show');
        panel.classList.add('open');
    });
}

function closePanel() {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');
    const sidebar = document.querySelector('.sidebar');
    
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    if (sidebar) sidebar.classList.remove('active');

    document.body.style.overflow = '';
}

/* ==========================================================================
   2°. MENÚ FLOTANTE INTERACTIVO DE NOTIFICACIONES
   ========================================================================== */
function initNotificationDropdown() {
    const bell = document.getElementById('notifBell');
    const dropdown = document.getElementById('notifDropdown');
    const badge = bell ? bell.querySelector('.badge') : null;

    if (bell && dropdown) {
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            
            bell.style.transform = 'scale(1.15)';
            setTimeout(() => bell.style.transform = 'scale(1)', 180);
            
            if (badge) badge.style.display = 'none';
        });

        document.addEventListener('click', (e) => {
            if (!bell.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

/* ==========================================================================
   3°. ANIMACIÓN DE NÚMEROS EN CONTADORES KPI (EFECTO ODOMETER)
   ========================================================================== */
function initOdometerCounters(scope) {
    const root = scope || document;
    const elements = root.querySelectorAll('.counter-number');
    
    elements.forEach(element => {
        const rawValue = element.innerText.replace(/,/g, '');
        const targetValue = parseInt(rawValue, 10);
        
        if (isNaN(targetValue)) return;
        
        let start = 0;
        const totalDuration = 1000;
        const totalSteps = 30;
        const incrementalValue = targetValue / totalSteps;
        const intervalTime = totalDuration / totalSteps;
        
        const countInterval = setInterval(() => {
            start += incrementalValue;
            if (start >= targetValue) {
                element.innerText = targetValue.toLocaleString('es-CO');
                clearInterval(countInterval);
            } else {
                element.innerText = Math.floor(start).toLocaleString('es-CO');
            }
        }, intervalTime);
    });
}

/* ==========================================================================
   4°. FILTRADO DINÁMICO AVANZADO DE LA BARRA DE BÚSQUEDA SUPERIOR
   ========================================================================== */
function initLiveFilterSearch() {
    const searchInput = document.getElementById('dashboardSearch');
    const searchWrapper = searchInput ? searchInput.closest('.header-search') : null;

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (searchWrapper) searchWrapper.style.border = '1px solid var(--morado-sentir)';
        });
        searchInput.addEventListener('blur', () => {
            if (searchWrapper) searchWrapper.style.border = '1px solid #E5E7EB';
        });

        searchInput.addEventListener('input', (e) => {
            const rawQuery = e.target.value;
            const query = rawQuery.toLowerCase().trim();
            const activeView = document.querySelector('.view.active');
            const activeViewId = activeView ? activeView.id : 'view-inicio';

            if (activeViewId === 'view-inicio') {
                const caseCards = document.querySelectorAll('#view-inicio .student-case-card');
                caseCards.forEach(card => {
                    const name = card.querySelector('.student-profile h4').innerText.toLowerCase();
                    const id = card.querySelector('.student-profile p').innerText.toLowerCase();

                    if (name.includes(query) || id.includes(query)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.25s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else if (activeViewId === 'view-estudiantes') {
                const studentsSearch = document.getElementById('studentsSearch');
                if (studentsSearch) {
                    studentsSearch.value = rawQuery;
                    if (window.sentirStudents) window.sentirStudents.applyFilters();
                }
            } else if (activeViewId === 'view-mensajes') {
                if (window.sentirMessages) {
                    window.sentirMessages.convSearchInput.value = rawQuery;
                    window.sentirMessages.filterConversations(rawQuery);
                }
            }
        });
    }
}

/* ==========================================================================
   5°. INTERACCIÓN BOTÓN "VER TODOS LOS CASOS" (EFECTO EXPANSIÓN ESTÉTICA)
   ========================================================================== */
function initViewAllCases() {
    const viewAllBtn = document.querySelector('.btn-view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            viewAllBtn.style.transform = 'scale(0.95)';
            setTimeout(() => viewAllBtn.style.transform = 'translateY(-2px)', 150);

            const container = document.querySelector('#view-inicio .cases-container');
            
            if (document.getElementById('extra-case-1')) {
                alert('Todos los casos vigentes ya se encuentran desplegados en pantalla.');
                return;
            }

            const extraCasesHTML = `
                <div class="student-case-card" id="extra-case-1" style="animation: fadeIn 0.4s ease forwards;">
                    <div class="card-header">
                        <div class="student-profile">
                            <img src="https://i.pinimg.com/736x/e2/c5/a6/e2c5a6fffcfe479e16254a6984244c28.jpg" alt="Alejandro Toro" class="student-case-avatar">
                            <div>
                                <h4>Alejandro Toro Restrepo</h4>
                                <p>Grado: 10°3 • ID: #4412</p>
                            </div>
                        </div>
                        <span class="time-tag">Hace 3 horas</span>
                    </div>
                    <div class="case-body">
                        <p class="emotional-state">Estado Emocional: <span class="medium-risk-text">Estrés por Rendimiento</span></p>
                        <p class="detection-reason">
                            <strong>Motivo de alerta:</strong> Elevada volatilidad emocional identificada en respuestas rápidas del ecosistema. Presenta picos de frustración evaluados en la última semana.
                        </p>
                    </div>
                    <div class="card-footer">
                        <span class="badge-risk medium">RIESGO MEDIO</span>
                        <button class="btn-primary-action">Revisar Historial</button>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', extraCasesHTML);
            initSlidingPanelActions();
        });
    }
}

/* ==========================================================================
   6°. INTERACCIÓN "CREAR TALLER GRUPAL" DE LA IA (MODAL DINÁMICO)
   ========================================================================== */
function initCreateGroupWorkshop() {
    const createBtn = document.querySelector('.ai-recommendation-card .btn-secondary');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(30, 27, 75, 0.5); backdrop-filter: blur(4px);
                z-index: 2000; display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease;
            `;
            
            modalOverlay.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 20px; width: 400px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); transform: scale(0.9); transition: transform 0.3s ease;">
                    <h3 style="margin-bottom: 15px; font-size:16px; color:var(--dark-slate); font-weight:700;"><i class="fa-solid fa-users-gear" style="color:var(--morado-sentir)"></i> Agendar Taller Grupal 11°1</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin-bottom: 20px;">La IA preconfiguró los objetivos: Manejo del tiempo y reducción del estrés ante exámenes de estado.</p>
                    <label style="font-size:11px; font-weight:700; display:block; margin-bottom:5px;">SELECCIONAR FECHA DE LA AGENDA:</label>
                    <input type="date" style="width:100%; padding:10px; border-radius:8px; border:1px solid #E2E8F0; margin-bottom:20px; font-family:'Poppins'; font-size:13px;">
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="cancelWorkshop" style="background:#F1F5F9; border:none; padding:10px 15px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer;">Cancelar</button>
                        <button id="confirmWorkshop" style="background:var(--gradiente-sentir); color:white; border:none; padding:10px 15px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer;">Confirmar y Notificar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modalOverlay);
            
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalOverlay.querySelector('div').style.transform = 'scale(1)';
            }, 50);

            modalOverlay.querySelector('#cancelWorkshop').addEventListener('click', () => closeModal(modalOverlay));
            modalOverlay.querySelector('#confirmWorkshop').addEventListener('click', () => {
                alert('¡Éxito! Taller agendado correctamente. Se han enviado las notificaciones al grupo de 11°1.');
                closeModal(modalOverlay);
            });
        });
    }

    function closeModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 300);
    }
}

/* ==========================================================================
   7°. ACCESOS RÁPIDOS LATERALES (FEEDBACK TÁCTIL E INTERACTIVO)
   ========================================================================== */
function initQuickActions() {
    const actionButtons = document.querySelectorAll('.action-pill');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const actionText = button.querySelector('span').innerText;
            
            button.style.background = '#EDF2F7';
            setTimeout(() => button.style.background = 'var(--bg-light)', 200);

            if (actionText.includes('PDF')) {
                simulateExportReport();
            } else if (actionText.includes('derivación')) {
                openQuickDeriveModal();
            } else {
                openNotifyCoordinationModal();
            }
        });
    });
}

/* ==========================================================================
   ACCESOS RÁPIDOS — MODALES DE CADA ACCIÓN
   ========================================================================== */
function simulateExportReport() {
    showToast({
        title: 'Generando reporte clínico',
        message: 'Empaquetando la información bajo cifrado seguro...',
        icon: 'fa-file-export',
        type: 'info'
    });

    setTimeout(() => {
        showToast({
            title: 'Reporte listo',
            message: 'El PDF clínico se descargó correctamente en tu equipo.',
            icon: 'fa-circle-check',
            type: 'success'
        });
    }, 1800);
}

function openQuickDeriveModal() {
    const today = new Date().toISOString().split('T')[0];

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-square-plus"></i></div>
            <div>
                <h3>Registrar Derivación Externa</h3>
                <p>Remisión rápida a una red de apoyo externa</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field">
                <label>ESTUDIANTE</label>
                <input type="text" id="quickDeriveStudent" placeholder="Nombre del estudiante">
            </div>
            <div class="modal-field">
                <label>ENTIDAD DESTINO</label>
                <input type="text" id="quickDeriveEntity" placeholder="Ej. EPS Sura, Fundación de apoyo...">
            </div>
            <div class="modal-field">
                <label>FECHA</label>
                <input type="date" id="quickDeriveDate" value="${today}">
            </div>
            <div class="modal-field">
                <label>MOTIVO</label>
                <textarea id="quickDeriveReason" rows="3" placeholder="Motivo de la derivación"></textarea>
            </div>
            <p class="modal-error" id="quickDeriveError"><i class="fa-solid fa-circle-exclamation"></i> Escribe al menos el nombre del estudiante y la entidad destino.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelQuickDerive">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmQuickDerive"><i class="fa-solid fa-check"></i> Registrar</button>
        </div>
    `);

    overlay.querySelector('#cancelQuickDerive').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#confirmQuickDerive').addEventListener('click', () => {
        const student = overlay.querySelector('#quickDeriveStudent').value.trim();
        const entity = overlay.querySelector('#quickDeriveEntity').value.trim();
        const errorMsg = overlay.querySelector('#quickDeriveError');

        if (!student || !entity) {
            errorMsg.classList.add('show');
            return;
        }
        errorMsg.classList.remove('show');

        const reason = overlay.querySelector('#quickDeriveReason').value.trim();

        addInterventionRecord(student, {
            fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            titulo: `Derivación externa a ${entity}`,
            detalle: reason || 'Derivación registrada desde Accesos Rápidos.'
        });

        closeSentirModal(overlay);
        showToast({
            title: 'Derivación registrada',
            message: `${student} fue remitido a ${entity}.`,
            icon: 'fa-square-plus',
            type: 'success'
        });
    });
}

function openNotifyCoordinationModal() {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-envelope-open-text"></i></div>
            <div>
                <h3>Notificar a Coordinación</h3>
                <p>Envía un aviso directo al equipo de coordinación académica</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field">
                <label>ASUNTO</label>
                <input type="text" id="notifySubject" placeholder="Ej. Seguimiento caso riesgo alto">
            </div>
            <div class="modal-field">
                <label>MENSAJE</label>
                <textarea id="notifyMessage" rows="3" placeholder="Describe la situación a reportar"></textarea>
            </div>
            <div class="modal-field">
                <label>PRIORIDAD</label>
                <div class="risk-select-group" id="notifyPriorityGroup">
                    <div class="risk-option" data-priority="normal">Normal</div>
                    <div class="risk-option selected" data-priority="urgente">Urgente</div>
                </div>
            </div>
            <p class="modal-error" id="notifyError"><i class="fa-solid fa-circle-exclamation"></i> Escribe al menos el mensaje a enviar.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelNotify">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmNotify"><i class="fa-solid fa-paper-plane"></i> Enviar Notificación</button>
        </div>
    `);

    let priority = 'urgente';
    overlay.querySelectorAll('#notifyPriorityGroup .risk-option').forEach(opt => {
        opt.addEventListener('click', () => {
            overlay.querySelectorAll('#notifyPriorityGroup .risk-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            priority = opt.dataset.priority;
        });
    });

    overlay.querySelector('#cancelNotify').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#confirmNotify').addEventListener('click', () => {
        const message = overlay.querySelector('#notifyMessage').value.trim();
        const errorMsg = overlay.querySelector('#notifyError');

        if (!message) {
            errorMsg.classList.add('show');
            return;
        }
        errorMsg.classList.remove('show');

        closeSentirModal(overlay);
        showToast({
            title: 'Coordinación notificada',
            message: `Se envió tu aviso con prioridad ${priority === 'urgente' ? 'urgente' : 'normal'}.`,
            icon: 'fa-envelope-open-text',
            type: priority === 'urgente' ? 'success' : 'info'
        });
    });
}

/* ==========================================================================
   8°. ICONO SUPERIOR DERECHO (MENÚ DE PERFIL DEL PSICÓLOGO)
   ========================================================================== */
function initPsychologistProfileMenu() {
    const profileContainer = document.querySelector('.profile-info');
    if (profileContainer) {
        profileContainer.style.cursor = 'pointer';
        profileContainer.title = 'Ver opciones de perfil';

        profileContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const existingMenu = document.getElementById('profileDropdownMenu');
            if (existingMenu) {
                existingMenu.remove();
                return;
            }

            const profileDropdown = document.createElement('div');
            profileDropdown.id = 'profileDropdownMenu';
            profileDropdown.style.cssText = `
                position: absolute; top: 75px; right: 30px; width: 220px;
                background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border: 1px solid #E2E8F0; overflow: hidden; z-index: 1500;
                animation: fadeIn 0.2s ease forwards;
            `;

            profileDropdown.innerHTML = `
                <div style="padding: 12px 16px; font-size:11px; font-weight:700; color:var(--text-muted); background:var(--bg-light);">SESIÓN ACTIVA</div>
                <div class="p-item" data-goto="perfil" style="padding:12px 16px; font-size:12px; color:var(--dark-slate); border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-id-card" style="margin-right:10px; color:var(--morado-sentir)"></i> Mi Licencia Profesional</div>
                <div class="p-item" data-action="turnos" style="padding:12px 16px; font-size:12px; color:var(--dark-slate); border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-clock-rotate-left" style="margin-right:10px; color:var(--morado-sentir)"></i> Historial de Turnos</div>
                <div class="p-item" style="padding:12px 16px; font-size:12px; color:var(--riesgo-alto); cursor:pointer;"><i class="fa-solid fa-right-from-bracket" style="margin-right:10px;"></i> Cerrar Sesión</div>
            `;

            document.body.appendChild(profileDropdown);

            profileDropdown.querySelectorAll('.p-item').forEach(item => {
                item.addEventListener('mouseenter', () => item.style.background = '#F8FAFC');
                item.addEventListener('mouseleave', () => item.style.background = 'transparent');
                item.addEventListener('click', () => {
                    if (item.innerText.includes('Cerrar')) {
                        alert('Cerrando sesión del sistema Sentir de manera segura...');
                    } else if (item.dataset.goto === 'perfil') {
                        document.querySelector('.nav-item[data-view="perfil"]').click();
                    } else if (item.dataset.action === 'turnos') {
                        openShiftHistoryModal();
                    } else {
                        alert(`Accediendo a: ${item.innerText.trim()}`);
                    }
                    profileDropdown.remove();
                });
            });

            document.addEventListener('click', () => profileDropdown.remove(), { once: true });
        });
    }
}

/* ==========================================================================
   9°. VISTA ESTUDIANTES: FILTRO POR RIESGO + BÚSQUEDA
   ========================================================================== */
function initStudentsView() {
    const grid = document.getElementById('studentsGrid');
    const searchInput = document.getElementById('studentsSearch');
    const chips = document.querySelectorAll('#view-estudiantes .chip');
    const emptyMsg = document.getElementById('studentsEmptyMsg');

    if (!grid) return;

    let currentFilter = 'all';

    function applyFilters() {
        const cards = Array.from(grid.querySelectorAll('.mini-student-card'));
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const matchesRisk = currentFilter === 'all' || card.dataset.risk === currentFilter;
            const matchesQuery = query === '' ||
                card.dataset.name.includes(query) ||
                card.dataset.id.toLowerCase().includes(query);

            const show = matchesRisk && matchesQuery;
            card.style.display = show ? 'block' : 'none';
            if (show) visibleCount++;
        });

        if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter;
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Se expone para que el buscador superior y el modal de nuevo estudiante puedan usarlo
    window.sentirStudents = { applyFilters, grid };
}

/* ==========================================================================
   12°. MODAL "NUEVO ESTUDIANTE" — CREACIÓN EN VIVO CON PREVIEW DE AVATAR
   ========================================================================== */
function initNewStudentModal() {
    const addBtn = document.getElementById('addStudentBtn');
    if (!addBtn) return;

    const riskConfig = {
        high: { label: 'RIESGO ALTO', badgeClass: 'high', moodClass: 'sad', moodDefault: 'Requiere seguimiento cercano', color: 'EF4444' },
        medium: { label: 'RIESGO MEDIO', badgeClass: 'medium', moodClass: 'neutral', moodDefault: 'En observación', color: 'F59E0B' },
        stable: { label: 'ESTABLE', badgeClass: 'stable', moodClass: 'happy', moodDefault: 'Ánimo estable', color: '22C55E' }
    };

    addBtn.addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-user-plus"></i></div>
                <div>
                    <h3>Registrar Nuevo Estudiante</h3>
                    <p>Se sumará al ecosistema emocional de la institución</p>
                </div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-avatar-preview">
                    <img id="newStudentAvatarPreview" src="https://ui-avatars.com/api/?name=Nuevo+Estudiante&background=B8A8FF&color=1E1B4B&bold=true" alt="Vista previa">
                    <span>El avatar se genera automáticamente a partir del nombre y el nivel de riesgo seleccionado.</span>
                </div>

                <div class="modal-field">
                    <label>NOMBRE COMPLETO</label>
                    <input type="text" id="newStudentName" placeholder="Ej. Laura Jiménez Restrepo">
                </div>

                <div class="modal-field-row">
                    <div class="modal-field">
                        <label>GRADO</label>
                        <input type="text" id="newStudentGrade" placeholder="Ej. 10°2">
                    </div>
                    <div class="modal-field">
                        <label>ID ESTUDIANTE</label>
                        <input type="text" id="newStudentId" placeholder="Autogenerado">
                    </div>
                </div>

                <div class="modal-field">
                    <label>NIVEL DE RIESGO</label>
                    <div class="risk-select-group" id="newStudentRiskGroup">
                        <div class="risk-option selected" data-risk="stable">Estable</div>
                        <div class="risk-option" data-risk="medium">Medio</div>
                        <div class="risk-option" data-risk="high">Alto</div>
                    </div>
                </div>

                <div class="modal-field">
                    <label>NOTA EMOCIONAL (OPCIONAL)</label>
                    <input type="text" id="newStudentMood" placeholder="Ej. Ánimo estable, buena participación">
                </div>

                <p class="modal-error" id="newStudentError"><i class="fa-solid fa-circle-exclamation"></i> Escribe al menos el nombre y el grado del estudiante.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="newStudentCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="newStudentConfirm"><i class="fa-solid fa-check"></i> Registrar Estudiante</button>
            </div>
        `);

        let selectedRisk = 'stable';
        const nameInput = overlay.querySelector('#newStudentName');
        const gradeInput = overlay.querySelector('#newStudentGrade');
        const avatarPreview = overlay.querySelector('#newStudentAvatarPreview');
        const riskOptions = overlay.querySelectorAll('.risk-option');
        const errorMsg = overlay.querySelector('#newStudentError');

        function refreshAvatarPreview() {
            const displayName = nameInput.value.trim() || 'Nuevo Estudiante';
            const color = riskConfig[selectedRisk].color;
            avatarPreview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${color}&color=fff&bold=true`;
        }

        nameInput.addEventListener('input', refreshAvatarPreview);

        riskOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                riskOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selectedRisk = opt.dataset.risk;
                refreshAvatarPreview();
            });
        });

        overlay.querySelector('#newStudentCancel').addEventListener('click', () => closeSentirModal(overlay));

        overlay.querySelector('#newStudentConfirm').addEventListener('click', () => {
            const name = nameInput.value.trim();
            const grade = gradeInput.value.trim();

            if (!name || !grade) {
                errorMsg.classList.add('show');
                return;
            }
            errorMsg.classList.remove('show');

            const idInput = overlay.querySelector('#newStudentId').value.trim();
            const moodInput = overlay.querySelector('#newStudentMood').value.trim();
            const studentId = idInput || `#${Math.floor(1000 + Math.random() * 9000)}`;
            const config = riskConfig[selectedRisk];
            const moodText = moodInput || config.moodDefault;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${config.color}&color=fff&bold=true`;

            const card = document.createElement('div');
            card.className = 'mini-student-card card-pop-in';
            card.dataset.risk = selectedRisk;
            card.dataset.name = name.toLowerCase();
            card.dataset.id = studentId;
            card.innerHTML = `
                <span class="badge-risk ${config.badgeClass}">${config.label}</span>
                <img src="${avatarUrl}" class="mini-avatar" alt="${name}">
                <h4>${name}</h4>
                <p>Grado: ${grade} • ID: ${studentId}</p>
                <span class="mood-pill ${config.moodClass}">${selectedRisk === 'stable' ? '😊' : selectedRisk === 'medium' ? '😐' : '😔'} ${moodText}</span>
            `;

            const grid = document.getElementById('studentsGrid');
            grid.prepend(card);
            bindMiniStudentCard(card);

            // Actualizar contador del chip correspondiente y el de "Todos"
            bumpChipCount('all', 1);
            bumpChipCount(selectedRisk, 1);

            if (window.sentirStudents) window.sentirStudents.applyFilters();

            closeSentirModal(overlay);
            showToast({
                title: 'Estudiante registrado',
                message: `${name} ya hace parte del ecosistema Sentir.`,
                icon: 'fa-user-plus',
                type: 'success'
            });
        });
    });
}

function bumpChipCount(filterKey, delta) {
    const chip = document.querySelector(`#view-estudiantes .chip[data-filter="${filterKey}"]`);
    if (!chip) return;
    const span = chip.querySelector('span');
    if (!span) return;
    const current = parseInt(span.innerText.replace(/,/g, ''), 10) || 0;
    span.innerText = (current + delta).toLocaleString('es-CO');
}

/* ==========================================================================
   10°. VISTA MENSAJES: CAMBIO DE CONVERSACIÓN + ENVÍO DE MENSAJES
   ========================================================================== */
function initMessagesView() {
    const convItems = document.querySelectorAll('.conv-item');
    const chatMessages = document.getElementById('chatMessages');
    const chatName = document.getElementById('chatName');
    const chatMeta = document.getElementById('chatMeta');
    const chatAvatar = document.getElementById('chatAvatar');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMsgBtn');
    const openPanelBtn = document.getElementById('chatOpenPanelBtn');

    if (!chatMessages) return;

    const mockThreads = {
        'Mateo Silva': [
            { type: 'received', text: 'Hola profe Juan Carlos, ¿tiene un minuto?' },
            { type: 'received', text: 'Esta semana me ha costado mucho dormir y concentrarme en clase.' },
            { type: 'sent', text: 'Hola Mateo, claro que sí. Gracias por contarme, eso que sientes es válido. ¿Quieres que hablemos hoy a las 2:30pm?' },
            { type: 'received', text: 'Sí, me parece bien. Gracias por escucharme hoy.' }
        ],
        'Camila Pérez': [
            { type: 'received', text: 'Buenos días, quería confirmar la cita de seguimiento.' },
            { type: 'sent', text: 'Hola Camila, va a las 11:00am en el consultorio principal. ¿Te sirve?' },
            { type: 'received', text: 'Sí, ahí estaré a la hora acordada.' }
        ],
        'Alejandro Toro': [
            { type: 'sent', text: 'Hola Alejandro, ¿cómo te fue con el ejercicio de respiración que practicamos?' },
            { type: 'received', text: 'Me sirvió mucho el ejercicio de respiración.' },
            { type: 'received', text: 'Lo hice antes del examen de matemáticas y bajé la ansiedad bastante.' }
        ],
        'Sofía Gómez': [
            { type: 'received', text: 'Profe, ¿el taller de arte sigue en pie esta semana?' },
            { type: 'sent', text: 'Sí Sofía, sigue en pie. Cualquier novedad te aviso con anticipación.' },
            { type: 'received', text: 'Vale, cualquier cosa te escribo.' }
        ],
        'Acudiente · Familia Ortiz': [
            { type: 'sent', text: 'Buenas tardes, les escribo para agendar la próxima cita de seguimiento de Daniel.' },
            { type: 'received', text: 'Buenas tardes, muchas gracias por el acompañamiento.' },
            { type: 'received', text: 'Quedamos atentos a la próxima cita.' }
        ]
    };

    function loadConversation(item) {
        convItems.forEach(c => c.classList.remove('active'));
        item.classList.add('active');

        const name = item.dataset.name;
        const meta = item.dataset.meta;
        const avatar = item.dataset.avatar;

        chatName.innerText = name;
        chatMeta.innerHTML = `<span class="online-dot"></span> ${meta} · En línea`;
        chatAvatar.src = avatar;

        const unread = item.querySelector('.unread-dot');
        if (unread) unread.remove();

        const thread = mockThreads[name] || [
            { type: 'received', text: '¡Hola! Empecemos la conversación.' }
        ];

        chatMessages.innerHTML = '<span class="chat-day-divider">Hoy</span>';
        thread.forEach(m => {
            const div = document.createElement('div');
            div.className = `msg ${m.type}`;
            div.innerText = m.text;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    convItems.forEach(item => {
        item.addEventListener('click', () => loadConversation(item));
    });

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;

        const div = document.createElement('div');
        div.className = 'msg sent';
        div.innerText = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';

        // Respuesta simulada del estudiante para dar sensación de conversación viva
        setTimeout(() => {
            const reply = document.createElement('div');
            reply.className = 'msg received';
            reply.innerText = 'Gracias profe, lo tendré en cuenta 🙏';
            chatMessages.appendChild(reply);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1100);
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    if (openPanelBtn) {
        openPanelBtn.addEventListener('click', () => {
            const activeConv = document.querySelector('.conv-item.active');
            if (!activeConv) return;

            const panel = document.getElementById('detailPanel');

            document.getElementById('panelName').innerText = activeConv.dataset.name;
            document.getElementById('panelMeta').innerText = activeConv.dataset.meta;
            document.getElementById('panelAvatar').src = activeConv.dataset.avatar;
            if (panel) panel.dataset.currentStudent = activeConv.dataset.name;

            document.body.style.overflow = 'hidden';
            document.getElementById('panelOverlay').classList.add('show');
            document.getElementById('detailPanel').classList.add('open');
        });
    }

    // Buscador de conversaciones (barra superior de la bandeja de Mensajes)
    const convSearchInput = document.getElementById('convSearchInput');
    const convEmptyState = document.getElementById('convEmptyState');

    function filterConversations(rawQuery) {
        const query = (rawQuery || '').toLowerCase().trim();
        let visibleCount = 0;

        convItems.forEach(item => {
            const matches = query === '' || item.dataset.name.toLowerCase().includes(query);
            item.style.display = matches ? 'flex' : 'none';
            if (matches) visibleCount++;
        });

        if (convEmptyState) convEmptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (convSearchInput) {
        convSearchInput.addEventListener('input', (e) => filterConversations(e.target.value));
    }

    // Se expone para que el buscador superior del header también pueda filtrar conversaciones
    window.sentirMessages = { filterConversations, convSearchInput };
}

/* ==========================================================================
   13°. MODAL "EDITAR PERFIL" — ACTUALIZACIÓN EN VIVO DE LA VISTA PERFIL
   ========================================================================== */
function initEditProfileModal() {
    const editBtn = document.getElementById('editProfileBtn');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
        const currentName = document.getElementById('profileHeroName').innerText;
        const currentSubtitle = document.getElementById('profileHeroSubtitle').innerText;
        const currentEmail = document.getElementById('infoEmail').innerText;
        const currentEspecialidad = document.getElementById('infoEspecialidad').innerText;
        const currentSedes = document.getElementById('infoSedes').innerText;
        const currentHorario = document.getElementById('infoHorario').innerText;
        const currentIdiomas = document.getElementById('infoIdiomas').innerText;

        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-user-pen"></i></div>
                <div>
                    <h3>Editar Perfil Profesional</h3>
                    <p>Estos datos se verán reflejados en toda la plataforma Sentir</p>
                </div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field">
                    <label>NOMBRE COMPLETO</label>
                    <input type="text" id="editName" value="${currentName}">
                </div>
                <div class="modal-field">
                    <label>CARGO Y SEDE</label>
                    <input type="text" id="editSubtitle" value="${currentSubtitle}">
                </div>
                <div class="modal-field">
                    <label>CORREO INSTITUCIONAL</label>
                    <input type="email" id="editEmail" value="${currentEmail}">
                </div>
                <div class="modal-field">
                    <label>ESPECIALIDAD</label>
                    <input type="text" id="editEspecialidad" value="${currentEspecialidad}">
                </div>
                <div class="modal-field-row">
                    <div class="modal-field">
                        <label>SEDES A CARGO</label>
                        <input type="text" id="editSedes" value="${currentSedes}">
                    </div>
                    <div class="modal-field">
                        <label>IDIOMAS</label>
                        <input type="text" id="editIdiomas" value="${currentIdiomas}">
                    </div>
                </div>
                <div class="modal-field">
                    <label>HORARIO DE ATENCIÓN</label>
                    <input type="text" id="editHorario" value="${currentHorario}">
                </div>
                <p class="modal-error" id="editProfileError"><i class="fa-solid fa-circle-exclamation"></i> El nombre no puede quedar vacío.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="editProfileCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="editProfileConfirm"><i class="fa-solid fa-check"></i> Guardar Cambios</button>
            </div>
        `);

        overlay.querySelector('#editProfileCancel').addEventListener('click', () => closeSentirModal(overlay));

        overlay.querySelector('#editProfileConfirm').addEventListener('click', () => {
            const name = overlay.querySelector('#editName').value.trim();
            const errorMsg = overlay.querySelector('#editProfileError');

            if (!name) {
                errorMsg.classList.add('show');
                return;
            }
            errorMsg.classList.remove('show');

            document.getElementById('profileHeroName').innerText = name;
            document.getElementById('profileHeroSubtitle').innerText = overlay.querySelector('#editSubtitle').value.trim();
            document.getElementById('infoEmail').innerText = overlay.querySelector('#editEmail').value.trim();
            document.getElementById('infoEspecialidad').innerText = overlay.querySelector('#editEspecialidad').value.trim();
            document.getElementById('infoSedes').innerText = overlay.querySelector('#editSedes').value.trim();
            document.getElementById('infoIdiomas').innerText = overlay.querySelector('#editIdiomas').value.trim();
            document.getElementById('infoHorario').innerText = overlay.querySelector('#editHorario').value.trim();

            // Reflejar el primer nombre en el header también, para consistencia
            const headerNameEl = document.querySelector('.profile-info h4');
            if (headerNameEl) headerNameEl.innerText = name.split(' ').slice(0, 2).join(' ');

            closeSentirModal(overlay);
            showToast({
                title: 'Perfil actualizado',
                message: 'Tus datos profesionales se guardaron correctamente.',
                icon: 'fa-user-pen',
                type: 'success'
            });
        });
    });
}

/* ==========================================================================
   14°. CAMBIO DE FOTO DE PERFIL (AVATAR SHUFFLE)
   ========================================================================== */
function initAvatarShuffle() {
    const avatarBtn = document.getElementById('avatarEditBtn');
    const heroAvatar = document.getElementById('profileHeroAvatar');
    if (!avatarBtn || !heroAvatar) return;

    const avatarOptions = [
        'https://i.pinimg.com/736x/4c/8c/66/4c8c66044a8fc28263c2779d1fad16cf.jpg',
        'https://ui-avatars.com/api/?name=Juan+Carlos&background=6C4DF6&color=fff&bold=true',
        'https://ui-avatars.com/api/?name=Juan+Carlos&background=65B8FF&color=1E1B4B&bold=true',
        'https://ui-avatars.com/api/?name=Juan+Carlos&background=4E2FC7&color=fff&bold=true'
    ];
    let currentIndex = 0;

    avatarBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % avatarOptions.length;
        heroAvatar.src = avatarOptions[currentIndex];

        heroAvatar.classList.remove('avatar-pop');
        void heroAvatar.offsetWidth;
        heroAvatar.classList.add('avatar-pop');

        const headerAvatar = document.querySelector('.avatar-img');
        if (headerAvatar) headerAvatar.src = avatarOptions[currentIndex];

        showToast({
            title: 'Foto de perfil actualizada',
            message: 'Tu nueva foto ya es visible en toda la plataforma.',
            icon: 'fa-camera',
            type: 'info'
        });
    });
}

/* ==========================================================================
   15°. HISTORIAL Y REGISTRO DE INTERVENCIONES PSICOLÓGICAS
   ========================================================================== */

// Base de datos simulada (en memoria) del historial de intervenciones por estudiante.
// Se usa el nombre visible en el panel como llave para asociar los registros.
const interventionHistoryStore = {
    'Mateo Silva': [
        {
            fecha: '10 Jun 2026',
            titulo: 'Intervención por riesgo alto',
            detalle: 'Se identificó ansiedad severa y aislamiento social a partir del diario emocional. Se activó protocolo de acompañamiento y se contactó al acudiente para seguimiento conjunto.'
        },
        {
            fecha: '2 Mar 2026',
            titulo: 'Seguimiento académico',
            detalle: 'Reporte docente por bajo rendimiento asociado a estrés. Se brindaron pautas de manejo del tiempo y técnicas de respiración.'
        }
    ],
    'Isabella Castro': [
        {
            fecha: '22 Jul 2026',
            titulo: 'Caso de alto riesgo anterior',
            detalle: 'Episodio de aislamiento social prolongado detectado por el ecosistema Sentir. Se realizó acompañamiento semanal durante 6 semanas con evolución positiva.'
        },
        {
            fecha: '30 Ene 2026',
            titulo: 'Primera valoración',
            detalle: 'Ingreso al proceso de acompañamiento psicológico por remisión docente. Se estableció plan inicial de seguimiento.'
        }
    ],
    'Camila Pérez': [
        {
            fecha: '15 Ago 2026',
            titulo: 'Seguimiento de tristeza prolongada',
            detalle: 'Se evidenció caída sostenida del ánimo reportado en la app durante 7 días. Se citó a sesión individual y se acordó seguimiento quincenal.'
        }
    ]
};

function getStudentHistory(name) {
    return interventionHistoryStore[name] || [];
}

function addInterventionRecord(name, record) {
    if (!interventionHistoryStore[name]) interventionHistoryStore[name] = [];
    interventionHistoryStore[name].unshift(record);
}

function initInterventionModals() {
    const panel = document.getElementById('detailPanel');
    const registerBtn = document.getElementById('registerInterventionBtn');
    const historyBtn = document.getElementById('viewInterventionHistoryBtn');

    if (!panel) return;

    function getCurrentStudentName() {
        return panel.dataset.currentStudent || document.getElementById('panelName').innerText;
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            openRegisterInterventionModal(getCurrentStudentName());
        });
    }

    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            openInterventionHistoryModal(getCurrentStudentName());
        });
    }
}

function openInterventionHistoryModal(studentName) {
    const history = getStudentHistory(studentName);

    const listHTML = history.length
        ? history.map(item => `
            <div class="history-entry">
                <div class="history-entry-dot"></div>
                <div class="history-entry-content">
                    <div class="history-entry-top">
                        <strong>${item.titulo}</strong>
                        <span>${item.fecha}</span>
                    </div>
                    <p>${item.detalle}</p>
                </div>
            </div>
        `).join('')
        : `<p class="history-empty"><i class="fa-solid fa-folder-open" style="display:block; font-size:20px; margin-bottom:8px; color:var(--lavanda);"></i>Este estudiante aún no registra intervenciones previas en el sistema.</p>`;

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <div>
                <h3>Historial de Intervenciones</h3>
                <p>${studentName} · Proceso de acompañamiento psicológico</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="history-timeline">
                ${listHTML}
            </div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeHistoryModal">Cerrar</button>
        </div>
    `);

    overlay.querySelector('#closeHistoryModal').addEventListener('click', () => closeSentirModal(overlay));
}

function openRegisterInterventionModal(studentName) {
    const today = new Date().toISOString().split('T')[0];

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-notes-medical"></i></div>
            <div>
                <h3>Registrar Intervención</h3>
                <p>${studentName} · Se sumará al historial de acompañamiento</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field">
                <label>FECHA DE LA INTERVENCIÓN</label>
                <input type="date" id="interventionDate" value="${today}">
            </div>
            <div class="modal-field">
                <label>FACTORES IDENTIFICADOS</label>
                <textarea id="interventionFactors" rows="2" placeholder="Ej. Ansiedad, aislamiento social, bajo rendimiento académico..."></textarea>
            </div>
            <div class="modal-field">
                <label>SITUACIÓN</label>
                <textarea id="interventionSituation" rows="2" placeholder="Describe brevemente la situación actual del estudiante"></textarea>
            </div>
            <div class="modal-field">
                <label>CAUSAS IDENTIFICADAS</label>
                <textarea id="interventionCauses" rows="2" placeholder="Posibles causas asociadas a la situación"></textarea>
            </div>
            <div class="modal-field">
                <label>PROCESO REALIZADO</label>
                <textarea id="interventionProcess" rows="2" placeholder="Acciones y estrategias aplicadas durante la intervención"></textarea>
            </div>
            <div class="modal-field">
                <label>AVANCE / EVOLUCIÓN</label>
                <textarea id="interventionProgress" rows="2" placeholder="Evolución observada tras la intervención"></textarea>
            </div>
            <p class="modal-error" id="interventionError"><i class="fa-solid fa-circle-exclamation"></i> Describe al menos la situación y el proceso realizado.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelIntervention">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmIntervention"><i class="fa-solid fa-check"></i> Guardar Intervención</button>
        </div>
    `);

    overlay.querySelector('#cancelIntervention').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#confirmIntervention').addEventListener('click', () => {
        const situation = overlay.querySelector('#interventionSituation').value.trim();
        const process = overlay.querySelector('#interventionProcess').value.trim();
        const errorMsg = overlay.querySelector('#interventionError');

        if (!situation || !process) {
            errorMsg.classList.add('show');
            return;
        }
        errorMsg.classList.remove('show');

        const factors = overlay.querySelector('#interventionFactors').value.trim();
        const causes = overlay.querySelector('#interventionCauses').value.trim();
        const progress = overlay.querySelector('#interventionProgress').value.trim();
        const dateValue = overlay.querySelector('#interventionDate').value;
        const formattedDate = dateValue
            ? new Date(dateValue + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Sin fecha';

        const detailParts = [];
        if (factors) detailParts.push(`Factores: ${factors}.`);
        detailParts.push(`Situación: ${situation}.`);
        if (causes) detailParts.push(`Causas: ${causes}.`);
        detailParts.push(`Proceso realizado: ${process}.`);
        if (progress) detailParts.push(`Avance: ${progress}.`);

        addInterventionRecord(studentName, {
            fecha: formattedDate,
            titulo: 'Intervención registrada',
            detalle: detailParts.join(' ')
        });

        closeSentirModal(overlay);
        showToast({
            title: 'Intervención registrada',
            message: `Se guardó el nuevo registro en el historial de ${studentName}.`,
            icon: 'fa-notes-medical',
            type: 'success'
        });
    });
}

/* ==========================================================================
   16°. CLIC EN EL LOGO — SIEMPRE REGRESA A LA VISTA DE INICIO
   ========================================================================== */
function initLogoHome() {
    const logo = document.getElementById('logoHomeBtn');
    if (!logo) return;

    logo.addEventListener('click', () => {
        const inicioNavItem = document.querySelector('.nav-item[data-view="inicio"]');
        if (inicioNavItem) inicioNavItem.click();
    });
}

/* ==========================================================================
   17°. UTILIDADES DE NAVEGACIÓN CONTEXTUAL (compartidas entre vistas)
   ========================================================================== */
function openPanelForStudentName(name) {
    const target = Array.from(document.querySelectorAll('.student-case-card, .mini-student-card'))
        .find(card => card.querySelector('h4') && card.querySelector('h4').innerText.trim() === name);

    if (target) {
        const triggerBtn = target.querySelector('.btn-primary-action');
        if (triggerBtn) {
            triggerBtn.click();
        } else {
            target.click();
        }
        return;
    }

    // Si la tarjeta no está visible en pantalla, igual mostramos el expediente disponible
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');
    if (!panel || !overlay) return;

    document.getElementById('panelName').innerText = name;
    panel.dataset.currentStudent = name;
    document.body.style.overflow = 'hidden';
    overlay.classList.add('show');
    panel.classList.add('open');
}

function goToStudentsFilter(filterKey) {
    const estudiantesNav = document.querySelector('.nav-item[data-view="estudiantes"]');
    if (estudiantesNav) estudiantesNav.click();

    setTimeout(() => {
        const chip = document.querySelector(`#view-estudiantes .chip[data-filter="${filterKey}"]`);
        if (chip) chip.click();
    }, 350);
}

/* ==========================================================================
   18°. INTERACTIVIDAD EXTRA — VISTA INICIO (KPIs, ánimo, agenda, notificaciones)
   ========================================================================== */
function initHomeInteractivity() {
    // Tarjetas KPI clicables: llevan al filtro o vista relacionada
    document.querySelectorAll('#view-inicio .kpi-card').forEach(card => {
        card.addEventListener('click', () => {
            const label = card.querySelector('p').innerText.toLowerCase();

            if (label.includes('riesgo alto')) {
                goToStudentsFilter('high');
            } else if (label.includes('evaluados')) {
                goToStudentsFilter('all');
            } else if (label.includes('casos cerrados')) {
                showToast({
                    title: 'Casos cerrados este período',
                    message: '45 casos fueron cerrados con seguimiento satisfactorio.',
                    icon: 'fa-circle-check',
                    type: 'success'
                });
            } else if (label.includes('intervenciones hoy')) {
                document.querySelector('.nav-item[data-view="mensajes"]').click();
            }
        });
    });

    // Indicadores de ánimo institucional: muestran detalle rápido
    document.querySelectorAll('#view-inicio .mood-emoji').forEach(pill => {
        pill.addEventListener('click', () => {
            const text = pill.innerText;
            showToast({
                title: 'Distribución de ánimo institucional',
                message: `${text} de los estudiantes evaluados hoy se encuentran en este estado.`,
                icon: 'fa-face-smile',
                type: 'info'
            });
        });
    });

    // Agenda de intervenciones: abre el expediente del estudiante relacionado
    document.querySelectorAll('#view-inicio .agenda-list li').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.innerText.replace(/\s+/g, ' ').trim();
            let studentName = null;

            if (text.includes('Carlos Mendoza')) studentName = 'Carlos Mendoza';
            else if (text.includes('Sofía Gómez')) studentName = 'Sofía Gómez';
            else if (text.includes('#8841')) studentName = 'Mateo Silva';

            if (studentName) {
                openPanelForStudentName(studentName);
            } else {
                showToast({ title: 'Detalle de la cita', message: text, icon: 'fa-calendar-check', type: 'info' });
            }
        });
    });

    // Notificaciones del desplegable de la campana: navegación contextual
    document.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = item.innerText;
            const dropdown = document.getElementById('notifDropdown');

            if (text.includes('Mateo Silva')) {
                document.querySelector('.nav-item[data-view="inicio"]').click();
                setTimeout(() => openPanelForStudentName('Mateo Silva'), 500);
            } else if (text.includes('cita')) {
                document.querySelector('.nav-item[data-view="inicio"]').click();
                setTimeout(() => {
                    const agenda = document.querySelector('#view-inicio .sidebar-box');
                    if (agenda) agenda.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 400);
            } else if (text.includes('sugerencia')) {
                document.querySelector('.nav-item[data-view="inicio"]').click();
                setTimeout(() => {
                    const aiCard = document.querySelector('.ai-recommendation-card');
                    if (aiCard) aiCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 400);
            }

            if (dropdown) dropdown.classList.remove('show');
        });
    });
}

/* ==========================================================================
   19°. INTERACTIVIDAD EXTRA — VISTA PERFIL (tags, switches, actividad reciente)
   ========================================================================== */
function initProfileInteractivity() {
    // Tags de credenciales profesionales: muestran información ampliada
    document.querySelectorAll('#view-perfil .profile-tags span').forEach(tag => {
        tag.addEventListener('click', () => {
            const text = tag.innerText.trim();
            showToast({
                title: text,
                message: 'Información verificada dentro del sistema Sentir.',
                icon: 'fa-circle-info',
                type: 'info'
            });
        });
    });

    // Switches de preferencias: feedback inmediato al activar/desactivar
    document.querySelectorAll('#view-perfil .toggle-row .switch input').forEach(input => {
        input.addEventListener('change', () => {
            const label = input.closest('.toggle-row').querySelector('strong').innerText;
            showToast({
                title: 'Preferencia actualizada',
                message: `${label}: ${input.checked ? 'activado' : 'desactivado'}.`,
                icon: input.checked ? 'fa-toggle-on' : 'fa-toggle-off',
                type: input.checked ? 'success' : 'info'
            });
        });
    });

    // Actividad reciente: navega al contexto relacionado con cada evento
    document.querySelectorAll('#view-perfil .activity-list li').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.innerText;

            if (text.includes('Mateo Silva')) {
                openActivityDetailModal({
                    icon: 'fa-file-medical',
                    title: 'Test GAD-7 asignado',
                    time: 'Hace 20 min',
                    description: 'Enviaste la Escala de Ansiedad Generalizada (GAD-7) a Mateo Silva (Grado 11°1) tras la alerta de riesgo alto detectada por Sentir AI. El estudiante recibirá el test en su perfil de la app y quedarás notificado en cuanto lo complete.',
                    actionLabel: 'Ver expediente del estudiante',
                    onAction: () => {
                        document.querySelector('.nav-item[data-view="inicio"]').click();
                        setTimeout(() => openPanelForStudentName('Mateo Silva'), 500);
                    }
                });
            } else if (text.includes('Camila Pérez')) {
                openActivityDetailModal({
                    icon: 'fa-comments',
                    title: 'Mensaje respondido',
                    time: 'Hace 3 horas',
                    description: 'Le confirmaste a Camila Pérez (Grado 9°4) la cita de seguimiento a las 11:00am en el consultorio principal, en respuesta a su mensaje por el canal de comunicación directa.',
                    actionLabel: 'Abrir conversación',
                    onAction: () => {
                        document.querySelector('.nav-item[data-view="mensajes"]').click();
                        setTimeout(() => {
                            const convItem = Array.from(document.querySelectorAll('.conv-item')).find(c => c.dataset.name === 'Camila Pérez');
                            if (convItem) convItem.click();
                        }, 350);
                    }
                });
            } else if (text.includes('taller grupal')) {
                openActivityDetailModal({
                    icon: 'fa-users-gear',
                    title: 'Taller grupal agendado',
                    time: 'Ayer',
                    description: 'Agendaste un taller grupal de manejo del tiempo y técnicas de respiración diafragmática para el grado 11°1, siguiendo la sugerencia de Sentir AI por el incremento del 15% en reportes de estrés académico ante la proximidad de los exámenes de estado.',
                    actionLabel: 'Ver sugerencia de la IA',
                    onAction: () => {
                        document.querySelector('.nav-item[data-view="inicio"]').click();
                        setTimeout(() => {
                            const aiCard = document.querySelector('.ai-recommendation-card');
                            if (aiCard) aiCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 400);
                    }
                });
            } else if (text.includes('red de apoyo')) {
                openActivityDetailModal({
                    icon: 'fa-house-medical',
                    title: 'Derivación a red de apoyo médica',
                    time: 'Hace 2 días',
                    description: 'Derivaste un caso de aislamiento social prolongado a la red de apoyo médica externa institucional, con el fin de complementar el proceso de acompañamiento psicológico con atención especializada.'
                });
            }
        });
    });
}

/* ==========================================================================
   25°. MODAL DE DETALLE — "ACTIVIDAD RECIENTE" (VISTA PERFIL)
   ========================================================================== */
function openActivityDetailModal(detail) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid ${detail.icon}"></i></div>
            <div>
                <h3>${detail.title}</h3>
                <p>${detail.time}</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <p class="activity-detail-text">${detail.description}</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeActivityDetail">Cerrar</button>
            ${detail.actionLabel ? `<button class="modal-btn-confirm" id="activityDetailAction"><i class="fa-solid fa-arrow-right"></i> ${detail.actionLabel}</button>` : ''}
        </div>
    `);

    overlay.querySelector('#closeActivityDetail').addEventListener('click', () => closeSentirModal(overlay));

    const actionBtn = overlay.querySelector('#activityDetailAction');
    if (actionBtn && detail.onAction) {
        actionBtn.addEventListener('click', () => {
            closeSentirModal(overlay);
            detail.onAction();
        });
    }
}

/* ==========================================================================
   20°. BOTÓN DE ADJUNTAR ARCHIVO/EVIDENCIA EN EL CHAT (VISTA MENSAJES)
   ========================================================================== */
function initChatAttachButton() {
    const attachBtn = document.querySelector('.chat-input-area .chat-icon-btn[title="Adjuntar"]');
    const chatMessages = document.getElementById('chatMessages');
    if (!attachBtn || !chatMessages) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'chatFileInput';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    attachBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const bubble = document.createElement('div');
        bubble.className = 'msg sent file-msg';
        bubble.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${file.name}`;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        showToast({
            title: 'Evidencia adjuntada',
            message: `"${file.name}" se envió como evidencia dentro de la conversación.`,
            icon: 'fa-paperclip',
            type: 'success'
        });

        fileInput.value = '';
    });
}

/* ==========================================================================
   21°. CONTACTOS DE ACUDIENTE — "CONTACTAR ACUDIENTE DE INMEDIATO"
   ========================================================================== */

// Directorio simulado de contactos de acudientes por estudiante
const guardianContactsStore = {
    'Mateo Silva': [
        { nombre: 'Marcela Silva', parentesco: 'Madre', telefono: '+57 300 456 7812', principal: true },
        { nombre: 'Andrés Silva', parentesco: 'Padre', telefono: '+57 315 220 9034', principal: false }
    ],
    'Camila Pérez': [
        { nombre: 'Luisa Pérez', parentesco: 'Madre', telefono: '+57 301 998 2245', principal: true },
        { nombre: 'Jorge Pérez', parentesco: 'Padre', telefono: '+57 320 447 1189', principal: false }
    ],
    'Isabella Castro': [
        { nombre: 'Diana Castro', parentesco: 'Madre', telefono: '+57 312 764 1120', principal: true },
        { nombre: 'Rosa Castro', parentesco: 'Tía · Contacto de emergencia', telefono: '+57 300 812 4471', principal: false }
    ],
    'Alejandro Toro Restrepo': [
        { nombre: 'Marta Restrepo', parentesco: 'Madre', telefono: '+57 313 502 6640', principal: true }
    ],
    'Daniel Ortiz': [
        { nombre: 'Familia Ortiz', parentesco: 'Acudiente principal', telefono: '+57 302 771 9930', principal: true }
    ]
};

function getGuardianContacts(name) {
    return guardianContactsStore[name] || [
        { nombre: 'Acudiente registrado', parentesco: 'Contacto principal en el sistema', telefono: 'No registrado', principal: true }
    ];
}

function openContactGuardianModal(studentName) {
    const contacts = getGuardianContacts(studentName);

    const listHTML = contacts.map(c => `
        <div class="contact-entry ${c.principal ? 'is-principal' : ''}">
            <div class="contact-entry-icon"><i class="fa-solid fa-user"></i></div>
            <div class="contact-entry-info">
                <div class="contact-entry-top">
                    <strong>${c.nombre}</strong>
                    ${c.principal ? '<span class="contact-principal-tag">Contacto principal</span>' : ''}
                </div>
                <p>${c.parentesco}</p>
            </div>
            <a class="contact-call-btn" href="tel:${c.telefono.replace(/\s+/g, '')}" data-tel="${c.telefono}">
                <i class="fa-solid fa-phone"></i> ${c.telefono}
            </a>
        </div>
    `).join('');

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon" style="background:#FEF2F2; color:var(--riesgo-alto);"><i class="fa-solid fa-phone-volume"></i></div>
            <div>
                <h3>Contactar Acudiente</h3>
                <p>${studentName} · Contactos registrados de emergencia</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="contact-list">${listHTML}</div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeContactModal">Cerrar</button>
        </div>
    `);

    overlay.querySelectorAll('.contact-call-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast({
                title: 'Llamando…',
                message: `Iniciando llamada a ${btn.dataset.tel}`,
                icon: 'fa-phone',
                type: 'info'
            });
        });
    });

    overlay.querySelector('#closeContactModal').addEventListener('click', () => closeSentirModal(overlay));
}

/* ==========================================================================
   22°. PROTOCOLO DE CRISIS / ASIGNAR TEST GAD-7 (BOTÓN PRINCIPAL DEL PANEL)
   ========================================================================== */
function openCrisisProtocolModal(studentName) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon" style="background: var(--gradiente-sentir);"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div>
                <h3>Ejecutar Protocolo de Crisis</h3>
                <p>${studentName} · Ruta institucional de atención inmediata</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="protocol-steps">
                <div class="protocol-step"><i class="fa-solid fa-circle-check"></i> Aislar al estudiante en un espacio seguro y acompañado</div>
                <div class="protocol-step"><i class="fa-solid fa-circle-check"></i> Notificar de inmediato a Coordinación y Rectoría</div>
                <div class="protocol-step"><i class="fa-solid fa-circle-check"></i> Contactar al acudiente principal registrado</div>
                <div class="protocol-step"><i class="fa-solid fa-circle-check"></i> Activar ruta de remisión a red de apoyo externa si aplica</div>
                <div class="protocol-step"><i class="fa-solid fa-circle-check"></i> Registrar la activación en la bitácora institucional</div>
            </div>
            <p class="protocol-warning"><i class="fa-solid fa-circle-exclamation"></i> Esta acción notificará de inmediato a todo el equipo de bienestar.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelCrisisProtocol">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmCrisisProtocol" style="background:var(--riesgo-alto);"><i class="fa-solid fa-bolt"></i> Confirmar Activación</button>
        </div>
    `);

    overlay.querySelector('#cancelCrisisProtocol').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#confirmCrisisProtocol').addEventListener('click', () => {
        closeSentirModal(overlay);
        showToast({
            title: 'Protocolo de crisis activado',
            message: `Se notificó a coordinación y a los acudientes de ${studentName}. Equipo de bienestar en camino.`,
            icon: 'fa-triangle-exclamation',
            type: 'success'
        });

        addInterventionRecord(studentName, {
            fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            titulo: 'Protocolo de crisis activado',
            detalle: 'Se activó la ruta institucional de crisis: aislamiento seguro, notificación a coordinación y contacto con acudientes.'
        });
    });
}

function openAssignTestConfirmation(studentName) {
    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-file-medical"></i></div>
            <div>
                <h3>Asignar Test de Ansiedad (GAD-7)</h3>
                <p>${studentName} · Escala de ansiedad generalizada</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <p style="font-size:12.5px; color:#4B5563; line-height:1.6;">Se enviará el test GAD-7 directamente al perfil del estudiante en la app Sentir. Recibirás una notificación en cuanto lo complete.</p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelAssignTest">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmAssignTest"><i class="fa-solid fa-paper-plane"></i> Enviar Test</button>
        </div>
    `);

    overlay.querySelector('#cancelAssignTest').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#confirmAssignTest').addEventListener('click', () => {
        closeSentirModal(overlay);
        showToast({
            title: 'Test GAD-7 enviado',
            message: `${studentName} recibirá el test de ansiedad en su perfil de la app.`,
            icon: 'fa-file-medical',
            type: 'success'
        });

        addInterventionRecord(studentName, {
            fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            titulo: 'Test GAD-7 asignado',
            detalle: 'Se envió la escala de ansiedad generalizada (GAD-7) al perfil del estudiante en la app.'
        });
    });
}

function initPanelPrimaryAction() {
    const btn = document.getElementById('panelPrimaryActionBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const panel = document.getElementById('detailPanel');
        const studentName = panel.dataset.currentStudent || document.getElementById('panelName').innerText;

        if (btn.innerText.includes('Protocolo de Crisis')) {
            openCrisisProtocolModal(studentName);
        } else {
            openAssignTestConfirmation(studentName);
        }
    });
}

/* ==========================================================================
   23°. DERIVAR A RED DE APOYO MÉDICA (BOTÓN DEL PANEL)
   ========================================================================== */
function openDeriveNetworkModal(studentName) {
    const today = new Date().toISOString().split('T')[0];

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-house-medical"></i></div>
            <div>
                <h3>Derivar a Red de Apoyo Médica</h3>
                <p>${studentName} · Remisión a atención externa</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field">
                <label>RED / ENTIDAD DE DESTINO</label>
                <select id="deriveNetworkSelect">
                    <option>EPS Sura</option>
                    <option>Nueva EPS</option>
                    <option>Fundación Apoyo Emocional Local</option>
                    <option>Hospital Universitario de referencia</option>
                    <option>Otra red externa</option>
                </select>
            </div>
            <div class="modal-field">
                <label>FECHA DE REMISIÓN</label>
                <input type="date" id="deriveDate" value="${today}">
            </div>
            <div class="modal-field">
                <label>MOTIVO DE LA DERIVACIÓN</label>
                <textarea id="deriveReason" rows="3" placeholder="Describe brevemente el motivo de la remisión"></textarea>
            </div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cancelDerive">Cancelar</button>
            <button class="modal-btn-confirm" id="confirmDerive"><i class="fa-solid fa-check"></i> Confirmar Derivación</button>
        </div>
    `);

    overlay.querySelector('#cancelDerive').addEventListener('click', () => closeSentirModal(overlay));

    overlay.querySelector('#confirmDerive').addEventListener('click', () => {
        const network = overlay.querySelector('#deriveNetworkSelect').value;
        const reason = overlay.querySelector('#deriveReason').value.trim();

        closeSentirModal(overlay);
        showToast({
            title: 'Derivación registrada',
            message: `${studentName} fue remitido a ${network}.`,
            icon: 'fa-house-medical',
            type: 'success'
        });

        addInterventionRecord(studentName, {
            fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            titulo: `Derivación a ${network}`,
            detalle: reason || 'Se remitió el caso a la red de apoyo médica externa para atención complementaria.'
        });
    });
}

function initPanelSecondaryActions() {
    const contactBtn = document.getElementById('panelContactBtn');
    const deriveBtn = document.getElementById('panelDeriveBtn');
    const panel = document.getElementById('detailPanel');
    if (!panel) return;

    function getCurrentStudentName() {
        return panel.dataset.currentStudent || document.getElementById('panelName').innerText;
    }

    if (contactBtn) {
        contactBtn.addEventListener('click', () => openContactGuardianModal(getCurrentStudentName()));
    }

    if (deriveBtn) {
        deriveBtn.addEventListener('click', () => openDeriveNetworkModal(getCurrentStudentName()));
    }
}

/* ==========================================================================
   24°. HISTORIAL DE TURNOS DE HOY (MENÚ DE PERFIL DEL PSICÓLOGO)
   ========================================================================== */
function openShiftHistoryModal() {
    const shifts = [
        { hora: '09:30', nombre: 'Carlos Mendoza', motivo: 'Sesión Individual', estado: 'Atendido' },
        { hora: '11:00', nombre: 'Sofía Gómez', motivo: 'Seguimiento de Caso', estado: 'Atendido' },
        { hora: '13:15', nombre: 'Mateo Silva', motivo: 'Intervención por riesgo alto', estado: 'Atendido' },
        { hora: '14:30', nombre: 'Familia Ortiz', motivo: 'Reunión de Acudientes', estado: 'En curso' }
    ];

    const listHTML = shifts.map(s => `
        <div class="shift-entry">
            <span class="shift-time">${s.hora}</span>
            <div class="shift-entry-info">
                <strong>${s.nombre}</strong>
                <p>${s.motivo}</p>
            </div>
            <span class="shift-status ${s.estado === 'Atendido' ? 'done' : 'progress'}">${s.estado}</span>
        </div>
    `).join('');

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <div>
                <h3>Historial de Turnos de Hoy</h3>
                <p>Casos atendidos durante la jornada</p>
            </div>
        </div>
        <div class="sentir-modal-body">
            <div class="shift-list">${listHTML}</div>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="closeShiftModal">Cerrar</button>
        </div>
    `);

    overlay.querySelector('#closeShiftModal').addEventListener('click', () => closeSentirModal(overlay));
}

/* ==========================================================================
   11°. COMPORTAMIENTO DEL MENÚ HAMBURGUESA PARA DISPOSITIVOS MÓVILES
   ========================================================================== */
function initMobileSidebar() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('panelOverlay');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            sidebar.classList.toggle('mobile-open');

            if (overlay) {
                overlay.classList.toggle('show', sidebar.classList.contains('active') || sidebar.classList.contains('mobile-open'));
            }
        });

        document.addEventListener('click', (e) => {
            const isSidebarOpen = sidebar.classList.contains('active') || sidebar.classList.contains('mobile-open');
            if (isSidebarOpen && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
                sidebar.classList.remove('mobile-open');
                if (overlay) overlay.classList.remove('show');
            }
        });
    }
}