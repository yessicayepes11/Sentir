/* =========================================================
   MIS ESTUDIANTES — DATOS DE LA BASE DE DATOS

   1. Pide al servidor los estudiantes de los grupos que el docente
      enseña o dirige (solo información general).
   2. Llena la tabla y el filtro de grupos.
   3. Después carga MyStudents.js, que maneja la búsqueda, los
      filtros, "Ver información" y "Enviar alerta" sobre esas filas.
========================================================= */

(function () {

    const API = "http://localhost:3001/api/Docente/estudiantes";
    const COLORES = ["purple-avatar", "blue-avatar", "pink-avatar", "green-avatar", "orange-avatar"];

    function escapar(valor) {
        const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
        return String(valor ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);
    }

    function capitalizar(texto) {
        return String(texto || "")
            .toLocaleLowerCase("es")
            .replace(/(^|\s)(\p{L})/gu, (m, espacio, letra) => espacio + letra.toLocaleUpperCase("es"));
    }

    function iniciales(nombre) {
        return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
    }

    function token() {
        try {
            return JSON.parse(sessionStorage.getItem("usuarioSentir") || "{}").token || "";
        } catch (error) {
            return "";
        }
    }

    function fila(estudiante, indice) {
        const nombre = `${capitalizar(estudiante.nombre)} ${capitalizar(estudiante.apellido)}`.trim();
        const edad = estudiante.edad !== null ? `${estudiante.edad} años` : "No registrada";
        const documento = `${estudiante.tipo_id ? estudiante.tipo_id + " " : ""}${estudiante.id}`;
        const datos = `data-id="${escapar(estudiante.id)}" data-student="${escapar(nombre)}" data-group="${escapar(estudiante.grupo)}" data-grade="${escapar(estudiante.grado)}" data-photo="${escapar(estudiante.foto || "")}"`;

        return `
            <tr data-name="${escapar(nombre)}" data-group="${escapar(estudiante.grupo)}" data-grade="${escapar(estudiante.grado)}"
                data-search="${escapar(`${nombre} ${estudiante.id} ${estudiante.correo || ""}`)}">
                <td>
                    <div class="student-info">
                        <div class="student-avatar ${COLORES[indice % COLORES.length]}">${avatar(estudiante.foto, nombre)}</div>
                        <div>
                            <strong>${escapar(nombre)}</strong>
                            <span>Estudiante</span>
                        </div>
                    </div>
                </td>
                <td>${escapar(estudiante.grupo)}</td>
                <td>${escapar(estudiante.grado)}</td>
                <td>${escapar(estudiante.correo || "Sin correo")}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="detail-button" ${datos}
                                data-document="${escapar(documento)}" data-age="${escapar(edad)}"
                                data-email="${escapar(estudiante.correo || "Sin correo")}">
                            <svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>
                            <span>Ver información</span>
                        </button>
                        <button type="button" class="student-alert-button" ${datos}
                                aria-label="Enviar alerta sobre ${escapar(nombre)}">
                            <svg viewBox="0 0 24 24"><path d="M12 3L2.8 20h18.4z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            <span class="tooltip">Enviar alerta</span>
                        </button>
                    </div>
                </td>
            </tr>`;
    }

    // Foto del estudiante; si no tiene (o no carga), sus iniciales
    function avatar(foto, nombre) {
        const letras = escapar(iniciales(nombre));
        if (!foto) return letras;
        return `<img class="student-photo" src="${escapar(foto)}" alt="Foto de ${escapar(nombre)}" onerror="this.replaceWith(document.createTextNode('${letras}'))">`;
    }

    function ponerFoto(contenedor, boton) {
        if (!contenedor || !boton) return;
        contenedor.innerHTML = avatar(boton.dataset.photo, boton.dataset.student || "");
        contenedor.classList.toggle("has-photo", Boolean(boton.dataset.photo));
    }

    function nombreDelDocente() {
        try {
            const sesion = JSON.parse(sessionStorage.getItem("usuarioSentir") || "{}");
            return `Prof. ${capitalizar(sesion.nombre)} ${capitalizar(sesion.apellido)}`.trim();
        } catch (error) {
            return "Docente";
        }
    }

    // Después de que MyStudents.js abre cada ventana, se completa con la foto y el docente
    document.addEventListener("click", function (event) {
        const detalle = event.target.closest(".detail-button");
        if (detalle) ponerFoto(document.getElementById("modalStudentInitials"), detalle);

        const alerta = event.target.closest(".student-alert-button");
        if (alerta) {
            ponerFoto(document.getElementById("alertStudentInitials"), alerta);
            const remitente = document.getElementById("alertSenderName");
            if (remitente) remitente.textContent = nombreDelDocente();
            mostrarMotivo();
        }
    });

    // "Otro": aparece el campo para escribir el motivo
    function mostrarMotivo() {
        const tipo = document.getElementById("alertType");
        const campo = document.getElementById("alertOtherField");
        const motivo = document.getElementById("alertOther");
        if (!tipo || !campo || !motivo) return;
        const esOtro = tipo.value === "Otro";
        campo.hidden = !esOtro;
        motivo.required = esOtro;
        if (!esOtro) motivo.value = "";
    }

    document.addEventListener("change", function (event) {
        if (event.target.id === "alertType") {
            mostrarMotivo();
            if (event.target.value === "Otro") document.getElementById("alertOther")?.focus();
        }
    });

    const NOMBRE_GRADO = ["Transición", "Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto",
        "Séptimo", "Octavo", "Noveno", "Décimo", "Undécimo"];

    function gradoDe(grupo) {
        const numero = Number(String(grupo).split("-")[0]);
        return NOMBRE_GRADO[numero] || String(grupo);
    }

    function prepararFiltros(grupos) {
        const filtroGrado = document.getElementById("gradeFilter");
        const filtroGrupo = document.getElementById("groupFilter");

        const grados = [...new Set(grupos.map(gradoDe))]
            .sort((a, b) => NOMBRE_GRADO.indexOf(a) - NOMBRE_GRADO.indexOf(b));

        if (filtroGrado) {
            filtroGrado.innerHTML = '<option value="all">Todos los grados</option>' +
                grados.map((g) => `<option value="${escapar(g)}">${escapar(g)}</option>`).join("");
        }

        // Los grupos que se ofrecen dependen del grado elegido
        function opcionesDeGrupo() {
            const grado = filtroGrado ? filtroGrado.value : "all";
            const anterior = filtroGrupo.value;
            const visibles = grupos.filter((g) => grado === "all" || gradoDe(g) === grado);

            filtroGrupo.innerHTML = '<option value="all">Todos los grupos</option>' +
                visibles.map((g) => `<option value="${escapar(g)}">${escapar(g)}</option>`).join("");
            filtroGrupo.value = visibles.includes(anterior) ? anterior : "all";
        }

        opcionesDeGrupo();

        filtroGrado?.addEventListener("change", function () {
            opcionesDeGrupo();
            if (typeof window.filterStudents === "function") window.filterStudents();
        });
    }

    function mostrarVacio(titulo, texto) {
        const tabla = document.getElementById("studentsTable");
        const vacio = document.getElementById("emptyState");
        if (tabla) tabla.style.display = "none";
        if (vacio) {
            vacio.querySelector("h3").textContent = titulo;
            vacio.querySelector("p").textContent = texto;
            vacio.classList.add("show");
        }
    }

    function cargarScriptDeLaPagina() {
        const script = document.createElement("script");
        script.src = "MyStudents.js";
        document.body.appendChild(script);
    }

    async function iniciar() {
        const cuerpo = document.querySelector("#studentsTable tbody");
        const filtro = document.getElementById("groupFilter");
        const contador = document.getElementById("resultsCounter");

        cuerpo.innerHTML = '<tr class="loading-row"><td colspan="5">Cargando tus estudiantes…</td></tr>';
        contador.textContent = "Cargando…";

        try {
            const respuesta = await fetch(API, { headers: { Authorization: "Bearer " + token() } });
            const datos = await respuesta.json().catch(() => ({}));
            if (!respuesta.ok) throw new Error(datos.message || "No se pudieron cargar tus estudiantes.");

            const { grupos = [], estudiantes = [] } = datos;

            // Filtros: solo los grados y grupos del docente
            prepararFiltros(grupos);

            cuerpo.innerHTML = estudiantes.map(fila).join("");
            contador.textContent = `${estudiantes.length} estudiante${estudiantes.length === 1 ? "" : "s"}`;

            // Recuadro de resumen de arriba
            const resumenEstudiantes = document.getElementById("summaryStudents");
            const resumenGrupos = document.getElementById("summaryGroups");
            if (resumenEstudiantes) resumenEstudiantes.textContent = contador.textContent;
            if (resumenGrupos) resumenGrupos.textContent = `${grupos.length} ${grupos.length === 1 ? "grupo asignado" : "grupos asignados"}`;

            if (!grupos.length) {
                mostrarVacio("Aún no tienes grupos asignados", "La secretaría registra en tu ficha los grados que enseñas.");
            } else if (!estudiantes.length) {
                mostrarVacio("Tus grupos aún no tienen estudiantes", `Grupos: ${grupos.join(", ")}. Cuando la secretaría registre estudiantes en ellos, aparecerán aquí.`);
            }
        } catch (error) {
            cuerpo.innerHTML = "";
            contador.textContent = "0 estudiantes";
            mostrarVacio("No se pudo cargar la lista", error.message === "Failed to fetch" ? "No se pudo conectar con el servidor." : error.message);
        } finally {
            cargarScriptDeLaPagina();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
