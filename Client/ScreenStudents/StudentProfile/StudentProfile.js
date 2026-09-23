const PROFILE_PHOTO_KEY = "sentirStudentProfilePhoto";
const STUDENT_NAME_KEY = "sentirStudentName";
const PROFILE_DATA_KEY = "sentirStudentProfile";
const SETTINGS_KEY = "sentirStudentSettings";

const DEFAULT_PROFILE = {
    name: "Ana Sofía Ramírez Torres",
    document: "1.234.567.890",
    email: "ana.ramirez@estudiante.edu.co",
    phone: "+57 300 123 4567",
    birthdate: "2007-03-12",
    grade: "11° grado",
    program: "Ciencias Sociales",
    role: "Estudiante"
};

let profileData = { ...DEFAULT_PROFILE };
let toastTimer;

document.addEventListener("DOMContentLoaded", function () {
    initSidebar();
    initActiveNavigation();
    initProfileMenu();
    initNotifications();
    initProfileData();
    initPhotoUpload();
    initEditProfile();
    initSettings();
    initPasswordModal();
    initSafeSpace();
    initSearch();
    initModals();
    updateWellbeingSummary();
});

/* =========================
   SIDEBAR
========================= */
function initSidebar() {
    const menuButton = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuButton || !sidebar || !overlay) return;

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    menuButton.addEventListener("click", function () {
        const opening = !sidebar.classList.contains("open");
        sidebar.classList.toggle("open", opening);
        overlay.classList.toggle("active", opening);
        menuButton.setAttribute("aria-expanded", String(opening));
        document.body.style.overflow = opening ? "hidden" : "";
    });

    overlay.addEventListener("click", closeSidebar);

    document.querySelectorAll(".menu-item").forEach(function (item) {
        item.addEventListener("click", function () {
            if (window.innerWidth <= 920) closeSidebar();
        });
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 920) closeSidebar();
    });
}

