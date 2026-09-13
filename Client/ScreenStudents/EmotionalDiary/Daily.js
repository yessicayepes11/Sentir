/* =========================================================
   SENTIR
   DIARIO EMOCIONAL
========================================================= */


/* =========================================================
   ESTADO DEL FORMULARIO
========================================================= */

let selectedEmotion = null;

let intensityWasSelected = false;


/*
    Los emojis tienen valores del 1 al 5
    exactamente de acuerdo con los módulos
    proporcionados:

    1 = Angry
    2 = Sad
    3 = OK
    4 = Good
    5 = Happy
*/

const emotionNames = {

    1: "Muy mal",
    2: "Mal",
    3: "Normal",
    4: "Feliz",
    5: "Muy feliz"

};



/* =========================================================
   IMPORTANTE:
   QUITAR LA SELECCIÓN INICIAL
========================================================= */

/*
    El componente GOOD entregado originalmente
    incluye checked="".

    No modificamos el componente visual.

    Sin embargo, para cumplir la regla funcional
    de SENTIR, el estudiante debe seleccionar
    conscientemente una emoción antes de guardar.

    Por eso se limpia cualquier radio al iniciar.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(
                'input[name="feedback"]'
            )
            .forEach(input => {

                input.checked = false;

            });


        renderHistory();

        updateRangeAppearance();

    }
);



/* =========================================================
   SIDEBAR
========================================================= */

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


/* =========================================================
   PERFIL
========================================================= */

const profileContainer =
    document.querySelector(
        ".profile-container"
    );


const profileButton =
    document.getElementById(
        "profileButton"
    );



profileButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        const isOpen =
            profileContainer
                .classList
                .toggle(
                    "open"
                );


        profileButton.setAttribute(
            "aria-expanded",
            isOpen
                ? "true"
                : "false"
        );

    }
);



document.addEventListener(
    "click",
    event => {

        if (
            !profileContainer.contains(
                event.target
            )
        ) {

            profileContainer
                .classList
                .remove(
                    "open"
                );


            profileButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);



/* =========================================================
   SELECCIÓN DE EMOCIÓN
========================================================= */

const emotionCards =
    document.querySelectorAll(
        ".emotion-card"
    );


const selectedEmotionText =
    document.getElementById(
        "selectedEmotionText"
    );



emotionCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const value =
                Number(
                    card.dataset
                        .emotionValue
                );


            const name =
                card.dataset
                    .emotionName;


            selectedEmotion =
                value;


            /*
                Quitar selección visual
                anterior.
            */

            emotionCards.forEach(
                item => {

                    item.classList.remove(
                        "selected"
                    );

                }
            );


            /*
                Desmarcar todos los
                radios originales.
            */

            document
                .querySelectorAll(
                    'input[name="feedback"]'
                )
                .forEach(
                    input => {

                        input.checked =
                            false;

                    }
                );


            /*
                Marcar tarjeta seleccionada.
            */

            card.classList.add(
                "selected"
            );


            /*
                Activar el radio original
                del emoji para conservar
                sus animaciones.
            */

            const radio =
                card.querySelector(
                    'input[name="feedback"]'
                );


            if (radio) {

                radio.checked =
                    true;


                radio.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles: true
                        }
                    )
                );

            }


            selectedEmotionText.textContent =
                name;


            hideValidation();

        }
    );

});



/* =========================================================
   INTENSIDAD
========================================================= */

const intensityRange =
    document.getElementById(
        "intensityRange"
    );


const intensityValue =
    document.getElementById(
        "intensityValue"
    );


const intensityDescription =
    document.getElementById(
        "intensityDescription"
    );


const rangeTooltip =
    document.getElementById(
        "rangeTooltip"
    );



function getIntensityDescription(
    value
) {

    const number =
        Number(value);


    if (number <= 2) {
        return "Muy suave";
    }


    if (number <= 4) {
        return "Suave";
    }


    if (number <= 6) {
        return "Moderada";
    }


    if (number <= 8) {
        return "Fuerte";
    }


    return "Muy intensa";

}



function updateRangeAppearance() {

    const min =
        Number(
            intensityRange.min
        );


    const max =
        Number(
            intensityRange.max
        );


    const value =
        Number(
            intensityRange.value
        );


    const percentage =
        (
            (value - min) /
            (max - min)
        ) * 100;


    intensityRange.style.background =
        `
            linear-gradient(
                90deg,
                #6C4DF6 ${percentage}%,
                #E7E3F6 ${percentage}%
            )
        `;


    rangeTooltip.style.left =
        `${percentage}%`;


    rangeTooltip.textContent =
        value;

}



