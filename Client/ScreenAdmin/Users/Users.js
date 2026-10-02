// ======================================================
// SENTIR - USUARIOS
// ======================================================


// ======================================================
// DATOS DESDE LA BASE DE DATOS
// ======================================================

let users = [];



// ======================================================
// ESTADO
// ======================================================

let selectedUserId = null;



let pendingDeleteId =
    null;



let selectedPhoto =
    null;



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


const searchInput =
    byId("searchInput");


const globalSearch =
    byId("globalSearch");


const roleFilter =
    byId("roleFilter");


const statusFilter =
    byId("statusFilter");


const clearFilters =
    byId("clearFilters");



const tableBody =
    byId("usersTableBody");


const tableCounter =
    byId("tableCounter");



const totalUsers =
    byId("totalUsers");


const studentCount =
    byId("studentCount");


const teacherCount =
    byId("teacherCount");


const committeeCount =
    byId("committeeCount");



// FORMULARIO

const userModal =
    byId("userModal");


const roleSelectionModal =
    byId("roleSelectionModal");


const roleSelectionInput =
    byId("roleSelectionInput");


const continueRoleSelection =
    byId("continueRoleSelection");


const cancelRoleSelection =
    byId("cancelRoleSelection");


const cancelRoleSelectionBtn =
    byId("cancelRoleSelectionBtn");


const openAddUser =
    byId("openAddUser");


const closeModalButton =
    byId("closeModal");


const cancelModal =
    byId("cancelModal");


const userForm =
    byId("userForm");


const modalTitle =
    byId("modalTitle");


const editingId =
    byId("editingId");


const firstNameInput =
    byId("firstNameInput");


const secondNameInput =
    byId("secondNameInput");


const firstSurnameInput =
    byId("firstSurnameInput");


const secondSurnameInput =
    byId("secondSurnameInput");


const documentInput =
    byId("documentInput");


const documentTypeInput =
    byId("documentTypeInput");


const otherDocumentTypeWrapper =
    byId("otherDocumentTypeWrapper");


const otherDocumentTypeInput =
    byId("otherDocumentTypeInput");


const ageInput =
    byId("ageInput");


const emailInput =
    byId("emailInput");


const phoneInput =
    byId("phoneInput");


const passwordInput =
    byId("passwordInput");


const birthDateInput =
    byId("birthDateInput");


const registrationDateInput =
    byId("registrationDateInput");


const selectedRoleDisplay =
    byId("selectedRoleDisplay");


const selectedRoleDisplayWrapper =
    byId("selectedRoleDisplayWrapper");


const roleEditSelectWrapper =
    byId("roleEditSelectWrapper");


const roleEditSelect =
    byId("roleEditSelect");


const roleInput =
    byId("roleInput");


const userStepOne = byId("userStepOne");
const teacherStepTwo = byId("teacherStepTwo");
const studentStepTwo = byId("studentStepTwo");
const studentStepThree = byId("studentStepThree");
const studentStepBack = byId("studentStepBack");
const studentStepNext = byId("studentStepNext");
const saveUserButton = byId("saveUserButton");
const studentGradeYear = byId("studentGradeYear");
const studentGradeLetter = byId("studentGradeLetter");
const studentGradeValue = byId("studentGradeValue");
const studentHasDiagnosis = byId("studentHasDiagnosis");
const studentDiagnosisFields = byId("studentDiagnosisFields");
const studentDiagnosisName = byId("studentDiagnosisName");
const studentDiagnosisDescription = byId("studentDiagnosisDescription");
const guardianInputs = {
    documentType: byId("guardianDocumentType"),
    document: byId("guardianDocument"),
    firstName: byId("guardianFirstName"),
    secondName: byId("guardianSecondName"),
    firstSurname: byId("guardianFirstSurname"),
    secondSurname: byId("guardianSecondSurname"),
    email: byId("guardianEmail"),
    phone: byId("guardianPhone"),
    relationship: byId("guardianRelationship"),
    occupation: byId("guardianOccupation")
};
let studentWizardStep = 1;
let teacherWizardStep = 1;


function updateSelectedRoleDisplay() {
    if (selectedRoleDisplay) {
        const value = roleInput?.value || roleSelectionInput?.value || "Sin rol";
        selectedRoleDisplay.value = value;
    }
}


function toggleDocumentTypeFields() {
    if (!documentTypeInput || !otherDocumentTypeWrapper || !otherDocumentTypeInput) {
        return;
    }

    const isOther = documentTypeInput.value === "Otro";
    otherDocumentTypeWrapper.classList.toggle("hidden", !isOther);
    otherDocumentTypeInput.required = isOther && !editingId.value;

    if (!isOther) {
        otherDocumentTypeInput.value = "";
    }
}

function calculateAgeFromBirthDate(dateString) {
    if (!dateString) {
        return "";
    }

    const birthDate = new Date(dateString);

    if (Number.isNaN(birthDate.getTime())) {
        return "";
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
        age -= 1;
    }

    return String(age);
}

function updateAgeFromBirthDate() {
    if (!ageInput || !birthDateInput) {
        return;
    }

    ageInput.value = calculateAgeFromBirthDate(birthDateInput.value);
}

function isStrongPassword(password) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/.test(password);
}


const roleOptions = [
    "Estudiante",
    "Docente",
    "UAI",
    "Psicóloga",
    "Directivo",
    "Comité de convivencia"
];


const statusInput =
    byId("statusInput");


const committeeInput =
    byId("committeeInput");



const gradeField =
    byId("gradeField");


const gradeInput =
    byId("gradeInput");



const groupDirectorField =
    byId("groupDirectorField");


const groupDirectorInput =
    byId("groupDirectorInput");



const directorGroupField =
    byId("directorGroupField");


const directorGroupInput =
    byId("directorGroupInput");



const photoInput =
    byId("photoInput");


const photoPreview =
    byId("photoPreview");



// ELIMINAR

const deleteModal =
    byId("deleteModal");


const cancelDelete =
    byId("cancelDelete");


const confirmDelete =
    byId("confirmDelete");



// DETALLE

const detailAvatar =
    byId("detailAvatar");


const detailName =
    byId("detailName");


const detailRole =
    byId("detailRole");


const detailDocument =
    byId("detailDocument");


const detailEmail =
    byId("detailEmail");


const detailPhone =
    byId("detailPhone");


const detailGradeRow =
    byId("detailGradeRow");


const detailGrade =
    byId("detailGrade");


const detailStudentDiagnosisRow = byId("detailStudentDiagnosisRow");
const detailStudentDiagnosis = byId("detailStudentDiagnosis");
const detailGuardianRow = byId("detailGuardianRow");
const detailGuardian = byId("detailGuardian");
const detailGuardianContactRow = byId("detailGuardianContactRow");
const detailGuardianContact = byId("detailGuardianContact");


const detailDirectorRow =
    byId("detailDirectorRow");


const detailDirector =
    byId("detailDirector");


const detailDirectorGroupRow =
    byId("detailDirectorGroupRow");


