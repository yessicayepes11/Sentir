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

const profilePhotoInput = document.getElementById("profilePhotoInput");
const profilePhoto = document.getElementById("profilePhoto");
const profilePlaceholder = document.getElementById("profilePlaceholder");
const teacherProfileModal = document.getElementById("teacherProfileModal");
const teacherProfileForm = document.getElementById("teacherProfileForm");
const teacherProfileMessage = document.getElementById("teacherProfileMessage");
const saveTeacherProfileButton = document.getElementById("saveTeacherProfile");
const teacherHeaderName = document.getElementById("teacherHeaderName");
const teacherModalPhoto = document.getElementById("teacherModalPhoto");
const teacherModalPhotoPlaceholder = document.getElementById("teacherModalPhotoPlaceholder");
const TEACHER_PROFILE_API = "http://localhost:3001/api/CrearUsuario/perfil-docente";

document.body.append(teacherProfileModal);

let teacherProfile = null;
let selectedProfilePhoto = null;
let currentProfilePhotoURL = null;

let teacherSession = null;
try {
    teacherSession = JSON.parse(sessionStorage.getItem("usuarioSentir") || "null");
} catch {
    teacherSession = null;
}

const teacherToken = String(teacherSession?.token || "");

function teacherAuthHeaders() {
    return { Authorization: `Bearer ${teacherToken}` };
}

function displayTeacherPhoto(photo) {
    const hasPhoto = Boolean(photo);
    profilePhoto.classList.toggle("has-photo", hasPhoto);
    profilePlaceholder.classList.toggle("hidden", hasPhoto);
    teacherModalPhoto.hidden = !hasPhoto;
    teacherModalPhotoPlaceholder.hidden = hasPhoto;

    if (hasPhoto) {
        profilePhoto.src = photo;
        teacherModalPhoto.src = photo;
    } else {
        profilePhoto.removeAttribute("src");
        teacherModalPhoto.removeAttribute("src");
        teacherModalPhotoPlaceholder.textContent =
            teacherProfile?.firstName?.charAt(0)?.toUpperCase() || "D";
    }
}

function renderTeacherProfile(profile) {
    teacherProfile = profile;
    const fullName = [profile.firstName, profile.secondName, profile.firstSurname, profile.secondSurname]
        .filter(Boolean)
        .join(" ");
    teacherHeaderName.textContent = fullName || "Docente";
    document.getElementById("teacherProfileFirstName").value = [profile.firstName, profile.secondName].filter(Boolean).join(" ");
    document.getElementById("teacherProfileLastName").value = [profile.firstSurname, profile.secondSurname].filter(Boolean).join(" ");
    document.getElementById("teacherProfileIdNumber").value = profile.id || "";
    document.getElementById("teacherProfileEmail").value = profile.email || "";
    document.getElementById("teacherProfilePhone").value = profile.phone || "";
    document.getElementById("teacherProfileYear").value = profile.anoCursado || "No registrado";
    document.getElementById("teacherProfileDirector").value = profile.directorGrupo === null
        ? "No registrado"
        : (Number(profile.directorGrupo) === 1 ? "Sí" : "No");
    document.getElementById("teacherProfileAssignedGrade").value = profile.gradoAsignado || "No registrado";
    document.getElementById("teacherProfileTeachingGrades").value = profile.teachingGrades?.length
        ? profile.teachingGrades.join(", ")
        : "No registrados";
    displayTeacherPhoto(profile.photo);
}

async function loadTeacherProfile() {
    if (!teacherToken) {
        throw new Error("No se encontró la sesión del docente. Inicia sesión nuevamente.");
    }

    const response = await fetch(TEACHER_PROFILE_API, { headers: teacherAuthHeaders() });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.message || "No se pudo cargar el perfil docente.");
    }

    renderTeacherProfile(result.profile);
    return result.profile;
}

function openTeacherProfileModal() {
    teacherProfileMessage.textContent = "";
    teacherProfileMessage.classList.remove("success");
    selectedProfilePhoto = null;
    profilePhotoInput.value = "";
    teacherProfileModal.classList.add("show");
    teacherProfileModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    loadTeacherProfile().catch((error) => {
        teacherProfileMessage.textContent = error.message;
    });
}