intensityRange.addEventListener(
    "input",
    () => {

        intensityWasSelected =
            true;


        const value =
            intensityRange.value;


        intensityValue.textContent =
            value;


        intensityDescription.textContent =
            getIntensityDescription(
                value
            );


        rangeTooltip.classList.add(
            "visible"
        );


        updateRangeAppearance();

        hideValidation();

    }
);



intensityRange.addEventListener(
    "change",
    () => {

        setTimeout(
            () => {

                rangeTooltip.classList.remove(
                    "visible"
                );

            },
            900
        );

    }
);



/* =========================================================
   PREGUNTAS GUÍA
========================================================= */

const removePromptButtons =
    document.querySelectorAll(
        ".remove-prompt"
    );



removePromptButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            event => {

                const prompt =
                    event.currentTarget
                        .closest(
                            ".prompt-chip"
                        );


                prompt.classList.add(
                    "removing"
                );


                setTimeout(
                    () => {

                        prompt.remove();

                    },
                    240
                );

            }
        );

    }
);



/* =========================================================
   TEXTAREA
========================================================= */

const diaryText =
    document.getElementById(
        "diaryText"
    );


const characterCount =
    document.getElementById(
        "characterCount"
    );


const clearTextButton =
    document.getElementById(
        "clearTextButton"
    );



diaryText.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            diaryText.value.length;


        hideValidation();

    }
);



clearTextButton.addEventListener(
    "click",
    () => {

        diaryText.value =
            "";


        characterCount.textContent =
            "0";


        diaryText.focus();

    }
);



/* =========================================================
   VALIDACIÓN
========================================================= */

const validationMessage =
    document.getElementById(
        "validationMessage"
    );


const validationText =
    document.getElementById(
        "validationText"
    );



function showValidation(
    message
) {

    validationText.textContent =
        message;


    validationMessage.classList.remove(
        "show"
    );


    /*
        Forzar reflow para repetir
        animación de error.
    */

    void validationMessage.offsetWidth;


    validationMessage.classList.add(
        "show"
    );


    validationMessage.scrollIntoView(
        {
            behavior: "smooth",
            block: "center"
        }
    );

}



function hideValidation() {

    validationMessage.classList.remove(
        "show"
    );

}



/* =========================================================
   HISTORIAL LOCAL
========================================================= */

const STORAGE_KEY =
    "sentir_diario_emocional";


function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            )
        ) || [];

    } catch {

        return [];

    }

}



function saveHistory(
    history
) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            history
        )
    );

}



/* =========================================================
   GUARDAR REGISTRO
========================================================= */

const saveEntryButton =
    document.getElementById(
        "saveEntryButton"
    );



saveEntryButton.addEventListener(
    "click",
    () => {

        const text =
            diaryText
                .value
                .trim();


        /*
            REGLA 1:
            Debe seleccionar emoción.
        */

        if (
            selectedEmotion ===
            null
        ) {

            showValidation(
                "Primero selecciona la emoción que mejor representa cómo te sientes."
            );

            return;

        }


        /*
            REGLA 2:
            Debe seleccionar conscientemente
            una intensidad.
        */

        if (
            !intensityWasSelected
        ) {

            showValidation(
                "Selecciona la intensidad de tu emoción moviendo la barra del 1 al 10."
            );

            return;

        }


        /*
            REGLA 3:
            Debe existir una descripción
            para poder guardarla en historial.
        */

        if (
            text.length === 0
        ) {

            showValidation(
                "Escribe una pequeña descripción de tu día antes de guardarla en el historial."
            );

            diaryText.focus();

            return;

        }


        const now =
            new Date();


        const entry = {

            id:
                Date.now(),

            emotion:
                selectedEmotion,

            emotionName:
                emotionNames[
                    selectedEmotion
                ],

            intensity:
                Number(
                    intensityRange.value
                ),

            description:
                text,

            date:
                now.toISOString()

        };


        const history =
            getHistory();


        history.unshift(
            entry
        );


        saveHistory(
            history
        );


        renderHistory();


        /*
            Limpiar formulario.
        */

        resetDiaryForm();


        /*
            Mostrar modal.
        */

        openModal(
            "successModal"
        );

    }
);



/* =========================================================
   RESET DEL FORMULARIO
========================================================= */

