/* =========================================================
   SENTIR
   PERFIL ESTUDIANTE
========================================================= */


/* =========================================================
   DATOS INICIALES DE EJEMPLO
========================================================= */

/*
    Cuando conecten SENTIR a la base de datos,
    estos valores deberían llegar desde el backend.
*/

const defaultProfile = {

    name:
        "Ana López",

    document:
        "1234567890",

    email:
        "ana@correo.com",

    phone:
        "300 000 0000",

    role:
        "Estudiante",

    grade:
        "10°A",

    photo:
        null

};


const PROFILE_STORAGE_KEY =
    "sentir_student_profile";



/* =========================================================
   OBTENER PERFIL
========================================================= */

function getStoredProfile() {

    try {

        const stored =
            localStorage.getItem(
                PROFILE_STORAGE_KEY
            );


        if (!stored) {

            return {
                ...defaultProfile
            };

        }


        return {
            ...defaultProfile,
            ...JSON.parse(stored)
        };

    } catch {

        return {
            ...defaultProfile
        };

    }

}



function saveStoredProfile(
    profile
) {

    localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
    );

}



let currentProfile =
    getStoredProfile();



/* =========================================================
   SIDEBAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuItems = document.querySelectorAll(".menu-item");

    // Función para abrir/cerrar el sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("active");
    }

    // Función para cerrar el sidebar
    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    // Evento del botón de hamburguesa
    if (mobileMenu) {
        mobileMenu.addEventListener("click", toggleSidebar);
    }

    // Evento al hacer clic en el fondo oscuro
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    // Cerrar sidebar al hacer clic en una opción (en dispositivos móviles)
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
});
/* =========================================================
   TOP PROFILE DROPDOWN
========================================================= */

const profileMenuContainer =
    document.querySelector(
        ".profile-menu-container"
    );


const profileMenuButton =
    document.getElementById(
        "profileMenuButton"
    );



profileMenuButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        const isOpen =
            profileMenuContainer
                .classList
                .toggle(
                    "open"
                );


        profileMenuButton.setAttribute(
            "aria-expanded",
            isOpen
                ? "true"
                : "false"
        );

    }
);



