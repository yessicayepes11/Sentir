window.addEventListener("load", () => {

    const logo = document.querySelector(".logo");
    const titulo = document.querySelector(".titulo");
    const personajes = document.querySelector(".personajes");
    const perfilSelect = document.querySelector(".btn-select");
    const openLoginModalBtn = document.getElementById("openLoginModal");
    const loginModal = document.getElementById("loginModal");
    const closeLoginModalBtn = document.getElementById("closeLoginModal");
    const loginSubmitBtn = document.getElementById("loginSubmitBtn");

    if (logo) {
        logo.animate(
            [
                {
                    opacity:0,
                    transform:"translateY(-30px)"
                },
                {
                    opacity:1,
                    transform:"translateY(0)"
                }
            ],
            {
                duration:1000,
                fill:"forwards"
            }
        );
    }

    if (titulo) {
        titulo.animate(
            [
                { opacity:0 },
                { opacity:1 }
            ],
            {
                duration:1200,
                delay:500,
                fill:"forwards"
            }
        );
    }

    if (personajes) {
        personajes.animate(
            [
                {
                    opacity:0,
                    transform:"translateY(88px)"
                },
                {
                    opacity:1,
                    transform:"translateY(20px)"
                }
            ],
            {
                duration:1200,
                delay:900,
                fill:"forwards"
            }
        );
    }

    if (perfilSelect) {
        perfilSelect.addEventListener("change", () => {
            const value = perfilSelect.value;

            if (value === "estudiante") {
                window.location.href = "./ScreenStudents/Students.html";
            }

            if (value === "administrativo") {
                window.location.href = "./administrativo.html";
            }
        });
    }

    if (openLoginModalBtn && loginModal) {
        openLoginModalBtn.addEventListener("click", () => {
            loginModal.classList.add("show");
            loginModal.setAttribute("aria-hidden", "false");
        });
    }

    if (closeLoginModalBtn && loginModal) {
        closeLoginModalBtn.addEventListener("click", () => {
            loginModal.classList.remove("show");
            loginModal.setAttribute("aria-hidden", "true");
        });
    }

    if (loginModal) {
        loginModal.addEventListener("click", (event) => {
            if (event.target === loginModal) {
                loginModal.classList.remove("show");
                loginModal.setAttribute("aria-hidden", "true");
            }
        });
    }

    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener("click", () => {
            window.location.href = "./ScreenTeacher/teacher.html";
        });
    }

});