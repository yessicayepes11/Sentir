/* =========================================================
   SENTIR
   RELAJACIÓN
========================================================= */


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
   PERFIL
========================================================= */

const profileContainer =
    document.querySelector(
        ".profile-container"
    );

const profileButton =
    document.getElementById(
        "profileButton"
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
   =========================================================
   RESPIRACIÓN GUIADA
   =========================================================
   ========================================================= */


/*
    Ciclo total:

    Inhala: 4 segundos
    Sostén: 4 segundos
    Exhala: 6 segundos

    Total = 14 segundos
*/

const BREATHING_PHASES = [

    {
        name: "Inhala",
        start: 0,
        end: 4
    },

    {
        name: "Sostén",
        start: 4,
        end: 8
    },

    {
        name: "Exhala",
        start: 8,
        end: 14
    }

];


const CYCLE_DURATION =
    14;


const breathingOrb =
    document.getElementById(
        "breathingOrb"
    );


const breathingPhaseText =
    document.getElementById(
        "breathingPhaseText"
    );


const orbPhaseText =
    document.getElementById(
        "orbPhaseText"
    );


const phaseCountdown =
    document.getElementById(
        "phaseCountdown"
    );


const cycleCount =
    document.getElementById(
        "cycleCount"
    );


const pauseBreathingButton =
    document.getElementById(
        "pauseBreathingButton"
    );


const restartBreathingButton =
    document.getElementById(
        "restartBreathingButton"
    );


let breathingPaused =
    false;


let breathingStartTime =
    performance.now();


let pauseStartedAt =
    0;


let totalPausedTime =
    0;


let breathingAnimationFrame =
    null;



function getCurrentPhase(
    secondsInCycle
) {

    return BREATHING_PHASES.find(
        phase =>
            secondsInCycle >= phase.start &&
            secondsInCycle < phase.end
    ) || BREATHING_PHASES[0];

}



function updateBreathingClock(
    timestamp
) {

    if (
        breathingPaused
    ) {

        breathingAnimationFrame =
            requestAnimationFrame(
                updateBreathingClock
            );

        return;

    }


    const totalElapsedMilliseconds =
        timestamp
        - breathingStartTime
        - totalPausedTime;


    const totalElapsedSeconds =
        totalElapsedMilliseconds /
        1000;


    const completedCycles =
        Math.floor(
            totalElapsedSeconds /
            CYCLE_DURATION
        );


    const secondsInCycle =
        totalElapsedSeconds %
        CYCLE_DURATION;


    const phase =
        getCurrentPhase(
            secondsInCycle
        );


    const secondsRemaining =
        Math.max(
            1,
            Math.ceil(
                phase.end -
                secondsInCycle
            )
        );


    breathingPhaseText.textContent =
        phase.name;


    orbPhaseText.textContent =
        phase.name;


    phaseCountdown.textContent =
        secondsRemaining;


    cycleCount.textContent =
        completedCycles;


    updateActivePattern(
        phase.name
    );


    breathingAnimationFrame =
        requestAnimationFrame(
            updateBreathingClock
        );

}



function updateActivePattern(
    phaseName
) {

    const patternItems =
        document.querySelectorAll(
            ".pattern-item"
        );


    patternItems.forEach(
        item => {

            const title =
                item.querySelector(
                    "strong"
                )
                .textContent;


            item.classList.toggle(
                "active",
                title === phaseName
            );

        }
    );

}



/* =========================================================
   PAUSAR
========================================================= */

pauseBreathingButton.addEventListener(
    "click",
    () => {

        if (
            !breathingPaused
        ) {

            breathingPaused =
                true;


            pauseStartedAt =
                performance.now();


            breathingOrb.classList.add(
                "paused"
            );


            pauseBreathingButton.innerHTML =
                `
                    <i class="fa-solid fa-play"></i>
                    <span>Continuar</span>
                `;

        } else {

            breathingPaused =
                false;


            totalPausedTime +=
                performance.now()
                - pauseStartedAt;


            breathingOrb.classList.remove(
                "paused"
            );


            pauseBreathingButton.innerHTML =
                `
                    <i class="fa-solid fa-pause"></i>
                    <span>Pausar</span>
                `;

        }

    }
);



/* =========================================================
   REINICIAR
========================================================= */

restartBreathingButton.addEventListener(
    "click",
    () => {

        breathingPaused =
            false;


        breathingStartTime =
            performance.now();


        totalPausedTime =
            0;


        breathingOrb.classList.remove(
            "paused"
        );


        /*
            Reiniciamos visualmente
            la animación CSS.
        */

        breathingOrb.style.animation =
            "none";


        void breathingOrb.offsetWidth;


        breathingOrb.style.animation =
            "";


        breathingPhaseText.textContent =
            "Inhala";


        orbPhaseText.textContent =
            "Inhala";


        phaseCountdown.textContent =
            "4";


        cycleCount.textContent =
            "0";


        pauseBreathingButton.innerHTML =
            `
                <i class="fa-solid fa-pause"></i>
                <span>Pausar</span>
            `;

    }
);



breathingAnimationFrame =
    requestAnimationFrame(
        updateBreathingClock
    );



/* =========================================================
   =========================================================
   BIBLIOTECA DE ACTIVIDADES
   =========================================================
   ========================================================= */


/*
    Los videos se controlan mediante
    su ID de YouTube.

    Si luego quieren cambiar un video,
    solo reemplazan videoId.
*/

const relaxationActivities = [

    /* =====================================================
       RESPIRACIÓN
    ====================================================== */

    {
        id: "breathing-headspace",

        category: "breathing",

        categoryName:
            "Respiración",

        title:
            "Mini pausa para respirar",

        description:
            "Una práctica breve para detenerte unos instantes y acompañar conscientemente tu respiración.",

        duration:
            "Breve",

        provider:
            "Headspace",

        type:
            "video",

        videoId:
            "cEqZthCaMpo"
    },


    {
        id: "breathing-five",

        category:
            "breathing",

        categoryName:
            "Respiración",

        title:
            "Respiración guiada de 5 minutos",

        description:
            "Una práctica guiada para acompañar la respiración de forma tranquila durante algunos minutos.",

        duration:
            "5 min",

        provider:
            "YouTube",

        type:
            "video",

        videoId:
            "EMzifxkMAp8"
    },



    /* =====================================================
       ACTIVIDADES PSICÓLOGA
    ====================================================== */

    {
        id:
            "psychologist-one",

        category:
            "psychologist",

        categoryName:
            "Psicóloga",

        title:
            "Actividad de la psicóloga 01",

        description:
            "Espacio preparado para integrar una actividad creada específicamente por la psicóloga de la institución.",

        duration:
            "Personalizada",

        provider:
            "Psicología SENTIR",

        type:
            "psychologist",

        /*
            REEMPLAZAR POR LA ACTIVIDAD REAL.
        */
        steps: [

            "Aquí puedes escribir la primera indicación de la actividad.",

            "Aquí puede ir el segundo paso preparado por la psicóloga.",

            "Aquí puedes añadir una reflexión o instrucción final."

        ]
    },


    {
        id:
            "psychologist-two",

        category:
            "psychologist",

        categoryName:
            "Psicóloga",

        title:
            "Actividad de la psicóloga 02",

        description:
            "Segundo espacio configurable para una actividad institucional de relajación o acompañamiento.",

        duration:
            "Personalizada",

        provider:
            "Psicología SENTIR",

        type:
            "psychologist",

        steps: [

            "Reemplaza este texto por las instrucciones reales.",

            "Puedes agregar tantos pasos como necesite la actividad.",

            "También pueden convertirse estos pasos en contenido obtenido desde la base de datos."

        ]
    },



    /* =====================================================
       MEDITACIÓN
    ====================================================== */

    {
        id:
            "meditation-stress",

        category:
            "meditation",

        categoryName:
            "Meditación",

        title:
            "Meditación guiada de 10 minutos",

        description:
            "Una meditación guiada para hacer una pausa, observar los pensamientos y regresar al momento presente.",

        duration:
            "10 min",

        provider:
            "Headspace",

        type:
            "video",

        videoId:
            "sG7DBA-mgFY"
    },


    {
        id:
            "meditation-focus",

        category:
            "meditation",

        categoryName:
            "Meditación",

        title:
            "Meditación para volver al presente",

        description:
            "Práctica guiada centrada en reconocer cuándo la mente se distrae y volver suavemente al presente.",

        duration:
            "10 min",

        provider:
            "Headspace",

        type:
            "video",

        videoId:
            "6TH2hY1s-Oc"
    },



    /* =====================================================
       YOGA
    ====================================================== */

    {
        id:
            "yoga-stress",

        category:
            "yoga",

        categoryName:
            "Yoga",

        title:
            "Yoga breve para liberar tensión",

        description:
            "Una sesión corta de movimiento consciente. Realízala únicamente si te resulta cómoda físicamente.",

        duration:
            "10 min",

        provider:
            "Yoga With Adriene",

        type:
            "video",

        videoId:
            "x18YTw4xaKk"
    },


    {
        id:
            "yoga-focus",

        category:
            "yoga",

        categoryName:
            "Yoga",

        title:
            "Yoga para reenfocarte",

        description:
            "Una práctica breve que combina movimiento y respiración para hacer una pausa consciente.",

        duration:
            "10 min",

        provider:
            "Yoga With Adriene",

        type:
            "video",

        videoId:
            "Nnd5Slo02us"
    }

];



/* =========================================================
   RENDER ACTIVIDADES
========================================================= */

const activitiesGrid =
    document.getElementById(
        "activitiesGrid"
    );


const visibleActivitiesCount =
    document.getElementById(
        "visibleActivitiesCount"
    );


const activityTabs =
    document.querySelectorAll(
        ".activity-tab"
    );



function createVideoActivityCard(
    activity
) {

    const thumbnail =
        `https://img.youtube.com/vi/${activity.videoId}/hqdefault.jpg`;


    return `

        <article
            class="activity-card"
        >

            <div class="activity-thumbnail">

                <img
                    src="${thumbnail}"
                    alt="${activity.title}"
                    loading="lazy"
                >

                <div class="thumbnail-overlay"></div>


                <div class="activity-play">

                    <i class="fa-solid fa-play"></i>

                </div>


                <span class="activity-duration">
                    ${activity.duration}
                </span>

            </div>


            <div class="activity-content">

                <span class="activity-category">
                    ${activity.categoryName}
                </span>


                <h3>
                    ${activity.title}
                </h3>


                <p>
                    ${activity.description}
                </p>


                <div class="activity-card-footer">

                    <div class="activity-provider">

                        <i class="fa-brands fa-youtube"></i>

                        ${activity.provider}

                    </div>


                    <button
                        type="button"
                        class="open-activity-button"
                        data-video-id="${activity.id}"
                    >

                        Reproducir

                        <i class="fa-solid fa-play"></i>

                    </button>

                </div>

            </div>

        </article>

    `;

}



function createPsychologistCard(
    activity
) {

    return `

        <article class="activity-card">

            <div class="activity-thumbnail psychologist-thumbnail">

                <div class="psychologist-illustration">

                    <i class="fa-solid fa-user-doctor"></i>

                </div>


                <span class="activity-duration">
                    ${activity.duration}
                </span>

            </div>


            <div class="activity-content">

                <span class="activity-category">
                    ${activity.categoryName}
                </span>


                <h3>
                    ${activity.title}
                </h3>


                <p>
                    ${activity.description}
                </p>


                <div class="activity-card-footer">

                    <div class="activity-provider">

                        <i class="fa-solid fa-heart"></i>

                        ${activity.provider}

                    </div>


                    <button
                        type="button"
                        class="open-activity-button"
                        data-psychologist-id="${activity.id}"
                    >

                        Ver actividad

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </div>

            </div>

        </article>

    `;

}



function renderActivities(
    category
) {

    const filtered =
        relaxationActivities.filter(
            activity =>
                activity.category === category
        );


    visibleActivitiesCount.textContent =
        filtered.length;


    activitiesGrid.innerHTML =
        filtered
            .map(
                activity => {

                    if (
                        activity.type ===
                        "psychologist"
                    ) {

                        return createPsychologistCard(
                            activity
                        );

                    }


                    return createVideoActivityCard(
                        activity
                    );

                }
            )
            .join("");


    attachActivityEvents();

}



/* =========================================================
   TABS
========================================================= */

activityTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                activityTabs.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                tab.classList.add(
                    "active"
                );


                renderActivities(
                    tab.dataset.category
                );

            }
        );

    }
);



