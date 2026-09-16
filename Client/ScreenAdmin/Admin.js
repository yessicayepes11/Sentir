// ======================================================
// SENTIR - INICIO ADMINISTRADOR
// ======================================================


const byId =
    id =>
        document.getElementById(id);


const sidebar =
    byId("sidebar");


const sidebarOverlay =
    byId("sidebarOverlay");


const mobileMenuButton =
    byId("mobileMenuButton");


const menuIcon =
    byId("menuIcon");


const usuariosNav =
    byId("usuariosNav");


const quickExport =
    byId("quickExport");


const quickDuplicates =
    byId("quickDuplicates");


const globalSearch =
    byId("globalSearch");


const activityList =
    byId("activityList");


const toast =
    byId("toast");


const toastText =
    byId("toastText");


// ======================================================
// ICONOS
// ======================================================

function refreshIcons() {

    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}


// ======================================================
// TOAST
// ======================================================

function showToast(message) {

    toastText.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2400
    );

}


// ======================================================
// SIDEBAR
// ======================================================

function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "show"
    );


    menuIcon.textContent =
        "☰";


    document.body.style.overflow =
        "";

}


mobileMenuButton.addEventListener(
    "click",
    () => {

        const open =
            sidebar.classList.toggle(
                "open"
            );


        sidebarOverlay.classList.toggle(
            "show",
            open
        );


        menuIcon.textContent =
            open
                ? "×"
                : "☰";


        document.body.style.overflow =
            open
                ? "hidden"
                : "";

    }
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


// ======================================================
// NAVEGACIÓN
// ======================================================

usuariosNav.addEventListener(
    "click",
    () => {

        window.location.href =
            "Users.html";

    }
);


// ======================================================
// ACCIONES RÁPIDAS
// ======================================================

quickExport.addEventListener(
    "click",
    () => {

        window.location.href =
            "ExportUsers.html";

    }
);


quickDuplicates.addEventListener(
    "click",
    () => {

        window.location.href =
            "Duplicates.html";

    }
);


// ======================================================
// ACTIVIDAD RECIENTE
// ======================================================

const recentActivity = [

    {
        type:
            "register",

        icon:
            "user-round-plus",

        title:
            "Nuevo usuario registrado",

        description:
            "Valentina García · Estudiante",

        time:
            "Hace 2 h"
    },


    {
        type:
            "edit",

        icon:
            "pencil",

        title:
            "Usuario actualizado",

        description:
            "Daniela Castro · Docente",

        time:
            "Hace 5 h"
    },


    {
        type:
            "register",

        icon:
            "user-round-plus",

        title:
            "Nuevo usuario registrado",

        description:
            "Camila López · Psicóloga",

        time:
            "Ayer"
    },


    {
        type:
            "delete",

        icon:
            "trash-2",

        title:
            "Usuario eliminado",

        description:
            "Registro removido del sistema",

        time:
            "Ayer"
    }

];


function renderActivity() {

    activityList.innerHTML =
        "";


    recentActivity.forEach(
        activity => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            item.innerHTML = `

                <div
                    class="
                        activity-icon
                        ${activity.type}
                    "
                >

                    <i
                        data-lucide="${activity.icon}"
                    ></i>

                </div>


                <div class="activity-copy">

                    <strong>
                        ${activity.title}
                    </strong>

                    <p>
                        ${activity.description}
                    </p>

                </div>


                <span class="activity-time">
                    ${activity.time}
                </span>

            `;


            activityList.appendChild(
                item
            );

        }
    );


    refreshIcons();

}


// ======================================================
// GRÁFICA
// ======================================================

function createRolesChart() {

    const canvas =
        byId("rolesChart");


    if (!canvas) {

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        setTimeout(
            createRolesChart,
            300
        );

        return;

    }


    new Chart(
        canvas,
        {

            type:
                "doughnut",


            data: {

                labels: [

                    "Estudiantes",
                    "Docentes",
                    "UAI",
                    "Psicóloga",
                    "Directivos",
                    "Comité"

                ],


                datasets: [

                    {

                        data: [

                            86,
                            18,
                            6,
                            5,
                            7,
                            6

                        ],


                        backgroundColor: [

                            "#4195F5",
                            "#668DF0",
                            "#9A5BF3",
                            "#CC72EE",
                            "#5D70E3",
                            "#AA60D4"

                        ],


                        borderWidth:
                            0,


                        spacing:
                            2,


                        hoverOffset:
                            5

                    }

                ]

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                cutout:
                    "72%",


                plugins: {

                    legend: {

                        display:
                            false

                    },


                    tooltip: {

                        enabled:
                            true

                    }

                }

            }

        }
    );

}


// ======================================================
// BUSCADOR
// ======================================================

globalSearch.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Enter"
        ) {

            return;

        }


        const search =
            globalSearch.value
                .trim();


        if (!search) {

            showToast(
                "Escribe un usuario para buscar"
            );

            return;

        }


        window.location.href =
            `Users.html?search=${encodeURIComponent(search)}`;

    }
);


// ======================================================
// RESPONSIVE
// ======================================================

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth >
            900
        ) {

            closeSidebar();

        }

    }
);


// ======================================================
// INIT
// ======================================================

function init() {

    renderActivity();


    setTimeout(
        refreshIcons,
        200
    );


    setTimeout(
        createRolesChart,
        500
    );

}


init();