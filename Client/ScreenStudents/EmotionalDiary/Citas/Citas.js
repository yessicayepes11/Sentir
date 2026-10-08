/* =========================================================
   MIS CITAS (Mi espacio personal del estudiante)
   - Pedir una cita en un horario libre de psicología o
     proponer otro horario (queda "esperando respuesta").
   - Ver las citas y su estado, y cancelarlas.
   La respuesta de la psicóloga llega a la campanita y al correo.
========================================================= */

const API_CITAS = "http://localhost:3001/api/Estudiante";

const ESTADOS = {
    "Pendiente": { texto: "Esperando respuesta", clase: "pending", icono: "fa-hourglass-half" },
    "Programada": { texto: "Confirmada", clase: "ok", icono: "fa-circle-check" },
    "Realizada": { texto: "Realizada", clase: "done", icono: "fa-check-double" },
    "No asistió": { texto: "No asististe", clase: "missed", icono: "fa-user-xmark" },
    "Rechazada": { texto: "No se pudo agendar", clase: "missed", icono: "fa-circle-xmark" },
    "Cancelada": { texto: "Cancelada", clase: "missed", icono: "fa-ban" }
};

function sesion() {
    try {
        const s = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
        return s && s.token ? s : null;
    } catch (error) {
        return null;
    }
}

async function api(ruta, opciones = {}) {
    const respuesta = await fetch(API_CITAS + ruta, {
        ...opciones,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (sesion() ? sesion().token : "") }
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (respuesta.status === 401) {
        sessionStorage.removeItem("sentirEstudiante");
        window.location.replace("/Client/ScreenStudents/EmotionalDiary/DiaryAccess/DiaryAccess.html?volver=" + encodeURIComponent(location.pathname));
    }
    if (!respuesta.ok) throw new Error(datos.message || "No se pudo completar la acción.");
    return datos;
}

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function hora12(hora) {
    const [h, m] = String(hora).split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

function hoyISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ESTADOS_AYUDA = {
    "Nueva": { texto: "Enviada", clase: "new", icono: "fa-paper-plane" },
    "En atención": { texto: "En atención", clase: "care", icono: "fa-hand-holding-heart" },
    "Resuelta": { texto: "Resuelta", clase: "ok", icono: "fa-circle-check" }
};

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initCitas();
    initAyudas();
});

/* ---------- Historial de ayudas pedidas al psicólogo/a ---------- */
function initAyudas() {
    const lista = document.getElementById("ayudaLista");
    if (!lista) return;

    async function cargar() {
        try {
            const ayudas = (await api("/ayudas")).ayudas || [];
            if (!ayudas.length) {
                lista.innerHTML = '<p class="citas-empty"><i class="fa-regular fa-folder-open"></i> Aún no has pedido ayuda. Cuando lo hagas, aquí verás cada solicitud y su estado.</p>';
                return;
            }
            lista.innerHTML = ayudas.map(a => {
                const e = ESTADOS_AYUDA[a.estado] || ESTADOS_AYUDA.Nueva;
                const d = new Date(a.fecha);
                const cuando = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                return `<div class="citas-item ayuda-item ${e.clase}">
                    <div class="citas-item-date">
                        <strong>${d.getDate()}</strong>
                        <span>${d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span>
                    </div>
                    <div class="citas-item-info">
                        <strong>${esc(cuando.charAt(0).toUpperCase() + cuando.slice(1))}</strong>
                        <small>${a.origen === "chat" ? "Desde el chat de Sentir IA" : "Formulario de ayuda"} · Prioridad ${esc(String(a.prioridad).toLowerCase())}</small>
                        <small class="citas-item-motivo">${esc(a.descripcion)}</small>
                    </div>
                    <div class="citas-item-side">
                        <span class="citas-state ${e.clase}"><i class="fa-solid ${e.icono}"></i> ${e.texto}</span>
                    </div>
                </div>`;
            }).join("");
        } catch (error) {
            lista.innerHTML = `<p class="citas-empty"><i class="fa-solid fa-plug-circle-xmark"></i> ${esc(error.message)}</p>`;
        }
    }

    // Al enviar una nueva solicitud desde el formulario de ayuda se recarga el historial
    document.addEventListener("sentir:ayuda-enviada", cargar);
    cargar();
    // Desde la campanita o el correo ("#ayudas") baja directo al historial
    const irAlHistorial = () => {
        if (location.hash === "#ayudas") setTimeout(() => lista.closest("#ayudas").scrollIntoView({ behavior: "smooth" }), 300);
    };
    window.addEventListener("hashchange", irAlHistorial);
    irAlHistorial();
}