/* =========================================================
   =========================================================
   YOUTUBE PLAYER API
   =========================================================
   ========================================================= */

let youtubeApiReady =
    false;


let youtubePlayer =
    null;


let currentVideoActivity =
    null;


const videoModal =
    document.getElementById(
        "videoModal"
    );


const videoModalTitle =
    document.getElementById(
        "videoModalTitle"
    );


const videoCategoryLabel =
    document.getElementById(
        "videoCategoryLabel"
    );


const videoModalDescription =
    document.getElementById(
        "videoModalDescription"
    );


/* =========================================================
   CARGAR API
========================================================= */

function loadYouTubeApi() {

    if (
        document.getElementById(
            "youtubeIframeApi"
        )
    ) {

        return;

    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "youtubeIframeApi";


    script.src =
        "https://www.youtube.com/iframe_api";


    document.body.appendChild(
        script
    );

}



window.onYouTubeIframeAPIReady =
    function () {

        youtubeApiReady =
            true;

    };


loadYouTubeApi();



/* =========================================================
   ABRIR VIDEO
========================================================= */

function openVideo(
    activity
) {

    currentVideoActivity =
        activity;


    videoModalTitle.textContent =
        activity.title;


    videoCategoryLabel.textContent =
        activity
            .categoryName
            .toUpperCase();


    videoModalDescription.textContent =
        activity.description;


    videoModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "no-scroll"
    );


    /*
        Si la API todavía no cargó,
        esperamos brevemente.
    */

    if (
        !youtubeApiReady
    ) {

        const waitForApi =
            setInterval(
                () => {

                    if (
                        youtubeApiReady
                    ) {

                        clearInterval(
                            waitForApi
                        );


                        createYoutubePlayer(
                            activity.videoId
                        );

                    }

                },
                100
            );


        return;

    }


    createYoutubePlayer(
        activity.videoId
    );

}



