// ======================================================
// SENTIR - USUARIOS
// ======================================================


// ======================================================
// DATOS TEMPORALES
// ======================================================

let users = [

    {
        id: 1,

        name:
            "Valentina García",

        document:
            "1023456789",

        email:
            "valentina.garcia@est.edu",

        phone:
            "+57 300 123 4567",

        password:
            "123456",

        photo:
            null,

        role:
            "Estudiante",

        grade:
            "9°",

        groupDirector:
            "",

        directorGroup:
            "",

        status:
            "Activo",

        registrationDate:
            "12 mar. 2026"
    },


    {
        id: 2,

        name:
            "Mateo Rodríguez",

        document:
            "1008765432",

        email:
            "mateo.rodriguez@est.edu",

        phone:
            "+57 301 456 7890",

        password:
            "123456",

        photo:
            null,

        role:
            "Estudiante",

        grade:
            "10°",

        groupDirector:
            "",

        directorGroup:
            "",

        status:
            "Activo",

        registrationDate:
            "08 abr. 2026"
    },


    {
        id: 3,

        name:
            "Daniela Castro",

        document:
            "43765432",

        email:
            "daniela.castro@sentir.edu",

        phone:
            "+57 302 454 6712",

        password:
            "123456",

        photo:
            null,

        role:
            "Docente",

        grade:
            "",

        groupDirector:
            "Sí",

        directorGroup:
            "8°2",

        status:
            "Activo",

        registrationDate:
            "15 feb. 2026"
    },


    {
        id: 4,

        name:
            "Camila López",

        document:
            "1098765432",

        email:
            "camila.lopez@sentir.edu",

        phone:
            "+57 310 342 2190",

        password:
            "123456",

        photo:
            null,

        role:
            "Psicóloga",

        grade:
            "",

        groupDirector:
            "",

        directorGroup:
            "",

        status:
            "Activo",

        registrationDate:
            "20 ene. 2026"
    },


    {
        id: 5,

        name:
            "María González",

        document:
            "52678901",

        email:
            "maria.gonzalez@sentir.edu",

        phone:
            "+57 315 111 2233",

        password:
            "123456",

        photo:
            null,

        role:
            "UAI",

        grade:
            "",

        groupDirector:
            "",

        directorGroup:
            "",

        status:
            "Activo",

        registrationDate:
            "12 may. 2026"
    },


    {
        id: 6,

        name:
            "Laura Méndez",

        document:
            "43567890",

        email:
            "laura.mendez@sentir.edu",

        phone:
            "+57 312 765 9087",

        password:
            "123456",

        photo:
            null,

        role:
            "Directivo",

        grade:
            "",

        groupDirector:
            "",

        directorGroup:
            "",

        status:
            "Activo",

        registrationDate:
            "10 ene. 2026"
    },


    {
        id: 7,

        name:
            "Carlos Ramírez",

        document:
            "79876543",

        email:
            "carlos.ramirez@sentir.edu",

        phone:
            "+57 300 777 8822",

        password:
            "123456",

        photo:
            null,

        role:
            "Comité de convivencia",

        grade:
            "",

        groupDirector:
            "",

        directorGroup:
            "",

        status:
            "Pendiente",

        registrationDate:
            "02 sep. 2026"
    }

];



// ======================================================
// ESTADO
// ======================================================

let selectedUserId =

    users.length

        ? users[0].id

        : null;



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



// FORMULARIO

const userModal =
    byId("userModal");


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


const nameInput =
    byId("nameInput");


const documentInput =
    byId("documentInput");


const emailInput =
    byId("emailInput");


const phoneInput =
    byId("phoneInput");


const passwordInput =
    byId("passwordInput");


const roleInput =
    byId("roleInput");


const statusInput =
    byId("statusInput");



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


const detailDirectorRow =
    byId("detailDirectorRow");


const detailDirector =
    byId("detailDirector");


const detailDirectorGroupRow =
    byId("detailDirectorGroupRow");


