document.addEventListener("DOMContentLoaded", function () {

    initSidebar();

    initActiveNavigation();

    initProfileMenu();

    initProfilePhoto();

    initEmotions();


    initAppointmentModal();

    initSearch();

});


/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {

    const menuButton =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (
        !menuButton ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    function openMenu() {

        sidebar.classList.add("open");

        overlay.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeMenu() {

        sidebar.classList.remove("open");

        overlay.classList.remove("active");

        document.body.style.overflow = "";

    }


    menuButton.addEventListener(
        "click",
        function () {

            if (
                sidebar.classList.contains("open")
            ) {

                closeMenu();

            }

            else {

                openMenu();

            }

        }
    );


    overlay.addEventListener(
        "click",
        closeMenu
    );


    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <= 900
                    ) {

                        closeMenu();

                    }

                }
            );

        });


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 900
            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   OPCIÓN ACTIVA SIDEBAR
========================================================= */

function initActiveNavigation() {

    const links =
        document.querySelectorAll(".menu-item");


    const currentPath =
        window.location.pathname
            .toLowerCase();


    links.forEach(function (link) {

        link.classList.remove("active");


        const href =
            link.getAttribute("href");


        if (!href) {

            return;

        }


        const linkPath =
            new URL(
                href,
                window.location.origin
            )
                .pathname
                .toLowerCase();


        if (
            currentPath === linkPath
        ) {

            link.classList.add("active");

        }


        if (
            link.dataset.page === "inicio" &&
            currentPath.endsWith(
                "/screenstudents/students.html"
            )
        ) {

            link.classList.add("active");

        }

    });

}


/* =========================================================
   HEADER PERFIL
========================================================= */

function initProfileMenu() {

    const button =
        document.getElementById(
            "profileButton"
        );


    const menu =
        document.getElementById(
            "profileMenu"
        );


    if (
        !button ||
        !menu
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            menu.classList.toggle("show");

        }
    );


    document.addEventListener(
        "click",
        function () {

            menu.classList.remove("show");

        }
    );


    menu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


/* =========================================================
   FOTO DE PERFIL
========================================================= */

const PROFILE_PHOTO_KEY =
    "sentirStudentProfilePhoto";


const STUDENT_NAME_KEY =
    "sentirStudentName";


function initProfilePhoto() {

    loadProfilePhoto();

    loadStudentName();


    /*
    Esto permite usar este mismo sistema
    en StudentProfile.
    */

    const inputs =
        document.querySelectorAll(

            "#profilePhotoInput," +

            "#studentPhotoInput," +

            "#photoInput," +

            "input[data-profile-photo]"

        );


    inputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function (event) {

                    const file =
                        event.target.files[0];


                    if (file) {

                        saveProfilePhoto(file);

                    }

                }
            );

        }
    );


    /*
    Actualiza Inicio si la foto
    cambia desde otra pestaña.
    */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                PROFILE_PHOTO_KEY
            ) {

                loadProfilePhoto();

            }


            if (
                event.key ===
                STUDENT_NAME_KEY
            ) {

                loadStudentName();

            }

        }
    );


    window.SentirProfile = {

        setPhoto:
            saveProfilePhoto,

        setName:
            saveStudentName,

        refresh:
            function () {

                loadProfilePhoto();

                loadStudentName();

            }

    };

}


function saveProfilePhoto(file) {

    if (!file) {

        return;

    }


    if (
        !file.type.startsWith("image/")
    ) {

        showToast(
            "Selecciona una imagen válida."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                localStorage.setItem(

                    PROFILE_PHOTO_KEY,

                    reader.result

                );


                loadProfilePhoto();


                showToast(
                    "Foto de perfil actualizada."
                );

            }

            catch (error) {

                console.error(error);


                showToast(
                    "La fotografía es demasiado pesada para guardarse localmente."
                );

            }

        };


    reader.readAsDataURL(file);

}


function loadProfilePhoto() {

    const photo =
        localStorage.getItem(
            PROFILE_PHOTO_KEY
        );


    document
        .querySelectorAll(
            "[data-profile-avatar]"
        )
        .forEach(
            function (avatar) {

                const image =
                    avatar.querySelector(
                        ".profile-avatar-image"
                    );


                const fallback =
                    avatar.querySelector(
                        ".profile-avatar-fallback"
                    );


                if (
                    !image ||
                    !fallback
                ) {

                    return;

                }


                if (photo) {

                    image.src =
                        photo;

                    image.hidden =
                        false;

                    fallback.hidden =
                        true;

                }

                else {

                    image.hidden =
                        true;

                    fallback.hidden =
                        false;

                }

            }
        );

}


