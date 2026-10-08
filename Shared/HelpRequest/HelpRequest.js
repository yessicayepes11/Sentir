/* =========================================================
   FORMULARIO "PIDE AYUDA AL PSICÓLOGO/A INSTITUCIONAL"
   Componente compartido: se usa en Students.html y Ayuda.html.

   Uso en una página:
     <link rel="stylesheet" href="/Shared/HelpRequest/HelpRequest.css">
     <script src="/Shared/HelpRequest/HelpRequest.js"></script>
   y cualquier botón con el atributo  data-open-help-request
   abre el formulario. También existe window.openHelpRequest().

   La solicitud se guarda en la tabla `ayuda` (POST /api/Ayuda/solicitar).
========================================================= */

(function () {

    const API_AYUDA = "http://localhost:3001/api/Ayuda/solicitar";

    const MODAL_HTML = `
<div class="hr-box" role="dialog" aria-modal="true" aria-labelledby="helpRequestTitle">

    <button class="hr-close" id="closeHelpRequest" type="button" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
    </button>

    <span class="hr-tag">
        <i class="fa-solid fa-heart"></i>
        ESTAMOS CONTIGO
    </span>

    <h2 id="helpRequestTitle">Pide ayuda al psicólogo/a institucional</h2>

    <p class="hr-description">
        Cuéntanos qué está pasando. El psicólogo/a se comunicará contigo.
    </p>

    <form id="helpRequestForm" novalidate>

        <label>
            <span>Número de identificación</span>
            <div class="hr-input">
                <i class="fa-regular fa-id-card"></i>
                <input type="text" id="helpIdentificacion" inputmode="numeric" maxlength="15"
                       placeholder="Tu documento" autocomplete="off" required>
            </div>
        </label>

        <label>
            <span>Nombre completo</span>
            <div class="hr-input">
                <i class="fa-regular fa-user"></i>
                <input type="text" id="helpNombre" maxlength="100"
                       placeholder="Tu nombre y apellidos" required>
            </div>
        </label>

        <label>
            <span>Correo electrónico institucional</span>
            <div class="hr-input">
                <i class="fa-regular fa-envelope"></i>
                <input type="email" id="helpCorreo" maxlength="150"
                       placeholder="tucorreo@iesantaelena.edu.co" required>
            </div>
        </label>

        <div class="hr-row">

            <label>
                <span>Grado</span>
                <div class="hr-grade">
                    <div class="hr-input">
                        <input type="text" id="helpGradoNumero" inputmode="numeric" maxlength="2"
                               placeholder="9" aria-label="Número del grado" required>
                    </div>
                    <strong>-</strong>
                    <div class="hr-input">
                        <input type="text" id="helpGradoLetra" inputmode="numeric" maxlength="2"
                               placeholder="1" aria-label="Número del grupo" required>
                    </div>
                </div>
            </label>

            <label>
                <span>Prioridad</span>
                <div class="hr-input">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <select id="helpPrioridad" required>
                        <option value="">Selecciona</option>
                        <option value="Urgente">Urgente</option>
                        <option value="Muy alta">Muy alta</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Leve">Leve</option>
                    </select>
                </div>
            </label>

        </div>

        <label>
            <span>Descripción de la situación</span>
            <div class="hr-input hr-textarea">
                <i class="fa-regular fa-message"></i>
                <textarea id="helpDescripcion" required
                          placeholder="Cuéntanos con tus palabras qué está pasando..."></textarea>
            </div>
        </label>

        <p class="hr-date">
            <i class="fa-regular fa-clock"></i>
            Fecha de la solicitud: <strong id="helpFechaHoy"></strong> (se registra automáticamente)
        </p>

        <p class="hr-chat-note" id="helpChatNote" hidden></p>

        <div class="hr-privacy">
            <i class="fa-solid fa-shield-heart"></i>
            <span>Tu documento solo se usa para verificar que eres tú. No se muestra a nadie.</span>
        </div>

        <p class="hr-error" id="helpRequestError" role="alert"></p>

        <button class="hr-submit" id="helpRequestSubmit" type="submit">
            <i class="fa-solid fa-paper-plane"></i>
            Enviar solicitud
            <i class="fa-solid fa-arrow-right"></i>
        </button>

    </form>

    <div class="hr-success" id="helpRequestSuccess" hidden>
        <div class="hr-success-icon">
            <i class="fa-solid fa-check"></i>
        </div>
        <h3>¡Solicitud enviada!</h3>
        <p>
            El psicólogo/a institucional recibió tu mensaje y se comunicará contigo.
            Si es una emergencia, busca de inmediato a un adulto de confianza.
        </p>
        <p>
            Te enviamos la confirmación a tu correo y a las notificaciones. Puedes ver
            el estado de tus solicitudes en <a href="/Client/ScreenStudents/EmotionalDiary/Citas/Citas.html#ayudas">Mis citas › Mis solicitudes de ayuda</a>.
        </p>
        <button class="hr-secondary" id="finishHelpRequest" type="button">Listo</button>
    </div>

</div>`;


    let modal;

    // Datos que manda el chat de IA (origen, nivel y factores de riesgo detectados)
    let contextoChat = null;


    function $(id) {
        return document.getElementById(id);
    }


    function createModal() {

        modal = document.createElement("div");
        modal.id = "helpRequestModal";
        modal.innerHTML = MODAL_HTML;
        document.body.appendChild(modal);

        $("closeHelpRequest").addEventListener("click", closeHelpRequest);
        $("finishHelpRequest").addEventListener("click", closeHelpRequest);

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeHelpRequest();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal.classList.contains("show")) {
                closeHelpRequest();
            }
        });

        // Solo números en documento, grado y grupo
        $("helpIdentificacion").addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
        });

        $("helpGradoNumero").addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 2);
        });

        $("helpGradoLetra").addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 2);
        });

        $("helpRequestForm").addEventListener("submit", submitHelpRequest);
    }


    // prefill (opcional): { prioridad, descripcion } — por ejemplo, desde el chat de IA
    function openHelpRequest(prefill) {

        if (!modal) {
            createModal();
        }

        const form = $("helpRequestForm");
        form.reset();

        // Si el estudiante ya inició sesión en "Mi espacio personal", se llenan sus datos
        try {
            const sesion = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
            if (sesion && sesion.id_usuario) {
                $("helpIdentificacion").value = String(sesion.id_usuario);
                $("helpNombre").value = `${sesion.nombre || ""} ${sesion.apellido || ""}`.trim();
            }
        } catch (error) {
            // sin sesión: el estudiante escribe sus datos
        }

        contextoChat = null;
        $("helpChatNote").hidden = true;

        if (prefill && typeof prefill === "object") {
            if (prefill.prioridad) $("helpPrioridad").value = prefill.prioridad;
            if (prefill.descripcion) $("helpDescripcion").value = prefill.descripcion;

            if (prefill.origen === "chat") {
                contextoChat = {
                    origen: "chat",
                    nivel: prefill.nivel || "",
                    factores: Array.isArray(prefill.factores) ? prefill.factores : []
                };

                // Transparencia: el estudiante ve qué se enviará (nunca la conversación)
                const nombres = Array.isArray(prefill.nombresFactores) ? prefill.nombresFactores : [];
                $("helpChatNote").textContent = nombres.length
                    ? "Junto con tu solicitud se enviarán los temas que detectó el chat: " + nombres.join(", ") + ". La conversación no se envía."
                    : "Tu solicitud llegará marcada como enviada desde el chat. La conversación no se envía.";
                $("helpChatNote").hidden = false;
            }
        }
        form.hidden = false;
        $("helpRequestSuccess").hidden = true;
        $("helpRequestError").textContent = "";
        $("helpFechaHoy").textContent = new Date().toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        modal.classList.add("show");
        document.body.classList.add("hr-modal-open");
        $("helpIdentificacion").focus();
    }


    function closeHelpRequest() {

        modal.classList.remove("show");
        document.body.classList.remove("hr-modal-open");
    }


    async function submitHelpRequest(event) {

        event.preventDefault();

        const errorText = $("helpRequestError");
        const submitButton = $("helpRequestSubmit");
        errorText.textContent = "";

        const data = {
            identificacion: $("helpIdentificacion").value.trim(),
            nombre: $("helpNombre").value.trim(),
            correo: $("helpCorreo").value.trim(),
            gradoNumero: $("helpGradoNumero").value.trim(),
            gradoLetra: $("helpGradoLetra").value.trim(),
            prioridad: $("helpPrioridad").value,
            descripcion: $("helpDescripcion").value.trim(),
            ...(contextoChat || {})
        };

        if (!data.identificacion) {
            errorText.textContent = "Ingresa tu número de identificación.";
            return;
        }

        if (!data.nombre || !data.descripcion) {
            errorText.textContent = "Escribe tu nombre y la descripción de la situación.";
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
            errorText.textContent = "Ingresa un correo electrónico institucional válido.";
            return;
        }

        const grade = Number(data.gradoNumero);
        if (!data.gradoNumero || grade < 0 || grade > 11 || !/^[1-9]\d?$/.test(data.gradoLetra)) {
            errorText.textContent =
                "Escribe tu grado: un número del 0 al 11 y el número del grupo (ej: 9 - 1).";
            return;
        }

        if (!data.prioridad) {
            errorText.textContent = "Selecciona la prioridad.";
            return;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch(API_AYUDA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                errorText.textContent = result.message || "No se pudo enviar tu solicitud.";
                return;
            }

            $("helpRequestForm").hidden = true;
            $("helpRequestSuccess").hidden = false;

            // Confirmación en la campanita y en el historial de ayudas (si la página los tiene)
            if (window.SentirNotificaciones) window.SentirNotificaciones.actualizar();
            document.dispatchEvent(new CustomEvent("sentir:ayuda-enviada"));
        } catch (error) {
            errorText.textContent = "No se pudo conectar con el servidor. Inténtalo de nuevo.";
        } finally {
            submitButton.disabled = false;
        }
    }


    // Cualquier elemento con data-open-help-request abre el formulario
    document.addEventListener("click", function (event) {
        const trigger = event.target.closest("[data-open-help-request]");
        if (trigger) {
            event.preventDefault();
            openHelpRequest();
        }
    });


    window.openHelpRequest = openHelpRequest;

})();