function createYoutubePlayer(
    videoId
) {

    if (
        youtubePlayer
    ) {

        youtubePlayer.destroy();

        youtubePlayer =
            null;


        document.getElementById(
            "youtubePlayer"
        ).innerHTML =
            "";

    }


    youtubePlayer =
        new YT.Player(
            "youtubePlayer",
            {

                videoId:
                    videoId,


                playerVars: {

                    autoplay:
                        1,

                    controls:
                        1,

                    rel:
                        0,

                    playsinline:
                        1,

                    enablejsapi:
                        1

                },


                events: {

                    onStateChange:
                        updatePlayButtonState

                }

            }
        );

}



/* =========================================================
   CLOSE VIDEO
========================================================= */

const closeVideoButton =
    document.getElementById(
        "closeVideoButton"
    );



function closeVideo() {

    if (
        youtubePlayer
    ) {

        youtubePlayer.stopVideo();

        youtubePlayer.destroy();

        youtubePlayer =
            null;

    }


    const playerContainer =
        document.getElementById(
            "youtubePlayer"
        );


    playerContainer.innerHTML =
        "";


    videoModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "no-scroll"
    );


    currentVideoActivity =
        null;

}



closeVideoButton.addEventListener(
    "click",
    closeVideo
);



videoModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            videoModal
        ) {

            closeVideo();

        }

    }
);



