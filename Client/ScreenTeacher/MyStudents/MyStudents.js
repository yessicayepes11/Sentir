/* =========================================================
   SENTIR - MIS ESTUDIANTES
========================================================= */


/* =========================================================
   SIDEBAR RESPONSIVE
========================================================= */

const sidebar =
    document.getElementById("sidebar");


const hamburger =
    document.getElementById("hamburger");


const mobileOverlay =
    document.getElementById("mobileOverlay");


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
   FOTO DE PERFIL DOCENTE
========================================================= */

const profilePhotoInput =
    document.getElementById(
        "profilePhotoInput"
    );


const profilePhoto =
    document.getElementById(
        "profilePhoto"
    );


const profilePlaceholder =
    document.getElementById(
        "profilePlaceholder"
    );


let currentProfilePhotoURL = null;


if (profilePhotoInput) {

    profilePhotoInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


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


            if (currentProfilePhotoURL) {

                URL.revokeObjectURL(
                    currentProfilePhotoURL
                );

            }


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

        }
    );

}


/* =========================================================
   BUSCADOR Y FILTROS
========================================================= */

const studentSearch =
    document.getElementById(
        "studentSearch"
    );


const groupFilter =
    document.getElementById(
        "groupFilter"
    );


const scheduleFilter =
    document.getElementById(
        "scheduleFilter"
    );


const clearFilters =
    document.getElementById(
        "clearFilters"
    );


const studentRows =
    document.querySelectorAll(
        "#studentsTable tbody tr"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const studentsTable =
    document.getElementById(
        "studentsTable"
    );


const resultsCounter =
    document.getElementById(
        "resultsCounter"
    );


function normalizeText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


function filterStudents() {

    const searchValue =
        normalizeText(
            studentSearch.value.trim()
        );


    const selectedGroup =
        groupFilter.value;


    const selectedSchedule =
        scheduleFilter.value;


    let visibleStudents = 0;


    studentRows.forEach(
        function (row) {

            const name =
                normalizeText(
                    row.dataset.name
                );


            const group =
                row.dataset.group;


            const schedule =
                row.dataset.schedule;


            const matchesSearch =
                name.includes(
                    searchValue
                );


            const matchesGroup =
                selectedGroup === "all" ||
                group === selectedGroup;


            const matchesSchedule =
                selectedSchedule === "all" ||
                schedule === selectedSchedule;


            const shouldShow =

                matchesSearch &&
                matchesGroup &&
                matchesSchedule;


            if (shouldShow) {

                row.style.display = "";

                visibleStudents++;

            }

            else {

                row.style.display =
                    "none";

            }

        }
    );


    resultsCounter.textContent =
        `${visibleStudents} estudiante${
            visibleStudents === 1
                ? ""
                : "s"
        }`;


    if (visibleStudents === 0) {

        studentsTable.style.display =
            "none";


        emptyState.classList.add(
            "show"
        );

    }

    else {

        studentsTable.style.display =
            "table";


        emptyState.classList.remove(
            "show"
        );

    }

}


/* EVENTOS */

studentSearch.addEventListener(
    "input",
    filterStudents
);


groupFilter.addEventListener(
    "change",
    filterStudents
);


scheduleFilter.addEventListener(
    "change",
    filterStudents
);


/* LIMPIAR */

clearFilters.addEventListener(
    "click",
    function () {

        studentSearch.value = "";

        groupFilter.value =
            "all";

        scheduleFilter.value =
            "all";


        filterStudents();

    }
);


/* =========================================================
   MODAL INFORMACIÓN GENERAL
========================================================= */

const studentModal =
    document.getElementById(
        "studentModal"
    );


const closeStudentModal =
    document.getElementById(
        "closeStudentModal"
    );


const modalStudentName =
    document.getElementById(
        "modalStudentName"
    );


const modalStudentGroup =
    document.getElementById(
        "modalStudentGroup"
    );


const modalStudentGrade =
    document.getElementById(
        "modalStudentGrade"
    );


const modalStudentSchedule =
    document.getElementById(
        "modalStudentSchedule"
    );


const modalStudentEmail =
    document.getElementById(
        "modalStudentEmail"
    );


const detailButtons =
    document.querySelectorAll(
        ".detail-button"
    );


detailButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                modalStudentName.textContent =
                    button.dataset.student;


                modalStudentGroup.textContent =
                    button.dataset.group;


                modalStudentGrade.textContent =
                    button.dataset.grade;


                modalStudentSchedule.textContent =
                    button.dataset.schedule;


                modalStudentEmail.textContent =
                    button.dataset.email;


                studentModal.classList.add(
                    "show"
                );


                document.body.style.overflow =
                    "hidden";

            }
        );

    }
);


function closeStudentInformation() {

    studentModal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


closeStudentModal.addEventListener(
    "click",
    closeStudentInformation
);


studentModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            studentModal
        ) {

            closeStudentInformation();

        }

    }
);


/* =========================================================
   ALERTA DESDE ESTUDIANTE
========================================================= */

const alertModal =
    document.getElementById(
        "alertModal"
    );


const alertButtons =
    document.querySelectorAll(
        ".student-alert-button"
    );


const closeAlertModal =
    document.getElementById(
        "closeAlertModal"
    );


const cancelAlert =
    document.getElementById(
        "cancelAlert"
    );


const alertStudentText =
    document.getElementById(
        "alertStudentText"
    );


const alertStudentName =
    document.getElementById(
        "alertStudentName"
    );


alertButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const student =
                    button.dataset.student;


                const group =
                    button.dataset.group;


                alertStudentName.value =
                    student;


                alertStudentText.textContent =
                    `${student} • ${group}`;


                alertModal.classList.add(
                    "show"
                );


                document.body.style.overflow =
                    "hidden";

            }
        );

    }
);


function closeAlert() {

    alertModal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


closeAlertModal.addEventListener(
    "click",
    closeAlert
);


cancelAlert.addEventListener(
    "click",
    closeAlert
);


alertModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            alertModal
        ) {

            closeAlert();

        }

    }
);


/* =========================================================
   CONTADOR ALERTA
========================================================= */

const alertDescription =
    document.getElementById(
        "alertDescription"
    );


const alertCounter =
    document.getElementById(
        "alertCounter"
    );


alertDescription.addEventListener(
    "input",
    function () {

        alertCounter.textContent =
            `${alertDescription.value.length} / 500`;

    }
);


/* =========================================================
   ENVIAR ALERTA
========================================================= */

const studentAlertForm =
    document.getElementById(
        "studentAlertForm"
    );


const toast =
    document.getElementById(
        "toast"
    );


studentAlertForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const alertData = {

            student:
                alertStudentName.value,

            type:
                document.getElementById(
                    "alertType"
                ).value,

            description:
                alertDescription.value

        };


        console.log(
            "Alerta docente:",
            alertData
        );


        studentAlertForm.reset();


        alertCounter.textContent =
            "0 / 500";


        closeAlert();


        showToast();

    }
);


/* =========================================================
   TOAST
========================================================= */

function showToast() {

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
            event.key !== "Escape"
        ) {

            return;

        }


        closeStudentInformation();

        closeAlert();

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