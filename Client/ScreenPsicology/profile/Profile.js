document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderProfile();
    animateProfileCounters();
    initEditProfileModal();
    initAvatarEdit();
    initNotificationButton();
    initBackupActions();
    initResetDefaults();
});

function initNotificationButton() {
    const btn = document.getElementById('enableNotifBtn');
    if (!btn) return;

    function refreshLabel() {
        if ('Notification' in window && Notification.permission === 'granted') {
            btn.innerText = 'Activadas ✓';
            btn.disabled = true;
        }
    }
    refreshLabel();

    btn.addEventListener('click', () => {
        requestBrowserNotificationPermission();
        setTimeout(refreshLabel, 300);
    });
}

function initBackupActions() {
    const exportBtn = document.getElementById('exportBackupBtn');
    const importInput = document.getElementById('importBackupInput');
    const importBox = document.getElementById('importUploadBox');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportSentirBackup();
            showToast({ title: 'Respaldo descargado', message: 'Se generó el archivo .json con toda la información de Sentir.', icon: 'fa-download', type: 'success' });
        });
    }

    if (importInput) {
        importInput.addEventListener('change', () => {
            const file = importInput.files[0];
            if (!file) return;

            const overlay = openSentirModal(`
                <div class="sentir-modal-header">
                    <div class="sentir-modal-icon" style="background:#FEF2F2; color:var(--riesgo-alto);"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div><h3>¿Importar este respaldo?</h3><p>Reemplazará los datos actuales de este navegador</p></div>
                </div>
                <div class="sentir-modal-body">
                    <p class="activity-detail-text">Vas a restaurar el archivo <strong>${file.name}</strong>. Estudiantes, alertas, agenda, actividades y perfil actuales serán reemplazados por los del respaldo. Esta acción no se puede deshacer.</p>
                </div>
                <div class="sentir-modal-actions">
                    <button class="modal-btn-cancel" id="cancelImport">Cancelar</button>
                    <button class="modal-btn-confirm" id="confirmImport" style="background:var(--riesgo-alto);"><i class="fa-solid fa-upload"></i> Sí, Importar</button>
                </div>
            `);

            overlay.querySelector('#cancelImport').addEventListener('click', () => { closeSentirModal(overlay); importInput.value = ''; });
            overlay.querySelector('#confirmImport').addEventListener('click', () => {
                importSentirBackup(file, (success) => {
                    closeSentirModal(overlay);
                    if (success) {
                        showToast({ title: 'Respaldo importado', message: 'Recargando la página con la información restaurada...', icon: 'fa-circle-check', type: 'success' });
                        setTimeout(() => window.location.reload(), 1200);
                    } else {
                        showToast({ title: 'No se pudo importar', message: 'El archivo no tiene un formato válido de respaldo de Sentir.', icon: 'fa-circle-exclamation', type: 'info' });
                        importInput.value = '';
                    }
                });
            });
        });
    }
}

