document.addEventListener("DOMContentLoaded", function () {
    initSidebar();
    initActiveNavigation();
    initProfileMenu();
    initProfileSync();
    initEmotions();
    initIntensity();
    initTags();
    initTextAreas();
    initSaveDiary();
    initHistoryModal();
});

/* =========================
   SIDEBAR
========================= */
function initSidebar() {
    const menuButton = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuButton || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        menuButton.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    menuButton.addEventListener("click", function () {
        if (sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
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
   ACTIVE NAV
========================= */
function initActiveNavigation() {
    const links = document.querySelectorAll(".menu-item");
    const currentPath = normalizePath(window.location.pathname);

    links.forEach(function (link) {
        link.classList.remove("active");
        link.removeAttribute("aria-current");

        const href = link.getAttribute("href");
        if (!href) return;

        const linkPath = normalizePath(new URL(href, window.location.origin).pathname);

        const exactMatch = currentPath === linkPath;
        const diaryMatch =
            link.dataset.page === "diario" &&
            currentPath.includes("/emotionaldiary/");

        if (exactMatch || diaryMatch) {
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
   PROFILE MENU
========================= */
function initProfileMenu() {
    const button = document.getElementById("profileButton");
    const menu = document.getElementById("profileMenu");

    if (!button || !menu) return;

    button.addEventListener("click", function (event) {
        event.stopPropagation();
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

/* =========================
   PROFILE SYNC
========================= */
const PROFILE_PHOTO_KEY = "sentirStudentProfilePhoto";
const STUDENT_NAME_KEY = "sentirStudentName";

function initProfileSync() {
    loadProfilePhoto();
    loadStudentName();

    window.addEventListener("storage", function (event) {
        if (event.key === PROFILE_PHOTO_KEY) loadProfilePhoto();
        if (event.key === STUDENT_NAME_KEY) loadStudentName();
    });
}

function loadProfilePhoto() {
    const photo = localStorage.getItem(PROFILE_PHOTO_KEY);

    document.querySelectorAll("[data-profile-avatar]").forEach(function (avatar) {
        const image = avatar.querySelector(".profile-avatar-image");
        const fallback = avatar.querySelector(".profile-avatar-fallback");

        if (!image || !fallback) return;

        if (photo) {
            image.src = photo;
            image.hidden = false;
            fallback.hidden = true;
        } else {
            image.hidden = true;
            fallback.hidden = false;
        }
    });
}

function loadStudentName() {
    const name = localStorage.getItem(STUDENT_NAME_KEY) || "Ana";

    document.querySelectorAll("[data-student-name]").forEach(function (element) {
        element.textContent = name;
    });

    const firstLetter = name.trim().charAt(0).toUpperCase() || "A";

    document.querySelectorAll(".profile-avatar-fallback").forEach(function (element) {
        element.textContent = firstLetter;
    });
}

/* =========================
   EMOTIONS
========================= */
let selectedEmotion = "";
let selectedEmotionValue = 0;

function initEmotions() {
    const emotions = document.querySelectorAll(".emotion-card");

    emotions.forEach(function (emotion) {
        emotion.addEventListener("click", function () {
            emotions.forEach(function (item) {
                item.classList.remove("selected");
            });

            emotion.classList.add("selected");
            selectedEmotion = emotion.dataset.emotion;
            selectedEmotionValue = Number(emotion.dataset.value);

            const radio = emotion.querySelector('input[type="radio"]');
            if (radio) {
                if (radio.checked) {
                    radio.checked = false;
                    void radio.offsetWidth;
                }
                radio.checked = true;
            }

            localStorage.setItem("sentirDiaryCurrentEmotion", selectedEmotion);
            localStorage.setItem("sentirDiaryCurrentEmotionValue", String(selectedEmotionValue));
        });
    });

    const savedEmotion = localStorage.getItem("sentirDiaryCurrentEmotion");
    const savedEmotionValue = Number(localStorage.getItem("sentirDiaryCurrentEmotionValue") || "0");

    if (savedEmotion) {
        const matched = Array.from(emotions).find(function (item) {
            return item.dataset.emotion === savedEmotion;
        });

        if (matched) {
            matched.classList.add("selected");
            const radio = matched.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            selectedEmotion = savedEmotion;
            selectedEmotionValue = savedEmotionValue;
        }
    }
}

/* =========================
   INTENSITY
========================= */
function initIntensity() {
    const range = document.getElementById("intensityRange");
    if (!range) return;

    const stored = localStorage.getItem("sentirDiaryIntensity");
    if (stored) range.value = stored;

    updateRangeBackground(range);

    range.addEventListener("input", function () {
        updateRangeBackground(range);
        localStorage.setItem("sentirDiaryIntensity", range.value);
    });
}

function updateRangeBackground(range) {
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);

    const percentage = ((value - min) / (max - min)) * 100;

    range.style.background =
        "linear-gradient(to right, #744ff3 0%, #744ff3 " +
        percentage +
        "%, #ded8f1 " +
        percentage +
        "%, #ded8f1 100%)";
}

/* =========================
   TAGS
========================= */
let selectedTags = [];

function initTags() {
    const tags = document.querySelectorAll(".tag-chip");
    const stored = localStorage.getItem("sentirDiaryTags");

    if (stored) {
        try {
            selectedTags = JSON.parse(stored);
        } catch {
            selectedTags = [];
        }
    }

    tags.forEach(function (tag) {
        const value = tag.dataset.tag;

        if (selectedTags.includes(value)) {
            tag.classList.add("active");
        }

        tag.addEventListener("click", function () {
            const active = tag.classList.toggle("active");

            if (active) {
                if (!selectedTags.includes(value)) {
                    selectedTags.push(value);
                }
            } else {
                selectedTags = selectedTags.filter(function (item) {
                    return item !== value;
                });
            }

            localStorage.setItem("sentirDiaryTags", JSON.stringify(selectedTags));
        });
    });
}

/* =========================
   TEXTAREAS
========================= */
function initTextAreas() {
    const diaryText = document.getElementById("diaryText");
    const charCount = document.getElementById("characterCount");

    const optionalSituation = document.getElementById("optionalSituation");
    const optionalThought = document.getElementById("optionalThought");
    const optionalNeed = document.getElementById("optionalNeed");

    if (diaryText) {
        diaryText.value = localStorage.getItem("sentirDiaryDraft") || "";
        updateCounter();

        diaryText.addEventListener("input", function () {
            localStorage.setItem("sentirDiaryDraft", diaryText.value);
            updateCounter();
        });
    }

    if (optionalSituation) {
        optionalSituation.value = localStorage.getItem("sentirOptionalSituation") || "";
        optionalSituation.addEventListener("input", function () {
            localStorage.setItem("sentirOptionalSituation", optionalSituation.value);
        });
    }

    if (optionalThought) {
        optionalThought.value = localStorage.getItem("sentirOptionalThought") || "";
        optionalThought.addEventListener("input", function () {
            localStorage.setItem("sentirOptionalThought", optionalThought.value);
        });
    }

    if (optionalNeed) {
        optionalNeed.value = localStorage.getItem("sentirOptionalNeed") || "";
        optionalNeed.addEventListener("input", function () {
            localStorage.setItem("sentirOptionalNeed", optionalNeed.value);
        });
    }

    function updateCounter() {
        if (charCount && diaryText) {
            charCount.textContent = diaryText.value.length;
        }
    }
}

/* =========================
   SAVE DIARY
========================= */
function initSaveDiary() {
    const saveButton = document.getElementById("saveDiary");
    const savedModal = document.getElementById("savedModal");
    const closeSavedModal = document.getElementById("closeSavedModal");
    const finishSavedModal = document.getElementById("finishSavedModal");

    if (!saveButton) return;

    saveButton.addEventListener("click", function () {
        const diaryText = document.getElementById("diaryText");
        const intensityRange = document.getElementById("intensityRange");
        const optionalSituation = document.getElementById("optionalSituation");
        const optionalThought = document.getElementById("optionalThought");
        const optionalNeed = document.getElementById("optionalNeed");

        if (!selectedEmotion) {
            showToast("Primero selecciona cómo te sientes.");
            document.querySelector(".emotion-grid")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            return;
        }

        const entry = {
            id: Date.now(),
            emotion: selectedEmotion,
            emotionValue: selectedEmotionValue,
            intensity: Number(intensityRange?.value || 1),
            tags: selectedTags,
            situation: optionalSituation?.value.trim() || "",
            thought: optionalThought?.value.trim() || "",
            need: optionalNeed?.value.trim() || "",
            text: diaryText?.value.trim() || "",
            createdAt: new Date().toISOString()
        };

        const entries = getStoredEntries();
        entries.push(entry);

        localStorage.setItem("sentirDiaryEntries", JSON.stringify(entries));

        clearCurrentDraft();

        openModal(savedModal);
        renderHistoryList();
    });

    closeSavedModal?.addEventListener("click", function () {
        closeModal(savedModal);
    });

    finishSavedModal?.addEventListener("click", function () {
        closeModal(savedModal);
    });

    savedModal?.addEventListener("click", function (event) {
        if (event.target === savedModal) closeModal(savedModal);
    });
}

function clearCurrentDraft() {
    const diaryText = document.getElementById("diaryText");
    const optionalSituation = document.getElementById("optionalSituation");
    const optionalThought = document.getElementById("optionalThought");
    const optionalNeed = document.getElementById("optionalNeed");
    const counter = document.getElementById("characterCount");

    localStorage.removeItem("sentirDiaryDraft");
    localStorage.removeItem("sentirOptionalSituation");
    localStorage.removeItem("sentirOptionalThought");
    localStorage.removeItem("sentirOptionalNeed");
    localStorage.removeItem("sentirDiaryTags");

    if (diaryText) diaryText.value = "";
    if (optionalSituation) optionalSituation.value = "";
    if (optionalThought) optionalThought.value = "";
    if (optionalNeed) optionalNeed.value = "";
    if (counter) counter.textContent = "0";

    selectedTags = [];
    document.querySelectorAll(".tag-chip").forEach(function (tag) {
        tag.classList.remove("active");
    });
}

function getStoredEntries() {
    const stored = localStorage.getItem("sentirDiaryEntries");
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/* =========================
   HISTORY MODAL
========================= */
function initHistoryModal() {
    const historyModal = document.getElementById("historyModal");
    const openButton = document.getElementById("openHistoryModal");
    const closeButton = document.getElementById("closeHistoryModal");

    openButton?.addEventListener("click", function () {
        renderHistoryList();
        openModal(historyModal);
    });

    closeButton?.addEventListener("click", function () {
        closeModal(historyModal);
    });

    historyModal?.addEventListener("click", function (event) {
        if (event.target === historyModal) closeModal(historyModal);
    });
}

function renderHistoryList() {
    const list = document.getElementById("historyList");
    const detail = document.getElementById("historyDetail");
    if (!list || !detail) return;

    const entries = getStoredEntries().sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    list.innerHTML = "";
    detail.innerHTML = "";

    if (!entries.length) {
        list.innerHTML = `
            <div class="history-empty">
                Aún no has guardado entradas en tu diario.
                Cuando guardes una, aparecerá aquí tu emoción del día,
                lo que escribiste y tus respuestas opcionales.
            </div>
        `;

        detail.innerHTML = `
            <div class="history-empty">
                Aquí se mostrará el detalle de cada entrada que abras.
            </div>
        `;
        return;
    }

    entries.forEach(function (entry, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "history-item" + (index === 0 ? " active" : "");

        button.innerHTML = `
            <div class="history-item-top">
                <span class="history-date">${formatDate(entry.createdAt)}</span>
                <span class="history-badge">${getEmotionEmoji(entry.emotion)} ${entry.emotion}</span>
            </div>
            <div class="history-snippet">${getSnippet(entry.text, entry.situation, entry.thought, entry.need)}</div>
        `;

        button.addEventListener("click", function () {
            list.querySelectorAll(".history-item").forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");
            renderHistoryDetail(entry);
        });

        list.appendChild(button);
    });

    renderHistoryDetail(entries[0]);
}

function renderHistoryDetail(entry) {
    const detail = document.getElementById("historyDetail");
    if (!detail) return;

    const tagsHTML = entry.tags && entry.tags.length
        ? entry.tags.map(function (tag) {
            return `<span class="detail-tag">${tag}</span>`;
        }).join("")
        : `<span class="no-content">No seleccionó etiquetas.</span>`;

    detail.innerHTML = `
        <div class="detail-card">
            <div class="detail-top">
                <div>
                    <span class="modal-pill">ENTRADA DEL DIARIO</span>
                    <h4>${formatDate(entry.createdAt)}</h4>
                    <p>Así te sentiste ese día.</p>
                </div>
            </div>

            <div class="detail-emotion">
                <div class="detail-emoji ${emotionClassName(entry.emotion)}">
                    ${getEmotionEmoji(entry.emotion)}
                </div>
                <div>
                    <strong>${entry.emotion}</strong>
                    <span>Intensidad: ${entry.intensity}/10</span>
                </div>
            </div>

            <div class="detail-grid">
                <div class="detail-box">
                    <h5>Temas seleccionados</h5>
                    <div class="detail-tags">${tagsHTML}</div>
                </div>

                <div class="detail-box">
                    <h5>Lo que necesito</h5>
                    <p>${entry.need ? escapeHTML(entry.need) : '<span class="no-content">No escribió nada aquí.</span>'}</p>
                </div>

                <div class="detail-box">
                    <h5>Algo que está pasando</h5>
                    <p>${entry.situation ? escapeHTML(entry.situation) : '<span class="no-content">No escribió nada aquí.</span>'}</p>
                </div>

                <div class="detail-box">
                    <h5>Algo que pienso sobre eso</h5>
                    <p>${entry.thought ? escapeHTML(entry.thought) : '<span class="no-content">No escribió nada aquí.</span>'}</p>
                </div>
            </div>

            <div class="detail-text">
                <h5>Lo que escribí ese día</h5>
                <p>${entry.text ? escapeHTML(entry.text) : '<span class="no-content">Ese día no escribió texto libre.</span>'}</p>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function getSnippet(text, situation, thought, need) {
    const fullText = text || situation || thought || need || "Entrada guardada sin texto.";
    return escapeHTML(fullText.length > 90 ? fullText.slice(0, 90) + "..." : fullText);
}

function getEmotionEmoji(emotion) {
    switch (emotion) {
        case "Muy bien": return "😊";
        case "Bien": return "🙂";
        case "Regular": return "😐";
        case "Mal": return "🙁";
        case "Muy mal": return "😣";
        default: return "💜";
    }
}

function emotionClassName(emotion) {
    switch (emotion) {
        case "Muy bien": return "muy-bien";
        case "Bien": return "bien";
        case "Regular": return "regular";
        case "Mal": return "mal";
        case "Muy mal": return "muy-mal";
        default: return "regular";
    }
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML.replace(/\n/g, "<br>");
}

/* =========================
   MODALS
========================= */
function openModal(modal) {
    if (!modal) return;
    modal.classList.add("show");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    document.querySelectorAll(".modal-overlay.show").forEach(function (modal) {
        closeModal(modal);
    });
});

/* =========================
   TOAST
========================= */
let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2700);
}