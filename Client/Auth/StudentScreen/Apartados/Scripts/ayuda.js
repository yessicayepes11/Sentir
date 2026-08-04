// ===== Elementos =====
const emailInput = document.getElementById('email-to');
const messageArea = document.getElementById('message');
const sosBtn = document.getElementById('sos-btn');
const contactRadios = document.querySelectorAll('input[name="contact"]');
const presetBtns = document.querySelectorAll('.preset-btn');

// Correos de ejemplo según el tipo de contacto
const defaultEmails = {
    personal: 'ayuda@ejemplo.com',
    profesional: 'terapeuta@ejemplo.com',
    emergencia: 'apoyo@ejemplo.com'
};

const defaultSubjects = {
    personal: 'Necesito hablar contigo',
    profesional: 'Solicitud de apoyo — Sentir',
    emergencia: 'Pedido de ayuda emocional'
};

// Cambiar correo al seleccionar tipo de contacto
contactRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const type = radio.value;
        emailInput.value = defaultEmails[type] || '';
        emailInput.placeholder = defaultEmails[type] || 'correo@ejemplo.com';
    });
});

// Presets de mensaje
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        messageArea.value = btn.dataset.msg;
        messageArea.focus();
    });
});

// Enviar (abrir mailto)
sosBtn.addEventListener('click', () => {
    const to = emailInput.value.trim();
    if (!to || !isValidEmail(to)) {
        alert('Por favor escribe un correo válido.');
        emailInput.focus();
        return;
    }

    const selectedType = document.querySelector('input[name="contact"]:checked')?.value || 'personal';
    const subject = defaultSubjects[selectedType] || 'Pedido de ayuda';
    const body = messageArea.value.trim() ||
        'Hola, estoy usando la app Sentir y me gustaría recibir apoyo. ¿Puedes contactarme cuando puedas?';

    // Construir mailto
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Feedback visual
    sosBtn.classList.add('sending');
    const originalHTML = sosBtn.innerHTML;
    sosBtn.innerHTML = `
        <span class="sos-icon"><i class="fa-solid fa-check"></i></span>
        <span class="sos-text">Abriendo tu correo...</span>
        <span class="sos-sub">Revisa tu aplicación de email</span>
    `;

    // Abrir cliente de correo
    window.location.href = mailto;

    // Restaurar botón
    setTimeout(() => {
        sosBtn.classList.remove('sending');
        sosBtn.innerHTML = originalHTML;
    }, 2500);
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
