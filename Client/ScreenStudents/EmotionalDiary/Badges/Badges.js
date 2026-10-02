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


        const studentName =
            document.getElementById("studentName");

        const profileInitial =
            document.getElementById("profileInitial");

        const headerProfileImage =
            document.getElementById("headerProfileImage");


        const logoSentir =
            document.getElementById("logoSentir");

        const logoFallback =
            document.getElementById("logoFallback");

        const mobileLogoImage =
            document.getElementById("mobileLogoImage");

        const mobileLogoFallback =
            document.getElementById("mobileLogoFallback");


        const badgesGirl =
            document.getElementById("badgesGirl");

        const girlPlaceholder =
            document.getElementById("girlPlaceholder");
















        const logoutButton =
            document.getElementById("logoutButton");


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


        document
            .querySelectorAll(".menu-item")
            .forEach((menuItem) => {

                menuItem.addEventListener(
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
           PERFIL
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


            const savedImage =
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


            if (savedImage) {

                headerProfileImage.src =
                    savedImage;


                headerProfileImage.style.display =
                    "block";


                profileInitial.style.display =
                    "none";

            }

            else {

                headerProfileImage.style.display =
                    "none";


                profileInitial.style.display =
                    "flex";

            }

        }


        loadStudentProfile();


        window.addEventListener(
            "storage",
            (event) => {

                if (
                    event.key === "studentName" ||
                    event.key === "studentProfileImage"
                ) {

                    loadStudentProfile();

                }

            }
        );


        window.addEventListener(
            "focus",
            loadStudentProfile
        );


        /* =====================================================
           PERFIL DROPDOWN
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


                profileDropdown?.classList.remove(
                    "show"
                );


                clearTimeout(
                    notificationTimer
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
                        3500
                    );

            }
        );


        /* =====================================================
           INSIGNIAS DESDE LA BASE DE DATOS
           Cada insignia pertenece a un recurso (respiración,
           meditación, videos o diario). La IA crea sus nombres y
           los recursos para conseguirlas; el progreso sale de lo
           que el estudiante hace de verdad.
        ====================================================== */

        const API_INSIGNIAS =
            "http://localhost:3001/api/Bienestar/insignias";

        const RESOURCES_PAGE =
            "/Client/ScreenStudents/Resources/Resources.html";

        const ESTILO_CATEGORIA = {
            respiracion: { color: "lavender", tema: "lotus", icono: "fa-wind", nombre: "Respiración", enlace: RESOURCES_PAGE + "?seccion=respiracion", boton: "Ir a respiraciones" },
            meditacion: { color: "purple", tema: "journal", icono: "fa-spa", nombre: "Meditación", enlace: RESOURCES_PAGE + "?seccion=meditacion", boton: "Ir a meditaciones" },
            autocuidado: { color: "peach", tema: "care", icono: "fa-hand-holding-heart", nombre: "Autocuidado", enlace: RESOURCES_PAGE + "?seccion=autocuidado", boton: "Ir a los retos" },
            video: { color: "blue", tema: "calendar", icono: "fa-film", nombre: "Videos", enlace: RESOURCES_PAGE + "?seccion=video", boton: "Ir a los videos" },
            diario: { color: "green", tema: "heart", icono: "fa-book-open", nombre: "Diario", enlace: "/Client/ScreenStudents/EmotionalDiary/EmotionalDiary.html", boton: "Escribir en mi diario" }
        };

        const badgesGrid =
            document.getElementById("badgesGrid");

        const filterButtons =
            document.querySelectorAll(".filter-button");

        const badgeModalOverlay =
            document.getElementById("badgeModalOverlay");

        const closeBadgeModal =
            document.getElementById("closeBadgeModal");

        let insignias = [];

        let currentFilter = "all";


        function escapar(valor) {

            const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };

            return String(valor ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);

        }


        function claseIcono(imagen) {

            return /^fa-solid fa-[a-z0-9-]+$/.test(imagen || "")
                ? imagen
                : "fa-solid fa-star";

        }


        function estadoHTML(insignia) {

            if (insignia.estado === "desbloqueada") {

                return `
                    <div class="badge-status unlocked">
                        <i class="fa-solid fa-circle-check"></i>
                        Desbloqueada
                    </div>`;

            }

            if (insignia.estado === "en progreso") {

                const porcentaje =
                    Math.round((insignia.progreso / insignia.meta) * 100);

                return `
                    <div class="small-progress">
                        <div class="small-progress-track">
                            <div class="small-progress-fill" style="width: ${porcentaje}%;"></div>
                        </div>
                        <span>${insignia.progreso}/${insignia.meta}</span>
                    </div>`;

            }

            return `
                <div class="badge-status locked-status">
                    <i class="fa-solid fa-lock"></i>
                    Aún bloqueada
                </div>`;

        }


        function tarjetaInsignia(insignia) {

            const estilo =
                ESTILO_CATEGORIA[insignia.categoria] || ESTILO_CATEGORIA.respiracion;

            return `
                <article
                    class="badge-card ${insignia.estado === "bloqueada" ? "locked" : ""}"
                    data-id="${insignia.id}"
                    data-category="${insignia.categoria}"
                    data-status="${insignia.estado}"
                    tabindex="0"
                >
                    <span class="badge-category ${estilo.color}">
                        <i class="fa-solid ${estilo.icono}"></i>
                        ${estilo.nombre} · Nivel ${insignia.nivel}
                    </span>
                    <div class="badge-icon ${estilo.tema}">
                        <i class="${claseIcono(insignia.imagen)}"></i>
                    </div>
                    <h3>${escapar(insignia.titulo)}</h3>
                    <p>${escapar(insignia.descripcion)}</p>
                    <small class="badge-goal">${escapar(insignia.objetivo)}</small>
                    ${estadoHTML(insignia)}
                </article>`;

        }


        function pintarInsignias() {

            const visibles =
                insignias.filter((insignia) =>
                    currentFilter === "all" ||
                    (currentFilter === "ganadas" && insignia.estado === "desbloqueada") ||
                    insignia.categoria === currentFilter
                );

            // Primero las que están en progreso, luego las ganadas y al final las bloqueadas
            const orden = { "en progreso": 0, "desbloqueada": 1, "bloqueada": 2 };

            visibles.sort((a, b) =>
                (orden[a.estado] - orden[b.estado]) ||
                a.categoria.localeCompare(b.categoria) ||
                (a.nivel - b.nivel)
            );

            badgesGrid.innerHTML = visibles.length
                ? visibles.map(tarjetaInsignia).join("")
                : `<p class="badges-loading">${currentFilter === "ganadas"
                    ? "Aún no tienes insignias ganadas. ¡Usa un recurso para conseguir la primera!"
                    : "No hay insignias en esta categoría."}</p>`;

        }


        function pintarDestacada() {

            // La que está más cerca de conseguirse
            const candidata =
                insignias
                    .filter((insignia) => insignia.estado === "en progreso")
                    .sort((a, b) => (b.progreso / b.meta) - (a.progreso / a.meta) || a.meta - b.meta)[0];

            const titulo = document.getElementById("featuredTitle");
            const descripcion = document.getElementById("featuredDescription");
            const textoDestacado = document.getElementById("featuredText");
            const relleno = document.getElementById("featuredFill");
            const cuenta = document.getElementById("featuredCount");
            const icono = document.getElementById("featuredIcon");
            const ir = document.getElementById("featuredGo");

            if (!candidata) {

                titulo.textContent = "¡Vas muy bien!";
                descripcion.textContent = "Ganaste todas las insignias disponibles por ahora.";
                textoDestacado.textContent = "Sentir IA creará nuevas insignias a medida que sigas avanzando.";
                relleno.style.width = "100%";
                cuenta.textContent = "✓";
                ir.hidden = true;
                return;

            }

            const estilo =
                ESTILO_CATEGORIA[candidata.categoria] || ESTILO_CATEGORIA.respiracion;

            const faltan =
                candidata.meta - candidata.progreso;

            titulo.textContent = candidata.titulo;
            descripcion.textContent = candidata.descripcion;
            textoDestacado.textContent =
                faltan === 1
                    ? `¡Te falta solo 1! ${candidata.objetivo} para obtener esta insignia.`
                    : `Te faltan ${faltan}. ${candidata.objetivo} para obtener esta insignia.`;
            relleno.style.width = `${Math.round((candidata.progreso / candidata.meta) * 100)}%`;
            cuenta.textContent = `${candidata.progreso}/${candidata.meta}`;
            icono.className = claseIcono(candidata.imagen);
            ir.href = estilo.enlace;
            ir.firstChild.textContent = estilo.boton + " ";
            ir.hidden = false;

        }


        async function cargarInsignias() {

            let token = "";

            try {
                token = JSON.parse(sessionStorage.getItem("sentirEstudiante") || "{}").token || "";
            } catch (error) {
                token = "";
            }

            try {

                const respuesta =
                    await fetch(API_INSIGNIAS, {
                        headers: { Authorization: "Bearer " + token }
                    });

                const datos =
                    await respuesta.json().catch(() => ({}));

                if (!respuesta.ok) {
                    throw new Error(datos.message || "No se pudieron cargar tus insignias.");
                }

                insignias = datos.insignias || [];

                pintarInsignias();
                pintarDestacada();

                // Insignias ganadas desde la última visita (por ejemplo, al escribir en el diario)
                const nuevas =
                    insignias.filter((insignia) => (datos.recienDesbloqueadas || []).includes(insignia.id));

                if (nuevas.length) {
                    mostrarAviso(
                        "¡Ganaste una insignia nueva!",
                        nuevas.map((insignia) => insignia.titulo).join(", ")
                    );
                }

            }

            catch (error) {

                badgesGrid.innerHTML =
                    `<p class="badges-loading">${escapar(error.message === "Failed to fetch"
                        ? "No se pudo conectar con el servidor."
                        : error.message)}</p>`;

                document.getElementById("featuredTitle").textContent = "Sin conexión";
                document.getElementById("featuredText").textContent = "Vuelve a intentarlo en un momento.";

            }

        }


        function mostrarAviso(titulo, texto) {

            const aviso = document.getElementById("notificationToast");
            if (!aviso) return;

            aviso.querySelector("strong").textContent = titulo;
            aviso.querySelector("p").textContent = texto;
            aviso.classList.add("show");

            setTimeout(() => aviso.classList.remove("show"), 5000);

        }


        /* =====================================================
           FILTROS
        ====================================================== */

        filterButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        filterButtons.forEach((item) => item.classList.remove("active"));

                        button.classList.add("active");

                        currentFilter = button.dataset.filter;

                        pintarInsignias();

                    }
                );

            }
        );


        /* =====================================================
           MODAL DE INSIGNIAS
        ====================================================== */

        badgesGrid.addEventListener(
            "click",
            (event) => {

                const card = event.target.closest(".badge-card");

                if (card) {
                    openBadgeModal(Number(card.dataset.id));
                }

            }
        );


        badgesGrid.addEventListener(
            "keydown",
            (event) => {

                const card = event.target.closest(".badge-card");

                if (card && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    openBadgeModal(Number(card.dataset.id));
                }

            }
        );


        function openBadgeModal(id) {

            const insignia =
                insignias.find((item) => item.id === id);

            if (!insignia) return;

            const estilo =
                ESTILO_CATEGORIA[insignia.categoria] || ESTILO_CATEGORIA.respiracion;

            document.getElementById("modalBadgeIcon").innerHTML =
                `<i class="${claseIcono(insignia.imagen)}"></i>`;

            document.getElementById("modalCategory").textContent =
                `${estilo.nombre} · Nivel ${insignia.nivel}`;

            document.getElementById("modalBadgeTitle").textContent =
                insignia.titulo;

            document.getElementById("modalBadgeDescription").textContent =
                insignia.descripcion;

            const estado =
                document.getElementById("modalBadgeStatus");

            if (insignia.estado === "desbloqueada") {

                const fecha =
                    insignia.fechaObtenida
                        ? new Date(insignia.fechaObtenida).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
                        : "";

                estado.innerHTML =
                    `<i class="fa-solid fa-circle-check"></i> Desbloqueada${fecha ? " el " + fecha : ""}`;

            }

            else if (insignia.estado === "en progreso") {

                estado.innerHTML =
                    `<i class="fa-solid fa-chart-line"></i> Progreso ${insignia.progreso}/${insignia.meta}`;

            }

            else {

                estado.innerHTML =
                    `<i class="fa-solid fa-lock"></i> Primero consigue la insignia del nivel ${insignia.nivel - 1}`;

            }

            document.getElementById("modalBadgeGoal").textContent =
                "Meta: " + insignia.objetivo + ".";

            const recursos =
                document.getElementById("modalBadgeResources");

            recursos.innerHTML =
                (insignia.recursos || []).length
                    ? `<span>Creado por Sentir IA para esta insignia:</span>` +
                      insignia.recursos.map((recurso) => `
                        <a href="${RESOURCES_PAGE}?recurso=${encodeURIComponent(recurso.id)}">
                            <i class="fa-solid ${{ respiracion: "fa-wind", meditacion: "fa-spa", autocuidado: "fa-hand-holding-heart" }[recurso.tipo] || "fa-star"}"></i>
                            <span>${escapar(recurso.titulo)}</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </a>`).join("")
                    : "";

            const ir =
                document.getElementById("modalBadgeGo");

            ir.href = estilo.enlace;
            ir.firstChild.textContent = estilo.boton + " ";
            ir.hidden = insignia.estado === "desbloqueada";

            badgeModalOverlay.classList.add("show");

            document.body.classList.add("no-scroll");

        }


        function hideBadgeModal() {

            badgeModalOverlay.classList.remove(
                "show"
            );


            document.body.classList.remove(
                "no-scroll"
            );

        }


        closeBadgeModal.addEventListener(
            "click",
            hideBadgeModal
        );


        badgeModalOverlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    badgeModalOverlay
                ) {

                    hideBadgeModal();

                }

            }
        );


        cargarInsignias();


        /* =====================================================
           TECLA ESC
        ====================================================== */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    hideSidebar();

                    hideBadgeModal();

                    profileDropdown?.classList.remove(
                        "show"
                    );

                }

            }
        );


        /* =====================================================
           IMÁGENES FALTANTES
        ====================================================== */

        if (logoSentir) {

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


        if (mobileLogoImage) {

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


        if (badgesGirl) {

            badgesGirl.addEventListener(
                "error",
                () => {

                    badgesGirl.style.display =
                        "none";


                    girlPlaceholder.style.display =
                        "flex";

                }
            );

        }


        /* =====================================================
           DESCUBRIR MÁS
        ====================================================== */

        const discoverButton =
            document.getElementById(
                "discoverButton"
            );


        discoverButton.addEventListener(
            "click",
            () => {

                document
                    .querySelector(
                        ".badges-section"
                    )
                    .scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );


        /* =====================================================
           CERRAR SESIÓN
        ====================================================== */

        logoutButton?.addEventListener(
            "click",
            () => {


                const confirmed =
                    confirm(
                        "¿Deseas cerrar sesión?"
                    );


                if (!confirmed) {
                    return;
                }


                /*
                    Cuando tengas listo tu login:

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