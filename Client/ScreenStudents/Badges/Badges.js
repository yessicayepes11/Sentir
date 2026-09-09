/* =====================================================
   SENTIR — SISTEMA DE INSIGNIAS
   ===================================================== */


/*
    =====================================================
    DATOS DE LAS INSIGNIAS
    =====================================================

    progress = progreso actual del usuario

    goal = cantidad necesaria para desbloquear

    La insignia se desbloquea automáticamente cuando:

        progress >= goal
*/


const badges = [

    {
        id: 1,

        name: "Primer paso",

        icon: "🌱",

        description:
            "Reconoce tu primer momento dedicado a tu bienestar.",

        reason:
            "Se obtiene al completar tu primera actividad de bienestar en Sentir.",

        progress: 1,

        goal: 1,

        color: "purple"

    },


    {
        id: 2,

        name: "Respira",

        icon: "🌬️",

        description:
            "Un reconocimiento por dedicar tiempo a respirar y relajarte.",

        reason:
            "Se obtiene al completar 3 ejercicios de respiración.",

        progress: 2,

        goal: 3,

        color: "blue"

    },


    {
        id: 3,

        name: "Me conozco",

        icon: "💜",

        description:
            "Reconoce el hábito de registrar cómo te sientes.",

        reason:
            "Se obtiene al registrar 5 entradas en tu diario emocional.",

        progress: 4,

        goal: 5,

        color: "purple"

    },


    {
        id: 4,

        name: "Momento de calma",

        icon: "☁️",

        description:
            "Un reconocimiento por crear espacios de tranquilidad.",

        reason:
            "Se obtiene al completar 5 actividades de relajación.",

        progress: 2,

        goal: 5,

        color: "blue"

    },


    {
        id: 5,

        name: "Constancia",

        icon: "✦",

        description:
            "Reconoce tu constancia en el cuidado de tu bienestar.",

        reason:
            "Se obtiene al completar 10 actividades de bienestar.",

        progress: 6,

        goal: 10,

        color: "purple"

    },


    {
        id: 6,

        name: "Conectando conmigo",

        icon: "♡",

        description:
            "Reconoce el hábito de observar y expresar tus emociones.",

        reason:
            "Se obtiene al registrar 10 estados emocionales.",

        progress: 3,

        goal: 10,

        color: "silver"

    },


    {
        id: 7,

        name: "Pausa consciente",

        icon: "🧘",

        description:
            "Reconoce que decidiste regalarte un momento para ti.",

        reason:
            "Se obtiene al completar 7 sesiones de relajación.",

        progress: 7,

        goal: 7,

        color: "blue"

    },


    {
        id: 8,

        name: "Cuidarme también importa",

        icon: "⭐",

        description:
            "Un reconocimiento por mantener hábitos de bienestar.",

        reason:
            "Se obtiene al completar 15 actividades de bienestar.",

        progress: 5,

        goal: 15,

        color: "purple"

    }

];



/* =====================================================
   ELEMENTOS HTML
   ===================================================== */

const unlockedContainer =
    document.getElementById("unlockedBadges");

const almostContainer =
    document.getElementById("almostBadges");

const lockedContainer =
    document.getElementById("lockedBadges");


const unlockedNumber =
    document.getElementById("unlockedNumber");

const lockedNumber =
    document.getElementById("lockedNumber");

const globalProgress =
    document.getElementById("globalProgress");

const unlockedCounter =
    document.getElementById("unlockedCounter");



/* =====================================================
   MODAL
   ===================================================== */

const modal =
    document.getElementById("badgeModal");

const closeModal =
    document.getElementById("closeModal");

const modalIcon =
    document.getElementById("modalIcon");

const modalTitle =
    document.getElementById("modalTitle");

const modalDescription =
    document.getElementById("modalDescription");

const modalReason =
    document.getElementById("modalReason");

const modalProgressFill =
    document.getElementById("modalProgressFill");

const modalProgressText =
    document.getElementById("modalProgressText");

const modalStatus =
    document.getElementById("modalStatus");

const modalButton =
    document.getElementById("modalButton");



/* =====================================================
   DETERMINAR ESTADO
   ===================================================== */

function getBadgeStatus(badge) {

    /*
        COMPLETAMENTE DESBLOQUEADA
    */

    if (badge.progress >= badge.goal) {

        return "unlocked";

    }


    /*
        CASI DESBLOQUEADA

        Consideramos "casi" cuando tiene
        60% o más del progreso.
    */

    const percentage =
        (badge.progress / badge.goal) * 100;


    if (percentage >= 60) {

        return "almost";

    }


    /*
        TODAVÍA BLOQUEADA
    */

    return "locked";

}



/* =====================================================
   CREAR TARJETA
   ===================================================== */

