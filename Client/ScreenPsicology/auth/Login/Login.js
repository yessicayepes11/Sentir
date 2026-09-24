const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const errorBox = document.getElementById("loginError");

// Si esta pestaña ya posee una sesión válida, no mostramos nuevamente el formulario.
if (sessionStorage.getItem('sentir_psych_session') === 'active') {
    window.location.replace('../../home/Home.html');
}

loginForm.addEventListener("submit", function(e){
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!emailInput.checkValidity() || password.length < 6) {
        errorBox.textContent = 'Revisa el correo y escribe una contraseña de mínimo 6 caracteres.';
        return;
    }

    errorBox.textContent = '';

    /*
      Integración backend:
      reemplazar este bloque por fetch('/api/auth/login', ...) y crear la sesión
      únicamente cuando el servidor valide las credenciales y el rol autorizado.
      Mientras la API está en desarrollo, esta versión protege las rutas privadas
      y mantiene una sesión temporal aislada por pestaña mediante sessionStorage.
    */
    const now = Date.now();
    sessionStorage.setItem('sentir_psych_session', 'active');
    sessionStorage.setItem('sentir_psych_login_at', String(now));
    sessionStorage.setItem('sentir_psych_last_activity', String(now));
    sessionStorage.setItem('sentir_psych_email', email);
    sessionStorage.setItem('sentir_psych_role', 'psychology');

    window.location.replace('../../home/Home.html');
});
