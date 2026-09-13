

/* =========================================================
   DATOS DE LAS 20 INSIGNIAS
========================================================= */

const badges = [

    {
        id: 1,
        title: "Primer Latido",
        description:
            "Registraste por primera vez cómo te sientes. Todo comienza con conocerte un poquito mejor.",

        category: "Primeros pasos",

        icon: "💜",

        /*
            IMAGEN CONFIGURADA:
            Cuando tengas el PNG, colócalo en esta ruta.
        */
        image: "assets/insignias/primer-latido.png",

        current: 1,
        goal: 1,
        unit: "registro",

        status: "unlocked",

        message:
            "¡Tu primer paso ya forma parte de tu historia en SENTIR!",

        special: false
    },


    {
        id: 2,
        title: "Explorador de Emociones",

        description:
            "Has identificado diferentes emociones dentro de SENTIR.",

        category: "Autoconocimiento",

        icon: "🧭",

        image: null,

        current: 3,
        goal: 5,
        unit: "emociones",

        status: "progress",

        message:
            "Te faltan 2 emociones diferentes por explorar.",

        special: false
    },


    {
        id: 3,
        title: "Detective Emocional",

        description:
            "Estás aprendiendo a reconocer qué situaciones influyen en cómo te sientes.",

        category: "Autoconocimiento",

        icon: "🔎",

        image: null,

        current: 4,
        goal: 7,
        unit: "registros",

        status: "progress",

        message:
            "Cada pista te ayuda a comprender mejor tus emociones.",

        special: false
    },


    {
        id: 4,
        title: "Racha Amable",

        description:
            "Has dedicado varios días a registrar cómo estás. No importa hacerlo perfecto, importa volver.",

        category: "Constancia",

        icon: "🔥",

        image: null,

        current: 4,
        goal: 7,
        unit: "días",

        status: "progress",

        message:
            "Te faltan 3 días. Si interrumpes tu racha, puedes retomarla.",

        special: false
    },


    {
        id: 5,
        title: "Una Semana Conmigo",

        description:
            "Durante una semana hiciste espacio para observar tu bienestar.",

        category: "Constancia",

        icon: "📅",

        image: null,

        current: 5,
        goal: 7,
        unit: "registros",

        status: "progress",

        message:
            "Solo faltan 2 registros para completar esta insignia.",

        special: false
    },


    {
        id: 6,
        title: "Semilla de Constancia",

        description:
            "Cada pequeño registro ayuda a construir tu historial emocional.",

        category: "Constancia",

        icon: "🌱",

        image: null,

        current: 7,
        goal: 10,
        unit: "registros",

        status: "progress",

        message:
            "Tu semilla está creciendo. Te faltan 3 registros.",

        special: false
    },


    {
        id: 7,
        title: "Jardín Interior",

        description:
            "Tu constancia está haciendo crecer tu espacio personal de bienestar.",

        category: "Constancia",

        icon: "🌷",

        image: "assets/insignias/jardin-interior.png",

        current: 18,
        goal: 30,
        unit: "registros",

        status: "progress",

        message:
            "Cada nuevo registro hace crecer un poco más tu jardín.",

        special: true
    },


    {
        id: 8,
        title: "Modo Zen",

        description:
            "Probaste varias herramientas de relajación o autocuidado.",

        category: "Bienestar",

        icon: "🧘",

        image: "assets/insignias/modo-zen.png",

        current: 5,
        goal: 5,
        unit: "actividades",

        status: "unlocked",

        message:
            "¡Desbloqueada! Ya conoces diferentes formas de regalarte una pausa.",

        special: false
    },


    {
        id: 9,
        title: "Respira Conmigo",

        description:
            "Completaste ejercicios de respiración consciente.",

        category: "Bienestar",

        icon: "🌬️",

        image: null,

        current: 3,
        goal: 5,
        unit: "ejercicios",

        status: "progress",

        message:
            "Te faltan 2 ejercicios de respiración.",

        special: false
    },


    {
        id: 10,
        title: "Kit de Calma",

        description:
            "Descubriste diferentes recursos que puedes usar cuando necesites un momento para ti.",

        category: "Bienestar",

        icon: "🎒",

        image: null,

        current: 4,
        goal: 6,
        unit: "herramientas",

        status: "progress",

        message:
            "Tu kit casi está completo. Descubre 2 herramientas más.",

        special: false
    },


    {
        id: 11,
        title: "Mente Curiosa",

        description:
            "Has explorado contenidos para aprender sobre emociones y bienestar.",

        category: "Aprendizaje",

        icon: "🧠",

        image: null,

        current: 5,
        goal: 5,
        unit: "contenidos",

        status: "unlocked",

        message:
            "¡Lo lograste! Tu curiosidad también cuida de ti.",

        special: false
    },


    {
        id: 12,
        title: "Aprendiz Emocional",

        description:
            "Continúas aprendiendo a identificar, expresar y gestionar tus emociones.",

        category: "Aprendizaje",

        icon: "📚",

        image: null,

        current: 7,
        goal: 10,
        unit: "contenidos",

        status: "progress",

        message:
            "Te faltan 3 contenidos por explorar.",

        special: false
    },


    {
        id: 13,
        title: "Brújula Interior",

        description:
            "Has utilizado tu historial para observar cómo han cambiado tus emociones.",

        category: "Progreso",

        icon: "🧭",

        image: "assets/insignias/brujula-interior.png",

        current: 3,
        goal: 5,
        unit: "consultas",

        status: "progress",

        message:
            "Te faltan 2 revisiones de tu historial.",

        special: true
    },


    {
        id: 14,
        title: "Conociéndome Mejor",

        description:
            "Has revisado tus estadísticas y avances personales varias veces.",

        category: "Progreso",

        icon: "🪞",

        image: null,

        current: 2,
        goal: 4,
        unit: "revisiones",

        status: "progress",

        message:
            "Ya vas a mitad de camino.",

        special: false
    },


    {
        id: 15,
        title: "Pequeños Pasos",

        description:
            "Has mantenido hábitos de bienestar en diferentes momentos. Cada paso también cuenta.",

        category: "Bienestar",

        icon: "👣",

        image: null,

        current: 6,
        goal: 10,
        unit: "acciones",

        status: "progress",

        message:
            "Cuatro pequeños pasos más y será tuya.",

        special: false
    },


    {
        id: 16,
        title: "Coleccionista de Bienestar",

        description:
            "Has probado diferentes actividades y recursos disponibles en SENTIR.",

        category: "Exploración",

        icon: "🎒",

        image: null,

        current: 6,
        goal: 8,
        unit: "recursos",

        status: "progress",

        message:
            "Solo te faltan 2 recursos diferentes.",

        special: false
    },


    {
        id: 17,
        title: "Cometa de Progreso",

        description:
            "Tu participación constante muestra cuánto has avanzado dentro de SENTIR.",

        category: "Progreso",

        icon: "☄️",

        image: null,

        current: 20,
        goal: 30,
        unit: "acciones",

        status: "progress",

        message:
            "Tu cometa sigue avanzando. Faltan 10 acciones.",

        special: false
    },


    {
        id: 18,
        title: "Corazón Curioso",

        description:
            "Te has permitido explorar nuevas formas de comprender lo que sientes.",

        category: "Exploración",

        icon: "💗",

        image: null,

        current: 8,
        goal: 12,
        unit: "actividades",

        status: "progress",

        message:
            "Te faltan 4 experiencias por descubrir.",

        special: false
    },


    {
        id: 19,
        title: "Constelación SENTIR",

        description:
            "Has participado en distintas áreas: registro, aprendizaje, historial y autocuidado.",

        category: "Especial",

        icon: "🌌",

        image: "assets/insignias/constelacion-sentir.png",

        current: 3,
        goal: 4,
        unit: "áreas",

        status: "progress",

        message:
            "Una estrella más y completarás tu constelación.",

        special: true
    },


    {
        id: 20,
        title: "Estrella SENTIR",

        description:
            "Has construido una participación constante y diversa dentro de SENTIR.",

        category: "Especial",

        icon: "🌟",

        image: "assets/insignias/estrella-sentir.png",

        current: 42,
        goal: 50,
        unit: "acciones",

        status: "locked",

        message:
            "Esta insignia especial se revelará cuando alcances 50 acciones de bienestar.",

        special: true
    }

];