const detailDirectorGroup =
    byId("detailDirectorGroup");


const detailTeacherYearRow =
    byId("detailTeacherYearRow");


const detailTeacherYear =
    byId("detailTeacherYear");


const detailDate =
    byId("detailDate");


const editSelected =
    byId("editSelected");


const deleteSelected =
    byId("deleteSelected");


const anoCursadoInput =
    byId("anoCursadoInput");


const teacherDirectorInput =
    byId("teacherDirectorInput");


const gradeNumberInput =
    byId("gradeNumberInput");


const gradeLetterInput =
    byId("gradeLetterInput");

const directorGradeFields = byId("directorGradeFields");
const teacherGradesList = byId("teacherGradesList");
const addTeacherGradeButton = byId("addTeacherGrade");



// TOAST

const toast =
    byId("toast");


const toastText =
    byId("toastText");


const closeToastButton =
    byId("closeToast");

let toastTimeout;



// ======================================================
// LUCIDE
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

    clearTimeout(toastTimeout);
    toastText.textContent =
        message;


    toast.classList.add(
        "show"
    );

    toastTimeout = setTimeout(
        () => toast.classList.remove("show"),
        180000
    );

}


closeToastButton.addEventListener(
    "click",
    () => {
        clearTimeout(toastTimeout);
        toast.classList.remove("show");
    }
);

function setFieldError(input, message) {
    const field = input.closest(".form-group");
    let error = field.querySelector(".field-error");

    if (!error) {
        error = document.createElement("p");
        error.className = "field-error";
        error.setAttribute("aria-live", "polite");
        field.appendChild(error);
    }

    error.textContent = message;
    error.classList.toggle("visible", Boolean(message));
    input.setCustomValidity(message);
    input.setAttribute("aria-invalid", String(Boolean(message)));
}

function validateUniqueUserFields() {
    const currentId = Number(editingId.value);
    const document = documentInput.value.trim().toLowerCase();
    const email = emailInput.value.trim().toLowerCase();
    const duplicateDocument = document && users.some((user) =>
        String(user.document).trim().toLowerCase() === document && user.id !== currentId
    );
    const duplicateEmail = email && users.some((user) =>
        String(user.email).trim().toLowerCase() === email && user.id !== currentId
    );

    setFieldError(documentInput, duplicateDocument ? "Este número de identificación ya está registrado." : "");
    setFieldError(emailInput, duplicateEmail ? "Este correo electrónico ya está registrado." : "");

    return !duplicateDocument && !duplicateEmail;
}

documentInput.addEventListener("input", validateUniqueUserFields);
documentInput.addEventListener("blur", validateUniqueUserFields);
emailInput.addEventListener("input", validateUniqueUserFields);
emailInput.addEventListener("blur", validateUniqueUserFields);

function recordUserActivity(type, user) {
    const titles = {
        register: "Nuevo usuario registrado",
        edit: "Usuario actualizado",
        delete: "Usuario eliminado"
    };

    const entry = {
        type,
        title: titles[type] || "Actividad de usuario",
        description: user?.name
            ? `${user.name} · ${user.role || "Sin rol"}`
            : "Registro de usuario",
        timestamp: new Date().toISOString()
    };

    try {
        const stored = JSON.parse(localStorage.getItem("sentir.admin.recentActivity") || "[]");
        const history = Array.isArray(stored) ? stored : [];
        localStorage.setItem(
            "sentir.admin.recentActivity",
            JSON.stringify([entry, ...history].slice(0, 8))
        );
    } catch (error) {
        console.error("No se pudo guardar el movimiento reciente:", error);
    }
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

        window.location.href = "../Admin.html";

    }

);



