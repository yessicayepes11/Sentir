document.addEventListener("DOMContentLoaded", function () {

    initSidebar();

    initActiveNavigation();

    initProfileMenu();

    initProfileSync();

    initBreathingExercises();

    initResourceTabs();

    initActivityButtons();

    initVideos();

    initSearch();

});


/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {

    const menuButton =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (!menuButton || !sidebar || !overlay) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add("open");

        overlay.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeSidebar() {

        sidebar.classList.remove("open");

        overlay.classList.remove("active");

        document.body.style.overflow = "";

    }


    menuButton.addEventListener("click", function () {

        if (sidebar.classList.contains("open")) {

            closeSidebar();

        } else {

            openSidebar();

        }

    });


    overlay.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            item.addEventListener("click", function () {

                if (window.innerWidth <= 920) {

                    closeSidebar();

                }

            });

        });


    window.addEventListener("resize", function () {

        if (window.innerWidth > 920) {

            closeSidebar();

        }

    });

}


/* =========================================================
   SIDEBAR ACTIVO
========================================================= */

function initActiveNavigation() {

    const links =
        document.querySelectorAll(".menu-item");


    const currentPath =
        normalizePath(window.location.pathname);


    links.forEach(function (link) {

        link.classList.remove("active");

        link.removeAttribute("aria-current");


        const href =
            link.getAttribute("href");


        if (!href) {
            return;
        }


        const linkPath =
            normalizePath(
                new URL(
                    href,
                    window.location.origin
                ).pathname
            );


        const resourcesMatch =
            link.dataset.page === "recursos" &&
            (
                currentPath.includes("/resources/") ||
                currentPath.includes("/relaxation/")
            );


        if (
            currentPath === linkPath ||
            resourcesMatch
        ) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );

        }

    });

}


function normalizePath(path) {

    return (path || "")
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+/g, "/")
        .replace(/\/$/, "")
        .toLowerCase();

}


/* =========================================================
   PROFILE MENU
========================================================= */

function initProfileMenu() {

    const button =
        document.getElementById("profileButton");


    const menu =
        document.getElementById("profileMenu");


    if (!button || !menu) {
        return;
    }


    button.addEventListener("click", function (event) {

        event.stopPropagation();


        const open =
            !menu.classList.contains("show");


        menu.classList.toggle(
            "show",
            open
        );


        button.classList.toggle(
            "is-open",
            open
        );

    });


    menu.addEventListener("click", function (event) {

        event.stopPropagation();

    });


    document.addEventListener("click", function () {

        menu.classList.remove("show");

        button.classList.remove("is-open");

    });

}


/* =========================================================
   FOTO DE PERFIL
========================================================= */

const PROFILE_PHOTO_KEY =
    "sentirStudentProfilePhoto";


const STUDENT_NAME_KEY =
    "sentirStudentName";


function initProfileSync() {

    loadProfilePhoto();

    loadStudentName();


    window.addEventListener("storage", function (event) {

        if (event.key === PROFILE_PHOTO_KEY) {

            loadProfilePhoto();

        }


        if (event.key === STUDENT_NAME_KEY) {

            loadStudentName();

        }

    });


    window.SentirProfile = {

        refresh: function () {

            loadProfilePhoto();

            loadStudentName();

        }

    };

}


function loadProfilePhoto() {

    const photo =
        localStorage.getItem(PROFILE_PHOTO_KEY);


    document
        .querySelectorAll("[data-profile-avatar]")
        .forEach(function (avatar) {


            const image =
                avatar.querySelector(".profile-avatar-image");


            const fallback =
                avatar.querySelector(".profile-avatar-fallback");


            if (!image || !fallback) {
                return;
            }


            if (photo) {

                image.src = photo;

                image.hidden = false;

                fallback.hidden = true;

            } else {

                image.hidden = true;

                fallback.hidden = false;

            }

        });

}