document.addEventListener(
    "click",
    event => {

        if (
            !profileMenuContainer.contains(
                event.target
            )
        ) {

            profileMenuContainer
                .classList
                .remove(
                    "open"
                );


            profileMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);



/* =========================================================
   ELEMENTOS DE PERFIL
========================================================= */

const profileForm =
    document.getElementById(
        "profileForm"
    );


const studentName =
    document.getElementById(
        "studentName"
    );


const studentDocument =
    document.getElementById(
        "studentDocument"
    );


const studentEmail =
    document.getElementById(
        "studentEmail"
    );


const studentPhone =
    document.getElementById(
        "studentPhone"
    );


const studentRole =
    document.getElementById(
        "studentRole"
    );


const studentGrade =
    document.getElementById(
        "studentGrade"
    );


const heroStudentName =
    document.getElementById(
        "heroStudentName"
    );


const heroGrade =
    document.getElementById(
        "heroGrade"
    );


const academicGrade =
    document.getElementById(
        "academicGrade"
    );


const topProfileName =
    document.getElementById(
        "topProfileName"
    );



/* =========================================================
   FOTO
========================================================= */

const profilePhoto =
    document.getElementById(
        "profilePhoto"
    );


const profilePhotoPlaceholder =
    document.getElementById(
        "profilePhotoPlaceholder"
    );


const topProfileAvatar =
    document.getElementById(
        "topProfileAvatar"
    );


const profilePhotoInput =
    document.getElementById(
        "profilePhotoInput"
    );


const removePhotoButton =
    document.getElementById(
        "removePhotoButton"
    );



/* =========================================================
   RENDER PERFIL
========================================================= */

function renderProfile() {

    studentName.value =
        currentProfile.name;


    studentDocument.value =
        currentProfile.document;


    studentEmail.value =
        currentProfile.email;


    studentPhone.value =
        currentProfile.phone;


    studentRole.value =
        currentProfile.role;


    studentGrade.value =
        currentProfile.grade;


    heroStudentName.textContent =
        currentProfile.name;


    heroGrade.textContent =
        `Grado ${currentProfile.grade}`;


    academicGrade.textContent =
        currentProfile.grade;


    /*
        Nombre corto en topbar.
    */

    const firstName =
        currentProfile.name
            .trim()
            .split(" ")[0]
        || "Estudiante";


    topProfileName.textContent =
        firstName;


    /*
        Inicial.
    */

    const initial =
        currentProfile.name
            .trim()
            .charAt(0)
            .toUpperCase()
        || "E";


    profilePhotoPlaceholder.textContent =
        initial;


    /*
        Foto.
    */

    if (
        currentProfile.photo
    ) {

        profilePhoto.src =
            currentProfile.photo;


        profilePhoto.style.display =
            "block";


        profilePhotoPlaceholder.style.display =
            "none";


        topProfileAvatar.textContent =
            "";


        topProfileAvatar.style.backgroundImage =
            `url("${currentProfile.photo}")`;


    } else {

        profilePhoto.removeAttribute(
            "src"
        );


        profilePhoto.style.display =
            "none";


        profilePhotoPlaceholder.style.display =
            "grid";


        topProfileAvatar.style.backgroundImage =
            "none";


        topProfileAvatar.textContent =
            initial;

    }


    calculateProfileCompletion();

}



/* =========================================================
   FOTO DE PERFIL
========================================================= */

profilePhotoInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {

            return;

        }


        const allowedTypes =
            [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            showToast(
                "Formato no permitido",
                "Utiliza una imagen JPG, PNG o WEBP.",
                true
            );

            profilePhotoInput.value =
                "";

            return;

        }


        const maxSize =
            2 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            showToast(
                "Imagen demasiado grande",
                "La fotografía debe pesar máximo 2 MB.",
                true
            );

            profilePhotoInput.value =
                "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            () => {

                currentProfile.photo =
                    reader.result;


                saveStoredProfile(
                    currentProfile
                );


                renderProfile();


                showToast(
                    "Foto actualizada",
                    "Tu nueva foto de perfil se guardó correctamente."
                );

            };


        reader.readAsDataURL(
            file
        );

    }
);



/* =========================================================
   QUITAR FOTO
========================================================= */

const removePhotoModal =
    document.getElementById(
        "removePhotoModal"
    );


const cancelRemovePhoto =
    document.getElementById(
        "cancelRemovePhoto"
    );


const confirmRemovePhoto =
    document.getElementById(
        "confirmRemovePhoto"
    );



removePhotoButton.addEventListener(
    "click",
    () => {

        if (
            !currentProfile.photo
        ) {

            showToast(
                "Sin foto personalizada",
                "Actualmente estás utilizando tu inicial como avatar."
            );

            return;

        }


        openModal(
            removePhotoModal
        );

    }
);



cancelRemovePhoto.addEventListener(
    "click",
    () => {

        closeModal(
            removePhotoModal
        );

    }
);



confirmRemovePhoto.addEventListener(
    "click",
    () => {

        currentProfile.photo =
            null;


        saveStoredProfile(
            currentProfile
        );


        renderProfile();


        profilePhotoInput.value =
            "";


        closeModal(
            removePhotoModal
        );


        showToast(
            "Foto eliminada",
            "Ahora tu perfil utiliza la inicial de tu nombre."
        );

    }
);



/* =========================================================
   EDIT PROFILE
========================================================= */

const editProfileButton =
    document.getElementById(
        "editProfileButton"
    );


const editActions =
    document.getElementById(
        "editActions"
    );


const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );


let editing =
    false;



