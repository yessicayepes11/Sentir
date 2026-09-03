/* =========================================
   CASOS DE EJEMPLO
========================================= */

const cases = [

    {
        id: 1,
        student: "Valentina Gómez",
        course: "11°2",
        level: "high",
        alert: "Riesgo alto",
        date: "01/09/2026",
        status: "pending",

        reason:
            "Se han identificado cambios emocionales importantes y una disminución en su interacción habitual.",

        indicators: [
            "Cambios frecuentes en el estado emocional",
            "Aislamiento durante actividades grupales",
            "Disminución de la participación académica"
        ],

        history: []
    },


    {
        id: 2,
        student: "Mateo Rodríguez",
        course: "10°1",
        level: "medium",
        alert: "Requiere atención",
        date: "31/08/2026",
        status: "followup",

        reason:
            "Se observan cambios en los registros emocionales durante los últimos días.",

        indicators: [
            "Cambios en el registro emocional",
            "Menor participación en clase",
            "Variaciones en sus interacciones"
        ],

        history: [
            {
                date: "31/08/2026",
                text:
                    "Se realizó un primer acercamiento con el estudiante."
            }
        ]
    },


    {
        id: 3,
        student: "Sofía Martínez",
        course: "8°3",
        level: "follow",
        alert: "En seguimiento",
        date: "30/08/2026",
        status: "followup",

        reason:
            "El estudiante cuenta actualmente con un proceso de acompañamiento.",

        indicators: [
            "Variaciones emocionales recientes",
            "Necesidad de acompañamiento",
            "Seguimiento activo"
        ],

        history: [
            {
                date: "30/08/2026",
                text:
                    "Se inició seguimiento por parte del equipo de acompañamiento."
            },

            {
                date: "01/09/2026",
                text:
                    "Se revisó nuevamente la evolución del caso."
            }
        ]
    },


    {
        id: 4,
        student: "Samuel Pérez",
        course: "6°4",
        level: "medium",
        alert: "Requiere atención",
        date: "29/08/2026",
        status: "pending",

        reason:
            "Se identificó un cambio reciente en sus registros emocionales.",

        indicators: [
            "Cambios en el estado emocional",
            "Menor comunicación",
            "Disminución de participación"
        ],

        history: []
    },


    {
        id: 5,
        student: "Mariana López",
        course: "9°2",
        level: "high",
        alert: "Riesgo alto",
        date: "29/08/2026",
        status: "followup",

        reason:
            "Se han identificado señales que requieren acompañamiento prioritario.",

        indicators: [
            "Cambios emocionales persistentes",
            "Aislamiento social",
            "Cambios en el rendimiento académico"
        ],

        history: [
            {
                date: "29/08/2026",
                text:
                    "El caso fue remitido al equipo correspondiente para valoración."
            }
        ]
    },


    {
        id: 6,
        student: "Daniel Torres",
        course: "7°1",
        level: "medium",
        alert: "Requiere atención",
        date: "28/08/2026",
        status: "attended",

        reason:
            "Se detectaron cambios puntuales que fueron revisados por el equipo de acompañamiento.",

        indicators: [
            "Cambio temporal del estado emocional",
            "Menor interacción"
        ],

        history: [
            {
                date: "28/08/2026",
                text:
                    "Se realizó acompañamiento inicial."
            },

            {
                date: "30/08/2026",
                text:
                    "El caso fue atendido."
            }
        ]
    },


    {
        id: 7,
        student: "Isabella Ramírez",
        course: "11°4",
        level: "follow",
        alert: "En seguimiento",
        date: "27/08/2026",
        status: "followup",

        reason:
            "Actualmente se encuentra en un proceso de acompañamiento.",

        indicators: [
            "Cambios emocionales recientes",
            "Seguimiento activo"
        ],

        history: [
            {
                date: "27/08/2026",
                text:
                    "Se inició proceso de seguimiento."
            }
        ]
    },


    {
        id: 8,
        student: "Nicolás Hernández",
        course: "10°3",
        level: "high",
        alert: "Riesgo alto",
        date: "26/08/2026",
        status: "pending",

        reason:
            "Se identificaron cambios significativos que requieren atención prioritaria.",

        indicators: [
            "Cambios emocionales frecuentes",
            "Aislamiento",
            "Baja participación académica"
        ],

        history: []
    },


    {
        id: 9,
        student: "Camila Vargas",
        course: "8°1",
        level: "medium",
        alert: "Requiere atención",
        date: "25/08/2026",
        status: "attended",

        reason:
            "Se identificaron señales de alerta que fueron atendidas.",

        indicators: [
            "Cambios en el comportamiento",
            "Variaciones emocionales"
        ],

        history: [
            {
                date: "25/08/2026",
                text:
                    "Se realizó acompañamiento."
            }
        ]
    },


    {
        id: 10,
        student: "Juan David Castro",
        course: "6°2",
        level: "follow",
        alert: "En seguimiento",
        date: "24/08/2026",
        status: "followup",

        reason:
            "Se mantiene seguimiento preventivo.",

        indicators: [
            "Cambios leves en el estado emocional",
            "Seguimiento preventivo"
        ],

        history: [
            {
                date: "24/08/2026",
                text:
                    "Se inició seguimiento preventivo."
            }
        ]
    }

];



