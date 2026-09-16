document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DATOS TEMPORALES DEL DOCENTE
       Luego pueden venir desde la base de datos
    ===================================================== */

    const currentTeacher = {
        nombre: "María",
        apellido: "López",
        rol: "Docente"
    };


    /* =====================================================
       SIDEBAR
    ===================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const hamburger =
        document.getElementById("hamburger");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileOverlay =
        document.getElementById("mobileOverlay");


    function isMobile() {
        return window.innerWidth <= 850;
    }


    hamburger.addEventListener("click", () => {

        if (!isMobile()) {
            sidebar.classList.toggle("collapsed");
        }

    });


    function openMobileMenu() {

        sidebar.classList.add("mobile-open");

        mobileOverlay.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeMobileMenu() {

        sidebar.classList.remove("mobile-open");

        mobileOverlay.classList.remove("active");

        document.body.style.overflow = "";

    }


    mobileMenuButton.addEventListener(
        "click",
        openMobileMenu
    );


    mobileOverlay.addEventListener(
        "click",
        closeMobileMenu
    );


    /* Cerrar menú al tocar enlace en móvil */

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.addEventListener("click", () => {

            if (isMobile()) {
                closeMobileMenu();
            }

        });

    });


    /* =====================================================
       PERFIL
    ===================================================== */

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profilePhoto =
        document.getElementById("profilePhoto");

    const profilePhotoInput =
        document.getElementById("profilePhotoInput");

    const profileInitials =
        document.getElementById("profileInitials");

    const profileName =
        document.getElementById("profileName");


    function getInitials(
        firstName,
        lastName
    ) {

        const first =
            firstName
                ? firstName
                    .trim()
                    .charAt(0)
                : "";

        const second =
            lastName
                ? lastName
                    .trim()
                    .charAt(0)
                : "";


        return (
            first +
            second
        ).toUpperCase() || "?";

    }


    function loadTeacherData() {

        profileName.textContent =
            `${currentTeacher.nombre} ${currentTeacher.apellido}`;


        profileInitials.textContent =
            getInitials(
                currentTeacher.nombre,
                currentTeacher.apellido
            );

    }


    loadTeacherData();


    /* =====================================================
       CARGAR FOTO GUARDADA
    ===================================================== */

    function loadSavedProfilePhoto() {

        const savedPhoto =
            localStorage.getItem(
                "sentir_teacher_photo"
            );


        if (savedPhoto) {

            profilePhoto.src =
                savedPhoto;

            profileAvatar
                .classList
                .add("has-photo");

        }

        else {

            profilePhoto
                .removeAttribute("src");

            profileAvatar
                .classList
                .remove("has-photo");

        }

    }


    loadSavedProfilePhoto();


    /* =====================================================
       CAMBIAR FOTO
    ===================================================== */

    profileAvatar.addEventListener(
        "click",
        () => {

            profilePhotoInput.click();

        }
    );


    profilePhotoInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                showToast(
                    "Selecciona una imagen válida.",
                    "error"
                );

                return;
            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                showToast(
                    "La imagen debe pesar menos de 5 MB.",
                    "error"
                );

                profilePhotoInput.value =
                    "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const image =
                        event.target.result;


                    profilePhoto.src =
                        image;


                    profileAvatar
                        .classList
                        .add("has-photo");


                    try {

                        localStorage.setItem(
                            "sentir_teacher_photo",
                            image
                        );

                    }

                    catch (error) {

                        console.warn(
                            "No se pudo guardar la imagen",
                            error
                        );

                    }


                    showToast(
                        "Foto actualizada correctamente.",
                        "success"
                    );

                };


            reader.readAsDataURL(file);

        }
    );


    profilePhoto.addEventListener(
        "error",
        () => {

            profileAvatar
                .classList
                .remove("has-photo");

            profilePhoto
                .removeAttribute("src");

            localStorage.removeItem(
                "sentir_teacher_photo"
            );

        }
    );


    /* =====================================================
       REPORTES
    ===================================================== */

    const reportsTable =
        document.getElementById(
            "reportsTable"
        );

    const rows =
        Array.from(
            reportsTable
                .querySelectorAll("tr")
        );


    const searchReports =
        document.getElementById(
            "searchReports"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const typeFilter =
        document.getElementById(
            "typeFilter"
        );

    const groupFilter =
        document.getElementById(
            "groupFilter"
        );

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );

    const resultsText =
        document.getElementById(
            "resultsText"
        );


    /* =====================================================
       FILTRADO
    ===================================================== */

    function filterReports() {

        const search =
            searchReports
                .value
                .toLowerCase()
                .trim();


        const status =
            statusFilter.value;


        const type =
            typeFilter.value;


        const group =
            groupFilter.value;


        let visible =
            0;


        rows.forEach(row => {

            const rowText =
                row
                    .textContent
                    .toLowerCase();


            const rowStatus =
                row.dataset.status;


            const rowType =
                row.dataset.type;


            const rowGroup =
                row.dataset.group;


            const matchesSearch =
                rowText.includes(search);


            const matchesStatus =
                status === "all" ||
                rowStatus === status;


            const matchesType =
                type === "all" ||
                rowType === type;


            const matchesGroup =
                group === "all" ||
                rowGroup === group;


            const show =
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesGroup;


            row.style.display =
                show
                    ? ""
                    : "none";


            if (show) {
                visible++;
            }

        });


        resultsText.textContent =
            `Mostrando ${visible} de ${rows.length} reportes`;

    }


    searchReports.addEventListener(
        "input",
        filterReports
    );


    statusFilter.addEventListener(
        "change",
        filterReports
    );


    typeFilter.addEventListener(
        "change",
        filterReports
    );


    groupFilter.addEventListener(
        "change",
        filterReports
    );


    /* Fecha está lista para conectarse
       posteriormente a datos reales */

    dateFilter.addEventListener(
        "change",
        () => {

            showToast(
                "Filtro de fecha seleccionado.",
                "info"
            );

        }
    );


    /* =====================================================
       BOTONES DE DETALLE
    ===================================================== */

    const actionButtons =
        document.querySelectorAll(
            ".action-button"
        );


    actionButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const row =
                    button.closest("tr");


                const student =
                    row
                        .querySelector(
                            ".student-cell"
                        )
                        .textContent
                        .trim();


                showToast(
                    `Abriendo reporte de ${student}`,
                    "info"
                );

            }
        );

    });


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        type = "info"
    ) {

        const previous =
            document.querySelector(
                ".custom-toast"
            );


        if (previous) {
            previous.remove();
        }


        const toast =
            document.createElement("div");


        toast.className =
            `custom-toast ${type}`;


        let icon =
            "bi-info-circle";


        if (
            type === "success"
        ) {
            icon =
                "bi-check-circle";
        }


        if (
            type === "error"
        ) {
            icon =
                "bi-x-circle";
        }


        toast.innerHTML = `

            <i class="bi ${icon}"></i>

            <span>
                ${message}
            </span>

        `;


        document.body.appendChild(
            toast
        );


        requestAnimationFrame(
            () => {

                toast.classList.add(
                    "show"
                );

            }
        );


        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );


                setTimeout(
                    () => {
                        toast.remove();
                    },
                    300
                );

            },
            2800
        );

    }


    /* Crear estilos del toast */

    const toastStyles =
        document.createElement("style");


    toastStyles.textContent = `

        .custom-toast {

            position: fixed;

            right: 24px;
            bottom: 24px;

            z-index: 3000;

            min-width: 280px;
            max-width: 390px;

            padding: 14px 17px;

            display: flex;
            align-items: center;

            gap: 10px;

            border: 1px solid #e1e2ef;
            border-radius: 14px;

            color: #252963;
            background: white;

            box-shadow:
                0 15px 40px
                rgba(37,34,93,.15);

            opacity: 0;

            transform:
                translateY(16px);

            transition:
                opacity .3s ease,
                transform .3s ease;

            font-family:
                "Nunito",
                sans-serif;

            font-weight: 700;

        }


        .custom-toast.show {

            opacity: 1;

            transform:
                translateY(0);

        }


        .custom-toast i {

            color: #7045ef;

            font-size: 20px;

        }


        .custom-toast.success i {

            color: #27ae78;

        }


        .custom-toast.error i {

            color: #e9506e;

        }


        @media(max-width: 480px) {

            .custom-toast {

                left: 12px;
                right: 12px;
                bottom: 14px;

                min-width: 0;
                max-width: none;

            }

        }

    `;


    document.head.appendChild(
        toastStyles
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!isMobile()) {

                sidebar
                    .classList
                    .remove("mobile-open");

                mobileOverlay
                    .classList
                    .remove("active");

                document.body.style.overflow =
                    "";

            }

        }
    );

});