function setEditMode(
    enabled
) {

    editing =
        enabled;


    profileForm.classList.toggle(
        "editing",
        enabled
    );


    studentName.disabled =
        !enabled;


    studentEmail.disabled =
        !enabled;


    studentPhone.disabled =
        !enabled;


    studentGrade.disabled =
        !enabled;


    editActions.classList.toggle(
        "hidden",
        !enabled
    );


    if (
        enabled
    ) {

        editProfileButton.innerHTML =
            `
                <i class="fa-solid fa-xmark"></i>
                Cancelar edición
            `;


        studentName.focus();

    } else {

        editProfileButton.innerHTML =
            `
                <i class="fa-solid fa-pen"></i>
                Editar perfil
            `;

    }

}



editProfileButton.addEventListener(
    "click",
    () => {

        if (
            editing
        ) {

            renderProfile();

            setEditMode(
                false
            );

        } else {

            setEditMode(
                true
            );

        }

    }
);



cancelEditButton.addEventListener(
    "click",
    () => {

        renderProfile();

        setEditMode(
            false
        );

    }
);



/* =========================================================
   GUARDAR PERFIL
========================================================= */

profileForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            studentName
                .value
                .trim();


        const email =
            studentEmail
                .value
                .trim();


        const phone =
            studentPhone
                .value
                .trim();


        const grade =
            studentGrade.value;


        if (
            name.length < 3
        ) {

            showToast(
                "Revisa tu nombre",
                "Ingresa un nombre válido.",
                true
            );

            studentName.focus();

            return;

        }


        if (
            !isValidEmail(
                email
            )
        ) {

            showToast(
                "Correo inválido",
                "Revisa el correo electrónico ingresado.",
                true
            );

            studentEmail.focus();

            return;

        }


        if (
            phone.length < 7
        ) {

            showToast(
                "Celular inválido",
                "Revisa el número de celular ingresado.",
                true
            );

            studentPhone.focus();

            return;

        }


        currentProfile = {

            ...currentProfile,

            name:
                name,

            email:
                email,

            phone:
                phone,

            grade:
                grade

        };


        saveStoredProfile(
            currentProfile
        );


        renderProfile();


        setEditMode(
            false
        );


        showToast(
            "Perfil actualizado",
            "Tus cambios se guardaron correctamente."
        );

    }
);



function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );

}



/* =========================================================
   COMPLETION
========================================================= */

function calculateProfileCompletion() {

    const fields =
        [
            currentProfile.name,
            currentProfile.document,
            currentProfile.email,
            currentProfile.phone,
            currentProfile.role,
            currentProfile.grade,
            currentProfile.photo
        ];


    const complete =
        fields.filter(
            value =>
                value &&
                String(value)
                    .trim()
                    .length > 0
        ).length;


    const percentage =
        Math.round(
            (
                complete /
                fields.length
            ) * 100
        );


    document.getElementById(
        "profileCompletionText"
    ).textContent =
        `${percentage}%`;


    document.getElementById(
        "profileCompletionBar"
    ).style.width =
        `${percentage}%`;


    const message =
        document.getElementById(
            "profileCompletionMessage"
        );


    if (
        percentage === 100
    ) {

        message.textContent =
            "Tu información principal está completa.";

    } else if (
        percentage >= 75
    ) {

        message.textContent =
            "Tu perfil está casi completo.";

    } else {

        message.textContent =
            "Completa tu información para mantener tu perfil actualizado.";

    }

}



/* =========================================================
   PASSWORD MODAL
========================================================= */

const passwordModal =
    document.getElementById(
        "passwordModal"
    );


const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );


const closePasswordModal =
    document.getElementById(
        "closePasswordModal"
    );


const passwordForm =
    document.getElementById(
        "passwordForm"
    );


const passwordError =
    document.getElementById(
        "passwordError"
    );



changePasswordButton.addEventListener(
    "click",
    () => {

        passwordForm.reset();

        passwordError.textContent =
            "";

        openModal(
            passwordModal
        );

    }
);



closePasswordModal.addEventListener(
    "click",
    () => {

        closeModal(
            passwordModal
        );

    }
);



passwordForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const current =
            document
                .getElementById(
                    "currentPassword"
                )
                .value;


        const newPassword =
            document
                .getElementById(
                    "newPassword"
                )
                .value;


        const confirm =
            document
                .getElementById(
                    "confirmPassword"
                )
                .value;


        if (
            !current ||
            !newPassword ||
            !confirm
        ) {

            passwordError.textContent =
                "Completa todos los campos.";

            return;

        }


        if (
            newPassword.length <
            8
        ) {

            passwordError.textContent =
                "La nueva contraseña debe tener al menos 8 caracteres.";

            return;

        }


        if (
            newPassword !==
            confirm
        ) {

            passwordError.textContent =
                "Las nuevas contraseñas no coinciden.";

            return;

        }


        /*
            IMPORTANTE:

            Por seguridad NO guardamos
            contraseñas en localStorage.

            Aquí posteriormente conectas
            el endpoint real del backend.

            Ejemplo:

            await fetch("/api/profile/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    currentPassword: current,
                    newPassword: newPassword
                })
            });
        */


        closeModal(
            passwordModal
        );


        passwordForm.reset();


        showToast(
            "Contraseña actualizada",
            "La contraseña se procesó correctamente en la interfaz de demostración."
        );

    }
);



/* =========================================================
   LOGOUT
========================================================= */

const logoutModal =
    document.getElementById(
        "logoutModal"
    );


const logoutTriggers =
    document.querySelectorAll(
        ".logout-trigger"
    );


const cancelLogout =
    document.getElementById(
        "cancelLogout"
    );


const confirmLogout =
    document.getElementById(
        "confirmLogout"
    );



logoutTriggers.forEach(
    trigger => {

        trigger.addEventListener(
            "click",
            () => {

                profileMenuContainer
                    .classList
                    .remove(
                        "open"
                    );


                openModal(
                    logoutModal
                );

            }
        );

    }
);



cancelLogout.addEventListener(
    "click",
    () => {

        closeModal(
            logoutModal
        );

    }
);



confirmLogout.addEventListener(
    "click",
    () => {

        /*
            AQUÍ VA EL LOGOUT REAL.

            Ejemplo:

            window.location.href =
                "login.html";
        */


        closeModal(
            logoutModal
        );


        showToast(
            "Sesión cerrada",
            "Conecta este botón posteriormente con el cierre de sesión del backend."
        );

    }
);



/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(
    modal
) {

    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "no-scroll"
    );

}



function closeModal(
    modal
) {

    modal.classList.remove(
        "show"
    );


    if (
        !sidebar.classList.contains(
            "open"
        )
    ) {

        document.body.classList.remove(
            "no-scroll"
        );

    }

}



document
    .querySelectorAll(
        ".modal-overlay"
    )
    .forEach(
        overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeModal(
                            overlay
                        );

                    }

                }
            );

        }
    );



/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById(
        "toast"
    );


const toastTitle =
    document.getElementById(
        "toastTitle"
    );


const toastText =
    document.getElementById(
        "toastText"
    );


let toastTimer =
    null;



function showToast(
    title,
    message,
    isError = false
) {

    clearTimeout(
        toastTimer
    );


    toastTitle.textContent =
        title;


    toastText.textContent =
        message;


    const icon =
        toast.querySelector(
            ".toast-icon"
        );


    if (
        isError
    ) {

        icon.style.background =
            "#F05B67";


        icon.innerHTML =
            `
                <i class="fa-solid fa-xmark"></i>
            `;

    } else {

        icon.style.background =
            "#55D7A1";


        icon.innerHTML =
            `
                <i class="fa-solid fa-check"></i>
            `;

    }


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}



/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeSidebar();


        profileMenuContainer
            .classList
            .remove(
                "open"
            );


        document
            .querySelectorAll(
                ".modal-overlay.show"
            )
            .forEach(
                modal => {

                    closeModal(
                        modal
                    );

                }
            );

    }
);



/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderProfile();

    }
);