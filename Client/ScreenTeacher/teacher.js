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



            /*
                AQUÍ DESPUÉS PUEDEN CONECTARLO
                CON EL BACKEND.

                El docente únicamente
                ENVÍA LA ALERTA.

                No realiza seguimiento
                ni intervención.
            */


            console.log(
                "Alerta enviada:",
                alertData
            );



            /* =============================================
               LIMPIAR FORMULARIO
            ============================================== */

            alertForm.reset();


            if (counter) {

                counter.textContent =
                    "0 / 500";

            }



            /* =============================================
               CERRAR
            ============================================== */

            closeAlertModal();



            /* =============================================
               MENSAJE BONITO
            ============================================== */

            showSuccessToast();

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
   FOTO DE PERFIL DEL DOCENTE
   SIN LÍMITE DE TAMAÑO EN FRONTEND
========================================================= */

const profilePhotoInput =
    document.getElementById("profilePhotoInput");

const profilePhoto =
    document.getElementById("profilePhoto");

const profilePlaceholder =
    document.getElementById("profilePlaceholder");


let currentProfilePhotoURL = null;


/* =========================================================
   SELECCIONAR FOTO
========================================================= */

if (profilePhotoInput) {

    profilePhotoInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            /* =================================================
               VALIDAR FORMATO
            ================================================= */

            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"

            ];


            if (!allowedTypes.includes(file.type)) {

                alert(
                    "Selecciona una imagen JPG, PNG o WEBP."
                );

                profilePhotoInput.value = "";

                return;
            }


            /* =================================================
               ELIMINAR URL ANTERIOR
            ================================================= */

            if (currentProfilePhotoURL) {

                URL.revokeObjectURL(
                    currentProfilePhotoURL
                );

            }


            /* =================================================
               CREAR VISTA PREVIA SIN BASE64
            ================================================= */

            currentProfilePhotoURL =
                URL.createObjectURL(file);


            profilePhoto.src =
                currentProfilePhotoURL;


            profilePhoto.classList.add(
                "has-photo"
            );


            profilePlaceholder.classList.add(
                "hidden"
            );


            /* =================================================
               AQUÍ QUEDA DISPONIBLE EL ARCHIVO ORIGINAL
               PARA ENVIARLO AL BACKEND
            ================================================= */

            console.log(
                "Foto seleccionada:",
                file
            );


            console.log(
                "Nombre:",
                file.name
            );


            console.log(
                "Tamaño:",
                file.size,
                "bytes"
            );


            console.log(
                "Tipo:",
                file.type
            );

        }
    );

}