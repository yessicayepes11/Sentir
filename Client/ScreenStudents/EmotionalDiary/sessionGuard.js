/* =========================================================
   GUARDIA DE "MI ESPACIO PERSONAL"
   Se carga en el <head> del diario, insignias y seguimiento.
   Si el estudiante no ha ingresado con su número de
   identificación y clave (DiaryAccess.html), lo devuelve allí.
   La sesión vive en sessionStorage: se borra al cerrar la
   pestaña o el navegador.
========================================================= */

(function () {

    var LOGIN_PAGE = "/Client/ScreenStudents/EmotionalDiary/DiaryAccess/DiaryAccess.html";
    var estudiante = null;

    try {
        estudiante = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
    } catch (error) {
        estudiante = null;
    }

    if (!estudiante || !estudiante.id_usuario) {
        // Se recuerda a qué página quería ir, para volver ahí después de ingresar
        window.location.replace(LOGIN_PAGE + "?volver=" + encodeURIComponent(window.location.pathname));
    }

})();
