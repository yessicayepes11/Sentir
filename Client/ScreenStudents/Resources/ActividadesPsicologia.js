/* =========================================================
   ACTIVIDADES DE TU PSICÓLOGA (Recursos del estudiante)
   Muestra las actividades que publica psicología en "Control de
   Actividades". Las que le sugirieron a este estudiante salen
   primero, con la nota de la psicóloga.
   (El nivel de riesgo es información interna: no se muestra aquí.)
========================================================= */
(function () {
    "use strict";

    const API = "http://localhost:3001/api/Estudiante/actividades";
    const ICONOS = { "Respiración": "fa-wind", "Mindfulness": "fa-brain", "Movimiento": "fa-person-walking", "Escritura terapéutica": "fa-pen-nib", "Arte terapia": "fa-palette", "Música": "fa-music", "Autocuidado": "fa-hand-holding-heart", "Juego y creatividad": "fa-puzzle-piece" };
    const MOSTRAR = 6;

    const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function token() {
        try { return JSON.parse(sessionStorage.getItem("sentirEstudiante") || "{}").token || ""; } catch (e) { return ""; }
    }

    // Id de YouTube (watch, youtu.be, shorts, embed) para mostrar el video dentro de la página
    function idYoutube(url) {
        try {
            const u = new URL(url);
            if (/(^|\.)youtu\.be$/.test(u.hostname)) return u.pathname.slice(1).split("/")[0];
            if (/(^|\.)youtube\.com$/.test(u.hostname)) {
                if (u.searchParams.get("v")) return u.searchParams.get("v");
                const m = u.pathname.match(/^\/(shorts|embed)\/([\w-]{6,})/);
                if (m) return m[2];
            }
        } catch (e) { /* no es URL */ }
        return "";
    }

    function tipoArchivo(ruta) {
        const ext = String(ruta).split("?")[0].split(".").pop().toLowerCase();
        if (["png", "jpg", "jpeg", "gif", "webp", "jfif"].includes(ext)) return "imagen";
        if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
        if (["mp4", "webm", "mov"].includes(ext)) return "video";
        if (ext === "pdf") return "pdf";
        return "otro";
    }

    function archivoHTML(a) {
        if (!a.archivo) return "";
        const url = esc(a.archivo);
        switch (tipoArchivo(a.archivo)) {
            case "imagen": return `<img class="pa-media" src="${url}" alt="${esc(a.titulo)}" loading="lazy">`;
            case "audio": return `<audio class="pa-media" controls preload="none" src="${url}"></audio>`;
            case "video": return `<video class="pa-media" controls preload="none" src="${url}"></video>`;
            default: return `<a class="pa-link" href="${url}" target="_blank" rel="noopener"><i class="fa-solid fa-file-lines"></i> ${esc(a.archivoNombre || "Ver archivo")}</a>`;
        }
    }

    function enlaceHTML(a) {
        if (!a.url) return "";
        const yt = idYoutube(a.url);
        if (yt) return `<button type="button" class="pa-link" data-video="${esc(yt)}"><i class="fa-brands fa-youtube"></i> Ver video</button><div class="pa-video" hidden></div>`;
        let sitio = "Abrir enlace";
        try { sitio = new URL(a.url).hostname.replace(/^www\./, ""); } catch (e) { /* ignorar */ }
        return `<a class="pa-link" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${esc(sitio)}</a>`;
    }

    function tarjeta(a) {
        return `
        <article class="pa-card ${a.sugerida ? "is-suggested" : ""}">
            ${a.sugerida ? '<span class="pa-badge"><i class="fa-solid fa-heart"></i> Sugerida para ti</span>' : ""}
            <div class="pa-top">
                <span class="pa-icon"><i class="fa-solid ${ICONOS[a.tipo] || "fa-spa"}"></i></span>
                <div>
                    <span class="pa-type">${esc(a.tipo)}${a.duracion ? ` · ${a.duracion} min` : ""}</span>
                    <h3>${esc(a.titulo)}</h3>
                </div>
            </div>
            <p class="pa-desc">${esc(a.descripcion)}</p>
            ${a.sugerida && a.nota ? `<p class="pa-note"><i class="fa-solid fa-comment-dots"></i> ${esc(a.nota)}</p>` : ""}
            ${archivoHTML(a)}
            ${a.pasos.length ? `<details class="pa-steps"><summary>Ver los ${a.pasos.length} pasos</summary><ol>${a.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol></details>` : ""}
            <div class="pa-actions">${enlaceHTML(a)}</div>
        </article>`;
    }

    async function iniciar() {
        const seccion = document.getElementById("psyActivities");
        const grid = document.getElementById("psyActivitiesGrid");
        if (!seccion || !grid || !token()) return;

        let actividades = [];
        try {
            const r = await fetch(API, { headers: { Authorization: "Bearer " + token() } });
            if (!r.ok) return;
            actividades = (await r.json()).actividades || [];
        } catch (e) {
            return;
        }
        if (!actividades.length) return;

        seccion.hidden = false;
        const sugeridas = actividades.filter(a => a.sugerida).length;
        const contador = document.getElementById("psyActivitiesCount");
        if (contador) contador.textContent = sugeridas ? `${sugeridas} sugerida${sugeridas === 1 ? "" : "s"} para ti` : `${actividades.length} actividades`;

        let todas = false;
        const pintar = () => {
            const visibles = todas ? actividades : actividades.slice(0, MOSTRAR);
            grid.innerHTML = visibles.map(tarjeta).join("") + (actividades.length > MOSTRAR
                ? `<button type="button" class="pa-more" id="psyActivitiesMore">${todas ? "Ver menos" : `Ver las ${actividades.length} actividades`}</button>` : "");
            const mas = document.getElementById("psyActivitiesMore");
            if (mas) mas.addEventListener("click", () => { todas = !todas; pintar(); });
            grid.querySelectorAll("[data-video]").forEach(b => b.addEventListener("click", () => {
                const caja = b.nextElementSibling;
                if (!caja.hidden) { caja.hidden = true; caja.innerHTML = ""; b.innerHTML = '<i class="fa-brands fa-youtube"></i> Ver video'; return; }
                caja.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.video)}" title="Video de la actividad" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
                caja.hidden = false;
                b.innerHTML = '<i class="fa-solid fa-xmark"></i> Cerrar video';
            }));
        };
        pintar();

        // Si se entra desde la notificación ("?actividades"), baja directo a la sección
        if (/[?&]actividades\b/.test(location.search)) seccion.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();
})();
