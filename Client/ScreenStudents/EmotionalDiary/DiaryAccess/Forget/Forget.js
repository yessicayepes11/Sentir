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
const formRestablecer = document.getElementById("formRestablecer");
const recoveryToken = new URLSearchParams(window.location.search).get("token");
const API_RECUPERAR = "http://localhost:3001/api/CrearUsuario/recuperar";
const passwordRequirementsRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

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

if (recoveryToken) {
    formulario.hidden = true;
    document.getElementById("recoveryTitle").textContent = "Crea una nueva contraseña";
    document.getElementById("recoveryDescription").textContent = "Elige una contraseña segura para volver a ingresar a tu espacio personal.";
    document.getElementById("recoverySeparator").hidden = true;
    document.getElementById("recoverySecurity").hidden = true;
    document.getElementById("mensajeExito").classList.add("oculto");
    document.getElementById("formRestablecer").hidden = false;
}

formRestablecer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nuevaContrasena = document.getElementById("nuevaContrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;
    const error = document.getElementById("errorRestablecer");
    const submitButton = formRestablecer.querySelector("button[type='submit']");
    error.textContent = "";

    if (!passwordRequirementsRegex.test(nuevaContrasena)) {
        error.textContent = "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
        return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
        error.textContent = "Las contraseñas no coinciden.";
        return;
    }

    submitButton.disabled = true;
    try {
        const response = await fetch(`${API_RECUPERAR}/restablecer-enlace`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: recoveryToken, nuevaContrasena, confirmarContrasena })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            error.textContent = result.message || "No se pudo cambiar la contraseña.";
            return;
        }
        formRestablecer.hidden = true;
        mensajeExito.textContent = "Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.";
        mostrarExito();
        document.getElementById("backToLogin").textContent = "← Ir a iniciar sesión";
    } catch {
        error.textContent = "No se pudo conectar con el servidor. Inténtalo de nuevo.";
    } finally {
        submitButton.disabled = false;
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