function loadStudentName() {

    const name =
        localStorage.getItem(STUDENT_NAME_KEY)
        || "Ana";


    document
        .querySelectorAll("[data-student-name]")
        .forEach(function (element) {

            element.textContent = name;

        });


    const initial =
        name.trim()
            .charAt(0)
            .toUpperCase()
        || "A";


    document
        .querySelectorAll(".profile-avatar-fallback")
        .forEach(function (element) {

            element.textContent = initial;

        });

}


/* =========================================================
   RESPIRACIONES
========================================================= */

const BREATHING_EXERCISES = {

    calma: {

        inhale: 4,

        hold: 4,

        exhale: 6,

        cycles: 5,

        icon: "fa-leaf"

    },


    ansiedad: {

        inhale: 4,

        hold: 2,

        exhale: 6,

        cycles: 5,

        icon: "fa-heart"

    },


    dormir: {

        inhale: 4,

        hold: 7,

        exhale: 8,

        cycles: 4,

        icon: "fa-moon"

    }

};


let currentExercise =
    "calma";


let breathingRunning =
    false;


let breathingTimer =
    null;


let counterTimer =
    null;


let currentCycle =
    1;


/* =========================================================
   INICIAR RESPIRACIONES
========================================================= */

function initBreathingExercises() {

    const typeButtons =
        document.querySelectorAll(".breathing-type");


    const startButton =
        document.getElementById("startBreathing");


    typeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            stopBreathingExercise(false);


            currentExercise =
                button.dataset.exercise;


            typeButtons.forEach(function (item) {

                item.classList.remove("active");

            });


            button.classList.add("active");


            updateExerciseUI();

        });

    });


    startButton?.addEventListener("click", function () {

        if (breathingRunning) {

            stopBreathingExercise(true);

        } else {

            startBreathingExercise();

        }

    });


    updateExerciseUI();

}


/* =========================================================
   ACTUALIZAR EJERCICIO
========================================================= */

function updateExerciseUI() {

    const exercise =
        BREATHING_EXERCISES[currentExercise];


    document.getElementById("inhaleLabel").textContent =
        exercise.inhale + " segundos";


    document.getElementById("holdLabel").textContent =
        exercise.hold + " segundos";


    document.getElementById("exhaleLabel").textContent =
        exercise.exhale + " segundos";


    const circle =
        document.getElementById("breathingCircle");


    circle.classList.remove(
        "exercise-calma",
        "exercise-ansiedad",
        "exercise-dormir"
    );


    circle.classList.add(
        "exercise-" + currentExercise
    );


    const icon =
        document.getElementById("breathingIcon");


    icon.className =
        "fa-solid " + exercise.icon;


    resetBreathingDisplay();

}


/* =========================================================
   COMENZAR
========================================================= */

function startBreathingExercise() {

    breathingRunning = true;

    currentCycle = 1;


    updateStartButton(true);


    runPhase(
        "inhale"
    );

}


/* =========================================================
   FASE
========================================================= */

function runPhase(phase) {

    if (!breathingRunning) {
        return;
    }


    const exercise =
        BREATHING_EXERCISES[currentExercise];


    const seconds =
        exercise[phase];


    const circle =
        document.getElementById("breathingCircle");


    circle.classList.remove(
        "phase-inhale",
        "phase-hold",
        "phase-exhale",
        "running"
    );


    void circle.offsetWidth;


    circle.classList.add(
        "phase-" + phase,
        "running"
    );


    circle.style.setProperty(
        "--phase-duration",
        seconds + "s"
    );


    updateActiveStep(
        phase
    );


    updateBreathingText(
        phase,
        seconds
    );


    startCountdown(
        seconds
    );


    breathingTimer =
        setTimeout(function () {

            if (phase === "inhale") {

                runPhase("hold");

                return;

            }


            if (phase === "hold") {

                runPhase("exhale");

                return;

            }


            if (
                currentCycle >=
                exercise.cycles
            ) {

                finishBreathingExercise();

                return;

            }


            currentCycle++;


            runPhase("inhale");

        }, seconds * 1000);

}