/* ---------- Menú lateral (hamburguesa en celular) ---------- */
function initMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const abrir = document.getElementById("hamburgerButton");
    const cerrar = document.getElementById("closeSidebar");
    if (!sidebar || !overlay || !abrir) return;

    const mostrar = () => { sidebar.classList.add("open"); overlay.classList.add("show"); document.body.classList.add("no-scroll"); };
    const ocultar = () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); document.body.classList.remove("no-scroll"); };

    abrir.addEventListener("click", mostrar);
    if (cerrar) cerrar.addEventListener("click", ocultar);
    overlay.addEventListener("click", ocultar);
    document.querySelectorAll(".menu-item").forEach(a => a.addEventListener("click", () => { if (window.innerWidth <= 900) ocultar(); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") ocultar(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 900) ocultar(); });

    // Logos: si no carga la imagen se muestra el texto de respaldo
    [["logoSentir", "logoFallback"], ["mobileLogoImage", "mobileLogoFallback"]].forEach(([img, alt]) => {
        const imagen = document.getElementById(img);
        const respaldo = document.getElementById(alt);
        if (imagen && respaldo) imagen.addEventListener("error", () => { imagen.style.display = "none"; respaldo.style.display = "flex"; });
    });
}

/* ---------- Citas ---------- */
function initCitas() {
    const form = document.getElementById("citaForm");
    const dias = document.getElementById("citaDias");
    const horas = document.getElementById("citaHoras");
    const lista = document.getElementById("citaLista");
    const mensaje = document.getElementById("citaMensaje");
    const fecha = document.getElementById("citaFecha");
    if (!form) return;

    fecha.min = hoyISO();

    let modo = "horarios";
    let horarios = [];
    let diaElegido = null;
    let horarioElegido = null;
    let citas = [];
    let filtro = "proximas";

    const avisar = (texto, tipo = "error") => {
        mensaje.textContent = texto;
        mensaje.className = `citas-msg show ${tipo}`;
    };
    const limpiarAviso = () => { mensaje.className = "citas-msg"; mensaje.textContent = ""; };
    form.addEventListener("input", limpiarAviso);

    function mostrarModo() {
        form.querySelectorAll("#citaModos [data-modo]").forEach(b => b.classList.toggle("active", b.dataset.modo === modo));
        form.querySelectorAll("[data-cita]").forEach(el => { el.hidden = el.dataset.cita !== modo; });
        limpiarAviso();
    }
    form.querySelectorAll("#citaModos [data-modo]").forEach(b => b.addEventListener("click", () => { modo = b.dataset.modo; mostrarModo(); }));

    function pintarDias() {
        const fechas = [...new Set(horarios.map(h => h.fecha))];
        if (!fechas.length) {
            dias.innerHTML = '<p class="citas-empty"><i class="fa-regular fa-calendar-xmark"></i> En este momento no hay horarios libres. Usa "Proponer otro horario".</p>';
            horas.innerHTML = "";
            return;
        }
        if (!diaElegido || !fechas.includes(diaElegido)) diaElegido = fechas[0];
        dias.innerHTML = fechas.map(f => {
            const d = new Date(f + "T12:00:00");
            const libres = horarios.filter(h => h.fecha === f).length;
            return `<button type="button" class="citas-day ${f === diaElegido ? "active" : ""}" data-dia="${f}">
                <span>${d.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", "")}</span>
                <strong>${d.getDate()}</strong>
                <small>${d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")} · ${libres}</small>
            </button>`;
        }).join("");
        dias.querySelectorAll("[data-dia]").forEach(b => b.addEventListener("click", () => {
            diaElegido = b.dataset.dia;
            horarioElegido = null;
            pintarDias();
        }));
        pintarHoras();
    }

    function pintarHoras() {
        horas.innerHTML = horarios.filter(h => h.fecha === diaElegido).map(h => `
            <button type="button" class="citas-hour ${horarioElegido && horarioElegido.id === h.id ? "active" : ""}" data-horario="${h.id}" title="Con ${esc(h.psicologa)}">
                ${hora12(h.hora)}<small>${h.duracion} min</small>
            </button>`).join("");
        horas.querySelectorAll("[data-horario]").forEach(b => b.addEventListener("click", () => {
            horarioElegido = horarios.find(h => String(h.id) === b.dataset.horario);
            limpiarAviso();
            pintarHoras();
        }));
    }

    async function cargarHorarios() {
        dias.innerHTML = '<p class="citas-empty"><i class="fa-solid fa-spinner fa-spin"></i> Buscando horarios…</p>';
        horas.innerHTML = "";
        try {
            horarios = (await api("/horarios")).horarios || [];
        } catch (error) {
            horarios = [];
        }
        horarioElegido = null;
        pintarDias();
    }

    function pintarCitas() {
        const activas = c => c.estado === "Pendiente" || c.estado === "Programada";
        const mostrar = citas.filter(c => (filtro === "proximas" ? activas(c) : !activas(c)));
        form.closest(".citas-grid").querySelectorAll("#citaFiltros [data-filtro]").forEach(b => b.classList.toggle("active", b.dataset.filtro === filtro));

        if (!mostrar.length) {
            lista.innerHTML = filtro === "proximas"
                ? '<p class="citas-empty"><i class="fa-regular fa-calendar"></i> No tienes citas próximas. Pide una en "Pedir una cita".</p>'
                : '<p class="citas-empty"><i class="fa-regular fa-folder-open"></i> Aún no tienes citas anteriores.</p>';
            return;
        }
        lista.innerHTML = mostrar.map(c => {
            const e = ESTADOS[c.estado] || ESTADOS.Pendiente;
            const cancelable = activas(c);
            return `<div class="citas-item ${e.clase}">
                <div class="citas-item-date">
                    <strong>${new Date(c.fecha + "T12:00:00").getDate()}</strong>
                    <span>${new Date(c.fecha + "T12:00:00").toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span>
                </div>
                <div class="citas-item-info">
                    <strong>${esc(c.cuando.charAt(0).toUpperCase() + c.cuando.slice(1))}</strong>
                    <small>${esc(c.tipo)}${c.psicologa ? " · " + esc(c.psicologa) : ""}</small>
                    <small class="citas-item-motivo">${esc(c.motivo)}</small>
                    ${c.observacion ? `<small class="citas-item-obs"><i class="fa-solid fa-comment"></i> ${esc(c.observacion)}</small>` : ""}
                </div>
                <div class="citas-item-side">
                    <span class="citas-state ${e.clase}"><i class="fa-solid ${e.icono}"></i> ${e.texto}</span>
                    ${cancelable ? `<button type="button" class="citas-cancel" data-cancelar="${c.id}">Cancelar</button>` : ""}
                </div>
            </div>`;
        }).join("");

        lista.querySelectorAll("[data-cancelar]").forEach(b => b.addEventListener("click", async () => {
            if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;
            b.disabled = true;
            try {
                await api(`/citas/${b.dataset.cancelar}/cancelar`, { method: "PUT" });
                await Promise.all([cargarCitas(), cargarHorarios()]);
            } catch (error) {
                alert(error.message);
                b.disabled = false;
            }
        }));
    }

    async function cargarCitas() {
        try {
            citas = (await api("/citas")).citas || [];
            pintarCitas();
        } catch (error) {
            lista.innerHTML = `<p class="citas-empty"><i class="fa-solid fa-plug-circle-xmark"></i> ${esc(error.message)}</p>`;
        }
    }

    document.querySelectorAll("#citaFiltros [data-filtro]").forEach(b => b.addEventListener("click", () => { filtro = b.dataset.filtro; pintarCitas(); }));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const motivo = document.getElementById("citaMotivo").value.trim();
        let horario;
        if (modo === "horarios") {
            if (!horarioElegido) return avisar("Elige un día y una hora disponibles.");
            horario = { idDisponibilidad: horarioElegido.id };
        } else {
            const f = fecha.value;
            const h = document.getElementById("citaHora").value;
            if (!f || !h) return avisar("Elige la fecha y la hora que prefieres.");
            if (new Date(`${f}T${h}:00`) <= new Date()) return avisar("La fecha y la hora deben ser futuras.");
            horario = { fecha: f, hora: h };
        }
        if (motivo.length < 5) return avisar("Cuéntanos brevemente el motivo de la cita.");

        const boton = document.getElementById("citaEnviar");
        boton.disabled = true;
        try {
            const r = await api("/citas", { method: "POST", body: JSON.stringify({ ...horario, motivo }) });
            form.reset();
            fecha.min = hoyISO();
            avisar(`¡Listo! Pediste tu cita para el ${String(r.cuando).replace(/\.$/, "")}. Te avisaremos cuando la psicóloga responda.`, "ok");
            filtro = "proximas";
            await Promise.all([cargarCitas(), cargarHorarios()]);
            if (window.SentirNotificaciones) window.SentirNotificaciones.actualizar();
        } catch (error) {
            avisar(error.message);
        } finally {
            boton.disabled = false;
        }
    });

    mostrarModo();
    cargarHorarios();
    cargarCitas();
}