usuariosNav.addEventListener(

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



// ======================================================
// HELPERS
// ======================================================

function getInitials(name) {

    if (!name) {

        return "—";

    }


    return name

        .split(" ")

        .slice(
            0,
            2
        )

        .map(
            word =>
                word.charAt(0)
        )

        .join("")

        .toUpperCase();

}



function getRoleClass(role) {

    const classes = {

        "Estudiante":
            "student",

        "Docente":
            "teacher",

        "UAI":
            "uai",

        "Psicóloga":
            "psychologist",

        "Directivo":
            "director",

        "Comité de convivencia":
            "committee"

    };


    return (

        classes[role]

        ||

        "student"

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



function getStatusClass(status) {

    const classes = {

        "Activo":
            "active",

        "Inactivo":
            "inactive",

        "Pendiente":
            "pending"

    };


    return (

        classes[status]

        ||

        "active"

    );

}



function avatarHTML(user) {

    if (user.photo) {

        return `

            <div class="mini-avatar">

                <img
                    src="${user.photo}"
                    alt="${user.name}"
                >

            </div>

        `;

    }


    return `

        <div class="mini-avatar">

            ${getInitials(
                user.name
            )}

        </div>

    `;

}



// ======================================================
// ESTADÍSTICAS
// ======================================================

function updateStats() {

    totalUsers.textContent =
        users.length;


    studentCount.textContent =

        users.filter(

            user =>
                user.role ===
                "Estudiante"

        ).length;


    teacherCount.textContent =

        users.filter(

            user =>
                user.role ===
                "Docente"

        ).length;

    committeeCount.textContent = users.filter(
        user => isCommitteeMember(user.committeeMember)
    ).length;

}



// ======================================================
// TABLA
// ======================================================

function renderUsers() {

    const search =

        normalizeRoleName(searchInput.value);



    const selectedRole =
        roleFilter.value;



    const selectedStatus =
        statusFilter.value;



    const filteredUsers =

        users.filter(

            user => {

                const matchSearch =

                    normalizeRoleName(user.name)
                        .includes(search)

                    ||

                    normalizeRoleName(user.email)
                        .includes(search)

                    ||

                    normalizeRoleName(user.document)
                        .includes(search)

                    ||

                    normalizeRoleName(user.role)
                        .includes(search);


                const normalizedRole = normalizeRoleName(user.role);
                const matchRole = !selectedRole
                    || (selectedRole === 'Directivo' && [
                        'rectora',
                        'coordinador convivencia',
                        'coordinador academico'
                    ].includes(normalizedRole))
                    || (selectedRole === 'Comité de convivencia' && isCommitteeMember(user.committeeMember))
                    || (selectedRole !== 'Directivo'
                        && selectedRole !== 'Comité de convivencia'
                        && normalizedRole === normalizeRoleName(selectedRole));


                const matchStatus =

                    !selectedStatus

                    ||

                    user.status ===
                    selectedStatus;


                return (

                    matchSearch

                    &&

                    matchRole

                    &&

                    matchStatus

                );

            }

        );



    tableBody.innerHTML =
        "";



    if (
        filteredUsers.length ===
        0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#7B77A3;
                    "
                >

                    No encontramos usuarios.

                </td>

            </tr>

        `;


        tableCounter.textContent =
            "Mostrando 0 usuarios";


        return;

    }



    filteredUsers.forEach(

        user => {


            const row =

                document.createElement(
                    "tr"
                );


            // Al hacer clic en la fila se muestra su información a la derecha
            row.dataset.userId =
                user.id;

            row.title =
                "Ver información de " + user.name;


            if (
                user.id ===
                selectedUserId
            ) {

                row.classList.add(
                    "selected"
                );

            }



            row.innerHTML = `

                <td>

                    <div class="user-name-cell">

                        ${avatarHTML(user)}

                        <span>
                            ${user.name}
                        </span>

                    </div>

                </td>


                <td>
                    ${user.document}
                </td>


                <td>
                    ${user.email}
                </td>


                <td>

                    <span
                        class="
                            role-badge
                            ${getRoleClass(
                                user.role
                            )}
                        "
                    >

                        ${user.role}

                    </span>

                </td>


                <td>

                    <span
                        class="
                            status-badge
                            ${getStatusClass(
                                user.status
                            )}
                        "
                    >

                        ${user.status}

                    </span>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="action-button view"
                            data-action="view"
                            data-id="${user.id}"
                            type="button"
                        >

                            <i data-lucide="eye"></i>

                        </button>


                        <button
                            class="action-button edit"
                            data-action="edit"
                            data-id="${user.id}"
                            type="button"
                        >

                            <i data-lucide="pencil"></i>

                        </button>


                        <button
                            class="action-button delete"
                            data-action="delete"
                            data-id="${user.id}"
                            type="button"
                        >

                            <i data-lucide="trash-2"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }

    );



    tableCounter.textContent =

        `Mostrando ${filteredUsers.length} de ${users.length} usuarios`;



    refreshIcons();

}



// ======================================================
// DETALLE
// ======================================================

function showUserDetails(id) {

    const user =

        users.find(

            user =>
                user.id ===
                Number(id)

        );



    if (!user) {

        return;

    }



    selectedUserId =
        user.id;



    if (user.photo) {

        detailAvatar.innerHTML = `

            <img
                src="${user.photo}"
                alt="${user.name}"
            >

        `;

    }

    else {

        detailAvatar.textContent =

            getInitials(
                user.name
            );

    }



    detailName.textContent =
        user.name;



    detailRole.textContent =
        user.role;



    detailRole.className =

        `role-badge ${getRoleClass(
            user.role
        )}`;



    detailDocument.textContent =

        `Documento: ${user.document}`;



    detailEmail.textContent =
        user.email;



    detailPhone.textContent =
        user.phone;



    detailDate.textContent =

        `Registro: ${user.registrationDate}`;



    // ESTUDIANTE

    if (
        user.role ===
        "Estudiante"
    ) {

        detailGradeRow.classList.remove(
            "hidden"
        );


        detailGrade.textContent =

            `Grado: ${user.grade}`;

        detailStudentDiagnosisRow.classList.remove("hidden");
        detailStudentDiagnosis.textContent = user.hasDiagnosis
            ? `Diagnóstico: ${[user.diagnosisName, user.diagnosisDescription].filter(Boolean).join(" · ")}`
            : "Sin diagnóstico";

        const guardianFullName = [user.guardianName, user.guardianSurname].filter(Boolean).join(" ");
        detailGuardianRow.classList.toggle("hidden", !guardianFullName);
        detailGuardian.textContent = `Acudiente: ${guardianFullName}${user.guardianRelationship ? ` · ${user.guardianRelationship}` : ""}${user.guardianDocument ? ` · ID ${user.guardianDocument}` : ""}`;

        const guardianContactInfo = [user.guardianEmail, user.guardianPhone].filter(Boolean).join(" · ");
        detailGuardianContactRow.classList.toggle("hidden", !guardianContactInfo);
        detailGuardianContact.textContent = guardianContactInfo;

    }

    else {

        detailGradeRow.classList.add(
            "hidden"
        );

        detailStudentDiagnosisRow.classList.add("hidden");
        detailGuardianRow.classList.add("hidden");
        detailGuardianContactRow.classList.add("hidden");

    }



    // DOCENTE

    if (
        user.role ===
        "Docente"
    ) {

        detailDirectorRow.classList.remove(
            "hidden"
        );


        detailDirector.textContent =
            `Director de grupo: ${user.directorGrupo === null || user.directorGrupo === "" ? "No registrado" : (Number(user.directorGrupo) === 1 ? "Sí" : "No")}`;


        detailTeacherYearRow.classList.remove("hidden");
        detailTeacherYear.textContent = `Año cursado: ${user.anoCursado || "No registrado"}`;


        detailDirectorGroupRow.classList.remove("hidden");
        const teacherGradeSummary = (user.teachingGrades || []).join(", ") || "No registrado";
        detailDirectorGroup.textContent = Number(user.directorGrupo) === 1
            ? `Grupo dirigido: ${user.gradoAsignado || "No registrado"} · Enseña: ${teacherGradeSummary}`
            : `Grados que enseña: ${teacherGradeSummary}`;

    }

    else {

        detailDirectorRow.classList.add(
            "hidden"
        );


        detailTeacherYearRow.classList.add("hidden");


        detailDirectorGroupRow.classList.add(
            "hidden"
        );

    }



    renderUsers();

}



// ======================================================
// CAMPOS CONDICIONALES
// ======================================================

function updateConditionalFields() {
    const normalizedRole = normalizeRoleName(roleInput.value);
    const isStudent = normalizedRole === "estudiante";

    anoCursadoInput.required = false;
    teacherDirectorInput.required = false;
    gradeNumberInput.required = false;
    gradeLetterInput.required = false;

    if (gradeField) gradeField.classList.add("hidden");
    if (gradeInput) gradeInput.required = false;
    if (groupDirectorField) groupDirectorField.classList.add("hidden");
    if (groupDirectorInput) groupDirectorInput.required = false;
    if (directorGroupField) directorGroupField.classList.add("hidden");
    if (directorGroupInput) directorGroupInput.required = false;

    studentGradeYear.required = isStudent && studentWizardStep === 2;
    studentGradeLetter.required = isStudent && studentWizardStep === 2;
    updateDirectorField();
    configureStudentWizard();
}

// El grupo ahora es un número (9-1). Si llega un grado viejo con letra (9-A),
// la letra se convierte en número: A = 1, B = 2, C = 3...
function groupToNumber(group) {
    const value = String(group || "").trim();
    if (/^\d{1,2}$/.test(value)) return String(Number(value));
    if (/^[A-Za-z]$/.test(value)) return String(value.toUpperCase().charCodeAt(0) - 64);
    return "";
}

function splitAssignedGrade(grade) {
    const value = String(grade || "").trim();
    const match = value.match(/^(\d+)[°º]?\s*-\s*([A-Za-z]|\d{1,2})$/i)
        || value.match(/^(\d+)[°º]?\s*([A-Za-z])$/i);

    if (match) {
        return { number: match[1], letter: groupToNumber(match[2]) };
    }

    const numberOnly = value.match(/^(\d+)[°º]?$/);
    return { number: numberOnly?.[1] || "", letter: "" };
}

function splitStudentGrade(grade) {
    const match = String(grade || "").trim().match(/^(\d{1,2})\s*-\s*([A-Za-z]|\d{1,2})$/i);
    return match
        ? { number: match[1], letter: groupToNumber(match[2]) }
        : { number: "", letter: "" };
}

function splitPersonName(name) {
    const [first = "", ...remaining] = String(name || "").trim().split(/\s+/).filter(Boolean);
    return { first, second: remaining.join(" ") };
}

function configureStudentWizard() {
    const isStudentWizard = normalizeRoleName(roleInput.value) === "estudiante";
    const isTeacherWizard = normalizeRoleName(roleInput.value) === "docente";
    const activeStep = isStudentWizard
        ? (studentWizardStep === 1 ? userStepOne : studentWizardStep === 2 ? studentStepTwo : studentStepThree)
        : (isTeacherWizard && teacherWizardStep === 2 ? teacherStepTwo : userStepOne);

    userStepOne.classList.toggle("hidden", (isStudentWizard && studentWizardStep !== 1) || (isTeacherWizard && teacherWizardStep !== 1));
    teacherStepTwo.classList.toggle("hidden", !isTeacherWizard || teacherWizardStep !== 2);
    studentStepTwo.classList.toggle("hidden", !isStudentWizard || studentWizardStep !== 2);
    studentStepThree.classList.toggle("hidden", !isStudentWizard || studentWizardStep !== 3);
    const wizardStep = isTeacherWizard ? teacherWizardStep : studentWizardStep;
    studentStepBack.classList.toggle("hidden", (!isStudentWizard && !isTeacherWizard) || wizardStep === 1);
    studentStepNext.classList.toggle("hidden", !(isStudentWizard && studentWizardStep < 3) && !(isTeacherWizard && teacherWizardStep === 1));
    saveUserButton.classList.toggle("hidden", (isStudentWizard && studentWizardStep !== 3) || (isTeacherWizard && teacherWizardStep !== 2));
    saveUserButton.textContent = isStudentWizard && !editingId.value ? "Crear usuario" : "Guardar usuario";

    Object.values(guardianInputs).forEach((input) => {
        input.required = isStudentWizard && studentWizardStep === 3 && input.id !== "guardianSecondName" && input.id !== "guardianSecondSurname";
    });

    studentGradeYear.required = isStudentWizard && studentWizardStep === 2;
    studentGradeLetter.required = isStudentWizard && studentWizardStep === 2;
    studentHasDiagnosis.required = isStudentWizard && studentWizardStep === 2;

    const hasDiagnosis = studentHasDiagnosis.value === "1";
    studentDiagnosisFields.classList.toggle("hidden", !hasDiagnosis || !isStudentWizard || studentWizardStep !== 2);
    studentDiagnosisName.required = hasDiagnosis && isStudentWizard && studentWizardStep === 2;
    studentDiagnosisDescription.required = hasDiagnosis && isStudentWizard && studentWizardStep === 2;

    teacherDirectorInput.required = isTeacherWizard && teacherWizardStep === 2;
    if (activeStep) {
        activeStep.setAttribute("aria-current", "step");
    }
}

function validateStep(container) {
    const invalidInput = [...container.querySelectorAll("input, select, textarea")]
        .find((input) => !input.disabled && input.getClientRects().length > 0 && !input.checkValidity());
    if (!invalidInput) return true;
    const label = invalidInput.getAttribute("aria-label")
        || invalidInput.closest(".form-group")?.querySelector("label")?.textContent.trim();
    showToast(label ? `Revisa el campo: ${label}` : "Revisa los datos ingresados");
    invalidInput.focus();
    return false;
}

function goToStudentStep(step) {
    studentWizardStep = Math.min(3, Math.max(1, step));
    configureStudentWizard();
    refreshIcons();
}

studentStepNext.addEventListener("click", () => {
    const isTeacherWizard = normalizeRoleName(roleInput.value) === "docente";
    const activeStep = isTeacherWizard
        ? (teacherWizardStep === 1 ? userStepOne : teacherStepTwo)
        : (studentWizardStep === 1 ? userStepOne : studentStepTwo);
    if (!validateStep(activeStep)) return;

    if (isTeacherWizard) {
        teacherWizardStep = 2;
    } else if (studentWizardStep === 2) {
        studentGradeValue.value = `${studentGradeYear.value.trim()}-${groupToNumber(studentGradeLetter.value)}`;
        studentWizardStep = 3;
    } else {
        studentWizardStep += 1;
    }

    configureStudentWizard();
    refreshIcons();
});

studentStepBack.addEventListener("click", () => {
    if (normalizeRoleName(roleInput.value) === "docente") {
        teacherWizardStep = 1;
        configureStudentWizard();
        refreshIcons();
    } else {
        goToStudentStep(studentWizardStep - 1);
    }
});
studentHasDiagnosis.addEventListener("change", configureStudentWizard);



function addTeacherGradeRow(grade = "") {
    const row = document.createElement("div");
    row.className = "teacher-grade-row";
    row.innerHTML = `
        <label>Año / grado
            <input class="teacher-grade-year" type="number" min="0" max="99" step="1" placeholder="Ej. 10" aria-label="Año o número del grado que enseña">
        </label>
        <label>Grupo
            <input class="teacher-grade-letter" type="number" min="1" max="99" step="1" placeholder="Ej. 1" aria-label="Número del grupo que enseña">
        </label>
        <button class="remove-teacher-grade" type="button" aria-label="Quitar grado"><i data-lucide="x"></i></button>
    `;

    const parsedGrade = splitAssignedGrade(grade);
    row.querySelector(".teacher-grade-year").value = parsedGrade.number;
    row.querySelector(".teacher-grade-letter").value = parsedGrade.letter;
    row.querySelector(".remove-teacher-grade").addEventListener("click", () => row.remove());
    teacherGradesList.appendChild(row);
    refreshIcons();
}

function setTeacherGradeRows(grades = []) {
    teacherGradesList.replaceChildren();
    (grades.length ? grades : [""]).forEach(addTeacherGradeRow);
}

function collectTeacherGrades() {
    const grades = [];
    const seenGrades = new Set();

    for (const row of teacherGradesList.querySelectorAll(".teacher-grade-row")) {
        const year = row.querySelector(".teacher-grade-year").value.trim();
        const letter = groupToNumber(row.querySelector(".teacher-grade-letter").value);
        if (!year && !row.querySelector(".teacher-grade-letter").value.trim()) continue;
        if (!/^\d{1,2}$/.test(year) || !/^[1-9]\d?$/.test(letter)) {
            return { grades: [], error: "Completa el grado y el número del grupo de cada grado que enseña" };
        }

        const grade = `${year}-${letter}`;
        if (seenGrades.has(grade)) {
            return { grades: [], error: `El grado ${grade} está repetido` };
        }
        seenGrades.add(grade);
        grades.push(grade);
    }

    if (!grades.length) {
        return { grades, error: "Añade al menos un grado que enseñe el docente" };
    }

    return { grades, error: "" };
}

function validateTeacherStep() {
    if (!validateStep(teacherStepTwo)) return false;
    const result = collectTeacherGrades();
    if (result.error) {
        showToast(result.error);
        teacherGradesList.querySelector("input")?.focus();
        return false;
    }
    return true;
}

function updateDirectorField() {
    const isTeacher = normalizeRoleName(roleInput.value) === "docente";
    const isDirector = isTeacher && teacherDirectorInput.value === "1";
    directorGradeFields.classList.toggle("hidden", !isDirector);
    gradeNumberInput.required = isDirector;
    gradeLetterInput.required = isDirector;

    if (!isDirector) {
        gradeNumberInput.value = "";
        gradeLetterInput.value = "";
    }
}

addTeacherGradeButton.addEventListener("click", () => addTeacherGradeRow());
teacherDirectorInput.addEventListener("change", updateDirectorField);



if (roleInput) {
    roleInput.addEventListener(

        "change",

        () => {

            updateSelectedRoleDisplay();
            updateConditionalFields();
            updateDirectorField();

        }

    );
}

if (roleEditSelect) {
    roleEditSelect.addEventListener("change", () => {
        roleInput.value = roleEditSelect.value;
        updateSelectedRoleDisplay();
        updateConditionalFields();
        updateDirectorField();
    });
}


if (groupDirectorInput) {
    groupDirectorInput.addEventListener(

        "change",

        updateDirectorField

    );
}


if (documentTypeInput) {
    documentTypeInput.addEventListener("change", toggleDocumentTypeFields);
}

if (otherDocumentTypeInput) {
    otherDocumentTypeInput.addEventListener("input", () => {
        if (documentTypeInput.value === "Otro" && !otherDocumentTypeInput.value.trim()) {
            otherDocumentTypeInput.setCustomValidity("Especifica el tipo de documento");
        } else {
            otherDocumentTypeInput.setCustomValidity("");
        }
    });
}

if (birthDateInput) {
    birthDateInput.addEventListener("input", updateAgeFromBirthDate);
    birthDateInput.addEventListener("change", updateAgeFromBirthDate);
}

if (passwordInput) {
    passwordInput.addEventListener("input", () => {
        if (passwordInput.value && !isStrongPassword(passwordInput.value)) {
            passwordInput.setCustomValidity("La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial");
        } else {
            passwordInput.setCustomValidity("");
        }
    });
}


// ======================================================
// FOTO
// ======================================================

function resetPhoto() {

    selectedPhoto =
        null;


    photoInput.value =
        "";


    photoPreview.innerHTML = `

        <i data-lucide="camera"></i>

    `;


    refreshIcons();

}



photoInput.addEventListener(

    "change",

    event => {

        const file =
            event.target.files[0];


        if (!file) {

            return;

        }


        selectedPhoto = file;


        const reader =
            new FileReader();


        reader.onload =
            event => {
                photoPreview.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Vista previa"
                    >

                `;

            };


        reader.readAsDataURL(
            file
        );

    }

);



// ======================================================
// CREAR
// ======================================================

/* Campo de contraseña: obligatorio al crear; opcional al editar (vacío = no se cambia) */
function configurarCampoContrasena(editando) {
    if (!passwordInput) return;
    passwordInput.required = !editando;
    passwordInput.placeholder = editando ? "Escribe una nueva solo si quieres cambiarla" : "Crear contraseña";

    const pista = document.getElementById("passwordHint");
    if (pista) {
        pista.textContent = editando
            ? "Déjala vacía para conservar la contraseña actual. Si escribes una nueva: mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un carácter especial."
            : "Mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un carácter especial.";
    }
}

function openCreateModal() {

    userForm.reset();
    configurarCampoContrasena(false);
    studentWizardStep = 1;
    teacherWizardStep = 1;
    studentGradeValue.value = "";
    setTeacherGradeRows();


    editingId.value =
        "";

    documentInput.readOnly = false;
    documentTypeInput.required = true;
    birthDateInput.required = true;
    roleEditSelect.required = false;
    selectedRoleDisplayWrapper.classList.remove("hidden");
    roleEditSelectWrapper.classList.add("hidden");


    modalTitle.textContent =
        "Registrar usuario";


    statusInput.value =
        "Activo";
    committeeInput.value = "0";


    const selectedRole =
        roleSelectionInput.value || roleInput.value;


    if (selectedRole) {
        roleInput.value =
            selectedRole;
        updateSelectedRoleDisplay();
    }


    if (registrationDateInput) {
        const today = new Date().toISOString().split("T")[0];
        registrationDateInput.value = today;
    }

    if (birthDateInput) {
        birthDateInput.value = "";
        updateAgeFromBirthDate();
    }

    if (documentTypeInput) {
        documentTypeInput.value = "";
        toggleDocumentTypeFields();
    }


    if (otherDocumentTypeWrapper) {
        otherDocumentTypeWrapper.classList.add("hidden");
    }


    if (otherDocumentTypeInput) {
        otherDocumentTypeInput.value = "";
        otherDocumentTypeInput.required = false;
    }


    resetPhoto();


    updateConditionalFields();


    updateDirectorField();


    userModal.classList.add(
        "show"
    );

    refreshIcons();
}



// ======================================================
// EDITAR
// ======================================================

function openEditModal(id) {

    const user =

        users.find(

            user =>
                user.id ===
                Number(id)

        );



    if (!user) {

        return;

    }



    editingId.value =
        user.id;

    documentInput.readOnly = true;
    documentTypeInput.required = false;
    birthDateInput.required = false;
    roleEditSelect.required = true;
    selectedRoleDisplayWrapper.classList.add("hidden");
    roleEditSelectWrapper.classList.remove("hidden");


    firstNameInput.value = user.firstName || "";
    secondNameInput.value = user.secondName || "";
    firstSurnameInput.value = user.firstSurname || "";
    secondSurnameInput.value = user.secondSurname || "";


    documentInput.value =
        user.document;


    emailInput.value =
        user.email;


    phoneInput.value =
        user.phone;


    // Las contraseñas están cifradas: no se muestran. Vacío = se conserva la actual.
    passwordInput.value = "";
    configurarCampoContrasena(true);

    if (birthDateInput && user.birthDate) {
        birthDateInput.value = user.birthDate;
        updateAgeFromBirthDate();
    }

    if (registrationDateInput) {
        registrationDateInput.value = user.registrationDate || "";
    }

    if (documentTypeInput) {
        const knownDocumentType = [...documentTypeInput.options]
            .some(option => option.value === user.documentType);
        documentTypeInput.value = knownDocumentType ? user.documentType : "Otro";
        toggleDocumentTypeFields();
        if (!knownDocumentType && otherDocumentTypeInput) {
            otherDocumentTypeInput.value = user.documentType || "";
        }
    }

    roleInput.value =
        user.role.trim();

    roleEditSelect.value = user.role.trim();


    statusInput.value =
        user.status;

    committeeInput.value = user.committeeMember ? "1" : "0";
    anoCursadoInput.value = user.anoCursado || "";
    teacherDirectorInput.value = user.directorGrupo === "" || user.directorGrupo === null ? "" : String(user.directorGrupo);
    const assignedGrade = splitAssignedGrade(user.gradoAsignado);
    gradeNumberInput.value = assignedGrade.number;
    gradeLetterInput.value = assignedGrade.letter;
    setTeacherGradeRows(user.teachingGrades || []);

    const studentGrade = splitStudentGrade(user.studentGrade);
    studentGradeYear.value = studentGrade.number;
    studentGradeLetter.value = studentGrade.letter;
    studentGradeValue.value = user.studentGrade || "";
    studentHasDiagnosis.value = user.hasDiagnosis ? "1" : "0";
    studentDiagnosisName.value = user.diagnosisName || "";
    studentDiagnosisDescription.value = user.diagnosisDescription || "";
    guardianInputs.documentType.value = user.guardianDocumentType || "";
    guardianInputs.document.value = user.guardianDocument || "";
    const guardianName = splitPersonName(user.guardianName);
    const guardianSurname = splitPersonName(user.guardianSurname);
    guardianInputs.firstName.value = guardianName.first;
    guardianInputs.secondName.value = guardianName.second;
    guardianInputs.firstSurname.value = guardianSurname.first;
    guardianInputs.secondSurname.value = guardianSurname.second;
    guardianInputs.email.value = user.guardianEmail || "";
    guardianInputs.phone.value = user.guardianPhone || "";
    guardianInputs.relationship.value = user.guardianRelationship || "";
    guardianInputs.occupation.value = user.guardianOccupation || "";
    studentWizardStep = 1;
    teacherWizardStep = 1;


    selectedPhoto =
        user.photo;



    updateConditionalFields();



    if (
        user.role ===
        "Estudiante"
    ) {

        if (gradeInput) {
            gradeInput.value = user.grade || "";
        }

    }



    if (
        user.role ===
        "Docente"
    ) {
        updateDirectorField();

    }



    if (user.photo) {

        photoPreview.innerHTML = `

            <img
                src="${user.photo}"
                alt="Foto actual"
            >

        `;

    }

    else {

        photoPreview.innerHTML = `

            <i data-lucide="camera"></i>

        `;

    }



    modalTitle.textContent =
        "Editar usuario";


    userModal.classList.add(
        "show"
    );


    refreshIcons();

}



// ======================================================
// CERRAR
// ======================================================

function closeUserModal() {

    userModal.classList.remove(
        "show"
    );

}



// ======================================================
// GUARDAR
// ======================================================

userForm.addEventListener(

    "submit",

    async event => {


        event.preventDefault();

        if (!validateUniqueUserFields()) {
            const invalidUniqueInput = documentInput.validity.customError ? documentInput : emailInput;
            invalidUniqueInput.focus();
            return;
        }

        if (normalizeRoleName(roleInput.value) === "estudiante") {
            if (studentWizardStep !== 3 || !validateStep(studentStepThree)) {
                return;
            }
        } else if (normalizeRoleName(roleInput.value) === "docente") {
            if (teacherWizardStep !== 2 || !validateTeacherStep()) {
                return;
            }
        } else {
            const invalidInput = [...userForm.querySelectorAll("input, select, textarea")]
                .find((input) => !input.disabled && input.getClientRects().length > 0 && !input.checkValidity());
            if (invalidInput) {
                const label = invalidInput.getAttribute("aria-label")
                    || invalidInput.closest(".form-group")?.querySelector("label")?.textContent.trim();
                showToast(label ? `Revisa el campo: ${label}` : "Revisa los datos ingresados");
                invalidInput.focus();
                return;
            }
        }



        const id =

            Number(
                editingId.value
            );



        const selectedDocumentType = documentTypeInput.value === "Otro"
            ? (otherDocumentTypeInput.value.trim() || "Otro")
            : documentTypeInput.value;

        const nameParts = {
            firstName: firstNameInput.value.trim(),
            secondName: secondNameInput.value.trim(),
            firstSurname: firstSurnameInput.value.trim(),
            secondSurname: secondSurnameInput.value.trim()
        };

        if (!nameParts.firstName || !nameParts.firstSurname) {
            showToast("Ingresa el primer nombre y el primer apellido");
            return;
        }

        const editandoSinCambiarContrasena = Boolean(editingId.value) && !passwordInput.value;

        if (!editandoSinCambiarContrasena && !isStrongPassword(passwordInput.value)) {
            showToast("La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial");
            passwordInput.focus();
            return;
        }

        if (!roleInput.value) {
            showToast("Selecciona un rol antes de guardar");
            return;
        }

        if (birthDateInput && birthDateInput.value) {
            ageInput.value = calculateAgeFromBirthDate(birthDateInput.value);
        }

        const data = {


            documentType:
                selectedDocumentType,


            ...nameParts,

            name: [nameParts.firstName, nameParts.secondName].filter(Boolean).join(" "),

            surname: [nameParts.firstSurname, nameParts.secondSurname].filter(Boolean).join(" "),


            document:

                documentInput
                    .value
                    .trim(),


            age:

                ageInput
                    .value
                    .trim(),


            email:

                emailInput
                    .value
                    .trim(),


            phone:

                phoneInput
                    .value
                    .trim(),


            password:

                passwordInput.value,


            birthDate:

                birthDateInput.value,


            registrationDate:

                registrationDateInput.value,


            photo:

                selectedPhoto,


            role:

                roleInput.value,


            grade:

                roleInput.value ===
                "Estudiante"

                    ?

                    gradeInput?.value || ""

                    :

                    "",


            groupDirector:

                roleInput.value ===
                "Docente"

                    ?

                    groupDirectorInput?.value || ""

                    :

                    "",


            directorGroup:

                roleInput.value ===
                "Docente"

                &&

                groupDirectorInput?.value ===
                "Sí"

                    ?

                    directorGroupInput?.value.trim() || ""

                    :

                    "",


            status:

                statusInput.value,

            committeeMember:

                committeeInput.value === "1",

            anoCursado: anoCursadoInput.value,

            directorGrupo: teacherDirectorInput.value,

            gradoNumero: gradeNumberInput.value,

            gradoLetra: groupToNumber(gradeLetterInput.value)

        };

        const studentPayload = {
            studentGradeNumber: studentGradeYear.value.trim(),
            studentGradeLetter: groupToNumber(studentGradeLetter.value),
            hasDiagnosis: studentHasDiagnosis.value,
            diagnosisName: studentDiagnosisName.value.trim(),
            diagnosisDescription: studentDiagnosisDescription.value.trim(),
            guardianDocumentType: guardianInputs.documentType.value,
            guardianDocument: guardianInputs.document.value.trim(),
            guardianFirstName: guardianInputs.firstName.value.trim(),
            guardianSecondName: guardianInputs.secondName.value.trim(),
            guardianFirstSurname: guardianInputs.firstSurname.value.trim(),
            guardianSecondSurname: guardianInputs.secondSurname.value.trim(),
            guardianEmail: guardianInputs.email.value.trim(),
            guardianPhone: guardianInputs.phone.value.trim(),
            guardianRelationship: guardianInputs.relationship.value.trim(),
            guardianOccupation: guardianInputs.occupation.value.trim()
        };
        const teacherGrades = normalizeRoleName(roleInput.value) === "docente"
            ? collectTeacherGrades().grades
            : [];



        // EDITAR

        if (id) {
            const payload = {
                documentType: data.documentType,
                ...nameParts,
                age: Number(data.age),
                email: data.email,
                phone: data.phone,
                password: data.password,
                birthDate: data.birthDate,
                registrationDate: data.registrationDate,
                role: data.role,
                status: data.status,
                committeeMember: data.committeeMember,
                anoCursado: data.anoCursado,
                directorGrupo: data.directorGrupo,
                gradoNumero: data.gradoNumero,
                gradoLetra: data.gradoLetra,
                teachingGrades: JSON.stringify(teacherGrades),
                ...studentPayload
            };
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, String(value ?? ""));
            });
            if (selectedPhoto instanceof File) {
                formData.append("foto", selectedPhoto);
            }

            try {
                const response = await fetch(`http://localhost:3001/api/CrearUsuario/actualizar/${id}`, {
                    method: "PUT",
                    body: formData
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result?.message || "No se pudo actualizar el usuario");
                }

                selectedUserId = id;
                recordUserActivity("edit", data);
                await cargarUsuariosDesdeBD();
                showToast(result?.message || "Usuario actualizado correctamente");
            } catch (error) {
                console.error("Actualizar usuario:", error);
                showToast(error.message || "No se pudo actualizar el usuario");
                return;
            }

        }



        // CREAR

        else {
            const payload = {
                documentType: data.documentType,
                ...nameParts,
                document: data.document,
                age: Number(data.age),
                email: data.email,
                phone: data.phone,
                password: data.password,
                birthDate: data.birthDate,
                registrationDate: data.registrationDate,
                role: data.role,
                status: data.status,
                committeeMember: data.committeeMember,
                anoCursado: data.anoCursado,
                directorGrupo: data.directorGrupo,
                gradoNumero: data.gradoNumero,
                gradoLetra: data.gradoLetra,
                teachingGrades: JSON.stringify(teacherGrades),
                ...studentPayload
            };

            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, String(value ?? ""));
            });

            if (selectedPhoto instanceof File) {
                formData.append("foto", selectedPhoto);
            }

            let createdUser = null;

            try {
                const response = await fetch("http://localhost:3001/api/CrearUsuario/crear", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.message || "No se pudo guardar el usuario");
                }

                createdUser = result?.usuario || null;

                if (result?.message) {
                    showToast(result.message);
                }
            } catch (error) {
                console.error("Guardar usuario:", error);
                showToast(error.message || "No se pudo guardar el usuario");
                return;
            }

            const newId =

                Number(
                    createdUser?.id_usuario ??
                    (
                        users.length

                            ?

                            Math.max(

                                ...users.map(

                                    user =>
                                        user.id

                                )

                            ) + 1

                            :

                            1
                    )
                );

            const codigoRegistro =
                createdUser?.codigo_registro ||
                `USR-${String(newId).padStart(6, "0")}`;

            selectedUserId = newId;
            recordUserActivity("register", data);
            await cargarUsuariosDesdeBD();

        }



        closeUserModal();


        updateStats();


        renderUsers();


        showUserDetails(
            selectedUserId
        );

    }

);