function saveStudentName(name) {

    if (!name) {

        return;

    }


    localStorage.setItem(

        STUDENT_NAME_KEY,

        name

    );


    loadStudentName();

}


function loadStudentName() {

    const name =
        localStorage.getItem(
            STUDENT_NAME_KEY
        ) || "Ana";


    document
        .querySelectorAll(
            "[data-student-name]"
        )
        .forEach(
            function (element) {

                element.textContent =
                    name;

            }
        );


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase();


    document
        .querySelectorAll(
            ".profile-avatar-fallback"
        )
        .forEach(
            function (element) {

                element.textContent =
                    firstLetter;

            }
        );

}


/* =========================================================
   EMOCIONES
========================================================= */

/* =========================================================
   EMOCIONES
========================================================= */

function initEmotions() {

    const emotions =
        document.querySelectorAll(".emotion");

    const question =
        document.getElementById("emotionQuestion");

    const selected =
        document.getElementById("selectedEmotion");

    const close =
        document.getElementById("closeQuestion");


    emotions.forEach(function (emotion) {

        emotion.addEventListener("click", function () {

            /* Quitar selección visual anterior */
            emotions.forEach(function (item) {

                item.classList.remove("selected");

            });


            /* Marcar emoción seleccionada */
            emotion.classList.add("selected");


            /* Buscar el radio del emoji */
            const radio =
                emotion.querySelector(
                    '.emoji input[type="radio"]'
                );


            if (radio) {

                /*
                Desmarcamos los demás radios.
                Esto permite que solamente un emoji
                permanezca seleccionado.
                */
                document
                    .querySelectorAll(
                        '.emoji input[name="feedback"]'
                    )
                    .forEach(function (input) {

                        if (input !== radio) {

                            input.checked = false;

                        }

                    });


                /*
                Si se vuelve a pulsar el mismo emoji,
                reiniciamos su animación.
                */
                if (radio.checked) {

                    radio.checked = false;

                    void radio.offsetWidth;

                }


                /* Activar emoji */
                radio.checked = true;

            }


            /* Obtener nombre de la emoción */
            const value =
                emotion.dataset.emotion;


            /* Guardar última emoción */
            if (value) {

                localStorage.setItem(
                    "sentirLastEmotion",
                    value
                );

            }


            /* Mostrar emoción seleccionada */
            if (selected && value) {

                selected.textContent =
                    "Hoy te sientes: " + value;

            }


            /* Mostrar pregunta */
            if (question) {

                question.classList.add("show");

            }

        });

    });


    /* Cerrar pregunta */
    if (close && question) {

        close.addEventListener(
            "click",
            function () {

                question.classList.remove("show");

            }
        );

    }

}

/* =========================================================
   AGENDAR CITA CON PSICOLOGÍA
   - Horarios disponibles: los horarios libres de psicología.
   - Proponer otro horario: el estudiante escribe fecha y hora.
   La solicitud queda "por aceptar" y la respuesta le llega
   como notificación (campanita).
========================================================= */

const API_CITAS_ESTUDIANTE = "http://localhost:3001/api/Estudiante";

function sesionEstudiante() {
    try {
        const sesion = JSON.parse(sessionStorage.getItem("sentirEstudiante"));
        return sesion && sesion.token ? sesion : null;
    } catch (error) {
        return null;
    }
}

