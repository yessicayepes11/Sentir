document.addEventListener("DOMContentLoaded", function () {
    initSidebar();
    initActiveNavigation();
    initProfileMenu();
    initProfileSync();
    initBreathingExercise();
    initResourceTabs();
    initActivityModal();
    initGuideModal();
    initSearch();
});


/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {
    const menuButton = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuButton || !sidebar || !overlay) {
        return;
    }

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("active");

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

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

    document.querySelectorAll(".menu-item").forEach(function (item) {
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
   OPCIÓN ACTIVA
========================================================= */

function initActiveNavigation() {
    const links = document.querySelectorAll(".menu-item");

    const currentPath = normalizePath(
        window.location.pathname
    );

    links.forEach(function (link) {
        link.classList.remove("active");
        link.removeAttribute("aria-current");

        const href = link.getAttribute("href");

        if (!href) return;

        const linkPath = normalizePath(
            new URL(
                href,
                window.location.origin
            ).pathname
        );

        const resourceMatch =
            link.dataset.page === "recursos" &&
            (
                currentPath.includes("/resources/") ||
                currentPath.includes("/relaxation/")
            );

        if (
            currentPath === linkPath ||
            resourceMatch
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
   PERFIL
========================================================= */

function initProfileMenu() {
    const button = document.getElementById("profileButton");
    const menu = document.getElementById("profileMenu");

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

    /*
        También se puede llamar desde
        StudentProfile.js:
        
        window.SentirProfile.refresh();
    */

    window.SentirProfile = {
        refresh: function () {
            loadProfilePhoto();
            loadStudentName();
        }
    };
}


function loadProfilePhoto() {
    const photo =
        localStorage.getItem(
            PROFILE_PHOTO_KEY
        );

    document
        .querySelectorAll(
            "[data-profile-avatar]"
        )
        .forEach(function (avatar) {
            const image =
                avatar.querySelector(
                    ".profile-avatar-image"
                );

            const fallback =
                avatar.querySelector(
                    ".profile-avatar-fallback"
                );

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
        localStorage.getItem(
            STUDENT_NAME_KEY
        ) || "Ana";

    document
        .querySelectorAll(
            "[data-student-name]"
        )
        .forEach(function (element) {
            element.textContent = name;
        });

    const initial =
        name.trim()
            .charAt(0)
            .toUpperCase() || "A";

    document
        .querySelectorAll(
            ".profile-avatar-fallback"
        )
        .forEach(function (element) {
            element.textContent = initial;
        });
}


/* =========================================================
   RESPIRACIÓN
========================================================= */

let breathingRunning = false;
let breathingTimeout = null;

let currentCycle = 1;
const totalCycles = 5;


function initBreathingExercise() {
    const startButton =
        document.getElementById(
            "startBreathing"
        );

    if (!startButton) {
        return;
    }

    startButton.addEventListener(
        "click",
        function () {
            if (breathingRunning) {
                stopBreathingExercise();
            } else {
                startBreathingExercise();
            }
        }
    );
}


function startBreathingExercise() {
    breathingRunning = true;
    currentCycle = 1;

    updateStartButton(true);

    runInhale();
}


function stopBreathingExercise() {
    breathingRunning = false;

    clearTimeout(
        breathingTimeout
    );

    const circle =
        document.getElementById(
            "breathingCircle"
        );

    const action =
        document.getElementById(
            "breathingAction"
        );

    const cycle =
        document.getElementById(
            "breathingCycle"
        );

    circle?.classList.remove(
        "inhale",
        "hold",
        "exhale"
    );

    if (action) {
        action.textContent = "Inhala";
    }

    if (cycle) {
        cycle.textContent = "Ciclo 1 de 5";
    }

    setActiveBreathingStep(
        "inhale"
    );

    updateStartButton(false);
}


function runInhale() {
    if (!breathingRunning) return;

    const circle =
        document.getElementById(
            "breathingCircle"
        );

    const action =
        document.getElementById(
            "breathingAction"
        );

    const cycle =
        document.getElementById(
            "breathingCycle"
        );

    circle.classList.remove(
        "hold",
        "exhale"
    );

    /*
       Forzamos reflow para que
       la animación vuelva a comenzar.
    */

    void circle.offsetWidth;

    circle.classList.add(
        "inhale"
    );

    action.textContent =
        "Inhala";

    cycle.textContent =
        `Ciclo ${currentCycle} de ${totalCycles}`;

    setActiveBreathingStep(
        "inhale"
    );

    breathingTimeout =
        setTimeout(
            runHold,
            4000
        );
}


function runHold() {
    if (!breathingRunning) return;

    const circle =
        document.getElementById(
            "breathingCircle"
        );

    const action =
        document.getElementById(
            "breathingAction"
        );

    circle.classList.remove(
        "inhale",
        "exhale"
    );

    circle.classList.add(
        "hold"
    );

    action.textContent =
        "Sostén";

    setActiveBreathingStep(
        "hold"
    );

    breathingTimeout =
        setTimeout(
            runExhale,
            4000
        );
}


function runExhale() {
    if (!breathingRunning) return;

    const circle =
        document.getElementById(
            "breathingCircle"
        );

    const action =
        document.getElementById(
            "breathingAction"
        );

    circle.classList.remove(
        "inhale",
        "hold"
    );

    circle.classList.add(
        "exhale"
    );

    action.textContent =
        "Exhala";

    setActiveBreathingStep(
        "exhale"
    );

    breathingTimeout =
        setTimeout(
            function () {

                if (!breathingRunning) {
                    return;
                }

                if (
                    currentCycle >=
                    totalCycles
                ) {
                    finishBreathingExercise();
                    return;
                }

                currentCycle++;

                runInhale();

            },
            6000
        );
}


function finishBreathingExercise() {
    breathingRunning = false;

    clearTimeout(
        breathingTimeout
    );

    const circle =
        document.getElementById(
            "breathingCircle"
        );

    const action =
        document.getElementById(
            "breathingAction"
        );

    const cycle =
        document.getElementById(
            "breathingCycle"
        );

    circle.classList.remove(
        "inhale",
        "hold",
        "exhale"
    );

    if (action) {
        action.textContent =
            "Muy bien 💜";
    }

    if (cycle) {
        cycle.textContent =
            "Ejercicio completado";
    }

    setActiveBreathingStep("");

    updateStartButton(false);

    saveCompletedBreathing();

    showToast(
        "¡Muy bien! Completaste tu ejercicio de respiración."
    );
}


function setActiveBreathingStep(step) {
    document
        .querySelectorAll(
            ".breathing-step"
        )
        .forEach(function (element) {
            element.classList.toggle(
                "active",
                element.dataset.step === step
            );
        });
}


function updateStartButton(running) {
    const button =
        document.getElementById(
            "startBreathing"
        );

    if (!button) return;

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


function saveCompletedBreathing() {
    const stored =
        Number(
            localStorage.getItem(
                "sentirCompletedBreathing"
            ) || "0"
        );

    localStorage.setItem(
        "sentirCompletedBreathing",
        String(stored + 1)
    );
}


/* =========================================================
   TABS
========================================================= */

function initResourceTabs() {
    const tabs =
        document.querySelectorAll(
            ".resource-tab"
        );

    const contents = {
        breathing:
            document.getElementById(
                "breathingContent"
            ),

        meditations:
            document.getElementById(
                "meditationsContent"
            ),

        psychologist:
            document.getElementById(
                "psychologistContent"
            )
    };

    tabs.forEach(function (tab) {
        tab.addEventListener(
            "click",
            function () {
                const category =
                    tab.dataset.category;

                tabs.forEach(
                    function (item) {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                Object.values(
                    contents
                ).forEach(function (content) {
                    content?.classList.remove(
                        "active"
                    );
                });

                tab.classList.add(
                    "active"
                );

                contents[
                    category
                ]?.classList.add(
                    "active"
                );
            }
        );
    });
}


/* =========================================================
   ACTIVITY MODAL
========================================================= */

function initActivityModal() {
    const modal =
        document.getElementById(
            "activityModal"
        );

    const close =
        document.getElementById(
            "closeActivityModal"
        );

    const title =
        document.getElementById(
            "activityTitle"
        );

    const duration =
        document.getElementById(
            "activityDuration"
        );

    const description =
        document.getElementById(
            "activityDescription"
        );

    const modalStart =
        document.getElementById(
            "modalStartExercise"
        );

    document
        .querySelectorAll(
            ".play-resource"
        )
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    /*
                       El botón de psicóloga también
                       usa .play-resource.
                    */

                    const activity =
                        button.dataset.activity;

                    if (!activity) {
                        return;
                    }

                    title.textContent =
                        activity;

                    duration.textContent =
                        button.dataset.duration ||
                        "Actividad";

                    description.textContent =
                        button.dataset.description ||
                        "";

                    openModal(
                        modal
                    );
                }
            );
        });

    close?.addEventListener(
        "click",
        function () {
            closeModal(
                modal
            );
        }
    );

    modal?.addEventListener(
        "click",
        function (event) {
            if (
                event.target ===
                modal
            ) {
                closeModal(
                    modal
                );
            }
        }
    );

    modalStart?.addEventListener(
        "click",
        function () {
            closeModal(
                modal
            );

            document
                .querySelector(
                    ".breathing-section"
                )
                ?.scrollIntoView({
                    behavior:
                        "smooth",
                    block:
                        "center"
                });

            if (!breathingRunning) {
                startBreathingExercise();
            }
        }
    );
}


/* =========================================================
   GUIDE MODAL
========================================================= */

function initGuideModal() {
    const button =
        document.getElementById(
            "openGuide"
        );

    const modal =
        document.getElementById(
            "guideModal"
        );

    const close =
        document.getElementById(
            "closeGuide"
        );

    const start =
        document.getElementById(
            "guideStart"
        );

    button?.addEventListener(
        "click",
        function () {
            openModal(
                modal
            );
        }
    );

    close?.addEventListener(
        "click",
        function () {
            closeModal(
                modal
            );
        }
    );

    modal?.addEventListener(
        "click",
        function (event) {
            if (
                event.target ===
                modal
            ) {
                closeModal(
                    modal
                );
            }
        }
    );

    start?.addEventListener(
        "click",
        function () {
            closeModal(
                modal
            );

            if (!breathingRunning) {
                startBreathingExercise();
            }
        }
    );
}


/* =========================================================
   SEARCH
========================================================= */

function initSearch() {
    const search =
        document.getElementById(
            "resourceSearch"
        );

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        function () {
            const query =
                normalizeText(
                    search.value
                );

            document
                .querySelectorAll(
                    ".resource-card"
                )
                .forEach(function (card) {
                    const cardText =
                        normalizeText(
                            card.textContent
                        );

                    card.style.display =
                        !query ||
                        cardText.includes(
                            query
                        )
                            ? ""
                            : "none";
                });
        }
    );
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
   MODAL HELPERS
========================================================= */

function openModal(modal) {
    if (!modal) return;

    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove(
        "show"
    );

    if (
        !document.querySelector(
            ".modal-overlay.show"
        )
    ) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}


document.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        document
            .querySelectorAll(
                ".modal-overlay.show"
            )
            .forEach(function (modal) {
                closeModal(
                    modal
                );
            });
    }
);


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {
    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;

    clearTimeout(
        toastTimer
    );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    toastTimer =
        setTimeout(
            function () {
                toast.classList.remove(
                    "show"
                );
            },
            2800
        );
}