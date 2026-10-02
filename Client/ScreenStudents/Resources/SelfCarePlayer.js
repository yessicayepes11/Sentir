/* =========================================================
   RETOS DE AUTOCUIDADO (apartado "Autocuidado")

   Cada tarjeta con  data-selfcare-player="<id>"  abre una ventana con
   el reto: para qué sirve, los pasos para marcar uno por uno y una
   pregunta para reflexionar. Al marcar todos los pasos se puede
   pulsar "¡Reto cumplido!" (cuenta para las insignias de Autocuidado).

   Usa la misma ventana (estilos mp-*) que las meditaciones.
========================================================= */

(function () {

    const CHALLENGES = {

        agua: {
            title: "Recarga de agua y pausa",
            icon: "fa-glass-water",
            color: "#5b8def",
            minutes: 5,
            description: "Una pausa corta para hidratarte y darle un respiro a tu cuerpo.",
            benefit: "Estar hidratado mejora la concentración y el ánimo.",
            steps: [
                "Sírvete un vaso de agua.",
                "Tómalo despacio, sin mirar el celular.",
                "Estira los brazos hacia arriba durante 10 segundos.",
                "Nota cómo se siente tu cuerpo ahora."
            ],
            question: "¿Qué cambió en tu cuerpo después de esta pausa?"
        },

        caminata: {
            title: "Caminata consciente",
            icon: "fa-person-walking",
            color: "#2f9e6d",
            minutes: 10,
            description: "Camina unos minutos prestando atención a lo que ves, oyes y sientes.",
            benefit: "Moverte libera tensión y ayuda a ordenar los pensamientos.",
            steps: [
                "Busca un lugar seguro para caminar (el patio, un pasillo o tu casa).",
                "Camina despacio durante 5 minutos.",
                "Fíjate en 3 cosas que no habías notado antes.",
                "Termina con tres respiraciones profundas."
            ],
            question: "¿Qué fue lo que más te llamó la atención?"
        },

        mensaje: {
            title: "Mensaje que abraza",
            icon: "fa-envelope",
            color: "#e05f8a",
            minutes: 5,
            description: "Escríbele a alguien que quieres para recordarle que es importante.",
            benefit: "Conectar con otros reduce la soledad y mejora el ánimo.",
            steps: [
                "Piensa en alguien que te haga sentir bien.",
                "Escríbele un mensaje corto y sincero.",
                "Envíalo sin esperar nada a cambio."
            ],
            question: "¿Cómo te sentiste al escribir ese mensaje?"
        },

        pantallas: {
            title: "Desconexión de pantallas",
            icon: "fa-mobile-screen",
            color: "#e0794c",
            minutes: 20,
            description: "Regálate 20 minutos sin celular ni redes sociales.",
            benefit: "Descansar de las pantallas baja la ansiedad y mejora el descanso.",
            steps: [
                "Pon el celular en silencio y déjalo lejos.",
                "Elige algo sin pantallas: leer, dibujar, conversar u ordenar.",
                "Disfruta esa actividad 20 minutos.",
                "Antes de volver al celular, piensa cómo te sentiste."
            ],
            question: "¿Qué hiciste en lugar de usar el celular?"
        }
    };

    const MODAL_HTML = `
<div class="mp-box sc-box" role="dialog" aria-modal="true" aria-labelledby="scTitle">

    <button class="mp-close" type="button" id="scClose" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="mp-header">
        <div class="mp-icon" id="scIcon"><i class="fa-solid"></i></div>
        <div>
            <h2 id="scTitle"></h2>
            <p id="scDescription"></p>
        </div>
    </div>

    <p class="sc-benefit">
        <i class="fa-solid fa-heart-pulse"></i>
        <span id="scBenefit"></span>
    </p>

    <div class="sc-progress-row">
        <span id="scCount"></span>
        <span id="scMinutes"></span>
    </div>
    <div class="mp-progress">
        <div class="mp-progress-bar" id="scProgressBar"></div>
    </div>

    <ol class="sc-steps" id="scSteps"></ol>

    <div class="sc-question" id="scQuestionBox">
        <strong><i class="fa-solid fa-comment-dots"></i> Para pensar al terminar</strong>
        <p id="scQuestion"></p>
    </div>

    <div class="mp-done" id="scDone" hidden>
        <i class="fa-solid fa-circle-check"></i>
        <strong>¡Reto cumplido!</strong>
        <span>Cuidarte también es un logro. Bien hecho.</span>
    </div>

    <div class="mp-actions">
        <button class="mp-main" type="button" id="scMain" disabled>
            <i class="fa-solid fa-flag-checkered"></i>
            <span>Marca todos los pasos</span>
        </button>
    </div>

</div>`;

    let modal;
    let challenge = null;
    let currentId = null;
    let finished = false;


    function $(id) {
        return document.getElementById(id);
    }


    function createModal() {

        modal = document.createElement("div");
        modal.className = "mp-overlay";
        modal.id = "selfCarePlayer";
        modal.innerHTML = MODAL_HTML;
        document.body.appendChild(modal);

        $("scClose").addEventListener("click", close);
        $("scMain").addEventListener("click", complete);

        $("scSteps").addEventListener("change", updateProgress);

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                close();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal.classList.contains("show")) {
                close();
            }
        });
    }


    function open(id) {

        if (!CHALLENGES[id]) {
            return;
        }

        if (!modal) {
            createModal();
        }

        challenge = CHALLENGES[id];
        currentId = id;
        finished = false;
        modal.style.setProperty("--mp-color", challenge.color);

        $("scIcon").innerHTML = `<i class="fa-solid ${challenge.icon}"></i>`;
        $("scTitle").textContent = challenge.title;
        $("scDescription").textContent = challenge.description;
        $("scBenefit").textContent = challenge.benefit;
        $("scMinutes").textContent = `${challenge.minutes} min aprox.`;
        $("scQuestion").textContent = challenge.question || "";
        $("scQuestionBox").hidden = !challenge.question;
        $("scDone").hidden = true;

        const list = $("scSteps");
        list.innerHTML = "";

        challenge.steps.forEach(function (step, index) {
            const item = document.createElement("li");
            item.innerHTML = `
                <label>
                    <input type="checkbox" data-step="${index}">
                    <span class="sc-check"><i class="fa-solid fa-check"></i></span>
                    <span class="sc-text"></span>
                </label>`;
            item.querySelector(".sc-text").textContent = step;
            list.appendChild(item);
        });

        updateProgress();

        modal.classList.add("show");
        document.body.classList.add("mp-open");
        $("scClose").focus();
    }


    function close() {

        modal.classList.remove("show");
        document.body.classList.remove("mp-open");
    }


    function updateProgress() {

        const boxes = $("scSteps").querySelectorAll("input[type=checkbox]");
        const done = [...boxes].filter(function (box) { return box.checked; }).length;

        boxes.forEach(function (box) {
            box.closest("li").classList.toggle("checked", box.checked);
            box.disabled = finished;
        });

        $("scCount").textContent = `${done} de ${boxes.length} pasos`;
        $("scProgressBar").style.width = `${boxes.length ? (done / boxes.length) * 100 : 0}%`;

        const ready = done === boxes.length && boxes.length > 0;
        const main = $("scMain");

        if (finished) {
            main.disabled = false;
            main.innerHTML = '<i class="fa-solid fa-xmark"></i><span>Cerrar</span>';
        } else {
            main.disabled = !ready;
            main.innerHTML = ready
                ? '<i class="fa-solid fa-flag-checkered"></i><span>¡Reto cumplido!</span>'
                : '<i class="fa-solid fa-list-check"></i><span>Marca todos los pasos</span>';
        }
    }


    function complete() {

        if (finished) {
            close();
            return;
        }

        finished = true;
        $("scDone").hidden = false;
        updateProgress();

        // Avisa que terminó (cuenta para las insignias de Autocuidado)
        document.dispatchEvent(new CustomEvent("sentir:actividad", {
            detail: { tipo: "autocuidado", clave: currentId }
        }));
    }


    document.addEventListener("click", function (event) {

        const trigger = event.target.closest("[data-selfcare-player]");

        if (trigger) {
            open(trigger.dataset.selfcarePlayer);
        }
    });

    // Permite agregar retos creados por la IA (Recursos > "Creado para ti")
    window.SentirSelfCarePlayer = {
        register: function (id, data) { CHALLENGES[id] = data; },
        open: open
    };

})();
