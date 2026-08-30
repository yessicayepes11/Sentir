/* =====================================================
   SENTIR — SEGUIMIENTO
   ===================================================== */


/* =====================================================
   MENÚ HAMBURGUESA
   ===================================================== */

const sidebar =
    document.getElementById("sidebar");

const openMenu =
    document.getElementById("openMenu");

const closeMenu =
    document.getElementById("closeMenu");

const overlay =
    document.getElementById("overlay");


function openSidebar() {

    sidebar.classList.add("open");

    overlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeSidebar() {

    sidebar.classList.remove("open");

    overlay.classList.remove("active");

    document.body.style.overflow = "";

}


openMenu.addEventListener(
    "click",
    openSidebar
);


closeMenu.addEventListener(
    "click",
    closeSidebar
);


overlay.addEventListener(
    "click",
    closeSidebar
);


/* ESC para cerrar */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeSidebar();

        }

    }
);



/* =====================================================
   TOAST
   ===================================================== */

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");


let toastTimeout;


function showToast(message) {

    toastText.textContent =
        message;

    toast.classList.add("show");


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}



/* =====================================================
   BARRAS DE GRÁFICA
   ===================================================== */

const bars =
    document.querySelectorAll(
        ".bar-wrapper"
    );


bars.forEach(
    bar => {

        bar.addEventListener(
            "click",
            () => {

                const day =
                    bar.dataset.day;

                const height =
                    bar.querySelector(
                        ".bar"
                    ).style.height;


                showToast(
                    `Registro de ${day}: ${height} de nivel emocional.`
                );

            }
        );

    }
);



/* =====================================================
   CAMBIO DE PERIODO
   ===================================================== */

const periodSelect =
    document.getElementById(
        "periodSelect"
    );


periodSelect.addEventListener(
    "change",
    function() {

        if (this.value === "month") {

            showToast(
                "Aquí podrás consultar tu seguimiento mensual."
            );

            document.getElementById(
                "chartMessage"
            ).textContent =
                "El seguimiento mensual permitirá observar cambios más amplios en tus registros emocionales.";

        }

        else {

            showToast(
                "Mostrando tu seguimiento semanal."
            );

            document.getElementById(
                "chartMessage"
            ).textContent =
                "Tu registro muestra variaciones en tus emociones. Recuerda que todas son válidas.";

        }

    }
);



/* =====================================================
   VER TODAS LAS EMOCIONES
   ===================================================== */

const viewAll =
    document.getElementById(
        "viewAll"
    );


viewAll.addEventListener(
    "click",
    () => {

        showToast(
            "Aquí podrás consultar tu historial completo de emociones."
        );

    }
);



/* =====================================================
   BOTÓN RELAJACIÓN
   ===================================================== */

const relaxButton =
    document.getElementById(
        "relaxButton"
    );


relaxButton.addEventListener(
    "click",
    () => {

        /*
            Cuando tengas creada tu página:

            window.location.href =
                "relajacion.html";
        */

        showToast(
            "Abriendo tu espacio de relajación..."
        );

    }
);



/* =====================================================
   BOTÓN DIARIO
   ===================================================== */

const diaryButton =
    document.getElementById(
        "diaryButton"
    );


diaryButton.addEventListener(
    "click",
    () => {

        /*
            Cuando conectes el diario:

            window.location.href =
                "diario.html";
        */

        showToast(
            "Abriendo tu diario emocional..."
        );

    }
);



/* =====================================================
   NOTIFICACIÓN
   ===================================================== */

const notification =
    document.querySelector(
        ".notification"
    );


notification.addEventListener(
    "click",
    () => {

        showToast(
            "No tienes nuevas notificaciones."
        );

    }
);



/* =====================================================
   NAVEGACIÓN DEL SIDEBAR
   ===================================================== */

const sideLinks =
    document.querySelectorAll(
        ".side-link"
    );


sideLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            function(event) {

                /*
                    Por ahora evitamos
                    que "#" recargue la página.
                */

                event.preventDefault();


                sideLinks.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                /*
                    Cerramos menú en móvil.
                */

                closeSidebar();

            }
        );

    }
);



/* =====================================================
   DATOS DE SEGUIMIENTO
   =====================================================

   MÁS ADELANTE ESTOS DATOS NO DEBERÍAN
   ESTAR ESCRITOS DIRECTAMENTE AQUÍ.

   La idea es que vengan de tu base
   de datos de Sentir.

   Ejemplo:

   diario_emocional
          ↓
   registros
          ↓
   seguimiento
          ↓
   gráficos
*/


const emotionalData = {

    totalRecords: 12,

    mainEmotion: "Tranquilo",

    consistency: 80,

    week: [
        55,
        72,
        45,
        78,
        62,
        84,
        70
    ]

};



/* =====================================================
   ACTUALIZAR RESUMEN
   ===================================================== */

document.getElementById(
    "recordCount"
).textContent =
    emotionalData.totalRecords;


document.getElementById(
    "mainEmotion"
).textContent =
    emotionalData.mainEmotion;



/* =====================================================
   MENSAJE DINÁMICO
   ===================================================== */

const recommendationText =
    document.getElementById(
        "recommendationText"
    );


const recommendations = [

    "Si hoy sientes que tienes muchas cosas en la cabeza, intenta hacer una pausa y respirar durante unos minutos.",

    "Recuerda que identificar lo que sientes también es una forma de cuidarte.",

    "No tienes que sentirte bien todo el tiempo. Todas tus emociones tienen un lugar.",

    "Si necesitas un momento para ti, puedes utilizar uno de los ejercicios de relajación de Sentir."

];


let recommendationIndex = 0;


setInterval(
    () => {

        recommendationIndex++;

        if (
            recommendationIndex >=
            recommendations.length
        ) {

            recommendationIndex = 0;

        }


        recommendationText.style.opacity =
            "0";


        setTimeout(
            () => {

                recommendationText.textContent =
                    recommendations[
                        recommendationIndex
                    ];

                recommendationText.style.opacity =
                    "1";

            },
            200
        );

    },
    7000
);

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('openMenu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    }

    // Abrir/Cerrar al hacer clic en el botón de hamburguesa
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleSidebar);
    }

    // Cerrar al hacer clic en el fondo oscuro
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }

    // Cerrar automáticamente al hacer clic en cualquier opción del menú
    const menuLinks = document.querySelectorAll('.menu-item, .side-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        });
    });
});