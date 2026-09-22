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

            sidebar.classList.toggle("open");

            mobileOverlay.classList.toggle("show");

        }
    );

}


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


let currentPhotoURL =
    null;


if (profilePhotoInput) {

    profilePhotoInput.addEventListener(
        "change",
        function (event) {


            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            const validTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"

            ];


            if (
                !validTypes.includes(
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


            if (currentPhotoURL) {

                URL.revokeObjectURL(
                    currentPhotoURL
                );

            }


            currentPhotoURL =
                URL.createObjectURL(
                    file
                );


            profilePhoto.src =
                currentPhotoURL;


            profilePhoto.classList.add(
                "has-photo"
            );


            profilePlaceholder.classList.add(
                "hidden"
            );


            /*
                Después puedes enviar `file`
                al backend utilizando FormData.
            */

            console.log(
                "Foto docente seleccionada:",
                file
            );

        }
    );

}



/* =========================================================
   BUSCADOR Y FILTRO
========================================================= */

const studentSearch =
    document.getElementById(
        "studentSearch"
    );


const groupFilter =
    document.getElementById(
        "groupFilter"
    );


const clearFilters =
    document.getElementById(
        "clearFilters"
    );


const studentRows =
    document.querySelectorAll(
        "#studentsTable tbody tr"
    );


const studentsTable =
    document.getElementById(
        "studentsTable"
    );


const resultsCounter =
    document.getElementById(
        "resultsCounter"
    );


const emptyState =
    document.getElementById(
        "emptyState"
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


    const groupValue =
        groupFilter.value;


    let visibleStudents = 0;


    studentRows.forEach(
        function (row) {


            const studentName =
                normalizeText(
                    row.dataset.name
                );


            const studentGroup =
                row.dataset.group;


            const matchesName =
                studentName.includes(
                    searchValue
                );


            const matchesGroup =
                groupValue === "all" ||
                studentGroup === groupValue;


            if (
                matchesName &&
                matchesGroup
            ) {

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



studentSearch.addEventListener(
    "input",
    filterStudents
);


groupFilter.addEventListener(
    "change",
    filterStudents
);


clearFilters.addEventListener(
    "click",
    function () {

        studentSearch.value =
            "";


        groupFilter.value =
            "all";


        filterStudents();

    }
);



/* =========================================================
   FUNCIÓN PARA INICIALES
========================================================= */

function getInitials(name) {


    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0)
                .toUpperCase()
        )
        .join("");

}



/* =========================================================
   MODAL VER INFORMACIÓN
========================================================= */

const studentModal =
    document.getElementById(
        "studentModal"
    );


const closeStudentModal =
    document.getElementById(
        "closeStudentModal"
    );


const closeInformationButton =
    document.getElementById(
        "closeInformationButton"
    );


const detailButtons =
    document.querySelectorAll(
        ".detail-button"
    );



const modalStudentInitials =
    document.getElementById(
        "modalStudentInitials"
    );


const modalStudentName =
    document.getElementById(
        "modalStudentName"
    );


const modalStudentSubtitle =
    document.getElementById(
        "modalStudentSubtitle"
    );


const modalStudentDocument =
    document.getElementById(
        "modalStudentDocument"
    );


const modalStudentGrade =
    document.getElementById(
        "modalStudentGrade"
    );


const modalStudentGroup =
    document.getElementById(
        "modalStudentGroup"
    );


const modalStudentAge =
    document.getElementById(
        "modalStudentAge"
    );


const modalStudentEmail =
    document.getElementById(
        "modalStudentEmail"
    );



detailButtons.forEach(
    function (button) {


        button.addEventListener(
            "click",
            function () {


                const student = {

                    name:
                        button.dataset.student,

                    document:
                        button.dataset.document,

                    group:
                        button.dataset.group,

                    grade:
                        button.dataset.grade,

                    age:
                        button.dataset.age,

                    email:
                        button.dataset.email

                };



                /* CABECERA */

                modalStudentInitials.textContent =
                    getInitials(
                        student.name
                    );


                modalStudentName.textContent =
                    student.name;


                modalStudentSubtitle.textContent =
                    `${student.group} • ${student.grade}`;



                /* INFORMACIÓN */

                modalStudentDocument.textContent =
                    student.document;


                modalStudentGrade.textContent =
                    student.grade;


                modalStudentGroup.textContent =
                    student.group;


                modalStudentAge.textContent =
                    student.age;


                modalStudentEmail.textContent =
                    student.email;



                /* ABRIR */

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


closeInformationButton.addEventListener(
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
   MODAL ALERTA
========================================================= */

const alertModal =
    document.getElementById(
        "alertModal"
    );


const closeAlertModal =
    document.getElementById(
        "closeAlertModal"
    );


const cancelAlert =
    document.getElementById(
        "cancelAlert"
    );


const alertButtons =
    document.querySelectorAll(
        ".student-alert-button"
    );



const alertStudentInitials =
    document.getElementById(
        "alertStudentInitials"
    );


const alertStudentNameLabel =
    document.getElementById(
        "alertStudentNameLabel"
    );


const alertStudentInformation =
    document.getElementById(
        "alertStudentInformation"
    );


const alertStudentName =
    document.getElementById(
        "alertStudentName"
    );


const alertStudentGroup =
    document.getElementById(
        "alertStudentGroup"
    );


const alertStudentGrade =
    document.getElementById(
        "alertStudentGrade"
    );



/* =========================================================
   ABRIR ALERTA
========================================================= */

function openAlert(student) {


    alertStudentInitials.textContent =
        getInitials(
            student.name
        );


    alertStudentNameLabel.textContent =
        student.name;


    alertStudentInformation.textContent =
        `${student.group} • ${student.grade}`;



    /* INPUTS OCULTOS */

    alertStudentName.value =
        student.name;


    alertStudentGroup.value =
        student.group;


    alertStudentGrade.value =
        student.grade;



    alertModal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   BOTÓN ALERTA DE LA TABLA
========================================================= */

alertButtons.forEach(
    function (button) {


        button.addEventListener(
            "click",
            function () {


                const student = {

                    name:
                        button.dataset.student,

                    group:
                        button.dataset.group,

                    grade:
                        button.dataset.grade

                };


                openAlert(
                    student
                );

            }
        );

    }
);



/* =========================================================
   CERRAR ALERTA
========================================================= */

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
   CONTADOR DE DESCRIPCIÓN
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

            group:
                alertStudentGroup.value,

            grade:
                alertStudentGrade.value,

            situation:
                document.getElementById(
                    "alertType"
                ).value,

            description:
                alertDescription.value,

            createdAt:
                new Date()
                .toISOString()

        };



        /* =================================================
           DESPUÉS AQUÍ CONECTAS EL BACKEND
        ================================================= */

        console.log(
            "Alerta docente:",
            alertData
        );



        /* LIMPIAR FORMULARIO */

        studentAlertForm.reset();


        alertCounter.textContent =
            "0 / 500";



        /* CERRAR */

        closeAlert();



        /* MENSAJE DE ÉXITO */

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
   CERRAR MODALES CON ESC
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {


        if (
            event.key !==
            "Escape"
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