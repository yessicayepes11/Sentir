/* =========================================================
   CHAT CON IA "Sentir IA" (componente compartido)
   Solo se muestra si el estudiante inició sesión en "Mi espacio personal".

   Uso en cualquier página:
     <link rel="stylesheet" href="/Shared/AiChat/AiChat.css">
     <script src="/Shared/AiChat/AiChat.js"></script>

   Crea un botón flotante abajo a la derecha que abre un chat.
   Los mensajes se envían al backend (/api/Asistente/chat), que es
   quien habla con la IA (Groq u OpenAI) usando la clave del .env.

   La conversación se guarda SOLO en la sesión de esta pestaña
   (sessionStorage "sentirChatIA"): sigue al estudiante entre el diario,
   Seguimiento e Insignias, y se borra al cerrar sesión o cerrar la
   pestaña. Nunca se guarda en la base de datos.
========================================================= */

(function () {

    const API_CHAT = "http://localhost:3001/api/Asistente/chat";
    const MAX_CARACTERES = 1000;
    const CLAVE_CHAT = "sentirChatIA";   // sessionStorage
    const MAX_GUARDADOS = 30;            // elementos visibles que se recuerdan
    const MAX_CONTEXTO = 12;             // mensajes que se envían a la IA

    const SALUDO =
        "¡Hola! Soy Sentir IA 💜 Estoy aquí para escucharte. " +
        "¿Cómo te sientes hoy? Puedes contarme lo que quieras.";

    const HTML = `
<button class="aic-launcher" id="aicLauncher" type="button" aria-label="Abrir el chat con Sentir IA" aria-expanded="false">
    <i class="fa-solid fa-comment-dots"></i>
    <span>Habla con Sentir IA</span>
</button>

<section class="aic-panel" id="aicPanel" aria-label="Chat con Sentir IA" hidden>

    <header class="aic-header">
        <div class="aic-avatar"><i class="fa-solid fa-robot"></i></div>
        <div>
            <strong>Sentir IA</strong>
            <span>Asistente de bienestar</span>
        </div>
        <button class="aic-close" id="aicClose" type="button" aria-label="Cerrar el chat">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </header>

    <p class="aic-notice">
        <i class="fa-solid fa-circle-info"></i>
        <span>Soy una inteligencia artificial, no un psicólogo/a. Si estás en peligro llama al <strong>123</strong>.</span>
    </p>

    <div class="aic-messages" id="aicMessages" aria-live="polite"></div>

    <button class="aic-help" id="aicHelp" type="button" hidden>
        <i class="fa-solid fa-hands-holding-heart"></i>
        Pedir ayuda al psicólogo/a del colegio
    </button>

    <form class="aic-form" id="aicForm">
        <textarea id="aicInput" rows="1" maxlength="${MAX_CARACTERES}"
                  placeholder="Escribe tu mensaje…" aria-label="Escribe tu mensaje"></textarea>
        <button type="submit" id="aicSend" aria-label="Enviar">
            <i class="fa-solid fa-paper-plane"></i>
        </button>
    </form>
</section>`;

    // Conversación que se envía a la IA: [{ rol: "user" | "assistant", texto }]
    let conversacion = [];

    // Lo que se ve en el chat, para poder redibujarlo en otra página:
    //   { tipo: "msg", rol, texto, clase }  ·  { tipo: "oferta", estado: "pendiente" | "respondida" }
    let historial = [];

    // Factores de riesgo detectados en TODA la conversación
    const NIVELES = ["bajo", "medio", "alto", "critico"];
    const riesgoAcumulado = { nivel: "", factores: new Map() }; // codigo -> nombre

    let enviando = false;
    let idEstudiante = null;

    const $ = (id) => document.getElementById(id);

    function acumularRiesgo(data) {
        (data.factores || []).forEach((factor) => riesgoAcumulado.factores.set(factor.codigo, factor.nombre));
        if (data.nivel && NIVELES.indexOf(data.nivel) > NIVELES.indexOf(riesgoAcumulado.nivel)) {
            riesgoAcumulado.nivel = data.nivel;
        }
    }

    /* ---------------------------------------------------------
       GUARDAR / RECUPERAR la conversación en la sesión de la pestaña
    --------------------------------------------------------- */
    function guardarChat() {
        try {
            historial = historial.slice(-MAX_GUARDADOS);
            conversacion = conversacion.slice(-MAX_GUARDADOS);

            sessionStorage.setItem(CLAVE_CHAT, JSON.stringify({
                idEstudiante,
                abierto: !$("aicPanel").hidden,
                historial,
                conversacion,
                riesgo: { nivel: riesgoAcumulado.nivel, factores: [...riesgoAcumulado.factores.entries()] }
            }));
        } catch (error) {
            // si el navegador no deja guardar, el chat sigue funcionando en esta página
        }
    }

    function leerChatGuardado() {
        try {
            const guardado = JSON.parse(sessionStorage.getItem(CLAVE_CHAT));
            // Solo se recupera si es del mismo estudiante que tiene la sesión abierta
            if (guardado && String(guardado.idEstudiante) === String(idEstudiante)) return guardado;
        } catch (error) {
            // dato dañado: se empieza de nuevo
        }
        sessionStorage.removeItem(CLAVE_CHAT);
        return null;
    }

    /* ---------------------------------------------------------
       DIBUJAR MENSAJES
    --------------------------------------------------------- */
    function dibujarMensaje(rol, texto, clase) {
        const burbuja = document.createElement("div");
        burbuja.className = `aic-msg aic-${rol === "user" ? "user" : "bot"}${clase ? " " + clase : ""}`;
        burbuja.textContent = texto; // textContent: nunca se interpreta como HTML
        $("aicMessages").appendChild(burbuja);
        $("aicMessages").scrollTop = $("aicMessages").scrollHeight;
        return burbuja;
    }

    // Agrega un mensaje visible y lo recuerda (salvo el "Escribiendo…")
    function agregarMensaje(rol, texto, clase) {
        const burbuja = dibujarMensaje(rol, texto, clase);
        if (clase !== "aic-typing") {
            historial.push({ tipo: "msg", rol, texto, clase: clase || "" });
            guardarChat();
        }
        return burbuja;
    }

    function abrir() {
        $("aicPanel").hidden = false;
        $("aicLauncher").setAttribute("aria-expanded", "true");
        $("aicLauncher").classList.add("aic-hidden");
        $("aicMessages").scrollTop = $("aicMessages").scrollHeight;
        $("aicInput").focus();
        guardarChat();
    }

    function cerrar() {
        $("aicPanel").hidden = true;
        $("aicLauncher").setAttribute("aria-expanded", "false");
        $("aicLauncher").classList.remove("aic-hidden");
        $("aicLauncher").focus();
        guardarChat();
    }

    async function enviar(event) {
        event.preventDefault();
        if (enviando) return;

        const input = $("aicInput");
        const texto = input.value.trim();
        if (!texto) return;

        input.value = "";
        ajustarAltura();

        agregarMensaje("user", texto);
        conversacion.push({ rol: "user", texto });
        guardarChat();

        const escribiendo = agregarMensaje("assistant", "Escribiendo…", "aic-typing");
        enviando = true;
        $("aicSend").disabled = true;

        try {
            const response = await fetch(API_CHAT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + (sesionEstudiante()?.token || "")
                },
                body: JSON.stringify({ mensajes: conversacion.slice(-MAX_CONTEXTO) })
            });

            const data = await response.json().catch(() => ({}));
            escribiendo.remove();

            if (!response.ok) {
                conversacion.pop(); // el mensaje no tuvo respuesta: no se deja en el contexto de la IA
                agregarMensaje("assistant", data.message || "No pude responder en este momento.", "aic-error");
                acumularRiesgo(data);
                if (data.riesgo) ofrecerAvisarPsicologo(); // aunque la IA falle, se ofrece ayuda
                return;
            }

            conversacion.push({ rol: "assistant", texto: data.respuesta });
            agregarMensaje("assistant", data.respuesta);

            acumularRiesgo(data);
            guardarChat();
            if (data.riesgo) ofrecerAvisarPsicologo();
        } catch (error) {
            escribiendo.remove();
            conversacion.pop();
            agregarMensaje("assistant", "No me pude conectar con el servidor. Inténtalo de nuevo.", "aic-error");
        } finally {
            enviando = false;
            $("aicSend").disabled = false;
            input.focus();
        }
    }

    /* ---------------------------------------------------------
       ALERTA DE RIESGO (opción 3)
       No se guarda la conversación en la base de datos. Solo se
       PREGUNTA al estudiante si quiere avisar al psicólogo/a; si dice
       que sí, se abre el formulario "Pide ayuda" ya prellenado.
    --------------------------------------------------------- */
    function ofrecerAvisarPsicologo() {

        // Si ya hay una pregunta sin responder, no se repite
        if (historial.some((item) => item.tipo === "oferta" && item.estado === "pendiente")) return;

        const item = { tipo: "oferta", estado: "pendiente" };
        historial.push(item);
        guardarChat();
        dibujarOferta(item);
    }

    function dibujarOferta(item) {

        const tarjeta = document.createElement("div");
        tarjeta.className = "aic-offer" + (item.estado === "respondida" ? " aic-answered" : "");
        tarjeta.innerHTML = `
            <p><strong>Lo que sientes importa 💜</strong><br>
            ¿Quieres que le avisemos al psicólogo/a del colegio para que te contacte?</p>
            <div class="aic-offer-actions">
                <button type="button" class="aic-yes">Sí, avisar</button>
                <button type="button" class="aic-no">Ahora no</button>
            </div>
            <small>Si estás en peligro ahora mismo, llama al 123 o a la Línea Amiga 604 444 44 48.</small>`;

        $("aicMessages").appendChild(tarjeta);
        $("aicMessages").scrollTop = $("aicMessages").scrollHeight;

        if (item.estado === "respondida") {
            tarjeta.querySelectorAll("button").forEach((boton) => { boton.disabled = true; });
            return;
        }

        const responder = () => {
            item.estado = "respondida";
            tarjeta.classList.add("aic-answered");
            tarjeta.querySelectorAll("button").forEach((boton) => { boton.disabled = true; });
            guardarChat();
        };

        tarjeta.querySelector(".aic-yes").addEventListener("click", () => {
            responder();

            if (typeof window.openHelpRequest === "function") {
                agregarMensaje("assistant", "Gracias por confiar. Completa el formulario y el psicólogo/a se comunicará contigo 💜");
                cerrar();
                const nivel = riesgoAcumulado.nivel;
                window.openHelpRequest({
                    prioridad: nivel === "medio" ? "Alta" : "Urgente",
                    descripcion: "Pedí ayuda desde el chat de Sentir IA. Me gustaría que el psicólogo/a me contacte.",
                    origen: "chat",
                    nivel,
                    factores: [...riesgoAcumulado.factores.keys()],
                    nombresFactores: [...riesgoAcumulado.factores.values()]
                });
            } else {
                agregarMensaje("assistant",
                    "Busca la opción \"Pedir ayuda\" en el menú para escribirle al psicólogo/a. " +
                    "Y si estás en peligro ahora, llama al 123.");
            }
        });

        tarjeta.querySelector(".aic-no").addEventListener("click", () => {
            responder();
            agregarMensaje("assistant",
                "Está bien, tú decides. Si cambias de opinión, el botón \"Pedir ayuda al psicólogo/a del colegio\" sigue aquí abajo. " +
                "Y si estás en peligro, llama al 123.");
        });
    }

    // El cuadro de texto crece hasta 4 renglones
    function ajustarAltura() {
        const input = $("aicInput");
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 110) + "px";
    }

    // Sesión del estudiante en "Mi espacio personal" (la crea DiaryAccess al ingresar)
    function sesionEstudiante() {
        try {
            const sesion = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
            return sesion && sesion.token ? sesion : null;
        } catch (error) {
            return null;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {

        // El chat solo existe para estudiantes que iniciaron sesión
        const sesion = sesionEstudiante();
        if (!sesion) return;

        idEstudiante = sesion.id_usuario;

        const contenedor = document.createElement("div");
        contenedor.className = "aic-root";
        contenedor.innerHTML = HTML;
        document.body.appendChild(contenedor);

        // Recuperar la conversación de esta sesión (si la hay) o empezar con el saludo
        const guardado = leerChatGuardado();

        if (guardado && Array.isArray(guardado.historial) && guardado.historial.length) {
            conversacion = Array.isArray(guardado.conversacion) ? guardado.conversacion : [];
            historial = guardado.historial;

            riesgoAcumulado.nivel = guardado.riesgo?.nivel || "";
            (guardado.riesgo?.factores || []).forEach(([codigo, nombre]) => riesgoAcumulado.factores.set(codigo, nombre));

            historial.forEach((item) => {
                if (item.tipo === "oferta") dibujarOferta(item);
                else dibujarMensaje(item.rol, item.texto, item.clase);
            });
        } else {
            agregarMensaje("assistant", SALUDO);
        }

        $("aicLauncher").addEventListener("click", abrir);
        $("aicClose").addEventListener("click", cerrar);
        $("aicForm").addEventListener("submit", enviar);
        $("aicInput").addEventListener("input", ajustarAltura);

        // Enter envía · Shift+Enter hace salto de línea
        $("aicInput").addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                $("aicForm").requestSubmit();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !$("aicPanel").hidden) cerrar();
        });

        // Si la página tiene el formulario de pedir ayuda, se ofrece un acceso directo
        if (typeof window.openHelpRequest === "function") {
            $("aicHelp").hidden = false;
            // Se cierra el chat primero para que el formulario no quede tapado
            $("aicHelp").addEventListener("click", () => {
                cerrar();
                window.openHelpRequest();
            });
        }

        // Si el chat estaba abierto en la página anterior, sigue abierto
        if (guardado && guardado.abierto) {
            $("aicPanel").hidden = false;
            $("aicLauncher").setAttribute("aria-expanded", "true");
            $("aicLauncher").classList.add("aic-hidden");
            $("aicMessages").scrollTop = $("aicMessages").scrollHeight;
        }
    });

})();
