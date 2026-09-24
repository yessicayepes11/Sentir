/* SENTIR · Protección de rutas privadas (frontend)
   Evita abrir módulos de Psicología sin una sesión iniciada.
   La validación definitiva de credenciales y permisos debe realizarse también en el backend. */
(function protectPsychologyRoute(){
    const SESSION_KEY = 'sentir_psych_session';
    const LOGIN_AT_KEY = 'sentir_psych_login_at';
    const ROLE_KEY = 'sentir_psych_role';
    const MAX_SESSION_MS = 12 * 60 * 60 * 1000;

    function clearPsychSession() {
        [SESSION_KEY, LOGIN_AT_KEY, 'sentir_psych_last_activity', 'sentir_psych_email', ROLE_KEY]
            .forEach(key => sessionStorage.removeItem(key));
    }

    function isAuthorized() {
        const active = sessionStorage.getItem(SESSION_KEY) === 'active';
        const correctRole = sessionStorage.getItem(ROLE_KEY) === 'psychology';
        const loginAt = Number(sessionStorage.getItem(LOGIN_AT_KEY) || 0);
        const expired = !loginAt || (Date.now() - loginAt) > MAX_SESSION_MS;
        return active && correctRole && !expired;
    }

    function enforceAccess() {
        if (!isAuthorized()) {
            clearPsychSession();
            window.location.replace('../auth/Welcome.html');
            return false;
        }
        return true;
    }

    if (enforceAccess()) {
        sessionStorage.setItem('sentir_psych_last_activity', String(Date.now()));
    }

    // También protege cuando el navegador restaura una página privada desde la caché Atrás/Adelante.
    window.addEventListener('pageshow', enforceAccess);
})();
