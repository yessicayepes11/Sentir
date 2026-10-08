// =========================================================
// RECORDATORIOS AUTOMÁTICOS PARA EL ESTUDIANTE
// Cada 10 minutos revisa las citas confirmadas (estado "Programada") y le
// deja al estudiante un aviso en la campanita + correo (vía notificar()):
//   recordatorio_24h -> cuando falta un día o menos (y más de 2 horas)
//   recordatorio_hoy -> cuando faltan 2 horas o menos
// Las citas de tipo "Seguimiento de caso" o "Sesión individual" se anuncian
// como "intervención"; las demás como "cita".
// Cada recordatorio se envía una sola vez por fecha y hora: si la cita se
// reprograma, el estudiante recibe los recordatorios del nuevo horario.
// =========================================================

import { connection } from './mysql/dbmysql.js';
import { notificar, cuandoTexto, capitalizarNombre, conPunto } from './citas.js';

const CADA_MS = 10 * 60 * 1000;
const ROL_ESTUDIANTE = 8;
const TIPOS_INTERVENCION = ['Seguimiento de caso', 'Sesión individual'];
const MIN_HOY = 120;          // "faltan 2 horas o menos"
const MIN_DIA = 24 * 60;      // "falta un día o menos"
const RECIENTE_MS = 3 * 60 * 60 * 1000;   // aviso de cita recién asignada: no repetir con el de 24 h

const dos = (n) => String(n).padStart(2, '0');
const fechaISO = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

function diaRelativo(fecha) {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    if (fecha === fechaISO(hoy)) return 'hoy, ';
    if (fecha === fechaISO(manana)) return 'mañana, ';
    return '';
}

function textoRecordatorio(cita, tipoAviso) {
    const esIntervencion = TIPOS_INTERVENCION.includes(cita.tipo);
    const que = esIntervencion ? 'intervención' : 'cita';
    const cuando = cuandoTexto(cita.fecha, cita.hora);
    const con = cita.p_nombre ? `, con ${capitalizarNombre(`${cita.p_nombre} ${cita.p_apellido}`)}` : '';
    const motivo = String(cita.motivo || '').trim();

    return {
        titulo: tipoAviso === 'recordatorio_hoy'
            ? `Tu ${que} con psicología es en poco tiempo`
            : `Recordatorio: próxima ${que} con psicología`,
        mensaje: `Recuerda tu ${que} (${cita.tipo}) ${diaRelativo(cita.fecha)}${conPunto(`${cuando}${con}`)}`
            + (motivo ? ` Motivo: ${motivo}` : '')
            + (tipoAviso === 'recordatorio_hoy' ? '\nSi no puedes asistir, cancélala en "Mis citas" para liberar el horario.' : ''),
        cuando
    };
}

let revisando = false;

export async function revisarRecordatorios() {
    if (revisando) return 0;
    revisando = true;
    let enviados = 0;
    try {
        const db = connection.promise();
        const ahora = new Date();
        const limite = new Date(ahora.getTime() + (MIN_DIA + 60) * 60000);

        const [citas] = await db.query(
            `SELECT c.id_cita, c.id_usuario, c.tipo, c.motivo,
                    DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(c.hora, '%H:%i') AS hora,
                    p.nombre AS p_nombre, p.apellido AS p_apellido
             FROM cita c
             JOIN usuario e ON e.id_usuario = c.id_usuario AND e.id_rol = ?
             LEFT JOIN disponibilidad d ON d.id_disponibilidad = c.id_disponibilidad
             LEFT JOIN usuario p ON p.id_usuario = COALESCE(c.id_psicologo, d.id_usuario)
             WHERE c.estado = 'Programada' AND c.fecha BETWEEN ? AND ?`,
            [ROL_ESTUDIANTE, fechaISO(ahora), fechaISO(limite)]
        );
        if (!citas.length) return 0;

        // Avisos que ya existen para esas citas (para no repetir recordatorios)
        const [avisos] = await db.query(
            'SELECT id_cita, tipo, mensaje, fecha FROM notificacion WHERE id_cita IN (?)',
            [citas.map((c) => c.id_cita)]
        );

        for (const cita of citas) {
            const minutos = (new Date(`${cita.fecha}T${cita.hora}:00`).getTime() - ahora.getTime()) / 60000;
            if (minutos <= 0 || minutos > MIN_DIA) continue;
            const tipoAviso = minutos <= MIN_HOY ? 'recordatorio_hoy' : 'recordatorio_24h';
            const texto = textoRecordatorio(cita, tipoAviso);
            const deEstaCita = avisos.filter((a) => a.id_cita === cita.id_cita && String(a.mensaje).includes(texto.cuando));

            if (deEstaCita.some((a) => a.tipo === tipoAviso)) continue;
            // Si la cita se acaba de asignar/aceptar/cambiar, ese aviso ya sirve de recordatorio de 24 h
            if (tipoAviso === 'recordatorio_24h'
                && deEstaCita.some((a) => ahora.getTime() - new Date(a.fecha).getTime() < RECIENTE_MS)) continue;

            await notificar(db, {
                destino: cita.id_usuario,
                idCita: cita.id_cita,
                tipo: tipoAviso,
                titulo: texto.titulo,
                mensaje: texto.mensaje
            });
            enviados += 1;
        }
        if (enviados) console.log(`Recordatorios de citas: ${enviados} enviado(s)`);
        return enviados;
    } catch (error) {
        console.error('Recordatorios de citas:', error.message);
        return enviados;
    } finally {
        revisando = false;
    }
}

export function iniciarRecordatorios() {
    setTimeout(revisarRecordatorios, 15000);   // primera revisión poco después de arrancar
    setInterval(revisarRecordatorios, CADA_MS);
}
