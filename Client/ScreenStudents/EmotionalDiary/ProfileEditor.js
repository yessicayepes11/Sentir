/* =========================================================
   MI PERFIL (Mi espacio personal: diario y seguimiento)
   Botón con foto y nombre arriba del diario. Al hacer clic abre
   una ventana con los datos del estudiante y de su acudiente
   para verlos y editarlos.

   El servidor identifica al estudiante por el token del inicio
   de sesión (sessionStorage "sentirEstudiante").
========================================================= */

(function () {

    const API_PERFIL = "http://localhost:3001/api/Estudiante/perfil";
    const LOGIN_PAGE = "/Client/ScreenStudents/EmotionalDiary/DiaryAccess/DiaryAccess.html";

    const MODAL_HTML = `
<div class="pe-box" role="dialog" aria-modal="true" aria-labelledby="peTitle">

    <button class="pe-close" type="button" id="peClose" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="pe-header">
        <label class="pe-photo" title="Cambiar foto">
            <span id="pePhoto"><i class="fa-solid fa-user"></i></span>
            <span class="pe-photo-edit"><i class="fa-solid fa-camera"></i></span>
            <input type="file" id="pePhotoInput" accept="image/*" hidden>
        </label>
        <div>
            <span class="pe-tag">MI PERFIL</span>
            <h2 id="peTitle">Mi información</h2>
            <p>Revisa tus datos y los de tu acudiente. Puedes corregirlos y guardar.</p>
        </div>
    </div>

    <p class="pe-loading" id="peLoading">Cargando tu información…</p>

    <form id="peForm" novalidate hidden>

        <h3><i class="fa-regular fa-user"></i> Mis datos</h3>

        <div class="pe-grid">
            <label><span>Nombres</span><input name="nombre" maxlength="100" required></label>
            <label><span>Apellidos</span><input name="apellido" maxlength="100" required></label>
            <label><span>Correo</span><input name="correo" type="email" maxlength="150" required></label>
            <label><span>Celular</span><input name="celular" inputmode="numeric" maxlength="15" required></label>
            <label><span>Fecha de nacimiento</span><input name="fecha_nac" type="date" required></label>
            <label><span>Edad</span><input id="peEdad" disabled></label>
        </div>

        <div class="pe-readonly">
            <div><span>Documento</span><strong id="peDocumento">—</strong></div>
            <div><span>Grado</span><strong id="peGrado">—</strong></div>
            <div><span>Rol</span><strong id="peRol">—</strong></div>
            <div><span>Estado</span><strong id="peEstado">—</strong></div>
        </div>
        <p class="pe-hint">
            <i class="fa-solid fa-lock"></i>
            El documento, el grado, el rol y el estado los maneja el colegio. Si hay un error, avísale a la secretaría.
        </p>

        <h3><i class="fa-solid fa-people-roof"></i> Mi acudiente</h3>

        <div id="peAcudiente">
            <div class="pe-grid">
                <label><span>Nombres</span><input name="acudiente_nombre" maxlength="20" required></label>
                <label><span>Apellidos</span><input name="acudiente_apellido" maxlength="20" required></label>
                <label><span>Parentesco</span><input name="acudiente_parentesco" maxlength="200" required></label>
                <label><span>Ocupación</span><input name="acudiente_ocupacion" maxlength="200"></label>
                <label><span>Correo</span><input name="acudiente_correo" type="email" maxlength="100" required></label>
                <label><span>Celular</span><input name="acudiente_celular" inputmode="numeric" maxlength="15" required></label>
                <label>
                    <span>Tipo de documento</span>
                    <select name="acudiente_tipo_documento">
                        <option>Cédula</option>
                        <option>Cédula de extranjería</option>
                        <option>Pasaporte</option>
                        <option>PPT</option>
                    </select>
                </label>
                <label><span>Documento</span><input id="peAcudienteDocumento" disabled></label>
            </div>
        </div>

        <p class="pe-empty" id="peSinAcudiente" hidden>
            Aún no tienes ficha de estudiante con acudiente registrado. Pide a la secretaría del colegio que la registre.
        </p>

        <p class="pe-error" id="peError" role="alert"></p>

        <div class="pe-actions">
            <button type="button" class="pe-secondary" id="peCancel">Cancelar</button>
            <button type="submit" class="pe-save" id="peSave">
                <i class="fa-regular fa-floppy-disk"></i>
                Guardar cambios
            </button>
        </div>
    </form>

    <div class="pe-done" id="peDone" hidden>
        <i class="fa-solid fa-circle-check"></i>
        <strong>¡Tu perfil se actualizó!</strong>
        <button type="button" class="pe-secondary" id="peFinish">Listo</button>
    </div>
</div>`;

    let modal = null;
    let perfil = null;
    let fotoNueva = null;

    const $ = (id) => document.getElementById(id);

    function session() {
        try {
            return JSON.parse(sessionStorage.getItem("sentirEstudiante")) || null;
        } catch (error) {
            return null;
        }
    }

    function goToLogin() {
        sessionStorage.removeItem("sentirEstudiante");
        window.location.href = LOGIN_PAGE;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function capitalize(value) {
        return String(value || "").replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
    }

    function avatarHTML(foto, nombre) {
        if (foto) {
            return `<img src="${escapeHTML(foto)}" alt="Foto de ${escapeHTML(nombre)}">`;
        }
        const inicial = String(nombre || "").trim().charAt(0).toUpperCase();
        return inicial ? `<span class="pe-initial">${escapeHTML(inicial)}</span>` : '<i class="fa-solid fa-user"></i>';
    }

    // ---------- Botón "Mi perfil" ----------

    function updateChip(datos) {
        const nombre = capitalize(`${datos.nombre || ""} ${datos.apellido || ""}`.trim()) || "Mi perfil";
        const chipName = $("profileChipName");
        const chipAvatar = $("profileChipAvatar");

        if (chipName) chipName.textContent = nombre;
        if (chipAvatar) chipAvatar.innerHTML = avatarHTML(datos.foto, nombre);
    }

    async function fetchPerfil() {
        const datos = session();
        if (!datos || !datos.token) {
            goToLogin();
            return null;
        }

        const response = await fetch(API_PERFIL, {
            headers: { Authorization: "Bearer " + datos.token }
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            goToLogin();
            return null;
        }
        if (!response.ok) {
            throw new Error(data.message || "No se pudo cargar tu perfil.");
        }

        return data;
    }

    // ---------- Ventana ----------

    function createModal() {
        modal = document.createElement("div");
        modal.className = "pe-overlay";
        modal.id = "studentProfileModal";
        modal.innerHTML = MODAL_HTML;
        document.body.appendChild(modal);

        $("peClose").addEventListener("click", close);
        $("peCancel").addEventListener("click", close);
        $("peFinish").addEventListener("click", close);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) close();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.classList.contains("show")) close();
        });

        // Solo números en los celulares
        modal.querySelectorAll('input[name="celular"], input[name="acudiente_celular"]').forEach((input) => {
            input.addEventListener("input", () => {
                input.value = input.value.replace(/\D/g, "");
            });
        });

        // La edad se recalcula al cambiar la fecha
        $("peForm").elements.fecha_nac.addEventListener("change", (event) => {
            $("peEdad").value = calcularEdad(event.target.value);
        });

        // Vista previa de la foto nueva
        $("pePhotoInput").addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                $("peError").textContent = "La foto debe ser una imagen.";
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                $("peError").textContent = "La foto no puede pesar más de 5 MB.";
                return;
            }

            fotoNueva = file;
            $("pePhoto").innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Nueva foto">`;
        });

        $("peForm").addEventListener("submit", save);
    }

    function calcularEdad(fecha) {
        if (!fecha) return "";
        const nacimiento = new Date(`${fecha}T00:00:00`);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) edad -= 1;
        return Number.isFinite(edad) && edad >= 0 ? `${edad} años` : "";
    }

    function fillForm(data) {
        const form = $("peForm");
        const u = data.usuario;
        const a = data.acudiente;

        form.elements.nombre.value = u.nombre || "";
        form.elements.apellido.value = u.apellido || "";
        form.elements.correo.value = u.correo || "";
        form.elements.celular.value = u.celular || "";
        form.elements.fecha_nac.value = u.fecha_nac || "";
        form.elements.fecha_nac.max = new Date().toISOString().slice(0, 10);
        $("peEdad").value = calcularEdad(u.fecha_nac);

        $("peDocumento").textContent = [u.tipo_id, u.id_usuario].filter(Boolean).join(" ");
        $("peGrado").textContent = data.estudiante?.grado || "Sin registrar";
        $("peRol").textContent = u.rol || "Estudiante";
        $("peEstado").textContent = u.estado || "—";

        $("pePhoto").innerHTML = avatarHTML(u.foto, u.nombre);

        $("peAcudiente").hidden = !a;
        $("peSinAcudiente").hidden = !!a;

        if (a) {
            form.elements.acudiente_nombre.value = a.nombre || "";
            form.elements.acudiente_apellido.value = a.apellido || "";
            form.elements.acudiente_parentesco.value = a.parentesco || "";
            form.elements.acudiente_ocupacion.value = a.ocupacion || "";
            form.elements.acudiente_correo.value = a.correo || "";
            form.elements.acudiente_celular.value = a.celular || "";
            $("peAcudienteDocumento").value = a.id_acudiente || "";

            const select = form.elements.acudiente_tipo_documento;
            if (a.tipo_documento && ![...select.options].some((option) => option.value === a.tipo_documento)) {
                select.add(new Option(a.tipo_documento, a.tipo_documento));
            }
            select.value = a.tipo_documento || "Cédula";
        }
    }

    async function open() {
        if (!modal) createModal();

        fotoNueva = null;
        $("pePhotoInput").value = "";
        $("peError").textContent = "";
        $("peDone").hidden = true;
        $("peForm").hidden = true;
        $("peLoading").hidden = false;
        $("peLoading").textContent = "Cargando tu información…";

        modal.classList.add("show");
        document.body.classList.add("pe-open");

        try {
            perfil = await fetchPerfil();
            if (!perfil) return;

            fillForm(perfil);
            $("peLoading").hidden = true;
            $("peForm").hidden = false;
        } catch (error) {
            $("peLoading").textContent = "No se pudo conectar con el servidor. Inténtalo de nuevo.";
        }
    }

    function close() {
        modal.classList.remove("show");
        document.body.classList.remove("pe-open");
    }

    async function save(event) {
        event.preventDefault();

        const form = $("peForm");
        const error = $("peError");
        const button = $("peSave");
        error.textContent = "";

        // Revisión rápida antes de enviar (el servidor vuelve a validar todo)
        const requeridos = [...form.querySelectorAll("input[required]")]
            .filter((input) => !input.closest("[hidden]"));
        const vacio = requeridos.find((input) => !input.value.trim());
        if (vacio) {
            error.textContent = `Completa el campo "${vacio.closest("label").querySelector("span").textContent}".`;
            vacio.focus();
            return;
        }

        const datos = session();
        if (!datos || !datos.token) {
            goToLogin();
            return;
        }

        const formData = new FormData(form);
        if (fotoNueva) formData.append("foto", fotoNueva);

        button.disabled = true;

        try {
            const response = await fetch(API_PERFIL, {
                method: "PUT",
                headers: { Authorization: "Bearer " + datos.token },
                body: formData
            });
            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                goToLogin();
                return;
            }
            if (!response.ok) {
                error.textContent = data.message || "No se pudo guardar tu perfil.";
                return;
            }

            perfil = data.perfil;
            updateChip(perfil.usuario);

            // El nombre en la sesión también se actualiza
            sessionStorage.setItem("sentirEstudiante", JSON.stringify({
                ...datos,
                nombre: perfil.usuario.nombre,
                apellido: perfil.usuario.apellido
            }));

            form.hidden = true;
            $("peDone").hidden = false;
        } catch (err) {
            error.textContent = "No se pudo conectar con el servidor. Inténtalo de nuevo.";
        } finally {
            button.disabled = false;
        }
    }

    // ---------- Cerrar sesión ----------
    // Borra la sesión y todo lo del diario guardado en este navegador, para que
    // el siguiente estudiante que use el computador no vea nada del anterior.

    const DATOS_DEL_DIARIO = [
        "sentirDiaryEntries",
        "sentirDiaryCurrentEmotion",
        "sentirDiaryCurrentEmotionValue",
        "sentirDiaryIntensity",
        "sentirDiaryTags",
        "sentirDiaryOtherTag",
        "sentirDiaryDraft",
        "sentirOptionalSituation",
        "sentirOptionalThought",
        "sentirOptionalNeed"
    ];

    function logout() {
        const button = $("studentLogout");
        if (button) button.disabled = true;

        sessionStorage.removeItem("sentirEstudiante");
        sessionStorage.removeItem("sentirChatIA"); // conversación con Sentir IA
        DATOS_DEL_DIARIO.forEach((key) => localStorage.removeItem(key));

        // replace: con el botón "atrás" no se puede volver al diario
        window.location.replace(LOGIN_PAGE);
    }

    // ---------- Inicio ----------

    document.addEventListener("DOMContentLoaded", async () => {
        $("studentLogout")?.addEventListener("click", logout);

        const chip = $("openStudentProfile");
        if (!chip) return;

        const datos = session();
        if (datos) updateChip({ nombre: datos.nombre, apellido: datos.apellido });

        chip.addEventListener("click", open);

        try {
            const data = await fetchPerfil();
            if (data) updateChip(data.usuario);
        } catch (error) {
            // Sin servidor el botón muestra el nombre de la sesión
        }
    });

})();
