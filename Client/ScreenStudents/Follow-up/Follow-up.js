/* =========================================================
   SENTIR
   MI SEGUIMIENTO
========================================================= */


/* =========================================================
   SIDEBAR RESPONSIVE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuItems = document.querySelectorAll(".menu-item");

    // Función para abrir/cerrar el sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("active");
    }

    // Función para cerrar el sidebar
    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    // Evento del botón de hamburguesa
    if (mobileMenu) {
        mobileMenu.addEventListener("click", toggleSidebar);
    }

    // Evento al hacer clic en el fondo oscuro
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    // Cerrar sidebar al hacer clic en una opción (en dispositivos móviles)
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
});


/* =========================================================
   PROFILE DROPDOWN
========================================================= */

const profileContainer =
    document.querySelector(
        ".profile-container"
    );


const profileButton =
    document.getElementById(
        "profileButton"
    );



profileButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        profileContainer
            .classList
            .toggle("open");

    }
);



document.addEventListener(
    "click",
    event => {

        if (
            !profileContainer.contains(
                event.target
            )
        ) {

            profileContainer
                .classList
                .remove("open");

        }

    }
);



/* =========================================================
   EMOJIS DE VISUALIZACIÓN
========================================================= */

/*
    IMPORTANTE:

    Los emojis de esta página NO representan
    controles de entrada.

    NO se guarda ninguna selección.

    Cada emoji está dentro de su propio <form>,
    de modo que conservamos exactamente:

        name="feedback"

    sin que interfiera con los demás radios.
*/


const trackingEmojiInputs =
    document.querySelectorAll(
        ".emoji-form input[type='radio']"
    );



/*
    Los activamos para mostrar la versión
    amarilla/activa y ejecutar su animación
    original.
*/

function activateTrackingEmojis() {

    trackingEmojiInputs.forEach(
        (input, index) => {

            setTimeout(
                () => {

                    input.checked = true;

                },
                100 + index * 55
            );

        }
    );

}



activateTrackingEmojis();



/* =========================================================
   REACTIVAR ANIMACIONES NATIVAS
========================================================= */

/*
    El movimiento flotante exterior es infinito.

    Además, cada cierto tiempo reactivamos
    únicamente la animación propia del emoji.

    No guarda datos.
    No cambia la emoción.
    No permite selección.
*/


function replayEmojiAnimation(input) {

    input.checked = false;


    /*
        Espera mínima para que el navegador
        detecte nuevamente :checked.
    */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    input.checked = true;

                }
            );

        }
    );

}



function animateRandomEmoji() {

    if (
        trackingEmojiInputs.length === 0
    ) {

        return;

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            trackingEmojiInputs.length
        );


    replayEmojiAnimation(
        trackingEmojiInputs[
            randomIndex
        ]
    );

}



/*
    Una animación adicional aproximadamente
    cada 2.7 segundos.

    De esta forma no se mueven todos exactamente
    al mismo tiempo y la interfaz se siente
    más natural.
*/

setInterval(
    animateRandomEmoji,
    2700
);



/* =========================================================
   DATOS DE SEGUIMIENTO
========================================================= */

const emotionMetadata = {

    1: {
        name: "Muy mal"
    },

    2: {
        name: "Mal"
    },

    3: {
        name: "Normal"
    },

    4: {
        name: "Feliz"
    },

    5: {
        name: "Muy feliz"
    }

};



