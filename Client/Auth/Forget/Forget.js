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
const API_RECUPERAR = "http://localhost:3001/api/CrearUsuario/recuperar";
const recoveryToken = new URLSearchParams(window.location.search).get("token");

if (recoveryToken) {
    const resetPage = "/Client/ScreenStudents/EmotionalDiary/DiaryAccess/Forget/Forget.html";
    window.location.replace(`${resetPage}?token=${encodeURIComponent(recoveryToken)}`);
}

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

formulario.addEventListener("submit", async (e)=>{

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

    mostrarLoader();
    try {
        const response = await fetch(`${API_RECUPERAR}/enviar-enlace`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: email })
        });
        const result = await response.json().catch(() => ({}));
        ocultarLoader();
        if (!response.ok) {
            mostrarError(result.message || "No se pudo enviar el enlace de recuperación.");
            return;
        }
        mensajeExito.textContent = result.message || "Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.";
        mostrarExito();
        formulario.reset();
    } catch {
        ocultarLoader();
        mostrarError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    }

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