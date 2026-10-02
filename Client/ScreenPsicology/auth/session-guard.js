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

    // Si la psicóloga inició sesión en el inicio de sesión principal (administrativo.html),
    // esa sesión vale aquí: no se le pide iniciar sesión otra vez.
    function sesionDesdeInicioPrincipal() {
        let usuario = null;
        try {
            usuario = JSON.parse(sessionStorage.getItem('usuarioSentir') || 'null');
        } catch (error) {
            usuario = null;
        }

        if (!usuario || !usuario.token || Number(usuario.id_rol) !== 6) return;
        if (sessionStorage.getItem(SESSION_KEY) === 'active') return;

        const now = Date.now();
        sessionStorage.setItem(SESSION_KEY, 'active');
        sessionStorage.setItem(LOGIN_AT_KEY, String(now));
        sessionStorage.setItem('sentir_psych_last_activity', String(now));
        sessionStorage.setItem('sentir_psych_email', usuario.correo || '');
        sessionStorage.setItem(ROLE_KEY, 'psychology');
    }

    sesionDesdeInicioPrincipal();

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
            // Sin sesión: al inicio de sesión principal de Sentir
            window.location.replace('/Client/administrativo.html');
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
