// =====================================================
// SENTIR - EXPORTAR USUARIOS
// =====================================================


// =====================================================
// DATOS TEMPORALES
// =====================================================

let users = [];


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
    "xlsx";


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

function normalizeRoleName(role) {
    return String(role || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function isCommitteeMember(value) {
    if (value === true || value === 1) {
        return true;
    }

    const normalizedValue = String(value ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return normalizedValue === '1'
        || normalizedValue === 'true'
        || normalizedValue === 'si';
}

function populateRoleFilter() {
    roleFilter.replaceChildren(new Option('Todos los roles', ''));

    const groupedOptions = [
        ['Estudiante', 'Estudiantes'],
        ['Docente', 'Docentes'],
        ['UAI / Entorno protector', 'UAI / Entorno protector'],
        ['Psicólogo/a', 'Psicólogo/a'],
        ['Directivo', 'Directivos'],
        ['Comité de convivencia', 'Comité de convivencia']
    ];

    groupedOptions.forEach(([value, label]) => {
        roleFilter.add(new Option(label, value));
    });

    const groupedRoleNames = new Set([
        'estudiante',
        'docente',
        'entorno protector',
        'uai',
        'psicologo/a',
        'psicologo',
        'psicologa',
        'rectora',
        'rector',
        'coordinador convivencia',
        'coordinadora convivencia',
        'coordinador de convivencia',
        'coordinadora de convivencia',
        'coordinador academico',
        'coordinadora academica'
    ]);

    const otherRoles = [...new Set(users
        .map((user) => user.role)
        .filter((role) => role && !groupedRoleNames.has(normalizeRoleName(role))))]
        .sort((first, second) => first.localeCompare(second, 'es'));

    otherRoles.forEach((role) => roleFilter.add(new Option(role, `role:${normalizeRoleName(role)}`)));
}

async function loadUsers() {
    const response = await fetch('http://localhost:3001/api/CrearUsuario/listar');
    if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios desde la base de datos');
    }

    const result = await response.json();
    const records = Array.isArray(result.usuarios) ? result.usuarios : [];

    users = records.map((user) => ({
        id: Number(user.id),
        document: String(user.document || user.id || ''),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: user.name || '',
        age: Number(user.age) || 0,
        email: user.email || '',
        phone: user.phone || '',
        documentType: user.documentType || '',
        roleId: Number(user.roleId) || 0,
        role: user.role || 'Sin rol',
        status: user.status || '',
        birthDate: user.birthDate || '',
        registrationDate: user.registrationDate || '',
        committeeMember: isCommitteeMember(user.committeeMember)
    }));

    populateRoleFilter();
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
                "../Admin.html";

        }
    );


byId("usuariosNav")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "../Users/Users.html";

        }
    );


byId("backButton")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "../Admin.html";

        }
    );


// =====================================================
// FILTROS
// =====================================================

function getFilteredUsers() {

    return users.filter(
        user => {
            const selectedRole = roleFilter.value;
            const normalizedRole = normalizeRoleName(user.role);
            const isDirector = [
                'rectora',
                'rector',
                'coordinador convivencia',
                'coordinadora convivencia',
                'coordinador de convivencia',
                'coordinadora de convivencia',
                'coordinador academico',
                'coordinadora academica'
            ].includes(normalizedRole);

            const isStudent = normalizedRole === 'estudiante';
            const isTeacher = normalizedRole === 'docente';
            const isProtector = ['entorno protector', 'uai'].includes(normalizedRole);
            const isPsychologist = ['psicologo/a', 'psicologo', 'psicologa'].includes(normalizedRole);

            const roleMatch = !selectedRole
                || (selectedRole === 'Estudiante' && isStudent)
                || (selectedRole === 'Docente' && isTeacher)
                || (selectedRole === 'UAI / Entorno protector' && isProtector)
                || (selectedRole === 'Psicólogo/a' && isPsychologist)
                || (selectedRole === 'Directivo' && isDirector)
                || (selectedRole === 'Comité de convivencia' && user.committeeMember)
                || (selectedRole.startsWith('role:') && normalizedRole === selectedRole.slice(5));


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

                        selectedFormat === "xlsx" ? "Excel (.xlsx)" : "JSON";

                }
            );

        }
    );


// =====================================================
// EXPORTAR CSV
// EXPORTAR EXCEL
// =====================================================

function exportExcel(data) {
    if (typeof XLSX === "undefined") {
        throw new Error("No se pudo cargar el generador de archivos Excel");
    }

    const rows = data.map((user) => ({
        "ID usuario": user.id,
        "Número de identificación": user.document,
        "Nombre": user.firstName,
        "Apellido": user.lastName,
        "Edad": user.age,
        "Correo": user.email,
        "Fecha de nacimiento": user.birthDate,
        "Fecha de registro": user.registrationDate,
        "Estado": user.status,
        "Tipo de identificación": user.documentType,
        "Celular": user.phone,
        "ID de rol": user.roleId,
        "Rol": user.role,
        "Pertenece al comité de convivencia": user.committeeMember ? "Sí" : "No"
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
        { wch: 14 }, { wch: 24 }, { wch: 22 }, { wch: 22 },
        { wch: 10 }, { wch: 32 }, { wch: 18 }, { wch: 18 },
        { wch: 14 }, { wch: 24 }, { wch: 18 }, { wch: 12 },
        { wch: 32 }, { wch: 36 }
    ];
    worksheet['!autofilter'] = { ref: worksheet['!ref'] };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios-sentir.xlsx");
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


        try {
            if (selectedFormat === 'xlsx') {
                exportExcel(filtered);
            } else {
                exportJSON(filtered);
            }

            showToast(`${filtered.length} usuarios exportados correctamente`);
        } catch (error) {
            console.error('Error al exportar usuarios:', error);
            showToast(error.message || 'No se pudo generar el archivo');
        }

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

async function init() {
    exportButton.disabled = true;

    try {
        await loadUsers();
        renderPreview();
    } catch (error) {
        console.error('Error al cargar usuarios para exportar:', error);
        showToast(error.message || 'No se pudieron cargar los usuarios');
        renderPreview();
    } finally {
        exportButton.disabled = false;
        setTimeout(refreshIcons, 200);
    }
}


init();