async function apiEstudiante(ruta, opciones = {}) {
    const sesion = sesionEstudiante();
    const respuesta = await fetch(API_CITAS_ESTUDIANTE + ruta, {
        ...opciones,
        headers: { ...(opciones.headers || {}), Authorization: "Bearer " + (sesion ? sesion.token : "") }
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.message || "No se pudo completar la acción.");
    return datos;
}

function escaparTexto(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function hora12(hora) {
    const [h, m] = String(hora).split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

const ESTADOS_CITA_ESTUDIANTE = {
    "Pendiente": { texto: "Esperando respuesta", clase: "pending", icono: "fa-hourglass-half" },
    "Programada": { texto: "Confirmada", clase: "ok", icono: "fa-circle-check" },
    "Realizada": { texto: "Realizada", clase: "done", icono: "fa-check-double" },
    "No asistió": { texto: "No asististe", clase: "missed", icono: "fa-user-xmark" },
    "Rechazada": { texto: "No se pudo agendar", clase: "missed", icono: "fa-circle-xmark" },
    "Cancelada": { texto: "Cancelada", clase: "missed", icono: "fa-ban" }
};

function initAppointmentModal() {

    const modal = document.getElementById("appointmentModal");
    const open = document.getElementById("openAppointment");
    const close = document.getElementById("closeAppointment");
    const finish = document.getElementById("finishAppointment");
    const form = document.getElementById("appointmentForm");
    const success = document.getElementById("appointmentSuccess");
    const summary = document.getElementById("appointmentSummary");
    const dateInput = document.getElementById("appointmentDate");
    const image = document.getElementById("appointmentImage");
    const login = document.getElementById("appointmentLogin");
    const mine = document.getElementById("myAppointments");
    const mineList = document.getElementById("myAppointmentsList");

    if (!modal || !open || !form) return;

    // Si todavía no existe AgendarCita.png, se oculta la imagen rota y queda el placeholder
    if (image) image.addEventListener("error", () => { image.style.display = "none"; });

    // Fecha mínima = hoy
    if (dateInput) {
        const hoy = new Date();
        dateInput.min = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    }

    let modo = "horarios";
    let horarios = [];
    let diaElegido = null;
    let horarioElegido = null;

    const dias = document.getElementById("appointmentDays");
    const horas = document.getElementById("appointmentHours");

    function mostrarModo() {
        modal.querySelectorAll("#appointmentModes [data-modo]").forEach(b => b.classList.toggle("active", b.dataset.modo === modo));
        modal.querySelectorAll("[data-appt]").forEach(el => { el.hidden = el.dataset.appt !== modo; });
    }
    modal.querySelectorAll("#appointmentModes [data-modo]").forEach(b => b.addEventListener("click", () => { modo = b.dataset.modo; mostrarModo(); }));

    function pintarDias() {
        const fechas = [...new Set(horarios.map(h => h.fecha))];
        if (!fechas.length) {
            dias.innerHTML = '<p class="appt-empty"><i class="fa-regular fa-calendar-xmark"></i> En este momento no hay horarios libres. Usa "Proponer otro horario".</p>';
            horas.innerHTML = "";
            return;
        }
        if (!diaElegido || !fechas.includes(diaElegido)) diaElegido = fechas[0];
        dias.innerHTML = fechas.map(fecha => {
            const d = new Date(fecha + "T12:00:00");
            return `<button type="button" class="appt-day ${fecha === diaElegido ? "active" : ""}" data-dia="${fecha}">
                <span>${d.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", "")}</span>
                <strong>${d.getDate()}</strong>
                <small>${d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</small>
            </button>`;
        }).join("");
        dias.querySelectorAll("[data-dia]").forEach(b => b.addEventListener("click", () => {
            diaElegido = b.dataset.dia;
            horarioElegido = null;
            pintarDias();
        }));
        pintarHoras();
    }

    function pintarHoras() {
        horas.innerHTML = horarios.filter(h => h.fecha === diaElegido).map(h => `
            <button type="button" class="appt-hour ${horarioElegido && horarioElegido.id === h.id ? "active" : ""}" data-horario="${h.id}" title="Con ${escaparTexto(h.psicologa)}">
                ${hora12(h.hora)}<small>${h.duracion} min</small>
            </button>`).join("");
        horas.querySelectorAll("[data-horario]").forEach(b => b.addEventListener("click", () => {
            horarioElegido = horarios.find(h => String(h.id) === b.dataset.horario);
            pintarHoras();
        }));
    }

    async function cargarMisCitas() {
        if (!mine || !sesionEstudiante()) return;
        try {
            const { citas } = await apiEstudiante("/citas");
            const recientes = (citas || []).slice(0, 6);
            mine.hidden = !recientes.length;
            mineList.innerHTML = recientes.map(c => {
                const e = ESTADOS_CITA_ESTUDIANTE[c.estado] || ESTADOS_CITA_ESTUDIANTE.Pendiente;
                const cancelable = c.estado === "Pendiente" || c.estado === "Programada";
                return `<div class="appt-mine-item">
                    <div>
                        <strong>${escaparTexto(c.cuando.charAt(0).toUpperCase() + c.cuando.slice(1))}</strong>
                        <small>${escaparTexto(c.tipo)}${c.psicologa ? " · " + escaparTexto(c.psicologa) : ""}</small>
                        ${c.observacion ? `<small class="appt-obs">${escaparTexto(c.observacion)}</small>` : ""}
                    </div>
                    <span class="appt-state ${e.clase}"><i class="fa-solid ${e.icono}"></i> ${e.texto}</span>
                    ${cancelable ? `<button type="button" class="appt-cancel" data-cancelar="${c.id}">Cancelar</button>` : ""}
                </div>`;
            }).join("");
            mineList.querySelectorAll("[data-cancelar]").forEach(b => b.addEventListener("click", async () => {
                if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;
                try {
                    await apiEstudiante(`/citas/${b.dataset.cancelar}/cancelar`, { method: "PUT" });
                    showToast("Tu cita fue cancelada.");
                    cargarMisCitas();
                    cargarHorarios();
                } catch (error) {
                    showToast(error.message);
                }
            }));
        } catch (error) {
            mine.hidden = true;
        }
    }

    async function cargarHorarios() {
        dias.innerHTML = '<p class="appt-empty"><i class="fa-solid fa-spinner fa-spin"></i> Buscando horarios…</p>';
        horas.innerHTML = "";
        try {
            horarios = (await apiEstudiante("/horarios")).horarios || [];
        } catch (error) {
            horarios = [];
        }
        horarioElegido = null;
        pintarDias();
    }

    open.addEventListener("click", function () {
        const conSesion = Boolean(sesionEstudiante());
        if (login) login.hidden = conSesion;
        form.hidden = !conSesion;
        if (success) success.hidden = true;
        if (conSesion) {
            modo = "horarios";
            mostrarModo();
            cargarHorarios();
            cargarMisCitas();
        } else if (mine) {
            mine.hidden = true;
        }
        openModal(modal);
    });

    if (close) close.addEventListener("click", () => closeModal(modal));
    if (finish) finish.addEventListener("click", () => {
        if (success) success.hidden = true;
        form.hidden = false;
        closeModal(modal);
    });
    modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(modal); });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const motivo = document.getElementById("appointmentReason").value.trim();
        let horario;
        if (modo === "horarios") {
            if (!horarioElegido) return showToast("Elige un día y una hora disponibles.");
            horario = { idDisponibilidad: horarioElegido.id };
        } else {
            const fecha = document.getElementById("appointmentDate").value;
            const hora = document.getElementById("appointmentTime").value;
            if (!fecha || !hora) return showToast("Elige la fecha y la hora que prefieres.");
            horario = { fecha, hora };
        }
        if (motivo.length < 5) return showToast("Cuéntanos brevemente el motivo de la cita.");

        const boton = form.querySelector(".appointment-submit");
        if (boton) boton.disabled = true;
        try {
            const respuesta = await apiEstudiante("/citas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...horario, motivo })
            });
            if (summary) {
                summary.textContent = `Pediste tu cita para el ${respuesta.cuando.replace(/\.$/, "")}. Cuando la psicóloga la acepte te llegará un aviso en la campanita.`;
            }
            form.hidden = true;
            if (success) success.hidden = false;
            form.reset();
            showToast("Solicitud de cita enviada.");
            cargarMisCitas();
            if (window.SentirNotificaciones) window.SentirNotificaciones.actualizar();
        } catch (error) {
            showToast(error.message);
        } finally {
            if (boton) boton.disabled = false;
        }
    });

    mostrarModo();
}


/* =========================================================
   BUSCADOR
========================================================= */

function initSearch() {

    const search =
        document.getElementById(
            "resourceSearch"
        );


    if (!search) {

        return;

    }


    const cards =
        document.querySelectorAll(
            ".tool-card"
        );


    search.addEventListener(
        "input",
        function () {

            const text =
                normalizeText(
                    search.value
                );


            cards.forEach(
                function (card) {

                    const cardText =
                        normalizeText(
                            card.textContent
                        );


                    if (
                        text === "" ||
                        cardText.includes(text)
                    ) {

                        card.style.display =
                            "";

                    }

                    else {

                        card.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


/* =========================================================
   MODALES
========================================================= */

function openModal(modal) {

    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    modal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* ESC PARA CERRAR */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(
                    function (modal) {

                        closeModal(modal);

                    }
                );

        }

    }
);


/* =========================================================
   UTILIDADES
========================================================= */

function normalizeText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}


function formatDate(dateString) {

    const parts =
        dateString
            .split("-")
            .map(Number);


    const date =
        new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );


    return new Intl.DateTimeFormat(

        "es-CO",

        {

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }

    ).format(date);

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


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

            2800
        );

}