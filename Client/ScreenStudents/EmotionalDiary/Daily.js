/* =========================================================
   DIARIO EMOCIONAL - SENTIR
========================================================= */


/* =========================================================
   VARIABLES GENERALES
========================================================= */

const emotions = document.querySelectorAll(".emotion");

const intensityRange =
    document.getElementById("intensityRange");

const intensityButtons =
    document.querySelectorAll(".intensity-numbers button");

const intensityNumber =
    document.getElementById("intensityNumber");

const intensityStatus =
    document.getElementById("intensityStatus");

const selectedEmotionText =
    document.getElementById("selectedEmotionText");

const diaryText =
    document.getElementById("diaryText");

const saveDiaryBtn =
    document.getElementById("saveDiaryBtn");

const historyGrid =
    document.getElementById("historyGrid");

const wordCounter =
    document.getElementById("wordCounter");


let selectedEmotion = null;

let selectedIntensity = null;


/* =========================================================
   FECHA ACTUAL
========================================================= */

function showCurrentDate() {

    const currentDate =
        document.getElementById("currentDate");

    const date = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDate.textContent =
        date.toLocaleDateString(
            "es-CO",
            options
        );

}


showCurrentDate();


/* =========================================================
   SELECCIÓN DE EMOCIONES
========================================================= */

emotions.forEach(emotion => {

    emotion.addEventListener("click", () => {

        emotions.forEach(item => {

            item.classList.remove("selected");

        });


        emotion.classList.add("selected");


        
    const emotionTitle = emotion.querySelector("h3") || emotion.querySelector("h2") || emotion.querySelector("strong");
    selectedEmotion = emotionTitle ? emotionTitle.textContent.trim() : "";


        selectedEmotionText.textContent =
            selectedEmotion;


        /* ACTIVAR SLIDER */

        intensityRange.disabled = false;


        /* SELECCIONAR RADIO INTERNO */

        const radio =
            emotion.querySelector(
                'input[type="radio"]'
            );


        if (radio) {

            radio.checked = true;

        }


        /* GUARDAR EMOCIÓN TEMPORAL */

        localStorage.setItem(
            "sentir_emocion_actual",
            selectedEmotion
        );


        showToast(
            `Emoción seleccionada: ${selectedEmotion}`,
            "♥"
        );

    });

});


/* =========================================================
   RECUPERAR EMOCIÓN DE ESTUDIANTE.HTML
========================================================= */

function loadPreviousEmotion() {

    const savedEmotion =
        localStorage.getItem(
            "sentir_emocion_actual"
        );


    if (!savedEmotion) return;


    emotions.forEach(emotion => {

        if (
            emotion.dataset.emotion === savedEmotion
        ) {

            emotion.classList.add("selected");

            selectedEmotion =
                savedEmotion;

            selectedEmotionText.textContent =
                savedEmotion;

            intensityRange.disabled = false;

            const radio =
                emotion.querySelector(
                    'input[type="radio"]'
                );

            if (radio) {

                radio.checked = true;

            }

        }

    });

}


loadPreviousEmotion();


/* =========================================================
   INTENSIDAD
========================================================= */

function updateIntensity(value) {

    selectedIntensity = Number(value);


    intensityRange.value =
        selectedIntensity;


    intensityNumber.textContent =
        selectedIntensity;


    intensityButtons.forEach(button => {

        button.classList.remove(
            "active-intensity"
        );


        if (
            Number(button.dataset.value) ===
            selectedIntensity
        ) {

            button.classList.add(
                "active-intensity"
            );

        }

    });


    /* TEXTO SEGÚN INTENSIDAD */

    if (selectedIntensity <= 3) {

        intensityStatus.textContent =
            "Intensidad baja";

    }

    else if (selectedIntensity <= 6) {

        intensityStatus.textContent =
            "Intensidad moderada";

    }

    else if (selectedIntensity <= 8) {

        intensityStatus.textContent =
            "Intensidad alta";

    }

    else {

        intensityStatus.textContent =
            "Intensidad muy alta";

    }

}


/* RANGE */

intensityRange.addEventListener(
    "input",
    () => {

        updateIntensity(
            intensityRange.value
        );

    }
);


/* BOTONES 1 - 10 */

intensityButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (!selectedEmotion) {

                showToast(
                    "Primero selecciona una emoción.",
                    "!"
                );

                return;

            }


            updateIntensity(
                button.dataset.value
            );

        }
    );

});


