/* =====================================================
   SENTIR - PEDIR AYUDA
   ===================================================== */

/* =====================================================
   MENÚ RESPONSIVE
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuItems = document.querySelectorAll(".menu-item");

    // Función para abrir/cerrar el sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("active");
    }

    // Función para cerrar el sidebar
    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    // Evento del botón de hamburguesa
    if (mobileMenu) {
        mobileMenu.addEventListener("click", toggleSidebar);
    }

    // Evento al hacer clic en el fondo oscuro
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    // Cerrar sidebar al hacer clic en una opción (en dispositivos móviles)
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
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