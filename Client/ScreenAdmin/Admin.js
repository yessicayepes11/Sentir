// ======================================================
// SENTIR - INICIO ADMINISTRADOR
// ======================================================


const byId =
    id =>
        document.getElementById(id);


const sidebar =
    byId("sidebar");


const sidebarOverlay =
    byId("sidebarOverlay");


const mobileMenuButton =
    byId("mobileMenuButton");


const menuIcon =
    byId("menuIcon");


const usuariosNav =
    byId("usuariosNav");


const quickExport =
    byId("quickExport");


const quickDuplicates =
    byId("quickDuplicates");


const globalSearch =
    byId("globalSearch");


const activityList =
    byId("activityList");


const rolesList =
    document.querySelector(".roles-list");


let rolesChart = null;


const toast =
    byId("toast");


const toastText =
    byId("toastText");


// ======================================================
// ICONOS
// ======================================================

function refreshIcons() {

    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}


// ======================================================
// TOAST
// ======================================================

function showToast(message) {

    toastText.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2400
    );

}


// ======================================================
// SIDEBAR
// ======================================================

function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "show"
    );


    menuIcon.textContent =
        "☰";


    document.body.style.overflow =
        "";

}


mobileMenuButton.addEventListener(
    "click",
    () => {

        const open =
            sidebar.classList.toggle(
                "open"
            );


        sidebarOverlay.classList.toggle(
            "show",
            open
        );


        menuIcon.textContent =
            open
                ? "×"
                : "☰";


        document.body.style.overflow =
            open
                ? "hidden"
                : "";

    }
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


// ======================================================
// NAVEGACIÓN
// ======================================================

usuariosNav.addEventListener(
    "click",
    () => {

        window.location.href =
            "./Users/Users.html";

    }
);


// ======================================================
// ACCIONES RÁPIDAS
// ======================================================

quickExport.addEventListener(
    "click",
    () => {

        window.location.href =
            "Export/Export.html";

    }
);


quickDuplicates.addEventListener(
    "click",
    () => {

        window.location.href =
            "Duplicates/Duplicates.html";

    }
);


// ======================================================
// ACTIVIDAD RECIENTE
// ======================================================

const activityStorageKey = "sentir.admin.recentActivity";

function getRecentActivity() {
    try {
        const activity = JSON.parse(localStorage.getItem(activityStorageKey) || "[]");
        return Array.isArray(activity) ? activity.slice(0, 8) : [];
    } catch (error) {
        console.error("No se pudo leer la actividad reciente:", error);
        return [];
    }
}

function formatActivityTime(timestamp) {
    const elapsed = Math.max(0, Date.now() - new Date(timestamp).getTime());
    const minutes = Math.floor(elapsed / 60000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;

    return new Date(timestamp).toLocaleDateString("es-CO");
}


function renderActivity() {
    activityList.replaceChildren();

    const icons = {
        register: "user-round-plus",
        edit: "pencil",
        delete: "trash-2"
    };
    const activity = getRecentActivity();

    if (!activity.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "activity-empty";
        emptyState.textContent = "Aún no hay movimientos recientes.";
        activityList.appendChild(emptyState);
        return;
    }

    activity.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "activity-item";

        const icon = document.createElement("div");
        icon.className = `activity-icon ${entry.type}`;
        const iconElement = document.createElement("i");
        iconElement.dataset.lucide = icons[entry.type] || "activity";
        icon.appendChild(iconElement);

        const copy = document.createElement("div");
        copy.className = "activity-copy";
        const title = document.createElement("strong");
        title.textContent = entry.title || "Actividad de usuario";
        const description = document.createElement("p");
        description.textContent = entry.description || "";
        copy.append(title, description);

        const time = document.createElement("span");
        time.className = "activity-time";
        time.textContent = formatActivityTime(entry.timestamp);

        item.append(icon, copy, time);
        activityList.appendChild(item);
    });

    refreshIcons();

}

window.addEventListener("storage", (event) => {
    if (event.key === activityStorageKey) {
        renderActivity();
    }
});


// ======================================================
// GRÁFICA
// ======================================================

