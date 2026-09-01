/* =====================================================
   SENTIR - PEDIR AYUDA
   ===================================================== */

/* =====================================================
   MENÚ RESPONSIVE
   ===================================================== */

const mobileMenu = document.getElementById("mobileMenu");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");


function toggleSidebar() {
    sidebar.classList.toggle("open");
    if (sidebarOverlay) {
        sidebarOverlay.classList.toggle("active");
    }
}

if (mobileMenu) {
    mobileMenu.addEventListener("click", toggleSidebar);
}

if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    });
}

/* Cerrar sidebar al seleccionar opción en móvil */
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 850) {
            sidebar.classList.remove("open");
            if (sidebarOverlay) sidebarOverlay.classList.remove("active");
        }
    });
});

/* =====================================================
   BOTONES DE OPCIONES
   ===================================================== */

const btnConfianza = document.getElementById("btnConfianza");
const btnProfesional = document.getElementById("btnProfesional");
const btnUrgente = document.getElementById("btnUrgente");

const consejosModal = document.getElementById("consejosModal");
const confirmModal = document.getElementById("confirmModal");

if (btnConfianza) {
    btnConfianza.addEventListener("click", () => {
        consejosModal.classList.add("show");
    });
}

if (btnProfesional) {
    btnProfesional.addEventListener("click", () => {
        document.getElementById("solicitud").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

if (btnUrgente) {
    btnUrgente.addEventListener("click", () => {
        document.getElementById("lineasAyuda").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

/* =====================================================
   CERRAR MODALES
   ===================================================== */

function cerrarModal(modal) {
    modal.classList.remove("show");
}

document.getElementById("closeConsejos")?.addEventListener("click", () => {
    cerrarModal(consejosModal);
});

document.getElementById("cerrarConsejos")?.addEventListener("click", () => {
    cerrarModal(consejosModal);
});

document.getElementById("closeModal")?.addEventListener("click", () => {
    cerrarModal(confirmModal);
});

document.getElementById("cerrarConfirmacion")?.addEventListener("click", () => {
    cerrarModal(confirmModal);
});

/* Cerrar al hacer clic fuera */
[consejosModal, confirmModal].forEach(modal => {
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                cerrarModal(modal);
            }
        });
    }
});

/* ESC para cerrar */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        cerrarModal(consejosModal);
        cerrarModal(confirmModal);
    }
});

/* =====================================================
   FORMULARIO DE SOLICITUD
   ===================================================== */

const helpForm = document.getElementById("helpForm");

if (helpForm) {
    helpForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const contacto = document.getElementById("contacto").value;
        const motivo = document.getElementById("motivo").value.trim();
        const urgente = document.getElementById("urgente").checked;

        // Validación básica
        if (!contacto) {
            alert("Por favor selecciona una forma de contacto preferida.");
            return;
        }

        // Guardar solicitud en localStorage (simulación)
        const solicitud = {
            id: Date.now(),
            nombre: nombre || "Anónimo",
            contacto,
            motivo: motivo || "Sin detalles",
            urgente,
            fecha: new Date().toISOString()
        };

        // Guardar en historial local (solo para demo)
        const solicitudes = JSON.parse(localStorage.getItem("sentir_solicitudes_ayuda") || "[]");
        solicitudes.unshift(solicitud);
        localStorage.setItem("sentir_solicitudes_ayuda", JSON.stringify(solicitudes));

        // Mostrar modal de confirmación
        confirmModal.classList.add("show");

        // Limpiar formulario
        helpForm.reset();
    });
}

/* =====================================================
   MENÚ ACTIVO (por si se usa en otras páginas)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Ya tiene la clase active en el HTML, pero por si acaso:
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });
    const ayudaItem = document.querySelector('.menu-item[data-page="ayuda"]');
    if (ayudaItem) {
        ayudaItem.classList.add("active");
    }
});