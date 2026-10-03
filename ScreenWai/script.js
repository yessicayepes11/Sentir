document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTOS PRINCIPALES
    // =====================================================

    const sidebar = document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const hamburger =
        document.getElementById("hamburger");

    const menuItems =
        document.querySelectorAll(".menu-item[data-section]");

    const pageSections =
        document.querySelectorAll(".page-section");


    // =====================================================
    // SIDEBAR RESPONSIVE
    // =====================================================

    function openSidebar() {

        sidebar.classList.add("open");

        sidebarOverlay.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeSidebar() {

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("active");

        document.body.style.overflow = "";

    }


    hamburger.addEventListener("click", function () {

        if (sidebar.classList.contains("open")) {

            closeSidebar();

        } else {

            openSidebar();

        }

    });


    sidebarOverlay.addEventListener("click", function () {

        closeSidebar();

    });


    window.addEventListener("resize", function () {

        if (window.innerWidth > 1000) {

            closeSidebar();

        }

    });



    // =====================================================
    // CAMBIAR ENTRE PANTALLAS
    // =====================================================

    function showSection(sectionId) {

        pageSections.forEach(function (section) {

            section.classList.remove("active-section");

        });


        const targetSection =
            document.getElementById(sectionId);


        if (targetSection) {

            targetSection.classList.add("active-section");

        }


        menuItems.forEach(function (item) {

            item.classList.remove("active");


            if (
                item.dataset.section === sectionId
            ) {

                item.classList.add("active");

            }

        });


        if (window.innerWidth <= 1000) {

            closeSidebar();

        }


        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    }


    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const sectionId =
                this.dataset.section;

            showSection(sectionId);

        });

    });



    // =====================================================
    // BOTONES DE LAS TARJETAS ESTADÍSTICAS
    // =====================================================

    const statButtons =
        document.querySelectorAll("[data-go]");


    statButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            showSection(
                this.dataset.go
            );

        });

    });



    // =====================================================
    // BOTONES INICIO
    // =====================================================

    const viewStudentsButton =
        document.getElementById("viewStudentsButton");

    const seeAllStudents =
        document.getElementById("seeAllStudents");


    viewStudentsButton.addEventListener(
        "click",
        function () {

            showSection("estudiantes");

        }
    );


    seeAllStudents.addEventListener(
        "click",
        function () {

            showSection("estudiantes");

        }
    );



    // =====================================================
    // NOTIFICACIONES
    // =====================================================

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotifications =
        document.getElementById("closeNotifications");


    notificationButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            notificationPanel.classList.toggle(
                "active"
            );

        }
    );


    closeNotifications.addEventListener(
        "click",
        function () {

            notificationPanel.classList.remove(
                "active"
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            if (
                !notificationPanel.contains(event.target) &&
                !notificationButton.contains(event.target)
            ) {

                notificationPanel.classList.remove(
                    "active"
                );

            }

        }
    );



    // =====================================================
    // MODALES
    // =====================================================

    const studentModal =
        document.getElementById("studentModal");

    const followModal =
        document.getElementById("followModal");

    const newStudentModal =
        document.getElementById("newStudentModal");


    function openModal(modal) {

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeModal(modal) {

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }


    document
        .querySelectorAll("[data-close-modal]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const modal =
                        this.closest(".modal");

                    if (modal) {

                        closeModal(modal);

                    }

                }
            );

        });


    document
        .querySelectorAll(".modal")
        .forEach(function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (event.target === modal) {

                        closeModal(modal);

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                document
                    .querySelectorAll(".modal.active")
                    .forEach(function (modal) {

                        closeModal(modal);

                    });


                notificationPanel.classList.remove(
                    "active"
                );

            }

        }
    );



    // =====================================================
    // VER INFORMACIÓN DEL ESTUDIANTE
    // =====================================================

    const modalStudentName =
        document.getElementById("modalStudentName");

    const modalStudentNameSecondary =
        document.getElementById(
            "modalStudentNameSecondary"
        );

    const modalStudentGrade =
        document.getElementById("modalStudentGrade");

    const modalDocument =
        document.getElementById("modalDocument");

    const modalStatus =
        document.getElementById("modalStatus");

    const modalDiagnosis =
        document.getElementById("modalDiagnosis");

    const modalProgress =
        document.getElementById("modalProgress");

    const modalLastFollow =
        document.getElementById("modalLastFollow");

    const modalObservation =
        document.getElementById("modalObservation");

    const modalAvatar =
        document.getElementById("modalAvatar");

    let currentStudent = "";


    function getInitials(name) {

        const parts =
            name
                .trim()
                .split(" ")
                .filter(Boolean);


        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            parts[0][0] +
            parts[1][0]
        ).toUpperCase();

    }


    function openStudentInformation(button) {

        currentStudent =
            button.dataset.name || "";


        modalStudentName.textContent =
            button.dataset.name || "-";

        modalStudentNameSecondary.textContent =
            button.dataset.name || "-";

        modalStudentGrade.textContent =
            button.dataset.grade || "-";

        modalDocument.textContent =
            button.dataset.document || "-";

        modalDiagnosis.textContent =
            button.dataset.diagnosis || "-";

        modalStatus.textContent =
            button.dataset.status || "-";

        modalProgress.textContent =
            button.dataset.progress || "-";

        modalLastFollow.textContent =
            button.dataset.last || "-";

        modalObservation.textContent =
            button.dataset.observation || "-";

        modalAvatar.textContent =
            getInitials(
                button.dataset.name || "E"
            );


        openModal(studentModal);

    }


    function activateStudentButtons() {

        document
            .querySelectorAll(".view-student")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openStudentInformation(this);

                    }
                );

            });

    }


    activateStudentButtons();



    // =====================================================
    // NUEVO SEGUIMIENTO
    // =====================================================

    const newFollowButton =
        document.getElementById("newFollowButton");

    const newFollowPageButton =
        document.getElementById(
            "newFollowPageButton"
        );

    const followStudent =
        document.getElementById("followStudent");

    const modalFollowButton =
        document.getElementById("modalFollowButton");


    function openFollowModal(studentName = "") {

        followStudent.value =
            studentName || "";

        openModal(followModal);

    }


    newFollowButton.addEventListener(
        "click",
        function () {

            openFollowModal();

        }
    );


    newFollowPageButton.addEventListener(
        "click",
        function () {

            openFollowModal();

        }
    );


    document
        .querySelectorAll(".follow-student")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    openFollowModal(
                        this.dataset.student
                    );

                }
            );

        });


    modalFollowButton.addEventListener(
        "click",
        function () {

            closeModal(studentModal);

            setTimeout(function () {

                openFollowModal(
                    currentStudent
                );

            }, 150);

        }
    );



    // =====================================================
    // FORMULARIO SEGUIMIENTO
    // =====================================================

    const followForm =
        document.getElementById("followForm");

    const followDate =
        document.getElementById("followDate");


    function setTodayDate() {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        followDate.value =
            `${year}-${month}-${day}`;

    }


    setTodayDate();


    followForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const student =
                followStudent.value;


            if (!student) {

                showToast(
                    "Selecciona un estudiante."
                );

                return;

            }


            closeModal(followModal);


            showToast(
                `Seguimiento de ${student} guardado correctamente.`
            );


            followForm.reset();

            setTodayDate();

        }
    );



    // =====================================================
    // NUEVO ESTUDIANTE
    // =====================================================

    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );

    const newStudentForm =
        document.getElementById(
            "newStudentForm"
        );


    addStudentButton.addEventListener(
        "click",
        function () {

            openModal(newStudentModal);

        }
    );


    newStudentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("newStudentName")
                    .value
                    .trim();


            closeModal(newStudentModal);


            showToast(
                `${name} fue registrado correctamente.`
            );


            newStudentForm.reset();

        }
    );



    // =====================================================
    // BÚSQUEDA Y FILTROS
    // =====================================================

    const studentSearch =
        document.getElementById("studentSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const studentRows =
        document.querySelectorAll(
            "#studentTableBody tr"
        );


    function filterStudents() {

        const search =
            studentSearch
                .value
                .toLowerCase()
                .trim();

        const status =
            statusFilter.value;


        studentRows.forEach(
            function (row) {

                const searchable =
                    (
                        row.dataset.search ||
                        row.textContent
                    )
                    .toLowerCase();


                const rowStatus =
                    row.dataset.status;


                const matchesSearch =
                    searchable.includes(search);


                const matchesStatus =
                    status === "all" ||
                    status === rowStatus;


                if (
                    matchesSearch &&
                    matchesStatus
                ) {

                    row.style.display = "";

                } else {

                    row.style.display = "none";

                }

            }
        );

    }


    studentSearch.addEventListener(
        "input",
        filterStudents
    );


    statusFilter.addEventListener(
        "change",
        filterStudents
    );



    // =====================================================
    // TOAST
    // =====================================================

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    let toastTimer;


    function showToast(message) {

        clearTimeout(toastTimer);


        toastMessage.textContent =
            message;


        toast.classList.add("active");


        toastTimer =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "active"
                    );

                },
                3000
            );

    }



    // =====================================================
    // BOTONES CON MENSAJE
    // =====================================================

    document
        .querySelectorAll("[data-toast]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    showToast(
                        this.dataset.toast
                    );

                }
            );

        });



    // =====================================================
    // EXPORTAR REPORTE CSV
    // =====================================================

    const exportReportButton =
        document.getElementById(
            "exportReportButton"
        );


    exportReportButton.addEventListener(
        "click",
        function () {

            const data = [

                [
                    "Estudiante",
                    "Grado",
                    "Diagnostico o necesidad",
                    "Estado",
                    "Progreso"
                ],

                [
                    "Laura Martinez",
                    "7A",
                    "Trastorno del espectro autista",
                    "Estable",
                    "78%"
                ],

                [
                    "Santiago Alvarez",
                    "8B",
                    "TDAH",
                    "En seguimiento",
                    "62%"
                ],

                [
                    "Valentina Rodriguez",
                    "6A",
                    "Dificultad especifica de aprendizaje",
                    "Requiere atencion",
                    "41%"
                ]

            ];


            const csvContent =
                data
                    .map(function (row) {

                        return row
                            .map(function (item) {

                                return `"${item}"`;

                            })
                            .join(",");

                    })
                    .join("\n");


            const blob =
                new Blob(
                    [csvContent],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "reporte_U-AI_SENTIR.csv";


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            URL.revokeObjectURL(url);


            showToast(
                "Reporte exportado correctamente."
            );

        }
    );



    // =====================================================
    // FECHA INICIAL
    // =====================================================

    setTodayDate();

// =====================================================
// CERRAR SESIÓN
// =====================================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "¿Estás segura de que deseas cerrar sesión?"
                );


            if (!confirmLogout) {
                return;
            }


            // =========================================
            // BORRAR DATOS DE SESIÓN
            // =========================================

            localStorage.removeItem("usuario");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("session");
            localStorage.removeItem("rol");


            sessionStorage.clear();


            // =========================================
            // MENSAJE
            // =========================================

            showToast(
                "Cerrando sesión..."
            );


            // =========================================
            // REDIRECCIÓN
            // =========================================

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                900
            );

        }
    );

}

