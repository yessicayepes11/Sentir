(() => {
    const apiUrl = 'http://localhost:3001/api/CrearUsuario/perfil-administrador';
    const modalMarkup = `
        <div class="admin-profile-overlay" id="adminProfileModal" aria-hidden="true">
            <section class="admin-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="adminProfileTitle">
                <header class="admin-profile-heading">
                    <div>
                        <span>Cuenta administradora</span>
                        <h2 id="adminProfileTitle">Editar perfil</h2>
                        <p class="admin-profile-role" id="adminProfileRole">Secretaria</p>
                    </div>
                    <button class="admin-profile-close" id="closeAdminProfile" type="button" aria-label="Cerrar">×</button>
                </header>
                <form id="adminProfileForm">
                    <div class="admin-profile-photo-row">
                        <div class="admin-profile-avatar" id="adminProfileAvatar" aria-label="Vista previa de la foto">A</div>
                        <label class="admin-profile-upload" for="adminProfilePhoto">Cambiar foto</label>
                        <input id="adminProfilePhoto" type="file" accept="image/*" hidden>
                    </div>
                    <div class="admin-profile-fields">
                        <label>Primer nombre<input id="adminProfileFirstName" name="firstName" required maxlength="100"></label>
                        <label>Segundo nombre<input id="adminProfileSecondName" name="secondName" maxlength="100"></label>
                        <label>Primer apellido<input id="adminProfileFirstSurname" name="firstSurname" required maxlength="100"></label>
                        <label>Segundo apellido<input id="adminProfileSecondSurname" name="secondSurname" maxlength="100"></label>
                        <label>Correo<input id="adminProfileEmail" name="email" type="email" required maxlength="150"></label>
                        <label>Celular<input id="adminProfilePhone" name="phone" type="tel" maxlength="30"></label>
                    </div>
                    <div class="admin-profile-actions">
                        <button class="admin-profile-cancel" id="cancelAdminProfile" type="button">Cancelar</button>
                        <button class="admin-profile-save" type="submit">Guardar cambios</button>
                    </div>
                </form>
            </section>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);

    const modal = document.getElementById('adminProfileModal');
    const form = document.getElementById('adminProfileForm');
    const profileTriggers = document.querySelectorAll('.admin-profile');
    const photoInput = document.getElementById('adminProfilePhoto');
    const avatar = document.getElementById('adminProfileAvatar');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    let profile = null;
    let selectedPhoto = null;

    function notify(message) {
        if (toast && toastText) {
            toastText.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2800);
        } else {
            window.alert(message);
        }
    }

    function setAvatar(source, name) {
        avatar.replaceChildren();
        if (source) {
            const image = document.createElement('img');
            image.src = source;
            image.alt = `Foto de ${name || 'administradora'}`;
            image.addEventListener('error', () => setAvatar('', name), { once: true });
            avatar.appendChild(image);
        } else {
            avatar.textContent = String(name || 'A').trim().charAt(0).toUpperCase() || 'A';
        }
    }

    function setHeaderInitials(target, name) {
        const initials = document.createElement('span');
        initials.className = 'admin-profile-initials';
        initials.textContent = String(name || 'A').trim().charAt(0).toUpperCase() || 'A';
        initials.setAttribute('aria-hidden', 'true');
        target.replaceWith(initials);
    }

    function updateHeader() {
        if (!profile) return;
        profileTriggers.forEach((trigger) => {
            const name = trigger.querySelector('.admin-info strong');
            const role = trigger.querySelector('.admin-info p, .admin-info span');
            if (name) name.textContent = profile.name || 'Administradora';
            if (role) role.textContent = profile.role || 'Secretaria';
            const currentAvatar = trigger.querySelector('.admin-profile-photo, .admin-profile-initials');
            const avatar = profile.photo
                ? document.createElement('img')
                : document.createElement('span');

            if (profile.photo) {
                avatar.className = 'admin-profile-photo';
                avatar.alt = '';
                avatar.src = profile.photo;
                avatar.addEventListener('error', () => setHeaderInitials(avatar, profile.name), { once: true });
            } else {
                avatar.className = 'admin-profile-initials';
                avatar.textContent = String(profile.name || 'A').trim().charAt(0).toUpperCase() || 'A';
                avatar.setAttribute('aria-hidden', 'true');
            }

            if (currentAvatar) {
                currentAvatar.replaceWith(avatar);
            } else {
                trigger.prepend(avatar);
            }
        });
    }

    async function loadProfile() {
        try {
            const response = await fetch(apiUrl);
            const result = await response.json();
            if (!response.ok) throw new Error(result?.message || 'No se pudo cargar el perfil');
            profile = result.profile;
            updateHeader();
        } catch (error) {
            console.error('Cargar perfil administrador:', error);
            notify(error.message || 'No se pudo cargar el perfil administrador');
        }
    }

    function openModal() {
        if (!profile) {
            notify('No se ha podido cargar el perfil administrador');
            return;
        }
        form.reset();
        selectedPhoto = null;
        document.getElementById('adminProfileFirstName').value = profile.firstName || '';
        document.getElementById('adminProfileSecondName').value = profile.secondName || '';
        document.getElementById('adminProfileFirstSurname').value = profile.firstSurname || '';
        document.getElementById('adminProfileSecondSurname').value = profile.secondSurname || '';
        document.getElementById('adminProfileEmail').value = profile.email || '';
        document.getElementById('adminProfilePhone').value = profile.phone || '';
        document.getElementById('adminProfileRole').textContent = profile.role || 'Secretaria';
        setAvatar(profile.photo, profile.name);
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('adminProfileFirstName').focus();
    }

    function closeModal() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }

    profileTriggers.forEach((trigger) => {
        trigger.classList.add('admin-profile-trigger');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-label', 'Editar perfil administrador');
        trigger.addEventListener('click', openModal);
        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal();
            }
        });
    });

    document.getElementById('closeAdminProfile').addEventListener('click', closeModal);
    document.getElementById('cancelAdminProfile').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    photoInput.addEventListener('change', () => {
        const file = photoInput.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            notify('Selecciona un archivo de imagen');
            photoInput.value = '';
            return;
        }
        selectedPhoto = file;
        setAvatar(URL.createObjectURL(file), profile?.name);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('firstName', document.getElementById('adminProfileFirstName').value.trim());
        formData.append('secondName', document.getElementById('adminProfileSecondName').value.trim());
        formData.append('firstSurname', document.getElementById('adminProfileFirstSurname').value.trim());
        formData.append('secondSurname', document.getElementById('adminProfileSecondSurname').value.trim());
        formData.append('email', document.getElementById('adminProfileEmail').value.trim());
        formData.append('phone', document.getElementById('adminProfilePhone').value.trim());
        if (selectedPhoto) formData.append('foto', selectedPhoto);

        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        try {
            const response = await fetch(apiUrl, { method: 'PUT', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.message || 'No se pudo actualizar el perfil');
            profile = { ...profile, ...result.profile };
            updateHeader();
            closeModal();
            notify(result.message || 'Perfil actualizado correctamente');
        } catch (error) {
            console.error('Actualizar perfil administrador:', error);
            notify(error.message || 'No se pudo actualizar el perfil');
        } finally {
            submitButton.disabled = false;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });

    loadProfile();
})();