/* =========================================================
   ELEMENTOS
========================================================= */

const badgesGrid =
    document.getElementById("badgesGrid");

const filterButtons =
    document.querySelectorAll(".filter-button");

const visibleBadgesText =
    document.getElementById("visibleBadgesText");

const emptyState =
    document.getElementById("emptyState");



/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function getProgressPercentage(badge) {

    const percentage =
        (badge.current / badge.goal) * 100;

    return Math.min(
        Math.round(percentage),
        100
    );

}



function getStatusText(status) {

    if (status === "unlocked") {
        return "Desbloqueada";
    }

    if (status === "progress") {
        return "En progreso";
    }

    return "Bloqueada";
}



function getFooterMessage(badge) {

    if (badge.status === "unlocked") {

        return "✨ ¡Insignia desbloqueada!";

    }

    if (badge.status === "locked") {

        return "🔒 Continúa avanzando para descubrirla.";

    }

    const remaining =
        Math.max(
            badge.goal - badge.current,
            0
        );

    return `Te faltan ${remaining} ${badge.unit}.`;

}



/* =========================================================
   CREAR VISUAL DE INSIGNIA
========================================================= */

function createBadgeVisual(badge) {

    /*
        Si la insignia tiene imagen configurada,
        intentamos cargarla.

        Si no existe todavía,
        automáticamente se muestra el emoji.
    */

    if (badge.image) {

        return `
            <div class="badge-visual">

                <img
                    class="badge-image"
                    src="${badge.image}"
                    alt="${badge.title}"

                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='block';
                    "
                >

                <span
                    class="badge-emoji"
                    style="display:none;"
                >
                    ${badge.icon}
                </span>

            </div>
        `;

    }

    return `
        <div class="badge-visual">

            <span class="badge-emoji">
                ${badge.icon}
            </span>

        </div>
    `;

}



