/* =========================================================
   PERFIL DE LA PSICÓLOGA
   Mismo diseño que "Mi perfil" del docente (estilos tp-* de
   ScreenTeacher/TeacherProfile.css): foto, datos personales,
   su trabajo en Sentir, edición de datos y cerrar sesión.
   Los datos vienen de la base de datos (/api/Psicologia/perfil,
   cargados por sentir-shared.js).
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initSentirCore();
    renderProfile();
    initNotificationButton();

    // Datos reales de la base de datos (los carga sentir-shared.js)
    document.addEventListener('sentir:datos', renderProfile);
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

function escaparValor(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fechaLarga(iso) {
    if (!iso) return '—';
    const [anio, mes, dia] = iso.split('-').map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function filaDato(etiqueta, valor) {
    return `<div class="tp-dato"><span>${escaparValor(etiqueta)}</span><strong>${escaparValor(valor)}</strong></div>`;
}

let fotoNueva = null;

function renderProfile() {
    const contenedor = document.getElementById('psychProfilePage');
    if (!contenedor) return;

    const p = getPsychProfile();
    const u = p.usuario;

    if (!u) {
        contenedor.innerHTML = '<div class="tp-content tp-page"><p class="tp-loading">Cargando tu perfil…</p></div>';
        return;
    }

    const c = p.cifras || {};
    fotoNueva = null;

    contenedor.innerHTML = `
        <div class="tp-content tp-page" id="tpContent">
            <div class="tp-header">
                <div class="tp-avatar">
                    <img src="${escaparValor(p.avatar)}" alt="Foto de ${escaparValor(p.name)}" id="tpFotoPreview">
                    <button type="button" class="tp-photo-btn" id="tpPhotoBtn" aria-label="Cambiar foto">
                        <svg viewBox="0 0 24 24"><path d="M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                    <input type="file" id="tpFotoInput" accept="image/png, image/jpeg, image/webp" hidden>
                </div>
                <div>
                    <h2 id="tpNombre">${escaparValor(p.name)}</h2>
                    <p>${escaparValor(p.email)}</p>
                    <div class="tp-chips">
                        <span class="tp-chip">${escaparValor(p.role)}</span>
                        <span class="tp-chip ${String(u.estado).toLowerCase() === 'activo' ? 'ok' : ''}">${escaparValor(u.estado)}</span>
                        ${u.comite_convivencia ? '<span class="tp-chip">Comité de convivencia</span>' : ''}
                    </div>
                </div>
            </div>

            <div class="tp-grid">
                <section class="tp-card">
                    <h3>Información personal</h3>
                    ${filaDato('Documento', `${u.tipo_id || ''} ${u.id_usuario}`.trim())}
                    ${filaDato('Edad', u.edad ? `${u.edad} años` : '—')}
                    ${filaDato('Fecha de nacimiento', fechaLarga(u.fecha_nac))}
                    ${filaDato('Registrada desde', fechaLarga(u.fecha_reg))}
                    ${filaDato('Comité de convivencia', u.comite_convivencia ? 'Sí' : 'No')}
                </section>

                <section class="tp-card">
                    <h3>Mi trabajo en Sentir</h3>
                    ${filaDato('Rol', u.rol || p.role)}
                    ${filaDato('Estudiantes atendidos', c.estudiantesAtendidos ?? 0)}
                    ${filaDato('Casos activos', c.casosActivos ?? 0)}
                    ${filaDato('Casos cerrados', c.casosCerrados ?? 0)}
                    ${filaDato('Alertas este mes', c.alertasMes ?? 0)}
                    ${filaDato('Notificaciones sin leer', c.notificacionesSinLeer ?? 0)}
                </section>
            </div>

            <form class="tp-card tp-form" id="tpForm" novalidate>
                <h3>Editar mis datos</h3>
                <div class="tp-fields">
                    <label>Nombre<input name="nombre" maxlength="100" autocomplete="given-name" value="${escaparValor(p.nombre)}" required></label>
                    <label>Apellido<input name="apellido" maxlength="100" autocomplete="family-name" value="${escaparValor(p.apellido)}" required></label>
                    <label>Correo electrónico<input name="correo" type="email" maxlength="150" autocomplete="email" value="${escaparValor(p.email)}" required></label>
                    <label>Celular<input name="celular" inputmode="numeric" maxlength="15" autocomplete="tel" value="${escaparValor(p.celular)}" required></label>
                </div>
                <p class="tp-hint">El correo es con el que inicias sesión. El documento y el rol los cambia la secretaría.</p>
                <p class="tp-message" id="tpMessage" role="status"></p>
                <div class="tp-actions">
                    <button type="button" class="tp-logout" id="tpLogout">Cerrar sesión</button>
                    <button type="submit" class="tp-save" id="tpSave">Guardar cambios</button>
                </div>
            </form>
        </div>`;

    const formulario = contenedor.querySelector('#tpForm');
    const celular = formulario.querySelector('[name="celular"]');
    celular.addEventListener('input', () => { celular.value = celular.value.replace(/\D/g, '').slice(0, 15); });

    contenedor.querySelector('#tpPhotoBtn').addEventListener('click', () => contenedor.querySelector('#tpFotoInput').click());
    contenedor.querySelector('#tpFotoInput').addEventListener('change', elegirFoto);
    contenedor.querySelector('#tpLogout').addEventListener('click', () => {
        if (window.confirm('¿Deseas cerrar sesión?')) performPsychologistLogout();
    });
    formulario.addEventListener('submit', guardarFormulario);
}

function mensaje(texto, error) {
    const caja = document.getElementById('tpMessage');
    if (!caja) return;
    caja.textContent = texto;
    caja.classList.toggle('error', Boolean(error));
}

function elegirFoto(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    if (!/^image\/(jpeg|png|webp)$/.test(archivo.type) || archivo.size > 5 * 1024 * 1024) {
        mensaje('La foto debe ser JPG, PNG o WEBP y pesar menos de 5 MB.', true);
        event.target.value = '';
        return;
    }

    fotoNueva = archivo;
    document.getElementById('tpFotoPreview').src = URL.createObjectURL(archivo);
    mensaje('Foto lista. Pulsa "Guardar cambios" para guardarla.');
}

async function guardarFormulario(event) {
    event.preventDefault();
    const datos = Object.fromEntries(new FormData(event.target));
    Object.keys(datos).forEach(clave => { datos[clave] = String(datos[clave]).trim(); });

    if (!datos.nombre || !datos.apellido) return mensaje('Escribe tu nombre y tu apellido.', true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) return mensaje('Escribe un correo electrónico válido.', true);
    if (datos.celular.length < 7) return mensaje('El celular debe tener al menos 7 dígitos.', true);

    const boton = document.getElementById('tpSave');
    boton.disabled = true;
    boton.textContent = 'Guardando…';

    try {
        const respuesta = await guardarPerfil(datos, fotoNueva);
        mensaje(respuesta.message || 'Tu perfil se actualizó correctamente.');
        showToast({ title: 'Perfil actualizado', message: 'Tus datos se guardaron correctamente.', icon: 'fa-user-pen', type: 'success' });
    } catch (error) {
        mensaje(error.message, true);
        boton.disabled = false;
        boton.textContent = 'Guardar cambios';
    }
}

/* Guarda nombre, apellido, correo, celular y (opcional) foto en la base de datos */
async function guardarPerfil(datos, foto) {
    const envio = new FormData();
    ['nombre', 'apellido', 'correo', 'celular'].forEach(campo => envio.append(campo, datos[campo]));
    if (foto) envio.append('foto', foto);

    const perfil = await sentirApi('/perfil', { method: 'PUT', body: envio });
    aplicarPerfilReal(perfil);

    // La sesión guarda el nombre nuevo
    try {
        const sesion = JSON.parse(sessionStorage.getItem('usuarioSentir') || '{}');
        sessionStorage.setItem('usuarioSentir', JSON.stringify({ ...sesion, nombre: perfil.usuario.nombre, apellido: perfil.usuario.apellido, correo: perfil.usuario.correo }));
    } catch (e) { /* sin sesión guardada */ }

    renderProfile();
    return perfil;
}
