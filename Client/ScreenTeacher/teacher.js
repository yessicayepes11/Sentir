document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           USUARIO ACTUAL
           Más adelante estos datos pueden venir de la BD
        ===================================================== */

        const currentTeacher = {

            nombre: "María",

            apellido: "López",

            rol: "Docente"

        };


        /* =====================================================
           ELEMENTOS GENERALES
        ===================================================== */

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const hamburger =
            document.getElementById(
                "hamburger"
            );


        const mobileMenuButton =
            document.getElementById(
                "mobileMenuButton"
            );


        const mobileOverlay =
            document.getElementById(
                "mobileOverlay"
            );


        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        function isMobile() {

            return (
                window.innerWidth <= 850
            );

        }


        /* =====================================================
           MENÚ ESCRITORIO
        ===================================================== */

        hamburger.addEventListener(
            "click",
            () => {

                if (!isMobile()) {

                    sidebar.classList.toggle(
                        "collapsed"
                    );

                }

            }
        );


        /* =====================================================
           MENÚ MÓVIL
        ===================================================== */

        function openMobileMenu() {

            sidebar.classList.add(
                "mobile-open"
            );


            mobileOverlay.classList.add(
                "active"
            );


            document.body.style.overflow =
                "hidden";

        }


        function closeMobileMenu() {

            sidebar.classList.remove(
                "mobile-open"
            );


            mobileOverlay.classList.remove(
                "active"
            );


            document.body.style.overflow =
                "";

        }


        mobileMenuButton.addEventListener(
            "click",
            openMobileMenu
        );


        mobileOverlay.addEventListener(
            "click",
            closeMobileMenu
        );


        /* =====================================================
           ITEMS NAVEGACIÓN
        ===================================================== */

        navItems.forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {


                        navItems.forEach(
                            link => {

                                link.classList.remove(
                                    "active"
                                );

                            }
                        );


                        item.classList.add(
                            "active"
                        );


                        if (isMobile()) {

                            closeMobileMenu();

                        }


                    }
                );

            }
        );


        /* =====================================================
           PERFIL
        ===================================================== */

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        const profilePhoto =
            document.getElementById(
                "profilePhoto"
            );


        const profilePhotoInput =
            document.getElementById(
                "profilePhotoInput"
            );


        const profileInitials =
            document.getElementById(
                "profileInitials"
            );


        const profileName =
            document.getElementById(
                "profileName"
            );


        const heroTeacherName =
            document.getElementById(
                "heroTeacherName"
            );


        const chatTeacherName =
            document.getElementById(
                "chatTeacherName"
            );


        /* =====================================================
           INICIALES
        ===================================================== */

        function getInitials(
            firstName,
            firstLastName
        ) {


            const name =
                (
                    firstName || ""
                ).trim();


            const lastName =
                (
                    firstLastName || ""
                ).trim();


            if (
                !name &&
                !lastName
            ) {

                return "?";

            }


            const first =
                name
                    ? name.charAt(0)
                    : "";


            const second =
                lastName
                    ? lastName.charAt(0)
                    : "";


            return (
                first +
                second
            ).toUpperCase();

        }


        /* =====================================================
           CARGAR DATOS
        ===================================================== */

        function loadTeacherData() {


            const fullName =
                `${currentTeacher.nombre} ${currentTeacher.apellido}`
                    .trim();


            profileName.textContent =
                fullName;


            profileInitials.textContent =
                getInitials(
                    currentTeacher.nombre,
                    currentTeacher.apellido
                );


            heroTeacherName.textContent =
                currentTeacher.nombre;


            chatTeacherName.textContent =
                currentTeacher.nombre;


        }


        loadTeacherData();


        /* =====================================================
           FOTO GUARDADA
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
                    .add(
                        "has-photo"
                    );


            } else {


                profileAvatar
                    .classList
                    .remove(
                        "has-photo"
                    );


                profilePhoto
                    .removeAttribute(
                        "src"
                    );


            }

        }


        loadSavedProfilePhoto();


        /* =====================================================
           ABRIR SELECTOR DE FOTO
        ===================================================== */

        profileAvatar.addEventListener(
            "click",
            () => {

                profilePhotoInput.click();

            }
        );


        /* =====================================================
           SELECCIONAR FOTO
        ===================================================== */

        profilePhotoInput.addEventListener(
            "change",
            event => {


                const file =
                    event
                        .target
                        .files[0];


                if (!file) {

                    return;

                }


                /* Validación */

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {


                    showNotification(
                        "Selecciona una imagen válida.",
                        "error"
                    );


                    return;

                }


                /*
                    Limitamos a 5 MB
                */

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {


                    showNotification(
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


                        const imageData =
                            event
                                .target
                                .result;


                        profilePhoto.src =
                            imageData;


                        profileAvatar
                            .classList
                            .add(
                                "has-photo"
                            );


                        /*
                            Se guarda temporalmente
                            en el navegador.
                        */

                        try {


                            localStorage.setItem(
                                "sentir_teacher_photo",
                                imageData
                            );


                        } catch (error) {


                            console.warn(
                                "No fue posible guardar la imagen.",
                                error
                            );


                        }


                        showNotification(
                            "Foto de perfil actualizada.",
                            "success"
                        );


                    };


                reader.readAsDataURL(
                    file
                );


            }
        );


        /* =====================================================
           SI FALLA LA FOTO
        ===================================================== */

        profilePhoto.addEventListener(
            "error",
            () => {


                profileAvatar
                    .classList
                    .remove(
                        "has-photo"
                    );


                profilePhoto
                    .removeAttribute(
                        "src"
                    );


                localStorage.removeItem(
                    "sentir_teacher_photo"
                );


            }
        );


        /* =====================================================
           MODAL REPORTE
        ===================================================== */

        const reportModal =
            document.getElementById(
                "reportModal"
            );


        const openReportButton =
            document.getElementById(
                "openReportButton"
            );


        const menuReport =
            document.getElementById(
                "menuReport"
            );


        const closeModal =
            document.getElementById(
                "closeModal"
            );


        const cancelModal =
            document.getElementById(
                "cancelModal"
            );


        const reportForm =
            document.getElementById(
                "reportForm"
            );


        function openModal() {


            reportModal.classList.add(
                "visible"
            );


            document.body.style.overflow =
                "hidden";


        }


        function hideModal() {


            reportModal.classList.remove(
                "visible"
            );


            document.body.style.overflow =
                "";


        }


        openReportButton.addEventListener(
            "click",
            openModal
        );


        menuReport.addEventListener(
            "click",
            event => {


                event.preventDefault();


                if (isMobile()) {

                    closeMobileMenu();

                }


                openModal();


            }
        );


        closeModal.addEventListener(
            "click",
            hideModal
        );


        cancelModal.addEventListener(
            "click",
            hideModal
        );


        reportModal.addEventListener(
            "click",
            event => {


                if (
                    event.target ===
                    reportModal
                ) {

                    hideModal();

                }


            }
        );


        /* =====================================================
           FORMULARIO
        ===================================================== */

        reportForm.addEventListener(
            "submit",
            event => {


                event.preventDefault();


                showNotification(
                    "Reporte enviado correctamente.",
                    "success"
                );


                reportForm.reset();


                hideModal();


            }
        );


        /* =====================================================
           BUSCADOR
        ===================================================== */

        const globalSearch =
            document.getElementById(
                "globalSearch"
            );


        const reportsTable =
            document.getElementById(
                "reportsTable"
            );


        globalSearch.addEventListener(
            "input",
            () => {


                const search =
                    globalSearch
                        .value
                        .toLowerCase()
                        .trim();


                const rows =
                    reportsTable
                        .querySelectorAll(
                            "tr"
                        );


                rows.forEach(
                    row => {


                        const text =
                            row
                                .textContent
                                .toLowerCase();


                        row.style.display =
                            text.includes(
                                search
                            )
                                ? ""
                                : "none";


                    }
                );


            }
        );


        /* =====================================================
           CHAT
        ===================================================== */

        const chatMessages =
            document.getElementById(
                "chatMessages"
            );


        const chatInput =
            document.getElementById(
                "chatInput"
            );


        const chatSendButton =
            document.getElementById(
                "chatSendButton"
            );


        /* =====================================================
           REDIMENSIONAR TEXTAREA
        ===================================================== */

        function resizeChatInput() {


            chatInput.style.height =
                "auto";


            chatInput.style.height =
                Math.min(
                    chatInput.scrollHeight,
                    100
                ) + "px";


        }


        chatInput.addEventListener(
            "input",
            resizeChatInput
        );


        /* =====================================================
           HORA
        ===================================================== */

        function getCurrentTime() {


            const date =
                new Date();


            return date.toLocaleTimeString(
                "es-CO",
                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }
            );


        }


        /* =====================================================
           CREAR MENSAJE DOCENTE
        ===================================================== */

        function createUserMessage(
            text
        ) {


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "message-row user";


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "message-content";


            const bubble =
                document.createElement(
                    "div"
                );


            bubble.className =
                "message-bubble user-message";


            const paragraph =
                document.createElement(
                    "p"
                );


            /*
                textContent evita
                inyección de HTML.
            */

            paragraph.textContent =
                text;


            const time =
                document.createElement(
                    "span"
                );


            time.className =
                "message-time";


            time.textContent =
                getCurrentTime();


            bubble.appendChild(
                paragraph
            );


            content.appendChild(
                bubble
            );


            content.appendChild(
                time
            );


            row.appendChild(
                content
            );


            chatMessages.appendChild(
                row
            );


            chatMessages.scrollTop =
                chatMessages.scrollHeight;


        }


        /* =====================================================
           ENVIAR MENSAJE
        ===================================================== */

        function sendChatMessage() {


            const text =
                chatInput
                    .value
                    .trim();


            if (!text) {

                return;

            }


            createUserMessage(
                text
            );


            chatInput.value =
                "";


            resizeChatInput();


            /*
                =============================
                CONEXIÓN FUTURA CON IA
                =============================

                Aquí irá posteriormente
                el fetch al backend / API
                de Inteligencia Artificial.

                Ejemplo:

                fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        mensaje: text
                    })
                });

                Actualmente NO generamos
                respuestas automáticas.
            */


        }


        chatSendButton.addEventListener(
            "click",
            sendChatMessage
        );


        /* ENTER PARA ENVIAR */

        chatInput.addEventListener(
            "keydown",
            event => {


                if (
                    event.key ===
                    "Enter" &&
                    !event.shiftKey
                ) {


                    event.preventDefault();


                    sendChatMessage();


                }


            }
        );


        /* =====================================================
           BOTONES ACTIVIDAD
        ===================================================== */

        const arrowButtons =
            document.querySelectorAll(
                ".arrow-button"
            );


        arrowButtons.forEach(
            button => {


                button.addEventListener(
                    "click",
                    () => {


                        const row =
                            button.closest(
                                "tr"
                            );


                        const student =
                            row
                                .querySelector(
                                    ".student-cell"
                                )
                                .textContent
                                .trim();


                        showNotification(
                            `Consultando reporte de ${student}`,
                            "info"
                        );


                    }
                );


            }
        );


        /* =====================================================
           TOAST
        ===================================================== */

        function showNotification(
            message,
            type = "info"
        ) {


            const oldToast =
                document.querySelector(
                    ".custom-toast"
                );


            if (oldToast) {

                oldToast.remove();

            }


            const toast =
                document.createElement(
                    "div"
                );


            toast.className =
                `custom-toast ${type}`;


            let icon =
                "bi-info-circle";


            if (
                type ===
                "success"
            ) {

                icon =
                    "bi-check-circle";

            }


            if (
                type ===
                "error"
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
                3000
            );


        }


        /* =====================================================
           ESC
        ===================================================== */

        document.addEventListener(
            "keydown",
            event => {


                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                if (
                    reportModal
                        .classList
                        .contains(
                            "visible"
                        )
                ) {

                    hideModal();

                }


                if (
                    sidebar
                        .classList
                        .contains(
                            "mobile-open"
                        )
                ) {

                    closeMobileMenu();

                }


            }
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
                        .remove(
                            "mobile-open"
                        );


                    mobileOverlay
                        .classList
                        .remove(
                            "active"
                        );


                    document.body.style.overflow =
                        "";


                }


            }
        );


    }
);