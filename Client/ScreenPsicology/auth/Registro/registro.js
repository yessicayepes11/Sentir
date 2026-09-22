const registroForm = document.getElementById("registroForm");

registroForm.addEventListener("submit", function(e){
    e.preventDefault();
    window.location.href = "../Login/Login.html";
});