/* =========================
   ACTIVE NAVIGATION
========================= */
function initActiveNavigation() {
    const currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll(".menu-item").forEach(function (link) {
        link.classList.remove("active");
        link.removeAttribute("aria-current");

        const href = link.getAttribute("href");
        if (!href) return;

        const linkPath = normalizePath(
            new URL(href, window.location.origin).pathname
        );

        const diaryMatch =
            link.dataset.page === "diario" &&
            currentPath.includes("/emotionaldiary/");

        const profileMatch =
            link.dataset.page === "perfil" &&
            currentPath.includes("/studentprofile/");

        if (currentPath === linkPath || diaryMatch || profileMatch) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function normalizePath(path) {
    return (path || "")
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+/g, "/")
        .replace(/\/$/, "")
        .toLowerCase();
}

/* =========================
   HEADER MENUS
========================= */
function initProfileMenu() {
    const button = document.getElementById("profileButton");
    const menu = document.getElementById("profileMenu");

    if (!button || !menu) return;

    button.addEventListener("click", function (event) {
        event.stopPropagation();
        closeNotificationPanel();

        const open = !menu.classList.contains("show");

        menu.classList.toggle("show", open);
        button.classList.toggle("is-open", open);
    });

    menu.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    document.addEventListener("click", function () {
        menu.classList.remove("show");
        button.classList.remove("is-open");
    });
}

function initNotifications() {
    const button = document.getElementById("notificationButton");
    const panel = document.getElementById("notificationPanel");

    if (!button || !panel) return;

    button.addEventListener("click", function (event) {
        event.stopPropagation();

        document.getElementById("profileMenu")?.classList.remove("show");
        document.getElementById("profileButton")?.classList.remove("is-open");

        panel.classList.toggle("show");
    });

    panel.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    document.addEventListener("click", closeNotificationPanel);
}

function closeNotificationPanel() {
    document
        .getElementById("notificationPanel")
        ?.classList.remove("show");
}

/* =========================
   PROFILE DATA + SYNC
========================= */
function initProfileData() {
    const storedProfile = safeParse(
        localStorage.getItem(PROFILE_DATA_KEY),
        null
    );

    if (storedProfile && typeof storedProfile === "object") {
        profileData = {
            ...DEFAULT_PROFILE,
            ...storedProfile
        };
    }

    const storedName = localStorage.getItem(STUDENT_NAME_KEY);

    if (storedName && !storedProfile?.name) {
        profileData.name = storedName;
    }

    localStorage.setItem(
        PROFILE_DATA_KEY,
        JSON.stringify(profileData)
    );

    localStorage.setItem(
        STUDENT_NAME_KEY,
        profileData.name
    );

    renderProfile();
    loadProfilePhoto();

    window.addEventListener("storage", function (event) {
        if (event.key === PROFILE_PHOTO_KEY) {
            loadProfilePhoto();
        }

        if (
            event.key === PROFILE_DATA_KEY ||
            event.key === STUDENT_NAME_KEY
        ) {
            const next = safeParse(
                localStorage.getItem(PROFILE_DATA_KEY),
                null
            );

            if (next) {
                profileData = {
                    ...DEFAULT_PROFILE,
                    ...next
                };
            }

            if (
                event.key === STUDENT_NAME_KEY &&
                event.newValue
            ) {
                profileData.name = event.newValue;
            }

            renderProfile();
        }
    });
}

function renderProfile() {
    setText("displayName", profileData.name);
    setText("displayDocument", profileData.document);
    setText("displayEmail", profileData.email);
    setText(
        "displayPhone",
        profileData.phone || "Sin registrar"
    );

    setText(
        "displayBirthdate",
        formatLongDate(profileData.birthdate)
    );

    setText(
        "displayGrade",
        profileData.grade || "Sin registrar"
    );

    setText(
        "displayProgram",
        profileData.program || "Sin registrar"
    );

    setText(
        "displayRole",
        profileData.role || "Estudiante"
    );

    document
        .querySelectorAll("[data-student-name]")
        .forEach(function (element) {
            element.textContent = getFirstName(
                profileData.name
            );
        });

    updateAvatarFallbacks();
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function getFirstName(name) {
    return (
        (name || "Ana")
            .trim()
            .split(/\s+/)[0] || "Ana"
    );
}

function updateAvatarFallbacks() {
    const firstLetter =
        (profileData.name || "A")
            .trim()
            .charAt(0)
            .toUpperCase() || "A";

    document
        .querySelectorAll(".profile-avatar-fallback")
        .forEach(function (fallback) {
            fallback.textContent = firstLetter;
        });
}

function loadProfilePhoto() {
    const photo = localStorage.getItem(PROFILE_PHOTO_KEY);

    document
        .querySelectorAll("[data-profile-avatar]")
        .forEach(function (avatar) {
            const image = avatar.querySelector(
                ".profile-avatar-image"
            );

            const fallback = avatar.querySelector(
                ".profile-avatar-fallback"
            );

            if (!image || !fallback) return;

            if (photo) {
                image.src = photo;
                image.hidden = false;
                fallback.hidden = true;
            } else {
                image.removeAttribute("src");
                image.hidden = true;
                fallback.hidden = false;
            }
        });

    updateAvatarFallbacks();
}

/* =========================
   PHOTO UPLOAD
========================= */
function initPhotoUpload() {
    const input = document.getElementById("photoInput");

    const buttons = [
        document.getElementById("changePhotoButton"),
        document.getElementById("cameraButton")
    ];

    if (!input) return;

    buttons.forEach(function (button) {
        button?.addEventListener("click", function () {
            input.click();
        });
    });

    input.addEventListener("change", async function () {
        const file = input.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Selecciona una imagen válida.");
            input.value = "";
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            showToast(
                "La imagen es muy pesada. Elige una de menos de 8 MB."
            );

            input.value = "";
            return;
        }

        try {
            const compressed = await resizeProfileImage(
                file,
                640,
                0.86
            );

            localStorage.setItem(
                PROFILE_PHOTO_KEY,
                compressed
            );

            loadProfilePhoto();

            showToast(
                "Foto actualizada. Ya se verá igual en las demás pantallas."
            );
        } catch (error) {
            console.error(error);

            showToast(
                "No pudimos procesar la foto. Intenta con otra imagen."
            );
        } finally {
            input.value = "";
        }
    });
}

function resizeProfileImage(file, maxSize, quality) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            const image = new Image();

            image.onload = function () {
                const sourceSize = Math.min(
                    image.width,
                    image.height
                );

                const sourceX =
                    (image.width - sourceSize) / 2;

                const sourceY =
                    (image.height - sourceSize) / 2;

                const canvasSize = Math.min(
                    maxSize,
                    sourceSize
                );

                const canvas =
                    document.createElement("canvas");

                canvas.width = canvasSize;
                canvas.height = canvasSize;

                const context = canvas.getContext("2d");

                if (!context) {
                    reject(
                        new Error("Canvas no disponible")
                    );
                    return;
                }

                context.drawImage(
                    image,
                    sourceX,
                    sourceY,
                    sourceSize,
                    sourceSize,
                    0,
                    0,
                    canvasSize,
                    canvasSize
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        quality
                    )
                );
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* =========================
   EDIT PROFILE
========================= */
function initEditProfile() {
    const editButton =
        document.getElementById(
            "editProfileButton"
        );

    const saveMainButton =
        document.getElementById(
            "saveMainButton"
        );

    const form =
        document.getElementById(
            "editProfileForm"
        );

    function openEditor() {
        fillProfileForm();
        openModal("editProfileModal");
    }

    editButton?.addEventListener(
        "click",
        openEditor
    );

    saveMainButton?.addEventListener(
        "click",
        openEditor
    );

    form?.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const nextProfile = {
                ...profileData,

                name:
                    document
                        .getElementById(
                            "nameInput"
                        )
                        .value.trim(),

                document:
                    document
                        .getElementById(
                            "documentInput"
                        )
                        .value.trim(),

                email:
                    document
                        .getElementById(
                            "emailInput"
                        )
                        .value.trim(),

                phone:
                    document
                        .getElementById(
                            "phoneInput"
                        )
                        .value.trim(),

                birthdate:
                    document
                        .getElementById(
                            "birthdateInput"
                        )
                        .value,

                grade:
                    document
                        .getElementById(
                            "gradeInput"
                        )
                        .value.trim(),

                program:
                    document
                        .getElementById(
                            "programInput"
                        )
                        .value.trim(),

                role:
                    profileData.role ||
                    "Estudiante"
            };

            if (
                !nextProfile.name ||
                !nextProfile.document ||
                !nextProfile.email ||
                !nextProfile.birthdate
            ) {
                showToast(
                    "Completa los campos obligatorios."
                );

                return;
            }

            profileData = nextProfile;

            localStorage.setItem(
                PROFILE_DATA_KEY,
                JSON.stringify(profileData)
            );

            localStorage.setItem(
                STUDENT_NAME_KEY,
                profileData.name
            );

            renderProfile();

            closeModal(
                "editProfileModal"
            );

            showToast(
                "Tus datos quedaron guardados correctamente."
            );
        }
    );
}

