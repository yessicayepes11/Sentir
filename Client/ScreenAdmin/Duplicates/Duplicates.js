// =====================================================
// SENTIR - BUSCAR DUPLICADOS
// =====================================================


// =====================================================
// DATOS TEMPORALES
// =====================================================

const users = [

    {
        id: 1,

        name:
            "Valentina García",

        document:
            "1023456789",

        email:
            "valentina.garcia@est.edu",

        role:
            "Estudiante"
    },


    {
        id: 2,

        name:
            "Mateo Rodríguez",

        document:
            "1008765432",

        email:
            "mateo.rodriguez@est.edu",

        role:
            "Estudiante"
    },


    {
        id: 3,

        name:
            "Daniela Castro",

        document:
            "43765432",

        email:
            "daniela.castro@sentir.edu",

        role:
            "Docente"
    },


    {
        id: 4,

        name:
            "Daniela C. Castro",

        document:
            "43765432",

        email:
            "daniela.c.castro@sentir.edu",

        role:
            "Docente"
    },


    {
        id: 5,

        name:
            "Camila López",

        document:
            "1098765432",

        email:
            "camila.lopez@sentir.edu",

        role:
            "Psicóloga"
    },


    {
        id: 6,

        name:
            "Camila L. López",

        document:
            "1092222111",

        email:
            "camila.lopez@sentir.edu",

        role:
            "Psicóloga"
    },


    {
        id: 7,

        name:
            "María González",

        document:
            "52678901",

        email:
            "maria.gonzalez@sentir.edu",

        role:
            "UAI"
    },


    {
        id: 8,

        name:
            "Laura Méndez",

        document:
            "43567890",

        email:
            "laura.mendez@sentir.edu",

        role:
            "Directivo"
    }

];


// =====================================================
// DOM
// =====================================================

const byId =
    id =>
        document.getElementById(id);


const duplicateList =
    byId("duplicateList");


const emptyState =
    byId("emptyState");


const analysedCount =
    byId("analysedCount");


const duplicateGroups =
    byId("duplicateGroups");


const cleanUsers =
    byId("cleanUsers");


const scanButton =
    byId("scanButton");


const toast =
    byId("toast");


const toastText =
    byId("toastText");


const sidebar =
    byId("sidebar");


const sidebarOverlay =
    byId("sidebarOverlay");


const menuIcon =
    byId("menuIcon");


const mobileMenuButton =
    byId("mobileMenuButton");


let duplicates =
    [];


let currentFilter =
    "all";


// =====================================================
// ICONOS
// =====================================================

function refreshIcons() {

    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}


// =====================================================
// TOAST
// =====================================================

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


// =====================================================
// SIDEBAR
// =====================================================

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


// =====================================================
// NAVEGACIÓN
// =====================================================

byId("inicioNav")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "Admin.html";

        }
    );


byId("usuariosNav")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "Users.html";

        }
    );


byId("backButton")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "Admin.html";

        }
    );


// =====================================================
// BUSCAR DUPLICADOS
// =====================================================

function findDuplicateGroups(
    key,
    type
) {

    const map =
        {};


    users.forEach(
        user => {

            const value =
                String(
                    user[key] || ""
                )
                .trim()
                .toLowerCase();


            if (!value) {

                return;

            }


            if (
                !map[value]
            ) {

                map[value] =
                    [];

            }


            map[value].push(
                user
            );

        }
    );


    return Object
        .entries(map)
        .filter(
            ([, matches]) =>
                matches.length > 1
        )
        .map(
            ([value, matches]) => ({

                type:
                    type,

                value:
                    value,

                users:
                    matches

            })
        );

}


// =====================================================
// INICIALES
// =====================================================

function getInitials(name) {

    return name
        .split(" ")
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0)
        )
        .join("")
        .toUpperCase();

}


// =====================================================
// RESUMEN
// =====================================================

