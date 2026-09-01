/* =========================================================
   SENTIR - ESTUDIANTES
========================================================= */


/* =========================================================
   LISTA DE ESTUDIANTES
========================================================= */

/*
 * Aquí puedes cambiar los nombres de los estudiantes
 * cuando tengas la lista real de la institución.
 *
 * El curso determina dónde aparecerá cada estudiante.
 */

const students = [

    /* =======================
       SEXTO
    ======================== */

    {
        name: "Estudiante 1",
        course: "6°1",
        status: "Estable"
    },

    {
        name: "Estudiante 2",
        course: "6°1",
        status: "Estable"
    },

    {
        name: "Estudiante 3",
        course: "6°2",
        status: "Atención"
    },

    {
        name: "Estudiante 4",
        course: "6°2",
        status: "Estable"
    },

    {
        name: "Estudiante 5",
        course: "6°3",
        status: "Estable"
    },

    {
        name: "Estudiante 6",
        course: "6°3",
        status: "Atención"
    },

    {
        name: "Estudiante 7",
        course: "6°4",
        status: "Estable"
    },

    {
        name: "Estudiante 8",
        course: "6°4",
        status: "Estable"
    },

    {
        name: "Estudiante 9",
        course: "6°5",
        status: "Riesgo"
    },

    {
        name: "Estudiante 10",
        course: "6°5",
        status: "Estable"
    },


    /* =======================
       SÉPTIMO
    ======================== */

    {
        name: "Estudiante 11",
        course: "7°1",
        status: "Estable"
    },

    {
        name: "Estudiante 12",
        course: "7°1",
        status: "Atención"
    },

    {
        name: "Estudiante 13",
        course: "7°2",
        status: "Estable"
    },

    {
        name: "Estudiante 14",
        course: "7°2",
        status: "Estable"
    },

    {
        name: "Estudiante 15",
        course: "7°3",
        status: "Riesgo"
    },

    {
        name: "Estudiante 16",
        course: "7°3",
        status: "Atención"
    },

    {
        name: "Estudiante 17",
        course: "7°4",
        status: "Estable"
    },

    {
        name: "Estudiante 18",
        course: "7°4",
        status: "Estable"
    },


    /* =======================
       OCTAVO
    ======================== */

    {
        name: "Estudiante 19",
        course: "8°1",
        status: "Estable"
    },

    {
        name: "Estudiante 20",
        course: "8°1",
        status: "Atención"
    },

    {
        name: "Estudiante 21",
        course: "8°2",
        status: "Estable"
    },

    {
        name: "Estudiante 22",
        course: "8°2",
        status: "Estable"
    },

    {
        name: "Estudiante 23",
        course: "8°3",
        status: "Riesgo"
    },

    {
        name: "Estudiante 24",
        course: "8°3",
        status: "Estable"
    },


    /* =======================
       NOVENO
    ======================== */

    {
        name: "Estudiante 25",
        course: "9°1",
        status: "Estable"
    },

    {
        name: "Estudiante 26",
        course: "9°1",
        status: "Atención"
    },

    {
        name: "Estudiante 27",
        course: "9°2",
        status: "Estable"
    },

    {
        name: "Estudiante 28",
        course: "9°2",
        status: "Estable"
    },

    {
        name: "Estudiante 29",
        course: "9°3",
        status: "Riesgo"
    },

    {
        name: "Estudiante 30",
        course: "9°3",
        status: "Atención"
    },


    /* =======================
       DÉCIMO
    ======================== */

    {
        name: "Estudiante 31",
        course: "10°1",
        status: "Estable"
    },

    {
        name: "Estudiante 32",
        course: "10°1",
        status: "Atención"
    },

    {
        name: "Estudiante 33",
        course: "10°2",
        status: "Estable"
    },

    {
        name: "Estudiante 34",
        course: "10°2",
        status: "Estable"
    },

    {
        name: "Estudiante 35",
        course: "10°3",
        status: "Riesgo"
    },

    {
        name: "Estudiante 36",
        course: "10°3",
        status: "Atención"
    },

    {
        name: "Estudiante 37",
        course: "10°4",
        status: "Estable"
    },

    {
        name: "Estudiante 38",
        course: "10°4",
        status: "Estable"
    },


    /* =======================
       UNDÉCIMO
    ======================== */

    {
        name: "Estudiante 39",
        course: "11°1",
        status: "Estable"
    },

    {
        name: "Estudiante 40",
        course: "11°1",
        status: "Atención"
    },

    {
        name: "Estudiante 41",
        course: "11°2",
        status: "Estable"
    },

    {
        name: "Estudiante 42",
        course: "11°2",
        status: "Estable"
    },

    {
        name: "Estudiante 43",
        course: "11°3",
        status: "Riesgo"
    },

    {
        name: "Estudiante 44",
        course: "11°3",
        status: "Atención"
    },

    {
        name: "Estudiante 45",
        course: "11°4",
        status: "Estable"
    },

    {
        name: "Estudiante 46",
        course: "11°4",
        status: "Estable"
    }

];



/* =========================================================
   ELEMENTOS DEL DOM
========================================================= */

const courseFilter =
    document.getElementById("courseFilter");

const studentsList =
    document.getElementById("studentsList");

const studentCount =
    document.getElementById("studentCount");

const selectedCourseText =
    document.getElementById("selectedCourseText");

const emptyState =
    document.getElementById("emptyState");



/* =========================================================
   MOSTRAR ESTUDIANTES
========================================================= */