/* =========================================================
   CUENTA REGRESIVA
========================================================= */

function startCountdown(seconds) {

    clearInterval(counterTimer);


    const counter =
        document.getElementById("breathingCounter");


    let remaining =
        seconds;


    counter.textContent =
        remaining + " segundos";


    counterTimer =
        setInterval(function () {

            remaining--;


            if (remaining <= 0) {

                clearInterval(counterTimer);

                return;

            }


            counter.textContent =
                remaining + " segundos";

        }, 1000);

}


/* =========================================================
   TEXTO
========================================================= */

function updateBreathingText(
    phase,
    seconds
) {

    const action =
        document.getElementById("breathingAction");


    const cycle =
        document.getElementById("breathingCycle");


    const exercise =
        BREATHING_EXERCISES[currentExercise];


    if (phase === "inhale") {

        action.textContent =
            "Inhala";

    }


    if (phase === "hold") {

        action.textContent =
            "Sostén";

    }


    if (phase === "exhale") {

        action.textContent =
            "Exhala";

    }


    cycle.textContent =
        "Ciclo "
        + currentCycle
        + " de "
        + exercise.cycles;

}


/* =========================================================
   STEP ACTIVO
========================================================= */

function updateActiveStep(step) {

    document
        .querySelectorAll(".breathing-step")
        .forEach(function (item) {

            item.classList.toggle(
                "active",
                item.dataset.step === step
            );

        });

}


/* =========================================================
   TERMINAR
========================================================= */

function finishBreathingExercise() {

    breathingRunning = false;


    clearTimeout(
        breathingTimer
    );


    clearInterval(
        counterTimer
    );


    const circle =
        document.getElementById("breathingCircle");


    circle.classList.remove(
        "running"
    );


    document.getElementById("breathingAction").textContent =
        "Muy bien 💜";


    document.getElementById("breathingCounter").textContent =
        "Terminaste";


    document.getElementById("breathingCycle").textContent =
        "Ejercicio completado";


    updateStartButton(false);


    showToast(
        "¡Muy bien! Terminaste tu ejercicio de respiración."
    );


    const completed =
        Number(
            localStorage.getItem(
                "sentirCompletedBreathing"
            ) || "0"
        );


    localStorage.setItem(
        "sentirCompletedBreathing",
        String(completed + 1)
    );

}


/* =========================================================
   DETENER
========================================================= */

function stopBreathingExercise(
    resetText = true
) {

    breathingRunning = false;


    clearTimeout(
        breathingTimer
    );


    clearInterval(
        counterTimer
    );


    const circle =
        document.getElementById("breathingCircle");


    circle?.classList.remove(
        "running"
    );


    if (resetText) {

        resetBreathingDisplay();

    }


    updateStartButton(false);

}


/* =========================================================
   RESET
========================================================= */

function resetBreathingDisplay() {

    const exercise =
        BREATHING_EXERCISES[currentExercise];


    currentCycle = 1;


    const circle =
        document.getElementById("breathingCircle");


    circle.classList.remove(
        "phase-hold",
        "phase-exhale",
        "running"
    );


    circle.classList.add(
        "phase-inhale"
    );


    document.getElementById("breathingAction").textContent =
        "Inhala";


    document.getElementById("breathingCounter").textContent =
        exercise.inhale + " segundos";


    document.getElementById("breathingCycle").textContent =
        "Ciclo 1 de " + exercise.cycles;


    updateActiveStep(
        "inhale"
    );

}


/* =========================================================
   BOTÓN START
========================================================= */

function updateStartButton(running) {

    const button =
        document.getElementById("startBreathing");


    if (!button) {
        return;
    }


    if (running) {

        button.innerHTML = `
            <i class="fa-solid fa-stop"></i>
            <span>Detener ejercicio</span>
        `;

    } else {

        button.innerHTML = `
            <i class="fa-solid fa-play"></i>
            <span>Comenzar ejercicio</span>
        `;

    }

}