// =====================================================
// PERFIL EDITABLE UAI
// =====================================================

const uaiProfileForm =
    document.getElementById("profileForm");

const uaiEditBtn =
    document.getElementById("editProfileBtn");

const uaiCancelBtn =
    document.getElementById("cancelProfileBtn");

const uaiActions =
    document.getElementById("profileActions");

const uaiProfilePage =
    document.querySelector(
        "#perfil .profile-page"
    );


// CAMPOS

const uaiName =
    document.getElementById("profileName");

const uaiRole =
    document.getElementById("profileRole");

const uaiInstitution =
    document.getElementById(
        "profileInstitution"
    );

const uaiModule =
    document.getElementById(
        "profileModule"
    );


// FOTO

const uaiPhotoInput =
    document.getElementById(
        "profilePhotoInput"
    );

const uaiProfileImage =
    document.getElementById(
        "profileImage"
    );

const uaiInitial =
    document.getElementById(
        "profileInitial"
    );


// NOMBRE GRANDE

const uaiTitleName =
    document.getElementById(
        "profileTitleName"
    );


// =====================================================
// VALORES PREDETERMINADOS
// =====================================================

const defaultUaiProfile = {

    name: "Jennifer",

    role: "Profesional UAI",

    institution:
        "Institución Educativa",

    module:
        "Apoyo e inclusión",

    photo: ""

};


