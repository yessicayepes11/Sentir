/* =========================================
   DATOS DE CASOS
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
        reason: "Se han identificado cambios emocionales importantes y una disminución constante en su interacción habitual.",
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
        reason: "Se observan cambios en los registros emocionales durante los últimos días.",
        indicators: [
            "Cambios en el registro emocional",
            "Menor participación en clase",
            "Variaciones en sus interacciones"
        ],
        history: [
            {
                date: "31/08/2026",
                text: "Se realizó un primer acercamiento con el estudiante."
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
        reason: "El estudiante cuenta actualmente con un proceso de acompañamiento.",
        indicators: [
            "Variaciones emocionales recientes",
            "Necesidad de acompañamiento",
            "Seguimiento activo"
        ],
        history: [
            {
                date: "30/08/2026",
                text: "Se inició seguimiento por parte del equipo de acompañamiento."
            },
            {
                date: "01/09/2026",
                text: "Se revisó nuevamente la evolución del caso."
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
        reason: "Se identificó un cambio reciente en sus registros emocionales.",
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
        reason: "Se han identificado señales que requieren acompañamiento prioritario.",
        indicators: [
            "Cambios emocionales persistentes",
            "Aislamiento social",
            "Cambios en el rendimiento académico"
        ],
        history: [
            {
                date: "29/08/2026",
                text: "El caso fue remitido al equipo correspondiente para valoración."
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
        reason: "Se detectaron cambios puntuales que fueron revisados por el equipo de acompañamiento.",
        indicators: [
            "Cambio temporal del estado emocional",
            "Menor interacción"
        ],
        history: [
            {
                date: "28/08/2026",
                text: "Se realizó acompañamiento inicial."
            },
            {
                date: "30/08/2026",
                text: "El caso fue atendido y cerrado."
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
        reason: "Actualmente se encuentra en un proceso de acompañamiento.",
        indicators: [
            "Cambios emocionales recientes",
            "Seguimiento activo"
        ],
        history: [
            {
                date: "27/08/2026",
                text: "Se inició proceso de seguimiento."
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
        reason: "Se identificaron cambios significativos que requieren atención prioritaria.",
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
        reason: "Se identificaron señales de alerta que fueron atendidas.",
        indicators: [
            "Cambios en el comportamiento",
            "Variaciones emocionales"
        ],
        history: [
            {
                date: "25/08/2026",
                text: "Se realizó acompañamiento."
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
        reason: "Se mantiene seguimiento preventivo.",
        indicators: [
            "Cambios leves en el estado emocional",
            "Seguimiento preventivo"
        ],
        history: [
            {
                date: "24/08/2026",
                text: "Se inició seguimiento preventivo."
            }
        ]
    }

];



/* =========================================
   ELEMENTOS
========================================= */

const courseFilter = document.getElementById("courseFilter");
const levelFilter = document.getElementById("levelFilter");
const statusFilter = document.getElementById("statusFilter");

const casesTable = document.getElementById("casesTable");

const resultsCount = document.getElementById("resultsCount");

const emptyState = document.getElementById("emptyState");

const detailCard = document.getElementById("detailCard");
const detailContent = document.getElementById("detailContent");

const highCount = document.getElementById("highCount");
const mediumCount = document.getElementById("mediumCount");
const followCount = document.getElementById("followCount");

const clearFilters = document.getElementById("clearFilters");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");



/* =========================================
   INICIALIZAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateSummary();

    renderCases();

    setupSidebar();

    setupFilters();

    setupButtons();

});



/* =========================================
   RESUMEN
========================================= */

function updateSummary() {

    const high = cases.filter(
        item => item.level === "high"
    ).length;

    const medium = cases.filter(
        item => item.level === "medium"
    ).length;

    const follow = cases.filter(
        item => item.level === "follow"
    ).length;


    highCount.textContent = high;

    mediumCount.textContent = medium;

    followCount.textContent = follow;

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


    clearFilters.addEventListener(
        "click",
        () => {

            courseFilter.value = "all";

            levelFilter.value = "all";

            statusFilter.value = "all";

            renderCases();

            showToast(
                "Filtros limpiados",
                "Se muestran nuevamente todos los casos."
            );

        }
    );

}



/* =========================================
   OBTENER CASOS FILTRADOS
========================================= */