const monthData = {

    enero: {
        registers: 18,
        streak: 4,

        values: [
            3,3,4,2,3,4,4,3,
            5,4,3,3,4,5,4,4,
            3,4
        ]
    },


    febrero: {
        registers: 19,
        streak: 5,

        values: [
            2,3,3,4,3,2,4,4,
            3,3,4,5,4,3,4,4,
            5,4,3
        ]
    },


    marzo: {
        registers: 21,
        streak: 5,

        values: [
            3,4,3,4,4,5,4,3,
            4,4,2,3,4,5,5,4,
            3,4,4,5,4
        ]
    },


    abril: {
        registers: 20,
        streak: 4,

        values: [
            3,3,2,3,4,3,4,4,
            3,5,4,3,4,4,3,2,
            3,4,4,5
        ]
    },


    mayo: {
        registers: 22,
        streak: 6,

        values: [
            3,4,4,4,5,3,4,4,
            5,4,3,4,5,5,4,4,
            3,4,4,5,4,5
        ]
    },


    junio: {
        registers: 19,
        streak: 3,

        values: [
            2,3,3,4,3,4,2,3,
            4,4,3,3,4,5,4,3,
            4,4,3
        ]
    },


    julio: {
        registers: 23,
        streak: 6,

        values: [
            3,4,4,5,4,4,3,4,
            5,4,4,3,5,4,4,5,
            4,3,4,5,4,4,5
        ]
    },


    agosto: {
        registers: 21,
        streak: 5,

        values: [
            3,3,4,4,3,5,4,4,
            2,3,4,4,5,4,3,4,
            4,5,4,4,3
        ]
    },


    septiembre: {
        registers: 24,
        streak: 7,

        values: [
            3,4,2,4,5,4,4,3,
            4,5,4,4,3,2,4,5,
            4,4,3,5,4,1,3,4
        ]
    },


    octubre: {
        registers: 18,
        streak: 4,

        values: [
            3,4,3,4,2,3,4,4,
            5,4,3,4,3,4,5,4,
            4,3
        ]
    },


    noviembre: {
        registers: 17,
        streak: 3,

        values: [
            2,3,4,3,4,4,3,2,
            3,4,5,3,4,4,3,4,
            3
        ]
    },


    diciembre: {
        registers: 16,
        streak: 4,

        values: [
            3,4,4,5,4,3,4,5,
            4,4,3,5,4,5,4,4
        ]
    }

};



/* =========================================================
   ANALIZAR MES
========================================================= */

function analyzeMonth(values) {

    const counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };


    values.forEach(
        value => {

            counts[value]++;

        }
    );


    let mostFrequent = 1;


    Object.keys(counts)
        .forEach(key => {

            const value =
                Number(key);


            if (
                counts[value] >
                counts[mostFrequent]
            ) {

                mostFrequent =
                    value;

            }

        }
    );


    return {
        counts,
        mostFrequent
    };

}



/* =========================================================
   CHART GLOBAL
========================================================= */

Chart.defaults.font.family =
    "'Poppins', sans-serif";

Chart.defaults.color =
    "#908DA0";



/* =========================================================
   GRADIENTE PRINCIPAL
========================================================= */

function monthlyGradient(context) {

    const chart =
        context.chart;


    const {
        ctx,
        chartArea
    } = chart;


    if (!chartArea) {

        return "rgba(108,77,246,.12)";

    }


    const gradient =
        ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
        );


    gradient.addColorStop(
        0,
        "rgba(108,77,246,.24)"
    );


    gradient.addColorStop(
        .55,
        "rgba(184,168,255,.10)"
    );


    gradient.addColorStop(
        1,
        "rgba(101,184,255,0)"
    );


    return gradient;

}



/* =========================================================
   MONTH CHART
========================================================= */

const monthlyContext =
    document
        .getElementById(
            "monthlyEmotionChart"
        )
        .getContext("2d");