/* =========================================================
   CONTROLES DEL VIDEO
========================================================= */

const rewindButton =
    document.getElementById(
        "rewindButton"
    );


const playPauseButton =
    document.getElementById(
        "playPauseButton"
    );


const forwardButton =
    document.getElementById(
        "forwardButton"
    );


const muteButton =
    document.getElementById(
        "muteButton"
    );


const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );


const videoPlayerShell =
    document.getElementById(
        "videoPlayerShell"
    );



/* RETROCEDER 10s */

rewindButton.addEventListener(
    "click",
    () => {

        if (
            !youtubePlayer ||
            !youtubePlayer.getCurrentTime
        ) {

            return;

        }


        const current =
            youtubePlayer
                .getCurrentTime();


        youtubePlayer.seekTo(
            Math.max(
                0,
                current - 10
            ),
            true
        );

    }
);



/* ADELANTAR 10s */

forwardButton.addEventListener(
    "click",
    () => {

        if (
            !youtubePlayer ||
            !youtubePlayer.getCurrentTime
        ) {

            return;

        }


        const current =
            youtubePlayer
                .getCurrentTime();


        const duration =
            youtubePlayer
                .getDuration();


        youtubePlayer.seekTo(
            Math.min(
                duration,
                current + 10
            ),
            true
        );

    }
);



