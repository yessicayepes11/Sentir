/* =========================================================
   CAMPANITA DE NOTIFICACIONES DEL ESTUDIANTE
   Se incluye en las pantallas del estudiante que requieren sesión.
   - Muestra los avisos guardados en la base de datos (cita asignada,
     aceptada, cambiada, rechazada, cancelada...), los recordatorios de
     próximas citas/intervenciones y la confirmación al pedir ayuda.
   - Arriba muestra las próximas citas e intervenciones confirmadas.
   - Cuando llega un aviso nuevo, lo muestra como alerta.
   - Revisa si hay avisos nuevos cada minuto.
   - Abajo: accesos a "Mis citas" y al historial de ayudas.
   Se coloca sola: junto a "Mi perfil" (barra del espacio personal),
   en lugar de la campanita del perfil, o flotante arriba a la derecha.
========================================================= */
(function () {
    "use strict";

    const API = "http://localhost:3001/api/Estudiante";
    const CADA_MS = 60000;
    const VISTAS_KEY = "sentirAvisosMostrados";
    const TIPOS_ALERTA = ["cita_aceptada", "cita_asignada", "cita_cambiada", "cita_rechazada", "cita_cancelada",
        "recordatorio_24h", "recordatorio_hoy", "ayuda_enviada"];
    const ICONOS = {
        cita_aceptada: "fa-circle-check",
        cita_asignada: "fa-calendar-plus",
        cita_cambiada: "fa-calendar-days",
        cita_rechazada: "fa-calendar-xmark",
        cita_cancelada: "fa-ban",
        recordatorio_24h: "fa-clock",
        recordatorio_hoy: "fa-hourglass-half",
        ayuda_enviada: "fa-life-ring"
    };
    const PAGINA_CITAS = "/Client/ScreenStudents/EmotionalDiary/Citas/Citas.html";
    const TIPOS_INTERVENCION = ["Seguimiento de caso", "Sesión individual"];

    function sesion() {
        try {
            const s = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
            return s && s.token ? s : null;
        } catch (e) {
            return null;
        }
    }
    if (!sesion()) return;   // sin sesión no hay campanita

    async function api(ruta, opciones) {
        const r = await fetch(API + ruta, {
            ...(opciones || {}),
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + sesion().token }
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
    }

    const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function hace(fecha) {
        const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
        if (min < 1) return "Ahora";
        if (min < 60) return `Hace ${min} min`;
        const h = Math.round(min / 60);
        if (h < 24) return `Hace ${h} h`;
        const d = Math.round(h / 24);
        return d === 1 ? "Ayer" : `Hace ${d} días`;
    }

    /* ---------- Estilos (se agregan una sola vez) ---------- */
    const css = `
    .sn-wrap{position:relative;display:inline-flex;flex-shrink:0}
    .sn-bell{width:44px;height:44px;border-radius:14px;border:1px solid #E6E1F7;background:#fff;color:#5b4fd6;display:grid;place-items:center;cursor:pointer;font-size:18px;position:relative;box-shadow:0 6px 16px rgba(80,60,160,.08);transition:transform .15s ease}
    .sn-bell:hover{transform:translateY(-1px)}
    .sn-bell:focus-visible{outline:3px solid rgba(108,77,246,.35);outline-offset:2px}
    .sn-badge{position:absolute;top:-5px;right:-5px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#EF4444;color:#fff;font:700 11px/20px Poppins,sans-serif;text-align:center;border:2px solid #fff}
    .sn-panel{position:absolute;top:calc(100% + 10px);right:0;width:min(360px,calc(100vw - 24px));max-height:min(460px,70vh);display:flex;flex-direction:column;background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(40,25,110,.22);border:1px solid #EEE9FB;z-index:3000;overflow:hidden;font-family:Poppins,sans-serif}
    .sn-panel[hidden]{display:none}
    .sn-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #F1EDFB}
    .sn-head strong{font-size:15px;color:#2b2453}
    .sn-head button{border:none;background:none;color:#6c4df6;font:600 12px Poppins,sans-serif;cursor:pointer}
    .sn-list{overflow-y:auto}
    .sn-item{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid #F6F3FD}
    .sn-item.unread{background:#F7F4FF}
    .sn-item > i{width:34px;height:34px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;background:#EFEAFE;color:#6c4df6;font-size:14px}
    .sn-item.t-cita_rechazada > i,.sn-item.t-cita_cancelada > i{background:#FEF2F2;color:#DC2626}
    .sn-item.t-cita_aceptada > i{background:#DCFCE7;color:#15803D}
    .sn-item strong{display:block;font-size:13px;color:#2b2453}
    .sn-item p{font-size:12px;color:#5f5a80;line-height:1.45;margin:3px 0}
    .sn-item small{font-size:11px;color:#9a94b8}
    a.sn-item{text-decoration:none;color:inherit}
    a.sn-item:hover{background:#FBFAFF}
    .sn-item.t-recordatorio_24h > i,.sn-item.t-recordatorio_hoy > i{background:#FEF3C7;color:#B45309}
    .sn-item.t-ayuda_enviada > i{background:#E6F7EF;color:#2fa775}
    .sn-sec{padding:10px 16px 6px;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#8a84a8}
    .sn-next{display:flex;gap:10px;align-items:center;margin:0 12px 8px;padding:10px 12px;border-radius:14px;background:#F7F4FF;text-decoration:none;color:inherit}
    .sn-next b{min-width:42px;padding:4px 0;border-radius:10px;background:#fff;color:#6c4df6;text-align:center;font-size:15px;line-height:1.1}
    .sn-next b small{display:block;font-size:10px;color:#8a84a8;font-weight:600;text-transform:capitalize}
    .sn-next span{font-size:12px;color:#5f5a80;line-height:1.4}
    .sn-next span strong{display:block;font-size:13px;color:#2b2453}
    .sn-foot{display:flex;border-top:1px solid #F1EDFB}
    .sn-foot a{flex:1;padding:11px 8px;text-align:center;font:600 12px Poppins,sans-serif;color:#6c4df6;text-decoration:none}
    .sn-foot a + a{border-left:1px solid #F1EDFB}
    .sn-foot a:hover{background:#F7F4FF}
    .sn-empty{padding:28px 16px;text-align:center;color:#8a84a8;font-size:13px}
    .sn-empty i{display:block;font-size:24px;color:#C9BEF7;margin-bottom:8px}
    .sn-floating{position:fixed;top:16px;right:18px;z-index:2500}
    .sn-group{display:flex;align-items:center;gap:10px;margin-left:auto}
    .sn-alert{position:fixed;right:18px;bottom:18px;width:min(380px,calc(100vw - 24px));background:#fff;border-radius:20px;box-shadow:0 22px 55px rgba(40,25,110,.28);border:1px solid #EEE9FB;padding:18px;z-index:4000;font-family:Poppins,sans-serif;animation:snIn .35s ease}
    .sn-alert-top{display:flex;gap:12px;align-items:flex-start}
    .sn-alert-top > i{width:42px;height:42px;flex-shrink:0;border-radius:14px;display:grid;place-items:center;background:#DCFCE7;color:#15803D;font-size:19px}
    .sn-alert.t-cita_rechazada .sn-alert-top > i,.sn-alert.t-cita_cancelada .sn-alert-top > i{background:#FEF2F2;color:#DC2626}
    .sn-alert.t-cita_asignada .sn-alert-top > i,.sn-alert.t-cita_cambiada .sn-alert-top > i{background:#EFEAFE;color:#6c4df6}
    .sn-alert.t-recordatorio_24h .sn-alert-top > i,.sn-alert.t-recordatorio_hoy .sn-alert-top > i{background:#FEF3C7;color:#B45309}
    .sn-alert.t-ayuda_enviada .sn-alert-top > i{background:#E6F7EF;color:#2fa775}
    .sn-alert strong{display:block;font-size:15px;color:#2b2453;margin-bottom:4px}
    .sn-alert p{font-size:13px;color:#5f5a80;line-height:1.5;margin:0}
    .sn-alert button{margin-top:14px;width:100%;border:none;border-radius:12px;padding:11px;background:linear-gradient(135deg,#6c4df6,#8f6bff);color:#fff;font:600 13px Poppins,sans-serif;cursor:pointer}
    @keyframes snIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @media (max-width:560px){.sn-alert{right:12px;bottom:12px}.sn-floating{top:12px;right:12px}}
    `;
    if (!document.getElementById("sn-estilos")) {
        const style = document.createElement("style");
        style.id = "sn-estilos";
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* ---------- Componente ---------- */
    const wrap = document.createElement("div");
    wrap.className = "sn-wrap";
    wrap.innerHTML = `
        <button type="button" class="sn-bell" aria-label="Notificaciones" aria-haspopup="true" aria-expanded="false">
            <i class="fa-regular fa-bell"></i>
            <span class="sn-badge" hidden>0</span>
        </button>
        <div class="sn-panel" role="dialog" aria-label="Notificaciones" hidden>
            <div class="sn-head"><strong>Notificaciones</strong><button type="button" class="sn-readall">Marcar todo como leído</button></div>
            <div class="sn-list"><div class="sn-empty"><i class="fa-solid fa-spinner fa-spin"></i>Cargando…</div></div>
            <div class="sn-foot">
                <a href="${PAGINA_CITAS}"><i class="fa-regular fa-calendar"></i> Mis citas</a>
                <a href="${PAGINA_CITAS}#ayudas"><i class="fa-solid fa-life-ring"></i> Historial de ayudas</a>
            </div>
        </div>`;
    const bell = wrap.querySelector(".sn-bell");
    const badge = wrap.querySelector(".sn-badge");
    const panel = wrap.querySelector(".sn-panel");
    const lista = wrap.querySelector(".sn-list");

    function colocar() {
        const userbar = document.querySelector(".diary-userbar");
        const perfilChip = userbar && userbar.querySelector(".profile-chip");
        const campanaVieja = document.querySelector(".notification-wrapper");
        const topbar = document.querySelector(".topbar");

        if (perfilChip) {
            // Agrupa la campanita con "Mi perfil" para que queden juntas a la derecha
            let grupo = userbar.querySelector(".sn-group");
            if (!grupo) {
                grupo = document.createElement("div");
                grupo.className = "sn-group";
                perfilChip.parentNode.insertBefore(grupo, perfilChip);
                grupo.appendChild(perfilChip);
            }
            grupo.insertBefore(wrap, perfilChip);
            wrap.classList.remove("sn-floating");
            return;
        }
        if (campanaVieja) {
            campanaVieja.replaceWith(wrap);
            wrap.classList.remove("sn-floating");
            return;
        }
        // Barra superior visible (celular) o flotante (escritorio)
        if (topbar && topbar.getBoundingClientRect().height > 0 && getComputedStyle(topbar).display !== "none") {
            topbar.style.display = topbar.style.display || "";
            if (wrap.parentNode !== topbar) topbar.appendChild(wrap);
            wrap.classList.remove("sn-floating");
            wrap.style.marginLeft = "auto";
        } else {
            if (wrap.parentNode !== document.body) document.body.appendChild(wrap);
            wrap.classList.add("sn-floating");
            wrap.style.marginLeft = "";
        }
    }

    let avisos = [];
    let proximas = [];

    function enlaceDe(aviso) {
        if (aviso.tipo === "ayuda_enviada") return PAGINA_CITAS + "#ayudas";
        return aviso.idCita ? PAGINA_CITAS : "";
    }

    function pintarProximas() {
        if (!proximas.length) return "";
        return '<div class="sn-sec">Próximas citas e intervenciones</div>' + proximas.slice(0, 3).map(c => {
            const d = new Date(c.fecha + "T12:00:00");
            const que = TIPOS_INTERVENCION.includes(c.tipo) ? "Intervención" : "Cita";
            return `<a class="sn-next" href="${PAGINA_CITAS}">
                <b>${d.getDate()}<small>${d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</small></b>
                <span><strong>${que}: ${esc(c.tipo)}</strong>${esc(c.cuando.charAt(0).toUpperCase() + c.cuando.slice(1))}${c.psicologa ? " · " + esc(c.psicologa) : ""}</span>
            </a>`;
        }).join("") + '<div class="sn-sec">Avisos</div>';
    }

    function pintar() {
        const sinLeer = avisos.filter(a => !a.leida).length;
        badge.hidden = !sinLeer;
        badge.textContent = sinLeer > 9 ? "9+" : sinLeer;
        bell.setAttribute("aria-label", sinLeer ? `Notificaciones: ${sinLeer} sin leer` : "Notificaciones");
        lista.innerHTML = pintarProximas() + (avisos.length ? avisos.map(a => {
            const enlace = enlaceDe(a);
            const etiqueta = enlace ? "a" : "div";
            return `
            <${etiqueta} class="sn-item t-${esc(a.tipo)} ${a.leida ? "" : "unread"}"${enlace ? ` href="${enlace}"` : ""}>
                <i class="fa-solid ${ICONOS[a.tipo] || "fa-bell"}"></i>
                <div><strong>${esc(a.titulo)}</strong><p>${esc(a.mensaje)}</p><small>${hace(a.fecha)}</small></div>
            </${etiqueta}>`;
        }).join("")
            : '<div class="sn-empty"><i class="fa-regular fa-bell-slash"></i>No tienes notificaciones por ahora.</div>');
    }

    function vistas() {
        try { return JSON.parse(sessionStorage.getItem(VISTAS_KEY)) || []; } catch (e) { return []; }
    }

    function mostrarAlertas() {
        const yaVistas = vistas();
        const nuevas = avisos.filter(a => !a.leida && TIPOS_ALERTA.includes(a.tipo) && !yaVistas.includes(a.id));
        if (!nuevas.length || document.querySelector(".sn-alert")) return;
        const aviso = nuevas[0];   // la más reciente
        try { sessionStorage.setItem(VISTAS_KEY, JSON.stringify([...yaVistas, ...nuevas.map(n => n.id)])); } catch (e) { /* ignorar */ }

        const alerta = document.createElement("div");
        alerta.className = `sn-alert t-${aviso.tipo}`;
        alerta.setAttribute("role", "alertdialog");
        alerta.innerHTML = `
            <div class="sn-alert-top">
                <i class="fa-solid ${ICONOS[aviso.tipo] || "fa-bell"}"></i>
                <div><strong>${esc(aviso.titulo)}</strong><p>${esc(aviso.mensaje)}</p></div>
            </div>
            ${nuevas.length > 1 ? `<p style="margin-top:8px;font-size:12px;color:#8a84a8">Y ${nuevas.length - 1} aviso(s) más en la campanita.</p>` : ""}
            <button type="button">Entendido</button>`;
        document.body.appendChild(alerta);
        alerta.querySelector("button").addEventListener("click", () => {
            alerta.remove();
            marcarLeidas(nuevas.map(n => n.id));
        });
        alerta.querySelector("button").focus();
    }

    async function marcarLeidas(ids) {
        try {
            await api("/notificaciones/leidas", { method: "PUT", body: JSON.stringify(ids ? { ids } : {}) });
            avisos.forEach(a => { if (!ids || ids.includes(a.id)) a.leida = true; });
            pintar();
        } catch (e) { /* se intentará de nuevo */ }
    }

    async function actualizar() {
        try {
            const [datos, citas] = await Promise.all([
                api("/notificaciones"),
                api("/citas").catch(() => ({ citas: [] }))
            ]);
            avisos = datos.notificaciones || [];
            // Citas confirmadas que aún no han pasado, de la más cercana a la más lejana
            const ahora = Date.now();
            proximas = (citas.citas || [])
                .filter(c => c.estado === "Programada" && new Date(`${c.fecha}T${c.hora}:00`).getTime() > ahora)
                .sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora));
            pintar();
            mostrarAlertas();
        } catch (e) {
            lista.innerHTML = '<div class="sn-empty"><i class="fa-solid fa-plug-circle-xmark"></i>No se pudieron cargar tus notificaciones.</div>';
        }
    }

    function abrir(abierto) {
        panel.hidden = !abierto;
        bell.setAttribute("aria-expanded", String(abierto));
        if (abierto && avisos.some(a => !a.leida)) setTimeout(() => marcarLeidas(), 1500);
    }

    bell.addEventListener("click", (e) => { e.stopPropagation(); abrir(panel.hidden); });
    panel.addEventListener("click", (e) => e.stopPropagation());
    wrap.querySelector(".sn-readall").addEventListener("click", () => marcarLeidas());
    document.addEventListener("click", () => abrir(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { abrir(false); bell.focus(); } });

    function iniciar() {
        colocar();
        let espera;
        window.addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(colocar, 200); });
        actualizar();
        setInterval(actualizar, CADA_MS);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();

    window.SentirNotificaciones = { actualizar };
})();
