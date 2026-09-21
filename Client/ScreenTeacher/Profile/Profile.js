/* =========================================================
   SENTIR
   MI PERFIL - DOCENTE
========================================================= */


/* =========================================================
   SIDEBAR RESPONSIVE
========================================================= */

const sidebar =
    document.getElementById(
        "sidebar"
    );


const hamburger =
    document.getElementById(
        "hamburger"
    );


const mobileOverlay =
    document.getElementById(
        "mobileOverlay"
    );


if (hamburger) {

    hamburger.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );


            mobileOverlay.classList.toggle(
                "show"
            );

        }
    );

}


if (mobileOverlay) {

    mobileOverlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "open"
            );


            mobileOverlay.classList.remove(
                "show"
            );

        }
    );

}



/* =========================================================
   FOTO DEL DOCENTE

   ÚNICA INFORMACIÓN QUE EL DOCENTE
   PUEDE CAMBIAR DIRECTAMENTE.
========================================================= */

const profilePhotoInput =
    document.getElementById(
        "profilePhotoInput"
    );


const largeProfilePhoto =
    document.getElementById(
        "largeProfilePhoto"
    );


const largeProfilePlaceholder =
    document.getElementById(
        "largeProfilePlaceholder"
    );


const headerProfilePhoto =
    document.getElementById(
        "headerProfilePhoto"
    );


const headerPlaceholder =
    document.getElementById(
        "headerPlaceholder"
    );


let currentProfilePhotoURL =
    null;



/* =========================================================
   CAMBIAR FOTO
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


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Selecciona una imagen JPG, PNG o WEBP."
                );


                profilePhotoInput.value =
                    "";


                return;

            }



            /*
                NO HAY LÍMITE DE 2 MB.

                Tampoco convertimos el archivo
                a Base64.

                Esto permite trabajar mejor
                con archivos grandes.
            */



            /* =================================================
               BORRAR URL ANTERIOR
            ================================================= */

            if (
                currentProfilePhotoURL
            ) {

                URL.revokeObjectURL(
                    currentProfilePhotoURL
                );

            }



            /* =================================================
               CREAR VISTA PREVIA
            ================================================= */

            currentProfilePhotoURL =
                URL.createObjectURL(
                    file
                );



            /* FOTO GRANDE */

            largeProfilePhoto.src =
                currentProfilePhotoURL;


            largeProfilePhoto.classList.add(
                "has-photo"
            );


            largeProfilePlaceholder.classList.add(
                "hidden"
            );



            /* FOTO HEADER */

            headerProfilePhoto.src =
                currentProfilePhotoURL;


            headerProfilePhoto.classList.add(
                "has-photo"
            );


            headerPlaceholder.classList.add(
                "hidden"
            );



            /* =================================================
               ARCHIVO DISPONIBLE PARA BACKEND
            ================================================= */

            console.log(
                "Nueva foto de perfil:",
                file
            );


            console.log(
                "Nombre:",
                file.name
            );


            console.log(
                "Tamaño:",
                file.size
            );


            /*
                Cuando conecten backend,
                aquí pueden enviar `file`
                mediante FormData.

                Ejemplo:

                const formData =
                    new FormData();

                formData.append(
                    "photo",
                    file
                );

            */

        }
    );

}



/* =========================================================
   SOLICITAR ACTUALIZACIÓN
========================================================= */

const requestUpdateButton =
    document.getElementById(
        "requestUpdateButton"
    );


const requestModal =
    document.getElementById(
        "requestModal"
    );


const closeRequestModal =
    document.getElementById(
        "closeRequestModal"
    );


const cancelRequest =
    document.getElementById(
        "cancelRequest"
    );



function openRequestModal() {

    requestModal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}



function closeRequest() {

    requestModal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}



if (requestUpdateButton) {

    requestUpdateButton.addEventListener(
        "click",
        openRequestModal
    );

}


if (closeRequestModal) {

    closeRequestModal.addEventListener(
        "click",
        closeRequest
    );

}


if (cancelRequest) {

    cancelRequest.addEventListener(
        "click",
        closeRequest
    );

}



/* =========================================================
   CERRAR HACIENDO CLIC AFUERA
========================================================= */

if (requestModal) {

    requestModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                requestModal
            ) {

                closeRequest();

            }

        }
    );

}



/* =========================================================
   CONTADOR DE CARACTERES
========================================================= */

const requestDescription =
    document.getElementById(
        "requestDescription"
    );


const requestCounter =
    document.getElementById(
        "requestCounter"
    );


if (
    requestDescription &&
    requestCounter
) {

    requestDescription.addEventListener(
        "input",
        function () {

            requestCounter.textContent =
                `${requestDescription.value.length} / 500`;

        }
    );

}



/* =========================================================
   ENVIAR SOLICITUD
========================================================= */

const requestForm =
    document.getElementById(
        "requestForm"
    );


const toast =
    document.getElementById(
        "toast"
    );


if (requestForm) {

    requestForm.addEventListener(
        "submit",
        function (event) {


            event.preventDefault();



            const requestData = {

                field:
                    document
                    .getElementById(
                        "dataType"
                    )
                    .value,

                description:
                    requestDescription.value

            };



            /*
                IMPORTANTE:

                Esto NO cambia los datos
                del docente.

                Solo genera una solicitud
                para administración.
            */

            console.log(
                "Solicitud de actualización:",
                requestData
            );



            requestForm.reset();


            requestCounter.textContent =
                "0 / 500";


            closeRequest();


            showToast();

        }
    );

}



/* =========================================================
   TOAST
========================================================= */

function showToast() {


    if (!toast) {

        return;

    }


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3500
    );

}



/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeRequest();

        }

    }
);



/* =========================================================
   RESPONSIVE
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