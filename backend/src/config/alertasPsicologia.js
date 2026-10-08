import { connection } from './mysql/dbmysql.js';
import { enviarCorreo, correoConfigurado } from './correo.js';
import { NOMBRE_NIVEL, nombresDe } from './factoresRiesgo.js';
import { notificar, capitalizarNombre } from './citas.js';

// =========================================================
// AVISO A PSICOLOGÍA cuando llega una solicitud de ayuda
//
// 1) Crea una notificación (tabla `notificacion`) para cada psicólogo/a
//    activo/a: es lo que verá en su perfil.
// 2) Les envía un correo.
//
// Destinatarios del correo:
//   - Si el .env tiene PSICOLOGIA_CORREOS=correo1@x.com,correo2@x.com se usan esos.
//   - Si no, los correos de los usuarios con rol "Psicologo/a" y estado Activo.
// =========================================================

const ROL_PSICOLOGIA = 6;
const PANEL_PSICOLOGIA = 'http://127.0.0.1:5501/Client/ScreenPsicology/index.html';

const escapar = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const COLOR_NIVEL = { bajo: '#5cc898', medio: '#f0a530', alto: '#e8743b', critico: '#d6455a' };

export async function avisarPsicologia(solicitud) {
    const { idAyuda, nombre, grado, prioridad, descripcion, origen, nivel, factores } = solicitud;
    const db = connection.promise();

    const [psicologos] = await db.query(
        `SELECT id_usuario, correo FROM usuario
         WHERE id_rol = ? AND LOWER(TRIM(estadi)) = 'activo'`,
        [ROL_PSICOLOGIA]
    );

    const nombresFactores = nombresDe(factores);
    const nivelTexto = nivel ? NOMBRE_NIVEL[nivel] : '';
    const desdeChat = origen === 'chat';

    const titulo = desdeChat && nivel
        ? `Alerta de riesgo ${nivelTexto.toLowerCase()}: ${nombre} (${grado})`
        : `Nueva solicitud de ayuda: ${nombre} (${grado})`;

    const mensaje = [
        `Prioridad: ${prioridad}.`,
        desdeChat ? 'Origen: chat Sentir IA (el estudiante aceptó avisar).' : 'Origen: formulario de ayuda.',
        nivel ? `Nivel de riesgo detectado: ${nivelTexto}.` : '',
        nombresFactores.length ? `Factores detectados: ${nombresFactores.join(', ')}.` : '',
        `Descripción del estudiante: ${descripcion}`
    ].filter(Boolean).join('\n');

    // 1) Notificaciones para el perfil (se guardan siempre, aunque falle el correo)
    for (const psicologo of psicologos) {
        await db.query(
            `INSERT INTO notificacion (id_usuario_destino, id_ayuda, tipo, titulo, mensaje, nivel_riesgo)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [psicologo.id_usuario, idAyuda, desdeChat ? 'alerta_riesgo' : 'solicitud_ayuda', titulo.slice(0, 150), mensaje, nivel || '']
        );
    }

    // 2) Correo
    const fijos = String(process.env.PSICOLOGIA_CORREOS || '')
        .split(',').map((correo) => correo.trim()).filter(Boolean);
    const destinatarios = fijos.length ? fijos : psicologos.map((p) => p.correo).filter(Boolean);

    if (!destinatarios.length) {
        console.warn('Alerta a psicología: no hay psicólogos/as activos/as con correo, ni PSICOLOGIA_CORREOS en el .env');
        return { notificaciones: psicologos.length, correos: 0 };
    }

    if (!correoConfigurado()) {
        console.warn('Alerta a psicología: no se envió correo porque faltan SMTP_USER / SMTP_PASS');
        return { notificaciones: psicologos.length, correos: 0 };
    }

    const color = COLOR_NIVEL[nivel] || '#6c4df6';

    await enviarCorreo({
        para: destinatarios.join(', '),
        asunto: `Sentir · ${titulo}`,
        texto: `${titulo}\n\n${mensaje}\n\nRevisa la solicitud en el panel de psicología: ${PANEL_PSICOLOGIA}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2d2a3e">
  <h2 style="color:#4e2fc7;margin-bottom:4px">Sentir · Aviso para psicología</h2>
  <p style="margin-top:0;color:#706c86">Un estudiante pidió ayuda${desdeChat ? ' desde el chat de Sentir IA' : ''}.</p>
  ${nivel ? `<p style="display:inline-block;padding:6px 12px;border-radius:999px;background:${color};color:#fff;font-weight:bold">
      Nivel de riesgo: ${escapar(nivelTexto)}</p>` : ''}
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px">
    <tr><td style="padding:6px 0;color:#706c86;width:150px">Estudiante</td><td><b>${escapar(nombre)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#706c86">Grado</td><td>${escapar(grado)}</td></tr>
    <tr><td style="padding:6px 0;color:#706c86">Prioridad</td><td>${escapar(prioridad)}</td></tr>
    ${nombresFactores.length ? `<tr><td style="padding:6px 0;color:#706c86;vertical-align:top">Factores detectados</td>
        <td>${nombresFactores.map(escapar).join('<br>')}</td></tr>` : ''}
    <tr><td style="padding:6px 0;color:#706c86;vertical-align:top">Descripción</td><td>${escapar(descripcion)}</td></tr>
  </table>
  <p style="margin-top:18px"><a href="${PANEL_PSICOLOGIA}" style="background:#6c4df6;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Ir al panel de psicología</a></p>
  <p style="font-size:12px;color:#888">Los factores son una alerta automática, no un diagnóstico. No se guarda la conversación del chat.</p>
</div>`
    });

    return { notificaciones: psicologos.length, correos: destinatarios.length };
}

// =========================================================
// CAMBIO DE ESTADO DE LAS ALERTAS DE UN ESTUDIANTE (lo hace psicología)
// Actualiza la tabla `ayuda` y avisa (campanita + correo) a cada docente que
// envió alguna de esas alertas. Por confidencialidad, el aviso al docente solo
// dice el estado, nunca lo que psicología registró del caso.
//   estado: 'En atención' | 'Resuelta'
//   desde:  estados que se cambian (por defecto todos menos el nuevo)
// Devuelve el resultado del UPDATE (affectedRows).
// =========================================================

const MENSAJE_DOCENTE = {
    'En atención': {
        tipo: 'alerta_en_atencion',
        titulo: (n) => `Tu alerta sobre ${n} está en atención`,
        mensaje: (n, f) => `Psicología ya está atendiendo la alerta que enviaste el ${f} sobre ${n}. Gracias por reportarla; si notas algo nuevo, envía otra alerta.`
    },
    'Resuelta': {
        tipo: 'alerta_resuelta',
        titulo: (n) => `Tu alerta sobre ${n} fue cerrada`,
        mensaje: (n, f) => `Psicología cerró el caso de la alerta que enviaste el ${f} sobre ${n}. Si vuelves a notar una situación de riesgo, envía una nueva alerta.`
    }
};

export async function cambiarEstadoAlertas(db, idEstudiante, estado, desde = null) {
    const estados = desde || ['Nueva', 'En atención', 'Resuelta'].filter((e) => e !== estado);
    const [alertasDocente] = await db.query(
        `SELECT id_ayuda, id_docente, nombre, fecha FROM ayuda
         WHERE id_usuario = ? AND estado IN (?) AND origen = 'docente' AND id_docente IS NOT NULL`,
        [idEstudiante, estados]
    );
    const [resultado] = await db.query('UPDATE ayuda SET estado = ? WHERE id_usuario = ? AND estado IN (?)', [estado, idEstudiante, estados]);

    const plantilla = MENSAJE_DOCENTE[estado];
    if (plantilla) {
        for (const a of alertasDocente) {
            const nombre = capitalizarNombre(a.nombre);
            const fecha = new Date(a.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
            try {
                await notificar(db, {
                    destino: a.id_docente,
                    idAyuda: a.id_ayuda,
                    tipo: plantilla.tipo,
                    titulo: plantilla.titulo(nombre),
                    mensaje: plantilla.mensaje(nombre, fecha)
                });
            } catch (error) {
                console.error(`Alerta ${a.id_ayuda}: no se pudo avisar al docente:`, error.message);
            }
        }
    }
    return resultado;
}
