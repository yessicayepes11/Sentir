/* =========================================================
   REPRODUCTOR DE MEDITACIONES GUIADAS (apartado "Meditaciones")

   Cada tarjeta con  data-meditation-player="<id>"  abre una ventana
   que va mostrando las instrucciones paso a paso, cada una con su
   tiempo, una barra de progreso y botones de pausar / reiniciar.
========================================================= */

(function () {

    const MEDITATIONS = {

        escaneo: {
            title: "Escaneo corporal",
            icon: "fa-person",
            color: "#7954e1",
            description: "Recorre tu cuerpo de los pies a la cabeza y suelta la tensión parte por parte.",
            steps: [
                { text: "Siéntate cómodo, apoya los pies en el piso y, si quieres, cierra los ojos.", seconds: 15 },
                { text: "Respira profundo tres veces. Siente cómo el aire entra y sale.", seconds: 20 },
                { text: "Lleva tu atención a los pies. Nota si están fríos, tibios o tensos… y suéltalos.", seconds: 20 },
                { text: "Sube a las piernas y las rodillas. Imagina que se vuelven pesadas y relajadas.", seconds: 20 },
                { text: "Siente tu abdomen y tu pecho moverse con la respiración. No cambies nada, solo observa.", seconds: 25 },
                { text: "Deja caer los hombros lejos de las orejas. Suelta también los brazos y las manos.", seconds: 25 },
                { text: "Afloja la cara: la frente, los ojos y la mandíbula. Deja la lengua suelta.", seconds: 25 },
                { text: "Siente todo tu cuerpo junto, tranquilo y en calma.", seconds: 20 },
                { text: "Mueve suavemente los dedos y, cuando estés listo, abre los ojos.", seconds: 10 }
            ]
        },

        anclaje: {
            title: "Anclaje 5-4-3-2-1",
            icon: "fa-hand",
            color: "#6088cb",
            description: "Usa tus cinco sentidos para frenar la ansiedad y volver al aquí y ahora.",
            steps: [
                { text: "Respira profundo. Vamos a usar tus sentidos para volver al presente.", seconds: 15 },
                { text: "Mira a tu alrededor y nombra en tu mente 5 cosas que puedes VER.", seconds: 35 },
                { text: "Ahora nota 4 cosas que puedes TOCAR: tu ropa, la silla, tus manos…", seconds: 35 },
                { text: "Escucha con atención e identifica 3 sonidos que puedes OÍR.", seconds: 30 },
                { text: "Busca 2 cosas que puedes OLER. Si no notas ninguna, recuerda tus dos olores favoritos.", seconds: 25 },
                { text: "Nota 1 cosa que puedes SABOREAR, o recuerda un sabor que te guste.", seconds: 20 },
                { text: "Respira profundo una vez más. Estás aquí, en este momento, y estás a salvo.", seconds: 20 }
            ]
        },

        lugar: {
            title: "Mi lugar seguro",
            icon: "fa-mountain-sun",
            color: "#d059ac",
            description: "Imagina con detalle un lugar tranquilo donde te sientas protegido.",
            steps: [
                { text: "Cierra los ojos y respira lento. Deja que tu cuerpo se acomode.", seconds: 15 },
                { text: "Imagina un lugar donde te sientas tranquilo y seguro. Puede ser real o inventado.", seconds: 25 },
                { text: "Mira a tu alrededor en ese lugar: ¿qué colores ves? ¿Cómo es la luz?", seconds: 25 },
                { text: "Escucha: ¿qué sonidos hay? Tal vez agua, pájaros, viento… o silencio.", seconds: 25 },
                { text: "Siente la temperatura y lo que tocas: el suelo, el aire, una manta suave…", seconds: 25 },
                { text: "Nota cómo se siente tu cuerpo aquí: tranquilo, protegido y en calma.", seconds: 30 },
                { text: "Recuerda: puedes volver a este lugar cada vez que lo necesites.", seconds: 20 },
                { text: "Respira profundo, mueve tus manos y abre los ojos despacio.", seconds: 15 }
            ]
        },

        nubes: {
            title: "Nubes pasajeras",
            icon: "fa-cloud",
            color: "#3f9fc6",
            description: "Observa tus pensamientos como nubes que pasan, sin pelear con ellos.",
            steps: [
                { text: "Siéntate cómodo y respira con calma. Imagina un cielo azul y muy amplio.", seconds: 15 },
                { text: "Cada pensamiento que aparezca es una nube. No tienes que hacer nada con ella.", seconds: 25 },
                { text: "Cuando llegue un pensamiento, ponlo sobre una nube y obsérvala.", seconds: 30 },
                { text: "Mira cómo esa nube se aleja lentamente con el viento.", seconds: 30 },
                { text: "Si te distraes, está bien. Solo vuelve a mirar el cielo con amabilidad.", seconds: 30 },
                { text: "Tú eres el cielo: las nubes pasan, pero el cielo sigue tranquilo.", seconds: 30 },
                { text: "Respira profundo y, cuando quieras, abre los ojos.", seconds: 20 }
            ]
        }
    };

    const MODAL_HTML = `
<div class="mp-box" role="dialog" aria-modal="true" aria-labelledby="mpTitle">

    <button class="mp-close" type="button" id="mpClose" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="mp-header">
        <div class="mp-icon" id="mpIcon"><i class="fa-solid"></i></div>
        <div>
            <h2 id="mpTitle"></h2>
            <p id="mpDescription"></p>
        </div>
    </div>

    <div class="mp-stage">
        <div class="mp-orb" id="mpOrb">
            <i class="fa-solid" id="mpOrbIcon"></i>
        </div>

        <p class="mp-step-count" id="mpStepCount"></p>
        <p class="mp-text" id="mpText" aria-live="polite"></p>
    </div>

    <div class="mp-progress">
        <div class="mp-progress-bar" id="mpProgressBar"></div>
    </div>

    <div class="mp-times">
        <span id="mpStepTime"></span>
        <span id="mpTotalTime"></span>
    </div>

    <div class="mp-done" id="mpDone" hidden>
        <i class="fa-solid fa-circle-check"></i>
        <strong>¡Terminaste tu meditación!</strong>
        <span>Tómate un momento antes de seguir con tu día.</span>
    </div>

    <div class="mp-actions">
        <button class="mp-main" type="button" id="mpMain">
            <i class="fa-solid fa-play"></i>
            <span>Comenzar</span>
        </button>
        <button class="mp-secondary" type="button" id="mpRestart" hidden>
            <i class="fa-solid fa-rotate-left"></i>
            Reiniciar
        </button>
    </div>

</div>`;

    let modal;
    let meditation = null;
    let state = null;   // { stepIndex, stepRemaining, elapsed }
    let timer = null;
    let running = false;


    function $(id) {
        return document.getElementById(id);
    }


    function createModal() {

        modal = document.createElement("div");
        modal.className = "mp-overlay";
        modal.id = "meditationPlayer";
        modal.innerHTML = MODAL_HTML;
        document.body.appendChild(modal);

        $("mpClose").addEventListener("click", close);
        $("mpMain").addEventListener("click", toggle);
        $("mpRestart").addEventListener("click", restart);

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

        if (!MEDITATIONS[id]) {
            return;
        }

        if (!modal) {
            createModal();
        }

        meditation = MEDITATIONS[id];
        modal.style.setProperty("--mp-color", meditation.color);

        $("mpIcon").innerHTML = `<i class="fa-solid ${meditation.icon}"></i>`;
        $("mpOrbIcon").className = `fa-solid ${meditation.icon}`;
        $("mpTitle").textContent = meditation.title;
        $("mpDescription").textContent = meditation.description;

        reset();

        modal.classList.add("show");
        document.body.classList.add("mp-open");
        $("mpMain").focus();
    }


    function close() {

        stopTimer();
        running = false;
        $("mpOrb").classList.remove("breathing");
        modal.classList.remove("show");
        document.body.classList.remove("mp-open");
    }


    function reset() {

        stopTimer();
        running = false;
        state = { stepIndex: 0, stepRemaining: meditation.steps[0].seconds, elapsed: 0 };

        $("mpOrb").classList.remove("breathing");
        $("mpStepCount").textContent = `${meditation.steps.length} pasos guiados`;
        $("mpText").textContent = "Busca un lugar tranquilo y pulsa \"Comenzar\" cuando estés listo.";
        $("mpStepTime").textContent = "";
        $("mpTotalTime").textContent = `Duración: ${formatTime(totalSeconds())}`;
        $("mpProgressBar").style.width = "0%";
        $("mpDone").hidden = true;
        $("mpRestart").hidden = true;
        setMainButton("play", "Comenzar");
    }


    function restart() {

        reset();
        toggle();
    }


    function toggle() {

        if (running) {
            pause();
            return;
        }

        if (!$("mpDone").hidden) {
            reset();
        }

        running = true;
        $("mpRestart").hidden = false;
        $("mpOrb").classList.add("breathing");
        setMainButton("pause", "Pausar");
        showStep();
        timer = setInterval(tick, 1000);
    }


    function pause() {

        running = false;
        stopTimer();
        $("mpOrb").classList.remove("breathing");
        $("mpStepTime").textContent = "En pausa";
        setMainButton("play", "Continuar");
    }


    function showStep() {

        const step = meditation.steps[state.stepIndex];
        const text = $("mpText");

        if (text.textContent !== step.text) {
            text.classList.remove("fade");
            void text.offsetWidth;   // reinicia la animación de entrada
            text.classList.add("fade");
            text.textContent = step.text;
        }

        $("mpStepCount").textContent = `Paso ${state.stepIndex + 1} de ${meditation.steps.length}`;
        updateTimes();
    }


    function tick() {

        state.stepRemaining -= 1;
        state.elapsed += 1;

        if (state.stepRemaining <= 0) {
            state.stepIndex += 1;

            if (state.stepIndex >= meditation.steps.length) {
                finish();
                return;
            }

            state.stepRemaining = meditation.steps[state.stepIndex].seconds;
            showStep();
            return;
        }

        updateTimes();
    }


    function updateTimes() {

        const total = totalSeconds();
        $("mpStepTime").textContent = `Siguiente paso en ${state.stepRemaining} s`;
        $("mpTotalTime").textContent = `Quedan ${formatTime(total - state.elapsed)}`;
        $("mpProgressBar").style.width = `${(state.elapsed / total) * 100}%`;
    }


    function finish() {

        stopTimer();
        running = false;

        $("mpOrb").classList.remove("breathing");
        $("mpStepCount").textContent = "Meditación completada";
        $("mpText").textContent = "Lo hiciste muy bien. Puedes volver a esta pausa cada vez que la necesites.";
        $("mpStepTime").textContent = "";
        $("mpTotalTime").textContent = formatTime(totalSeconds());
        $("mpProgressBar").style.width = "100%";
        $("mpDone").hidden = false;
        $("mpRestart").hidden = true;
        setMainButton("rotate-left", "Repetir");
    }


    function setMainButton(icon, text) {

        $("mpMain").innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${text}</span>`;
    }


    function stopTimer() {

        clearInterval(timer);
        timer = null;
    }


    function totalSeconds() {

        return meditation.steps.reduce(function (sum, step) { return sum + step.seconds; }, 0);
    }


    function formatTime(seconds) {

        const minutes = Math.floor(seconds / 60);
        const rest = String(seconds % 60).padStart(2, "0");
        return `${minutes}:${rest}`;
    }


    document.addEventListener("click", function (event) {

        const trigger = event.target.closest("[data-meditation-player]");

        if (trigger) {
            open(trigger.dataset.meditationPlayer);
        }
    });

})();
