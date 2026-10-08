/* =========================================================
   MIS ALERTAS RECIENTES (Inicio del docente)

   - Muestra las alertas que envió el docente que inició sesión
     (desde Mis estudiantes > "Enviar alerta"), guardadas en `ayuda`.
   - Filtros: estudiante, situación observada, estado y periodo.
   - Al tocar una alerta se ve la descripción completa.
   - La tarjeta "Mis alertas" muestra cuántas ha enviado.
   - El botón "ENVIAR ALERTA" de Inicio: la ventana se llena con los
     grupos y estudiantes del docente y guarda la alerta en el servidor
     (window.SentirAlertas.enviar, lo usa teacher.js).
========================================================= */

(function () {

    const API = "http://localhost:3001/api/Docente/alertas";
    const ESTADOS = { Enviado: "sent", Recibido: "received", "Revisado por orientación": "reviewed" };

    let alertas = [];

    function escapar(valor) {
        const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
        return String(valor ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);
    }

    function capitalizar(texto) {
        return String(texto || "")
            .toLocaleLowerCase("es")
            .replace(/(^|\s)(\p{L})/gu, (m, espacio, letra) => espacio + letra.toLocaleUpperCase("es"));
    }

    // "cansancio y llanto" -> "Cansancio y llanto"
    function primeraMayuscula(texto) {
        const limpio = String(texto || "").trim();
        return limpio.charAt(0).toLocaleUpperCase("es") + limpio.slice(1);
    }

    function normalizar(texto) {
        return String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    }

    function fechaCorta(iso) {
        const fecha = new Date(iso);
        return Number.isNaN(fecha.getTime())
            ? ""
            : fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
    }

    function token() {
        try {
            return JSON.parse(sessionStorage.getItem("usuarioSentir") || "{}").token || "";
        } catch (error) {
            return "";
        }
    }

    /* ---------------- FILTROS ---------------- */

    function crearFiltros(seccion) {
        const barra = document.createElement("div");
        barra.className = "alerts-filters";
        barra.innerHTML = `
            <div class="alerts-search">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
                <input type="text" id="alertsSearch" placeholder="Buscar estudiante o grupo..." aria-label="Buscar estudiante o grupo">
            </div>
            <select id="alertsSituation" aria-label="Filtrar por situación">
                <option value="all">Todas las situaciones</option>
            </select>
            <select id="alertsStatus" aria-label="Filtrar por estado">
                <option value="all">Todos los estados</option>
                <option value="Enviado">Enviado</option>
                <option value="Recibido">Recibido</option>
            </select>
            <select id="alertsPeriod" aria-label="Filtrar por periodo">
                <option value="all">Cualquier fecha</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="year">Este año</option>
            </select>
            <button type="button" class="alerts-clear" id="alertsClear">Limpiar</button>
            <span class="alerts-count" id="alertsCount"></span>`;

        seccion.querySelector(".section-title").after(barra);

        barra.addEventListener("input", pintar);
        barra.addEventListener("change", pintar);
        barra.querySelector("#alertsClear").addEventListener("click", () => {
            barra.querySelectorAll("select").forEach((select) => { select.value = "all"; });
            barra.querySelector("#alertsSearch").value = "";
            pintar();
        });
    }

    function opcionesDeSituacion() {
        const select = document.getElementById("alertsSituation");
        const situaciones = [...new Set(alertas.map((a) => a.situacion))].sort((a, b) => a.localeCompare(b, "es"));
        select.innerHTML = '<option value="all">Todas las situaciones</option>' +
            situaciones.map((s) => `<option value="${escapar(s)}">${escapar(primeraMayuscula(s))}</option>`).join("");
    }

    function filtrar() {
        const texto = normalizar(document.getElementById("alertsSearch").value.trim());
        const situacion = document.getElementById("alertsSituation").value;
        const estado = document.getElementById("alertsStatus").value;
        const periodo = document.getElementById("alertsPeriod").value;
        const ahora = new Date();

        return alertas.filter((alerta) => {
            const fecha = new Date(alerta.fecha);
            let enPeriodo = true;
            if (periodo === "year") enPeriodo = fecha.getFullYear() === ahora.getFullYear();
            else if (periodo !== "all") enPeriodo = (ahora - fecha) / 86400000 <= Number(periodo);

            return (!texto || normalizar(`${alerta.estudiante} ${alerta.grado}`).includes(texto)) &&
                (situacion === "all" || alerta.situacion === situacion) &&
                (estado === "all" || alerta.estado === estado) &&
                enPeriodo;
        });
    }

    /* ---------------- TABLA ---------------- */

    function avatar(alerta) {
        const nombre = capitalizar(alerta.estudiante);
        const letras = nombre.split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join("");
        return alerta.foto
            ? `<img src="${escapar(alerta.foto)}" alt="Foto de ${escapar(nombre)}" onerror="this.replaceWith(document.createTextNode('${escapar(letras)}'))">`
            : escapar(letras);
    }

    function pintar() {
        const cuerpo = document.querySelector(".reports-card tbody");
        const visibles = filtrar();

        document.getElementById("alertsCount").textContent =
            `${visibles.length} de ${alertas.length} alerta${alertas.length === 1 ? "" : "s"}`;

        if (!alertas.length) {
            cuerpo.innerHTML = `<tr class="alerts-empty"><td colspan="5">Aún no has enviado alertas. Puedes hacerlo desde <a href="./MyStudents/MyStudents.html">Mis estudiantes</a>.</td></tr>`;
            return;
        }

        if (!visibles.length) {
            cuerpo.innerHTML = '<tr class="alerts-empty"><td colspan="5">Ninguna alerta coincide con los filtros.</td></tr>';
            return;
        }

        cuerpo.innerHTML = visibles.map((alerta) => {
            const urgente = ["alto", "critico"].includes(alerta.nivelRiesgo);
            return `
                <tr class="alert-row" data-id="${alerta.id}" tabindex="0" title="Ver la descripción">
                    <td>
                        <div class="student-table-data">
                            <div class="student-avatar alert-avatar">${avatar(alerta)}</div>
                            <strong>${escapar(capitalizar(alerta.estudiante))}</strong>
                        </div>
                    </td>
                    <td>${escapar(fechaCorta(alerta.fecha))}</td>
                    <td>
                        ${escapar(primeraMayuscula(alerta.situacion))}
                        ${urgente ? `<span class="alert-priority">Prioridad ${escapar(alerta.prioridad)}</span>` : ""}
                    </td>
                    <td>${escapar(alerta.grado)}</td>
                    <td><span class="status ${ESTADOS[alerta.estado] || "sent"}">${escapar(alerta.estado)}</span></td>
                </tr>
                <tr class="alert-detail" data-detail="${alerta.id}" hidden>
                    <td colspan="5"><strong>Lo que observaste:</strong> ${escapar(alerta.descripcion || "Sin descripción")}</td>
                </tr>`;
        }).join("");
    }

    function alternarDetalle(fila) {
        const detalle = document.querySelector(`[data-detail="${fila.dataset.id}"]`);
        if (!detalle) return;
        detalle.hidden = !detalle.hidden;
        fila.classList.toggle("open", !detalle.hidden);
    }

    /* ---------------- INICIO ---------------- */

    async function iniciar() {
        const seccion = document.querySelector(".reports-card");
        if (!seccion) return;

        // La columna "Estudiante(s)" ahora muestra el grupo del estudiante
        const encabezados = seccion.querySelectorAll("thead th");
        if (encabezados[3]) encabezados[3].textContent = "Grupo";

        crearFiltros(seccion);
        seccion.querySelector("tbody").innerHTML = '<tr class="alerts-empty"><td colspan="5">Cargando tus alertas…</td></tr>';

        seccion.querySelector("tbody").addEventListener("click", (event) => {
            const fila = event.target.closest(".alert-row");
            if (fila) alternarDetalle(fila);
        });
        seccion.querySelector("tbody").addEventListener("keydown", (event) => {
            const fila = event.target.closest(".alert-row");
            if (fila && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                alternarDetalle(fila);
            }
        });

        await cargarAlertas();
        await prepararVentanaDeAlerta();
    }

    async function cargarAlertas() {
        const seccion = document.querySelector(".reports-card");
        if (!seccion) return;

        try {
            const respuesta = await fetch(API, { headers: { Authorization: "Bearer " + token() } });
            const datos = await respuesta.json().catch(() => ({}));
            if (!respuesta.ok) throw new Error(datos.message || "No se pudieron cargar tus alertas.");

            alertas = datos.alertas || [];
            opcionesDeSituacion();
            pintar();

            // Tarjeta de resumen "Mis alertas"
            const tarjeta = [...document.querySelectorAll(".summary-card")]
                .find((t) => t.querySelector(".summary-label")?.textContent.trim() === "Mis alertas");
            const total = tarjeta?.querySelector("strong");
            if (total) total.textContent = `${alertas.length} ${alertas.length === 1 ? "alerta enviada" : "alertas enviadas"}`;
        } catch (error) {
            seccion.querySelector("tbody").innerHTML =
                `<tr class="alerts-empty"><td colspan="5">${escapar(error.message === "Failed to fetch" ? "No se pudo conectar con el servidor." : error.message)}</td></tr>`;
        }
    }

    /* ---------------- VENTANA "ENVIAR ALERTA" DE INICIO ---------------- */

    let estudiantes = [];

    function opcionesDeEstudiante() {
        const grupo = document.getElementById("group").value;
        const select = document.getElementById("student");
        const anterior = select.value;
        const lista = estudiantes.filter((e) => !grupo || e.grupo === grupo);

        select.innerHTML = `<option value="">${lista.length ? "Selecciona un estudiante" : "No hay estudiantes en este grupo"}</option>` +
            lista.map((e) => `<option value="${escapar(e.id)}">${escapar(capitalizar(`${e.nombre} ${e.apellido}`))}${grupo ? "" : ` · ${escapar(e.grupo)}`}</option>`).join("");

        if (lista.some((e) => String(e.id) === anterior)) select.value = anterior;
    }

    function mostrarMotivo() {
        const otro = document.getElementById("type").value === "Otro";
        const campo = document.getElementById("typeOtherField");
        const motivo = document.getElementById("typeOther");
        if (!campo || !motivo) return;
        campo.hidden = !otro;
        motivo.required = otro;
        if (!otro) motivo.value = "";
    }

    async function prepararVentanaDeAlerta() {
        const grupoSelect = document.getElementById("group");
        const estudianteSelect = document.getElementById("student");
        if (!grupoSelect || !estudianteSelect) return;

        try {
            const respuesta = await fetch("http://localhost:3001/api/Docente/estudiantes", {
                headers: { Authorization: "Bearer " + token() }
            });
            const datos = await respuesta.json().catch(() => ({}));
            if (!respuesta.ok) throw new Error(datos.message || "");

            estudiantes = datos.estudiantes || [];
            grupoSelect.innerHTML = '<option value="">Todos mis grupos</option>' +
                (datos.grupos || []).map((g) => `<option value="${escapar(g)}">${escapar(g)}</option>`).join("");
            grupoSelect.required = false;
            opcionesDeEstudiante();
        } catch (error) {
            estudianteSelect.innerHTML = '<option value="">No se pudieron cargar tus estudiantes</option>';
        }

        // Al elegir grupo se filtran los estudiantes; al elegir estudiante se marca su grupo
        grupoSelect.addEventListener("change", opcionesDeEstudiante);
        estudianteSelect.addEventListener("change", () => {
            const elegido = estudiantes.find((e) => String(e.id) === estudianteSelect.value);
            if (elegido && grupoSelect.value !== elegido.grupo) {
                grupoSelect.value = elegido.grupo;
                opcionesDeEstudiante();
                estudianteSelect.value = String(elegido.id);
            }
        });
        document.getElementById("type")?.addEventListener("change", () => {
            mostrarMotivo();
            if (document.getElementById("type").value === "Otro") document.getElementById("typeOther")?.focus();
        });
    }

    async function enviarAlerta(datos) {
        if (!datos.student) throw new Error("Selecciona el estudiante.");

        const respuesta = await fetch("http://localhost:3001/api/Docente/alertas", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() },
            body: JSON.stringify({
                idEstudiante: datos.student,
                tipo: datos.type,
                motivo: document.getElementById("typeOther")?.value || "",
                descripcion: datos.description
            })
        }).catch(() => { throw new Error("No se pudo conectar con el servidor."); });

        const resultado = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(resultado.message || "No se pudo enviar la alerta.");

        await cargarAlertas();   // la nueva alerta aparece en "Mis alertas recientes"
        if (window.SentirNotificacionesDocente) window.SentirNotificacionesDocente.actualizar();   // confirmación en la campanita
        return resultado;
    }

    function reiniciarFormulario() {
        mostrarMotivo();
        opcionesDeEstudiante();
    }

    window.SentirAlertas = { enviar: enviarAlerta, reiniciarFormulario };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
