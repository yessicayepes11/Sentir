document.addEventListener("DOMContentLoaded", function () {

    initSidebar();

    initActiveNavigation();

    initProfileMenu();

    initProfilePhoto();

    initEmotions();

    initHelpModal();

    initAppointmentModal();

    initSearch();

});


/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {

    const menuButton =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (
        !menuButton ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    function openMenu() {

        sidebar.classList.add("open");

        overlay.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeMenu() {

        sidebar.classList.remove("open");

        overlay.classList.remove("active");

        document.body.style.overflow = "";

    }


    menuButton.addEventListener(
        "click",
        function () {

            if (
                sidebar.classList.contains("open")
            ) {

                closeMenu();

            }

            else {

                openMenu();

            }

        }
    );


    overlay.addEventListener(
        "click",
        closeMenu
    );


    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <= 900
                    ) {

                        closeMenu();

                    }

                }
            );

        });


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 900
            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   OPCIÓN ACTIVA SIDEBAR
========================================================= */

function initActiveNavigation() {

    const links =
        document.querySelectorAll(".menu-item");


    const currentPath =
        window.location.pathname
            .toLowerCase();


    links.forEach(function (link) {

        link.classList.remove("active");


        const href =
            link.getAttribute("href");


        if (!href) {

            return;

        }


        const linkPath =
            new URL(
                href,
                window.location.origin
            )
                .pathname
                .toLowerCase();


        if (
            currentPath === linkPath
        ) {

            link.classList.add("active");

        }


        if (
            link.dataset.page === "inicio" &&
            currentPath.endsWith(
                "/screenstudents/students.html"
            )
        ) {

            link.classList.add("active");

        }

    });

}


/* =========================================================
   HEADER PERFIL
========================================================= */

function initProfileMenu() {

    const button =
        document.getElementById(
            "profileButton"
        );


    const menu =
        document.getElementById(
            "profileMenu"
        );


    if (
        !button ||
        !menu
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            menu.classList.toggle("show");

        }
    );


    document.addEventListener(
        "click",
        function () {

            menu.classList.remove("show");

        }
    );


    menu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


/* =========================================================
   FOTO DE PERFIL
========================================================= */

const PROFILE_PHOTO_KEY =
    "sentirStudentProfilePhoto";


const STUDENT_NAME_KEY =
    "sentirStudentName";


function initProfilePhoto() {

    loadProfilePhoto();

    loadStudentName();


    /*
    Esto permite usar este mismo sistema
    en StudentProfile.
    */

    const inputs =
        document.querySelectorAll(

            "#profilePhotoInput," +

            "#studentPhotoInput," +

            "#photoInput," +

            "input[data-profile-photo]"

        );


    inputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function (event) {

                    const file =
                        event.target.files[0];


                    if (file) {

                        saveProfilePhoto(file);

                    }

                }
            );

        }
    );


    /*
    Actualiza Inicio si la foto
    cambia desde otra pestaña.
    */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                PROFILE_PHOTO_KEY
            ) {

                loadProfilePhoto();

            }


            if (
                event.key ===
                STUDENT_NAME_KEY
            ) {

                loadStudentName();

            }

        }
    );


    window.SentirProfile = {

        setPhoto:
            saveProfilePhoto,

        setName:
            saveStudentName,

        refresh:
            function () {

                loadProfilePhoto();

                loadStudentName();

            }

    };

}


function saveProfilePhoto(file) {

    if (!file) {

        return;

    }


    if (
        !file.type.startsWith("image/")
    ) {

        showToast(
            "Selecciona una imagen válida."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                localStorage.setItem(

                    PROFILE_PHOTO_KEY,

                    reader.result

                );


                loadProfilePhoto();


                showToast(
                    "Foto de perfil actualizada."
                );

            }

            catch (error) {

                console.error(error);


                showToast(
                    "La fotografía es demasiado pesada para guardarse localmente."
                );

            }

        };


    reader.readAsDataURL(file);

}


