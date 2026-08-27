/* =========================================================
   SENTIR — DIARIO EMOCIONAL
   ========================================================= */


/* =========================================================
   VARIABLES
   ========================================================= */

const STORAGE_CLAVE = "sentir_diario_clave";
const STORAGE_ENTRADAS = "sentir_diario_entradas";

let emocionSeleccionada = null;
let entradaSeleccionada = null;


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    verificarEstadoInicial();

    configurarIntensidad();

    configurarContador();

    configurarBuscador();

    mostrarFechaActual();

});


/* =========================================================
   VERIFICAR SI YA EXISTE UNA CLAVE
   ========================================================= */

function verificarEstadoInicial() {

    const claveGuardada =
        localStorage.getItem(STORAGE_CLAVE);

    const crearBox =
        document.getElementById("crearClaveBox");

    const ingresarBox =
        document.getElementById("ingresarClaveBox");

    const titulo =
        document.getElementById("tituloAcceso");

    const texto =
        document.getElementById("textoAcceso");


    if (claveGuardada) {

        crearBox.classList.add("hidden");

        ingresarBox.classList.remove("hidden");

        titulo.textContent =
            "Bienvenido/a a tu diario";

        texto.textContent =
            "Ingresa tu clave para acceder a tu espacio personal.";

    } else {

        crearBox.classList.remove("hidden");

        ingresarBox.classList.add("hidden");

        titulo.textContent =
            "Tu diario es privado";

        texto.textContent =
            "Crea una clave personal para proteger este espacio.";

    }
}


/* =========================================================
   CREAR CLAVE
   ========================================================= */

function crearClave() {

    const input =
        document.getElementById("nuevaClave");

    const clave =
        input.value.trim();


    if (clave.length < 4) {

        mostrarMensajeAcceso(
            "La clave debe tener al menos 4 caracteres.",
            "error"
        );

        return;
    }


    localStorage.setItem(
        STORAGE_CLAVE,
        clave
    );


    mostrarMensajeAcceso(
        "Clave creada correctamente 💜",
        "success"
    );


    setTimeout(() => {

        abrirDiario();

    }, 700);
}


/* =========================================================
   VERIFICAR CLAVE
   ========================================================= */

function verificarClave() {

    const input =
        document.getElementById("claveIngreso");

    const claveIngresada =
        input.value.trim();

    const claveGuardada =
        localStorage.getItem(STORAGE_CLAVE);


    if (!claveIngresada) {

        mostrarMensajeAcceso(
            "Escribe tu clave para continuar.",
            "error"
        );

        return;
    }


    if (claveIngresada === claveGuardada) {

        mostrarMensajeAcceso(
            "Acceso correcto 💜",
            "success"
        );

        setTimeout(() => {

            abrirDiario();

        }, 500);

    } else {

        mostrarMensajeAcceso(
            "La clave no coincide. Inténtalo nuevamente.",
            "error"
        );

        input.value = "";

        input.focus();
    }
}


/* =========================================================
   ABRIR DIARIO
   ========================================================= */

function abrirDiario() {

    const pantallaAcceso =
        document.getElementById("pantallaAcceso");

    const diarioApp =
        document.getElementById("diarioApp");


    pantallaAcceso.classList.add("hidden");

    diarioApp.classList.remove("hidden");


    cargarEntradas();

    actualizarEstadisticas();

    mostrarFechaActual();

}


/* =========================================================
   BLOQUEAR DIARIO
   ========================================================= */

function bloquearDiario() {

    const diarioApp =
        document.getElementById("diarioApp");

    const pantallaAcceso =
        document.getElementById("pantallaAcceso");


    diarioApp.classList.add("hidden");

    pantallaAcceso.classList.remove("hidden");


    document.getElementById("claveIngreso").value = "";

    limpiarEntrada();

    verificarEstadoInicial();

}


/* =========================================================
   CAMBIAR CLAVE
   ========================================================= */