const detailDirectorGroup =
    byId("detailDirectorGroup");


const detailDate =
    byId("detailDate");


const editSelected =
    byId("editSelected");


const deleteSelected =
    byId("deleteSelected");



// TOAST

const toast =
    byId("toast");


const toastText =
    byId("toastText");



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

        showToast(
            "La página de Inicio será la siguiente 💜"
        );


        if (
            window.innerWidth <=
            900
        ) {

            closeSidebar();

        }

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

}



// ======================================================
// TABLA
// ======================================================

function renderUsers() {

    const search =

        searchInput
            .value
            .trim()
            .toLowerCase();



    const selectedRole =
        roleFilter.value;



    const selectedStatus =
        statusFilter.value;



    const filteredUsers =

        users.filter(

            user => {

                const matchSearch =

                    user.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    user.email
                        .toLowerCase()
                        .includes(search)

                    ||

                    user.document
                        .toLowerCase()
                        .includes(search);


                const matchRole =

                    !selectedRole

                    ||

                    user.role ===
                    selectedRole;


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

    }

    else {

        detailGradeRow.classList.add(
            "hidden"
        );

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

            `Director de grupo: ${user.groupDirector || "No"}`;


        if (
            user.groupDirector ===
            "Sí"
        ) {

            detailDirectorGroupRow.classList.remove(
                "hidden"
            );


            detailDirectorGroup.textContent =

                `Grupo: ${user.directorGroup}`;

        }

        else {

            detailDirectorGroupRow.classList.add(
                "hidden"
            );

        }

    }

    else {

        detailDirectorRow.classList.add(
            "hidden"
        );


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

    const role =
        roleInput.value;



    // ESTUDIANTE

    if (
        role ===
        "Estudiante"
    ) {

        gradeField.classList.remove(
            "hidden"
        );


        gradeInput.required =
            true;

    }

    else {

        gradeField.classList.add(
            "hidden"
        );


        gradeInput.required =
            false;


        gradeInput.value =
            "";

    }



    // DOCENTE

    if (
        role ===
        "Docente"
    ) {

        groupDirectorField.classList.remove(
            "hidden"
        );


        groupDirectorInput.required =
            true;

    }

    else {

        groupDirectorField.classList.add(
            "hidden"
        );


        groupDirectorInput.required =
            false;


        groupDirectorInput.value =
            "";


        directorGroupField.classList.add(
            "hidden"
        );


        directorGroupInput.required =
            false;


        directorGroupInput.value =
            "";

    }

}



function updateDirectorField() {

    if (

        roleInput.value ===
        "Docente"

        &&

        groupDirectorInput.value ===
        "Sí"

    ) {

        directorGroupField.classList.remove(
            "hidden"
        );


        directorGroupInput.required =
            true;

    }

    else {

        directorGroupField.classList.add(
            "hidden"
        );


        directorGroupInput.required =
            false;


        directorGroupInput.value =
            "";

    }

}



roleInput.addEventListener(

    "change",

    () => {

        updateConditionalFields();

        updateDirectorField();

    }

);



groupDirectorInput.addEventListener(

    "change",

    updateDirectorField

);



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


        const reader =
            new FileReader();


        reader.onload =
            event => {

                selectedPhoto =
                    event.target.result;


                photoPreview.innerHTML = `

                    <img
                        src="${selectedPhoto}"
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

function openCreateModal() {

    userForm.reset();


    editingId.value =
        "";


    modalTitle.textContent =
        "Registrar usuario";


    statusInput.value =
        "Activo";


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


    nameInput.value =
        user.name;


    documentInput.value =
        user.document;


    emailInput.value =
        user.email;


    phoneInput.value =
        user.phone;


    passwordInput.value =
        user.password;


    roleInput.value =
        user.role;


    statusInput.value =
        user.status;


    selectedPhoto =
        user.photo;



    updateConditionalFields();



    if (
        user.role ===
        "Estudiante"
    ) {

        gradeInput.value =
            user.grade || "";

    }



    if (
        user.role ===
        "Docente"
    ) {

        groupDirectorInput.value =
            user.groupDirector || "No";


        updateDirectorField();


        directorGroupInput.value =
            user.directorGroup || "";

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

    event => {


        event.preventDefault();



        const id =

            Number(
                editingId.value
            );



        if (

            roleInput.value ===
            "Estudiante"

            &&

            !gradeInput.value

        ) {

            showToast(
                "Selecciona el grado del estudiante"
            );


            return;

        }



        if (

            roleInput.value ===
            "Docente"

            &&

            !groupDirectorInput.value

        ) {

            showToast(
                "Indica si el docente es director de grupo"
            );


            return;

        }



        if (

            roleInput.value ===
            "Docente"

            &&

            groupDirectorInput.value ===
            "Sí"

            &&

            !directorGroupInput
                .value
                .trim()

        ) {

            showToast(
                "Indica de qué grupo es director"
            );


            return;

        }



        const data = {


            name:

                nameInput
                    .value
                    .trim(),


            document:

                documentInput
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


            photo:

                selectedPhoto,


            role:

                roleInput.value,


            grade:

                roleInput.value ===
                "Estudiante"

                    ?

                    gradeInput.value

                    :

                    "",


            groupDirector:

                roleInput.value ===
                "Docente"

                    ?

                    groupDirectorInput.value

                    :

                    "",


            directorGroup:

                roleInput.value ===
                "Docente"

                &&

                groupDirectorInput.value ===
                "Sí"

                    ?

                    directorGroupInput
                        .value
                        .trim()

                    :

                    "",


            status:

                statusInput.value

        };



        // DOCUMENTO REPETIDO

        const duplicateDocument =

            users.find(

                user =>

                    user.document ===
                    data.document

                    &&

                    user.id !==
                    id

            );



        if (duplicateDocument) {

            showToast(
                "Ya existe un usuario con ese documento"
            );


            return;

        }



        // CORREO REPETIDO

        const duplicateEmail =

            users.find(

                user =>

                    user.email
                        .toLowerCase()

                    ===

                    data.email
                        .toLowerCase()

                    &&

                    user.id !==
                    id

            );



        if (duplicateEmail) {

            showToast(
                "Ya existe un usuario con ese correo"
            );


            return;

        }



        // EDITAR

        if (id) {

            const index =

                users.findIndex(

                    user =>
                        user.id === id

                );



            if (
                index !== -1
            ) {

                users[index] = {

                    ...users[index],

                    ...data

                };


                selectedUserId =
                    id;

            }



            showToast(
                "Usuario actualizado correctamente"
            );

        }



        // CREAR

        else {

            const newId =

                users.length

                    ?

                    Math.max(

                        ...users.map(

                            user =>
                                user.id

                        )

                    ) + 1

                    :

                    1;



            const newUser = {

                id:
                    newId,

                ...data,

                registrationDate:

                    new Date()
                        .toLocaleDateString(
                            "es-CO"
                        )

            };



            users.unshift(
                newUser
            );



            selectedUserId =
                newId;



            showToast(
                "Usuario registrado correctamente"
            );

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

    () => {


        if (!pendingDeleteId) {

            return;

        }



        users =

            users.filter(

                user =>

                    user.id !==
                    pendingDeleteId

            );



        selectedUserId =

            users.length

                ?

                users[0].id

                :

                null;



        pendingDeleteId =
            null;



        deleteModal.classList.remove(
            "show"
        );



        updateStats();


        renderUsers();



        if (selectedUserId) {

            showUserDetails(
                selectedUserId
            );

        }



        showToast(
            "Usuario eliminado correctamente"
        );

    }

);



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



        if (!button) {

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
// MODALES
// ======================================================

openAddUser.addEventListener(

    "click",

    openCreateModal

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

function init() {

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



init();