/* =========================================================
   CREAR TARJETA
========================================================= */

function createBadgeCard(badge) {

    const percentage =
        getProgressPercentage(badge);

    const specialClass =
        badge.special
            ? "special"
            : "";

    return `
        <article
            class="
                badge-card
                ${badge.status}
                ${specialClass}
            "
            data-id="${badge.id}"
            tabindex="0"
        >

            <span class="badge-category">
                ${badge.category}
            </span>


            ${createBadgeVisual(badge)}


            <h3>
                ${badge.title}
            </h3>


            <p class="badge-description">
                ${badge.description}
            </p>


            <div class="badge-progress-area">

                <div class="badge-progress-labels">

                    <span>
                        ${getStatusText(badge.status)}
                    </span>

                    <strong>
                        ${badge.current}/${badge.goal}
                    </strong>

                </div>


                <div class="badge-progress-track">

                    <div
                        class="badge-progress-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>


                <div class="badge-footer-message">
                    ${getFooterMessage(badge)}
                </div>

            </div>

        </article>
    `;

}



/* =========================================================
   RENDERIZAR INSIGNIAS
========================================================= */

function renderBadges(filter = "all") {

    let filteredBadges = badges;


    if (filter !== "all") {

        filteredBadges =
            badges.filter(
                badge =>
                    badge.status === filter
            );

    }


    badgesGrid.innerHTML =
        filteredBadges
            .map(createBadgeCard)
            .join("");


    visibleBadgesText.textContent =
        `Mostrando ${filteredBadges.length} ${
            filteredBadges.length === 1
                ? "insignia"
                : "insignias"
        }`;


    if (filteredBadges.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

    } else {

        emptyState.classList.add(
            "hidden"
        );

    }


    attachBadgeEvents();

}



/* =========================================================
   ESTADÍSTICAS SUPERIORES
========================================================= */

function updateGeneralStats() {

    const unlocked =
        badges.filter(
            badge =>
                badge.status === "unlocked"
        ).length;


    const progress =
        badges.filter(
            badge =>
                badge.status === "progress"
        ).length;


    const total =
        badges.length;


    /*
        Progreso general basado en la suma
        de todos los avances.
    */

    const currentTotal =
        badges.reduce(
            (sum, badge) =>
                sum +
                Math.min(
                    badge.current,
                    badge.goal
                ),

            0
        );


    const goalsTotal =
        badges.reduce(
            (sum, badge) =>
                sum + badge.goal,

            0
        );


    const overall =
        Math.round(
            (currentTotal / goalsTotal) *
            100
        );


    document.getElementById(
        "heroUnlocked"
    ).textContent = unlocked;


    document.getElementById(
        "heroProgress"
    ).textContent = progress;


    document.getElementById(
        "collectionUnlocked"
    ).textContent = unlocked;


    document.getElementById(
        "overallPercentage"
    ).textContent =
        `${overall}%`;


    document.getElementById(
        "collectionText"
    ).textContent =
        `Has desbloqueado ${unlocked} de ${total} insignias. Cada experiencia suma a tu recorrido.`;


    /*
        Pequeño retraso para que
        se vea la animación.
    */

    setTimeout(() => {

        document.getElementById(
            "overallProgressFill"
        ).style.width =
            `${overall}%`;

    }, 250);

}



