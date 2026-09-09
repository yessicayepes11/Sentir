// ======================================================
// SENTIR
// ADMINISTRACIÓN DE USUARIOS
// ======================================================



// ======================================================
// DATOS TEMPORALES
//
// MÁS ADELANTE ESTO VENDRÁ DE LA BASE DE DATOS
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

        photo:
            null,

        password:
            "123456",

        role:
            "Estudiante",

        grade:
            "9°",

        status:
            "Activo",

        registrationDate:
            "12 mar. 2026",

        lastAccess:
            "Hoy, 10:24"
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

        photo:
            null,

        password:
            "123456",

        role:
            "Estudiante",

        grade:
            "10°",

        status:
            "Activo",

        registrationDate:
            "08 abr. 2026",

        lastAccess:
            "Ayer, 18:30"
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

        photo:
            null,

        password:
            "123456",

        role:
            "Docente",

        grade:
            "",

        status:
            "Activo",

        registrationDate:
            "15 feb. 2026",

        lastAccess:
            "Hoy, 08:45"
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

        photo:
            null,

        password:
            "123456",

        role:
            "Psicóloga",

        grade:
            "",

        status:
            "Activo",

        registrationDate:
            "20 ene. 2026",

        lastAccess:
            "Hoy, 09:15"
    },


    {
        id: 5,

        name:
            "Laura Méndez",

        document:
            "43567890",

        email:
            "laura.mendez@sentir.edu",

        phone:
            "+57 312 765 9087",

        photo:
            null,

        password:
            "123456",

        role:
            "Directivo",

        grade:
            "",

        status:
            "Activo",

        registrationDate:
            "10 ene. 2026",

        lastAccess:
            "Hoy, 11:02"
    },


    {
        id: 6,

        name:
            "María González",

        document:
            "52678901",

        email:
            "maria.gonzalez@sentir.edu",

        phone:
            "+57 315 111 2233",

        photo:
            null,

        password:
            "123456",

        role:
            "UAI",

        grade:
            "",

        status:
            "Activo",

        registrationDate:
            "12 may. 2026",

        lastAccess:
            "Ayer, 15:30"
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

        photo:
            null,

        password:
            "123456",

        role:
            "Comité de convivencia",

        grade:
            "",

        status:
            "Pendiente",

        registrationDate:
            "02 sep. 2026",

        lastAccess:
            "Ayer, 16:20"
    }

];



// ======================================================
// VARIABLES
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
// ELEMENTOS DEL DOM
// ======================================================

const tableBody =

    document.getElementById(
        "usersTableBody"
    );



const searchInput =

    document.getElementById(
        "searchInput"
    );



const globalSearch =

    document.getElementById(
        "globalSearch"
    );



const roleFilter =

    document.getElementById(
        "roleFilter"
    );



const statusFilter =

    document.getElementById(
        "statusFilter"
    );



const clearFilters =

    document.getElementById(
        "clearFilters"
    );



// ======================================================
// SIDEBAR
// ======================================================

const sidebar =

    document.getElementById(
        "sidebar"
    );



const mobileMenuButton =

    document.getElementById(
        "mobileMenuButton"
    );



const sidebarOverlay =

    document.getElementById(
        "sidebarOverlay"
    );



// ======================================================
// ESTADÍSTICAS
// ======================================================

const totalUsers =

    document.getElementById(
        "totalUsers"
    );



const studentCount =

    document.getElementById(
        "studentCount"
    );



const teacherCount =

    document.getElementById(
        "teacherCount"
    );



// ======================================================
// MODAL USUARIO
// ======================================================

const userModal =

    document.getElementById(
        "userModal"
    );



const openAddUser =

    document.getElementById(
        "openAddUser"
    );



const closeModalButton =

    document.getElementById(
        "closeModal"
    );



const cancelModal =

    document.getElementById(
        "cancelModal"
    );



const userForm =

    document.getElementById(
        "userForm"
    );



const modalTitle =

    document.getElementById(
        "modalTitle"
    );



// ======================================================
// INPUTS DEL FORMULARIO
// ======================================================

const editingId =

    document.getElementById(
        "editingId"
    );



const nameInput =

    document.getElementById(
        "nameInput"
    );



const documentInput =

    document.getElementById(
        "documentInput"
    );



const emailInput =

    document.getElementById(
        "emailInput"
    );



const phoneInput =

    document.getElementById(
        "phoneInput"
    );



const photoInput =

    document.getElementById(
        "photoInput"
    );



