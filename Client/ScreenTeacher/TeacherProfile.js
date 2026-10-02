/* =========================================================
   PERFIL DEL DOCENTE (pantalla de inicio del docente)

   - Solo entra un docente que inició sesión (administrativo.html).
   - En el encabezado de cada página (Inicio, Mis estudiantes,
     Orientación, Mi perfil) solo se muestran la foto y el nombre.
   - Toda la información del perfil (datos personales, información
     docente, grados, edición de datos y foto, cerrar sesión) está en
     la página "Mi perfil" de la barra lateral (#teacherProfilePage).
   - El saludo "¡Hola, ...!" de Inicio muestra el nombre del docente.
   - En Inicio, "Mis grupos" muestra los grupos que enseña.
========================================================= */

(function () {

    const API = "http://localhost:3001/api/Docente/perfil";
    const LOGIN_PAGE = "/Client/administrativo.html";
    const SESSION_KEY = "usuarioSentir";
    const ROL_DOCENTE = 5;

    /* ---------------- SESIÓN ---------------- */

    function leerSesion() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
        } catch (error) {
            return null;
        }
    }

    const sesion = leerSesion();

    // Sin sesión de docente: vuelve al inicio de sesión
    if (!sesion || !sesion.token || Number(sesion.id_rol) !== ROL_DOCENTE) {
        window.location.replace(LOGIN_PAGE);
        return;
    }

    /* ---------------- UTILIDADES ---------------- */

    function escapar(valor) {
        const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
        return String(valor ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);
    }

    // "laura maria" -> "Laura Maria"
    function capitalizar(texto) {
        return String(texto || "")
            .toLocaleLowerCase("es")
            .replace(/(^|\s)(\p{L})/gu, (m, espacio, letra) => espacio + letra.toLocaleUpperCase("es"));
    }

    function primeraPalabra(texto) {
        return capitalizar(String(texto || "").trim().split(/\s+/)[0] || "");
    }

    function fecha(valor) {
        if (!valor) return "—";
        const [anio, mes, dia] = valor.split("-").map(Number);
        return new Date(anio, mes - 1, dia).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    }

    function estudiantes(n) {
        return `${n} ${n === 1 ? "estudiante" : "estudiantes"}`;
    }

    async function pedir(opciones) {
        const respuesta = await fetch(API, {
            ...(opciones || {}),
            headers: { Authorization: "Bearer " + sesion.token }
        });
        const datos = await respuesta.json().catch(() => ({}));

        if (respuesta.status === 401) {
            sessionStorage.removeItem(SESSION_KEY);
            window.location.replace(LOGIN_PAGE);
            throw new Error(datos.message || "Tu sesión venció.");
        }
        if (!respuesta.ok) throw new Error(datos.message || "No se pudo conectar con el servidor.");
        return datos;
    }

    /* ---------------- ENCABEZADO Y SALUDO ---------------- */

    let perfil = null;

    function pintarEncabezado() {
        const usuario = perfil ? perfil.usuario : sesion;
        const nombreCorto = `${primeraPalabra(usuario.nombre)} ${primeraPalabra(usuario.apellido)}`.trim();

        const nombre = document.querySelector(".header-user-data strong");
        if (nombre) nombre.textContent = `Prof. ${nombreCorto}`;

        // Saludo de la pantalla de Inicio ("¡Hola, Docente!" -> "¡Hola, Monica!")
        const saludo = document.querySelector(".hero-content h1");
        if (saludo && /^¡Hola/.test(saludo.textContent.trim())) {
            saludo.textContent = `¡Hola, ${capitalizar(usuario.nombre)}!`;
        }

        // Foto del encabezado (cada página usa una estructura un poco distinta)
        const foto = document.querySelector(".header-user img");
        const icono = document.querySelector(".header-user .profile-placeholder, .header-user .header-placeholder");
        if (foto && perfil && perfil.usuario.foto) {
            foto.src = perfil.usuario.foto;
            foto.alt = `Foto de ${nombreCorto}`;
            foto.classList.add("has-photo", "tp-header-photo");
            icono?.classList.add("hidden");
            if (icono) icono.style.display = "none";
        }
    }

    /* ---------------- MIS GRUPOS (los que enseña este año) ---------------- */

    const ICONO_GRUPO =
        '<svg viewBox="0 0 24 24"><path d="M2 8l10-5 10 5-10 5z"/><path d="M6 10.5V16c3 2.5 9 2.5 12 0v-5.5"/><path d="M22 8v7"/></svg>';

    function tarjetaResumen(etiqueta) {
        return [...document.querySelectorAll(".summary-card")].find((tarjeta) =>
            tarjeta.querySelector(".summary-label")?.textContent.trim() === etiqueta
        );
    }

    function pintarGrupos() {
        const grid = document.querySelector(".groups-grid");
        if (!grid || !perfil) return;

        const { docente, grados } = perfil;
        const anioActual = new Date().getFullYear();
        const anio = docente?.ano_cursado || anioActual;

        // Grupos que enseña; si dirige un grupo que no está en la lista, también se muestra
        const grupos = grados.map((g) => ({ ...g }));
        if (docente?.director_grupo && docente.grado_asignado &&
            !grupos.some((g) => g.grado === docente.grado_asignado)) {
            grupos.push({ grado: docente.grado_asignado, estudiantes: docente.estudiantes_grado_asignado, soloDirige: true });
        }
        grupos.sort((a, b) => a.grado.localeCompare(b.grado, "es", { numeric: true }));

        // Título: "Mis grupos 2026"
        const titulo = grid.closest("section")?.querySelector("h2");
        if (titulo) titulo.textContent = `Mis grupos ${anio}`;

        grid.innerHTML = grupos.length
            ? grupos.map((g, i) => {
                const dirige = docente?.director_grupo && g.grado === docente.grado_asignado;
                return `
                    <article class="group-card">
                        <div class="group-icon ${i % 2 ? "blue" : "purple"}">${ICONO_GRUPO}</div>
                        <div class="group-data">
                            <strong>${escapar(g.grado)}</strong>
                            <p>${estudiantes(g.estudiantes)}</p>
                            <span>${dirige ? (g.soloDirige ? "Director de grupo" : "Enseña · Director de grupo") : `Enseña en ${anio}`}</span>
                        </div>
                    </article>`;
            }).join("")
            : `<p class="tp-groups-empty">No tienes grupos asignados para ${anio}. La secretaría los registra en tu ficha de docente.</p>`;

        // Tarjetas de resumen
        const totalEstudiantes = grupos.reduce((suma, g) => suma + (g.estudiantes || 0), 0);
        const resumenGrupos = tarjetaResumen("Mis grupos")?.querySelector("strong");
        const resumenEstudiantes = tarjetaResumen("Estudiantes")?.querySelector("strong");
        if (resumenGrupos) resumenGrupos.textContent = `${grupos.length} ${grupos.length === 1 ? "grupo asignado" : "grupos asignados"}`;
        if (resumenEstudiantes) resumenEstudiantes.textContent = estudiantes(totalEstudiantes);
    }

    function prepararEncabezado() {
        const zona = document.querySelector(".header-user");
        if (!zona) return;

        // Solo foto y nombre: sin rol, sin flecha y sin cambiar la foto desde aquí
        zona.classList.add("tp-header-only");
        // (Inicio tiene dos flechas: una dentro del botón y otra al lado)
        zona.parentElement?.querySelectorAll(".dropdown-icon").forEach((flecha) => flecha.classList.add("tp-hidden"));
        zona.querySelector(".header-user-data span")?.classList.add("tp-hidden");
        zona.querySelector(".camera-overlay")?.classList.add("tp-hidden");
        zona.querySelectorAll("label[for]").forEach((etiqueta) => {
            etiqueta.removeAttribute("for");
            etiqueta.removeAttribute("title");
        });

        // En Inicio el encabezado era un botón que abría el perfil: ya no hace nada
        if (zona.tagName === "BUTTON") {
            zona.setAttribute("tabindex", "-1");
            zona.removeAttribute("aria-label");
            zona.addEventListener("click", (event) => event.preventDefault());
        }
    }

    /* ---------------- PÁGINA "MI PERFIL" ---------------- */

    let ventana = null;     // contenedor del perfil en la página Mi perfil
    let fotoNueva = null;

    function prepararPagina() {
        ventana = document.getElementById("teacherProfilePage");
        if (!ventana) return false;

        ventana.innerHTML = `
            <div class="tp-content tp-page" id="tpContent">
                <p class="tp-loading">Cargando tu perfil…</p>
            </div>`;

        ventana.addEventListener("click", (event) => {
            if (event.target.closest("[data-tp-logout]")) cerrarSesion();
            if (event.target.closest("[data-tp-photo]")) ventana.querySelector("#tpFotoInput").click();
        });

        return true;
    }

    function filaDato(etiqueta, valor) {
        return `<div class="tp-dato"><span>${escapar(etiqueta)}</span><strong>${escapar(valor)}</strong></div>`;
    }

    function pintarVentana() {
        const { usuario, docente, grados } = perfil;
        const contenido = ventana.querySelector("#tpContent");
        const nombreCompleto = `${capitalizar(usuario.nombre)} ${capitalizar(usuario.apellido)}`;

        contenido.innerHTML = `
            <div class="tp-header">
                <div class="tp-avatar">
                    ${usuario.foto
                        ? `<img src="${escapar(usuario.foto)}" alt="Foto de ${escapar(nombreCompleto)}" id="tpFotoPreview">`
                        : `<span id="tpFotoPreview">${escapar(primeraPalabra(usuario.nombre).charAt(0))}</span>`}
                    <button type="button" class="tp-photo-btn" data-tp-photo aria-label="Cambiar foto">
                        <svg viewBox="0 0 24 24"><path d="M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                    <input type="file" id="tpFotoInput" accept="image/png, image/jpeg, image/webp" hidden>
                </div>
                <div>
                    <h2 id="tpNombre">${escapar(nombreCompleto)}</h2>
                    <p>${escapar(usuario.correo)}</p>
                    <div class="tp-chips">
                        <span class="tp-chip">${escapar(usuario.rol || "Docente")}</span>
                        <span class="tp-chip ${String(usuario.estado).toLowerCase() === "activo" ? "ok" : ""}">${escapar(usuario.estado)}</span>
                        ${usuario.comite_convivencia ? '<span class="tp-chip">Comité de convivencia</span>' : ""}
                    </div>
                </div>
            </div>

            <div class="tp-grid">
                <section class="tp-card">
                    <h3>Información personal</h3>
                    ${filaDato("Documento", `${usuario.tipo_id || ""} ${usuario.id_usuario}`.trim())}
                    ${filaDato("Edad", usuario.edad ? `${usuario.edad} años` : "—")}
                    ${filaDato("Fecha de nacimiento", fecha(usuario.fecha_nac))}
                    ${filaDato("Registrado desde", fecha(usuario.fecha_reg))}
                    ${filaDato("Comité de convivencia", usuario.comite_convivencia ? "Sí" : "No")}
                </section>

                <section class="tp-card">
                    <h3>Información docente</h3>
                    ${docente ? `
                        ${filaDato("Año cursado", docente.ano_cursado || "—")}
                        ${filaDato("Director de grupo", docente.director_grupo ? "Sí" : "No")}
                        ${docente.director_grupo && docente.grado_asignado
                            ? filaDato("Grupo que dirige", `${docente.grado_asignado} · ${estudiantes(docente.estudiantes_grado_asignado)}`)
                            : ""}
                    ` : `<p class="tp-empty">Aún no tienes ficha de docente. Pídela a la secretaría.</p>`}

                    <h3 class="tp-sub">Grados que enseña</h3>
                    ${grados.length
                        ? `<div class="tp-grades">${grados.map((g) => `
                            <span class="tp-grade"><strong>${escapar(g.grado)}</strong><small>${estudiantes(g.estudiantes)}</small></span>`).join("")}</div>`
                        : `<p class="tp-empty">No tienes grados registrados.</p>`}
                </section>
            </div>

            <form class="tp-card tp-form" id="tpForm" novalidate>
                <h3>Editar mis datos</h3>
                <div class="tp-fields">
                    <label>Nombre<input name="nombre" maxlength="100" autocomplete="given-name" value="${escapar(capitalizar(usuario.nombre))}" required></label>
                    <label>Apellido<input name="apellido" maxlength="100" autocomplete="family-name" value="${escapar(capitalizar(usuario.apellido))}" required></label>
                    <label>Correo electrónico<input name="correo" type="email" maxlength="150" autocomplete="email" value="${escapar(usuario.correo)}" required></label>
                    <label>Celular<input name="celular" inputmode="numeric" maxlength="15" autocomplete="tel" value="${escapar(usuario.celular)}" required></label>
                </div>
                <p class="tp-hint">El correo es con el que inicias sesión. El documento, el rol y los grados los cambia la secretaría.</p>
                <p class="tp-message" id="tpMessage" role="status"></p>
                <div class="tp-actions">
                    <button type="button" class="tp-logout" data-tp-logout>Cerrar sesión</button>
                    <button type="submit" class="tp-save" id="tpSave">Guardar cambios</button>
                </div>
            </form>`;

        fotoNueva = null;

        contenido.querySelector('[name="celular"]').addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 15);
        });

        contenido.querySelector("#tpFotoInput").addEventListener("change", elegirFoto);
        contenido.querySelector("#tpForm").addEventListener("submit", guardar);
    }

    function elegirFoto(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        if (!/^image\/(jpeg|png|webp)$/.test(archivo.type) || archivo.size > 5 * 1024 * 1024) {
            mensaje("La foto debe ser JPG, PNG o WEBP y pesar menos de 5 MB.", true);
            event.target.value = "";
            return;
        }

        fotoNueva = archivo;
        const vista = ventana.querySelector("#tpFotoPreview");
        const img = document.createElement("img");
        img.id = "tpFotoPreview";
        img.alt = "Nueva foto de perfil";
        img.src = URL.createObjectURL(archivo);
        vista.replaceWith(img);
        mensaje("Foto lista. Pulsa \"Guardar cambios\" para guardarla.");
    }

    function mensaje(texto, error) {
        const caja = ventana.querySelector("#tpMessage");
        if (!caja) return;
        caja.textContent = texto;
        caja.classList.toggle("error", Boolean(error));
    }

    async function guardar(event) {
        event.preventDefault();
        const formulario = event.target;
        const datos = Object.fromEntries(new FormData(formulario));

        if (!datos.nombre.trim() || !datos.apellido.trim()) return mensaje("Escribe tu nombre y tu apellido.", true);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) return mensaje("Escribe un correo electrónico válido.", true);
        if (datos.celular.length < 7) return mensaje("El celular debe tener al menos 7 dígitos.", true);

        const envio = new FormData();
        ["nombre", "apellido", "correo", "celular"].forEach((campo) => envio.append(campo, datos[campo].trim()));
        if (fotoNueva) envio.append("foto", fotoNueva);

        const boton = formulario.querySelector("#tpSave");
        boton.disabled = true;
        boton.textContent = "Guardando…";

        try {
            const respuesta = await pedir({ method: "PUT", body: envio });
            perfil = respuesta;

            // La sesión guarda el nombre nuevo para las demás pantallas
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                ...sesion,
                nombre: perfil.usuario.nombre,
                apellido: perfil.usuario.apellido
            }));

            pintarEncabezado();
            pintarVentana();
            mensaje(respuesta.message || "Tu perfil se actualizó correctamente.");
        } catch (error) {
            mensaje(error.message, true);
            boton.disabled = false;
            boton.textContent = "Guardar cambios";
        }
    }

    function cerrarSesion() {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem("sentirOrientacionDocente");   // conversación de Orientación
        window.location.replace(LOGIN_PAGE);
    }

    /* ---------------- "CERRAR SESIÓN" EN LA BARRA LATERAL ---------------- */

    function agregarCerrarSesionAlMenu() {
        const opciones = document.querySelectorAll(".sidebar .nav-item, #sidebar .nav-item");
        const ultima = opciones[opciones.length - 1];
        if (!ultima || document.getElementById("sidebarLogout")) return;

        const boton = document.createElement("button");
        boton.type = "button";
        boton.id = "sidebarLogout";
        boton.className = "nav-item tp-logout-item";
        boton.innerHTML = `
            <div class="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            </div>
            <span>Cerrar sesión</span>`;

        boton.addEventListener("click", () => {
            if (window.confirm("¿Deseas cerrar sesión?")) cerrarSesion();
        });

        ultima.after(boton);
    }

    /* ---------------- INICIO ---------------- */

    /* ---------------- TARJETAS DE RESUMEN DE INICIO ---------------- */
    // Mis grupos -> baja a "Mis grupos" · Mis alertas -> baja a "Mis alertas recientes"
    // Estudiantes -> abre "Mis estudiantes"

    function prepararTarjetasResumen() {
        const destinos = {
            "Mis grupos": { texto: "Ver mis grupos", ir: () => document.querySelector(".groups-grid")?.closest("section") },
            "Mis alertas": { texto: "Ver mis alertas", ir: () => document.querySelector(".reports-card") },
            "Estudiantes": { texto: "Ver mis estudiantes", url: "/Client/ScreenTeacher/MyStudents/MyStudents.html" }
        };

        document.querySelectorAll(".summary-card").forEach((tarjeta) => {
            const etiqueta = tarjeta.querySelector(".summary-label")?.textContent.trim();
            const destino = destinos[etiqueta];
            if (!destino) return;

            const pastilla = tarjeta.querySelector(".info-pill");
            if (pastilla) pastilla.innerHTML = `${destino.texto} <span aria-hidden="true">→</span>`;

            tarjeta.classList.add("tp-summary-link");
            tarjeta.setAttribute("role", "link");
            tarjeta.setAttribute("tabindex", "0");
            tarjeta.setAttribute("aria-label", destino.texto);

            const abrir = () => {
                if (destino.url) {
                    window.location.href = destino.url;
                    return;
                }
                const seccion = destino.ir();
                if (!seccion) return;
                seccion.scrollIntoView({ behavior: "smooth", block: "start" });
                seccion.classList.remove("tp-flash");
                void seccion.offsetWidth;
                seccion.classList.add("tp-flash");
            };

            tarjeta.addEventListener("click", abrir);
            tarjeta.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    abrir();
                }
            });
        });
    }

    async function iniciar() {
        agregarCerrarSesionAlMenu();
        prepararTarjetasResumen();
        prepararEncabezado();
        pintarEncabezado();   // con el nombre guardado al iniciar sesión, mientras carga
        const hayPaginaDePerfil = prepararPagina();

        try {
            perfil = await pedir();
            pintarEncabezado();
            pintarGrupos();
            if (hayPaginaDePerfil) pintarVentana();
        } catch (error) {
            console.warn("Perfil del docente:", error.message);
            if (hayPaginaDePerfil) {
                ventana.querySelector("#tpContent").innerHTML = `<p class="tp-loading">${escapar(error.message)}</p>`;
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
