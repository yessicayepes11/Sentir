// =========================================================
// Utilidades compartidas de CITAS (psicología y estudiante)
//   - notificar(): deja un aviso en la tabla notificacion (campanita)
//                  y lo envía también por correo al destinatario
//   - cuandoTexto(): "martes 6 de octubre a las 2:00 p. m."
// =========================================================

import { connection } from './mysql/dbmysql.js';
import { enviarCorreo, correoConfigurado } from './correo.js';

export const ESTADOS_ACTIVOS = ['Pendiente', 'Programada'];

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const ROL_PSICOLOGIA = 6;
const ROL_ESTUDIANTE = 8;
const ROL_DOCENTE = 5;
const ENLACES = {
    [ROL_DOCENTE]: { url: 'http://127.0.0.1:5501/Client/ScreenTeacher/teacher.html', texto: 'Ir a Sentir' },
    [ROL_ESTUDIANTE]: { url: 'http://127.0.0.1:5501/Client/ScreenStudents/EmotionalDiary/Citas/Citas.html', texto: 'Ver mis citas y ayudas' },
    [ROL_PSICOLOGIA]: { url: 'http://127.0.0.1:5501/Client/ScreenPsicology/agenda/Agenda.html', texto: 'Ir a la agenda' }
};

export function hora12(hora) {
    const [h, m] = String(hora).slice(0, 5).split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}

export function cuandoTexto(fecha, hora) {
    const d = new Date(`${String(fecha).slice(0, 10)}T12:00:00`);
    return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} a las ${hora12(hora)}`;
}

// Agrega punto final solo si hace falta ("a. m." ya termina en punto)
export function conPunto(frase) {
    const t = String(frase).trim();
    return t.endsWith('.') ? t : t + '.';
}

const escapar = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// Correo con el mismo contenido del aviso
export function correoDeAviso({ titulo, mensaje, rol }) {
    const enlace = ENLACES[rol];
    return {
        asunto: `Sentir · ${titulo}`,
        texto: `${titulo}\n\n${mensaje}${enlace ? `\n\n${enlace.texto}: ${enlace.url}` : ''}\n\nEste aviso también está en la campanita de Sentir.`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2d2a3e">
  <h2 style="color:#4e2fc7;margin-bottom:6px">${escapar(titulo)}</h2>
  <p style="font-size:15px;line-height:1.6;white-space:pre-line">${escapar(mensaje)}</p>
  ${enlace ? `<p style="margin-top:18px"><a href="${enlace.url}" style="background:#6c4df6;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">${enlace.texto}</a></p>` : ''}
  <p style="font-size:12px;color:#888;margin-top:22px">Este aviso también aparece en la campanita de notificaciones de Sentir.</p>
</div>`
    };
}

// Envía por correo un aviso ya guardado (solo si sigue existiendo: si la operación
// se deshizo con un rollback, el aviso no existe y no se envía nada)
async function enviarAvisoPorCorreo(idNotificacion) {
    if (!correoConfigurado()) return;
    const db = connection.promise();
    const [[aviso]] = await db.query(
        `SELECT n.titulo, n.mensaje, u.correo, u.id_rol
         FROM notificacion n JOIN usuario u ON u.id_usuario = n.id_usuario_destino
         WHERE n.id_notificacion = ?`,
        [idNotificacion]
    );
    if (!aviso) return;

    // Para psicología se respetan los correos fijos del .env (igual que las alertas de ayuda)
    const fijos = String(process.env.PSICOLOGIA_CORREOS || '').split(',').map((c) => c.trim()).filter(Boolean);
    const para = Number(aviso.id_rol) === ROL_PSICOLOGIA && fijos.length ? fijos.join(', ') : String(aviso.correo || '').trim();
    if (!para) return;

    const correo = correoDeAviso({ titulo: aviso.titulo, mensaje: aviso.mensaje, rol: Number(aviso.id_rol) });
    await enviarCorreo({ para, ...correo });
}

export async function notificar(db, { destino, idCita = null, idAyuda = null, tipo, titulo, mensaje }) {
    if (!destino) return;
    const [resultado] = await db.query(
        `INSERT INTO notificacion (id_usuario_destino, id_cita, id_ayuda, tipo, titulo, mensaje, nivel_riesgo)
         VALUES (?, ?, ?, ?, ?, ?, '')`,
        [destino, idCita, idAyuda, tipo, String(titulo).slice(0, 150), mensaje]
    );
    // El correo sale aparte, para no demorar la respuesta (y después del commit)
    setTimeout(() => {
        enviarAvisoPorCorreo(resultado.insertId)
            .catch((error) => console.warn(`Aviso ${resultado.insertId}: no se pudo enviar el correo:`, error.message));
    }, 1500);
}

export function capitalizarNombre(valor) {
    return String(valor || '').toLocaleLowerCase('es').replace(/(^|\s)(\p{L})/gu, (m, e, l) => e + l.toLocaleUpperCase('es'));
}
