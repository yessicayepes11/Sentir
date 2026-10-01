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

                    profileDropdown?.classList.remove(
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

            // El perfil del encabezado se quitó de esta página
            if (!studentName || !profileInitial || !headerProfileImage) {
                return;
            }


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

        studentProfile?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                profileDropdown?.classList.toggle(
                    "show"
                );


                notificationToast?.classList.remove(
                    "show"
                );

            }
        );


        profileDropdown?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            () => {

                profileDropdown?.classList.remove(
                    "show"
                );

            }
        );



        /* =====================================================
           NOTIFICACIONES
        ====================================================== */

        let notificationTimer;


        notificationButton?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                clearTimeout(
                    notificationTimer
                );


                profileDropdown?.classList.remove(
                    "show"
                );


                notificationToast?.classList.add(
                    "show"
                );


                notificationTimer =
                    setTimeout(
                        () => {

                            notificationToast?.classList.remove(
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

        // Los datos salen de la base de datos (entradas del diario de los últimos 7 días)
        loadWeeklyMood();

        // Balance emocional del mes, también desde la base de datos
        loadEmotionalBalance();

        // Racha: días seguidos escribiendo en el diario
        loadStreak();

        // Reflexión de la semana, escrita por el agente de IA
        loadWeeklyReflection();


        /* =====================================================
           TU REFLEXIÓN (cambia cada semana, la escribe la IA)
        ====================================================== */

        async function loadWeeklyReflection() {

            const text = document.getElementById("weeklyReflection");
            if (!text) return;

            const respaldo = "Estoy aprendiendo a tratarme con más amabilidad, y eso también es un gran avance.";

            try {
                const response = await fetchWithRetry(
                    "http://localhost:3001/api/Asistente/reflexion",
                    {}
                );

                const data = await response.json().catch(() => ({}));

                text.textContent = `“${data.texto || respaldo}”`;
            } catch (error) {
                text.textContent = `“${respaldo}”`;
            }
        }


        /* =====================================================
           RACHA DE BIENESTAR
        ====================================================== */

        async function loadStreak() {

            const value = document.getElementById("streakValue");
            const text = document.getElementById("streakText");

            if (!value || !text) return;

            let session = null;

            try {
                session = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
            } catch (error) {
                session = null;
            }

            if (!session || !session.token) {
                text.textContent = "Ingresa a tu espacio personal para ver tu racha.";
                return;
            }

            try {
                const response = await fetchWithRetry(
                    "http://localhost:3001/api/Diario/racha",
                    { headers: { Authorization: "Bearer " + session.token } }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    text.textContent = data.message || "No se pudo cargar tu racha.";
                    return;
                }

                renderStreak(data);
            } catch (error) {
                text.textContent = "No se pudo conectar con el servidor.";
            }
        }


        function renderStreak(data) {

            const value = document.getElementById("streakValue");
            const text = document.getElementById("streakText");
            const week = document.getElementById("streakWeek");

            const racha = Number(data.racha) || 0;

            value.textContent =
                `${racha} ${racha === 1 ? "día seguido" : "días seguidos"}`;

            text.innerHTML = "";

            if (data.sinFicha) {
                text.textContent = "Aún no tienes ficha de estudiante.";
            } else if (racha === 0) {
                text.textContent = "Escribe hoy en tu diario para empezar tu racha.";
            } else if (data.escribioHoy) {
                text.append("Cuidando de ti ");
                const heart = document.createElement("i");
                heart.className = "fa-solid fa-heart";
                text.appendChild(heart);
            } else {
                text.textContent = "¡Escribe hoy para no perder tu racha!";
            }

            if (data.totalDias) {
                text.title = `Has escrito en tu diario ${data.totalDias} ${data.totalDias === 1 ? "día" : "días"} en total`;
            }

            // Círculos de lunes a domingo de esta semana
            if (!week || !Array.isArray(data.semana)) return;

            const conEntrada = new Set(data.diasConEntrada || []);
            const nombres = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

            week.innerHTML = "";

            data.semana.forEach((fecha, index) => {
                const day = document.createElement("div");
                day.className = "streak-day";

                if (conEntrada.has(fecha)) day.classList.add("complete");
                if (fecha === data.hoy) day.classList.add("today");
                if (fecha > data.hoy) day.classList.add("future");

                day.title = conEntrada.has(fecha)
                    ? "Escribiste en tu diario"
                    : (fecha > data.hoy ? "Todavía no llega este día" : "No escribiste este día");

                const circle = document.createElement("span");

                if (conEntrada.has(fecha)) {
                    const check = document.createElement("i");
                    check.className = "fa-solid fa-check";
                    circle.appendChild(check);
                }

                const label = document.createElement("small");
                label.textContent = nombres[index];

                day.append(circle, label);
                week.appendChild(day);
            });
        }


        /* =====================================================
           BALANCE EMOCIONAL (este mes)
        ====================================================== */

        // Mismos colores que las caritas de la gráfica semanal
        const BALANCE_COLORS = {
            "muy bien": "#61cf9a",
            "bien": "#ffc75a",
            "regular": "#c6a7ff",
            "mal": "#ff9a5e",
            "muy mal": "#ff5f6d"
        };

        async function loadEmotionalBalance() {

            let session = null;

            try {
                session = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
            } catch (error) {
                session = null;
            }

            if (!session || !session.token) {
                renderBalanceMessage("Tu balance de este mes", "Ingresa a tu espacio personal para ver tu balance.");
                return;
            }

            try {
                const response = await fetchWithRetry(
                    "http://localhost:3001/api/Diario/balance",
                    { headers: { Authorization: "Bearer " + session.token } }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    renderBalanceMessage("Tu balance de este mes", data.message || "No se pudo cargar tu balance emocional.");
                    return;
                }

                renderBalance(data);
            } catch (error) {
                renderBalanceMessage("Tu balance de este mes", "No se pudo conectar con el servidor.");
            }
        }


        function renderBalance(data) {

            const donut = document.getElementById("balanceDonut");
            const value = document.getElementById("balanceValue");
            const list = document.getElementById("balanceList");

            if (!donut || !value || !list) return;

            const emociones = data.emociones || [];

            // Lista de emociones con su porcentaje
            list.innerHTML = "";

            emociones.forEach((emocion) => {
                const color = BALANCE_COLORS[String(emocion.nombre).trim().toLowerCase()] || "#b1a0f7";

                const row = document.createElement("div");
                row.className = "emotion-row";
                row.title = `${emocion.cantidad} ${emocion.cantidad === 1 ? "registro" : "registros"} este mes`;

                const dot = document.createElement("span");
                dot.className = "emotion-dot";
                dot.style.background = color;

                const name = document.createElement("span");
                name.textContent = `${emocion.foto || ""} ${emocion.nombre}`.trim();

                const percent = document.createElement("strong");
                percent.textContent = `${emocion.porcentaje}%`;

                row.append(dot, name, percent);
                list.appendChild(row);
            });

            // Dona: un tramo por emoción, del tamaño de su porcentaje
            if (!data.total) {
                donut.style.background = "conic-gradient(#ebe6f5 0 100%)";
                value.textContent = "–";
            } else {
                let start = 0;
                const tramos = emociones
                    .filter((emocion) => emocion.porcentaje > 0)
                    .map((emocion) => {
                        const color = BALANCE_COLORS[String(emocion.nombre).trim().toLowerCase()] || "#b1a0f7";
                        const tramo = `${color} ${start}% ${start + emocion.porcentaje}%`;
                        start += emocion.porcentaje;
                        return tramo;
                    });

                donut.style.background = `conic-gradient(${tramos.join(", ")})`;
                value.textContent = `${data.equilibrio}%`;
            }

            // Mensaje comparando con el mes pasado
            const actual = data.equilibrio;
            const pasado = data.equilibrioMesPasado;
            const registros = `${data.total} ${data.total === 1 ? "registro" : "registros"}`;

            if (data.sinFicha) {
                renderBalanceMessage("Tu balance de este mes", "Aún no tienes ficha de estudiante, por eso no hay registros para mostrar.");
            } else if (!data.total) {
                renderBalanceMessage("Aún no tienes registros este mes", "Escribe en tu diario para empezar a ver tu balance emocional.");
            } else if (pasado === null) {
                renderBalanceMessage("Tu balance de este mes", `Llevas ${registros} este mes. ¡Sigue escribiendo en tu diario!`);
            } else if (actual - pasado >= 3) {
                renderBalanceMessage("Tu equilibrio emocional ha mejorado", `Subió ${actual - pasado} puntos frente al mes pasado. ¡Sigue así!`, true);
            } else if (pasado - actual >= 3) {
                renderBalanceMessage("Tu equilibrio bajó un poco", `Está ${pasado - actual} puntos por debajo del mes pasado. Recuerda que puedes pedir ayuda cuando lo necesites.`);
            } else {
                renderBalanceMessage("Tu equilibrio se mantiene estable", `Muy parecido al mes pasado, con ${registros} este mes.`);
            }
        }


        function renderBalanceMessage(title, text, sparkle) {

            const titleBox = document.getElementById("balanceTitle");
            const textBox = document.getElementById("balanceText");

            if (titleBox) {
                titleBox.textContent = title + " ";

                if (sparkle) {
                    const star = document.createElement("i");
                    star.className = "fa-solid fa-star balance-sparkle";
                    titleBox.appendChild(star);
                }
            }

            if (textBox) textBox.textContent = text;
        }


        async function loadWeeklyMood() {

            const days =
                buildWeek(null, []);

            drawMoodChart(days);

            let session = null;

            try {
                session = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
            } catch (error) {
                session = null;
            }

            if (!session || !session.token) {
                showMoodMessage("Ingresa a tu espacio personal para ver tu estado de ánimo.");
                return;
            }

            try {
                const response = await fetchWithRetry(
                    "http://localhost:3001/api/Diario/semana",
                    { headers: { Authorization: "Bearer " + session.token } }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    showMoodMessage(data.message || "No se pudo cargar tu estado de ánimo.");
                    return;
                }

                const week =
                    buildWeek(data.hoy, data.dias || []);

                drawMoodChart(week);

                if (data.sinFicha) {
                    showMoodMessage("Aún no tienes ficha de estudiante, por eso no hay registros para mostrar.");
                } else if (!week.some((day) => day.value !== null)) {
                    showMoodMessage("Aún no tienes registros en los últimos 7 días. Escribe en tu diario para ver tu gráfica.");
                } else {
                    showMoodMessage("");
                }
            } catch (error) {
                showMoodMessage("No se pudo conectar con el servidor.");
            }
        }


        // Si el servidor se está reiniciando, espera un momento y vuelve a intentar (hasta 3 veces)
        async function fetchWithRetry(url, options, attempts = 3) {

            for (let attempt = 1; ; attempt++) {
                try {
                    return await fetch(url, options);
                } catch (error) {
                    if (attempt >= attempts) throw error;
                    showMoodMessage("Conectando con el servidor…");
                    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
                }
            }
        }


        // Los 7 días que terminan en "hoy" (fecha del servidor), con el promedio de cada día o null
        function buildWeek(today, registros) {

            const base =
                today ? new Date(today + "T12:00:00") : new Date();

            const porFecha =
                new Map(registros.map((registro) => [registro.fecha, registro]));

            const week = [];

            for (let i = 6; i >= 0; i--) {

                const date =
                    new Date(base);

                date.setDate(base.getDate() - i);

                const key =
                    date.getFullYear() + "-" +
                    String(date.getMonth() + 1).padStart(2, "0") + "-" +
                    String(date.getDate()).padStart(2, "0");

                const registro =
                    porFecha.get(key);

                const label =
                    date.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", "");

                const value =
                    registro ? Number(registro.promedio) : null;

                week.push({
                    day: label.charAt(0).toUpperCase() + label.slice(1, 3),
                    date: key,
                    value,
                    entries: registro ? registro.entradas : 0,
                    ...moodStyle(value)
                });
            }

            return week;
        }


        // Carita y color según el promedio del día (5 = Muy bien · 1 = Muy mal)
        function moodStyle(value) {

            if (value === null) return { mood: null, color: null };
            if (value >= 4.5) return { mood: "very-happy", color: "#61cf9a" };
            if (value >= 3.5) return { mood: "happy", color: "#ffc75a" };
            if (value >= 2.5) return { mood: "neutral", color: "#c6a7ff" };
            if (value >= 1.5) return { mood: "sad", color: "#ff9a5e" };
            return { mood: "sad", color: "#ff5f6d" };
        }


        function showMoodMessage(text) {

            const area =
                document.querySelector(".mood-chart-wrapper .chart-area");

            if (!area) return;

            let box =
                area.querySelector(".mood-chart-empty");

            if (!box) {
                box = document.createElement("div");
                box.className = "mood-chart-empty";
                area.appendChild(box);
            }

            box.textContent = text;
            box.hidden = !text;
        }


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



            // Días sin entradas: no tienen punto
            const withData =
                points.filter(
                    (point) => typeof point.value === "number"
                );

            const linePath =
                createSmoothPath(
                    withData
                );


            const areaPath =

                withData.length < 2
                    ? ""
                    : `${linePath}

                L ${withData[withData.length - 1].x}
                  ${chartBottom + 18}

                L ${withData[0].x}
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
                withData
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

        logoutButton?.addEventListener(
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