const photoPreview =

    document.getElementById(
        "photoPreview"
    );



const passwordInput =

    document.getElementById(
        "passwordInput"
    );



const roleInput =

    document.getElementById(
        "roleInput"
    );



const gradeField =

    document.getElementById(
        "gradeField"
    );



const gradeInput =

    document.getElementById(
        "gradeInput"
    );



const statusInput =

    document.getElementById(
        "statusInput"
    );



// ======================================================
// MODAL ELIMINAR
// ======================================================

const deleteModal =

    document.getElementById(
        "deleteModal"
    );



const cancelDelete =

    document.getElementById(
        "cancelDelete"
    );



const confirmDelete =

    document.getElementById(
        "confirmDelete"
    );



// ======================================================
// DETALLES USUARIO
// ======================================================

const detailAvatar =

    document.getElementById(
        "detailAvatar"
    );



const detailName =

    document.getElementById(
        "detailName"
    );



const detailRole =

    document.getElementById(
        "detailRole"
    );



const detailDocument =

    document.getElementById(
        "detailDocument"
    );



const detailEmail =

    document.getElementById(
        "detailEmail"
    );



const detailPhone =

    document.getElementById(
        "detailPhone"
    );



const detailGradeRow =

    document.getElementById(
        "detailGradeRow"
    );



const detailGrade =

    document.getElementById(
        "detailGrade"
    );



const detailDate =

    document.getElementById(
        "detailDate"
    );



const detailAccess =

    document.getElementById(
        "detailAccess"
    );



const editSelected =

    document.getElementById(
        "editSelected"
    );



const deleteSelected =

    document.getElementById(
        "deleteSelected"
    );



// ======================================================
// TOAST
// ======================================================

const toast =

    document.getElementById(
        "toast"
    );



const toastText =

    document.getElementById(
        "toastText"
    );



// ======================================================
// MENÚ HAMBURGUESA
// ======================================================

function openSidebar() {


    sidebar.classList.add(
        "open"
    );


    sidebarOverlay.classList.add(
        "show"
    );


    mobileMenuButton.innerHTML = `

        <i data-lucide="x"></i>

    `;


    document.body.style.overflow =
        "hidden";


    lucide.createIcons();

}



function closeSidebar() {


    sidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "show"
    );


    mobileMenuButton.innerHTML = `

        <i data-lucide="menu"></i>

    `;


    document.body.style.overflow =
        "";


    lucide.createIcons();

}



function toggleSidebar() {


    const isOpen =

        sidebar.classList.contains(
            "open"
        );


    if (isOpen) {

        closeSidebar();

    }

    else {

        openSidebar();

    }

}



mobileMenuButton.addEventListener(

    "click",

    toggleSidebar

);



sidebarOverlay.addEventListener(

    "click",

    closeSidebar

);



document

    .querySelectorAll(
        ".nav-item"
    )

    .forEach(

        item => {


            item.addEventListener(

                "click",

                () => {


                    if (
                        window.innerWidth <= 900
                    ) {

                        closeSidebar();

                    }

                }

            );

        }

    );



// ======================================================
// AJUSTAR SIDEBAR AL CAMBIAR TAMAÑO
// ======================================================

window.addEventListener(

    "resize",

    () => {


        if (
            window.innerWidth > 900
        ) {


            sidebar.classList.remove(
                "open"
            );


            sidebarOverlay.classList.remove(
                "show"
            );


            document.body.style.overflow =
                "";


            mobileMenuButton.innerHTML = `

                <i data-lucide="menu"></i>

            `;


            lucide.createIcons();

        }

    }

);



// ======================================================
// MOSTRAR / OCULTAR GRADO
// ======================================================

