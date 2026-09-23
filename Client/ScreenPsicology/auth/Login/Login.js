const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    sessionStorage.setItem("sentir_psych_session", "active");
    window.location.href = "../../home/Home.html";
});
