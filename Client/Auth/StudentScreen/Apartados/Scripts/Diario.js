// ===== Estado =====
let selectedTags = new Set();
let entries = JSON.parse(localStorage.getItem('sentir-entries') || '[]');

// ===== Elementos =====
const dateInput = document.getElementById('entry-date');
const intensityInput = document.getElementById('intensity');
const intensityValue = document.getElementById('intensity-value');
const textArea = document.getElementById('entry-text');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const entriesList = document.getElementById('entries-list');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// ===== Inicialización =====
function init() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Tags
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.dataset.tag;
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
                btn.classList.remove('selected');
            } else {
                selectedTags.add(tag);
                btn.classList.add('selected');
            }
        });
    });

    // Intensidad - actualiza número y color en vivo
    intensityInput.addEventListener('input', () => {
        const val = intensityInput.value;
        intensityValue.textContent = val;

        if (val <= 3) {
            intensityValue.style.background = '#e8f5e9';
            intensityValue.style.color = '#2e7d32';
        } else if (val <= 6) {
            intensityValue.style.background = '#f0ebff';
            intensityValue.style.color = '#7b5cff';
        } else {
            intensityValue.style.background = '#fce4ec';
            intensityValue.style.color = '#c62828';
        }
    });

    // Guardar
    saveBtn.addEventListener('click', saveEntry);

    // Borrar todo
    clearBtn.addEventListener('click', () => {
        showModal('¿Borrar todo el historial? Esta acción no se puede deshacer.', () => {
            entries = [];
            localStorage.removeItem('sentir-entries');
            renderEntries();
        });
    });

    modalCancel.addEventListener('click', hideModal);

    renderEntries();
}

// ===== Guardar =====
function saveEntry() {
    const text = textArea.value.trim();
    if (!text) {
        alert('Escribe algo sobre cómo te sientes ✍️');
        return;
    }

    const entry = {
        id: Date.now(),
        date: dateInput.value,
        intensity: parseInt(intensityInput.value),
        text: text,
        tags: Array.from(selectedTags)
    };

    entries.unshift(entry);
    localStorage.setItem('sentir-entries', JSON.stringify(entries));

    resetForm();
    renderEntries();

    // Feedback
    const original = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Guardado!';
    saveBtn.style.background = 'linear-gradient(135deg, #4caf82, #3d9b70)';
    setTimeout(() => {
        saveBtn.innerHTML = original;
        saveBtn.style.background = '';
    }, 1600);
}

function resetForm() {
    selectedTags.clear();
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('selected'));
    intensityInput.value = 5;
    intensityValue.textContent = '5';
    intensityValue.style.background = '';
    intensityValue.style.color = '';
    textArea.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
}

// ===== Render historial =====
function renderEntries() {
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="empty-msg">Aún no hay entradas. ¡Empieza registrando cómo te sientes!</p>';
        return;
    }

    entriesList.innerHTML = entries.map(entry => {
        const dateFormatted = formatDate(entry.date);
        const tagsHtml = entry.tags && entry.tags.length
            ? `<div class="entry-tags">${entry.tags.map(t => `<span class="entry-tag">${capitalize(t)}</span>`).join('')}</div>`
            : '';

        return `
            <article class="entry-card">
                <button class="entry-delete" data-id="${entry.id}" title="Eliminar">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="entry-top">
                    <div class="entry-mood">
                        <span>Entrada</span>
                    </div>
                    <span class="entry-date">${dateFormatted}</span>
                </div>
                <div class="entry-intensity">Intensidad: ${entry.intensity}/10</div>
                <p class="entry-text">${escapeHtml(entry.text)}</p>
                ${tagsHtml}
            </article>
        `;
    }).join('');

    document.querySelectorAll('.entry-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            showModal('¿Eliminar esta entrada?', () => {
                entries = entries.filter(e => e.id !== id);
                localStorage.setItem('sentir-entries', JSON.stringify(entries));
                renderEntries();
            });
        });
    });
}

// ===== Modal =====
let confirmCallback = null;

function showModal(text, onConfirm) {
    modalText.textContent = text;
    confirmCallback = onConfirm;
    modal.classList.remove('hidden');
    modalConfirm.onclick = () => {
        if (confirmCallback) confirmCallback();
        hideModal();
    };
}

function hideModal() {
    modal.classList.add('hidden');
    confirmCallback = null;
}

// ===== Utils =====
function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start
init();