// ======================================================
// ELIMINAR
// ======================================================

function openDeleteModal(id) {

    pendingDeleteId =
        Number(id);


    deleteModal.classList.add(
        "show"
    );

}



confirmDelete.addEventListener(

    "click",

    async () => {
        if (!pendingDeleteId) {
            return;
        }

        const idToDelete = pendingDeleteId;
        const deletedUser = users.find((user) => user.id === idToDelete);
        confirmDelete.disabled = true;

        try {
            const response = await fetch(`http://localhost:3001/api/CrearUsuario/${idToDelete}`, {
                method: "DELETE"
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result?.message || "No se pudo eliminar el usuario");
            }

            pendingDeleteId = null;
            deleteModal.classList.remove("show");
            recordUserActivity("delete", deletedUser);
            await cargarUsuariosDesdeBD();
            showToast(result?.message || "Usuario eliminado correctamente");
        } catch (error) {
            console.error("Eliminar usuario:", error);
            showToast(error.message || "No se pudo eliminar el usuario");
        } finally {
            confirmDelete.disabled = false;
        }
    }

);



// ======================================================
// PANEL DEL USUARIO SELECCIONADO
// En pantallas anchas está siempre a la derecha. En pantallas
// angostas está oculto: se muestra debajo de la tabla al
// seleccionar un usuario y la página baja hasta él.
// ======================================================

