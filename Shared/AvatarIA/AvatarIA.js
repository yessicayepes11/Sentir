/* =========================================================
   AVATAR ANIMADO CON IA (compartido por todos los roles)
   La IA mira la foto de perfil y crea un avatar animado con la
   paleta de Sentir. Se muestra en la portada (sección de inicio)
   de cada página en lugar de la ilustración general.

   Uso: <img data-avatar-ia="estudiante" ...>  (estudiantes)
        <img data-avatar-ia="personal" ...>    (docentes, psicología, admin...)
   Si el usuario no ha iniciado sesión o no tiene foto, se deja la
   ilustración original. Para refrescarlo tras cambiar la foto:
   window.SentirAvatar.actualizar()
========================================================= */
(function () {
    "use strict";

    const API = "http://localhost:3001/api/Avatar";
    const ESPERA_MS = 4000;
    const ALTO_MAX = 720;   // alto máximo del avatar recortado (px)
    const MAX_ESPERAS = 90; // ~6 minutos mientras la IA lo crea
    let temporizador = null;

    function sesion(tipo) {
        const clave = tipo === "estudiante" ? "sentirEstudiante" : "usuarioSentir";
        try {
            const s = JSON.parse(sessionStorage.getItem(clave) || "{}");
            return { token: s.token || "", id: String(s.id_usuario || "") };
        } catch (e) {
            return { token: "", id: "" };
        }
    }

    function estilos() {
        if (document.getElementById("sentirAvatarIAEstilos")) return;
        const css = document.createElement("style");
        css.id = "sentirAvatarIAEstilos";
        css.textContent = `
            img.avatar-ia {
                width: var(--avatar-ia-tam, 230px) !important; height: var(--avatar-ia-tam, 230px) !important;
                max-width: 100% !important; max-height: none !important; aspect-ratio: 1 / 1; object-fit: cover !important;
                border-radius: 50% !important; border: 5px solid rgba(255, 255, 255, 0.9) !important;
                box-shadow: 0 18px 40px rgba(30, 27, 75, 0.28), 0 0 0 10px rgba(184, 168, 255, 0.28) !important;
                -webkit-mask-image: none !important; mask-image: none !important; filter: none !important;
                background: #B8A8FF; animation: sentirAvatarIA .3s ease-out;
            }
            @keyframes sentirAvatarIA { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
            @media (max-width: 700px) { img.avatar-ia { width: var(--avatar-ia-tam-movil, 170px) !important; height: var(--avatar-ia-tam-movil, 170px) !important; display: block; margin-left: auto !important; margin-right: auto !important; } }
            /* Avatar detallado (personaje 3D de cuerpo entero, sin marco) */
            img.avatar-ia.avatar-ia-detallado {
                width: auto !important; height: var(--avatar-ia-alto, 340px) !important; max-width: 100% !important;
                aspect-ratio: auto; object-fit: contain !important; border-radius: 0 !important; border: 0 !important;
                box-shadow: none !important; background: transparent !important;
                filter: drop-shadow(0 16px 18px rgba(30, 27, 75, 0.30)) !important;
            }
            /* Docente y perfil de psicología: el personaje se apoya abajo y cabe en la portada */
            .teacher-image-slot:has(img.avatar-ia-detallado) { display: flex !important; align-items: flex-end; justify-content: center; --avatar-ia-alto: 250px; }
            .psy-look .teacher-image-slot:has(img.avatar-ia-detallado) { --avatar-ia-alto: 230px; }
            @media (max-width: 700px) { img.avatar-ia.avatar-ia-detallado { width: auto !important; height: var(--avatar-ia-alto-movil, 250px) !important; } }
            img.avatar-ia.avatar-ia-sin-animacion { animation: none; }
            /* Banner de saludo de psicología (Inicio) */
            .welcome-character-container:has(img.avatar-ia-detallado) { --avatar-ia-alto: 290px; --avatar-ia-alto-movil: 200px; }
            /* Aviso mientras la IA crea el avatar por primera vez */
            .avatar-ia-creando { position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); z-index: 5; white-space: nowrap;
                display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px;
                background: rgba(255, 255, 255, 0.92); color: #4e2fc7; font: 600 12px/1.2 Poppins, Nunito, sans-serif;
                box-shadow: 0 8px 20px rgba(30, 27, 75, 0.18); pointer-events: none; }
            .avatar-ia-creando i { animation: sentirAvatarIAGira 1.4s linear infinite; }
            @keyframes sentirAvatarIAGira { to { transform: rotate(360deg); } }
            @media (prefers-reduced-motion: reduce) { img.avatar-ia, .avatar-ia-creando i { animation: none; } }
        `;
        document.head.appendChild(css);
    }

    // El avatar detallado puede venir con fondo verde: se vuelve transparente y se recortan los bordes vacíos
    function quitarFondoVerde(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    // Se trabaja sobre una copia reducida (el banner la muestra a ~250-340 px de alto):
                    // el recorte es varias veces más rápido y la imagen final pesa mucho menos
                    const escala = Math.min(1, ALTO_MAX / img.naturalHeight);
                    const lienzo = document.createElement("canvas");
                    lienzo.width = Math.round(img.naturalWidth * escala);
                    lienzo.height = Math.round(img.naturalHeight * escala);
                    const ctx = lienzo.getContext("2d", { willReadFrequently: true });
                    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
                    const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
                    const p = datos.data;
                    const ancho = lienzo.width, alto = lienzo.height, total = ancho * alto;
                    const verde = (k) => p[k * 4 + 1] - Math.max(p[k * 4], p[k * 4 + 2]);
                    const esFondo = (k) => verde(k) > 40 && p[k * 4 + 1] > 60;

                    // 1) Se borra solo el verde CONECTADO a los bordes (así no se borra ropa verde del personaje)
                    const fuera = new Uint8Array(total);
                    const pila = [];
                    for (let x = 0; x < ancho; x++) pila.push(x, (alto - 1) * ancho + x);
                    for (let y = 0; y < alto; y++) pila.push(y * ancho, y * ancho + ancho - 1);
                    while (pila.length) {
                        const k = pila.pop();
                        if (fuera[k] || !esFondo(k)) continue;
                        fuera[k] = 1;
                        const x = k % ancho;
                        if (x > 0) pila.push(k - 1);
                        if (x < ancho - 1) pila.push(k + 1);
                        if (k >= ancho) pila.push(k - ancho);
                        if (k < total - ancho) pila.push(k + ancho);
                    }

                    // 2) Bordes suaves y sin reflejo verde junto al fondo borrado
                    let minX = ancho, minY = alto, maxX = -1, maxY = -1;
                    for (let k = 0; k < total; k++) {
                        // Huecos encerrados (entre brazo y cuerpo): solo el verde croma muy brillante, nunca la ropa verde oscura
                        if (!fuera[k] && p[k * 4 + 1] > 170 && verde(k) > 90) fuera[k] = 1;
                        if (fuera[k]) { p[k * 4 + 3] = 0; continue; }
                        const x = k % ancho, y = (k / ancho) | 0;
                        const borde = (x > 0 && fuera[k - 1]) || (x < ancho - 1 && fuera[k + 1]) || (y > 0 && fuera[k - ancho]) || (y < alto - 1 && fuera[k + ancho]);
                        if (borde) {
                            const v = verde(k);
                            if (v > 10) p[k * 4 + 3] = Math.round(p[k * 4 + 3] * Math.max(0.15, 1 - (v - 10) / 60));
                            if (v > 0) p[k * 4 + 1] = Math.max(p[k * 4], p[k * 4 + 2]);
                        }
                        if (p[k * 4 + 3] > 20) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                    if (maxX < 0) return resolve(url);
                    ctx.putImageData(datos, 0, 0);
                    const recorte = document.createElement("canvas");
                    recorte.width = maxX - minX + 1;
                    recorte.height = maxY - minY + 1;
                    recorte.getContext("2d").drawImage(lienzo, minX, minY, recorte.width, recorte.height, 0, 0, recorte.width, recorte.height);
                    resolve(recorte.toDataURL("image/webp", 0.88)); // webp liviano con transparencia
                } catch (e) {
                    resolve(url);
                }
            };
            img.onerror = () => resolve("");
            img.src = url;
        });
    }

    // Copia del avatar ya recortado en este navegador, por usuario: al iniciar sesión otra vez
    // o al cambiar de página se pinta al instante, sin esperar al servidor
    const CACHE = "sentirAvatarIA:";

    function leerCache(id) {
        if (!id) return null;
        try {
            const c = JSON.parse(localStorage.getItem(CACHE + id) || "null");
            return c && c.url && c.src ? c : null;
        } catch (e) {
            return null;
        }
    }

    function guardarCache(id, url, src) {
        if (!id) return;
        try {
            localStorage.setItem(CACHE + id, JSON.stringify({ url, src }));
        } catch (e) { /* sin espacio o almacenamiento bloqueado: se sigue sin caché */ }
    }

    function borrarCache(id) {
        try { localStorage.removeItem(CACHE + id); } catch (e) { /* nada */ }
    }

    // Aviso "Creando tu avatar…" sobre la ilustración mientras la IA lo crea por primera vez
    function avisoCreando(imagenes, mostrar) {
        imagenes.forEach((img) => {
            const caja = img.parentElement;
            if (!caja) return;
            let aviso = caja.querySelector(":scope > .avatar-ia-creando");
            if (!mostrar) { if (aviso) aviso.remove(); return; }
            if (aviso) return;
            estilos();
            if (getComputedStyle(caja).position === "static") caja.style.position = "relative";
            aviso = document.createElement("span");
            aviso.className = "avatar-ia-creando";
            aviso.setAttribute("role", "status");
            aviso.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Creando tu avatar…';
            caja.appendChild(aviso);
        });
    }

    function pintar(imagenes, url, src, animar) {
        estilos();
        avisoCreando(imagenes, false);
        imagenes.forEach((img) => {
            if (img.dataset.avatarUrl === url) return;
            img.src = src;
            img.dataset.avatarUrl = url;
            img.alt = "Tu avatar 3D creado con IA a partir de tu foto de perfil";
            img.style.display = "";
            img.classList.add("avatar-ia", "avatar-ia-detallado");
            img.classList.toggle("avatar-ia-sin-animacion", !animar);
        });
        document.dispatchEvent(new CustomEvent("sentir:avatar", { detail: { url, detallado: true } }));
    }

    // Convierte una imagen (dataURL) en Blob para subirla al servidor
    async function aBlob(src) {
        return (await fetch(src)).blob();
    }

    async function poner(imagenes, datos, t, id) {
        const url = datos.url;
        if (imagenes.every((img) => img.dataset.avatarUrl === url)) return;

        // 1) El servidor ya tiene la versión recortada: se usa directo (sin procesar nada)
        // 2) Si no, se recorta aquí una vez y se sube para los demás
        const yaRecortado = Boolean(datos.recorte);
        const src = yaRecortado ? datos.recorte : await quitarFondoVerde(url);
        if (!src) return;
        const previa = new Image();
        previa.onload = () => pintar(imagenes, url, src, true);
        previa.src = src;

        if (!yaRecortado && src.startsWith("data:")) {
            guardarCache(id, url, src);
            try {
                const blob = await aBlob(src);
                await fetch(API + "/recorte?archivo=" + encodeURIComponent(datos.archivo), {
                    method: "POST", headers: { Authorization: "Bearer " + t, "Content-Type": blob.type }, body: blob
                });
            } catch (e) { /* si falla, la próxima carga lo vuelve a intentar */ }
        } else if (yaRecortado) {
            guardarCache(id, url, src);
        }
    }

    async function cargar(esperas = 0) {
        clearTimeout(temporizador);
        const imagenes = [...document.querySelectorAll("img[data-avatar-ia]")];
        if (!imagenes.length) return;
        const tipo = imagenes[0].dataset.avatarIa;
        const { token: t, id } = sesion(tipo);
        if (!t) return;

        // Al instante desde la caché del navegador (sin esperar al servidor)
        const cache = leerCache(id);
        if (cache && esperas === 0) pintar(imagenes, cache.url, cache.src, false);

        let datos;
        try {
            const r = await fetch(API, { headers: { Authorization: "Bearer " + t } });
            if (!r.ok) return;
            datos = await r.json();
        } catch (e) {
            return;
        }
        // Avatar 3D si ya existe; mientras tanto la página conserva su ilustración original
        if (datos.url) poner(imagenes, datos, t, id);
        else if (cache) borrarCache(id); // ya no tiene avatar (quitó la foto)
        const creando = datos.estado === "generando" && esperas < MAX_ESPERAS;
        // Primera vez: se avisa que se está creando (si ya tenía uno, se sigue viendo el anterior)
        avisoCreando(imagenes, creando && !datos.url && !cache);
        if (creando) {
            temporizador = setTimeout(() => cargar(esperas + 1), ESPERA_MS);
        }
    }

    window.SentirAvatar = { actualizar: () => cargar() };

    // El script va al final del <body>: las imágenes ya existen, así que se arranca de inmediato
    if (document.querySelector("img[data-avatar-ia]")) cargar();
    else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => cargar());
    else cargar();
})();