/* PLAY / PAUSE */

playPauseButton.addEventListener(
    "click",
    () => {

        if (
            !youtubePlayer ||
            !youtubePlayer.getPlayerState
        ) {

            return;

        }


        const state =
            youtubePlayer
                .getPlayerState();


        if (
            state ===
            YT.PlayerState.PLAYING
        ) {

            youtubePlayer.pauseVideo();

        } else {

            youtubePlayer.playVideo();

        }

    }
);



function updatePlayButtonState(
    event
) {

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        playPauseButton.innerHTML =
            `
                <i class="fa-solid fa-pause"></i>
            `;

    } else {

        playPauseButton.innerHTML =
            `
                <i class="fa-solid fa-play"></i>
            `;

    }

}



/* =========================================================
   MUTE
========================================================= */

muteButton.addEventListener(
    "click",
    () => {

        if (
            !youtubePlayer
        ) {

            return;

        }


        if (
            youtubePlayer.isMuted()
        ) {

            youtubePlayer.unMute();


            muteButton.innerHTML =
                `
                    <i class="fa-solid fa-volume-high"></i>
                `;

        } else {

            youtubePlayer.mute();


            muteButton.innerHTML =
                `
                    <i class="fa-solid fa-volume-xmark"></i>
                `;

        }

    }
);



/* =========================================================
   FULLSCREEN
========================================================= */

fullscreenButton.addEventListener(
    "click",
    async () => {

        try {

            if (
                document.fullscreenElement
            ) {

                await document.exitFullscreen();

            } else {

                await videoPlayerShell
                    .requestFullscreen();

            }

        } catch (
            error
        ) {

            console.warn(
                "No fue posible activar pantalla completa.",
                error
            );

        }

    }
);



/* =========================================================
   ACTIVIDADES PSICÓLOGA
========================================================= */

const psychologistModal =
    document.getElementById(
        "psychologistModal"
    );


const psychologistModalTitle =
    document.getElementById(
        "psychologistModalTitle"
    );


const psychologistModalDescription =
    document.getElementById(
        "psychologistModalDescription"
    );


const psychologistSteps =
    document.getElementById(
        "psychologistSteps"
    );


const closePsychologistModal =
    document.getElementById(
        "closePsychologistModal"
    );


const finishPsychologistActivity =
    document.getElementById(
        "finishPsychologistActivity"
    );



function openPsychologistActivity(
    activity
) {

    psychologistModalTitle.textContent =
        activity.title;


    psychologistModalDescription.textContent =
        activity.description;


    psychologistSteps.innerHTML =
        activity.steps
            .map(
                (
                    step,
                    index
                ) => {

                    return `

                        <div class="psychologist-step">

                            <span>
                                ${index + 1}
                            </span>

                            <p>
                                ${step}
                            </p>

                        </div>

                    `;

                }
            )
            .join("");


    psychologistModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "no-scroll"
    );

}



function closePsychologistActivity() {

    psychologistModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "no-scroll"
    );

}



closePsychologistModal.addEventListener(
    "click",
    closePsychologistActivity
);


finishPsychologistActivity.addEventListener(
    "click",
    closePsychologistActivity
);


psychologistModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            psychologistModal
        ) {

            closePsychologistActivity();

        }

    }
);



/* =========================================================
   EVENTOS DINÁMICOS
========================================================= */

function attachActivityEvents() {

    document
        .querySelectorAll(
            "[data-video-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const activity =
                            relaxationActivities.find(
                                item =>
                                    item.id ===
                                    button.dataset.videoId
                            );


                        if (
                            activity
                        ) {

                            openVideo(
                                activity
                            );

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-psychologist-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const activity =
                            relaxationActivities.find(
                                item =>
                                    item.id ===
                                    button.dataset.psychologistId
                            );


                        if (
                            activity
                        ) {

                            openPsychologistActivity(
                                activity
                            );

                        }

                    }
                );

            }
        );

}



/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeSidebar();


        profileContainer
            .classList
            .remove(
                "open"
            );


        if (
            videoModal.classList.contains(
                "show"
            )
        ) {

            closeVideo();

        }


        if (
            psychologistModal.classList.contains(
                "show"
            )
        ) {

            closePsychologistActivity();

        }

    }
);



/* =========================================================
   INICIALIZAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderActivities(
            "breathing"
        );

    }
);