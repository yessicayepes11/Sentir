/* =====================================================
   SENTIR
   Recuperación de Contraseña
   Desarrollado para Melissa 💜
===================================================== */

// =============================
// ELEMENTOS HTML
// =============================

const formulario = document.getElementById("formRecuperar");

const correo = document.getElementById("correo");

const mensajeError = document.getElementById("mensajeError");

const mensajeExito = document.getElementById("mensajeExito");

const loader = document.getElementById("loader");

const boton = document.querySelector(".btn-principal");

// =============================
// VALIDAR GMAIL
// =============================

function validarCorreoGoogle(email){

    const expresion = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    return expresion.test(email);

}

// =============================
// MOSTRAR ERROR
// =============================

function mostrarError(texto){

    mensajeError.textContent = texto;

    mensajeError.style.display="block";

}

// =============================
// OCULTAR ERROR
// =============================

function ocultarError(){

    mensajeError.textContent="";

}

// =============================
// MOSTRAR LOADER
// =============================

function mostrarLoader(){

    loader.classList.remove("oculto");

    boton.disabled=true;

    boton.innerHTML="Enviando...";

}

// =============================
// OCULTAR LOADER
// =============================

function ocultarLoader(){

    loader.classList.add("oculto");

    boton.disabled=false;

    boton.innerHTML=`
        <span>Enviar enlace de recuperación</span>
        <span class="flecha">→</span>
    `;

}

// =============================
// MOSTRAR ÉXITO
// =============================

function mostrarExito(){

    mensajeExito.classList.remove("oculto");

}

// =============================
// OCULTAR ÉXITO
// =============================

function ocultarExito(){

    mensajeExito.classList.add("oculto");

}

// =============================
// VALIDAR MIENTRAS ESCRIBE
// =============================

correo.addEventListener("input",()=>{

    ocultarError();

    ocultarExito();

});

// =============================
// ENVIAR FORMULARIO
// =============================

formulario.addEventListener("submit",(e)=>{

    e.preventDefault();

    ocultarError();

    ocultarExito();

    const email=correo.value.trim();

    // Campo vacío

    if(email===""){

        mostrarError("Debes ingresar un correo.");

        return;

    }

    // Solo Gmail

    if(!validarCorreoGoogle(email)){

        mostrarError("Solo se permiten cuentas de Google (@gmail.com)");

        return;

    }

    // Mostrar animación

    mostrarLoader();

    // Simulación servidor

    setTimeout(()=>{

        ocultarLoader();

        mostrarExito();

        formulario.reset();

    },2500);

});

// =============================
// ENTER
// =============================

correo.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        formulario.requestSubmit();

    }

});

// =============================
// EFECTO DE ESCRITURA
// =============================

correo.addEventListener("focus",()=>{

    correo.parentElement.style.transform="scale(1.02)";

});

correo.addEventListener("blur",()=>{

    correo.parentElement.style.transform="scale(1)";

});

// =============================
// MENSAJE EN CONSOLA
// =============================

console.log("%cSentir 💜","font-size:22px;color:#6C4DF6;font-weight:bold");

console.log("Sistema de recuperación cargado correctamente.");