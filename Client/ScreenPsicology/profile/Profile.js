document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderProfile();
    animateProfileCounters();
    initEditProfileModal();
    initAvatarEdit();
    initNotificationButton();
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
