// ======================================================
// DOM
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


const inicioNav =
    byId("inicioNav");


const usuariosNav =
    byId("usuariosNav");


const heroAddUser =
    byId("heroAddUser");


const heroViewUsers =
    byId("heroViewUsers");


const quickRegister =
    byId("quickRegister");


const quickUsers =
    byId("quickUsers");


const quickReport =
    byId("quickReport");


const viewActivity =
    byId("viewActivity");


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

function openSidebar() {

    sidebar.classList.add(
        "open"
    );


    sidebarOverlay.classList.add(
        "show"
    );


    menuIcon.textContent =
        "×";


    document.body.style.overflow =
        "hidden";

}


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

        if (
            sidebar.classList.contains(
                "open"
            )
        ) {

            closeSidebar();

        }

        else {

            openSidebar();

        }

    }

);


sidebarOverlay.addEventListener(

    "click",

    closeSidebar

);


// ======================================================
// NAVEGACIÓN
// ======================================================

inicioNav.addEventListener(

    "click",

    () => {

        if (
            window.innerWidth <=
            900
        ) {

            closeSidebar();

        }

    }

);


function goToUsers() {

    window.location.href =
        "Users.html";

}


usuariosNav.addEventListener(

    "click",

    goToUsers

);


heroViewUsers.addEventListener(

    "click",

    goToUsers

);


quickUsers.addEventListener(

    "click",

    goToUsers

);


// ======================================================
// REGISTRO DE USUARIO
// ======================================================

function goToRegisterUser() {

    /*
    Esto abre Users.html.
    Luego, si quieres, podemos hacer
    que abra directamente el modal.
    */

    window.location.href =
        "Users.html";

}


heroAddUser.addEventListener(

    "click",

    goToRegisterUser

);


quickRegister.addEventListener(

    "click",

    goToRegisterUser

);


// ======================================================
// ACTIVIDAD
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
// GRÁFICO
// ======================================================

function createRolesChart() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const canvas =
        byId("rolesChart");


    if (!canvas) {

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


                        hoverOffset:
                            4

                    }

                ]

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                cutout:
                    "70%",


                plugins: {

                    legend: {

                        display:
                            false

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


        const value =

            globalSearch.value
                .trim();


        if (!value) {

            showToast(
                "Escribe algo para buscar"
            );


            return;

        }


        showToast(
            `Buscando: ${value}`
        );

    }

);


// ======================================================
// ACCIONES SIN PANTALLA AÚN
// ======================================================

quickReport.addEventListener(

    "click",

    () => {

        showToast(
            "El resumen completo se conectará después"
        );

    }

);


viewActivity.addEventListener(

    "click",

    () => {

        showToast(
            "Aquí podremos mostrar el historial completo"
        );

    }

);


// ======================================================
// ESC
// ======================================================

document.addEventListener(

    "keydown",

    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeSidebar();

        }

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
// INICIO
// ======================================================

function init() {

    renderActivity();


    setTimeout(

        () => {

            refreshIcons();

            createRolesChart();

        },

        350

    );

}


init();