function revealSelectedUserCard() {

    const card =
        document.querySelector(
            ".selected-user-card"
        );

    if (!card || !selectedUserId) {
        return;
    }

    card.classList.add(
        "is-open"
    );

    if (window.matchMedia("(max-width: 1200px)").matches) {
        card.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

}



// ======================================================
// ACCIONES TABLA
// ======================================================

tableBody.addEventListener(

    "click",

    event => {


        const button =

            event.target.closest(
                "[data-action]"
            );



        // Clic en cualquier parte de la fila (que no sea un botón): seleccionar y mostrar
        if (!button) {

            const row =
                event.target.closest(
                    "tr[data-user-id]"
                );

            if (row) {
                showUserDetails(
                    Number(row.dataset.userId)
                );
                revealSelectedUserCard();
            }

            return;

        }



        const id =

            Number(
                button.dataset.id
            );



        const action =

            button.dataset.action;



        if (
            action ===
            "view"
        ) {

            showUserDetails(
                id
            );

            revealSelectedUserCard();

        }



        if (
            action ===
            "edit"
        ) {

            showUserDetails(
                id
            );


            openEditModal(
                id
            );

        }



        if (
            action ===
            "delete"
        ) {

            openDeleteModal(
                id
            );

        }

    }

);



// ======================================================
// PANEL DERECHO
// ======================================================

editSelected.addEventListener(

    "click",

    () => {

        if (selectedUserId) {

            openEditModal(
                selectedUserId
            );

        }

    }

);



deleteSelected.addEventListener(

    "click",

    () => {

        if (selectedUserId) {

            openDeleteModal(
                selectedUserId
            );

        }

    }

);



// ======================================================
// USUARIOS DESDE BASE DE DATOS
// ======================================================

async function cargarUsuariosDesdeBD() {
    try {
        const respuesta = await fetch('http://localhost:3001/api/CrearUsuario/listar');

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los usuarios');
        }

        const data = await respuesta.json();
        const usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];
        const previousSelectedUserId = selectedUserId;

        users = usuarios.map((usuario) => ({
            id: Number(usuario.id),
            name: usuario.name || 'Sin nombre',
            firstName: usuario.firstName || '',
            secondName: usuario.secondName || '',
            firstSurname: usuario.firstSurname || '',
            secondSurname: usuario.secondSurname || '',
            document: usuario.document || 'No disponible',
            email: usuario.email || '',
            phone: usuario.phone || 'No disponible',
            password: usuario.password || '',
            documentType: usuario.documentType || 'Cédula',
            photo: usuario.photo || '',
            role: usuario.role || 'Sin rol',
            roleId: Number(usuario.roleId) || null,
            committeeMember: isCommitteeMember(usuario.committeeMember),
            grade: usuario.grade || usuario.studentGrade || '',
            groupDirector: usuario.groupDirector || '',
            directorGroup: usuario.directorGroup || '',
            directorGrupo: usuario.directorGrupo === '' ? '' : Number(usuario.directorGrupo),
            anoCursado: usuario.anoCursado || '',
            gradoAsignado: usuario.gradoAsignado || '',
            teachingGrades: Array.isArray(usuario.teachingGrades) ? usuario.teachingGrades : [],
            studentGrade: usuario.studentGrade || usuario.grade || '',
            hasDiagnosis: Boolean(usuario.hasDiagnosis),
            diagnosisName: usuario.diagnosisName || '',
            diagnosisDescription: usuario.diagnosisDescription || '',
            guardianDocument: usuario.guardianDocument || '',
            guardianDocumentType: usuario.guardianDocumentType || '',
            guardianName: usuario.guardianName || '',
            guardianSurname: usuario.guardianSurname || '',
            guardianEmail: usuario.guardianEmail || '',
            guardianPhone: usuario.guardianPhone || '',
            guardianRelationship: usuario.guardianRelationship || '',
            guardianOccupation: usuario.guardianOccupation || '',
            status: usuario.status || 'Activo',
            registrationDate: usuario.registrationDate || '',
            birthDate: usuario.birthDate || ''
        }));

        validateUniqueUserFields();

        selectedUserId = users.some((user) => user.id === previousSelectedUserId)
            ? previousSelectedUserId
            : (users.length ? users[0].id : null);
        updateStats();
        renderUsers();

        if (selectedUserId) {
            showUserDetails(selectedUserId);
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        users = [];
        selectedUserId = null;
        updateStats();
        renderUsers();
    }
}