function closeTeacherProfileModal() {
    teacherProfileModal.classList.remove("show");
    teacherProfileModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    selectedProfilePhoto = null;
    profilePhotoInput.value = "";

    if (currentProfilePhotoURL) {
        URL.revokeObjectURL(currentProfilePhotoURL);
        currentProfilePhotoURL = null;
    }
    if (teacherProfile) displayTeacherPhoto(teacherProfile.photo);
}

document.getElementById("openTeacherProfile").addEventListener("click", openTeacherProfileModal);
document.getElementById("closeTeacherProfile").addEventListener("click", closeTeacherProfileModal);
document.getElementById("cancelTeacherProfile").addEventListener("click", closeTeacherProfileModal);
teacherProfileModal.addEventListener("click", (event) => {
    if (event.target === teacherProfileModal) closeTeacherProfileModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && teacherProfileModal.classList.contains("show")) {
        closeTeacherProfileModal();
    }
});

profilePhotoInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
        teacherProfileMessage.textContent = "Selecciona una imagen JPG, PNG o WEBP.";
        profilePhotoInput.value = "";
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        teacherProfileMessage.textContent = "La foto no puede superar 5 MB.";
        profilePhotoInput.value = "";
        return;
    }

    teacherProfileMessage.textContent = "";
    selectedProfilePhoto = file;
    if (currentProfilePhotoURL) URL.revokeObjectURL(currentProfilePhotoURL);
    currentProfilePhotoURL = URL.createObjectURL(file);
    displayTeacherPhoto(currentProfilePhotoURL);
});

document.getElementById("teacherProfilePhone").addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 15);
});

teacherProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    teacherProfileMessage.textContent = "";
    teacherProfileMessage.classList.remove("success");

    const email = document.getElementById("teacherProfileEmail").value.trim();
    const phone = document.getElementById("teacherProfilePhone").value.trim();
    if (!email || !phone) {
        teacherProfileMessage.textContent = "Ingresa el correo y el celular.";
        return;
    }
    if (!/^\d{7,15}$/.test(phone)) {
        teacherProfileMessage.textContent = "El celular debe contener entre 7 y 15 números.";
        return;
    }

    const payload = new FormData();
    payload.append("email", email);
    payload.append("phone", phone);
    if (selectedProfilePhoto) payload.append("foto", selectedProfilePhoto);

    saveTeacherProfileButton.disabled = true;
    saveTeacherProfileButton.textContent = "Guardando...";
    try {
        const response = await fetch(TEACHER_PROFILE_API, {
            method: "PUT",
            headers: teacherAuthHeaders(),
            body: payload
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "No se pudo guardar el perfil.");

        renderTeacherProfile(result.profile);
        const updatedSession = {
            ...teacherSession,
            nombre: [result.profile.firstName, result.profile.secondName].filter(Boolean).join(" "),
            apellido: [result.profile.firstSurname, result.profile.secondSurname].filter(Boolean).join(" ")
        };
        sessionStorage.setItem("usuarioSentir", JSON.stringify(updatedSession));
        teacherSession = updatedSession;
        selectedProfilePhoto = null;
        profilePhotoInput.value = "";
        if (currentProfilePhotoURL) {
            URL.revokeObjectURL(currentProfilePhotoURL);
            currentProfilePhotoURL = null;
        }
        teacherProfileMessage.textContent = "Los cambios se guardaron correctamente.";
        teacherProfileMessage.classList.add("success");
    } catch (error) {
        teacherProfileMessage.textContent = error.message;
    } finally {
        saveTeacherProfileButton.disabled = false;
        saveTeacherProfileButton.textContent = "Guardar cambios";
    }
});

if (teacherSession) {
    teacherHeaderName.textContent = [teacherSession.nombre, teacherSession.apellido].filter(Boolean).join(" ") || "Docente";
}
loadTeacherProfile().catch((error) => console.warn("No se pudo cargar el perfil docente:", error.message));