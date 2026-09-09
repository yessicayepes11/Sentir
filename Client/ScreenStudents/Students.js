/* =====================================================
   SENTIR - ESTUDIANTE
   JAVASCRIPT
   ===================================================== */


/* =====================================================
   MENÚ RESPONSIVE
   ===================================================== */

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");

if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });

}


/* =====================================================
   CERRAR SIDEBAR AL SELECCIONAR UNA OPCIÓN
   ===================================================== */

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 850) {

            sidebar.classList.remove("open");

        }

    });

});


/* =====================================================
   ESTADO EMOCIONAL
   ===================================================== */

const emotions = document.querySelectorAll(".emotion");

const emotionQuestion =
    document.getElementById("emotionQuestion");

const selectedEmotion =
    document.getElementById("selectedEmotion");

const questionTitle =
    document.getElementById("questionTitle");


emotions.forEach(emotion => {

    emotion.addEventListener("click", () => {

        /* Quitar selección anterior */

        emotions.forEach(item => {

            item.classList.remove("selected");

        });


        /* Seleccionar emoción */

        emotion.classList.add("selected");


        /* Obtener emoción */

        const emotionName =
            emotion.dataset.emotion;


        /* Mostrar emoción seleccionada */

        selectedEmotion.textContent =
            `Hoy te sientes: ${emotionName}`;


        /* Pregunta */

        questionTitle.textContent =
            "¿Quieres contarnos un poco más?";


        /* Mostrar panel */

        emotionQuestion.classList.add("show");


        /* Desplazar suavemente */

        setTimeout(() => {

            emotionQuestion.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);

    });

});


/* =====================================================
   CERRAR PREGUNTA
   ===================================================== */

const closeQuestion =
    document.getElementById("closeQuestion");

if (closeQuestion) {

    closeQuestion.addEventListener("click", () => {

        emotionQuestion.classList.remove("show");

        emotions.forEach(item => {

            item.classList.remove("selected");

        });

    });

}


/* =====================================================
   ABRIR DIARIO DESDE LA PREGUNTA
   ===================================================== */

const openDiary =
    document.getElementById("openDiary");

if (openDiary) {

    openDiary.addEventListener("click", () => {

        const diary =
            document.getElementById("diario");

        if (diary) {

            diary.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    });

}


/* =====================================================
   MODAL DE ALERTA
   ===================================================== */

const alertButton =
    document.getElementById("alertButton");

const alertModal =
    document.getElementById("alertModal");

const closeAlert =
    document.getElementById("closeAlert");

const cancelAlert =
    document.getElementById("cancelAlert");


function openAlertModal() {

    alertModal.classList.add("show");

}


function closeAlertModal() {

    alertModal.classList.remove("show");

}


if (alertButton) {

    alertButton.addEventListener(
        "click",
        openAlertModal
    );

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


/* =====================================================
   CERRAR MODAL HACIENDO CLICK FUERA
   ===================================================== */

if (alertModal) {

    alertModal.addEventListener("click", (event) => {

        if (event.target === alertModal) {

            closeAlertModal();

        }

    });

}


/* =====================================================
   ESC PARA CERRAR MODAL
   ===================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeAlertModal();

    }

});


/* =====================================================
   NAVEGACIÓN SUAVE
   ===================================================== */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(event) {

        const targetId =
            this.getAttribute("href");

        if (targetId === "#") {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


/* =====================================================
   BOTONES DE RECURSOS / ACTIVIDADES
   ===================================================== */

const interactiveButtons =
    document.querySelectorAll(".card-link");


interactiveButtons.forEach(button => {

    button.addEventListener("click", () => {

        /*
        Aquí posteriormente conectaremos
        cada botón con su página correspondiente.

        Por ahora no inventamos funciones nuevas.
        */

        console.log(
            "Se seleccionó una herramienta de Sentir."
        );

    });

});


/* =====================================================
   BOTÓN PEDIR AYUDA
   ===================================================== */

const helpButton =
    document.querySelector(".help-button");

if (helpButton) {

    helpButton.addEventListener("click", () => {

        openAlertModal();

    });

}


/* =====================================================
   CERRAR SIDEBAR AL HACER CLICK FUERA
   ===================================================== */

document.addEventListener("click", (event) => {

    if (window.innerWidth > 850) {
        return;
    }

    const clickedInsideSidebar =
        sidebar.contains(event.target);

    const clickedMenu =
        mobileMenu.contains(event.target);


    if (!clickedInsideSidebar && !clickedMenu) {

        sidebar.classList.remove("open");

    }

});

document.querySelectorAll('.emotion').forEach(button => {
  button.addEventListener('click', () => {
    // Busca el input radio dentro del botón presionado y lo activa
    const input = button.querySelector('input[type="radio"]');
    if (input) {
      input.checked = true;
    }
  });
});

// Seleccionamos las tarjetas de emoción del index
const opcionesEmojiIndex = document.querySelectorAll('.emotion-option');

opcionesEmojiIndex.forEach(opcion => {
  opcion.addEventListener('click', () => {
    // Obtenemos el nombre de la emoción guardado en 'data-emotion'
    const emocionSeleccionada = opcion.getAttribute('data-emotion');

    // Guardamos la emoción en el almacenamiento del navegador
    localStorage.setItem('emocionPendiente', emocionSeleccionada);

    // Redirigimos a la página del diario (cambia 'diario.html' por la ruta de tu archivo)
    window.location.href = 'diario.html';
  });
});