// ======================================================
// ROLES DESDE BASE DE DATOS
// ======================================================

async function cargarRolesDesdeBD() {
    try {
        const respuesta = await fetch('http://localhost:3001/api/CrearUsuario/roles');

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los roles');
        }

        const data = await respuesta.json();
        const roles = data.roles || [];

        const opciones = roles.length
            ? roles.map((rol) => ({
                value: rol.nombre.trim(),
                label: rol.nombre.trim()
            }))
            : roleOptions.map((rol) => ({
                value: rol,
                label: rol
            }));

        [roleSelectionInput, roleEditSelect].forEach((select) => {
            if (!select) return;

            const actualValue = select.value;
            select.innerHTML = '<option value="">Seleccionar rol</option>';
            const optionValores = new Set();

            opciones.forEach((rol) => {
                if (optionValores.has(rol.value)) {
                    return;
                }

                optionValores.add(rol.value);
                const option = document.createElement('option');
                option.value = rol.value;
                option.textContent = rol.label;
                select.appendChild(option);
            });

            if (actualValue && [...select.options].some((option) => option.value === actualValue)) {
                select.value = actualValue;
            }
        });

        return opciones;
    } catch (error) {
        console.error('Error al cargar roles:', error);

        [roleSelectionInput, roleEditSelect].forEach((select) => {
            if (!select) return;

            const actualValue = select.value;
            select.innerHTML = '<option value="">Seleccionar rol</option>';

            roleOptions.forEach((rol) => {
                const option = document.createElement('option');
                option.value = rol;
                option.textContent = rol;
                select.appendChild(option);
            });

            if (actualValue && [...select.options].some((option) => option.value === actualValue)) {
                select.value = actualValue;
            }
        });
    }
}