/* =========================================================
   CONTADOR DE PALABRAS
========================================================= */

diaryText.addEventListener(
    "input",
    () => {

        const text =
            diaryText.value.trim();


        const words =
            text
                ? text.split(/\s+/).length
                : 0;


        wordCounter.textContent =
            `${words} palabras`;

    }
);


/* =========================================================
   ELIMINAR PREGUNTAS INDIVIDUALES
========================================================= */

const removeQuestionButtons =
    document.querySelectorAll(
        ".remove-question"
    );


removeQuestionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const questionCard =
                button.closest(
                    ".question-card"
                );


            questionCard.style.opacity = "0";


            setTimeout(() => {

                questionCard.style.display =
                    "none";

            }, 250);

        }
    );

});


/* =========================================================
   OCULTAR TODAS LAS PREGUNTAS
========================================================= */

const hideQuestionsBtn =
    document.getElementById(
        "hideQuestionsBtn"
    );


const questionsGrid =
    document.getElementById(
        "questionsGrid"
    );


hideQuestionsBtn.addEventListener(
    "click",
    () => {

        if (
            questionsGrid.style.display === "none"
        ) {

            questionsGrid.style.display =
                "grid";

            hideQuestionsBtn.textContent =
                "Ocultar preguntas";

        }

        else {

            questionsGrid.style.display =
                "none";

            hideQuestionsBtn.textContent =
                "Mostrar preguntas";

        }

    }
);


/* =========================================================
   GUARDAR DIARIO
========================================================= */

saveDiaryBtn.addEventListener(
    "click",
    () => {


        /* VALIDACIÓN EMOCIÓN */

        if (!selectedEmotion) {

            showToast(
                "Debes seleccionar cómo te sientes antes de guardar.",
                "!"
            );

            return;

        }


        /* VALIDACIÓN INTENSIDAD */

        if (!selectedIntensity) {

            showToast(
                "Debes indicar la intensidad de tu emoción.",
                "!"
            );

            return;

        }


        /* TEXTO PRINCIPAL */

        const mainText =
            diaryText.value.trim();


        /*
        El texto NO es obligatorio según tus instrucciones.
        Lo importante es emoción + intensidad.
        */


        const question1 =
            document
                .getElementById("question1")
                ?.value
                .trim() || "";


        const question2 =
            document
                .getElementById("question2")
                ?.value
                .trim() || "";


        const question3 =
            document
                .getElementById("question3")
                ?.value
                .trim() || "";


        /* CREAR REGISTRO */

        const entry = {

            id: Date.now(),

            emotion:
                selectedEmotion,

            intensity:
                selectedIntensity,

            diary:
                mainText,

            situation:
                question1,

            thoughts:
                question2,

            needs:
                question3,

            date:
                new Date().toLocaleString(
                    "es-CO"
                )

        };


        /* OBTENER HISTORIAL */

        const history =
            JSON.parse(
                localStorage.getItem(
                    "sentir_diario_historial"
                )
            ) || [];


        /* AGREGAR NUEVO REGISTRO */

        history.unshift(entry);


        /* GUARDAR */

        localStorage.setItem(
            "sentir_diario_historial",
            JSON.stringify(history)
        );


        showToast(
            "Tu registro fue guardado correctamente.",
            "✓"
        );


        /* LIMPIAR CAMPOS */

        diaryText.value = "";


        if (
            document.getElementById("question1")
        ) {

            document.getElementById(
                "question1"
            ).value = "";

        }


        if (
            document.getElementById("question2")
        ) {

            document.getElementById(
                "question2"
            ).value = "";

        }


        if (
            document.getElementById("question3")
        ) {

            document.getElementById(
                "question3"
            ).value = "";

        }


        wordCounter.textContent =
            "0 palabras";


        renderHistory();

    }
);


/* =========================================================
   MOSTRAR HISTORIAL
========================================================= */

function renderHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "sentir_diario_historial"
            )
        ) || [];


    historyGrid.innerHTML = "";


    /* HISTORIAL VACÍO */

    if (history.length === 0) {

        historyGrid.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Tu historia comienza aquí
                </h3>

                <p>
                    Cuando guardes tu primer registro aparecerá en este espacio.
                </p>

            </div>

        `;

        return;

    }


    /* CREAR TARJETAS */

    history.forEach(entry => {

        const card =
            document.createElement("article");


        card.className =
            "history-card";


        let description =
            entry.diary;


        if (!description) {

            description =
                "Registro emocional guardado.";

        }


        if (description.length > 150) {

            description =
                description.substring(
                    0,
                    150
                ) + "...";

        }


        card.innerHTML = `

            <div class="history-card-top">

                <span class="history-emotion">
                    ${entry.emotion}
                </span>

                <span class="history-intensity">
                    Intensidad ${entry.intensity}/10
                </span>

            </div>

            <p>
                ${description}
            </p>

            <span class="history-date">
                ${entry.date}
            </span>

        `;


        historyGrid.appendChild(card);

    });

}


renderHistory();


/* =========================================================
   LIMPIAR HISTORIAL
========================================================= */

const clearHistoryBtn =
    document.getElementById(
        "clearHistoryBtn"
    );


clearHistoryBtn.addEventListener(
    "click",
    () => {

        const confirmation =
            confirm(
                "¿Estás seguro de que deseas eliminar todo tu historial emocional?"
            );


        if (!confirmation) return;


        localStorage.removeItem(
            "sentir_diario_historial"
        );


        renderHistory();


        showToast(
            "El historial fue eliminado.",
            "✓"
        );

    }
);

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       PERFIL DROPDOWN (PROTEGIDO)
    ========================================================= */
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    if (profileButton && profileDropdown) {
        profileButton.addEventListener("click", (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle("show");
        });

        document.addEventListener("click", () => {
            profileDropdown.classList.remove("show");
        });

        profileDropdown.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }
});



/* =========================================================
   NOTIFICACIONES
========================================================= */

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );


notificationBtn.addEventListener(
    "click",
    () => {

        showToast(
            "No tienes nuevas notificaciones.",
            "♥"
        );

    }
);
//SIBERBAR JS
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuItems = document.querySelectorAll(".menu-item");

    // Función para abrir/cerrar el sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("active");
    }

    // Función para cerrar el sidebar
    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    // Evento del botón de hamburguesa
    if (mobileMenu) {
        mobileMenu.addEventListener("click", toggleSidebar);
    }

    // Evento al hacer clic en el fondo oscuro
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    // Cerrar sidebar al hacer clic en una opción (en dispositivos móviles)
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    /* ================= MENU RESPONSIVE ================= */
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    function openSidebar() {
        if (sidebar) sidebar.classList.add("open");
        if (sidebarOverlay) sidebarOverlay.classList.add("active");
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    }

    if (menuToggle) menuToggle.addEventListener("click", openSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

    /* ================= CERRAR SESIÓN ================= */
    const logoutButton = document.getElementById("logoutButton");
    const logoutSidebar = document.getElementById("logoutSidebar");
    const logoutModal = document.getElementById("logoutModal");
    const cancelLogout = document.getElementById("cancelLogout");
    const confirmLogout = document.getElementById("confirmLogout");

    function openLogoutModal() {
        if (logoutModal) logoutModal.classList.add("show");
        closeSidebar(); // Cierra el menú en móviles si está abierto
    }

    function closeLogoutModal() {
        if (logoutModal) logoutModal.classList.remove("show");
    }

    if (logoutButton) logoutButton.addEventListener("click", openLogoutModal);
    if (logoutSidebar) logoutSidebar.addEventListener("click", openLogoutModal);
    if (cancelLogout) cancelLogout.addEventListener("click", closeLogoutModal);

    // Cerrar al hacer clic fuera de la tarjeta blanca
    if (logoutModal) {
        logoutModal.addEventListener("click", (e) => {
            if (e.target === logoutModal) closeLogoutModal();
        });
    }

    // Confirmar cierre de sesión
    if (confirmLogout) {
        confirmLogout.addEventListener("click", () => {
            localStorage.removeItem("sentir_usuario");

            if (typeof showToast === "function") {
                showToast("Sesión cerrada correctamente.", "✓");
            }

            setTimeout(() => {
                window.location.href = "/Sentir/Client/index.html";
            }, 800);
        });
    }
});
/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById(
        "toast"
    );


const toastMessage =
    document.getElementById(
        "toastMessage"
    );


const toastIcon =
    document.getElementById(
        "toastIcon"
    );


let toastTimeout;


function showToast(
    message,
    icon = "✓"
) {

    toastMessage.textContent =
        message;


    toastIcon.textContent =
        icon;


    toast.classList.add("show");


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);

}

