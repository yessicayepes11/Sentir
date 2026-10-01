/* =========================================================
   REPRODUCTOR DE EJERCICIOS DE RESPIRACIÓN (apartado "Respiraciones")

   Cada tarjeta con  data-breathing-player="<id>"  abre una ventana
   donde se desarrolla el ejercicio: círculo animado, fase actual,
   cuenta regresiva, ciclos y botones de pausar / reiniciar.

   Las fases usan:
     grow   -> el círculo crece   (inhalar)
     shrink -> el círculo se achica (exhalar)
     hold   -> el círculo se queda quieto (sostener)
========================================================= */

(function () {

    const EXERCISES = {

        cuadrada: {
            title: "Respiración cuadrada",
            icon: "fa-vector-square",
            color: "#6c4df6",
            description: "Imagina que dibujas un cuadrado: cada lado dura 4 segundos.",
            benefit: "Te ayuda a concentrarte y a calmar los nervios antes de un examen o una presentación.",
            cycles: 8,
            phases: [
                { label: "Inhala por la nariz", seconds: 4, motion: "grow" },
                { label: "Sostén el aire", seconds: 4, motion: "hold" },
                { label: "Exhala por la boca", seconds: 4, motion: "shrink" },
                { label: "Sostén sin aire", seconds: 4, motion: "hold" }
            ]
        },

        olas: {
            title: "Olas del mar",
            icon: "fa-water",
            color: "#3b9ce8",
            description: "Respira como una ola que llega y se va: suave, continua y sin pausas.",
            benefit: "Equilibra tu cuerpo y tu mente. Muy bueno cuando te sientes inquieto o con muchas emociones.",
            cycles: 12,
            phases: [
                { label: "La ola llega: inhala", seconds: 5, motion: "grow" },
                { label: "La ola se va: exhala", seconds: 5, motion: "shrink" }
            ]
        },

        suspiro: {
            title: "Suspiro de alivio",
            icon: "fa-feather",
            color: "#e978d1",
            description: "Toma aire por la nariz, toma un poquito más y suéltalo todo despacio por la boca.",
            benefit: "Es la forma más rápida de soltar la tensión cuando sientes que el pecho se aprieta.",
            cycles: 6,
            phases: [
                { label: "Inhala por la nariz", seconds: 2, motion: "grow", scale: 0.85 },
                { label: "Inhala un poquito más", seconds: 1, motion: "grow" },
                { label: "Suelta el aire por la boca", seconds: 6, motion: "shrink" }
            ]
        },

        abeja: {
            title: "Respiración de la abeja",
            icon: "fa-music",
            color: "#f0a530",
            description: "Inhala por la nariz y al exhalar haz un zumbido suave con la boca cerrada: \"mmmm\", como una abeja.",
            benefit: "La vibración del zumbido calma la mente. Útil cuando sientes enojo o tienes muchos pensamientos.",
            cycles: 10,
            phases: [
                { label: "Inhala por la nariz", seconds: 4, motion: "grow" },
                { label: "Exhala zumbando \"mmmm\"", seconds: 8, motion: "shrink", buzz: true }
            ]
        }
    };

    const SCALE_MIN = 0.55;
    const SCALE_MAX = 1;

    const MODAL_HTML = `
<div class="bp-box" role="dialog" aria-modal="true" aria-labelledby="bpTitle">

    <button class="bp-close" type="button" id="bpClose" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="bp-header">
        <div class="bp-icon" id="bpIcon"><i class="fa-solid"></i></div>
        <div>
            <h2 id="bpTitle"></h2>
            <p id="bpDescription"></p>
        </div>
    </div>

    <div class="bp-stage">
        <div class="bp-ring">
            <div class="bp-circle" id="bpCircle">
                <strong id="bpCounter">—</strong>
            </div>
        </div>
        <p class="bp-phase" id="bpPhase" aria-live="polite">Pulsa "Comenzar" cuando estés listo</p>
        <p class="bp-cycle" id="bpCycle"></p>
    </div>

    <ol class="bp-steps" id="bpSteps"></ol>

    <p class="bp-benefit" id="bpBenefit"></p>

    <div class="bp-done" id="bpDone" hidden>
        <i class="fa-solid fa-circle-check"></i>
        <strong>¡Muy bien, terminaste!</strong>
        <span>Fíjate cómo se siente tu cuerpo ahora.</span>
    </div>

    <div class="bp-actions">
        <button class="bp-main" type="button" id="bpMain">
            <i class="fa-solid fa-play"></i>
            <span>Comenzar</span>
        </button>
        <button class="bp-secondary" type="button" id="bpRestart" hidden>
            <i class="fa-solid fa-rotate-left"></i>
            Reiniciar
        </button>
    </div>

</div>`;

    let modal;
    let exercise = null;
    let state = null;   // { cycle, phaseIndex, remaining }
    let timer = null;
    let running = false;


    function $(id) {
        return document.getElementById(id);
    }


    function createModal() {

        modal = document.createElement("div");
        modal.className = "bp-overlay";
        modal.id = "breathingPlayer";
        modal.innerHTML = MODAL_HTML;
        document.body.appendChild(modal);

        $("bpClose").addEventListener("click", close);
        $("bpMain").addEventListener("click", toggle);
        $("bpRestart").addEventListener("click", restart);

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

        if (!EXERCISES[id]) {
            return;
        }

        if (!modal) {
            createModal();
        }

        exercise = EXERCISES[id];
        modal.style.setProperty("--bp-color", exercise.color);

        $("bpIcon").innerHTML = `<i class="fa-solid ${exercise.icon}"></i>`;
        $("bpTitle").textContent = exercise.title;
        $("bpDescription").textContent = exercise.description;
        $("bpBenefit").textContent = exercise.benefit;

        $("bpSteps").innerHTML = exercise.phases
            .map(function (phase) {
                return `<li><span>${phase.label}</span><b>${phase.seconds} s</b></li>`;
            })
            .join("");

        reset();

        modal.classList.add("show");
        document.body.classList.add("bp-open");
        $("bpMain").focus();
    }


    function close() {

        stopTimer();
        running = false;
        modal.classList.remove("show");
        document.body.classList.remove("bp-open");
    }


    function reset() {

        stopTimer();
        running = false;
        state = { cycle: 1, phaseIndex: 0, remaining: exercise.phases[0].seconds };

        setCircle(SCALE_MIN, 0);
        $("bpCircle").classList.remove("buzz");
        $("bpCounter").textContent = "—";
        $("bpPhase").textContent = 'Pulsa "Comenzar" cuando estés listo';
        $("bpCycle").textContent = `${exercise.cycles} ciclos · ${totalTime()}`;
        $("bpDone").hidden = true;
        $("bpRestart").hidden = true;
        highlightStep(-1);
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

        if (!$("bpDone").hidden) {
            reset();
        }

        running = true;
        $("bpRestart").hidden = false;
        setMainButton("pause", "Pausar");
        startPhase();
        timer = setInterval(tick, 1000);
    }


    function pause() {

        running = false;
        stopTimer();

        // Congela el círculo donde va
        const circle = $("bpCircle");
        const current = getComputedStyle(circle).transform;
        circle.style.transition = "none";
        circle.style.transform = current === "none" ? "" : current;
        circle.classList.remove("buzz");

        $("bpPhase").textContent = "En pausa";
        setMainButton("play", "Continuar");
    }


    function startPhase() {

        const phase = exercise.phases[state.phaseIndex];

        $("bpPhase").textContent = phase.label;
        $("bpCounter").textContent = state.remaining;
        $("bpCycle").textContent = `Ciclo ${state.cycle} de ${exercise.cycles}`;
        $("bpCircle").classList.toggle("buzz", Boolean(phase.buzz));
        highlightStep(state.phaseIndex);

        if (phase.motion === "grow") {
            setCircle(phase.scale || SCALE_MAX, state.remaining);
        } else if (phase.motion === "shrink") {
            setCircle(SCALE_MIN, state.remaining);
        } else {
            // hold: el círculo se queda donde está
            const circle = $("bpCircle");
            const current = getComputedStyle(circle).transform;
            circle.style.transition = "none";
            circle.style.transform = current === "none" ? "" : current;
        }
    }


    function tick() {

        state.remaining -= 1;

        if (state.remaining > 0) {
            $("bpCounter").textContent = state.remaining;
            return;
        }

        // Siguiente fase
        state.phaseIndex += 1;

        if (state.phaseIndex >= exercise.phases.length) {
            state.phaseIndex = 0;
            state.cycle += 1;

            if (state.cycle > exercise.cycles) {
                finish();
                return;
            }
        }

        state.remaining = exercise.phases[state.phaseIndex].seconds;
        startPhase();
    }


    function finish() {

        stopTimer();
        running = false;

        setCircle(SCALE_MIN, 1.5);
        $("bpCircle").classList.remove("buzz");
        $("bpCounter").innerHTML = '<i class="fa-solid fa-check"></i>';
        $("bpPhase").textContent = "Ejercicio completado";
        $("bpCycle").textContent = `${exercise.cycles} ciclos completados`;
        $("bpDone").hidden = false;
        $("bpRestart").hidden = true;
        highlightStep(-1);
        setMainButton("rotate-left", "Repetir");
    }


    function setCircle(scale, seconds) {

        const circle = $("bpCircle");
        circle.style.transition = seconds > 0 ? `transform ${seconds}s ease-in-out` : "none";
        circle.style.transform = `scale(${scale})`;
    }


    function highlightStep(index) {

        $("bpSteps").querySelectorAll("li").forEach(function (item, i) {
            item.classList.toggle("active", i === index);
        });
    }


    function setMainButton(icon, text) {

        $("bpMain").innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${text}</span>`;
    }


    function stopTimer() {

        clearInterval(timer);
        timer = null;
    }


    function totalTime() {

        const seconds = exercise.cycles * exercise.phases
            .reduce(function (sum, phase) { return sum + phase.seconds; }, 0);
        const minutes = Math.floor(seconds / 60);
        const rest = seconds % 60;

        if (!minutes) {
            return `${rest} segundos`;
        }

        return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
    }


    document.addEventListener("click", function (event) {

        const trigger = event.target.closest("[data-breathing-player]");

        if (trigger) {
            open(trigger.dataset.breathingPlayer);
        }
    });

})();