/* =========================================
   ELEMENTOS
========================================= */

const courseFilter =
    document.getElementById("courseFilter");

const levelFilter =
    document.getElementById("levelFilter");

const statusFilter =
    document.getElementById("statusFilter");

const casesContainer =
    document.getElementById("casesContainer");

const resultsCount =
    document.getElementById("resultsCount");

const emptyState =
    document.getElementById("emptyState");

const detailPlaceholder =
    document.querySelector(".detail-placeholder");

const detailContent =
    document.getElementById("detailContent");

const highCount =
    document.getElementById("highCount");

const mediumCount =
    document.getElementById("mediumCount");

const followCount =
    document.getElementById("followCount");



/* =========================================
   INICIAR
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateSummary();

        renderCases();

        setupFilters();

        setupMobileMenu();

    }
);



/* =========================================
   RESUMEN
========================================= */

function updateSummary() {

    highCount.textContent =
        cases.filter(
            item => item.level === "high"
        ).length;


    mediumCount.textContent =
        cases.filter(
            item => item.level === "medium"
        ).length;


    followCount.textContent =
        cases.filter(
            item => item.level === "follow"
        ).length;

}



/* =========================================
   FILTROS
========================================= */

function setupFilters() {

    courseFilter.addEventListener(
        "change",
        renderCases
    );


    levelFilter.addEventListener(
        "change",
        renderCases
    );


    statusFilter.addEventListener(
        "change",
        renderCases
    );


    document
        .getElementById("clearFilters")
        .addEventListener(
            "click",
            () => {

                courseFilter.value = "all";

                levelFilter.value = "all";

                statusFilter.value = "all";

                renderCases();

            }
        );

}



/* =========================================
   FILTRAR
========================================= */

function getFilteredCases() {

    const course =
        courseFilter.value;

    const level =
        levelFilter.value;

    const status =
        statusFilter.value;


    return cases.filter(item => {

        const courseMatch =
            course === "all" ||
            item.course === course;


        const levelMatch =
            level === "all" ||
            item.level === level;


        const statusMatch =
            status === "all" ||
            item.status === status;


        return (
            courseMatch &&
            levelMatch &&
            statusMatch
        );

    });

}



/* =========================================
   MOSTRAR CASOS
========================================= */

function renderCases() {

    const filtered =
        getFilteredCases();


    casesContainer.innerHTML = "";


    resultsCount.textContent =
        filtered.length;


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filtered.forEach(item => {

        const card =
            document.createElement("div");


        card.className =
            "case-card";


        card.dataset.id =
            item.id;


        card.innerHTML = `

            <div class="case-avatar">
                ${getInitials(item.student)}
            </div>


            <div class="case-main">

                <div class="case-name">
                    ${item.student}
                </div>

                <div class="case-course">
                    Curso ${item.course}
                </div>


                <div class="case-alert">

                    <span
                        class="alert-dot ${item.level}"
                    ></span>

                    <span class="alert-text">
                        ${item.alert}
                    </span>

                </div>

            </div>


            <div class="case-date">
                ${item.date}
            </div>


            <span class="status ${item.status}">
                ${getStatusText(item.status)}
            </span>

        `;


        card.addEventListener(
            "click",
            () => {

                selectCase(item.id);

            }
        );


        casesContainer.appendChild(card);

    });

}