function initResetDefaults() {
    const btn = document.getElementById('resetDefaultsBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon" style="background:#FEF2F2; color:var(--riesgo-alto);"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div><h3>¿Restablecer todo?</h3><p>Esta acción no se puede deshacer</p></div>
            </div>
            <div class="sentir-modal-body">
                <p class="activity-detail-text">Se eliminarán los estudiantes, alertas, citas y actividades que hayas agregado, y el perfil volverá a los datos de ejemplo originales de Sentir.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="cancelReset">Cancelar</button>
                <button class="modal-btn-confirm" id="confirmReset" style="background:var(--riesgo-alto);"><i class="fa-solid fa-rotate-left"></i> Sí, Restablecer</button>
            </div>
        `);

        overlay.querySelector('#cancelReset').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#confirmReset').addEventListener('click', () => {
            resetSentirDefaults();
            closeSentirModal(overlay);
            showToast({ title: 'Valores restablecidos', message: 'Recargando con los datos originales de Sentir...', icon: 'fa-rotate-left', type: 'success' });
            setTimeout(() => window.location.reload(), 1000);
        });
    });
}

function renderProfile() {
    const p = getPsychProfile();
    document.getElementById('profileHeroAvatar').src = p.avatar;
    document.getElementById('profileHeroName').innerText = p.name;
    document.getElementById('profileHeroSubtitle').innerText = `${p.role} · Institución Educativa Sentir`;
    document.getElementById('tagLicencia').innerHTML = `<i class="fa-solid fa-id-card"></i> ${p.licencia}`;
    document.getElementById('tagExperiencia').innerHTML = `<i class="fa-solid fa-briefcase"></i> ${p.experiencia}`;
    document.getElementById('infoEmail').innerText = p.email;
    document.getElementById('infoEspecialidad').innerText = p.especialidad;
    document.getElementById('infoSedes').innerText = p.sedes;
    document.getElementById('infoHorario').innerText = p.horario;
}

function animateProfileCounters() {
    document.querySelectorAll('.counter-number').forEach(el => {
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

function initEditProfileModal() {
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        const p = getPsychProfile();
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-user-pen"></i></div>
                <div><h3>Editar Perfil Profesional</h3><p>Estos datos se verán reflejados en toda la plataforma Sentir</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-field"><label>NOMBRE COMPLETO</label><input type="text" id="editName" value="${p.name}"></div>
                <div class="modal-field"><label>ROL</label><input type="text" id="editRole" value="${p.role}"></div>
                <div class="modal-field"><label>CORREO INSTITUCIONAL</label><input type="email" id="editEmail" value="${p.email}"></div>
                <div class="modal-field"><label>LICENCIA PROFESIONAL</label><input type="text" id="editLicencia" value="${p.licencia}"></div>
                <div class="modal-field"><label>ESPECIALIDAD</label><input type="text" id="editEspecialidad" value="${p.especialidad}"></div>
                <div class="modal-field"><label>SEDES A CARGO</label><input type="text" id="editSedes" value="${p.sedes}"></div>
                <div class="modal-field"><label>HORARIO DE ATENCIÓN</label><input type="text" id="editHorario" value="${p.horario}"></div>
                <p class="modal-error" id="editError"><i class="fa-solid fa-circle-exclamation"></i> El nombre no puede quedar vacío.</p>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="editCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="editConfirm"><i class="fa-solid fa-check"></i> Guardar Cambios</button>
            </div>
        `);

        overlay.querySelector('#editCancel').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#editConfirm').addEventListener('click', () => {
            const name = overlay.querySelector('#editName').value.trim();
            const errorMsg = overlay.querySelector('#editError');
            if (!name) { errorMsg.classList.add('show'); return; }
            errorMsg.classList.remove('show');

            setPsychProfile({
                name,
                role: overlay.querySelector('#editRole').value.trim(),
                email: overlay.querySelector('#editEmail').value.trim(),
                licencia: overlay.querySelector('#editLicencia').value.trim(),
                especialidad: overlay.querySelector('#editEspecialidad').value.trim(),
                sedes: overlay.querySelector('#editSedes').value.trim(),
                horario: overlay.querySelector('#editHorario').value.trim()
            });

            renderProfile();
            closeSentirModal(overlay);
            showToast({ title: 'Perfil actualizado', message: 'Tus datos profesionales se guardaron correctamente.', icon: 'fa-user-pen', type: 'success' });
        });
    });
}

function initAvatarEdit() {
    document.getElementById('avatarEditBtn').addEventListener('click', () => {
        const p = getPsychProfile();
        const overlay = openSentirModal(`
            <div class="sentir-modal-header">
                <div class="sentir-modal-icon"><i class="fa-solid fa-camera"></i></div>
                <div><h3>Actualizar Foto de Perfil</h3><p>Sube tu imagen a una carpeta del proyecto y pega aquí la ruta o el enlace</p></div>
            </div>
            <div class="sentir-modal-body">
                <div class="modal-avatar-preview">
                    <img id="avatarPreview" src="${p.avatar}" alt="Vista previa">
                    <span>Ej. <code>../assets/psicologa-avatar.png</code> o una URL https://...</span>
                </div>
                <div class="modal-field"><label>RUTA O URL DE LA IMAGEN</label><input type="text" id="avatarUrlInput" value="${p.avatar}"></div>
            </div>
            <div class="sentir-modal-actions">
                <button class="modal-btn-cancel" id="avatarCancel">Cancelar</button>
                <button class="modal-btn-confirm" id="avatarConfirm"><i class="fa-solid fa-check"></i> Actualizar Foto</button>
            </div>
        `);

        const urlInput = overlay.querySelector('#avatarUrlInput');
        const preview = overlay.querySelector('#avatarPreview');
        urlInput.addEventListener('input', () => { preview.src = urlInput.value.trim(); });

        overlay.querySelector('#avatarCancel').addEventListener('click', () => closeSentirModal(overlay));
        overlay.querySelector('#avatarConfirm').addEventListener('click', () => {
            const newUrl = urlInput.value.trim();
            if (!newUrl) { closeSentirModal(overlay); return; }

            setPsychProfile({ avatar: newUrl });
            const heroAvatar = document.getElementById('profileHeroAvatar');
            heroAvatar.src = newUrl;
            heroAvatar.classList.remove('avatar-pop');
            void heroAvatar.offsetWidth;
            heroAvatar.classList.add('avatar-pop');

            closeSentirModal(overlay);
            showToast({ title: 'Foto de perfil actualizada', message: 'Tu nueva foto ya es visible en toda la plataforma.', icon: 'fa-camera', type: 'success' });
        });
    });
}
