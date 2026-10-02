/* =========================================================
   RECOMENDACIONES DE "¿A QUIÉN QUIERES ESCRIBIR?"

   Al tocar una tarjeta (Persona de confianza, Profesional o
   Línea de ayuda) aparece debajo un consejo: qué hacer, un
   ejemplo de qué decir (se puede copiar) y acciones directas.
========================================================= */

(function () {

    const CONSEJOS = {

        personal: {
            icono: "fa-user-group",
            color: "#7b5cff",
            titulo: "Habla con una persona de confianza",
            intro: "Contarle a alguien cercano lo que sientes alivia el peso y te ayuda a no cargarlo solo/a.",
            pasos: [
                "Piensa en alguien que te escuche sin juzgarte: mamá, papá, un familiar, un amigo o un profesor.",
                "Busca un momento tranquilo y un lugar donde puedan hablar con calma.",
                "No tienes que explicarlo todo perfecto. Empieza por cómo te sientes.",
                "Si esa persona no te entiende, no te rindas: busca a otra o pide ayuda al psicólogo/a del colegio."
            ],
            mensaje: "Hola, ¿tienes un momento? Últimamente no me he sentido muy bien y me gustaría hablar contigo.",
            acciones: [
                { tipo: "copiar", texto: "Copiar mensaje", icono: "fa-copy" }
            ]
        },

        profesional: {
            icono: "fa-user-doctor",
            color: "#3b9ce8",
            titulo: "Busca a un profesional",
            intro: "Un psicólogo/a o médico sabe cómo acompañarte. Pedir ayuda profesional es una decisión valiente.",
            pasos: [
                "En el colegio puedes hablar con el psicólogo/a institucional: es gratis y confidencial.",
                "Fuera del colegio, pide a tu acudiente una cita con tu EPS (medicina general o psicología).",
                "Antes de la cita, anota qué sientes, desde cuándo y qué cosas lo empeoran o lo mejoran.",
                "Si ya tienes un terapeuta, escríbele o pide una cita antes de lo planeado si lo necesitas."
            ],
            mensaje: "Hola, quisiera pedir una cita. He estado sintiéndome mal y necesito hablar con alguien que me oriente.",
            acciones: [
                { tipo: "psicologo", texto: "Pedir ayuda al psicólogo/a del colegio", icono: "fa-brain" },
                { tipo: "copiar", texto: "Copiar mensaje", icono: "fa-copy" }
            ]
        },

        emergencia: {
            icono: "fa-phone-volume",
            color: "#e05a6a",
            titulo: "Llama a una línea de ayuda",
            intro: "Las líneas de ayuda te escuchan de forma gratuita y confidencial. No tienes que estar en crisis para llamar.",
            pasos: [
                "Si sientes que estás en peligro o piensas en hacerte daño, llama YA al 123 o acude a urgencias.",
                "Si necesitas hablar con alguien, llama a la Línea 192 (opción 4) o a la línea de tu ciudad.",
                "Busca un lugar tranquilo y, si puedes, pide a alguien de confianza que te acompañe.",
                "Cuéntale al psicólogo/a del colegio que llamaste, para que te siga acompañando."
            ],
            mensaje: "Hola, estoy pasando por un momento difícil y necesito hablar con alguien.",
            lineas: [
                { nombre: "Emergencias", detalle: "Si tu vida o la de alguien está en riesgo", numero: "123" },
                { nombre: "Línea 192, opción 4", detalle: "Apoyo en salud mental (Minsalud)", numero: "192" },
                { nombre: "Línea Amiga Saludable", detalle: "Medellín · apoyo emocional", numero: "6044444448", visible: "604 444 44 48" },
                { nombre: "Línea 141 ICBF", detalle: "Protección de niños, niñas y adolescentes", numero: "141" }
            ],
            acciones: [
                { tipo: "copiar", texto: "Copiar qué decir", icono: "fa-copy" }
            ]
        }
    };

    function escapar(valor) {
        const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
        return String(valor ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);
    }

    function mostrar(clave, desplazar) {
        const panel = document.getElementById("contactAdvice");
        const consejo = CONSEJOS[clave];
        if (!panel || !consejo) return;

        panel.style.setProperty("--advice-color", consejo.color);
        panel.innerHTML = `
            <div class="advice-head">
                <span class="advice-icon"><i class="fa-solid ${consejo.icono}"></i></span>
                <div>
                    <strong>${escapar(consejo.titulo)}</strong>
                    <p>${escapar(consejo.intro)}</p>
                </div>
            </div>

            <h3><i class="fa-solid fa-list-check"></i> Qué puedes hacer</h3>
            <ol class="advice-steps">
                ${consejo.pasos.map((paso) => `<li>${escapar(paso)}</li>`).join("")}
            </ol>

            ${consejo.lineas ? `
                <h3><i class="fa-solid fa-phone"></i> Líneas gratuitas</h3>
                <div class="advice-lines">
                    ${consejo.lineas.map((linea) => `
                        <a class="advice-line" href="tel:${linea.numero}">
                            <span>
                                <strong>${escapar(linea.nombre)}</strong>
                                <small>${escapar(linea.detalle)}</small>
                            </span>
                            <b><i class="fa-solid fa-phone"></i> ${escapar(linea.visible || linea.numero)}</b>
                        </a>`).join("")}
                </div>` : ""}

            <h3><i class="fa-regular fa-comment-dots"></i> Puedes decir algo así</h3>
            <blockquote class="advice-message">“${escapar(consejo.mensaje)}”</blockquote>

            <div class="advice-actions">
                ${consejo.acciones.map((accion) => `
                    <button type="button" class="advice-button ${accion.tipo === "psicologo" ? "main" : ""}" data-advice-action="${accion.tipo}">
                        <i class="fa-solid ${accion.icono}"></i> ${escapar(accion.texto)}
                    </button>`).join("")}
            </div>`;

        panel.dataset.consejo = clave;
        panel.hidden = false;
        panel.classList.remove("show");
        void panel.offsetWidth;          // reinicia la animación
        panel.classList.add("show");

        if (desplazar) {
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    async function copiar(boton) {
        const consejo = CONSEJOS[document.getElementById("contactAdvice").dataset.consejo];
        if (!consejo) return;

        const original = boton.innerHTML;

        try {
            await navigator.clipboard.writeText(consejo.mensaje);
            boton.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
        } catch (error) {
            boton.innerHTML = '<i class="fa-solid fa-hand-pointer"></i> Mantén presionado el mensaje para copiarlo';
        }

        setTimeout(() => { boton.innerHTML = original; }, 2200);
    }

    document.addEventListener("DOMContentLoaded", function () {

        document.querySelectorAll('input[name="contact"]').forEach((opcion) => {
            opcion.addEventListener("change", () => mostrar(opcion.value, true));
            // Volver a tocar la tarjeta ya elegida también muestra el consejo
            opcion.closest("label").addEventListener("click", () => {
                if (opcion.checked) mostrar(opcion.value, true);
            });
        });

        document.getElementById("contactAdvice")?.addEventListener("click", (event) => {
            const boton = event.target.closest("[data-advice-action]");
            if (!boton) return;

            if (boton.dataset.adviceAction === "copiar") {
                copiar(boton);
            } else if (boton.dataset.adviceAction === "psicologo" && typeof window.openHelpRequest === "function") {
                window.openHelpRequest();
            }
        });

        // Muestra el consejo de la opción que viene marcada
        const marcada = document.querySelector('input[name="contact"]:checked');
        if (marcada) mostrar(marcada.value, false);
    });

})();