function cambiarClave() {

    const confirmar =
        confirm(
            "¿Quieres cambiar la clave del diario?"
        );


    if (!confirmar) {
        return;
    }


    localStorage.removeItem(STORAGE_CLAVE);

    verificarEstadoInicial();

    mostrarMensajeAcceso(
        "Puedes crear una nueva clave.",
        "success"
    );
}


/* =========================================================
   MOSTRAR / OCULTAR CLAVE
   ========================================================= */

function mostrarClave(id, boton) {

    const input =
        document.getElementById(id);


    if (input.type === "password") {

        input.type = "text";

        boton.textContent = "🙈";

    } else {

        input.type = "password";

        boton.textContent = "👁";

    }
}


/* =========================================================
   MENSAJES DE ACCESO
   ========================================================= */

function mostrarMensajeAcceso(texto, tipo) {

    const mensaje =
        document.getElementById("mensajeAcceso");


    mensaje.textContent = texto;


    if (tipo === "error") {

        mensaje.style.color = "#D94B59";

    } else {

        mensaje.style.color = "#5B42D8";

    }
}


/* =========================================================
   EMOCIONES
   ========================================================= */

function seleccionarEmocion(elemento) {

    document
        .querySelectorAll(".emotion-option")
        .forEach(boton => {

            boton.classList.remove("selected");

        });


    elemento.classList.add("selected");


    emocionSeleccionada =
        elemento.dataset.emotion;
}


/* =========================================================
   INTENSIDAD
   ========================================================= */

function configurarIntensidad() {

    const slider =
        document.getElementById("intensidad");

    const valor =
        document.getElementById("valorIntensidad");


    if (!slider) return;


    slider.addEventListener("input", () => {

        valor.textContent =
            `${slider.value}/10`;

    });
}


/* =========================================================
   CONTADOR DE CARACTERES
   ========================================================= */

function configurarContador() {

    const textarea =
        document.getElementById("textoDiario");

    const contador =
        document.getElementById("contadorCaracteres");


    if (!textarea) return;


    textarea.addEventListener("input", () => {

        contador.textContent =
            textarea.value.length;

    });
}


/* =========================================================
   GUARDAR ENTRADA
   ========================================================= */

function guardarEntrada() {

    const texto =
        document
            .getElementById("textoDiario")
            .value
            .trim();


    const intensidad =
        document
            .getElementById("intensidad")
            .value;


    if (!emocionSeleccionada) {

        mostrarMensajeEntrada(
            "Selecciona cómo te sientes antes de guardar.",
            "error"
        );

        return;
    }


    if (!texto) {

        mostrarMensajeEntrada(
            "Escribe algo en tu diario antes de guardar.",
            "error"
        );

        return;
    }


    const nuevaEntrada = {

        id:
            Date.now(),

        emocion:
            emocionSeleccionada,

        intensidad:
            Number(intensidad),

        texto:
            texto,

        fecha:
            new Date().toISOString(),

        fechaLocal:
            obtenerFechaFormateada()

    };


    const entradas =
        obtenerEntradas();


    entradas.unshift(nuevaEntrada);


    localStorage.setItem(
        STORAGE_ENTRADAS,
        JSON.stringify(entradas)
    );


    mostrarMensajeEntrada(
        "Tu entrada fue guardada 💜",
        "success"
    );


    limpiarEntrada();


    cargarEntradas();

    actualizarEstadisticas();

}


/* =========================================================
   OBTENER ENTRADAS
   ========================================================= */

function obtenerEntradas() {

    const datos =
        localStorage.getItem(
            STORAGE_ENTRADAS
        );


    if (!datos) {

        return [];

    }


    try {

        return JSON.parse(datos);

    } catch (error) {

        return [];

    }
}


/* =========================================================
   CARGAR HISTORIAL
   ========================================================= */

