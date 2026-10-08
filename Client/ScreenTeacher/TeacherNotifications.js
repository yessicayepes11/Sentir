/* =========================================================
   CAMPANITA DE NOTIFICACIONES DEL DOCENTE
   Se incluye en todas las pantallas del docente y toma la
   campanita del encabezado (.notification-box):
   - Muestra los avisos guardados en la base de datos: alerta
     enviada, alerta en atención por psicología, alerta cerrada.
   - El número rojo indica cuántos avisos no ha leído.
   - Al abrirla, los avisos se marcan como leídos.
   - Revisa si hay avisos nuevos cada minuto.
   Los mismos avisos llegan también al correo del docente.
========================================================= */
(function () {
    "use strict";

    const API = "http://localhost:3001/api/Docente/notificaciones";
    const CADA_MS = 60000;
    const INICIO = "/Client/ScreenTeacher/teacher.html";
    // Íconos en SVG (las pantallas del docente no cargan Font Awesome)
    const svg = (trazos) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`;
    const ICONOS = {
        alerta_enviada: svg('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>'),
        alerta_en_atencion: svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>'),
        alerta_resuelta: svg('<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>'),
        otro: svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>')
    };

    function token() {
        try {
            return JSON.parse(sessionStorage.getItem("usuarioSentir") || "{}").token || "";
        } catch (e) {
            return "";
        }
    }
    if (!token()) return;

    async function api(ruta, opciones) {
        const r = await fetch(API + ruta, {
            ...(opciones || {}),
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() }
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

    const css = `
    .tn-wrap{position:relative;display:inline-flex;flex-shrink:0}
    .tn-wrap .notification-box{cursor:pointer;border:none;font:inherit;transition:transform .15s ease}
    .tn-wrap .notification-box:hover{transform:translateY(-1px)}
    .tn-wrap .notification-box:focus-visible{outline:3px solid rgba(109,76,240,.35);outline-offset:2px}
    .tn-wrap .notification-number[hidden]{display:none}
    .tn-panel{position:absolute;top:calc(100% + 10px);right:0;width:min(360px,calc(100vw - 24px));max-height:min(460px,70vh);display:flex;flex-direction:column;background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(40,25,110,.22);border:1px solid #EEE9FB;z-index:3000;overflow:hidden;text-align:left}
    .tn-panel[hidden]{display:none}
    .tn-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid #F1EDFB}
    .tn-head strong{font-size:15px;color:#2b2453}
    .tn-head button{border:none;background:none;color:#6d4cf0;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer}
    .tn-list{overflow-y:auto}
    .tn-item{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid #F6F3FD;text-decoration:none;color:inherit}
    .tn-item:hover{background:#FBFAFF}
    .tn-item.unread{background:#F7F4FF}
    .tn-icon{width:34px;height:34px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;background:#EFEAFE;color:#6d4cf0}
    .tn-icon svg{width:16px;height:16px}
    .tn-item.t-alerta_en_atencion .tn-icon{background:#FEF3C7;color:#B45309}
    .tn-item.t-alerta_resuelta .tn-icon{background:#DCFCE7;color:#15803D}
    .tn-item strong{display:block;font-size:13px;color:#2b2453}
    .tn-item p{font-size:12px;color:#5f5a80;line-height:1.45;margin:3px 0}
    .tn-item small{font-size:11px;color:#9a94b8}
    .tn-empty{padding:28px 16px;text-align:center;color:#8a84a8;font-size:13px}
    .tn-empty svg{display:block;width:26px;height:26px;margin:0 auto 8px;color:#C9BEF7}
    `;
    if (!document.getElementById("tn-estilos")) {
        const style = document.createElement("style");
        style.id = "tn-estilos";
        style.textContent = css;
        document.head.appendChild(style);
    }

    let caja, numero, panel, lista;
    let avisos = [];

    function montar() {
        const vieja = document.querySelector(".notification-box");
        if (!vieja) return false;

        // La campanita del encabezado pasa a ser un botón real (con teclado y lector de pantalla)
        caja = document.createElement("button");
        caja.type = "button";
        caja.className = vieja.className;
        caja.innerHTML = vieja.innerHTML;
        caja.setAttribute("aria-haspopup", "true");
        caja.setAttribute("aria-expanded", "false");
        caja.setAttribute("aria-label", "Notificaciones");

        const wrap = document.createElement("div");
        wrap.className = "tn-wrap";
        vieja.replaceWith(wrap);
        wrap.appendChild(caja);

        numero = caja.querySelector(".notification-number");
        if (!numero) {
            numero = document.createElement("span");
            numero.className = "notification-number";
            caja.appendChild(numero);
        }
        numero.hidden = true;   // el "3" fijo del diseño ya no se muestra

        panel = document.createElement("div");
        panel.className = "tn-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Notificaciones");
        panel.hidden = true;
        panel.innerHTML = `
            <div class="tn-head"><strong>Notificaciones</strong><button type="button" class="tn-readall">Marcar todo como leído</button></div>
            <div class="tn-list"><div class="tn-empty">Cargando…</div></div>`;
        wrap.appendChild(panel);
        lista = panel.querySelector(".tn-list");

        caja.addEventListener("click", (e) => { e.stopPropagation(); abrir(panel.hidden); });
        panel.addEventListener("click", (e) => e.stopPropagation());
        panel.querySelector(".tn-readall").addEventListener("click", () => marcarLeidas());
        document.addEventListener("click", () => abrir(false));
        document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { abrir(false); caja.focus(); } });
        return true;
    }

    function pintar() {
        const sinLeer = avisos.filter(a => !a.leida).length;
        numero.hidden = !sinLeer;
        numero.textContent = sinLeer > 9 ? "9+" : sinLeer;
        caja.setAttribute("aria-label", sinLeer ? `Notificaciones: ${sinLeer} sin leer` : "Notificaciones");
        lista.innerHTML = avisos.length ? avisos.map(a => `
            <a class="tn-item t-${esc(a.tipo)} ${a.leida ? "" : "unread"}" href="${INICIO}#alertas">
                <span class="tn-icon">${ICONOS[a.tipo] || ICONOS.otro}</span>
                <div><strong>${esc(a.titulo)}</strong><p>${esc(a.mensaje)}</p><small>${hace(a.fecha)}</small></div>
            </a>`).join("")
            : `<div class="tn-empty">${ICONOS.otro}No tienes notificaciones por ahora.</div>`;
    }

    async function marcarLeidas(ids) {
        try {
            await api("/leidas", { method: "PUT", body: JSON.stringify(ids ? { ids } : {}) });
            avisos.forEach(a => { if (!ids || ids.includes(a.id)) a.leida = true; });
            pintar();
        } catch (e) { /* se intentará de nuevo */ }
    }

    async function actualizar() {
        try {
            avisos = (await api("")).notificaciones || [];
            pintar();
        } catch (e) {
            lista.innerHTML = '<div class="tn-empty">No se pudieron cargar tus notificaciones. Revisa tu conexión.</div>';
        }
    }

    function abrir(abierto) {
        panel.hidden = !abierto;
        caja.setAttribute("aria-expanded", String(abierto));
        if (abierto && avisos.some(a => !a.leida)) setTimeout(() => marcarLeidas(), 1500);
    }

    // Desde un aviso ("#alertas") se baja a "Mis alertas recientes" en Inicio
    function irAAlertas() {
        if (location.hash !== "#alertas") return;
        const seccion = document.querySelector(".reports-card");
        if (seccion) setTimeout(() => seccion.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }

    function iniciar() {
        if (!montar()) return;
        actualizar();
        setInterval(actualizar, CADA_MS);
        irAAlertas();
        window.addEventListener("hashchange", irAAlertas);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();

    // Otras partes de la página (p. ej. al enviar una alerta) pueden refrescarla
    window.SentirNotificacionesDocente = { actualizar: () => (caja ? actualizar() : null) };
})();