// ======================================================
// MODALES
// ======================================================

function openRoleSelectionModal() {

    roleSelectionInput.value =
        "";


    roleSelectionModal.classList.add(
        "show"
    );


    refreshIcons();

}


function closeRoleSelectionModal() {

    roleSelectionModal.classList.remove(
        "show"
    );

}


openAddUser.addEventListener(

    "click",

    openRoleSelectionModal

);


cancelRoleSelection.addEventListener(

    "click",

    closeRoleSelectionModal

);


cancelRoleSelectionBtn.addEventListener(

    "click",

    closeRoleSelectionModal

);


continueRoleSelection.addEventListener(

    "click",

    () => {

        const selectedRole =
            roleSelectionInput.value;


        if (!selectedRole) {

            showToast(
                "Selecciona un rol antes de continuar"
            );

            return;

        }


        closeRoleSelectionModal();

        roleInput.value =
            selectedRole;

        openCreateModal();

    }
);



closeModalButton.addEventListener(

    "click",

    closeUserModal

);



cancelModal.addEventListener(

    "click",

    closeUserModal

);



cancelDelete.addEventListener(

    "click",

    () => {

        pendingDeleteId =
            null;


        deleteModal.classList.remove(
            "show"
        );

    }

);



// ======================================================
// FILTROS
// ======================================================

