/* =========================================================
   SENTIR
   ORIENTACIÓN DOCENTE
========================================================= */


/* =========================================================
   SIDEBAR RESPONSIVE

   NOTA:
   Inicio, Mis estudiantes, Orientación y Mi perfil
   NO TIENEN navegación configurada aquí.
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



            /* =============================================
               VALIDAR FORMATO
            ============================================== */

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



            /* =============================================
               BORRAR URL TEMPORAL ANTERIOR
            ============================================== */

            if (currentProfilePhotoURL) {

                URL.revokeObjectURL(
                    currentProfilePhotoURL
                );

            }



            /* =============================================
               CREAR PREVISUALIZACIÓN
            ============================================== */

            currentProfilePhotoURL =
                URL.createObjectURL(
                    file
                );


            profilePhoto.src =
                currentProfilePhotoURL;


            profilePhoto.classList.add(
                "has-photo"
            );


            profilePlaceholder.classList.add(
                "hidden"
            );


            /*
                Más adelante este archivo
                se debe enviar al backend.
            */

            console.log(
                "Foto seleccionada:",
                file
            );

        }
    );

}



/* =========================================================
   CHAT
========================================================= */


const chatForm =
    document.getElementById(
        "chatForm"
    );


const chatInput =
    document.getElementById(
        "chatInput"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


const quickPrompts =
    document.querySelectorAll(
        ".quick-prompt"
    );



/* =========================================================
   HORA ACTUAL
========================================================= */

function getCurrentTime() {

    const now =
        new Date();


    return now.toLocaleTimeString(
        "es-CO",
        {

            hour:
                "numeric",

            minute:
                "2-digit"

        }
    );

}



/* =========================================================
   EVITAR HTML INYECTADO
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}



/* =========================================================
   MENSAJE DEL DOCENTE
========================================================= */

function addUserMessage(text) {


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row user-row";


    row.innerHTML = `

        <div class="message-wrapper">

            <div class="message user-message">

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>

            <div class="user-message-info">

                <span class="message-time">
                    ${getCurrentTime()}
                </span>

                <span class="message-check">

                    <svg viewBox="0 0 24 24">

                        <path
                            d="M3 12l4 4L15 8"
                        />

                        <path
                            d="M9 15l2 2L21 7"
                        />

                    </svg>

                </span>

            </div>

        </div>

    `;


    chatMessages.appendChild(
        row
    );


    scrollChatToBottom();

}



/* =========================================================
   INDICADOR ESCRIBIENDO
========================================================= */

function showTypingIndicator() {


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row assistant-row";


    row.id =
        "typingIndicator";


    row.innerHTML = `

        <div class="message-avatar">

            <svg viewBox="0 0 24 24">

                <rect
                    x="4"
                    y="7"
                    width="16"
                    height="12"
                    rx="4"
                />

                <circle
                    cx="9"
                    cy="13"
                    r="1"
                />

                <circle
                    cx="15"
                    cy="13"
                    r="1"
                />

                <path
                    d="M9 16h6"
                />

                <path
                    d="M12 7V4"
                />

            </svg>

        </div>

        <div class="message assistant-message typing-message">

            <span class="typing-dot"></span>

            <span class="typing-dot"></span>

            <span class="typing-dot"></span>

        </div>

    `;


    chatMessages.appendChild(
        row
    );


    scrollChatToBottom();

}



/* =========================================================
   QUITAR ESCRIBIENDO
========================================================= */

function removeTypingIndicator() {


    const indicator =
        document.getElementById(
            "typingIndicator"
        );


    if (indicator) {

        indicator.remove();

    }

}



/* =========================================================
   RESPUESTA DEL ASISTENTE
========================================================= */

function addAssistantMessage(html) {


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row assistant-row";


    row.innerHTML = `

        <div class="message-avatar">

            <svg viewBox="0 0 24 24">

                <rect
                    x="4"
                    y="7"
                    width="16"
                    height="12"
                    rx="4"
                />

                <circle
                    cx="9"
                    cy="13"
                    r="1"
                />

                <circle
                    cx="15"
                    cy="13"
                    r="1"
                />

                <path
                    d="M9 16h6"
                />

                <path
                    d="M12 7V4"
                />

            </svg>

        </div>


        <div class="message-wrapper">

            <div class="message assistant-message">

                ${html}

            </div>

            <span class="message-time">

                ${getCurrentTime()}

            </span>

        </div>

    `;


    chatMessages.appendChild(
        row
    );


    scrollChatToBottom();

}



/* =========================================================
   RESPUESTAS TEMPORALES

   ESTO DESPUÉS SE REEMPLAZARÁ POR LA IA.
========================================================= */

function getTemporaryAssistantResponse(
    message
) {


    const normalized =
        message
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );



    /* =====================================================
       AISLAMIENTO
    ====================================================== */

    if (
        normalized.includes("aislad") ||
        normalized.includes("callad") ||
        normalized.includes("solo")
    ) {

        return `

            <p>
                Si notas que un estudiante está más
                aislado o callado de lo habitual,
                puedes comenzar observando el cambio
                con calma.
            </p>

            <ul>

                <li>
                    Busca un momento tranquilo para hablar.
                </li>

                <li>
                    Pregunta de manera abierta cómo se siente.
                </li>

                <li>
                    Evita presionarlo para que explique algo.
                </li>

                <li>
                    Observa si el comportamiento continúa.
                </li>

            </ul>

            <p>
                Si la situación persiste o consideras
                que debe ser conocida por el equipo
                responsable, puedes enviar una alerta
                desde <strong>Mis estudiantes</strong>.
            </p>

        `;

    }



    /* =====================================================
       CONVIVENCIA
    ====================================================== */

    if (
        normalized.includes("conflicto") ||
        normalized.includes("pelea") ||
        normalized.includes("convivencia")
    ) {

        return `

            <p>
                Ante un conflicto entre estudiantes,
                intenta mantener una postura neutral
                y escuchar las diferentes versiones
                antes de sacar conclusiones.
            </p>

            <ul>

                <li>
                    Evita exponerlos frente al grupo.
                </li>

                <li>
                    Promueve una conversación respetuosa.
                </li>

                <li>
                    Identifica hechos concretos,
                    no suposiciones.
                </li>

                <li>
                    Si la situación requiere seguimiento
                    institucional, comunícala al área
                    correspondiente.
                </li>

            </ul>

        `;

    }



    /* =====================================================
       ESCUCHA
    ====================================================== */

    if (
        normalized.includes("escuchar") ||
        normalized.includes("escucha")
    ) {

        return `

            <p>
                La escucha activa puede ayudar a que
                un estudiante se sienta tomado en cuenta.
            </p>

            <ul>

                <li>
                    Mantén contacto visual sin intimidar.
                </li>

                <li>
                    Evita interrumpir mientras habla.
                </li>

                <li>
                    Usa frases como
                    “entiendo lo que me estás contando”.
                </li>

                <li>
                    No prometas guardar secretos cuando
                    pueda existir una situación que requiera
                    apoyo institucional.
                </li>

            </ul>

        `;

    }



    /* =====================================================
       ÁNIMO
    ====================================================== */

    if (
        normalized.includes("triste") ||
        normalized.includes("animo") ||
        normalized.includes("llora")
    ) {

        return `

            <p>
                Si observas un cambio importante en
                el estado de ánimo de un estudiante,
                procura acercarte desde la empatía.
            </p>

            <ul>

                <li>
                    Pregunta si desea hablar.
                </li>

                <li>
                    Escucha sin minimizar lo que siente.
                </li>

                <li>
                    Observa si el cambio se mantiene.
                </li>

                <li>
                    Si consideras necesaria una revisión,
                    registra una alerta para el equipo
                    correspondiente.
                </li>

            </ul>

            <p>
                El docente acompaña y comunica;
                la valoración e intervención corresponde
                a las áreas autorizadas.
            </p>

        `;

    }



    /* =====================================================
       RESPUESTA GENERAL
    ====================================================== */

    return `

        <p>
            Gracias por contarme la situación.
        </p>

        <p>
            Como orientación general, puedes comenzar
            observando qué ocurrió, cuándo empezó y
            si el comportamiento se ha repetido.
        </p>

        <ul>

            <li>
                Acércate al estudiante de manera tranquila.
            </li>

            <li>
                Escucha sin juzgar ni presionar.
            </li>

            <li>
                Evita interpretar o diagnosticar
                lo que puede estar ocurriendo.
            </li>

            <li>
                Si notas que la situación requiere
                atención institucional, utiliza
                <strong>Mis estudiantes</strong>
                para enviar una alerta.
            </li>

        </ul>

        <p>
            Si quieres, puedes contarme con más detalle
            qué observaste y te daré algunas ideas
            generales.
        </p>

    `;

}



