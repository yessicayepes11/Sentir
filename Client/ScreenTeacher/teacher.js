/* =========================================================
   SENTIR - PANEL DOCENTE
========================================================= */


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

const sidebar = document.getElementById("sidebar");
const openSidebar = document.getElementById("openSidebar");
const closeSidebar = document.getElementById("closeSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");


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
   NAVEGACIÓN DEL SIDEBAR
========================================================= */

const navigationButtons =
    document.querySelectorAll(".nav-item");


navigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        navigationButtons.forEach(item => {

            item.classList.remove("active");

        });


        button.classList.add("active");


        const section =
            button.dataset.section;


        if (section === "casos") {

            scrollToSection("casos");

        }

        else if (section === "inicio") {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        closeMenu();

    });

});


/* =========================================================
   BOTONES DE ACCIÓN
========================================================= */

const sectionButtons =
    document.querySelectorAll(
        "[data-scroll]"
    );


sectionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const target =
                button.dataset.scroll;

            scrollToSection(target);

        }
    );

});


function scrollToSection(id) {

    const element =
        document.getElementById(id);

    if (!element) return;


    const offset = 90;

    const position =
        element.getBoundingClientRect().top
        +
        window.scrollY
        -
        offset;


    window.scrollTo({

        top: position,

        behavior: "smooth"

    });

}


/* =========================================================
   ACCIONES RÁPIDAS
========================================================= */

const actionButtons =
    document.querySelectorAll(
        ".action-card"
    );


actionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const section =
                button.dataset.section;

            if (section === "casos") {

                scrollToSection("casos");

            }

            else if (section === "recursos") {

                showMessage(
                    "Recursos y consejos",
                    "Aquí podrás consultar estrategias y recursos para apoyar a tus estudiantes."
                );

            }

            else if (section === "reportes") {

                showMessage(
                    "Reportes",
                    "Aquí podrás consultar los informes y estadísticas disponibles para tu grupo."
                );

            }

        }
    );

});


/* =========================================================
   MENSAJE TEMPORAL
========================================================= */

function showMessage(title, text) {

    const existing =
        document.querySelector(".custom-notification");


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement("div");


    notification.className =
        "custom-notification";


    notification.innerHTML = `

        <div class="custom-notification-icon">
            ✦
        </div>

        <div>

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
            () => notification.remove()
        );


    setTimeout(() => {

        if (notification.parentElement) {

            notification.remove();

        }

    }, 4500);

}


/* =========================================================
   ESTILOS DE NOTIFICACIÓN
========================================================= */

const notificationStyle =
    document.createElement("style");


notificationStyle.textContent = `

.custom-notification {

    position: fixed;

    right: 25px;

    bottom: 25px;

    width: min(360px, calc(100vw - 30px));

    padding: 17px;

    display: flex;

    align-items: center;

    gap: 12px;

    border-radius: 18px;

    background: rgba(255,255,255,.96);

    backdrop-filter: blur(20px);

    box-shadow:
        0 20px 50px rgba(78,47,199,.18);

    border:
        1px solid rgba(108,77,246,.10);

    z-index: 9999;

    animation:
        notificationIn .3s ease;

}

.custom-notification-icon {

    min-width: 38px;

    height: 38px;

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

.custom-notification strong {

    display: block;

    font-size: 11px;

    color: #171638;

    margin-bottom: 3px;

}

.custom-notification p {

    font-size: 8px;

    line-height: 1.5;

    color: #6D6B86;

}

.custom-notification button {

    margin-left: auto;

    align-self: flex-start;

    background: transparent;

    color: #6D6B86;

    font-size: 18px;

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
   BOTÓN "VER TODOS"
========================================================= */

const viewAll =
    document.querySelector(".view-all");


if (viewAll) {

    viewAll.addEventListener(
        "click",
        () => {

            showMessage(
                "Alertas y casos",
                "Esta sección estará disponible para consultar y gestionar las alertas correspondientes al rol docente."
            );

        }
    );

}


/* =========================================================
   BOTONES DE MÁS OPCIONES
========================================================= */

const moreButton =
    document.querySelector(".more-button");


if (moreButton) {

    moreButton.addEventListener(
        "click",
        () => {

            showMessage(
                "Panorama emocional",
                "El panel muestra información general del bienestar del grupo."
            );

        }
    );

}


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
                "Tienes 3 alertas que requieren revisión."
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.querySelector(
        ".logout-button"
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

                /*
                 * Aquí posteriormente puedes
                 * conectar tu sistema real
                 * de autenticación.
                 */

                window.location.href =
                    "index.html";

            }

        }
    );

}


/* =========================================================
   ANIMACIÓN SUAVE DE TARJETAS
========================================================= */

const cards =
    document.querySelectorAll(
        ".metric-card, .large-card"
    );


const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },

        {
            threshold: .1
        }

    );


cards.forEach(card => {

    observer.observe(card);

});