function loadProfilePhoto() {

    const photo =
        localStorage.getItem(
            PROFILE_PHOTO_KEY
        );


    document
        .querySelectorAll(
            "[data-profile-avatar]"
        )
        .forEach(
            function (avatar) {

                const image =
                    avatar.querySelector(
                        ".profile-avatar-image"
                    );


                const fallback =
                    avatar.querySelector(
                        ".profile-avatar-fallback"
                    );


                if (
                    !image ||
                    !fallback
                ) {

                    return;

                }


                if (photo) {

                    image.src =
                        photo;

                    image.hidden =
                        false;

                    fallback.hidden =
                        true;

                }

                else {

                    image.hidden =
                        true;

                    fallback.hidden =
                        false;

                }

            }
        );

}


function saveStudentName(name) {

    if (!name) {

        return;

    }


    localStorage.setItem(

        STUDENT_NAME_KEY,

        name

    );


    loadStudentName();

}


function loadStudentName() {

    const name =
        localStorage.getItem(
            STUDENT_NAME_KEY
        ) || "Ana";


    document
        .querySelectorAll(
            "[data-student-name]"
        )
        .forEach(
            function (element) {

                element.textContent =
                    name;

            }
        );


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase();


    document
        .querySelectorAll(
            ".profile-avatar-fallback"
        )
        .forEach(
            function (element) {

                element.textContent =
                    firstLetter;

            }
        );

}


/* =========================================================
   EMOCIONES
========================================================= */

function initEmotions() {

    const emotions =
        document.querySelectorAll(
            ".emotion"
        );


    const question =
        document.getElementById(
            "emotionQuestion"
        );


    const selected =
        document.getElementById(
            "selectedEmotion"
        );


    const close =
        document.getElementById(
            "closeQuestion"
        );


    emotions.forEach(
        function (emotion) {

            emotion.addEventListener(
                "click",
                function () {

                    emotions.forEach(
                        function (item) {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    emotion.classList.add(
                        "selected"
                    );


                    const radio =
                        emotion.querySelector(
                            'input[type="radio"]'
                        );


                    /*
                    Reinicia la animación
                    si vuelves a pulsar
                    el mismo emoji.
                    */

                    if (radio) {

                        if (radio.checked) {

                            radio.checked =
                                false;

                            void radio.offsetWidth;

                        }


                        radio.checked =
                            true;

                    }


                    const value =
                        emotion.dataset.emotion;


                    localStorage.setItem(

                        "sentirLastEmotion",

                        value

                    );


                    if (selected) {

                        selected.textContent =
                            "Hoy te sientes: " +
                            value;

                    }


                    if (question) {

                        question.classList.add(
                            "show"
                        );

                    }

                }
            );

        }
    );


    if (
        close &&
        question
    ) {

        close.addEventListener(
            "click",
            function () {

                question.classList.remove(
                    "show"
                );

            }
        );

    }

}


/* =========================================================
   PEDIR AYUDA
========================================================= */

function initHelpModal() {

    const modal =
        document.getElementById(
            "alertModal"
        );


    const heroButton =
        document.getElementById(
            "heroHelpButton"
        );


    const cardButton =
        document.getElementById(
            "toolHelpButton"
        );


    const close =
        document.getElementById(
            "closeAlert"
        );


    const cancel =
        document.getElementById(
            "cancelAlert"
        );


    if (!modal) {

        return;

    }


    if (heroButton) {

        heroButton.addEventListener(
            "click",
            function () {

                openModal(modal);

            }
        );

    }


    if (cardButton) {

        cardButton.addEventListener(
            "click",
            function () {

                openModal(modal);

            }
        );

    }


    if (close) {

        close.addEventListener(
            "click",
            function () {

                closeModal(modal);

            }
        );

    }


    if (cancel) {

        cancel.addEventListener(
            "click",
            function () {

                closeModal(modal);

            }
        );

    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal(modal);

            }

        }
    );

}


/* =========================================================
   AGENDAR CITA
========================================================= */