let savedUaiProfile = {
    ...defaultUaiProfile
};


let pendingUaiPhoto = "";


// =====================================================
// CARGAR DATOS
// =====================================================

function loadUaiProfile() {

    const saved =
        localStorage.getItem(
            "sentirUaiProfile"
        );


    if (saved) {

        try {

            savedUaiProfile = {

                ...defaultUaiProfile,

                ...JSON.parse(saved)

            };

        } catch (error) {

            savedUaiProfile = {
                ...defaultUaiProfile
            };

        }

    }


    pendingUaiPhoto =
        savedUaiProfile.photo || "";


    updateUaiProfile(
        savedUaiProfile
    );

}


// =====================================================
// ACTUALIZAR PANTALLA
// =====================================================

function updateUaiProfile(profile) {

    uaiName.value =
        profile.name;

    uaiRole.value =
        profile.role;

    uaiInstitution.value =
        profile.institution;

    uaiModule.value =
        profile.module;


    uaiTitleName.textContent =
        profile.name;


    // CAMBIAR NOMBRE DEL HEADER

    const headerTitle =
        document.querySelector(
            ".header h1"
        );


    if (headerTitle) {

        headerTitle.innerHTML =
            `Hola, ${profile.name} 👋`;

    }


    // INFORMACIÓN HEADER

    const headerName =
        document.querySelector(
            ".profile-info strong"
        );


    const headerRole =
        document.querySelector(
            ".profile-info span"
        );


    if (headerName) {

        headerName.textContent =
            profile.name;

    }


    if (headerRole) {

        headerRole.textContent =
            profile.role;

    }


    // FOTO

    if (profile.photo) {

        uaiProfileImage.src =
            profile.photo;

        uaiProfileImage.hidden =
            false;

        uaiInitial.style.display =
            "none";


        // FOTO HEADER

        const headerAvatar =
            document.querySelector(
                ".profile-avatar"
            );


        if (headerAvatar) {

            headerAvatar.innerHTML = `
                <img
                    src="${profile.photo}"
                    alt="Foto de perfil"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:50%;
                    "
                >
            `;

        }

    } else {

        uaiProfileImage.hidden =
            true;

        uaiInitial.style.display =
            "";


        uaiInitial.textContent =
            profile.name
                .charAt(0)
                .toUpperCase();

    }

}