function cargarEntradas(filtro = "") {

    const lista =
        document.getElementById("listaHistorial");

    const contador =
        document.getElementById("contadorHistorial");


    let entradas =
        obtenerEntradas();


    if (filtro.trim()) {

        const textoFiltro =
            filtro.toLowerCase();


        entradas =
            entradas.filter(entrada =>

                entrada.emocion
                    .toLowerCase()
                    .includes(textoFiltro)

                ||

                entrada.texto
                    .toLowerCase()
                    .includes(textoFiltro)

            );
    }


    contador.textContent =
        entradas.length;


    if (entradas.length === 0) {

        lista.innerHTML = `

            <div class="empty-history">

                <div>📖</div>

                <h3>
                    No encontramos entradas
                </h3>

                <p>
                    Prueba con otra búsqueda.
                </p>

            </div>

        `;

        return;
    }


    lista.innerHTML = "";


    entradas.forEach(entrada => {

        const elemento =
            document.createElement("article");


        elemento.className =
            "history-item";


        elemento.onclick = () => {

            abrirDetalle(entrada.id);

        };


        const emoji =
            obtenerEmoji(entrada.emocion);


        elemento.innerHTML = `

            <div class="history-item-top">

                <div class="history-emotion">

                    <span>
                        ${emoji}
                    </span>

                    <span>
                        ${entrada.emocion}
                    </span>

                </div>

                <span class="history-date">
                    ${entrada.fechaLocal}
                </span>

            </div>

            <p class="history-preview">
                ${escaparHTML(
                    entrada.texto
                )}
            </p>

        `;


        lista.appendChild(elemento);

    });
}


/* =========================================================
   BUSCADOR
   ========================================================= */

function configurarBuscador() {

    const buscador =
        document.getElementById("buscador");


    if (!buscador) return;


    buscador.addEventListener(
        "input",
        () => {

            cargarEntradas(
                buscador.value
            );

        }
    );
}


/* =========================================================
   ABRIR DETALLE
   ========================================================= */

function abrirDetalle(id) {

    const entradas =
        obtenerEntradas();


    const entrada =
        entradas.find(
            item => item.id === id
        );


    if (!entrada) return;


    entradaSeleccionada =
        id;


    const detalle =
        document.getElementById(
            "detalleEntrada"
        );


    const emoji =
        obtenerEmoji(
            entrada.emocion
        );


    detalle.innerHTML = `

        <div class="detail-header">

            <div class="detail-emotion">
                ${emoji}
            </div>

            <div class="detail-info">

                <h2>
                    ${entrada.emocion}
                </h2>

                <p>
                    ${entrada.fechaLocal}
                    · Intensidad ${entrada.intensidad}/10
                </p>

            </div>

        </div>

        <div class="detail-text">
            ${escaparHTML(entrada.texto)}
        </div>

        <button
            class="delete-entry"
            onclick="eliminarEntrada()"
        >
            🗑️ Eliminar esta entrada
        </button>

    `;


    document
        .getElementById("modalEntrada")
        .classList.remove("hidden");
}


/* =========================================================
   CERRAR MODAL
   ========================================================= */

function cerrarModal() {

    document
        .getElementById("modalEntrada")
        .classList.add("hidden");

    entradaSeleccionada = null;
}


/* =========================================================
   ELIMINAR ENTRADA
   ========================================================= */

function eliminarEntrada() {

    if (!entradaSeleccionada) {
        return;
    }


    const confirmar =
        confirm(
            "¿Quieres eliminar esta entrada? Esta acción no se puede deshacer."
        );


    if (!confirmar) {
        return;
    }


    let entradas =
        obtenerEntradas();


    entradas =
        entradas.filter(
            entrada =>
                entrada.id !== entradaSeleccionada
        );


    localStorage.setItem(
        STORAGE_ENTRADAS,
        JSON.stringify(entradas)
    );


    cerrarModal();

    cargarEntradas();

    actualizarEstadisticas();

}


/* =========================================================
   LIMPIAR FORMULARIO
   ========================================================= */

function limpiarEntrada() {

    emocionSeleccionada = null;


    document
        .querySelectorAll(".emotion-option")
        .forEach(boton => {

            boton.classList.remove(
                "selected"
            );

        });


    document
        .getElementById("textoDiario")
        .value = "";


    document
        .getElementById("intensidad")
        .value = 5;


    document
        .getElementById("valorIntensidad")
        .textContent = "5/10";


    document
        .getElementById("contadorCaracteres")
        .textContent = "0";

}


