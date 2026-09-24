if (sessionStorage.getItem('sentir_psych_session') === 'active' &&
    sessionStorage.getItem('sentir_psych_role') === 'psychology') {
    window.location.replace('../home/Home.html');
}

sessionStorage.removeItem("sentir_psych_session");
