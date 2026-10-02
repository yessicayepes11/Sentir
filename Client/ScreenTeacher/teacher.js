/* =========================================================
   SENTIR - DOCENTE
========================================================= */


/* =========================================================
   SIDEBAR RESPONSIVE

   IMPORTANTE:
   La barra NO navega entre páginas.

   Inicio
   Mis estudiantes
   Orientación
   Mi perfil

   son únicamente elementos visuales.
========================================================= */


const sidebar =
    document.getElementById("sidebar");


const hamburger =
    document.getElementById("hamburger");


const mobileOverlay =
    document.getElementById("mobileOverlay");



/* =========================================================
   ABRIR SIDEBAR
========================================================= */

if (hamburger) {

    hamburger.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

            mobileOverlay.classList.toggle("show");

        }
    );

}



/* =========================================================
   CERRAR SIDEBAR DESDE OVERLAY
========================================================= */

if (mobileOverlay) {

    mobileOverlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove("open");

            mobileOverlay.classList.remove("show");

        }
    );

}



/* =========================================================
   MODAL DE ALERTA
========================================================= */


const alertModal =
    document.getElementById("alertModal");


const openAlert =
    document.getElementById("openAlert");


const closeAlert =
    document.getElementById("closeAlert");


const cancelAlert =
    document.getElementById("cancelAlert");



/* =========================================================
   ABRIR MODAL
========================================================= */

function openAlertModal() {

    alertModal.classList.add("show");

    document.body.style.overflow =
        "hidden";

}



if (openAlert) {

    openAlert.addEventListener(
        "click",
        openAlertModal
    );

}



/* =========================================================
   CERRAR MODAL
========================================================= */

function closeAlertModal() {

    alertModal.classList.remove("show");

    document.body.style.overflow =
        "";

}



if (closeAlert) {

    closeAlert.addEventListener(
        "click",
        closeAlertModal
    );

}



if (cancelAlert) {

    cancelAlert.addEventListener(
        "click",
        closeAlertModal
    );

}



/* =========================================================
   CERRAR HACIENDO CLIC AFUERA
========================================================= */

if (alertModal) {

    alertModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                alertModal
            ) {

                closeAlertModal();

            }

        }
    );

}



/* =========================================================
   CERRAR CON ESC
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            alertModal.classList.contains("show")
        ) {

            closeAlertModal();

        }

    }
);



/* =========================================================
   CONTADOR DE CARACTERES
========================================================= */


const description =
    document.getElementById("description");


const counter =
    document.getElementById("counter");



if (
    description &&
    counter
) {

    description.addEventListener(
        "input",
        function () {

            const amount =
                description.value.length;


            counter.textContent =
                `${amount} / 500`;

        }
    );

}



/* =========================================================
   FORMULARIO
========================================================= */


const alertForm =
    document.getElementById("alertForm");


const successToast =
    document.getElementById("successToast");



if (alertForm) {

    alertForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();



            /* =============================================
               DATOS DEL FORMULARIO
            ============================================== */

            const alertData = {

                student:
                    document
                    .getElementById("student")
                    .value,

                group:
                    document
                    .getElementById("group")
                    .value,

                type:
                    document
                    .getElementById("type")
                    .value,

                description:
                    document
                    .getElementById("description")
                    .value

            };



            /* =============================================
               ENVIAR AL SERVIDOR
               Se guarda en "ayuda" y psicología recibe una
               notificación (ver TeacherAlerts.js).
            ============================================== */

            const submitButton =
                alertForm.querySelector("[type=submit]");

            if (submitButton) submitButton.disabled = true;

            window.SentirAlertas.enviar(alertData)
                .then(function () {

                    /* LIMPIAR FORMULARIO */

                    alertForm.reset();

                    window.SentirAlertas.reiniciarFormulario();

                    if (counter) {

                        counter.textContent =
                            "0 / 500";

                    }


                    /* CERRAR */

                    closeAlertModal();


                    /* MENSAJE BONITO */

                    showSuccessToast();

                })
                .catch(function (error) {

                    alert(error.message);

                })
                .finally(function () {

                    if (submitButton) submitButton.disabled = false;

                });

        }
    );

}



/* =========================================================
   TOAST
========================================================= */

function showSuccessToast() {


    if (!successToast) {

        return;

    }


    successToast.classList.add("show");


    setTimeout(
        function () {

            successToast.classList.remove(
                "show"
            );

        },
        3500
    );

}



/* =========================================================
   SI PASAMOS DE MÓVIL A PC
========================================================= */

window.addEventListener(
    "resize",
    function () {

        if (
            window.innerWidth > 850
        ) {

            sidebar.classList.remove(
                "open"
            );


            mobileOverlay.classList.remove(
                "show"
            );

        }

    }
);

/* =========================================================
   PERFIL DEL DOCENTE
   La foto, el nombre, el saludo y la ventana de perfil los
   maneja TeacherProfile.js (incluido en el <head>).
========================================================= */
