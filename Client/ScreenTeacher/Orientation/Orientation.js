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
   ORIENTACIÓN CON IA (Sentir IA para docentes)

   El mensaje se envía al servidor, que consulta la IA con
   instrucciones de orientación escolar para docentes.
   La conversación NO se guarda en la base de datos: solo vive
   en esta pestaña (sessionStorage) mientras la sesión está abierta.
========================================================= */

const ORIENTACION_API =
    "http://localhost:3001/api/Docente/orientacion";

const ORIENTACION_KEY =
    "sentirOrientacionDocente";

let orientacionHistorial = [];


function sesionDocente() {

    try {
        return JSON.parse(sessionStorage.getItem("usuarioSentir") || "{}");
    } catch (error) {
        return {};
    }

}


function guardarHistorial() {

    try {
        sessionStorage.setItem(
            ORIENTACION_KEY,
            JSON.stringify({
                usuario: sesionDocente().id_usuario,
                historial: orientacionHistorial.slice(-30)
            })
        );
    } catch (error) {
        /* sin almacenamiento: la conversación solo dura en la página */
    }

}


/* Texto de la IA -> HTML seguro (párrafos, listas y **negritas**) */
function formatearRespuesta(texto) {

    const bloques = [];
    let lista = null;

    String(texto || "").split(/\n/).forEach(function (linea) {

        const limpia = linea.trim();

        if (!limpia) {
            lista = null;
            return;
        }

        const esLista = /^([-*•]|\d+[.)])\s+/.test(limpia);
        const contenido = escapeHTML(limpia.replace(/^([-*•]|\d+[.)])\s+/, ""))
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");

        if (esLista) {
            if (!lista) {
                lista = [];
                bloques.push(lista);
            }
            lista.push(contenido);
        } else {
            lista = null;
            bloques.push("<p>" + contenido + "</p>");
        }

    });

    return bloques.map(function (bloque) {
        return Array.isArray(bloque)
            ? "<ul>" + bloque.map(function (item) { return "<li>" + item + "</li>"; }).join("") + "</ul>"
            : bloque;
    }).join("");

}


function avisoDeAlerta() {

    return `
        <div class="orientation-alert-tip">
            <strong>Esta situación puede requerir atención prioritaria.</strong>
            <span>No la manejes solo/a: envía una alerta para que psicología y orientación la revisen.</span>
            <a href="/Client/ScreenTeacher/MyStudents/MyStudents.html">Enviar alerta desde Mis estudiantes</a>
        </div>`;

}


function mostrarRespuesta(entrada) {

    addAssistantMessage(
        formatearRespuesta(entrada.texto) +
        (entrada.sugerirAlerta ? avisoDeAlerta() : "")
    );

}


function simulateAssistantResponse(
    userMessage
) {

    orientacionHistorial.push({ rol: "docente", texto: userMessage });
    guardarHistorial();

    showTypingIndicator();

    if (chatInput) chatInput.disabled = true;


    fetch(ORIENTACION_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (sesionDocente().token || "")
        },
        body: JSON.stringify({
            mensajes: orientacionHistorial.slice(-12)
        })
    })
        .then(async function (response) {

            const data =
                await response.json().catch(function () { return {}; });

            if (response.status === 401) {
                window.location.replace("/Client/administrativo.html");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "No se pudo obtener una respuesta.");
            }

            const entrada = {
                rol: "asistente",
                texto: data.respuesta,
                sugerirAlerta: Boolean(data.sugerirAlerta)
            };

            orientacionHistorial.push(entrada);
            guardarHistorial();

            removeTypingIndicator();
            mostrarRespuesta(entrada);

        })
        .catch(function (error) {

            removeTypingIndicator();

            addAssistantMessage(
                "<p>" + escapeHTML(
                    error.message === "Failed to fetch"
                        ? "No se pudo conectar con el servidor. Inténtalo de nuevo en un momento."
                        : error.message
                ) + "</p>"
            );

            // El mensaje que no tuvo respuesta no se reenvía como contexto
            orientacionHistorial.pop();
            guardarHistorial();

        })
        .finally(function () {

            if (chatInput) {
                chatInput.disabled = false;
                chatInput.focus();
            }

        });

}


/* Saludo con el nombre del docente y conversación anterior de esta sesión */
(function iniciarOrientacion() {

    const sesion = sesionDocente();
    const nombre = String(sesion.nombre || "").trim().split(/\s+/)[0] || "";
    const saludo = document.getElementById("orientationGreeting");

    if (saludo) {
        saludo.textContent = nombre
            ? "¡Hola, " + nombre.charAt(0).toLocaleUpperCase("es") + nombre.slice(1).toLocaleLowerCase("es") + "!"
            : "¡Hola!";
    }

    const primeraHora = document.querySelector("#chatMessages .message-time");
    if (primeraHora) primeraHora.textContent = getCurrentTime();

    try {
        const guardado = JSON.parse(sessionStorage.getItem(ORIENTACION_KEY) || "null");

        if (guardado && guardado.usuario === sesion.id_usuario && Array.isArray(guardado.historial)) {
            orientacionHistorial = guardado.historial;
            orientacionHistorial.forEach(function (entrada) {
                if (entrada.rol === "asistente") mostrarRespuesta(entrada);
                else addUserMessage(entrada.texto);
            });
        }
    } catch (error) {
        orientacionHistorial = [];
    }

})();



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