function getFilteredCases() {

    const course = courseFilter.value;

    const level = levelFilter.value;

    const status = statusFilter.value;


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
   RENDERIZAR CASOS
========================================= */

function renderCases() {

    const filteredCases = getFilteredCases();

    casesTable.innerHTML = "";


    resultsCount.textContent =
        filteredCases.length;


    if (filteredCases.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filteredCases.forEach(item => {

        const row =
            document.createElement("tr");


        row.dataset.id = item.id;


        row.innerHTML = `

            <td>

                <div class="student-cell">

                    <div class="student-avatar">

                        ${getInitials(item.student)}

                    </div>

                    <div class="student-name">

                        <strong>
                            ${item.student}
                        </strong>

                        <span>
                            Caso #${item.id}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <span class="course-badge">
                    ${item.course}
                </span>

            </td>


            <td>

                <span class="alert-badge ${item.level}">
                    ${getLevelIcon(item.level)}
                    ${item.alert}
                </span>

            </td>


            <td>

                <span class="date-cell">
                    ${item.date}
                </span>

            </td>


            <td>

                <span class="status-badge ${item.status}">
                    ${getStatusText(item.status)}
                </span>

            </td>

        `;


        row.addEventListener(
            "click",
            () => selectCase(item.id)
        );


        casesTable.appendChild(row);

    });

}



/* =========================================
   SELECCIONAR CASO
========================================= */

function selectCase(id) {

    const item =
        cases.find(caseItem => caseItem.id === id);


    if (!item) return;


    document
        .querySelectorAll("#casesTable tr")
        .forEach(row => {

            row.classList.remove("selected");

        });


    const selectedRow =
        document.querySelector(
            `#casesTable tr[data-id="${id}"]`
        );


    if (selectedRow) {

        selectedRow.classList.add("selected");

    }


    showCaseDetails(item);

}



/* =========================================
   DETALLE
========================================= */

function showCaseDetails(item) {

    detailCard.querySelector(
        ".detail-empty"
    ).style.display = "none";


    detailContent.style.display = "block";


    detailContent.innerHTML = `

        <div class="detail-top">

            <div class="detail-student">

                <div class="detail-avatar">

                    ${getInitials(item.student)}

                </div>

                <div>

                    <h3>
                        ${item.student}
                    </h3>

                    <p>
                        Curso ${item.course} · Caso #${item.id}
                    </p>

                </div>

            </div>

        </div>



        <div class="detail-body">


            <div class="detail-alert ${item.level}">

                <div class="detail-alert-title">

                    <strong>
                        ${getLevelIcon(item.level)}
                        ${item.alert}
                    </strong>

                    <span class="status-badge ${item.status}">
                        ${getStatusText(item.status)}
                    </span>

                </div>

                <p>
                    ${item.reason}
                </p>

            </div>



            <div class="detail-section">

                <h4>
                    Información del caso
                </h4>

                <div class="info-grid">

                    <div class="info-box">

                        <span>
                            FECHA DE DETECCIÓN
                        </span>

                        <strong>
                            ${item.date}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>
                            ESTADO
                        </span>

                        <strong>
                            ${getStatusText(item.status)}
                        </strong>

                    </div>

                </div>

            </div>



            <div class="detail-section">

                <h4>
                    Señales identificadas
                </h4>

                <div class="indicator-list">

                    ${item.indicators
                        .map(indicator => `
                            <div class="indicator">
                                ${indicator}
                            </div>
                        `)
                        .join("")
                    }

                </div>

            </div>



            <div class="detail-section">

                <h4>
                    Historial de seguimiento
                </h4>


                ${
                    item.history.length > 0

                    ?

                    `<div class="follow-history">

                        ${item.history
                            .map(history => `

                                <div class="history-item">

                                    <span class="history-date">
                                        ${history.date}
                                    </span>

                                    <p>
                                        ${history.text}
                                    </p>

                                </div>

                            `)
                            .join("")
                        }

                    </div>`

                    :

                    `<p>
                        Todavía no se ha registrado
                        ningún seguimiento.
                    </p>`
                }

            </div>



            <button
                class="followup-btn"
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
        cases.find(caseItem => caseItem.id === id);


    if (!item) return;


    const today =
        new Date().toLocaleDateString(
            "es-CO"
        );


    item.status = "followup";

    item.level = "follow";

    item.alert = "En seguimiento";


    item.history.push({

        date: today,

        text:
            "Se registró un nuevo seguimiento del caso."

    });


    updateSummary();

    renderCases();

    showCaseDetails(item);


    showToast(
        "Seguimiento registrado",
        `El caso de ${item.student} quedó en seguimiento.`
    );

}



/* =========================================
   INICIALES
========================================= */

function getInitials(name) {

    const parts =
        name.trim().split(" ");


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[1][0]
    ).toUpperCase();

}



/* =========================================
   ICONOS DE NIVEL
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
   ESTADOS
========================================= */

function getStatusText(status) {

    const statusMap = {

        pending: "Pendiente",

        followup: "En seguimiento",

        attended: "Atendido"

    };


    return statusMap[status] ||
        status;

}



/* =========================================
   TOAST
========================================= */

function showToast(
    title,
    message
) {

    toastTitle.textContent = title;

    toastMessage.textContent = message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}



/* =========================================
   BOTONES
========================================= */

function setupButtons() {

    document
        .getElementById("notificationBtn")
        .addEventListener(
            "click",
            () => {

                showToast(
                    "Notificaciones",
                    "Tienes casos que requieren revisión."
                );

            }
        );


    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            () => {

                const confirmLogout =
                    confirm(
                        "¿Deseas cerrar sesión?"
                    );


                if (confirmLogout) {

                    window.location.href =
                        "login.html";

                }

            }
        );


    document
        .getElementById("sortBtn")
        .addEventListener(
            "click",
            () => {

                cases.reverse();

                renderCases();

                showToast(
                    "Orden actualizado",
                    "Los casos fueron reorganizados."
                );

            }
        );

}



/* =========================================
   SIDEBAR RESPONSIVE
========================================= */

function setupSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    const open =
        document.getElementById("openSidebar");

    const close =
        document.getElementById("closeSidebar");


    open.addEventListener(
        "click",
        () => {

            sidebar.classList.add("open");

            overlay.classList.add("show");

        }
    );


    close.addEventListener(
        "click",
        () => {

            sidebar.classList.remove("open");

            overlay.classList.remove("show");

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove("open");

            overlay.classList.remove("show");

        }
    );


    document
        .querySelectorAll(".nav-item")
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