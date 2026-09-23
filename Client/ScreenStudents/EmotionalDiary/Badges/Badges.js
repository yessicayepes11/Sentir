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


        const filterButtons =
            document.querySelectorAll(".filter-button");

        const badgeCards =
            document.querySelectorAll(".badge-card");


        const badgeSearch =
            document.getElementById("badgeSearch");


        const badgeModalOverlay =
            document.getElementById("badgeModalOverlay");

        const closeBadgeModal =
            document.getElementById("closeBadgeModal");


        const modalBadgeIcon =
            document.getElementById("modalBadgeIcon");

        const modalCategory =
            document.getElementById("modalCategory");

        const modalBadgeTitle =
            document.getElementById("modalBadgeTitle");

        const modalBadgeDescription =
            document.getElementById("modalBadgeDescription");

        const modalBadgeStatus =
            document.getElementById("modalBadgeStatus");


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


                profileDropdown.classList.remove(
                    "show"
                );


                clearTimeout(
                    notificationTimer
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
                        3500
                    );

            }
        );


        /* =====================================================
           FILTROS DE INSIGNIAS
        ====================================================== */

        let currentFilter =
            "all";


        filterButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {


                        filterButtons.forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        currentFilter =
                            button.dataset.filter;


                        filterBadges();

                    }
                );

            }
        );


        /* =====================================================
           BUSCADOR
        ====================================================== */

        badgeSearch.addEventListener(
            "input",
            filterBadges
        );


        function filterBadges() {


            const searchValue =

                badgeSearch
                    .value
                    .trim()
                    .toLowerCase();


            badgeCards.forEach(
                (card) => {


                    const category =

                        card.dataset.category;


                    const name =

                        card.dataset.name
                            .toLowerCase();


                    const categoryMatch =

                        currentFilter === "all" ||

                        category === currentFilter;


                    const searchMatch =

                        !searchValue ||

                        name.includes(
                            searchValue
                        );


                    if (
                        categoryMatch &&
                        searchMatch
                    ) {

                        card.classList.remove(
                            "hide"
                        );

                    }

                    else {

                        card.classList.add(
                            "hide"
                        );

                    }

                }
            );

        }


        /* =====================================================
           MODAL DE INSIGNIAS
        ====================================================== */

        badgeCards.forEach(
            (card) => {

                card.addEventListener(
                    "click",
                    () => {

                        openBadgeModal(
                            card
                        );

                    }
                );

            }
        );


        function openBadgeModal(
            card
        ) {


            const title =

                card.querySelector("h3")
                    .textContent
                    .trim();


            const description =

                card.querySelector(
                    ":scope > p"
                )
                    .textContent
                    .trim();


            const category =

                card.querySelector(
                    ".badge-category"
                )
                    .textContent
                    .trim();


            const badgeIcon =

                card.querySelector(
                    ".badge-icon i"
                );


            const statusElement =

                card.querySelector(
                    ".badge-status"
                );


            const progressElement =

                card.querySelector(
                    ".small-progress"
                );


            modalBadgeTitle.textContent =
                title;


            modalBadgeDescription.textContent =
                description;


            modalCategory.textContent =
                category;


            /*
               Copiamos el ícono
            */

            modalBadgeIcon.innerHTML = "";


            const clonedIcon =

                badgeIcon.cloneNode(
                    true
                );


            modalBadgeIcon.appendChild(
                clonedIcon
            );


            /*
               ESTADO
            */

            if (statusElement) {

                modalBadgeStatus.innerHTML =
                    statusElement.innerHTML;

            }

            else if (progressElement) {


                const progressText =

                    progressElement
                        .querySelector("span")
                        .textContent
                        .trim();


                modalBadgeStatus.innerHTML =

                    `
                    <i class="fa-solid fa-chart-line"></i>
                    Progreso ${progressText}
                    `;

            }

            else {

                modalBadgeStatus.innerHTML =
                    "Sigue avanzando";

            }


            badgeModalOverlay.classList.add(
                "show"
            );


            document.body.classList.add(
                "no-scroll"
            );

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

                    profileDropdown.classList.remove(
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

        logoutButton.addEventListener(
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