function initAppointmentModal() {

    const modal =
        document.getElementById(
            "appointmentModal"
        );


    const open =
        document.getElementById(
            "openAppointment"
        );


    const close =
        document.getElementById(
            "closeAppointment"
        );


    const finish =
        document.getElementById(
            "finishAppointment"
        );


    const form =
        document.getElementById(
            "appointmentForm"
        );


    const success =
        document.getElementById(
            "appointmentSuccess"
        );


    const summary =
        document.getElementById(
            "appointmentSummary"
        );


    const dateInput =
        document.getElementById(
            "appointmentDate"
        );


    const image =
        document.getElementById(
            "appointmentImage"
        );


    if (
        !modal ||
        !open ||
        !form
    ) {

        return;

    }


    /*
    Si todavía no existe
    AgendarCita.png,
    ocultamos la imagen rota
    y queda el placeholder.
    */

    if (image) {

        image.addEventListener(
            "error",
            function () {

                image.style.display =
                    "none";

            }
        );

    }


    /*
    Fecha mínima = hoy
    */

    if (dateInput) {

        const today =
            new Date();


        const localToday =
            new Date(

                today.getTime() -

                today.getTimezoneOffset()
                * 60000

            )
                .toISOString()
                .split("T")[0];


        dateInput.min =
            localToday;

    }


    open.addEventListener(
        "click",
        function () {

            form.hidden =
                false;


            if (success) {

                success.hidden =
                    true;

            }


            openModal(modal);

        }
    );


    if (close) {

        close.addEventListener(
            "click",
            function () {

                closeModal(modal);

            }
        );

    }


    if (finish) {

        finish.addEventListener(
            "click",
            function () {

                closeModal(modal);

            }
        );

    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal(modal);

            }

        }
    );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const date =
                document.getElementById(
                    "appointmentDate"
                ).value;


            const time =
                document.getElementById(
                    "appointmentTime"
                ).value;


            const reason =
                document.getElementById(
                    "appointmentReason"
                ).value.trim();


            if (
                !date ||
                !time ||
                !reason
            ) {

                showToast(
                    "Completa todos los campos."
                );

                return;

            }


            const appointment = {

                date:
                    date,

                time:
                    time,

                reason:
                    reason,

                status:
                    "pending",

                createdAt:
                    new Date().toISOString()

            };


            localStorage.setItem(

                "sentirAppointmentDraft",

                JSON.stringify(
                    appointment
                )

            );


            if (summary) {

                summary.textContent =

                    "Tu solicitud quedó registrada para el " +

                    formatDate(date) +

                    " a las " +

                    time +

                    ".";

            }


            form.hidden =
                true;


            if (success) {

                success.hidden =
                    false;

            }


            showToast(
                "Solicitud de cita guardada."
            );


            form.reset();

        }
    );

}


/* =========================================================
   BUSCADOR
========================================================= */

function initSearch() {

    const search =
        document.getElementById(
            "resourceSearch"
        );


    if (!search) {

        return;

    }


    const cards =
        document.querySelectorAll(
            ".tool-card"
        );


    search.addEventListener(
        "input",
        function () {

            const text =
                normalizeText(
                    search.value
                );


            cards.forEach(
                function (card) {

                    const cardText =
                        normalizeText(
                            card.textContent
                        );


                    if (
                        text === "" ||
                        cardText.includes(text)
                    ) {

                        card.style.display =
                            "";

                    }

                    else {

                        card.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


/* =========================================================
   MODALES
========================================================= */

function openModal(modal) {

    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    modal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* ESC PARA CERRAR */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(
                    function (modal) {

                        closeModal(modal);

                    }
                );

        }

    }
);


/* =========================================================
   UTILIDADES
========================================================= */

function normalizeText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}


function formatDate(dateString) {

    const parts =
        dateString
            .split("-")
            .map(Number);


    const date =
        new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );


    return new Intl.DateTimeFormat(

        "es-CO",

        {

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }

    ).format(date);

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },

            2800
        );

}