const monthlyChart =
    new Chart(
        monthlyContext,
        {

            type: "line",


            data: {

                labels:
                    monthData
                        .septiembre
                        .values
                        .map(
                            (_, index) =>
                                index + 1
                        ),


                datasets: [

                    {

                        data:
                            monthData
                                .septiembre
                                .values,


                        borderColor:
                            "#6C4DF6",


                        backgroundColor:
                            monthlyGradient,


                        borderWidth:
                            3,


                        fill:
                            true,


                        tension:
                            .42,


                        pointRadius:
                            4,


                        pointHoverRadius:
                            7,


                        pointBackgroundColor:
                            "#FFFFFF",


                        pointBorderColor:
                            "#6C4DF6",


                        pointBorderWidth:
                            2

                    }

                ]

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                interaction: {

                    intersect:
                        false,

                    mode:
                        "index"

                },


                plugins: {

                    legend: {
                        display: false
                    },


                    tooltip: {

                        displayColors:
                            false,


                        backgroundColor:
                            "#2D2850",


                        padding:
                            12,


                        cornerRadius:
                            10,


                        callbacks: {

                            title:
                                context =>
                                    `Día ${context[0].label}`,


                            label:
                                context => {

                                    const emotion =
                                        emotionMetadata[
                                            context.raw
                                        ];


                                    return emotion.name;

                                }

                        }

                    }

                },


                scales: {

                    x: {

                        border: {
                            display: false
                        },


                        grid: {
                            display: false
                        },


                        ticks: {

                            maxTicksLimit:
                                10,


                            font: {
                                size: 8
                            }

                        }

                    },


                    y: {

                        min: 1,
                        max: 5,


                        border: {
                            display: false
                        },


                        grid: {

                            color:
                                "rgba(74,64,126,.06)"

                        },


                        ticks: {

                            stepSize: 1,


                            font: {
                                size: 8
                            },


                            callback:
                                value =>
                                    emotionMetadata[value]
                                        ?.name || ""

                        }

                    }

                }

            }

        }
    );



/* =========================================================
   WEEKLY CHART
========================================================= */

const weeklyContext =
    document
        .getElementById(
            "weeklyChart"
        )
        .getContext("2d");



new Chart(
    weeklyContext,
    {

        type: "line",


        data: {

            labels:
                [
                    "L",
                    "M",
                    "M",
                    "J",
                    "V",
                    "S",
                    "D"
                ],


            datasets: [

                {

                    data:
                        [
                            3,
                            4,
                            2,
                            4,
                            5,
                            4,
                            5
                        ],


                    borderColor:
                        "#65B8FF",


                    borderWidth:
                        3,


                    tension:
                        .45,


                    pointRadius:
                        4,


                    pointBackgroundColor:
                        "#FFFFFF",


                    pointBorderColor:
                        "#6C4DF6",


                    pointBorderWidth:
                        2

                }

            ]

        },


        options: {

            responsive:
                true,


            maintainAspectRatio:
                false,


            plugins: {

                legend: {
                    display: false
                },


                tooltip: {

                    displayColors:
                        false,


                    backgroundColor:
                        "#302B57",


                    callbacks: {

                        label:
                            context =>
                                emotionMetadata[
                                    context.raw
                                ].name

                    }

                }

            },


            scales: {

                x: {
                    display: false
                },


                y: {

                    display: false,

                    min: 1,

                    max: 5

                }

            }

        }

    }
);



/* =========================================================
   CAMBIAR MES
========================================================= */

const monthSelector =
    document.getElementById(
        "monthSelector"
    );



monthSelector.addEventListener(
    "change",
    event => {

        const month =
            event.target.value;


        updateDashboard(
            month,
            monthData[month]
        );

    }
);



function updateDashboard(
    month,
    data
) {

    monthlyChart.data.labels =
        data.values.map(
            (_, index) =>
                index + 1
        );


    monthlyChart
        .data
        .datasets[0]
        .data =
            data.values;


    monthlyChart.update();


    const analysis =
        analyzeMonth(
            data.values
        );


    const mainEmotion =
        emotionMetadata[
            analysis.mostFrequent
        ];


    document.getElementById(
        "mainEmotion"
    ).textContent =
        mainEmotion.name;


    document.getElementById(
        "mainEmotionCount"
    ).textContent =
        `${
            analysis.counts[
                analysis.mostFrequent
            ]
        } registros`;


    document.getElementById(
        "totalRegisters"
    ).textContent =
        data.registers;


    document.getElementById(
        "streakDays"
    ).textContent =
        data.streak;


    const formattedMonth =
        month.charAt(0)
            .toUpperCase() +
        month.slice(1);


    document.getElementById(
        "monthlyInsight"
    ).textContent =
        `En ${formattedMonth}, la emoción que más registraste fue "${mainEmotion.name}".`;

}



/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeSidebar();


            profileContainer
                .classList
                .remove("open");

        }

    }
);