function createBadgeCard(badge) {

    const status =
        getBadgeStatus(badge);


    const percentage =
        Math.min(
            100,
            Math.round(
                (badge.progress / badge.goal) * 100
            )
        );


    const card =
        document.createElement("article");


    card.className =
        `badge-card ${badge.color}`;


    /*
        Si está bloqueada
    */

    if (status === "locked") {

        card.classList.add("locked");

    }


    /*
        ESTADO
    */

    let statusHTML = "";

    if (status === "unlocked") {

        statusHTML =
            `<span class="badge-status status-unlocked">
                DESBLOQUEADA
            </span>`;

    }

    else if (status === "almost") {

        statusHTML =
            `<span class="badge-status status-almost">
                ¡CASI!
            </span>`;

    }

    else {

        statusHTML =
            `<span class="badge-status status-locked">
                BLOQUEADA
            </span>`;

    }


    /*
        CANDADO
    */

    let lockHTML = "";

    if (status === "locked") {

        lockHTML =
            `<span class="lock">
                🔒
            </span>`;

    }


    /*
        TARJETA
    */

    card.innerHTML = `

        ${statusHTML}

        <div class="badge-icon">
            ${badge.icon}
        </div>

        ${lockHTML}

        <h3>
            ${badge.name}
        </h3>

        <p>
            ${badge.description}
        </p>

        <div class="badge-progress">

            <div class="progress-info">

                <span>
                    ${badge.progress} / ${badge.goal}
                </span>

                <span>
                    ${percentage}%
                </span>

            </div>

            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${percentage}%">
                </div>

            </div>

        </div>

    `;


    /*
        AL HACER CLICK
        SE ABRE LA INFORMACIÓN
    */

    card.addEventListener(
        "click",
        () => openModal(badge)
    );


    return card;

}



/* =====================================================
   RENDERIZAR INSIGNIAS
   ===================================================== */

function renderBadges() {

    /*
        Limpiamos los contenedores
    */

    unlockedContainer.innerHTML = "";

    almostContainer.innerHTML = "";

    lockedContainer.innerHTML = "";


    /*
        Clasificamos las insignias
    */

    const unlocked = [];

    const almost = [];

    const locked = [];


    badges.forEach(
        badge => {

            const status =
                getBadgeStatus(badge);


            if (status === "unlocked") {

                unlocked.push(badge);

            }

            else if (status === "almost") {

                almost.push(badge);

            }

            else {

                locked.push(badge);

            }

        }
    );


    /*
        Agregamos tarjetas
    */

    unlocked.forEach(
        badge => {

            unlockedContainer.appendChild(
                createBadgeCard(badge)
            );

        }
    );


    almost.forEach(
        badge => {

            almostContainer.appendChild(
                createBadgeCard(badge)
            );

        }
    );


    locked.forEach(
        badge => {

            lockedContainer.appendChild(
                createBadgeCard(badge)
            );

        }
    );


    /*
        Si no hay insignias desbloqueadas
    */

    if (unlocked.length === 0) {

        unlockedContainer.innerHTML = `
            <p class="empty-message">
                Aún no tienes insignias desbloqueadas.
            </p>
        `;

    }


    /*
        Actualizamos resumen
    */

    unlockedNumber.textContent =
        unlocked.length;

    lockedNumber.textContent =
        almost.length + locked.length;

    unlockedCounter.textContent =
        `${unlocked.length} desbloqueadas`;


    /*
        Progreso global
    */

    const totalProgress =
        badges.reduce(
            (total, badge) => {

                return total +
                    Math.min(
                        badge.progress /
                        badge.goal,
                        1
                    );

            },
            0
        );


    const averageProgress =
        Math.round(
            (totalProgress /
                badges.length) * 100
        );


    globalProgress.textContent =
        `${averageProgress}%`;

}



/* =====================================================
   MODAL
   ===================================================== */

function openModal(badge) {

    const status =
        getBadgeStatus(badge);


    const percentage =
        Math.min(
            100,
            Math.round(
                (badge.progress /
                    badge.goal) * 100
            )
        );


    /*
        INFORMACIÓN
    */

    modalIcon.textContent =
        badge.icon;

    modalTitle.textContent =
        badge.name;

    modalDescription.textContent =
        badge.description;

    modalReason.textContent =
        badge.reason;


    modalProgressFill.style.width =
        `${percentage}%`;


    modalProgressText.textContent =
        `${badge.progress} / ${badge.goal} (${percentage}%)`;


    /*
        ESTADO
    */

    if (status === "unlocked") {

        modalStatus.textContent =
            "✦ INSIGNIA DESBLOQUEADA";

        modalButton.textContent =
            "¡Genial!";

    }

    else if (status === "almost") {

        modalStatus.textContent =
            "◈ ESTÁS MUY CERCA";

        modalButton.textContent =
            "Seguir avanzando";

    }

    else {

        modalStatus.textContent =
            "🔒 POR DESBLOQUEAR";

        modalButton.textContent =
            "Entendido";

    }


    /*
        MOSTRAR MODAL
    */

    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";

}



/* =====================================================
   CERRAR MODAL
   ===================================================== */

function closeBadgeModal() {

    modal.classList.remove("show");

    document.body.style.overflow =
        "";

}


closeModal.addEventListener(
    "click",
    closeBadgeModal
);


modalButton.addEventListener(
    "click",
    closeBadgeModal
);


/*
    Cerrar haciendo click
    fuera del modal.
*/

modal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modal
        ) {

            closeBadgeModal();

        }

    }
);


/*
    Cerrar con ESC
*/

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeBadgeModal();

        }

    }
);



/* =====================================================
   MENÚ
   ===================================================== */

const menuButton =
    document.getElementById("menuButton");


menuButton.addEventListener(
    "click",
    () => {

        menuButton.classList.toggle(
            "active"
        );

    }
);



/* =====================================================
   INICIALIZAR
   ===================================================== */

renderBadges();