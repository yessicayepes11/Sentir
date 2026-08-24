// ===== Definición de insignias =====
const BADGES = [
    {
        id: 'primera-entrada',
        name: 'Primera hoja',
        emoji: '🌱',
        short: 'Escribe tu primera entrada',
        description: 'Das el primer paso al registrar cómo te sientes. ¡El comienzo de tu viaje emocional!',
        requirement: 'Escribe al menos 1 entrada en el diario.',
        check: (entries) => entries.length >= 1
    },
    {
        id: 'constancia',
        name: 'Constancia',
        emoji: '🔥',
        short: '3 entradas registradas',
        description: 'Has mantenido el hábito de escribir. La constancia es clave para conocerte mejor.',
        requirement: 'Registra al menos 3 entradas.',
        check: (entries) => entries.length >= 3
    },
    {
        id: 'explorador',
        name: 'Explorador',
        emoji: '🧭',
        short: 'Usa 3 etiquetas distintas',
        description: 'Exploras diferentes áreas de tu vida al etiquetar tus emociones.',
        requirement: 'Usa al menos 3 etiquetas diferentes en total.',
        check: (entries) => {
            const tags = new Set();
            entries.forEach(e => (e.tags || []).forEach(t => tags.add(t)));
            return tags.size >= 3;
        }
    },
    {
        id: 'intensidad',
        name: 'Alta intensidad',
        emoji: '⚡',
        short: 'Registra intensidad 8+',
        description: 'Has reconocido y registrado un momento de alta carga emocional.',
        requirement: 'Guarda una entrada con intensidad de 8 o más.',
        check: (entries) => entries.some(e => e.intensity >= 8)
    },
    {
        id: 'reflexivo',
        name: 'Reflexivo',
        emoji: '📝',
        short: 'Escribe 100+ caracteres',
        description: 'Te tomaste el tiempo de profundizar en tus sentimientos con un texto largo.',
        requirement: 'Escribe una entrada con 100 caracteres o más.',
        check: (entries) => entries.some(e => (e.text || '').length >= 100)
    },
    {
        id: 'semanal',
        name: 'Semana activa',
        emoji: '📅',
        short: '5 entradas en total',
        description: 'Cinco momentos registrados. Estás construyendo un verdadero seguimiento emocional.',
        requirement: 'Alcanza 5 entradas en tu diario.',
        check: (entries) => entries.length >= 5
    },
    {
        id: 'completo',
        name: 'Etiquetador pro',
        emoji: '🏷️',
        short: 'Usa todas las etiquetas',
        description: 'Has usado todas las etiquetas disponibles: Trabajo, Familia, Amigos, Salud, Amor y Estudio.',
        requirement: 'Usa las 6 etiquetas al menos una vez.',
        check: (entries) => {
            const all = ['trabajo', 'familia', 'amigos', 'salud', 'amor', 'estudio'];
            const used = new Set();
            entries.forEach(e => (e.tags || []).forEach(t => used.add(t)));
            return all.every(t => used.has(t));
        }
    },
    {
        id: 'maestro',
        name: 'Maestro emocional',
        emoji: '🏆',
        short: '10 entradas registradas',
        description: 'Has alcanzado un nivel avanzado de autoconocimiento. ¡Eres un verdadero maestro de Sentir!',
        requirement: 'Registra 10 entradas en el diario.',
        check: (entries) => entries.length >= 10
    }
];

// ===== Estado =====
let entries = JSON.parse(localStorage.getItem('sentir-entries') || '[]');

// ===== Elementos =====
const badgesGrid = document.getElementById('badges-grid');
const unlockedCountEl = document.getElementById('unlocked-count');
const totalCountEl = document.getElementById('total-count');
const progressPercentEl = document.getElementById('progress-percent');
const progressFillEl = document.getElementById('progress-fill');
const badgeModal = document.getElementById('badge-modal');
const modalClose = document.getElementById('modal-close');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalStatus = document.getElementById('modal-status');
const modalRequirement = document.getElementById('modal-requirement');

// ===== Render =====
function getUnlockedBadges() {
    return BADGES.filter(b => b.check(entries));
}

function render() {
    const unlocked = getUnlockedBadges();
    const unlockedIds = new Set(unlocked.map(b => b.id));
    const total = BADGES.length;
    const count = unlocked.length;
    const percent = Math.round((count / total) * 100);

    unlockedCountEl.textContent = count;
    totalCountEl.textContent = total;
    progressPercentEl.textContent = percent + '%';
    progressFillEl.style.width = percent + '%';

    badgesGrid.innerHTML = BADGES.map(badge => {
        const isUnlocked = unlockedIds.has(badge.id);
        return `
            <article class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" data-id="${badge.id}">
                <div class="badge-icon-wrap">
                    <span>${badge.emoji}</span>
                    <div class="badge-lock"><i class="fa-solid fa-lock"></i></div>
                </div>
                <h3 class="badge-name">${badge.name}</h3>
                <p class="badge-short">${badge.short}</p>
                <span class="badge-status">${isUnlocked ? 'Desbloqueada' : 'Bloqueada'}</span>
            </article>
        `;
    }).join('');

    // Click en cada badge
    document.querySelectorAll('.badge-card').forEach(card => {
        card.addEventListener('click', () => {
            const badge = BADGES.find(b => b.id === card.dataset.id);
            if (badge) openModal(badge, unlockedIds.has(badge.id));
        });
    });
}

function openModal(badge, isUnlocked) {
    modalIcon.textContent = badge.emoji;
    modalTitle.textContent = badge.name;
    modalDesc.textContent = badge.description;
    modalStatus.textContent = isUnlocked ? '✓ Desbloqueada' : '🔒 Bloqueada';
    modalStatus.className = 'modal-status ' + (isUnlocked ? 'unlocked' : 'locked');
    modalRequirement.innerHTML = `<strong>Cómo obtenerla:</strong><br>${badge.requirement}`;
    badgeModal.classList.remove('hidden');
}

function closeModal() {
    badgeModal.classList.add('hidden');
}

// ===== Eventos =====
modalClose.addEventListener('click', closeModal);
badgeModal.addEventListener('click', (e) => {
    if (e.target === badgeModal) closeModal();
});

// Actualizar si cambian las entradas (por si se vuelve de otra pestaña)
window.addEventListener('storage', (e) => {
    if (e.key === 'sentir-entries') {
        entries = JSON.parse(e.newValue || '[]');
        render();
    }
});

// También recargar al volver a la página
window.addEventListener('focus', () => {
    entries = JSON.parse(localStorage.getItem('sentir-entries') || '[]');
    render();
});

// Iniciar
render();