searchInput.addEventListener(

    "input",

    renderUsers

);



roleFilter.addEventListener(

    "change",

    renderUsers

);



statusFilter.addEventListener(

    "change",

    renderUsers

);



clearFilters.addEventListener(

    "click",

    () => {


        searchInput.value =
            "";


        globalSearch.value =
            "";


        roleFilter.value =
            "";


        statusFilter.value =
            "";


        renderUsers();

    }

);



globalSearch.addEventListener(

    "input",

    () => {

        searchInput.value =
            globalSearch.value;


        renderUsers();

    }

);



// ======================================================
// CLICK FUERA
// ======================================================

userModal.addEventListener(

    "click",

    event => {

        if (
            event.target ===
            userModal
        ) {

            closeUserModal();

        }

    }

);



deleteModal.addEventListener(

    "click",

    event => {

        if (
            event.target ===
            deleteModal
        ) {

            deleteModal.classList.remove(
                "show"
            );

        }

    }

);



// ======================================================
// ESCAPE
// ======================================================

document.addEventListener(

    "keydown",

    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeSidebar();


            closeUserModal();


            deleteModal.classList.remove(
                "show"
            );

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

async function init() {

    await cargarRolesDesdeBD();

    updateStats();


    renderUsers();



    if (selectedUserId) {

        showUserDetails(
            selectedUserId
        );

    }



    /*
    Lucide puede tardar un poquito
    cuando se carga desde Internet.
    */

    setTimeout(

        () => {

            refreshIcons();

        },

        300

    );

}



async function init() {

    await cargarRolesDesdeBD();
    await cargarUsuariosDesdeBD();

    setTimeout(() => {
        refreshIcons();
    }, 300);

}

init();