function renderStudents(course = "todos") {

    studentsList.innerHTML = "";


    /* FILTRAR */

    let filteredStudents;


    if (course === "todos") {

        filteredStudents = students;

    } else {

        filteredStudents =
            students.filter(
                student =>
                    student.course === course
            );

    }


    /* ACTUALIZAR CONTADOR */

    studentCount.textContent =
        filteredStudents.length;


    /* TEXTO DEL CURSO */

    if (course === "todos") {

        selectedCourseText.textContent =
            "Mostrando estudiantes de todos los cursos.";

    } else {

        selectedCourseText.textContent =
            `Estudiantes del curso ${course}`;

    }


    /* SI NO HAY ESTUDIANTES */

    if (filteredStudents.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    /* CREAR FILAS */

    filteredStudents.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            let statusClass =
                "status-stable";


            if (student.status === "Atención") {

                statusClass =
                    "status-attention";

            }


            if (student.status === "Riesgo") {

                statusClass =
                    "status-risk";

            }


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${student.name}
                </td>

                <td>
                    ${student.course}
                </td>

                <td>

                    <span
                        class="emotional-status ${statusClass}"
                    >

                        <span>●</span>

                        ${student.status}

                    </span>

                </td>

            `;


            studentsList.appendChild(row);

        }
    );

}



/* =========================================================
   CAMBIO DE CURSO
========================================================= */

if (courseFilter) {

    courseFilter.addEventListener(
        "change",
        () => {

            const selectedCourse =
                courseFilter.value;


            renderStudents(
                selectedCourse
            );

        }
    );

}



/* =========================================================
   SIDEBAR MOBILE
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const openSidebar =
    document.getElementById("openSidebar");

const closeSidebar =
    document.getElementById("closeSidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


function openMenu() {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("active");

}


function closeMenu() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("active");

}


if (openSidebar) {

    openSidebar.addEventListener(
        "click",
        openMenu
    );

}


if (closeSidebar) {

    closeSidebar.addEventListener(
        "click",
        closeMenu
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeMenu
    );

}



/* =========================================================
   NAVEGACIÓN
========================================================= */

const navigationButtons =
    document.querySelectorAll(".nav-item");


navigationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                navigationButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                const section =
                    button.dataset.section;


                if (section === "inicio") {

                    window.location.href =
                        "index.html";

                }


                if (section === "estudiantes") {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }


                if (section === "casos") {

                    showMessage(
                        "Casos y alertas",
                        "Aquí podrás consultar las alertas y situaciones que requieren seguimiento."
                    );

                }


                if (section === "recursos") {

                    showMessage(
                        "Recursos",
                        "Aquí podrás consultar estrategias y recursos para acompañar a tus estudiantes."
                    );

                }


                if (section === "reportes") {

                    showMessage(
                        "Reportes",
                        "Aquí podrás consultar los informes y estadísticas disponibles."
                    );

                }


                closeMenu();

            }
        );

    }
);



/* =========================================================
   NOTIFICACIONES
========================================================= */

const notificationButton =
    document.querySelector(
        ".notification-button"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            showMessage(
                "Notificaciones",
                "Tienes alertas que requieren revisión."
            );

        }
    );

}



/* =========================================================
   MENSAJES
========================================================= */

function showMessage(
    title,
    text
) {

    const existing =
        document.querySelector(
            ".custom-notification"
        );


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "custom-notification";


    notification.innerHTML = `

        <div class="custom-notification-icon">
            ✦
        </div>

        <div class="notification-content">

            <strong>
                ${title}
            </strong>

            <p>
                ${text}
            </p>

        </div>

        <button>
            ×
        </button>

    `;


    document.body.appendChild(
        notification
    );


    notification
        .querySelector("button")
        .addEventListener(
            "click",
            () =>
                notification.remove()
        );


    setTimeout(
        () => {

            if (
                notification.parentElement
            ) {

                notification.remove();

            }

        },
        4500
    );

}



/* =========================================================
   ESTILOS DE NOTIFICACIÓN
========================================================= */

const notificationStyle =
    document.createElement(
        "style"
    );


notificationStyle.textContent = `

.custom-notification {

    position: fixed;

    right: 25px;

    bottom: 25px;

    width: min(
        390px,
        calc(100vw - 30px)
    );

    padding: 18px;

    display: flex;

    align-items: flex-start;

    gap: 13px;

    border-radius: 18px;

    background:
        rgba(255,255,255,.97);

    backdrop-filter:
        blur(20px);

    box-shadow:
        0 20px 50px
        rgba(78,47,199,.18);

    border:
        1px solid
        rgba(108,77,246,.10);

    z-index: 9999;

    animation:
        notificationIn .3s ease;

}


.custom-notification-icon {

    min-width: 40px;

    height: 40px;

    display: grid;

    place-items: center;

    border-radius: 12px;

    color: white;

    background:
        linear-gradient(
            135deg,
            #6C4DF6,
            #65B8FF
        );

}


.notification-content {

    flex: 1;

}


.custom-notification strong {

    display: block;

    font-size: 14px;

    color: #171638;

    margin-bottom: 4px;

}


.custom-notification p {

    font-size: 12px;

    line-height: 1.5;

    color: #6D6B86;

}


.custom-notification button {

    border: none;

    background: transparent;

    color: #6D6B86;

    font-size: 20px;

    cursor: pointer;

}


@keyframes notificationIn {

    from {

        opacity: 0;

        transform:
            translateY(20px);

    }

    to {

        opacity: 1;

        transform:
            translateY(0);

    }

}

`;


document.head.appendChild(
    notificationStyle
);



/* =========================================================
   CERRAR SESIÓN
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "¿Deseas cerrar tu sesión?"
                );


            if (confirmLogout) {

                window.location.href =
                    "index.html";

            }

        }
    );

}



/* =========================================================
   INICIAR
========================================================= */

renderStudents("todos");