function fillProfileForm() {
    document.getElementById("nameInput").value =
        profileData.name || "";

    document.getElementById("documentInput").value =
        profileData.document || "";

    document.getElementById("emailInput").value =
        profileData.email || "";

    document.getElementById("phoneInput").value =
        profileData.phone || "";

    document.getElementById("birthdateInput").value =
        profileData.birthdate || "";

    document.getElementById("gradeInput").value =
        profileData.grade || "";

    document.getElementById("programInput").value =
        profileData.program || "";
}

/* =========================
   SETTINGS
========================= */
function initSettings() {
    const openButton =
        document.getElementById(
            "settingsButton"
        );

    const saveButton =
        document.getElementById(
            "saveSettingsButton"
        );

    openButton?.addEventListener(
        "click",
        function () {
            const settings =
                getSettings();

            document.getElementById(
                "remindersToggle"
            ).checked =
                settings.reminders;

            document.getElementById(
                "animationsToggle"
            ).checked =
                settings.animations;

            document.getElementById(
                "privacyToggle"
            ).checked =
                settings.privateProfile;

            openModal("settingsModal");
        }
    );

    saveButton?.addEventListener(
        "click",
        function () {
            const settings = {
                reminders:
                    document.getElementById(
                        "remindersToggle"
                    ).checked,

                animations:
                    document.getElementById(
                        "animationsToggle"
                    ).checked,

                privateProfile:
                    document.getElementById(
                        "privacyToggle"
                    ).checked
            };

            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            applySettings(settings);

            closeModal(
                "settingsModal"
            );

            showToast(
                "Configuración guardada."
            );
        }
    );

    applySettings(
        getSettings()
    );
}

function getSettings() {
    return {
        reminders: true,
        animations: true,
        privateProfile: false,

        ...safeParse(
            localStorage.getItem(
                SETTINGS_KEY
            ),
            {}
        )
    };
}

function applySettings(settings) {
    document.body.classList.toggle(
        "reduce-motion",
        !settings.animations
    );

    document
        .querySelectorAll(".info-item")
        .forEach(function (item, index) {
            if (!settings.privateProfile) {
                item.style.display = "flex";
                return;
            }

            item.style.display =
                [0, 3, 7].includes(index)
                    ? "flex"
                    : "none";
        });
}