/* =========================================
   SELECCIONAR
========================================= */

function selectCase(id) {

    const item =
        cases.find(
            caseItem => caseItem.id === id
        );


    if (!item) return;


    document
        .querySelectorAll(".case-card")
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

        });


    const selected =
        document.querySelector(
            `.case-card[data-id="${id}"]`
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );

    }


    showDetail(item);

}



/* =========================================
   DETALLE
========================================= */

function showDetail(item) {

    detailPlaceholder.style.display =
        "none";


    detailContent.style.display =
        "block";


    detailContent.innerHTML = `

        <div class="detail-header">

            <div class="detail-person">

                <div class="detail-avatar">
                    ${getInitials(item.student)}
                </div>

                <div>

                    <h3>
                        ${item.student}
                    </h3>

                    <p>
                        ${item.course} · Caso #${item.id}
                    </p>

                </div>

            </div>

        </div>


        <div class="detail-body">


            <div class="detail-level ${item.level}">

                <div class="detail-level-title">

                    <strong>
                        ${getLevelIcon(item.level)}
                        ${item.alert}
                    </strong>

                    <span class="status ${item.status}">
                        ${getStatusText(item.status)}
                    </span>

                </div>


                <p>
                    ${item.reason}
                </p>

            </div>



            <div class="detail-section">

                <h4>
                    Información
                </h4>

                <p>
                    Fecha de detección:
                    <strong>${item.date}</strong>
                </p>

            </div>



            <div class="detail-section">

                <h4>
                    Señales identificadas
                </h4>


                <div class="indicators">

                    ${item.indicators
                        .map(
                            indicator => `
                                <div class="indicator">
                                    ${indicator}
                                </div>
                            `
                        )
                        .join("")
                    }

                </div>

            </div>



            <div class="detail-section">

                <h4>
                    Historial
                </h4>


                ${
                    item.history.length > 0

                    ?

                    `
                    <div class="history">

                        ${item.history
                            .map(
                                history => `

                                    <div class="history-item">

                                        <span>
                                            ${history.date}
                                        </span>

                                        <p>
                                            ${history.text}
                                        </p>

                                    </div>

                                `
                            )
                            .join("")
                        }

                    </div>
                    `

                    :

                    `
                    <p>
                        No hay seguimientos registrados.
                    </p>
                    `
                }

            </div>



            <button
                class="follow-button"
                onclick="registerFollowUp(${item.id})"
            >
                + Registrar seguimiento
            </button>

        </div>

    `;

}



/* =========================================
   REGISTRAR SEGUIMIENTO
========================================= */

function registerFollowUp(id) {

    const item =
        cases.find(
            caseItem => caseItem.id === id
        );


    if (!item) return;


    const today =
        new Date().toLocaleDateString(
            "es-CO"
        );


    item.level =
        "follow";


    item.alert =
        "En seguimiento";


    item.status =
        "followup";


    item.history.push({

        date: today,

        text:
            "Se registró un nuevo seguimiento del caso."

    });


    updateSummary();

    renderCases();

    showDetail(item);

}



/* =========================================
   INICIALES
========================================= */

function getInitials(name) {

    const words =
        name.trim().split(" ");


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}



/* =========================================
   ICONO ALERTA
========================================= */

function getLevelIcon(level) {

    if (level === "high") {

        return "🔴";

    }


    if (level === "medium") {

        return "🟠";

    }


    return "🟢";

}



/* =========================================
   ESTADO
========================================= */

function getStatusText(status) {

    const statusNames = {

        pending: "Pendiente",

        followup: "En seguimiento",

        attended: "Atendido"

    };


    return (
        statusNames[status] ||
        status
    );

}



/* =========================================
   MENÚ MOBILE
========================================= */

function setupMobileMenu() {

    const menu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    menu.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );


    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 768
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );

                        overlay.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });

}