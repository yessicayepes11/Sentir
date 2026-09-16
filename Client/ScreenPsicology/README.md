# SENTIR — Interfaz de Psicología (modularizada)

## Cómo abrir
Abre `index.html` (o directamente `home/Home.html`) con Live Server. Cada módulo es una página independiente que comparte estilos y lógica desde `/shared`.

Las carpetas están nombradas en inglés (convención de proyecto), pero todo el contenido visible en la web —menús, textos, botones— sigue en español.

## Estructura
```
Sentir/
├── index.html              → redirige a home/Home.html
├── assets/
│   ├── psicologa.png       → ilustración de bienvenida (Inicio)
│   ├── psicologa-avatar.png→ foto de perfil/header
│   └── logos.png.png       → logo de Sentir
├── shared/                 → CSS y JS comunes a todos los módulos
│   ├── sentir-shared.css   → variables, sidebar, header, modales, toasts, tarjetas
│   └── sentir-shared.js    → configuración de la psicóloga, "base de datos" local,
│                              panel de expediente, notificaciones, respaldo de datos
├── home/            → Home.html / .css / .js            (Inicio)
├── students/        → Students.html / .css / .js        (Estudiantes)
├── alerts/          → Alerts.html / .css / .js          (Alertas)
├── agenda/          → Agenda.html / .css / .js          (Agenda, con vista de calendario)
├── activities/      → Activities.html / .css / .js      (Control de Actividades)
└── profile/         → Profile.html / .css / .js         (Perfil)
```

## Cómo cambiar el nombre/foto de la psicóloga en un solo lugar
Abre `shared/sentir-shared.js` y edita el objeto `SENTIR_DEFAULT_PROFILE` (arriba del todo). Cambia lo que necesites ahí y se reflejará automáticamente en Inicio, Perfil y el header de todos los módulos. También se puede editar desde la propia interfaz en Perfil → "Editar Perfil".

## Funciones destacadas
- **Evolución de riesgo**: dentro del expediente de cada estudiante, siempre calculada en vivo a partir del riesgo actual (nunca queda desactualizada).
- **Calendario mensual en Agenda**: eventos coloreados automáticamente según el tipo de cita (detectado por palabras clave en el título), con leyenda de colores.
- **Notificaciones del navegador**: sonido + aviso del sistema cuando aparece una alerta nueva (se activa desde Perfil).
- **Actividades vinculadas a estudiantes**: sugerir una actividad de relajación queda registrado en el historial de intervenciones del estudiante elegido.
- **Respaldo de datos**: exportar/importar toda la información como `.json` desde Perfil, y "Restablecer valores por defecto" si algo sale mal.
- **Reportes imprimibles**: tanto el expediente de un estudiante como el reporte clínico general (Accesos Rápidos en Inicio) se abren en una pestaña lista para "Guardar como PDF" desde el diálogo de impresión del navegador.

## Datos y "base de datos" local
Mientras se construye el backend real, todo (estudiantes, alertas, agenda, intervenciones, actividades, perfil) se guarda en `localStorage` del navegador (funciones `getStudents()`, `getAlerts()`, `getAgenda()`, `getActivities()`, etc. en `sentir-shared.js`). Cuando el backend esté listo, solo hay que reemplazar esas funciones por llamadas `fetch()` a la API — el resto del código de las páginas no cambia.