/* =========================
   PASSWORD
========================= */
function initPasswordModal() {
    document
        .getElementById(
            "changePasswordButton"
        )
        ?.addEventListener(
            "click",
            function () {
                document
                    .getElementById(
                        "passwordForm"
                    )
                    ?.reset();

                openModal(
                    "passwordModal"
                );
            }
        );

    document
        .querySelectorAll(
            "[data-password-target]"
        )
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    const input =
                        document.getElementById(
                            button.dataset
                                .passwordTarget
                        );

                    if (!input) return;

                    const showing =
                        input.type === "text";

                    input.type =
                        showing
                            ? "password"
                            : "text";

                    button.innerHTML =
                        showing
                            ? '<i class="fa-regular fa-eye"></i>'
                            : '<i class="fa-regular fa-eye-slash"></i>';
                }
            );
        });

    document
        .getElementById(
            "passwordForm"
        )
        ?.addEventListener(
            "submit",
            function (event) {
                event.preventDefault();

                const password =
                    document.getElementById(
                        "newPassword"
                    ).value;

                const confirm =
                    document.getElementById(
                        "confirmPassword"
                    ).value;

                if (password.length < 8) {
                    showToast(
                        "La nueva clave debe tener mínimo 8 caracteres."
                    );

                    return;
                }

                if (password !== confirm) {
                    showToast(
                        "Las claves no coinciden."
                    );

                    return;
                }

                localStorage.setItem(
                    "sentirPasswordChangeRequestedAt",
                    new Date().toISOString()
                );

                closeModal(
                    "passwordModal"
                );

                showToast(
                    "Validación correcta. Conecta este formulario con tu backend para aplicar la nueva clave."
                );
            }
        );
}

/* =========================
   SAFE SPACE
========================= */
function initSafeSpace() {
    document
        .getElementById(
            "safeSpaceButton"
        )
        ?.addEventListener(
            "click",
            function () {
                openModal(
                    "safeSpaceModal"
                );
            }
        );
}

/* =========================
   SEARCH
========================= */
function initSearch() {
    const search =
        document.getElementById(
            "profileSearch"
        );

    if (!search) return;

    const options = [
        {
            title: "Diario emocional",
            description: "Registra cómo te sientes.",
            icon: "fa-book-open",
            href: "/Sentir/Client/ScreenStudents/EmotionalDiary/EmotionalDiary.html",
            terms: [
                "diario",
                "emocion",
                "emocional",
                "escribir"
            ]
        },

        {
            title: "Seguimiento",
            description: "Consulta tu evolución emocional.",
            icon: "fa-chart-line",
            href: "/Sentir/Client/ScreenStudents/Follow-up/Follow-up.html",
            terms: [
                "seguimiento",
                "grafica",
                "evolucion",
                "progreso"
            ]
        },

        {
            title: "Insignias",
            description: "Mira los logros que has conseguido.",
            icon: "fa-star",
            href: "/Sentir/Client/ScreenStudents/Badges/Badges.html",
            terms: [
                "insignia",
                "insignias",
                "logros",
                "estrella"
            ]
        },

        {
            title: "Recursos de relajación",
            description: "Respira y encuentra un momento de calma.",
            icon: "fa-leaf",
            href: "/Sentir/Client/ScreenStudents/Relaxation/Relaxation.html",
            terms: [
                "relajacion",
                "respiracion",
                "calma",
                "recursos"
            ]
        },

        {
            title: "Pedir ayuda",
            description: "Accede a tu espacio de apoyo.",
            icon: "fa-life-ring",
            href: "/Sentir/Client/ScreenStudents/AskForHelp/AskForHelp.html",
            terms: [
                "ayuda",
                "apoyo",
                "alerta"
            ]
        }
    ];

    search.addEventListener(
        "keydown",
        function (event) {
            if (event.key !== "Enter") return;

            event.preventDefault();

            const term =
                normalizeText(
                    search.value.trim()
                );

            if (!term) return;

            const results =
                options.filter(
                    function (option) {
                        const haystack =
                            normalizeText(
                                [
                                    option.title,
                                    option.description,
                                    ...option.terms
                                ].join(" ")
                            );

                        return (
                            haystack.includes(
                                term
                            ) ||
                            term
                                .split(/\s+/)
                                .some(
                                    function (
                                        word
                                    ) {
                                        return (
                                            word.length >
                                                2 &&
                                            haystack.includes(
                                                word
                                            )
                                        );
                                    }
                                )
                        );
                    }
                );

            renderSearchResults(
                results,
                search.value.trim()
            );

            openModal(
                "searchModal"
            );
        }
    );
}

