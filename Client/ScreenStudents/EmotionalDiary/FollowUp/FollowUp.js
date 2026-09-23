/* =========================================================
   FOLLOW UP - SENTIR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           ELEMENTOS
        ====================================================== */

        const sidebar =
            document.getElementById("sidebar");

        const sidebarOverlay =
            document.getElementById("sidebarOverlay");

        const hamburgerButton =
            document.getElementById("hamburgerButton");

        const closeSidebar =
            document.getElementById("closeSidebar");


        const studentProfile =
            document.getElementById("studentProfile");

        const profileDropdown =
            document.getElementById("profileDropdown");


        const notificationButton =
            document.getElementById("notificationButton");

        const notificationToast =
            document.getElementById("notificationToast");


        const headerProfileImage =
            document.getElementById("headerProfileImage");

        const profileInitial =
            document.getElementById("profileInitial");

        const studentName =
            document.getElementById("studentName");


        const logoSentir =
            document.getElementById("logoSentir");

        const logoFallback =
            document.getElementById("logoFallback");


        const mobileLogoImage =
            document.getElementById("mobileLogoImage");

        const mobileLogoFallback =
            document.getElementById("mobileLogoFallback");


        const followUpGirl =
            document.getElementById("followUpGirl");

        const girlPlaceholder =
            document.getElementById("girlPlaceholder");


        const logoutButton =
            document.getElementById("logoutButton");


        const resourceSearch =
            document.getElementById("resourceSearch");



        /* =====================================================
           MENÚ HAMBURGUESA
        ====================================================== */

        function openSidebar() {

            sidebar.classList.add("open");

            sidebarOverlay.classList.add("show");

            document.body.classList.add("no-scroll");

        }


        function hideSidebar() {

            sidebar.classList.remove("open");

            sidebarOverlay.classList.remove("show");

            document.body.classList.remove("no-scroll");

        }


        hamburgerButton.addEventListener(
            "click",
            openSidebar
        );


        closeSidebar.addEventListener(
            "click",
            hideSidebar
        );


        sidebarOverlay.addEventListener(
            "click",
            hideSidebar
        );


        /* CERRAR SIDEBAR DESPUÉS DE ELEGIR OPCIÓN */

        document
            .querySelectorAll(".menu-item")
            .forEach((item) => {

                item.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <= 900
                        ) {

                            hideSidebar();

                        }

                    }
                );

            });


        /* CERRAR CON ESC */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    hideSidebar();

                    profileDropdown.classList.remove(
                        "show"
                    );

                }

            }
        );


        /* SI SE AGRANDA LA PANTALLA */

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 900
                ) {

                    hideSidebar();

                }

            }
        );



        /* =====================================================
           PERFIL DEL ESTUDIANTE
        ====================================================== */

        function loadStudentProfile() {


            const savedName =
                localStorage.getItem(
                    "studentName"
                );


            const savedPhoto =
                localStorage.getItem(
                    "studentProfileImage"
                );


            if (savedName) {

                studentName.textContent =
                    savedName;


                profileInitial.textContent =
                    savedName
                        .trim()
                        .charAt(0)
                        .toUpperCase();

            }


            if (savedPhoto) {

                headerProfileImage.src =
                    savedPhoto;


                headerProfileImage.style.display =
                    "block";


                profileInitial.style.display =
                    "none";

            }

            else {

                headerProfileImage.removeAttribute(
                    "src"
                );


                headerProfileImage.style.display =
                    "none";


                profileInitial.style.display =
                    "flex";

            }

        }


        loadStudentProfile();


        /* ACTUALIZACIÓN ENTRE PESTAÑAS */

        window.addEventListener(
            "storage",
            (event) => {

                if (
                    event.key ===
                    "studentProfileImage" ||

                    event.key ===
                    "studentName"
                ) {

                    loadStudentProfile();

                }

            }
        );


        /* TAMBIÉN ACTUALIZA AL VOLVER A LA PÁGINA */

        window.addEventListener(
            "focus",
            loadStudentProfile
        );



        /* =====================================================
           DROPDOWN PERFIL
        ====================================================== */

        studentProfile.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                profileDropdown.classList.toggle(
                    "show"
                );


                notificationToast.classList.remove(
                    "show"
                );

            }
        );


        profileDropdown.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            () => {

                profileDropdown.classList.remove(
                    "show"
                );

            }
        );



        /* =====================================================
           NOTIFICACIONES
        ====================================================== */

        let notificationTimer;


        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                clearTimeout(
                    notificationTimer
                );


                profileDropdown.classList.remove(
                    "show"
                );


                notificationToast.classList.add(
                    "show"
                );


                notificationTimer =
                    setTimeout(
                        () => {

                            notificationToast.classList.remove(
                                "show"
                            );

                        },
                        3300
                    );

            }
        );



        /* =====================================================
           DATOS DE ESTADO DE ÁNIMO

           Ya NO usamos emojis.
        ====================================================== */

        const moodData = [

            {

                day: "Lun",

                value: 4,

                mood: "very-happy",

                color: "#61cf9a"

            },

            {

                day: "Mar",

                value: 3.5,

                mood: "happy",

                color: "#ffc75a"

            },

            {

                day: "Mié",

                value: 3,

                mood: "neutral",

                color: "#c6a7ff"

            },

            {

                day: "Jue",

                value: 1.5,

                mood: "sad",

                color: "#ff755e"

            },

            {

                day: "Vie",

                value: 3.1,

                mood: "happy",

                color: "#ffc75a"

            },

            {

                day: "Sáb",

                value: 3.4,

                mood: "happy",

                color: "#ffc75a"

            },

            {

                day: "Dom",

                value: 4.1,

                mood: "very-happy",

                color: "#61cf9a"

            }

        ];



        /* =====================================================
           DIBUJAR GRÁFICA
        ====================================================== */

        drawMoodChart(
            moodData
        );


        function drawMoodChart(data) {


            const svgWidth =
                700;


            const chartTop =
                45;


            const chartBottom =
                210;


            const leftPadding =
                35;


            const rightPadding =
                35;


            const availableWidth =

                svgWidth -

                leftPadding -

                rightPadding;


            const step =

                availableWidth /

                (data.length - 1);



            const points =

                data.map(
                    (item, index) => {


                        const x =

                            leftPadding +

                            (
                                step *
                                index
                            );


                        /*
                           5 = Muy bien
                           1 = Muy mal
                        */

                        const normalized =

                            (
                                5 -
                                item.value
                            )

                            /

                            4;


                        const y =

                            chartTop +

                            (
                                normalized *

                                (
                                    chartBottom -
                                    chartTop
                                )
                            );


                        return {

                            ...item,

                            x,

                            y

                        };

                    }
                );



            const linePath =
                createSmoothPath(
                    points
                );


            const areaPath =

                `${linePath}

                L ${points[points.length - 1].x}
                  ${chartBottom + 18}

                L ${points[0].x}
                  ${chartBottom + 18}

                Z`;



            document
                .getElementById(
                    "moodLinePath"
                )
                .setAttribute(
                    "d",
                    linePath
                );


            document
                .getElementById(
                    "moodAreaPath"
                )
                .setAttribute(
                    "d",
                    areaPath
                );


            createChartPoints(
                points
            );


            createChartDays(
                points
            );

        }



        /* =====================================================
           CURVA SUAVE
        ====================================================== */

        function createSmoothPath(
            points
        ) {


            if (
                points.length === 0
            ) {

                return "";

            }


            let path =

                `M
                ${points[0].x}
                ${points[0].y}`;


            for (
                let i = 0;
                i < points.length - 1;
                i++
            ) {


                const current =
                    points[i];


                const next =
                    points[i + 1];


                const middleX =

                    (
                        current.x +
                        next.x
                    )

                    /

                    2;


                path +=

                    ` C

                    ${middleX}
                    ${current.y},

                    ${middleX}
                    ${next.y},

                    ${next.x}
                    ${next.y}`;

            }


            return path;

        }



        /* =====================================================
           CARITAS VECTORIALES

           Estas NO son emojis.
        ====================================================== */

        function createChartPoints(
            points
        ) {


            const chartPoints =

                document.getElementById(
                    "chartPoints"
                );


            chartPoints.innerHTML =
                "";


            const namespace =

                "http://www.w3.org/2000/svg";



            points.forEach(
                (point) => {


                    /* =========================================
                       PUNTO DE LA LÍNEA
                    ========================================== */

                    const linePoint =

                        document.createElementNS(
                            namespace,
                            "circle"
                        );


                    linePoint.setAttribute(
                        "cx",
                        point.x
                    );


                    linePoint.setAttribute(
                        "cy",
                        point.y
                    );


                    linePoint.setAttribute(
                        "r",
                        "7"
                    );


                    linePoint.setAttribute(
                        "fill",
                        "#ffffff"
                    );


                    linePoint.setAttribute(
                        "stroke",
                        "#7c48ff"
                    );


                    linePoint.setAttribute(
                        "stroke-width",
                        "3"
                    );


                    chartPoints.appendChild(
                        linePoint
                    );



                    /* =========================================
                       GRUPO DEL ICONO
                    ========================================== */

                    const group =

                        document.createElementNS(
                            namespace,
                            "g"
                        );


                    const centerX =
                        point.x;


                    const centerY =
                        point.y - 35;



                    /* FONDO */

                    const faceBackground =

                        document.createElementNS(
                            namespace,
                            "circle"
                        );


                    faceBackground.setAttribute(
                        "cx",
                        centerX
                    );


                    faceBackground.setAttribute(
                        "cy",
                        centerY
                    );


                    faceBackground.setAttribute(
                        "r",
                        "17"
                    );


                    faceBackground.setAttribute(
                        "fill",
                        point.color
                    );


                    faceBackground.setAttribute(
                        "stroke",
                        "#ffffff"
                    );


                    faceBackground.setAttribute(
                        "stroke-width",
                        "3"
                    );



                    /* OJO IZQUIERDO */

                    const leftEye =

                        document.createElementNS(
                            namespace,
                            "circle"
                        );


                    leftEye.setAttribute(
                        "cx",
                        centerX - 5
                    );


                    leftEye.setAttribute(
                        "cy",
                        centerY - 3
                    );


                    leftEye.setAttribute(
                        "r",
                        "1.6"
                    );


                    leftEye.setAttribute(
                        "fill",
                        "#54306c"
                    );



                    /* OJO DERECHO */

                    const rightEye =

                        document.createElementNS(
                            namespace,
                            "circle"
                        );


                    rightEye.setAttribute(
                        "cx",
                        centerX + 5
                    );


                    rightEye.setAttribute(
                        "cy",
                        centerY - 3
                    );


                    rightEye.setAttribute(
                        "r",
                        "1.6"
                    );


                    rightEye.setAttribute(
                        "fill",
                        "#54306c"
                    );



                    /* BOCA */

                    const mouth =

                        document.createElementNS(
                            namespace,
                            "path"
                        );


                    let mouthPath =
                        "";


                    switch (
                        point.mood
                    ) {


                        case "very-happy":

                            mouthPath =

                                `M
                                ${centerX - 7}
                                ${centerY + 2}

                                Q
                                ${centerX}
                                ${centerY + 11}

                                ${centerX + 7}
                                ${centerY + 2}`;

                            break;



                        case "happy":

                            mouthPath =

                                `M
                                ${centerX - 6}
                                ${centerY + 3}

                                Q
                                ${centerX}
                                ${centerY + 8}

                                ${centerX + 6}
                                ${centerY + 3}`;

                            break;



                        case "neutral":

                            mouthPath =

                                `M
                                ${centerX - 6}
                                ${centerY + 5}

                                L
                                ${centerX + 6}
                                ${centerY + 5}`;

                            break;



                        case "sad":

                            mouthPath =

                                `M
                                ${centerX - 7}
                                ${centerY + 8}

                                Q
                                ${centerX}
                                ${centerY}

                                ${centerX + 7}
                                ${centerY + 8}`;

                            break;

                    }


                    mouth.setAttribute(
                        "d",
                        mouthPath
                    );


                    mouth.setAttribute(
                        "fill",
                        "none"
                    );


                    mouth.setAttribute(
                        "stroke",
                        "#54306c"
                    );


                    mouth.setAttribute(
                        "stroke-width",
                        "2"
                    );


                    mouth.setAttribute(
                        "stroke-linecap",
                        "round"
                    );



                    /* AGREGA TODO */

                    group.appendChild(
                        faceBackground
                    );


                    group.appendChild(
                        leftEye
                    );


                    group.appendChild(
                        rightEye
                    );


                    group.appendChild(
                        mouth
                    );


                    chartPoints.appendChild(
                        group
                    );

                }
            );

        }



        /* =====================================================
           DÍAS
        ====================================================== */

        function createChartDays(
            points
        ) {


            const container =

                document.getElementById(
                    "chartDays"
                );


            container.innerHTML =
                "";


            points.forEach(
                (point) => {


                    const day =

                        document.createElement(
                            "span"
                        );


                    day.textContent =
                        point.day;


                    container.appendChild(
                        day
                    );

                }
            );

        }



        /* =====================================================
           CONTROL DE IMÁGENES FALTANTES
        ====================================================== */

        if (
            logoSentir
        ) {

            logoSentir.addEventListener(
                "error",
                () => {


                    logoSentir.style.display =
                        "none";


                    logoFallback.style.display =
                        "flex";

                }
            );

        }


        if (
            mobileLogoImage
        ) {

            mobileLogoImage.addEventListener(
                "error",
                () => {


                    mobileLogoImage.style.display =
                        "none";


                    mobileLogoFallback.style.display =
                        "flex";

                }
            );

        }


        if (
            followUpGirl
        ) {

            followUpGirl.addEventListener(
                "error",
                () => {


                    followUpGirl.style.display =
                        "none";


                    girlPlaceholder.style.display =
                        "flex";

                }
            );

        }



        /* =====================================================
           BUSCADOR
        ====================================================== */

        if (
            resourceSearch
        ) {

            resourceSearch.addEventListener(
                "keydown",
                (event) => {


                    if (
                        event.key !== "Enter"
                    ) {

                        return;

                    }


                    const value =

                        resourceSearch
                            .value
                            .trim();


                    if (
                        !value
                    ) {

                        return;

                    }


                    /*
                       Cuando tengas Resources lista
                       puedes activar esto:

                       window.location.href =
                           `Resources.html?search=${
                               encodeURIComponent(value)
                           }`;
                    */


                    console.log(
                        "Buscar:",
                        value
                    );

                }
            );

        }



        /* =====================================================
           CERRAR SESIÓN
        ====================================================== */

        logoutButton.addEventListener(
            "click",
            () => {


                const confirmLogout =

                    confirm(
                        "¿Deseas cerrar sesión?"
                    );


                if (
                    !confirmLogout
                ) {

                    return;

                }


                /*
                   Cuando tengas lista la pantalla
                   de inicio de sesión:

                   window.location.href =
                       "Login.html";
                */


                console.log(
                    "Sesión cerrada"
                );

            }
        );

    }
);