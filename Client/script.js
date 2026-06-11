window.addEventListener("load", () => {

    const logo = document.querySelector(".logo");
    const titulo = document.querySelector(".titulo");
    const personajes = document.querySelector(".personajes");

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

});