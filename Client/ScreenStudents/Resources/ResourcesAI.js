/* =========================================================
   RECURSOS CREADOS CON IA + PROGRESO DE INSIGNIAS

   - Muestra en "Respiraciones" y "Meditaciones" los ejercicios que la
     IA creó para el estudiante (cada uno ligado a una insignia).
   - Botón "Crear otro con IA" para pedir un ejercicio nuevo.
   - Cuando el estudiante termina una respiración o meditación, o abre
     un video, se guarda en el servidor y avanza su insignia.
   - Enlaces desde Insignias:  Resources.html?recurso=ia-12
                               Resources.html?seccion=respiracion|meditacion|video
========================================================= */

(function () {

    const API = "http://localhost:3001/api/Bienestar";

    const SECCIONES = {
        respiracion: { contenedor: "breathingContent", pestana: "breathing", player: "SentirBreathingPlayer", atributo: "data-breathing-player" },
        meditacion: { contenedor: "meditationsContent", pestana: "meditations", player: "SentirMeditationPlayer", atributo: "data-meditation-player" },
        autocuidado: { contenedor: "selfcareContent", pestana: "selfcare", player: "SentirSelfCarePlayer", atributo: "data-selfcare-player" }
    };

    function token() {
        try {
            return JSON.parse(sessionStorage.getItem("sentirEstudiante") || "{}").token || "";
        } catch (error) {
            return "";
        }
    }

    function escapar(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function icono(nombre) {
        return /^fa-[a-z0-9-]+$/.test(nombre || "") ? nombre : "fa-star";
    }

    function color(valor) {
        return /^#[0-9a-fA-F]{6}$/.test(valor || "") ? valor : "#7954e1";
    }

    async function pedir(ruta, opciones) {
        const respuesta = await fetch(API + ruta, {
            ...(opciones || {}),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token()
            }
        });
        const datos = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(datos.message || "No se pudo conectar con el servidor.");
        return datos;
    }

    function avisar(mensaje) {
        if (typeof window.showToast === "function") {
            window.showToast(mensaje);
            return;
        }
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = mensaje;
        toast.classList.add("show");
        setTimeout(function () { toast.classList.remove("show"); }, 3200);
    }

    function minutos(segundos) {
        const total = Math.max(1, Math.round(Number(segundos || 0) / 60));
        return total + " min";
    }

    /* ---------------- BLOQUES "CREADO PARA TI" ---------------- */

    function crearBloque(tipo) {
        const seccion = SECCIONES[tipo];
        const contenedor = document.getElementById(seccion.contenedor);
        if (!contenedor) return null;

        const bloque = document.createElement("div");
        bloque.className = "ai-block";
        bloque.dataset.tipo = tipo;
        bloque.innerHTML = `
            <div class="ai-block-head">
                <div>
                    <span class="ai-block-label"><i class="fa-solid fa-wand-magic-sparkles"></i> Creado para ti con IA</span>
                    <p class="ai-block-goal" data-goal>Cargando tu insignia…</p>
                </div>
                <button type="button" class="ai-generate" data-generate="${tipo}">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Crear otro con IA</span>
                </button>
            </div>
            <div class="activities-grid ai-grid" data-grid>
                <p class="ai-empty">Sentir IA está preparando tus ejercicios…</p>
            </div>`;

        const encabezado = contenedor.querySelector(".library-heading");
        if (encabezado) {
            encabezado.after(bloque);
        } else {
            contenedor.prepend(bloque);
        }

        return bloque;
    }

    function tarjeta(recurso) {
        const seccion = SECCIONES[recurso.tipo];
        const articulo = document.createElement("article");
        articulo.className = "activity-card ai-card";
        articulo.id = "recurso-" + recurso.id;
        articulo.style.setProperty("--ai-color", color(recurso.color));
        articulo.innerHTML = `
            <div class="activity-picture ai-picture">
                <i class="fa-solid ${icono(recurso.icono)}"></i>
                <span class="time-pill">${minutos(recurso.duracionSeg)}</span>
                <span class="ai-pill"><i class="fa-solid fa-wand-magic-sparkles"></i> ${recurso.hechoConIA ? "IA" : "Para ti"}</span>
            </div>
            <div class="activity-info">
                <h3>${escapar(recurso.titulo)}</h3>
                <p>${escapar(recurso.descripcion)}</p>
                ${recurso.insignia ? `<span class="ai-for-badge"><i class="fa-solid fa-medal"></i> Cuenta para: ${escapar(recurso.insignia.titulo)}</span>` : ""}
                <button class="start-activity" type="button" ${seccion.atributo}="${escapar(recurso.id)}">
                    <i class="fa-solid fa-play"></i>
                    ${recurso.tipo === "autocuidado" ? "Empezar reto" : "Comenzar"}
                </button>
            </div>`;
        return articulo;
    }

    function registrarEnReproductor(recurso) {
        const reproductor = window[SECCIONES[recurso.tipo].player];
        if (!reproductor) return;

        const contenido = recurso.contenido || {};
        const base = {
            title: recurso.titulo,
            icon: icono(recurso.icono),
            color: color(recurso.color),
            description: recurso.descripcion
        };

        if (recurso.tipo === "autocuidado") {
            reproductor.register(recurso.id, {
                ...base,
                benefit: recurso.beneficio || "Cuidarte también es parte de tu bienestar.",
                minutes: Math.max(1, Math.round((recurso.duracionSeg || 300) / 60)),
                steps: contenido.steps || [],
                question: contenido.question || ""
            });
        } else if (recurso.tipo === "respiracion") {
            reproductor.register(recurso.id, {
                ...base,
                benefit: recurso.beneficio || "Respirar despacio le dice a tu cuerpo que está a salvo.",
                cycles: contenido.cycles || 6,
                phases: contenido.phases || []
            });
        } else {
            reproductor.register(recurso.id, { ...base, steps: contenido.steps || [] });
        }
    }

    function mostrarMeta(tipo, insignia) {
        const meta = document.querySelector(`.ai-block[data-tipo="${tipo}"] [data-goal]`);
        if (!meta) return;

        if (!insignia) {
            meta.innerHTML = "¡Ganaste todas las insignias disponibles de esta sección!";
            return;
        }

        meta.innerHTML = `
            <i class="fa-solid ${icono((insignia.imagen || "").replace("fa-solid ", ""))}"></i>
            Insignia <strong>${escapar(insignia.titulo)}</strong>: ${escapar(insignia.objetivo)}
            <span class="ai-goal-count">${insignia.progreso}/${insignia.meta}</span>`;
    }

    function mostrarMetaVideo(insignia) {
        const meta = document.querySelector("[data-goal-video]");
        if (!meta) return;
        meta.hidden = false;
        meta.innerHTML = insignia
            ? `<i class="fa-solid fa-medal"></i> Insignia <strong>${escapar(insignia.titulo)}</strong>: ${escapar(insignia.objetivo)} <span class="ai-goal-count">${insignia.progreso}/${insignia.meta}</span>`
            : `<i class="fa-solid fa-medal"></i> ¡Ganaste todas las insignias de videos!`;
    }

    function pintar(datos) {
        Object.keys(SECCIONES).forEach(function (tipo) {
            const grid = document.querySelector(`.ai-block[data-tipo="${tipo}"] [data-grid]`);
            if (!grid) return;

            const recursos = datos.recursos.filter(function (r) { return r.tipo === tipo; });
            recursos.forEach(registrarEnReproductor);

            grid.innerHTML = "";
            if (!recursos.length) {
                grid.innerHTML = '<p class="ai-empty">Aún no tienes ejercicios creados. Pulsa "Crear otro con IA".</p>';
            }
            recursos.forEach(function (recurso) { grid.appendChild(tarjeta(recurso)); });

            mostrarMeta(tipo, datos.enProgreso[tipo]);
        });

        mostrarMetaVideo(datos.enProgreso.video);
    }

    /* ---------------- CREAR OTRO CON IA ---------------- */

    async function generar(boton) {
        const tipo = boton.dataset.generate;
        const texto = boton.querySelector("span");

        boton.disabled = true;
        texto.textContent = "Creando…";

        try {
            const datos = await pedir("/generar", { method: "POST", body: JSON.stringify({ tipo: tipo }) });
            const grid = document.querySelector(`.ai-block[data-tipo="${tipo}"] [data-grid]`);
            grid.querySelector(".ai-empty")?.remove();

            registrarEnReproductor(datos.recurso);
            const nueva = tarjeta(datos.recurso);
            nueva.classList.add("ai-highlight");
            grid.prepend(nueva);

            avisar("¡Listo! Sentir IA creó \"" + datos.recurso.titulo + "\" para ti.");
        } catch (error) {
            avisar(error.message);
        } finally {
            boton.disabled = false;
            texto.textContent = "Crear otro con IA";
        }
    }

    /* ---------------- AVANCE Y CELEBRACIÓN ---------------- */

    function celebrar(insignia) {
        let ventana = document.getElementById("aiBadgeWin");

        if (!ventana) {
            ventana = document.createElement("div");
            ventana.id = "aiBadgeWin";
            ventana.className = "ai-win-overlay";
            document.body.appendChild(ventana);
            ventana.addEventListener("click", function (event) {
                if (event.target === ventana || event.target.closest("[data-close-win]")) {
                    ventana.classList.remove("show");
                }
            });
        }

        ventana.innerHTML = `
            <div class="ai-win" role="dialog" aria-modal="true">
                <div class="ai-win-icon"><i class="${escapar(insignia.imagen || "fa-solid fa-star")}"></i></div>
                <span>¡Nueva insignia!</span>
                <h2>${escapar(insignia.titulo)}</h2>
                <p>${escapar(insignia.descripcion)}</p>
                <div class="ai-win-actions">
                    <a href="/Client/ScreenStudents/EmotionalDiary/Badges/Badges.html" class="ai-win-main">
                        <i class="fa-solid fa-medal"></i> Ver mis insignias
                    </a>
                    <button type="button" data-close-win>Seguir aquí</button>
                </div>
            </div>`;

        ventana.classList.add("show");
    }

    async function registrarActividad(detalle) {
        if (!detalle || !detalle.tipo || !detalle.clave || !token()) return;

        try {
            const datos = await pedir("/actividad", {
                method: "POST",
                body: JSON.stringify({ tipo: detalle.tipo, clave: String(detalle.clave).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80) })
            });

            if (datos.ganadas && datos.ganadas.length) {
                celebrar(datos.ganadas[0]);
            } else if (datos.contada && datos.siguiente) {
                setTimeout(function () {
                    avisar(`Avance en "${datos.siguiente.titulo}": ${datos.siguiente.progreso}/${datos.siguiente.meta}`);
                }, 1500);
            }

            if (detalle.tipo === "video") {
                mostrarMetaVideo(datos.siguiente);
            } else {
                mostrarMeta(detalle.tipo, datos.siguiente);
            }
        } catch (error) {
            console.warn("No se pudo guardar el avance:", error.message);
        }
    }

    /* ---------------- ENLACES DESDE INSIGNIAS ---------------- */

    function abrirSeccion(tipo) {
        if (tipo === "video") {
            document.querySelector(".videos-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        const seccion = SECCIONES[tipo];
        if (!seccion) return;

        document.querySelector(`.resource-tab[data-category="${seccion.pestana}"]`)?.click();
        document.querySelector(".resource-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function seguirEnlace() {
        const parametros = new URLSearchParams(window.location.search);
        const recurso = parametros.get("recurso");
        const seccion = parametros.get("seccion");

        if (recurso) {
            const tarjetaRecurso = document.getElementById("recurso-" + recurso);
            if (!tarjetaRecurso) return;

            const tipo = tarjetaRecurso.closest(".ai-block")?.dataset.tipo;
            abrirSeccion(tipo);
            setTimeout(function () {
                tarjetaRecurso.scrollIntoView({ behavior: "smooth", block: "center" });
                tarjetaRecurso.classList.add("ai-highlight");
            }, 400);
        } else if (seccion) {
            setTimeout(function () { abrirSeccion(seccion); }, 200);
        }
    }

    /* ---------------- INICIO ---------------- */

    document.addEventListener("DOMContentLoaded", async function () {
        if (!token()) return;

        crearBloque("respiracion");
        crearBloque("meditacion");
        crearBloque("autocuidado");

        const encabezadoVideos = document.querySelector(".videos-heading > div");
        if (encabezadoVideos) {
            const meta = document.createElement("p");
            meta.className = "ai-block-goal ai-video-goal";
            meta.setAttribute("data-goal-video", "");
            meta.hidden = true;
            encabezadoVideos.appendChild(meta);
        }

        document.addEventListener("click", function (event) {
            const boton = event.target.closest("[data-generate]");
            if (boton) generar(boton);

            // Abrir un video cuenta para las insignias de videos (una vez al día por video)
            const video = event.target.closest(".video-play");
            if (video) {
                const id = String(video.dataset.videoUrl || "").split("/").pop().split("?")[0];
                registrarActividad({ tipo: "video", clave: "video-" + id });
            }
        });

        document.addEventListener("sentir:actividad", function (event) {
            registrarActividad(event.detail);
        });

        try {
            const datos = await pedir("/recursos");
            pintar(datos);
            seguirEnlace();

            // Insignias ganadas desde la última visita (por ejemplo, escribiendo en el diario)
            if (datos.ganadas && datos.ganadas.length) celebrar(datos.ganadas[0]);
        } catch (error) {
            document.querySelectorAll(".ai-grid").forEach(function (grid) {
                grid.innerHTML = `<p class="ai-empty">${escapar(error.message)}</p>`;
            });
            seguirEnlace();
        }
    });

})();