function updateSummary() {

    analysedCount.textContent =
        users.length;


    duplicateGroups.textContent =
        duplicates.length;


    const duplicateUserIds =
        new Set();


    duplicates.forEach(
        group => {

            group.users.forEach(
                user => {

                    duplicateUserIds.add(
                        user.id
                    );

                }
            );

        }
    );


    cleanUsers.textContent =
        users.length -
        duplicateUserIds.size;

}


// =====================================================
// RENDER
// =====================================================

function renderDuplicates() {

    const filtered =

        currentFilter ===
        "all"

            ? duplicates

            : duplicates.filter(
                group =>
                    group.type ===
                    currentFilter
            );


    duplicateList.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );


        emptyState
            .querySelector("h3")
            .textContent =

                duplicates.length

                    ? "No hay coincidencias de este tipo"

                    : "No encontramos duplicados";


        emptyState
            .querySelector("p")
            .textContent =

                duplicates.length

                    ? "Prueba con otro filtro."

                    : "Los documentos y correos analizados no presentan coincidencias.";


        refreshIcons();

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    filtered.forEach(
        group => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "duplicate-group";


            const usersHTML =
                group.users
                    .map(
                        user => `

                            <div class="duplicate-user">

                                <div class="duplicate-avatar">

                                    ${getInitials(user.name)}

                                </div>


                                <div class="duplicate-user-info">

                                    <strong>
                                        ${user.name}
                                    </strong>

                                    <span>
                                        ${user.role}
                                    </span>

                                </div>


                                <div class="duplicate-data">

                                    <span>
                                        ${group.type}
                                    </span>

                                    <strong>

                                        ${
                                            group.type ===
                                            "Documento"

                                                ? user.document

                                                : user.email
                                        }

                                    </strong>

                                </div>


                                <button
                                    class="review-button"
                                    type="button"
                                    data-id="${user.id}"
                                >

                                    <i data-lucide="eye"></i>

                                    Revisar

                                </button>

                            </div>

                        `
                    )
                    .join("");


            card.innerHTML = `

                <div class="duplicate-group-header">

                    <div class="duplicate-alert-icon">

                        <i data-lucide="triangle-alert"></i>

                    </div>


                    <div>

                        <span>

                            Posible duplicado por
                            ${group.type.toLowerCase()}

                        </span>

                        <h3>
                            ${group.value}
                        </h3>

                    </div>


                    <span class="match-count">

                        ${group.users.length}
                        coincidencias

                    </span>

                </div>


                <div class="duplicate-users">

                    ${usersHTML}

                </div>

            `;


            duplicateList.appendChild(
                card
            );

        }
    );


    refreshIcons();

}


// =====================================================
// ANALIZAR
// =====================================================

function scanUsers() {

    const documentDuplicates =
        findDuplicateGroups(
            "document",
            "Documento"
        );


    const emailDuplicates =
        findDuplicateGroups(
            "email",
            "Correo"
        );


    duplicates =
        [

            ...documentDuplicates,
            ...emailDuplicates

        ];


    updateSummary();


    renderDuplicates();


    showToast(
        "Análisis completado"
    );

}


// =====================================================
// FILTROS
// =====================================================

document
    .querySelectorAll(
        ".duplicate-filter-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".duplicate-filter-button"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.type;


                    renderDuplicates();

                }
            );

        }
    );


// =====================================================
// REVISAR
// =====================================================

duplicateList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".review-button"
            );


        if (!button) {

            return;

        }


        const user =
            users.find(
                item =>
                    item.id ===
                    Number(
                        button.dataset.id
                    )
            );


        if (!user) {

            return;

        }


        showToast(
            `Revisando a ${user.name}`
        );

    }
);


// =====================================================
// BOTÓN ANALIZAR
// =====================================================

scanButton.addEventListener(
    "click",
    scanUsers
);


// =====================================================
// RESPONSIVE
// =====================================================

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


// =====================================================
// ESC
// =====================================================

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


// =====================================================
// INIT
// =====================================================

function init() {

    analysedCount.textContent =
        users.length;


    setTimeout(
        refreshIcons,
        200
    );

}


init();