function renderSearchResults(
    results,
    originalTerm
) {
    const container =
        document.getElementById(
            "searchResults"
        );

    const text =
        document.getElementById(
            "searchText"
        );

    if (!container || !text) return;

    text.textContent =
        results.length
            ? `Resultados relacionados con “${originalTerm}”.`
            : `No encontramos coincidencias para “${originalTerm}”. Prueba con diario, relajación, seguimiento, insignias o ayuda.`;

    container.innerHTML =
        results.length
            ? results
                  .map(function (item) {
                      return `
                        <a class="search-result" href="${item.href}">
                            <span class="search-result-icon">
                                <i class="fa-solid ${item.icon}"></i>
                            </span>

                            <span>
                                <strong>
                                    ${escapeHTML(item.title)}
                                </strong>

                                <small>
                                    ${escapeHTML(item.description)}
                                </small>
                            </span>

                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    `;
                  })
                  .join("")
            : `
                <div class="notification-empty">
                    <span class="notification-empty-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </span>

                    <p>
                        No hay resultados por ahora.
                    </p>
                </div>
            `;
}

function normalizeText(value) {
    return (value || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase();
}

/* =========================
   WELLBEING SUMMARY
========================= */
function updateWellbeingSummary() {
    const entries =
        safeParse(
            localStorage.getItem(
                "sentirDiaryEntries"
            ),
            []
        );

    const badges =
        safeParse(
            localStorage.getItem(
                "sentirUnlockedBadges"
            ),
            []
        );

    const validEntries =
        Array.isArray(entries)
            ? entries
            : [];

    const validBadges =
        Array.isArray(badges)
            ? badges
            : [];

    const now =
        new Date();

    const monthlyEntries =
        validEntries.filter(
            function (entry) {
                const date =
                    new Date(
                        entry.createdAt ||
                            entry.date ||
                            0
                    );

                return (
                    date.getFullYear() ===
                        now.getFullYear() &&
                    date.getMonth() ===
                        now.getMonth()
                );
            }
        );

    setText(
        "diaryCount",
        String(monthlyEntries.length)
    );

    setText(
        "badgeCount",
        String(validBadges.length)
    );

    if (validEntries.length) {
        const sorted =
            [...validEntries].sort(
                function (a, b) {
                    return (
                        new Date(
                            b.createdAt ||
                                b.date ||
                                0
                        ) -
                        new Date(
                            a.createdAt ||
                                a.date ||
                                0
                        )
                    );
                }
            );

        const emotion =
            sorted[0].emotion ||
            "Registrada";

        setText(
            "lastEmotionText",
            emotion
        );

        setText(
            "lastEmotionEmoji",
            emotionEmoji(emotion)
        );
    }
}

function emotionEmoji(emotion) {
    const normalized =
        normalizeText(emotion);

    if (
        normalized.includes(
            "muy bien"
        )
    ) {
        return "😊";
    }

    if (
        normalized === "bien" ||
        normalized.includes(
            "tranquil"
        )
    ) {
        return "🙂";
    }

    if (
        normalized.includes(
            "regular"
        )
    ) {
        return "😐";
    }

    if (
        normalized === "mal"
    ) {
        return "🙁";
    }

    if (
        normalized.includes(
            "muy mal"
        )
    ) {
        return "😣";
    }

    return "💜";
}

/* =========================
   MODALS
========================= */
function initModals() {
    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    closeModal(
                        button.dataset.closeModal
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(function (overlay) {
            overlay.addEventListener(
                "click",
                function (event) {
                    if (
                        event.target ===
                        overlay
                    ) {
                        closeModal(
                            overlay.id
                        );
                    }
                }
            );
        });

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(
                    function (modal) {
                        closeModal(
                            modal.id
                        );
                    }
                );
        }
    );
}

function openModal(id) {
    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}

function closeModal(id) {
    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".modal-overlay.show"
        )
    ) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}

/* =========================
   HELPERS
========================= */
function formatLongDate(value) {
    if (!value) {
        return "Sin registrar";
    }

    const date =
        new Date(
            `${value}T12:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "es-CO",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

function safeParse(
    value,
    fallback
) {
    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function escapeHTML(value) {
    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}

function showToast(message) {
    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;

    clearTimeout(
        toastTimer
    );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    toastTimer =
        setTimeout(
            function () {
                toast.classList.remove(
                    "show"
                );
            },
            3200
        );
}