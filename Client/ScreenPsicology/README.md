# SENTIR — Interfaz de Psicología (modularizada)

## Cómo abrir
Abre `index.html` con Live Server. El acceso inicia en `auth/Welcome.html`; los módulos privados de Psicología requieren una sesión activa y comparten estilos y lógica desde `/shared`.

Las carpetas están nombradas en inglés (convención de proyecto), pero todo el contenido visible en la web —menús, textos, botones— sigue en español.

## Estructura
```
Sentir/
├── index.html              → redirige a auth/Welcome.html
├── assets/
│   ├── psicologa.png       → ilustración de bienvenida (Inicio)
│   ├── psicologa-avatar.png→ foto de perfil/header
│   └── logos.png.png       → logo de Sentir
├── auth/                    → bienvenida, login, registro, recuperación y guardia de sesión
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
- **Reportes imprimibles**: tanto el expediente de un estudiante como el reporte de seguimiento institucional (Accesos Rápidos en Inicio) se abren en una pestaña lista para "Guardar como PDF" desde el diálogo de impresión del navegador.

## Datos y "base de datos" local
Mientras se construye el backend real, todo (estudiantes, alertas, agenda, intervenciones, actividades, perfil) se guarda en `localStorage` del navegador (funciones `getStudents()`, `getAlerts()`, `getAgenda()`, `getActivities()`, etc. en `sentir-shared.js`). Cuando el backend esté listo, solo hay que reemplazar esas funciones por llamadas `fetch()` a la API — el resto del código de las páginas no cambia.


## Seguridad de sesión

- Los módulos privados de Psicología incluyen `auth/session-guard.js` y no pueden abrirse desde una URL directa sin una sesión temporal activa.
- La sesión se cierra por inactividad con aviso y cuenta regresiva antes de volver a `auth/Welcome.html`.
- El frontend está preparado para sustituir el bloque de demostración de `auth/Login/Login.js` por una llamada al backend. En producción, la validación de credenciales y permisos debe realizarse obligatoriamente en el servidor.

## Accesibilidad

- Menú, campana de notificaciones, perfil, tarjetas y acciones principales tienen foco visible y navegación por teclado.
- Los controles del encabezado usan etiquetas ARIA y estados `aria-expanded` cuando corresponde.

## SENTIR AI

- La tarjeta de recomendación muestra la base comparativa del indicador y aclara que la tendencia es un apoyo para priorización, no un diagnóstico.