function resetDiaryForm() {

    selectedEmotion =
        null;


    intensityWasSelected =
        false;


    emotionCards.forEach(
        card => {

            card.classList.remove(
                "selected"
            );

        }
    );


    document
        .querySelectorAll(
            'input[name="feedback"]'
        )
        .forEach(
            input => {

                input.checked =
                    false;

            }
        );


    selectedEmotionText.textContent =
        "Aún no seleccionada";


    intensityRange.value =
        5;


    intensityValue.textContent =
        "—";


    intensityDescription.textContent =
        "Aún sin seleccionar";


    rangeTooltip.textContent =
        "5";


    rangeTooltip.classList.remove(
        "visible"
    );


    diaryText.value =
        "";


    characterCount.textContent =
        "0";


    updateRangeAppearance();


    hideValidation();

}



/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}



/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatDate(
    isoDate
) {

    const date =
        new Date(
            isoDate
        );


    return date.toLocaleDateString(
        "es-CO",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}



/* =========================================================
   RENDERIZAR HISTORIAL
========================================================= */

const historyList =
    document.getElementById(
        "historyList"
    );


const emptyHistory =
    document.getElementById(
        "emptyHistory"
    );


const historyCount =
    document.getElementById(
        "historyCount"
    );



function renderHistory() {

    const history =
        getHistory();


    historyCount.textContent =
        history.length;


    if (
        history.length === 0
    ) {

        historyList.innerHTML =
            "";


        emptyHistory.classList.remove(
            "hidden"
        );


        return;

    }


    emptyHistory.classList.add(
        "hidden"
    );


    historyList.innerHTML =
        history
            .map(
                entry => {

                    return `

                        <article
                            class="history-entry"
                            data-entry-id="${entry.id}"
                        >

                            <div class="history-entry-header">

                                <div class="history-emotion">

                                    <div class="history-emotion-number">
                                        ${entry.emotion}
                                    </div>


                                    <div>

                                        <strong>
                                            ${escapeHTML(entry.emotionName)}
                                        </strong>

                                        <span>
                                            Registro emocional
                                        </span>

                                    </div>

                                </div>


                                <time class="history-date">
                                    ${formatDate(entry.date)}
                                </time>

                            </div>


                            <p class="history-entry-text">
                                ${escapeHTML(entry.description)}
                            </p>


                            <div class="history-entry-footer">

                                <span class="intensity-chip">

                                    <i class="fa-solid fa-wave-square"></i>

                                    Intensidad ${entry.intensity}/10

                                </span>


                                <button
                                    type="button"
                                    class="delete-entry-button"
                                    data-delete-entry="${entry.id}"
                                    aria-label="Eliminar registro"
                                >

                                    <i class="fa-regular fa-trash-can"></i>

                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    /*
        Eventos eliminar.
    */

    document
        .querySelectorAll(
            "[data-delete-entry]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteEntry(
                            Number(
                                button.dataset
                                    .deleteEntry
                            )
                        );

                    }
                );

            }
        );

}



/* =========================================================
   ELIMINAR ENTRADA
========================================================= */

function deleteEntry(
    id
) {

    const history =
        getHistory();


    const newHistory =
        history.filter(
            item =>
                item.id !== id
        );


    saveHistory(
        newHistory
    );


    renderHistory();

}



/* =========================================================
   MODALES
========================================================= */

function openModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "no-scroll"
    );

}



function closeModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    modal.classList.remove(
        "show"
    );


    /*
        Solo quitar no-scroll si
        sidebar tampoco está abierto.
    */

    if (
        !sidebar.classList.contains(
            "open"
        )
    ) {

        document.body.classList.remove(
            "no-scroll"
        );

    }

}



document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset
                            .closeModal
                    );

                }
            );

        }
    );



document
    .querySelectorAll(
        ".modal-overlay"
    )
    .forEach(
        overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeModal(
                            overlay.id
                        );

                    }

                }
            );

        }
    );



/* =========================================================
   CERRAR SESIÓN
========================================================= */

document
    .querySelectorAll(
        ".logout-trigger"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    profileContainer
                        .classList
                        .remove(
                            "open"
                        );


                    openModal(
                        "logoutModal"
                    );

                }
            );

        }
    );



const confirmLogoutButton =
    document.getElementById(
        "confirmLogoutButton"
    );



confirmLogoutButton.addEventListener(
    "click",
    () => {

        /*
            AQUÍ CONECTAS TU CIERRE
            DE SESIÓN REAL.

            Ejemplo posteriormente:

            window.location.href =
                "login.html";

            o:

            fetch("/logout", {
                method: "POST"
            });
        */


        closeModal(
            "logoutModal"
        );


        alert(
            "Sesión cerrada correctamente."
        );

    }
);



/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeSidebar();


        profileContainer
            .classList
            .remove(
                "open"
            );


        document
            .querySelectorAll(
                ".modal-overlay.show"
            )
            .forEach(
                modal => {

                    closeModal(
                        modal.id
                    );

                }
            );

    }
);