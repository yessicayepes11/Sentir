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
                alert('Generando y empaquetando reporte clínico de forma segura bajo cifrado... Tu descarga comenzará en breve.');
            } else if (actionText.includes('derivación')) {
                alert('Abriendo pasarela de comunicación encriptada con la EPS / Red de apoyo externa afiliada.');
            } else {
                alert('Formulario de contingencia enviado directamente al correo de la Coordinación Académica.');
            }
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
                <div class="p-item" style="padding:12px 16px; font-size:12px; color:var(--dark-slate); border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-clock-rotate-left" style="margin-right:10px; color:var(--morado-sentir)"></i> Historial de Turnos</div>
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

            document.getElementById('panelName').innerText = activeConv.dataset.name;
            document.getElementById('panelMeta').innerText = activeConv.dataset.meta;
            document.getElementById('panelAvatar').src = activeConv.dataset.avatar;

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