function updateGradeField() {


    if (
        roleInput.value ===
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

}



// CUANDO CAMBIA EL ROL

roleInput.addEventListener(

    "change",

    updateGradeField

);



// ======================================================
// INICIALES
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



// ======================================================
// CLASE DEL ROL
// ======================================================

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



// ======================================================
// CLASE DEL ESTADO
// ======================================================

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



// ======================================================
// AVATAR
// ======================================================

function renderAvatar(

    user,

    className =
        "mini-avatar"

) {


    if (user.photo) {


        return `

            <div class="${className}">

                <img
                    src="${user.photo}"
                    alt="Foto de ${user.name}"
                >

            </div>

        `;

    }


    return `

        <div class="${className}">

            <span class="avatar-fallback">

                ${getInitials(
                    user.name
                )}

            </span>

        </div>

    `;

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

        2500

    );

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



    const role =
        roleFilter.value;



    const status =
        statusFilter.value;



    const filteredUsers =

        users.filter(

            user => {


                const matchesSearch =


                    user.name

                        .toLowerCase()

                        .includes(
                            search
                        )


                    ||


                    user.email

                        .toLowerCase()

                        .includes(
                            search
                        )


                    ||


                    user.document

                        .toLowerCase()

                        .includes(
                            search
                        );



                const matchesRole =

                    !role

                    ||

                    user.role === role;



                const matchesStatus =

                    !status

                    ||

                    user.status === status;



                return (

                    matchesSearch

                    &&

                    matchesRole

                    &&

                    matchesStatus

                );

            }

        );



    tableBody.innerHTML =
        "";



    if (
        filteredUsers.length === 0
    ) {


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#817DA4;
                    "
                >

                    No encontramos usuarios
                    con esos filtros.

                </td>

            </tr>

        `;


        document

            .getElementById(
                "tableCounter"
            )

            .textContent =

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

                    <input
                        class="row-checkbox"
                        type="checkbox"
                    >

                </td>


                <td>

                    <div class="user-name-cell">

                        ${renderAvatar(
                            user
                        )}

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

                    ${user.lastAccess}

                </td>


                <td>

                    <div class="action-buttons">


                        <button
                            class="
                                action-button
                                view
                            "
                            data-action="view"
                            data-id="${user.id}"
                            title="Ver usuario"
                        >

                            <i data-lucide="eye"></i>

                        </button>


                        <button
                            class="
                                action-button
                                edit
                            "
                            data-action="edit"
                            data-id="${user.id}"
                            title="Editar usuario"
                        >

                            <i data-lucide="pencil"></i>

                        </button>


                        <button
                            class="
                                action-button
                                delete
                            "
                            data-action="delete"
                            data-id="${user.id}"
                            title="Eliminar usuario"
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



    document

        .getElementById(
            "tableCounter"
        )

        .textContent =

            `Mostrando ${filteredUsers.length} de ${users.length} usuarios`;



    lucide.createIcons();

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
// MOSTRAR DETALLE DEL USUARIO
// ======================================================

function showUserDetails(id) {


    const user =

        users.find(

            user =>

                user.id ===
                Number(id)

        );



    if (!user) {


        detailAvatar.innerHTML = `

            <span class="avatar-fallback">
                —
            </span>

        `;


        detailName.textContent =
            "Selecciona un usuario";


        detailRole.textContent =
            "Usuario";


        detailDocument.textContent =
            "—";


        detailEmail.textContent =
            "—";


        detailPhone.textContent =
            "—";


        detailDate.textContent =
            "—";


        detailAccess.textContent =
            "—";


        detailGradeRow.classList.add(
            "hidden"
        );


        return;

    }



    selectedUserId =
        user.id;



    // FOTO

    if (user.photo) {


        detailAvatar.innerHTML = `

            <img
                src="${user.photo}"
                alt="Foto de ${user.name}"
            >

        `;

    }

    else {


        detailAvatar.innerHTML = `

            <span class="avatar-fallback">

                ${getInitials(
                    user.name
                )}

            </span>

        `;

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



    // MOSTRAR GRADO SOLO SI ES ESTUDIANTE

    if (
        user.role ===
        "Estudiante"
    ) {


        detailGradeRow.classList.remove(
            "hidden"
        );


        detailGrade.textContent =

            `Grado: ${user.grade || "Sin asignar"}`;

    }

    else {


        detailGradeRow.classList.add(
            "hidden"
        );

    }



    detailDate.textContent =

        `Fecha de registro: ${user.registrationDate}`;



    detailAccess.textContent =

        `Último acceso: ${user.lastAccess}`;



    renderUsers();

}



// ======================================================
// FOTO DEL FORMULARIO
// ======================================================

function resetPhotoPreview() {


    selectedPhoto =
        null;


    photoInput.value =
        "";


    photoPreview.innerHTML = `

        <i data-lucide="image-plus"></i>

    `;


    lucide.createIcons();

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

            loadEvent => {


                selectedPhoto =

                    loadEvent

                        .target

                        .result;



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
// ABRIR REGISTRO
// ======================================================

function openCreateModal() {


    userForm.reset();


    editingId.value =
        "";


    modalTitle.textContent =
        "Registrar usuario";


    statusInput.value =
        "Activo";


    roleInput.value =
        "";


    gradeInput.value =
        "";


    gradeField.classList.add(
        "hidden"
    );


    gradeInput.required =
        false;


    passwordInput.required =
        true;


    resetPhotoPreview();


    userModal.classList.add(
        "show"
    );

}



// ======================================================
// ABRIR EDICIÓN
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



    // GRADO

    if (
        user.role ===
        "Estudiante"
    ) {


        gradeField.classList.remove(
            "hidden"
        );


        gradeInput.value =
            user.grade || "";


        gradeInput.required =
            true;

    }

    else {


        gradeField.classList.add(
            "hidden"
        );


        gradeInput.value =
            "";


        gradeInput.required =
            false;

    }



    // FOTO

    selectedPhoto =
        user.photo;



    if (user.photo) {


        photoPreview.innerHTML = `

            <img
                src="${user.photo}"
                alt="Foto de ${user.name}"
            >

        `;

    }

    else {


        resetPhotoPreview();

    }



    modalTitle.textContent =
        "Editar usuario";


    userModal.classList.add(
        "show"
    );

}



// ======================================================
// CERRAR MODAL USUARIO
// ======================================================

function closeUserModal() {


    userModal.classList.remove(
        "show"
    );

}



// ======================================================
// GUARDAR USUARIO
// ======================================================

userForm.addEventListener(

    "submit",

    event => {


        event.preventDefault();



        const id =

            Number(
                editingId.value
            );



        // SI ES ESTUDIANTE DEBE TENER GRADO

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



        const formData = {


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



            photo:

                selectedPhoto,



            password:

                passwordInput
                    .value,



            role:

                roleInput
                    .value,



            grade:

                roleInput.value ===
                "Estudiante"

                    ?

                    gradeInput.value

                    :

                    "",



            status:

                statusInput
                    .value,



            lastAccess:

                "Ahora"

        };



        // ==================================================
        // VALIDAR DOCUMENTO REPETIDO
        // ==================================================

        const duplicateDocument =

            users.find(

                user =>


                    user.document ===
                    formData.document


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



        // ==================================================
        // VALIDAR CORREO REPETIDO
        // ==================================================

        const duplicateEmail =

            users.find(

                user =>


                    user.email
                        .toLowerCase()


                    ===


                    formData.email
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



        // ==================================================
        // EDITAR USUARIO
        // ==================================================

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


                    ...formData

                };



                selectedUserId =
                    id;



                showToast(
                    "Usuario actualizado correctamente"
                );

            }

        }



        // ==================================================
        // CREAR USUARIO
        // ==================================================

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



            const today =


                new Date()

                    .toLocaleDateString(

                        "es-CO",

                        {

                            day:
                                "2-digit",

                            month:
                                "short",

                            year:
                                "numeric"

                        }

                    );



            const newUser = {


                id:
                    newId,


                ...formData,


                registrationDate:
                    today

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



        if (

            selectedUserId ===
            pendingDeleteId

        ) {


            selectedUserId =


                users.length


                    ?


                    users[0].id


                    :


                    null;

        }



        deleteModal.classList.remove(
            "show"
        );



        pendingDeleteId =
            null;



        updateStats();



        if (selectedUserId) {


            showUserDetails(
                selectedUserId
            );

        }

        else {


            renderUsers();


            showUserDetails(
                null
            );

        }



        showToast(
            "Usuario eliminado correctamente"
        );

    }

);



// ======================================================
// ACCIONES DE LA TABLA
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


        if (!selectedUserId) {

            return;

        }


        openEditModal(
            selectedUserId
        );

    }

);



deleteSelected.addEventListener(

    "click",

    () => {


        if (!selectedUserId) {

            return;

        }


        openDeleteModal(
            selectedUserId
        );

    }

);



// ======================================================
// EVENTOS MODAL
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


        deleteModal.classList.remove(
            "show"
        );


        pendingDeleteId =
            null;

    }

);



// CLICK FUERA DEL MODAL

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



// ======================================================
// BUSCADOR SUPERIOR
// ======================================================

globalSearch.addEventListener(

    "input",

    () => {


        searchInput.value =
            globalSearch.value;


        renderUsers();

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


            closeUserModal();


            deleteModal.classList.remove(
                "show"
            );


            closeSidebar();

        }

    }

);



// ======================================================
// INICIAR PÁGINA
// ======================================================

function init() {


    updateStats();


    renderUsers();



    if (selectedUserId) {


        showUserDetails(
            selectedUserId
        );

    }



    updateGradeField();


    lucide.createIcons();

}



init();