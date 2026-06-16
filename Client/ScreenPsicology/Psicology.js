/* ==========================================================================
   SENTIR CORE ENGINE - INTERACTIVIDAD Y COMPORTAMIENTOS DINÁMICOS ADVANCED
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initSlidingPanelActions();
    initNotificationDropdown();
    initOdometerCounters();
    initLiveFilterSearch();
    initMobileSidebar();
    
    // Nuevas interacciones solicitadas
    initViewAllCases();
    initCreateGroupWorkshop();
    initQuickActions();
    initPsychologistProfileMenu();
});

/* ==========================================================================
   1°. CONTROL DINÁMICO DEL PANEL LATERAL E INYECCIÓN DE DATOS
   ========================================================================== */
function initSlidingPanelActions() {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');
    const actionButtons = document.querySelectorAll('.btn-primary-action');

    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const card = button.closest('.student-case-card');
            if (!card || !panel || !overlay) return;

            const studentName = card.querySelector('.student-profile h4').innerText;
            const studentMeta = card.querySelector('.student-profile p').innerText;
            const studentAvatar = card.querySelector('.student-case-avatar').src;

            document.getElementById('panelName').innerText = studentName;
            document.getElementById('panelMeta').innerText = studentMeta;
            document.getElementById('panelAvatar').src = studentAvatar;

            const panelMainBtn = panel.querySelector('.panel-actions .primary-btn');
            if (panelMainBtn) {
                if (button.innerText.includes('Protocolo')) {
                    panelMainBtn.innerHTML = `<i class="fa-solid fa-play"></i> Ejecutar Protocolo de Crisis`;
                } else {
                    panelMainBtn.innerHTML = `<i class="fa-solid fa-file-medical"></i> Asignar Test de Ansiedad (GAD-7)`;
                }
            }

            overlay.classList.add('show');
            panel.classList.add('open');
        });
    });
}

function closePanel() {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('panelOverlay');
    
    if (panel && overlay) {
        panel.classList.remove('open');
        overlay.classList.remove('show');
    }
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
function initOdometerCounters() {
    const elements = document.querySelectorAll('.counter-number');
    
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
    const caseCards = document.querySelectorAll('.student-case-card');
    const searchWrapper = searchInput ? searchInput.closest('.header-search') : null;

    if (searchInput) {
        // Efecto visual estético de foco en la barra de búsqueda
        searchInput.addEventListener('focus', () => {
            if (searchWrapper) searchWrapper.style.border = '1px solid var(--morado-sentir)';
        });
        searchInput.addEventListener('blur', () => {
            if (searchWrapper) searchWrapper.style.border = '1px solid #E5E7EB';
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

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
            // Animación de feedback al botón
            viewAllBtn.style.transform = 'scale(0.95)';
            setTimeout(() => viewAllBtn.style.transform = 'translateY(-2px)', 150);

            // Simulación estética: Carga de un nuevo set de casos inyectados dinámicamente con transiciones suaves
            const container = document.querySelector('.cases-container');
            
            // Verificar si los casos extra ya fueron añadidos para no duplicar
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
            // Re-vincular las acciones del panel deslizante para que el nuevo caso responda al clic
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
            // Creamos un modal estético in-situ para la gestión del taller
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
            
            // Animación de entrada
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalOverlay.querySelector('div').style.transform = 'scale(1)';
            }, 50);

            // Acciones del modal
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
            
            // Feedback visual rápido
            button.style.background = '#EDF2F7';
            setTimeout(() => button.style.background = 'var(--bg-light)', 200);

            // Respuestas simuladas con lógica contextual avanzada
            if (actionText.includes('PDF')) {
                alert('Generando y empaquetando reporte clínico institucional de forma segura bajo cifrado... Tu descarga comenzará en breve.');
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
            
            // Verificar si el menú ya existe para cerrarlo o abrirlo
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
                <div class="p-item" style="padding:12px 16px; font-size:12px; color:var(--dark-slate); border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-id-card" style="margin-right:10px; color:var(--morado-sentir)"></i> Mi Licencia Profesional</div>
                <div class="p-item" style="padding:12px 16px; font-size:12px; color:var(--dark-slate); border-bottom:1px solid #F1F5F9; cursor:pointer;"><i class="fa-solid fa-clock-rotate-left" style="margin-right:10px; color:var(--morado-sentir)"></i> Historial de Turnos</div>
                <div class="p-item" style="padding:12px 16px; font-size:12px; color:var(--riesgo-alto); cursor:pointer;"><i class="fa-solid fa-right-from-bracket" style="margin-right:10px;"></i> Cerrar Sesión</div>
            `;

            document.body.appendChild(profileDropdown);

            // Agregar efectos hover dinámicos a los ítems del menú creado
            profileDropdown.querySelectorAll('.p-item').forEach(item => {
                item.addEventListener('mouseenter', () => item.style.background = '#F8FAFC');
                item.addEventListener('mouseleave', () => item.style.background = 'transparent');
                item.addEventListener('click', () => {
                    if(item.innerText.includes('Cerrar')) {
                        alert('Cerrando sesión del sistema Sentir de manera segura...');
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
   9°. COMPORTAMIENTO DEL MENÚ HAMBURGUESA PARA DISPOSITIVOS MÓVILES
   ========================================================================== */
function initMobileSidebar() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.querySelector('.sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
        });

        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}