/* =========================================================
   SIMULACIÓN DEL ASISTENTE
========================================================= */

function simulateAssistantResponse(
    userMessage
) {


    showTypingIndicator();


    /*
        Este setTimeout únicamente simula
        el tiempo de respuesta.

        Cuando conecten IA,
        aquí se reemplaza por fetch().
    */

    setTimeout(
        function () {


            removeTypingIndicator();


            const response =
                getTemporaryAssistantResponse(
                    userMessage
                );


            addAssistantMessage(
                response
            );


        },
        900
    );

}



/* =========================================================
   ENVIAR MENSAJE
========================================================= */

function sendChatMessage(
    message
) {


    const cleanMessage =
        message.trim();


    if (!cleanMessage) {

        return;

    }


    addUserMessage(
        cleanMessage
    );


    chatInput.value =
        "";


    autoResizeTextarea();


    simulateAssistantResponse(
        cleanMessage
    );

}



/* =========================================================
   FORMULARIO CHAT
========================================================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            sendChatMessage(
                chatInput.value
            );

        }
    );

}



/* =========================================================
   ENTER PARA ENVIAR

   SHIFT + ENTER = SALTO DE LÍNEA
========================================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        function (event) {


            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();


                sendChatMessage(
                    chatInput.value
                );

            }

        }
    );

}



/* =========================================================
   AUTORRESIZE TEXTAREA
========================================================= */

function autoResizeTextarea() {


    if (!chatInput) {

        return;

    }


    chatInput.style.height =
        "auto";


    chatInput.style.height =
        Math.min(
            chatInput.scrollHeight,
            120
        ) + "px";

}


if (chatInput) {

    chatInput.addEventListener(
        "input",
        autoResizeTextarea
    );

}



/* =========================================================
   RESPUESTAS RÁPIDAS
========================================================= */

quickPrompts.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {


                const message =
                    button.dataset.message;


                sendChatMessage(
                    message
                );

            }
        );

    }
);



/* =========================================================
   BAJAR CHAT
========================================================= */

function scrollChatToBottom() {


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}



/* =========================================================
   AJUSTE AL CAMBIAR TAMAÑO
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
   POSICIÓN INICIAL DEL CHAT
========================================================= */

window.addEventListener(
    "load",
    function () {

        scrollChatToBottom();

    }
);