/* =========================================================
   BOTONES DE ACTIVIDADES
========================================================= */

function initActivityButtons() {

    document
        .querySelectorAll("[data-exercise-button]")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const exercise =
                    button.dataset.exerciseButton;


                selectExercise(
                    exercise
                );


                document
                    .querySelector(".breathing-panel")
                    ?.scrollIntoView({

                        behavior: "smooth",

                        block: "center"

                    });


                setTimeout(function () {

                    startBreathingExercise();

                }, 500);

            });

        });

}


/* =========================================================
   SELECCIONAR EJERCICIO
========================================================= */

function selectExercise(exercise) {

    if (!BREATHING_EXERCISES[exercise]) {
        return;
    }


    stopBreathingExercise(false);


    currentExercise =
        exercise;


    document
        .querySelectorAll(".breathing-type")
        .forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.exercise === exercise
            );

        });


    updateExerciseUI();

}


/* =========================================================
   TABS
========================================================= */

function initResourceTabs() {

    const buttons =
        document.querySelectorAll(".resource-tab");


    const contents = {

        breathing:
            document.getElementById("breathingContent"),

        meditations:
            document.getElementById("meditationsContent"),

        psychologist:
            document.getElementById("psychologistContent")

    };


    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const category =
                button.dataset.category;


            buttons.forEach(function (item) {

                item.classList.remove("active");

            });


            Object
                .values(contents)
                .forEach(function (content) {

                    content?.classList.remove("active");

                });


            button.classList.add("active");


            contents[category]?.classList.add("active");

        });

    });

}


/* =========================================================
   VIDEOS
========================================================= */

function initVideos() {

    const modal =
        document.getElementById("videoModal");


    const iframe =
        document.getElementById("resourceVideo");


    const title =
        document.getElementById("videoModalTitle");


    const description =
        document.getElementById("videoModalDescription");


    const close =
        document.getElementById("closeVideoModal");


    if (!modal || !iframe) {
        return;
    }


    document
        .querySelectorAll(".video-play")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const videoURL =
                    button.dataset.videoUrl;


                const videoTitle =
                    button.dataset.videoTitle;


                const videoDescription =
                    button.dataset.videoDescription;


                if (
                    !videoURL ||
                    videoURL.includes("VIDEO_ID")
                ) {

                    showToast(
                        "Solo falta colocar el enlace del video de YouTube."
                    );

                    return;

                }


                title.textContent =
                    videoTitle;


                description.textContent =
                    videoDescription;


                const separator =
                    videoURL.includes("?")
                        ? "&"
                        : "?";


                iframe.src =
                    videoURL
                    + separator
                    + "autoplay=1&rel=0";


                modal.classList.add("show");


                document.body.classList.add(
                    "modal-open"
                );

            });

        });


    close?.addEventListener("click", function () {

        closeVideo();

    });


    modal.addEventListener("click", function (event) {

        if (event.target === modal) {

            closeVideo();

        }

    });


    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            modal.classList.contains("show")
        ) {

            closeVideo();

        }

    });


    function closeVideo() {

        iframe.src = "";


        modal.classList.remove("show");


        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function initSearch() {

    const search =
        document.getElementById("resourceSearch");


    if (!search) {
        return;
    }


    search.addEventListener("input", function () {

        const query =
            normalizeText(search.value);


        document
            .querySelectorAll(
                ".activity-card, .video-card"
            )
            .forEach(function (card) {

                const text =
                    normalizeText(
                        card.textContent
                    );


                card.style.display =
                    !query ||
                    text.includes(query)
                        ? ""
                        : "none";

            });

    });

}


function normalizeText(text) {

    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    if (!toast) {
        return;
    }


    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(function () {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}