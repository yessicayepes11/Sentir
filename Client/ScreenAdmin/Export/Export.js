// =====================================================
// SENTIR - EXPORTAR USUARIOS
// =====================================================


// =====================================================
// DATOS TEMPORALES
// =====================================================

const users = [

    {
        name:
            "Valentina García",

        document:
            "1023456789",

        email:
            "valentina.garcia@est.edu",

        phone:
            "3001234567",

        role:
            "Estudiante",

        grade:
            "9°",

        status:
            "Activo"
    },


    {
        name:
            "Mateo Rodríguez",

        document:
            "1008765432",

        email:
            "mateo.rodriguez@est.edu",

        phone:
            "3014567890",

        role:
            "Estudiante",

        grade:
            "10°",

        status:
            "Activo"
    },


    {
        name:
            "Daniela Castro",

        document:
            "43765432",

        email:
            "daniela.castro@sentir.edu",

        phone:
            "3024546712",

        role:
            "Docente",

        grade:
            "",

        status:
            "Activo"
    },


    {
        name:
            "Camila López",

        document:
            "1098765432",

        email:
            "camila.lopez@sentir.edu",

        phone:
            "3103422190",

        role:
            "Psicóloga",

        grade:
            "",

        status:
            "Activo"
    },


    {
        name:
            "María González",

        document:
            "52678901",

        email:
            "maria.gonzalez@sentir.edu",

        phone:
            "3151112233",

        role:
            "UAI",

        grade:
            "",

        status:
            "Activo"
    },


    {
        name:
            "Laura Méndez",

        document:
            "43567890",

        email:
            "laura.mendez@sentir.edu",

        phone:
            "3127659087",

        role:
            "Directivo",

        grade:
            "",

        status:
            "Inactivo"
    },


    {
        name:
            "Sofía Pérez",

        document:
            "1002233445",

        email:
            "sofia.perez@est.edu",

        phone:
            "3004455667",

        role:
            "Estudiante",

        grade:
            "8°",

        status:
            "Pendiente"
    },


    {
        name:
            "Ana Torres",

        document:
            "52123456",

        email:
            "ana.torres@sentir.edu",

        phone:
            "3112223344",

        role:
            "Comité de convivencia",

        grade:
            "",

        status:
            "Activo"
    }

];


// =====================================================
// DOM
// =====================================================

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


const roleFilter =
    byId("roleFilter");


const statusFilter =
    byId("statusFilter");


const clearFilters =
    byId("clearFilters");


const exportButton =
    byId("exportButton");


const previewBody =
    byId("previewBody");


const previewCount =
    byId("previewCount");


const totalAvailable =
    byId("totalAvailable");


const selectedCount =
    byId("selectedCount");


const selectedFormatText =
    byId("selectedFormatText");


const toast =
    byId("toast");


const toastText =
    byId("toastText");


let selectedFormat =
    "csv";


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
// FILTROS
// =====================================================

function getFilteredUsers() {

    return users.filter(
        user => {

            const roleMatch =

                !roleFilter.value
                ||
                user.role ===
                    roleFilter.value;


            const statusMatch =

                !statusFilter.value
                ||
                user.status ===
                    statusFilter.value;


            return (
                roleMatch
                &&
                statusMatch
            );

        }
    );

}


// =====================================================
// TABLA
// =====================================================

function renderPreview() {

    const filtered =
        getFilteredUsers();


    previewBody.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        previewBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#8A86A8;
                    "
                >

                    No hay usuarios con estos filtros.

                </td>

            </tr>

        `;

    }

    else {

        filtered.forEach(
            user => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${user.name}
                    </td>

                    <td>
                        ${user.document}
                    </td>

                    <td>
                        ${user.email}
                    </td>

                    <td>

                        <span class="table-role">

                            ${user.role}

                        </span>

                    </td>

                    <td>

                        <span
                            class="
                                table-status
                                ${user.status.toLowerCase()}
                            "
                        >

                            ${user.status}

                        </span>

                    </td>

                `;


                previewBody.appendChild(
                    row
                );

            }
        );

    }


    totalAvailable.textContent =
        users.length;


    selectedCount.textContent =
        filtered.length;


    previewCount.textContent =
        `${filtered.length} registros`;

}


// =====================================================
// FORMATO
// =====================================================

document
    .querySelectorAll(
        ".format-card"
    )
    .forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".format-card"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    card.classList.add(
                        "active"
                    );


                    selectedFormat =
                        card.dataset.format;


                    selectedFormatText.textContent =

                        selectedFormat ===
                        "csv"

                            ? "CSV"

                            : "JSON";

                }
            );

        }
    );


// =====================================================
// EXPORTAR CSV
// =====================================================

function exportCSV(data) {

    const headers = [

        "Nombre",
        "Documento",
        "Correo",
        "Celular",
        "Rol",
        "Grado",
        "Estado"

    ];


    const rows =
        data.map(
            user => [

                user.name,
                user.document,
                user.email,
                user.phone,
                user.role,
                user.grade,
                user.status

            ]
        );


    const csv =
        [

            headers,
            ...rows

        ]
        .map(
            row =>

                row
                    .map(
                        value => {

                            const clean =
                                String(
                                    value ?? ""
                                )
                                .replaceAll(
                                    '"',
                                    '""'
                                );


                            return `"${clean}"`;

                        }
                    )
                    .join(";")

        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    downloadBlob(
        blob,
        "usuarios-sentir.csv"
    );

}


// =====================================================
// EXPORTAR JSON
// =====================================================

function exportJSON(data) {

    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    downloadBlob(
        blob,
        "usuarios-sentir.json"
    );

}


// =====================================================
// DESCARGAR
// =====================================================

function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


// =====================================================
// EXPORTAR
// =====================================================

exportButton.addEventListener(
    "click",
    () => {

        const filtered =
            getFilteredUsers();


        if (
            filtered.length === 0
        ) {

            showToast(
                "No hay usuarios para exportar"
            );

            return;

        }


        if (
            selectedFormat ===
            "csv"
        ) {

            exportCSV(
                filtered
            );

        }

        else {

            exportJSON(
                filtered
            );

        }


        showToast(
            `${filtered.length} usuarios exportados correctamente`
        );

    }
);


// =====================================================
// RESTABLECER
// =====================================================

clearFilters.addEventListener(
    "click",
    () => {

        roleFilter.value =
            "";


        statusFilter.value =
            "";


        renderPreview();


        showToast(
            "Filtros restablecidos"
        );

    }
);


// =====================================================
// CAMBIO DE FILTROS
// =====================================================

roleFilter.addEventListener(
    "change",
    renderPreview
);


statusFilter.addEventListener(
    "change",
    renderPreview
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
// ESCAPE
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

    renderPreview();


    setTimeout(
        refreshIcons,
        200
    );

}


init();