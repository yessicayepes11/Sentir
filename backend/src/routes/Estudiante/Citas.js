import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenEstudiante } from '../../config/studentToken.js';
import { notificar, cuandoTexto, capitalizarNombre, conPunto } from '../../config/citas.js';

// Citas y notificaciones del estudiante (montado en /api/Estudiante).
// Quién es el estudiante sale SIEMPRE del token firmado del inicio de sesión.
//   GET  /horarios                 horarios libres de psicología (próximos 30 días)
//   GET  /citas                    mis citas
//   POST /citas                    pedir una cita (queda "Pendiente" hasta que psicología la acepte)
//   PUT  /citas/:id/cancelar       cancelar una cita mía
//   GET  /ayudas                   historial de las ayudas que pedí al psicólogo/a
//   GET  /notificaciones           mis avisos (cita asignada, aceptada, cambiada...)
//   PUT  /notificaciones/leidas    marcar mis avisos como leídos

const router = Router();
const ROL_ESTUDIANTE = 8;
const ROL_PSICOLOGIA = 6;
const MAX_PENDIENTES = 3;

const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');
const textoLargo = (valor, max = 1000) => String(valor ?? '').trim().slice(0, max);
const fechaValida = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) && !Number.isNaN(new Date(`${v}T00:00:00`).getTime());
const horaValida = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || ''));

function ahoraLocal() {
    const d = new Date();
    const dos = (n) => String(n).padStart(2, '0');
    return { fecha: `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`, hora: `${dos(d.getHours())}:${dos(d.getMinutes())}` };
}
const esFuturo = (fecha, hora) => { const a = ahoraLocal(); return fecha > a.fecha || (fecha === a.fecha && hora > a.hora); };
function sumarDias(fecha, dias) {
    const d = new Date(`${fecha}T12:00:00`);
    d.setDate(d.getDate() + dias);
    const dos = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

async function estudianteDeLaSesion(req, res) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenEstudiante(token);
    if (!idUsuario) {
        res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        return null;
    }
    const [[usuario]] = await connection.promise().query(
        'SELECT id_usuario, nombre, apellido, id_rol FROM usuario WHERE id_usuario = ? LIMIT 1', [idUsuario]
    );
    if (!usuario || Number(usuario.id_rol) !== ROL_ESTUDIANTE) {
        res.status(403).json({ message: 'Esta sección es solo para estudiantes.' });
        return null;
    }
    return usuario;
}

router.get('/horarios', async (req, res) => {
    try {
        if (!(await estudianteDeLaSesion(req, res))) return;
        const ahora = ahoraLocal();
        const [filas] = await connection.promise().query(
            `SELECT d.id_disponibilidad, DATE_FORMAT(d.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(d.hora, '%H:%i') AS hora,
                    d.duracion_min, p.nombre, p.apellido
             FROM disponibilidad d
             JOIN usuario p ON p.id_usuario = d.id_usuario AND p.id_rol = ?
             WHERE d.fecha BETWEEN ? AND ?
               AND NOT EXISTS (SELECT 1 FROM cita c WHERE c.id_disponibilidad = d.id_disponibilidad)
             ORDER BY d.fecha, d.hora`,
            [ROL_PSICOLOGIA, ahora.fecha, sumarDias(ahora.fecha, 30)]
        );
        return res.json({
            horarios: filas.filter((f) => esFuturo(f.fecha, f.hora)).map((f) => ({
                id: f.id_disponibilidad,
                fecha: f.fecha,
                hora: f.hora,
                duracion: f.duracion_min,
                psicologa: capitalizarNombre(`${f.nombre} ${f.apellido}`)
            }))
        });
    } catch (error) {
        console.error('Horarios para estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar los horarios.' });
    }
});

