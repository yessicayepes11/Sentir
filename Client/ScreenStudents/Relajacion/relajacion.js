/* =====================================================
   SENTIR - RELAJACIÓN
   ===================================================== */


/* =====================================================
   ELEMENTOS
   ===================================================== */

const breathingCircle =
    document.getElementById("breathingCircle");

const breathingText =
    document.getElementById("breathingText");

const breathingTimer =
    document.getElementById("breathingTimer");

const instructionTitle =
    document.getElementById("instructionTitle");

const instructionText =
    document.getElementById("instructionText");

const instructionIcon =
    document.getElementById("instructionIcon");

const startButton =
    document.getElementById("startBreathing");

const resetButton =
    document.getElementById("resetBreathing");

const status =
    document.getElementById("exerciseStatus");

const progressFill =
    document.getElementById("progressFill");

const progressPercent =
    document.getElementById("progressPercent");

const resourceButtons =
    document.querySelectorAll(".resource-item");


/* =====================================================
   CONFIGURACIÓN
   ===================================================== */

/*
    Cada ciclo tiene:

    INHALAR → 4 segundos
    MANTENER → 4 segundos
    EXHALAR → 6 segundos

    Total = 14 segundos.
*/

const phases = [

    {
        name: "Inhala",
        seconds: 4,
        instruction:
            "Respira lentamente por la nariz.",
        icon: "🌬️",
        scale: true
    },

    {
        name: "Mantén",
        seconds: 4,
        instruction:
            "Mantén el aire suavemente.",
        icon: "✨",
        scale: true
    },

    {
        name: "Exhala",
        seconds: 6,
        instruction:
            "Suelta el aire lentamente.",
        icon: "🍃",
        scale: false
    }

];

const totalCycles = 3;

let currentPhase = 0;
let currentSecond = 0;
let currentCycle = 0;

let timerInterval = null;

let running = false;


/* =====================================================
   ACTUALIZAR FASE
   ===================================================== */

function updatePhase() {

    const phase = phases[currentPhase];

    currentSecond = phase.seconds;

    breathingText.textContent =
        phase.name;

    breathingTimer.textContent =
        currentSecond;

    instructionTitle.textContent =
        phase.name;

    instructionText.textContent =
        phase.instruction;

    instructionIcon.textContent =
        phase.icon;

    /*
        La escala del círculo cambia según
        la fase de respiración.
    */

    if (phase.scale) {

        breathingCircle.classList.add("active");

    } else {

        breathingCircle.classList.remove("active");

    }

}


/* =====================================================
   ACTUALIZAR PROGRESO
   ===================================================== */

function updateProgress() {

    const completedPhases =
        (currentCycle * phases.length) + currentPhase;

    const totalPhases =
        totalCycles * phases.length;

    const percentage =
        Math.round(
            (completedPhases / totalPhases) * 100
        );

    progressFill.style.width =
        `${percentage}%`;

    progressPercent.textContent =
        `${percentage}%`;
}


/* =====================================================
   FINALIZAR SESIÓN
   ===================================================== */

function finishSession() {

    clearInterval(timerInterval);

    timerInterval = null;

    running = false;

    breathingCircle.classList.remove("active");

    breathingText.textContent =
        "¡Listo!";

    breathingTimer.textContent =
        "✓";

    instructionIcon.textContent =
        "💜";

    instructionTitle.textContent =
        "Terminaste tu sesión";

    instructionText.textContent =
        "Muy bien. Date un momento para reconocer cómo te sientes.";

    status.textContent =
        "Completado";

    progressFill.style.width =
        "100%";

    progressPercent.textContent =
        "100%";

    startButton.textContent =
        "Comenzar de nuevo";

}


/* =====================================================
   SIGUIENTE FASE
   ===================================================== */

function nextPhase() {

    currentPhase++;

    if (currentPhase >= phases.length) {

        currentPhase = 0;

        currentCycle++;

        if (currentCycle >= totalCycles) {

            finishSession();

            return;
        }
    }

    updatePhase();

    updateProgress();
}


/* =====================================================
   TEMPORIZADOR
   ===================================================== */

function startTimer() {

    if (running) {
        return;
    }

    running = true;

    status.textContent =
        "En progreso";

    startButton.textContent =
        "En progreso...";

    updatePhase();

    updateProgress();

    timerInterval = setInterval(() => {

        currentSecond--;

        breathingTimer.textContent =
            currentSecond;

        if (currentSecond <= 0) {

            nextPhase();

        }

    }, 1000);

}


/* =====================================================
   BOTÓN COMENZAR
   ===================================================== */

startButton.addEventListener(
    "click",
    () => {

        if (!running) {

            /*
                Si la sesión terminó,
                comenzamos nuevamente.
            */

            if (currentCycle >= totalCycles) {

                resetExercise();

            }

            startTimer();

        }

    }
);


/* =====================================================
   REINICIAR
   ===================================================== */

function resetExercise() {

    clearInterval(timerInterval);

    timerInterval = null;

    running = false;

    currentPhase = 0;

    currentSecond = 0;

    currentCycle = 0;

    breathingCircle.classList.remove("active");

    breathingText.textContent =
        "Prepárate";

    breathingTimer.textContent =
        "00";

    instructionIcon.textContent =
        "🫁";

    instructionTitle.textContent =
        "Comienza cuando estés listo/a";

    instructionText.textContent =
        "Sigue el ritmo del círculo y concéntrate en tu respiración.";

    status.textContent =
        "Listo";

    startButton.textContent =
        "Comenzar";

    progressFill.style.width =
        "0%";

    progressPercent.textContent =
        "0%";

}

resetButton.addEventListener(
    "click",
    resetExercise
);


/* =====================================================
   RECURSOS
   ===================================================== */

resourceButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            resourceButtons.forEach(
                item => item.classList.remove("active")
            );

            button.classList.add("active");

            const resource =
                button.dataset.resource;

            changeResource(resource);

        }
    );

});


/* =====================================================
   CAMBIAR RECURSO
   ===================================================== */

function changeResource(resource) {

    if (resource === "respiracion") {

        instructionIcon.textContent =
            "🫁";

        instructionTitle.textContent =
            "Respiración consciente";

        instructionText.textContent =
            "Utiliza el ejercicio para concentrarte en tu respiración.";

    }

    if (resource === "meditacion") {

        instructionIcon.textContent =
            "🧘";

        instructionTitle.textContent =
            "Espacio de meditación";

        instructionText.textContent =
            "Busca una posición cómoda y dedica unos minutos a estar presente.";

    }

    if (resource === "consejos") {

        instructionIcon.textContent =
            "✦";

        instructionTitle.textContent =
            "Consejo para tu bienestar";

        instructionText.textContent =
            "Regálate pequeños momentos durante el día para descansar y respirar.";

    }

}


/* =====================================================
   MENÚ
   ===================================================== */

const menuButton =
    document.getElementById("menuButton");

menuButton.addEventListener(
    "click",
    () => {

        /*
            Aquí posteriormente podemos conectar
            el menú lateral de la aplicación Sentir.

            Por ahora se utiliza como interacción
            visual para no romper la estructura.
        */

        menuButton.classList.toggle("active");

    }
);


/* =====================================================
   INICIO
   ===================================================== */

updateProgress();