/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function actualizarEstadisticas() {

    const entradas =
        obtenerEntradas();


    document
        .getElementById("totalEntradas")
        .textContent =
            entradas.length;


    if (entradas.length === 0) {

        document
            .getElementById("emocionFrecuente")
            .textContent = "—";

        document
            .getElementById("ultimaEntrada")
            .textContent = "—";

        return;
    }


    /* Emoción más frecuente */

    const contadorEmociones = {};


    entradas.forEach(entrada => {

        contadorEmociones[
            entrada.emocion
        ] =
            (contadorEmociones[
                entrada.emocion
            ] || 0) + 1;

    });


    let emocionMayor =
        null;

    let cantidadMayor =
        0;


    Object.entries(
        contadorEmociones
    ).forEach(
        ([emocion, cantidad]) => {

            if (cantidad > cantidadMayor) {

                emocionMayor =
                    emocion;

                cantidadMayor =
                    cantidad;

            }

        }
    );


    document
        .getElementById("emocionFrecuente")
        .textContent =
            emocionMayor;


    /* Última entrada */

    document
        .getElementById("ultimaEntrada")
        .textContent =
            entradas[0].fechaLocal;
}


/* =========================================================
   FECHA ACTUAL
   ========================================================= */

function mostrarFechaActual() {

    const elemento =
        document.getElementById(
            "fechaActual"
        );


    if (!elemento) return;


    const fecha =
        new Date();


    elemento.textContent =
        fecha.toLocaleDateString(
            "es-CO",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );
}


/* =========================================================
   FECHA PARA LAS ENTRADAS
   ========================================================= */

function obtenerFechaFormateada() {

    const fecha =
        new Date();


    return fecha.toLocaleDateString(
        "es-CO",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   EMOJIS
   ========================================================= */

function obtenerEmoji(emocion) {

    const emojis = {

        "Muy bien": "😊",

        "Bien": "🙂",

        "Regular": "😐",

        "Mal": "🙁",

        "Muy mal": "😞"

    };


    return emojis[emocion] || "💜";
}


/* =========================================================
   ESCAPAR HTML
   Evita que el texto escrito por el usuario
   se interprete como código HTML.
   ========================================================= */

function escaparHTML(texto) {

    const div =
        document.createElement("div");


    div.textContent = texto;


    return div.innerHTML;
}


/* =========================================================
   MENSAJES DE ENTRADA
   ========================================================= */

function mostrarMensajeEntrada(
    texto,
    tipo
) {

    const mensaje =
        document.getElementById(
            "mensajeEntrada"
        );


    mensaje.textContent =
        texto;


    if (tipo === "error") {

        mensaje.style.color =
            "#D94B59";

    } else {

        mensaje.style.color =
            "#5B42D8";

    }


    setTimeout(() => {

        mensaje.textContent = "";

    }, 3500);
}

document.querySelectorAll('.emotion-option').forEach(card => {
  card.addEventListener('click', () => {
    // Quita la selección de todas las cajas
    document.querySelectorAll('.emotion-option').forEach(c => c.classList.remove('selected'));
    
    // Agrega la selección a la caja clickeada
    card.classList.add('selected');
    
    // Marca el radio button interno
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// Se ejecuta apenas carga la página del diario
document.addEventListener('DOMContentLoaded', () => {
  const emocionGuardada = localStorage.getItem('emocionPendiente');

  if (emocionGuardada) {
    // Buscamos la opción en el diario que coincide con la guardada
    const opcionACambiar = document.querySelector(`.emotion-option[data-emotion="${emocionGuardada}"]`);

    if (opcionACambiar) {
      // 1. Quitamos la selección de cualquier otra opción
      document.querySelectorAll('.emotion-option').forEach(c => c.classList.remove('selected'));

      // 2. Seleccionamos la opción correspondiente
      opcionACambiar.classList.add('selected');

      // 3. Marcamos el radio button interno
      const radio = opcionACambiar.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }

    // Limpiamos la memoria para que no vuelva a auto-marcarse al recargar en el futuro
    localStorage.removeItem('emocionPendiente');
  }
});