router.get('/citas', async (req, res) => {
    try {
        const estudiante = await estudianteDeLaSesion(req, res);
        if (!estudiante) return;
        const [filas] = await connection.promise().query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(c.hora, '%H:%i') AS hora,
                    c.tipo, c.origen, c.motivo, c.estado, c.observacion,
                    p.nombre AS p_nombre, p.apellido AS p_apellido
             FROM cita c
             LEFT JOIN disponibilidad d ON d.id_disponibilidad = c.id_disponibilidad
             LEFT JOIN usuario p ON p.id_usuario = COALESCE(c.id_psicologo, d.id_usuario)
             WHERE c.id_usuario = ?
             ORDER BY (c.estado IN ('Pendiente', 'Programada')) DESC, c.fecha DESC, c.hora DESC
             LIMIT 30`,
            [estudiante.id_usuario]
        );
        return res.json({
            citas: filas.map((c) => ({
                id: c.id_cita,
                fecha: c.fecha,
                hora: c.hora,
                tipo: c.tipo,
                origen: c.origen,
                motivo: c.motivo,
                estado: c.estado,
                observacion: c.estado === 'Rechazada' ? c.observacion : '',
                psicologa: c.p_nombre ? capitalizarNombre(`${c.p_nombre} ${c.p_apellido}`) : '',
                cuando: cuandoTexto(c.fecha, c.hora)
            }))
        });
    } catch (error) {
        console.error('Citas del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar tus citas.' });
    }
});

// Pedir una cita: en un horario libre de psicología o proponiendo fecha y hora
router.post('/citas', async (req, res) => {
    const db = connection.promise();
    let transaccion = false;
    try {
        const estudiante = await estudianteDeLaSesion(req, res);
        if (!estudiante) return;

        const body = req.body || {};
        const idFranja = soloDigitos(body.idDisponibilidad);
        const motivo = textoLargo(body.motivo);
        if (motivo.length < 5) return res.status(400).json({ message: 'Cuéntanos brevemente el motivo de la cita.' });

        const [[pendientes]] = await db.query(
            "SELECT COUNT(*) AS n FROM cita WHERE id_usuario = ? AND estado = 'Pendiente'", [estudiante.id_usuario]
        );
        if (pendientes.n >= MAX_PENDIENTES) {
            return res.status(409).json({ message: 'Ya tienes solicitudes esperando respuesta. Espera a que psicología te responda.' });
        }

        await db.beginTransaction();
        transaccion = true;

        let fecha, hora, idPsicologa = null, idDisponibilidad = null;
        if (idFranja) {
            const [[franja]] = await db.query(
                `SELECT d.id_disponibilidad, d.id_usuario, DATE_FORMAT(d.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(d.hora, '%H:%i') AS hora
                 FROM disponibilidad d WHERE d.id_disponibilidad = ? FOR UPDATE`,
                [idFranja]
            );
            const [[ocupada]] = franja ? await db.query('SELECT id_cita FROM cita WHERE id_disponibilidad = ? LIMIT 1', [idFranja]) : [[null]];
            if (!franja || ocupada || !esFuturo(franja.fecha, franja.hora)) {
                await db.rollback();
                transaccion = false;
                return res.status(409).json({ message: 'Ese horario acaba de ocuparse. Elige otro.' });
            }
            ({ fecha, hora } = franja);
            idPsicologa = franja.id_usuario;
            idDisponibilidad = franja.id_disponibilidad;
        } else {
            fecha = String(body.fecha || '');
            hora = String(body.hora || '').slice(0, 5);
            if (!fechaValida(fecha) || !horaValida(hora)) {
                await db.rollback();
                transaccion = false;
                return res.status(400).json({ message: 'Elige la fecha y la hora que prefieres.' });
            }
            if (!esFuturo(fecha, hora)) {
                await db.rollback();
                transaccion = false;
                return res.status(400).json({ message: 'La fecha y la hora deben ser futuras.' });
            }
        }

        const [resultado] = await db.query(
            `INSERT INTO cita (fecha, hora, tipo, origen, id_usuario, id_psicologo, motivo, estado, observacion, id_disponibilidad)
             VALUES (?, ?, 'Solicitud del estudiante', 'estudiante', ?, ?, ?, 'Pendiente', '', ?)`,
            [fecha, hora, estudiante.id_usuario, idPsicologa, motivo, idDisponibilidad]
        );

        // Aviso a psicología: a la dueña del horario o, si propuso otro horario, a todas
        const nombre = capitalizarNombre(`${estudiante.nombre} ${estudiante.apellido}`);
        const [psicologas] = idPsicologa
            ? [[{ id_usuario: idPsicologa }]]
            : await db.query("SELECT id_usuario FROM usuario WHERE id_rol = ? AND LOWER(TRIM(estadi)) = 'activo'", [ROL_PSICOLOGIA]);
        for (const p of psicologas) {
            await notificar(db, {
                destino: p.id_usuario,
                idCita: resultado.insertId,
                tipo: 'cita_solicitada',
                titulo: `Solicitud de cita: ${nombre}`,
                mensaje: `${nombre} pidió una cita para el ${conPunto(cuandoTexto(fecha, hora))} Motivo: ${motivo}`
            });
        }

        await db.commit();
        transaccion = false;
        return res.status(201).json({ message: 'Solicitud enviada.', id: resultado.insertId, cuando: cuandoTexto(fecha, hora) });
    } catch (error) {
        if (transaccion) await db.rollback().catch(() => {});
        console.error('Solicitud de cita del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudo enviar tu solicitud.' });
    }
});

router.put('/citas/:id/cancelar', async (req, res) => {
    const db = connection.promise();
    try {
        const estudiante = await estudianteDeLaSesion(req, res);
        if (!estudiante) return;

        const [[cita]] = await db.query(
            `SELECT c.id_cita, c.estado, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(c.hora, '%H:%i') AS hora,
                    COALESCE(c.id_psicologo, d.id_usuario) AS responsable
             FROM cita c LEFT JOIN disponibilidad d ON d.id_disponibilidad = c.id_disponibilidad
             WHERE c.id_cita = ? AND c.id_usuario = ?`,
            [soloDigitos(req.params.id), estudiante.id_usuario]
        );
        if (!cita || !['Pendiente', 'Programada'].includes(cita.estado)) {
            return res.status(404).json({ message: 'Esta cita ya no se puede cancelar.' });
        }

        await db.query("UPDATE cita SET estado = 'Cancelada', id_disponibilidad = NULL WHERE id_cita = ?", [cita.id_cita]);
        if (cita.responsable) {
            const nombre = capitalizarNombre(`${estudiante.nombre} ${estudiante.apellido}`);
            await notificar(db, {
                destino: cita.responsable,
                idCita: cita.id_cita,
                tipo: 'cita_cancelada_estudiante',
                titulo: `${nombre} canceló su cita`,
                mensaje: `${nombre} canceló la cita del ${conPunto(cuandoTexto(cita.fecha, cita.hora))} El horario quedó libre.`
            });
        }
        return res.json({ message: 'Cita cancelada.' });
    } catch (error) {
        console.error('Cancelar cita del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudo cancelar la cita.' });
    }
});

// Historial de las ayudas que el estudiante pidió (formulario o chat de Sentir IA).
// Las alertas que envían los docentes no se muestran: son reportes confidenciales.
router.get('/ayudas', async (req, res) => {
    try {
        const estudiante = await estudianteDeLaSesion(req, res);
        if (!estudiante) return;
        const [filas] = await connection.promise().query(
            `SELECT id_ayuda, descripcion, prioridad, estado, origen, fecha
             FROM ayuda
             WHERE id_usuario = ? AND origen IN ('formulario', 'chat')
             ORDER BY fecha DESC, id_ayuda DESC
             LIMIT 50`,
            [estudiante.id_usuario]
        );
        return res.json({
            ayudas: filas.map((a) => ({
                id: a.id_ayuda,
                descripcion: a.descripcion,
                prioridad: a.prioridad,
                estado: a.estado || 'Nueva',
                origen: a.origen,
                fecha: a.fecha
            }))
        });
    } catch (error) {
        console.error('Historial de ayudas del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu historial de ayudas.' });
    }
});

router.get('/notificaciones', async (req, res) => {
    try {
        const estudiante = await estudianteDeLaSesion(req, res);
        if (!estudiante) return;
        const [filas] = await connection.promise().query(
            `SELECT id_notificacion, id_cita, tipo, titulo, mensaje, leida, fecha
             FROM notificacion WHERE id_usuario_destino = ?
             ORDER BY fecha DESC, id_notificacion DESC LIMIT 30`,
            [estudiante.id_usuario]
        );
        return res.json({
            sinLeer: filas.filter((n) => !n.leida).length,
            notificaciones: filas.map((n) => ({
                id: n.id_notificacion,
                idCita: n.id_cita,
                tipo: n.tipo,
                titulo: n.titulo,
                mensaje: n.mensaje,
                leida: Boolean(n.leida),
                fecha: n.fecha
            }))
        });
    } catch (error) {
        console.error('Notificaciones del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar tus notificaciones.' });
    }
});

router.put('/notificaciones/leidas', async (req, res) => {
    try {
        const estudiante = await estudianteDeLaSesion(req, res);
        if (!estudiante) return;
        const ids = Array.isArray((req.body || {}).ids) ? req.body.ids.map(soloDigitos).filter(Boolean) : [];
        if (ids.length) {
            await connection.promise().query(
                'UPDATE notificacion SET leida = 1 WHERE id_usuario_destino = ? AND id_notificacion IN (?)',
                [estudiante.id_usuario, ids]
            );
        } else {
            await connection.promise().query('UPDATE notificacion SET leida = 1 WHERE id_usuario_destino = ?', [estudiante.id_usuario]);
        }
        return res.json({ message: 'Listo.' });
    } catch (error) {
        console.error('Marcar notificaciones:', error.message);
        return res.status(500).json({ message: 'No se pudieron actualizar tus notificaciones.' });
    }
});

export default router;