function normalizeRoleName(role) {
    return String(role || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}


function getDashboardCounts(users) {
    const counts = {
        total: users.length,
        students: 0,
        teachers: 0,
        protectors: 0,
        psychologists: 0,
        directors: 0,
        committee: 0,
        chart: {
            students: 0,
            teachers: 0,
            protectors: 0,
            psychologists: 0,
            directors: 0,
            committee: 0,
            otherRoles: 0
        }
    };

    users.forEach((user) => {
        const role = normalizeRoleName(user.role);
        let roleCategory = '';

        if (role === 'estudiante') {
            counts.students += 1;
            roleCategory = 'students';
        } else if (role === 'docente') {
            counts.teachers += 1;
            roleCategory = 'teachers';
        } else if (role === 'entorno protector' || role === 'uai') {
            counts.protectors += 1;
            roleCategory = 'protectors';
        } else if (['psicologo/a', 'psicologo', 'psicologa'].includes(role)) {
            counts.psychologists += 1;
            roleCategory = 'psychologists';
        } else if ([
            'rectora',
            'rector',
            'coordinador convivencia',
            'coordinadora convivencia',
            'coordinador de convivencia',
            'coordinadora de convivencia',
            'coordinador academico',
            'coordinadora academica'
        ].includes(role)) {
            counts.directors += 1;
            roleCategory = 'directors';
        }

        if (isCommitteeMember(user.committeeMember)) {
            counts.committee += 1;
            counts.chart.committee += 1;
        } else if (roleCategory) {
            counts.chart[roleCategory] += 1;
        } else {
            counts.chart.otherRoles += 1;
        }
    });

    counts.support = counts.protectors + counts.psychologists;

    return counts;
}


function isCommitteeMember(value) {
    if (value === true || value === 1) {
        return true;
    }

    const normalizedValue = String(value ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return normalizedValue === '1'
        || normalizedValue === 'true'
        || normalizedValue === 'si';
}


function renderDashboardStats(counts) {
    byId('totalUsers').textContent = counts.total.toLocaleString('es-CO');
    byId('studentsCount').textContent = counts.students.toLocaleString('es-CO');
    byId('teachersCount').textContent = counts.teachers.toLocaleString('es-CO');
    byId('supportCount').textContent = counts.support.toLocaleString('es-CO');
    byId('chartTotal').textContent = counts.total.toLocaleString('es-CO');

    const rows = [
        { label: 'Estudiantes', count: counts.chart.students, color: 'students-dot' },
        { label: 'Docentes', count: counts.chart.teachers, color: 'teachers-dot' },
        { label: 'UAI (Entorno protector)', count: counts.chart.protectors, color: 'uai-dot' },
        { label: 'Psicóloga', count: counts.chart.psychologists, color: 'psychologist-dot' },
        { label: 'Directivos (Rectora y coordinaciones)', count: counts.chart.directors, color: 'directors-dot' },
        { label: 'Comité', count: counts.chart.committee, color: 'committee-dot' },
        { label: 'Otros roles', count: counts.chart.otherRoles, color: 'other-dot' }
    ];

    rolesList.replaceChildren(...rows.map((row) => {
        const element = document.createElement('div');
        element.className = 'role-row';

        const dot = document.createElement('span');
        dot.className = `role-dot ${row.color}`;

        const label = document.createElement('p');
        label.textContent = row.label;

        const count = document.createElement('strong');
        count.textContent = row.count.toLocaleString('es-CO');

        element.append(dot, label, count);
        return element;
    }));
}


function createRolesChart(counts) {

    const canvas =
        byId("rolesChart");


    if (!canvas) {

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        setTimeout(
            () => createRolesChart(counts),
            300
        );

        return;

    }


    if (rolesChart) {
        rolesChart.destroy();
    }

    rolesChart = new Chart(
        canvas,
        {

            type:
                "doughnut",


            data: {

                labels: [

                    "Estudiantes",
                    "Docentes",
                    "UAI (Entorno protector)",
                    "Psicóloga",
                    "Directivos (Rectora y coordinaciones)",
                    "Comité",
                    "Otros roles"

                ],


                datasets: [

                    {

                        data: [

                            counts.chart.students,
                            counts.chart.teachers,
                            counts.chart.protectors,
                            counts.chart.psychologists,
                            counts.chart.directors,
                            counts.chart.committee,
                            counts.chart.otherRoles

                        ],


                        backgroundColor: [

                            "#1677FF",
                            "#F97316",
                            "#16A34A",
                            "#DB2777",
                            "#E11D48",
                            "#06B6D4",
                            "#8991A8"

                        ],


                        borderWidth:
                            0,


                        spacing:
                            2,


                        hoverOffset:
                            5

                    }

                ]

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                cutout:
                    "72%",


                plugins: {

                    legend: {

                        display:
                            false

                    },


                    tooltip: {

                        enabled:
                            true

                    }

                }

            }

        }
    );

}


// ======================================================
// BUSCADOR
// ======================================================

globalSearch.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Enter"
        ) {

            return;

        }


        const search =
            globalSearch.value
                .trim();


        if (!search) {

            showToast(
                "Escribe un usuario para buscar"
            );

            return;

        }


        window.location.href =
            `./Users/Users.html?search=${encodeURIComponent(search)}`;

    }
);


// ======================================================
// RESPONSIVE
// ======================================================

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth >
            900
        ) {

            closeSidebar();

        }

    }
);


// ======================================================
// INIT
// ======================================================

async function init() {
    renderActivity();

    try {
        const response = await fetch('http://localhost:3000/api/CrearUsuario/listar');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las estadísticas de usuarios');
        }

        const data = await response.json();
        const users = Array.isArray(data.usuarios) ? data.usuarios : [];
        const counts = getDashboardCounts(users);
        renderDashboardStats(counts);
        createRolesChart(counts);
    } catch (error) {
        console.error('Error al cargar el panel:', error);
        showToast(error.message || 'No se pudieron cargar los datos del panel');
        const counts = getDashboardCounts([]);
        renderDashboardStats(counts);
        createRolesChart(counts);
    }

    setTimeout(refreshIcons, 200);
}


init();