// =====================================================
// ACTIVAR EDICIÓN
// =====================================================

function setUaiEditing(editing) {

    const fields = [

        uaiName,
        uaiRole,
        uaiInstitution,
        uaiModule

    ];


    fields.forEach(
        function (field) {

            field.readOnly =
                !editing;

        }
    );


    if (editing) {

        uaiProfileForm.classList.add(
            "editing"
        );

        uaiProfilePage.classList.add(
            "editing"
        );

        uaiActions.classList.add(
            "active"
        );

        uaiEditBtn.style.display =
            "none";


        uaiName.focus();

    } else {

        uaiProfileForm.classList.remove(
            "editing"
        );

        uaiProfilePage.classList.remove(
            "editing"
        );

        uaiActions.classList.remove(
            "active"
        );

        uaiEditBtn.style.display =
            "";

    }

}


// =====================================================
// EDITAR
// =====================================================

uaiEditBtn.addEventListener(
    "click",
    function () {

        pendingUaiPhoto =
            savedUaiProfile.photo || "";

        setUaiEditing(true);

    }
);


// =====================================================
// CANCELAR
// =====================================================

uaiCancelBtn.addEventListener(
    "click",
    function () {

        pendingUaiPhoto =
            savedUaiProfile.photo || "";


        updateUaiProfile(
            savedUaiProfile
        );


        setUaiEditing(false);


        showToast(
            "Cambios cancelados."
        );

    }
);


// =====================================================
// CAMBIAR FOTO
// =====================================================

uaiPhotoInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showToast(
                "Selecciona una imagen válida."
            );

            return;

        }


        if (
            file.size >
            8 * 1024 * 1024
        ) {

            showToast(
                "La imagen es demasiado pesada."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (readerEvent) {

                const image =
                    new Image();


                image.onload =
                    function () {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        const size = 500;


                        canvas.width =
                            size;

                        canvas.height =
                            size;


                        const context =
                            canvas.getContext(
                                "2d"
                            );


                        const cropSize =
                            Math.min(
                                image.width,
                                image.height
                            );


                        const x =
                            (
                                image.width -
                                cropSize
                            ) / 2;


                        const y =
                            (
                                image.height -
                                cropSize
                            ) / 2;


                        context.drawImage(

                            image,

                            x,
                            y,

                            cropSize,
                            cropSize,

                            0,
                            0,

                            size,
                            size

                        );


                        pendingUaiPhoto =
                            canvas.toDataURL(
                                "image/jpeg",
                                0.85
                            );


                        uaiProfileImage.src =
                            pendingUaiPhoto;

                        uaiProfileImage.hidden =
                            false;

                        uaiInitial.style.display =
                            "none";


                        showToast(
                            "Foto seleccionada. Guarda los cambios."
                        );

                    };


                image.src =
                    readerEvent.target.result;

            };


        reader.readAsDataURL(file);

    }
);


// =====================================================
// GUARDAR
// =====================================================

uaiProfileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            uaiName.value.trim();

        const role =
            uaiRole.value.trim();

        const institution =
            uaiInstitution
                .value
                .trim();

        const module =
            uaiModule
                .value
                .trim();


        if (
            !name ||
            !role ||
            !institution ||
            !module
        ) {

            showToast(
                "Completa todos los campos."
            );

            return;

        }


        savedUaiProfile = {

            name: name,

            role: role,

            institution:
                institution,

            module: module,

            photo:
                pendingUaiPhoto

        };


        try {

            localStorage.setItem(

                "sentirUaiProfile",

                JSON.stringify(
                    savedUaiProfile
                )

            );

        } catch (error) {

            showToast(
                "No se pudieron guardar los cambios."
            );

            return;

        }


        updateUaiProfile(
            savedUaiProfile
        );


        setUaiEditing(false);


        showToast(
            "Perfil actualizado correctamente."
        );

    }
);


// =====================================================
// CARGAR PERFIL
// =====================================================

loadUaiProfile();

});