/* =========================================================
   FILTROS
========================================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


            button.classList.add(
                "active"
            );


            const filter =
                button.dataset.filter;


            renderBadges(filter);

        }
    );

});



/* =========================================================
   MODAL
========================================================= */

const modalOverlay =
    document.getElementById(
        "badgeModalOverlay"
    );

const modalClose =
    document.getElementById(
        "modalClose"
    );



function openBadgeModal(badge) {

    const percentage =
        getProgressPercentage(badge);


    const modalBadgeImage =
        document.getElementById(
            "modalBadgeImage"
        );


    /*
        Visual
    */

    if (badge.image) {

        modalBadgeImage.innerHTML = `
            <img
                src="${badge.image}"
                alt="${badge.title}"

                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='block';
                "
            >

            <span style="display:none;">
                ${badge.icon}
            </span>
        `;

    } else {

        modalBadgeImage.innerHTML =
            `<span>${badge.icon}</span>`;

    }


    /*
        Datos
    */

    document.getElementById(
        "modalTitle"
    ).textContent =
        badge.title;


    document.getElementById(
        "modalDescription"
    ).textContent =
        badge.description;


    document.getElementById(
        "modalStatus"
    ).textContent =
        getStatusText(
            badge.status
        ).toUpperCase();


    document.getElementById(
        "modalProgressText"
    ).textContent =
        `${badge.current} / ${badge.goal} ${badge.unit}`;


    document.getElementById(
        "modalMessage"
    ).textContent =
        badge.message;


    const button =
        document.getElementById(
            "modalMainButton"
        );


    if (badge.status === "unlocked") {

        button.innerHTML = `
            Ver mis logros
            <i class="fa-solid fa-arrow-right"></i>
        `;

    } else {

        button.innerHTML = `
            Seguir avanzando
            <i class="fa-solid fa-arrow-right"></i>
        `;

    }


    /*
        Mostrar modal
    */

    modalOverlay.classList.add(
        "show"
    );

    document.body.classList.add(
        "no-scroll"
    );


    /*
        Animar progreso
    */

    const progressBar =
        document.getElementById(
            "modalProgressFill"
        );


    progressBar.style.width =
        "0%";


    setTimeout(() => {

        progressBar.style.width =
            `${percentage}%`;

    }, 170);

}



function closeBadgeModal() {

    modalOverlay.classList.remove(
        "show"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}



modalClose.addEventListener(
    "click",
    closeBadgeModal
);



modalOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalOverlay
        ) {

            closeBadgeModal();

        }

    }
);



/* =========================================================
   EVENTOS DE LAS TARJETAS
========================================================= */

function attachBadgeEvents() {

    const cards =
        document.querySelectorAll(
            ".badge-card"
        );


    cards.forEach(card => {

        const badgeId =
            Number(
                card.dataset.id
            );


        const badge =
            badges.find(
                item =>
                    item.id === badgeId
            );


        card.addEventListener(
            "click",
            () => {

                openBadgeModal(
                    badge
                );

            }
        );


        /*
            Accesibilidad:
            abrir con Enter o espacio.
        */

        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    openBadgeModal(
                        badge
                    );

                }

            }
        );

    });

}



/* =========================================================
   PERFIL DESPLEGABLE
========================================================= */

const profileButton =
    document.getElementById(
        "profileButton"
    );

const profileContainer =
    document.querySelector(
        ".profile-container"
    );


profileButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        profileContainer
            .classList
            .toggle("open");

    }
);



document.addEventListener(
    "click",
    event => {

        if (
            !profileContainer.contains(
                event.target
            )
        ) {

            profileContainer
                .classList
                .remove("open");

        }

    }
);



/* =========================================================
   SIDEBAR RESPONSIVE
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuItems = document.querySelectorAll(".menu-item");

    // Función para abrir/cerrar el sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("active");
    }

    // Función para cerrar el sidebar
    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    // Evento del botón de hamburguesa
    if (mobileMenu) {
        mobileMenu.addEventListener("click", toggleSidebar);
    }

    // Evento al hacer clic en el fondo oscuro
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    // Cerrar sidebar al hacer clic en una opción (en dispositivos móviles)
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
});


/* =========================================================
   TECLA ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeBadgeModal();

            closeSidebar();

            profileContainer
                .classList
                .remove("open");

        }

    }
);



/* =========================================================
   BOTÓN PRINCIPAL MODAL
========================================================= */

document.getElementById(
    "modalMainButton"
).addEventListener(
    "click",
    closeBadgeModal
);



/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderBadges("all");

        updateGeneralStats();

    }
);