import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenUsuario } from '../../config/studentToken.js';
import { fotoCambiada } from '../../config/avatarIA.js';
import { nombresDe, NOMBRE_NIVEL } from '../../config/factoresRiesgo.js';
import { notificar, cuandoTexto, conPunto } from '../../config/citas.js';
import { cambiarEstadoAlertas } from '../../config/alertasPsicologia.js';

// =========================================================
// PSICOLOGÍA
//   GET  /perfil  -> datos del usuario que inició sesión + cifras de su trabajo
//   PUT  /perfil  -> editar nombre, apellido, correo, celular y foto
//   GET  /inicio  -> panorama de la pantalla de Inicio (ánimo de la institución,
//                    cifras, casos prioritarios, estudiantes y alertas)
// Quién es la psicóloga sale SIEMPRE del token firmado del inicio de sesión.
// =========================================================

const router = Router();
const ROL_PSICOLOGIA = 6;

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
            cb(null, `${Date.now()}-perfil-psicologia${extension || '.jpg'}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nombreRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,100}$/;
const texto = (valor, max) => String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

function fotoPublica(foto) {
    const valor = String(foto || '').trim();
    if (!valor) return '';
    return valor.startsWith('http') ? valor : `http://localhost:3001${valor}`;
}

function capitalizar(valor) {
    return String(valor || '').toLocaleLowerCase('es').replace(/(^|\s)(\p{L})/gu, (m, e, l) => e + l.toLocaleUpperCase('es'));
}

async function psicologaDeLaSesion(req, res) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenUsuario(token);

    if (!idUsuario) {
        res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });
        return null;
    }

    const [filas] = await connection.promise().query('SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = ? LIMIT 1', [idUsuario]);
    if (!filas.length || Number(filas[0].id_rol) !== ROL_PSICOLOGIA) {
        res.status(403).json({ message: 'Esta sección es solo para psicología.' });
        return null;
    }
    return filas[0].id_usuario;
}

async function leerPerfil(idUsuario) {
    const db = connection.promise();
    const [[u]] = await db.query(
        `SELECT u.id_usuario, u.tipo_id, u.nombre, u.apellido, u.correo, u.celular, u.foto, u.estadi,
                u.comite_convivencia, r.nombre AS rol,
                TIMESTAMPDIFF(YEAR, u.fecha_nac, CURDATE()) AS edad,
                DATE_FORMAT(u.fecha_nac, '%Y-%m-%d') AS fecha_nac,
                DATE_FORMAT(u.fecha_reg, '%Y-%m-%d') AS fecha_reg
         FROM usuario u LEFT JOIN rol r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = ? LIMIT 1`,
        [idUsuario]
    );

    // Cifras del trabajo de psicología (de toda la institución)
    const [[cifras]] = await db.query(
        `SELECT COUNT(DISTINCT id_usuario) AS estudiantes_atendidos,
                SUM(estado <> 'Resuelta') AS casos_activos,
                SUM(estado = 'Resuelta') AS casos_cerrados,
                SUM(fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS alertas_mes
         FROM ayuda`
    );
    const [[notif]] = await db.query(
        'SELECT COUNT(*) AS sin_leer FROM notificacion WHERE id_usuario_destino = ? AND leida = 0',
        [idUsuario]
    );

    return {
        usuario: {
            id_usuario: u.id_usuario,
            tipo_id: u.tipo_id,
            nombre: u.nombre,
            apellido: u.apellido,
            correo: u.correo,
            celular: u.celular ? String(u.celular) : '',
            foto: fotoPublica(u.foto),
            estado: u.estadi,
            comite_convivencia: Boolean(u.comite_convivencia),
            rol: u.rol,
            edad: u.edad,
            fecha_nac: u.fecha_nac,
            fecha_reg: u.fecha_reg
        },
        cifras: {
            estudiantesAtendidos: Number(cifras.estudiantes_atendidos || 0),
            casosActivos: Number(cifras.casos_activos || 0),
            casosCerrados: Number(cifras.casos_cerrados || 0),
            alertasMes: Number(cifras.alertas_mes || 0),
            notificacionesSinLeer: Number(notif.sin_leer || 0)
        }
    };
}

router.get('/perfil', async (req, res) => {
    try {
        const id = await psicologaDeLaSesion(req, res);
        if (!id) return;
        return res.json(await leerPerfil(id));
    } catch (error) {
        console.error('Perfil psicología:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu perfil.' });
    }
});

router.put('/perfil', upload.single('foto'), async (req, res) => {
    try {
        const id = await psicologaDeLaSesion(req, res);
        if (!id) return;

        const body = req.body || {};
        const nombre = texto(body.nombre, 100);
        const apellido = texto(body.apellido, 100);
        const correo = texto(body.correo, 150).toLowerCase();
        const celular = soloDigitos(body.celular);

        if (!nombreRegex.test(nombre)) return res.status(400).json({ message: 'Escribe un nombre válido (solo letras).' });
        if (!nombreRegex.test(apellido)) return res.status(400).json({ message: 'Escribe un apellido válido (solo letras).' });
        if (!emailRegex.test(correo)) return res.status(400).json({ message: 'Escribe un correo electrónico válido.' });
        if (celular.length < 7 || celular.length > 15) return res.status(400).json({ message: 'Escribe un número de celular válido (7 a 15 dígitos).' });

        const db = connection.promise();
        const [ocupado] = await db.query('SELECT id_usuario FROM usuario WHERE LOWER(correo) = ? AND id_usuario <> ? LIMIT 1', [correo, id]);
        if (ocupado.length) return res.status(409).json({ message: 'Ese correo ya lo usa otro usuario.' });

        const campos = ['nombre = ?', 'apellido = ?', 'correo = ?', 'celular = ?'];
        const valores = [nombre, apellido, correo, Number(celular)];
        if (req.file) {
            campos.push('foto = ?');
            valores.push(`/uploads/${req.file.filename}`);
        }
        await db.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = ?`, [...valores, id]);
        if (req.file) fotoCambiada(id); // la IA empieza ya el avatar de la foto nueva

        return res.json({ message: 'Tu perfil se actualizó correctamente.', ...(await leerPerfil(id)) });
    } catch (error) {
        console.error('Editar perfil psicología:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar tu perfil.' });
    }
});

// =========================================================
// INICIO
// =========================================================

const EMOCION_A_ANIMO = { 1: 'happy', 2: 'happy', 3: 'neutral', 4: 'sad', 5: 'sad' };
const ORIGEN_A_FUENTE = { formulario: 'student', chat: 'ai', docente: 'teacher' };
const PESO_PRIORIDAD = { Urgente: 0, 'Muy alta': 1, Alta: 2, Media: 3, Leve: 4 };

function riesgoDe(ayuda) {
    if (['alto', 'critico'].includes(ayuda.nivel_riesgo) || ['Urgente', 'Muy alta'].includes(ayuda.prioridad)) return 'high';
    if (ayuda.nivel_riesgo === 'medio' || ayuda.prioridad === 'Alta') return 'medium';
    return 'stable';
}

function horaBonita(fecha) {
    const f = new Date(fecha);
    const hoy = new Date();
    const mismoDia = f.toDateString() === hoy.toDateString();
    const hora = f.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return mismoDia ? `Hoy · ${hora}` : `${f.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${hora}`;
}

function motivoDe(ayuda) {
    const descripcion = String(ayuda.descripcion || '').replace(/\s+/g, ' ').trim();
    const factores = nombresDe(String(ayuda.factores_riesgo || '').split(',').filter(Boolean));
    const quien = ayuda.origen === 'docente'
        ? `Reporte del docente ${capitalizar(ayuda.nombre_docente)}`
        : ayuda.origen === 'chat' ? 'Desde el chat de Sentir IA' : 'Solicitud del estudiante';
    return `${quien}: ${descripcion}${factores.length ? ` (Factores detectados: ${factores.join(', ')})` : ''}`.slice(0, 400);
}

// =========================================================
// PROCESOS DE TERAPIA (tabla proceso_terapia)
// Cada alerta o solicitud de ayuda abre automáticamente el proceso del
// estudiante si no tiene uno activo (origen: docente, formulario o chat).
// La psicóloga también puede añadir estudiantes (origen: psicologia).
// =========================================================

async function sincronizarProcesos(db) {
    const [pendientes] = await db.query(
        `SELECT a.id_ayuda, a.id_usuario, a.origen, a.descripcion, a.fecha
         FROM ayuda a
         INNER JOIN usuario u ON u.id_usuario = a.id_usuario AND u.id_rol = 8
         WHERE NOT EXISTS (SELECT 1 FROM proceso_terapia p WHERE p.id_ayuda = a.id_ayuda)
           AND NOT EXISTS (SELECT 1 FROM proceso_terapia p WHERE p.id_usuario = a.id_usuario AND p.estado = 'Activo')
           AND NOT EXISTS (SELECT 1 FROM proceso_terapia p WHERE p.id_usuario = a.id_usuario AND p.fecha_cierre >= a.fecha)
         ORDER BY a.fecha ASC`
    );

    const abiertos = new Set();
    for (const a of pendientes) {
        if (abiertos.has(String(a.id_usuario))) continue;   // un solo proceso activo por estudiante
        abiertos.add(String(a.id_usuario));
        const origen = ['docente', 'formulario', 'chat'].includes(a.origen) ? a.origen : 'formulario';
        await db.query(
            `INSERT INTO proceso_terapia (id_usuario, origen, id_ayuda, motivo, fecha_inicio)
             VALUES (?, ?, ?, ?, ?)`,
            [a.id_usuario, origen, a.id_ayuda, String(a.descripcion || '').slice(0, 1000), a.fecha]
        );
    }
}

router.post('/procesos', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const idEstudiante = soloDigitos(req.body?.idUsuario);
        const motivo = String(req.body?.motivo ?? '').trim().slice(0, 1000);
        if (!idEstudiante) return res.status(400).json({ message: 'Selecciona un estudiante.' });
        if (motivo.length < 5) return res.status(400).json({ message: 'Escribe el motivo por el que inicia el proceso.' });

        const db = connection.promise();
        const [[estudiante]] = await db.query(
            'SELECT id_usuario FROM usuario WHERE id_usuario = ? AND id_rol = 8 LIMIT 1', [idEstudiante]
        );
        if (!estudiante) return res.status(404).json({ message: 'No se encontró al estudiante. La secretaría debe registrarlo primero.' });

        const [[activo]] = await db.query(
            "SELECT id_proceso FROM proceso_terapia WHERE id_usuario = ? AND estado = 'Activo' LIMIT 1", [idEstudiante]
        );
        if (activo) return res.status(409).json({ message: 'Este estudiante ya tiene un proceso de terapia activo.' });

        const [resultado] = await db.query(
            `INSERT INTO proceso_terapia (id_usuario, id_psicologo, origen, motivo) VALUES (?, ?, 'psicologia', ?)`,
            [idEstudiante, idPsicologa, motivo]
        );
        return res.status(201).json({ message: 'El estudiante quedó en proceso de terapia.', id: resultado.insertId });
    } catch (error) {
        console.error('Abrir proceso:', error.message);
        return res.status(500).json({ message: 'No se pudo añadir al estudiante.' });
    }
});

router.put('/procesos/:id/cerrar', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const observacion = String(req.body?.observacion ?? '').trim().slice(0, 1000);
        const db = connection.promise();
        const [resultado] = await db.query(
            `UPDATE proceso_terapia SET estado = 'Cerrado', fecha_cierre = NOW(), observacion_cierre = ?
             WHERE id_proceso = ? AND estado = 'Activo'`,
            [observacion, soloDigitos(req.params.id)]
        );
        if (!resultado.affectedRows) return res.status(404).json({ message: 'El proceso no existe o ya estaba cerrado.' });

        // Al cerrar el proceso, sus alertas abiertas quedan resueltas
        const [[proceso]] = await db.query('SELECT id_usuario FROM proceso_terapia WHERE id_proceso = ?', [soloDigitos(req.params.id)]);
        const alertas = await cambiarEstadoAlertas(db, proceso.id_usuario, 'Resuelta');

        return res.json({ message: 'Proceso cerrado.', alertasResueltas: alertas.affectedRows });
    } catch (error) {
        console.error('Cerrar proceso:', error.message);
        return res.status(500).json({ message: 'No se pudo cerrar el proceso.' });
    }
});

router.get('/inicio', async (req, res) => {
    try {
        const id = await psicologaDeLaSesion(req, res);
        if (!id) return;
        const db = connection.promise();
        await sincronizarProcesos(db);

        const [procesos] = await db.query(
            `SELECT id_proceso, id_usuario, origen, motivo, DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio
             FROM proceso_terapia WHERE estado = 'Activo'`
        );

        // 1) Estado anímico de la institución (diario emocional, últimos 30 días)
        const [emociones] = await db.query(
            `SELECT de.id_emocion, e.grado, de.id_estudiante, de.fecha
             FROM diario_emocinal de INNER JOIN estudiante e ON e.id_estudiante = de.id_estudiante
             WHERE de.fecha >= NOW() - INTERVAL 30 DAY`
        );
        const conteo = { happy: 0, neutral: 0, sad: 0 };
        emociones.forEach((r) => { conteo[EMOCION_A_ANIMO[r.id_emocion] || 'neutral'] += 1; });
        const total = emociones.length;
        const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
        const animo = { positivo: pct(conteo.happy), neutral: pct(conteo.neutral), bajo: pct(conteo.sad), registros: total };
        animo.etiqueta = !total ? 'Sin registros en los últimos 30 días'
            : animo.bajo >= 40 ? 'Ánimo bajo en aumento: requiere atención'
            : animo.positivo >= 50 ? 'Predominantemente positivo'
            : 'Predominantemente estable';

        // 2) Solicitudes de ayuda / alertas
        const [ayudas] = await db.query(
            `SELECT a.*, COALESCE(e.grado, a.grado) AS grado_real, u.foto, u.nombre AS u_nombre, u.apellido AS u_apellido,
                    DATE_FORMAT(a.fecha, '%Y-%m-%dT%H:%i:%s') AS fecha_iso
             FROM ayuda a
             LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
             LEFT JOIN estudiante e ON e.id_usuario = a.id_usuario
             ORDER BY a.fecha DESC`
        );
        const activas = ayudas.filter((a) => a.estado !== 'Resuelta');

        // 3) Estudiantes (con su riesgo actual y su último registro de ánimo)
        const [estudiantes] = await db.query(
            `SELECT e.id_estudiante, e.grado, u.id_usuario, u.nombre, u.apellido, u.foto,
                    (SELECT de.id_emocion FROM diario_emocinal de WHERE de.id_estudiante = e.id_estudiante ORDER BY de.fecha DESC LIMIT 1) AS ultima_emocion,
                    (SELECT em.nombre FROM diario_emocinal de JOIN emocion em ON em.id_emocion = de.id_emocion
                       WHERE de.id_estudiante = e.id_estudiante ORDER BY de.fecha DESC LIMIT 1) AS ultima_emocion_nombre
             FROM estudiante e INNER JOIN usuario u ON u.id_usuario = e.id_usuario
             WHERE LOWER(TRIM(u.estadi)) = 'activo'
             ORDER BY u.nombre`
        );

        const [actividades] = await db.query(
            `SELECT id_usuario, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha_iso, tipo FROM (
                SELECT id_usuario, fecha, 'Alerta registrada' AS tipo FROM ayuda
                UNION ALL SELECT id_usuario, fecha, 'Intervención' FROM intervension
                UNION ALL SELECT id_usuario, fecha, 'Contacto con acudiente' FROM contacto_acudiente
                UNION ALL SELECT id_usuario, fecha_registro, 'Derivación a red de apoyo' FROM derivacion
                UNION ALL SELECT id_usuario, fecha_solicitud, 'Cita agendada' FROM cita
                UNION ALL SELECT id_usuario, fecha_inicio, 'Inicio del proceso' FROM proceso_terapia
                UNION ALL SELECT e.id_usuario, de.fecha, 'Registro en su diario' FROM diario_emocinal de
                    JOIN estudiante e ON e.id_estudiante = de.id_estudiante
             ) t ORDER BY t.fecha DESC`
        );
        const ultimaActividad = {};
        actividades.forEach((a) => { if (!ultimaActividad[a.id_usuario]) ultimaActividad[a.id_usuario] = { fecha: a.fecha_iso, tipo: a.tipo }; });

        const pesoRiesgo = { high: 2, medium: 1, stable: 0 };
        const listaEstudiantes = estudiantes.map((s) => {
            const suyas = ayudas.filter((a) => String(a.id_usuario) === String(s.id_usuario));
            const activasSuyas = suyas.filter((a) => a.estado !== 'Resuelta');
            const riesgo = activasSuyas.reduce((max, a) => (pesoRiesgo[riesgoDe(a)] > pesoRiesgo[max] ? riesgoDe(a) : max), 'stable');
            const factores = [...new Set(activasSuyas.flatMap((a) => nombresDe(String(a.factores_riesgo || '').split(',').filter(Boolean))))];
            const nombre = capitalizar(`${s.nombre} ${s.apellido}`);
            return {
                name: nombre,
                grade: s.grado,
                id: `#${s.id_usuario}`,
                idUsuario: s.id_usuario,
                caseNumber: activasSuyas.length ? `CASO-${String(activasSuyas[0].id_ayuda).padStart(4, '0')}` : '',
                risk: riesgo,
                mood: EMOCION_A_ANIMO[s.ultima_emocion] || 'neutral',
                moodText: factores.length ? factores.join(', ')
                    : s.ultima_emocion_nombre ? `Último registro: ${s.ultima_emocion_nombre}` : 'Sin registros de ánimo',
                avatar: fotoPublica(s.foto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=6C4DF6&color=fff&bold=true`,
                riskHistory: suyas.slice().reverse().map((a) => ({ fecha: a.fecha_iso.slice(0, 10), risk: riesgoDe(a) })),
                ultimaActualizacion: ultimaActividad[s.id_usuario] || null,
                // Proceso de terapia activo (null si no está en proceso)
                proceso: (() => {
                    const p = procesos.find((pr) => String(pr.id_usuario) === String(s.id_usuario));
                    return p ? { id: p.id_proceso, origen: p.origen, motivo: p.motivo, fechaInicio: p.fecha_inicio } : null;
                })()
            };
        });

        // 4) Alertas en el formato del módulo de psicología (más graves primero)
        const alertas = activas
            .slice()
            .sort((a, b) => (PESO_PRIORIDAD[a.prioridad] ?? 9) - (PESO_PRIORIDAD[b.prioridad] ?? 9) || (a.fecha < b.fecha ? 1 : -1))
            .map((a) => ({
                id: `ayuda-${a.id_ayuda}`,
                idAyuda: a.id_ayuda,
                estudiante: capitalizar(a.u_nombre ? `${a.u_nombre} ${a.u_apellido}` : a.nombre),
                grado: a.grado_real,
                hora: horaBonita(a.fecha),
                motivo: motivoDe(a),
                estado: a.estado,
                source: ORIGEN_A_FUENTE[a.origen] || 'student',
                prioridad: a.prioridad,
                nivel: a.nivel_riesgo ? NOMBRE_NIVEL[a.nivel_riesgo] : ''
            }));

        // 5) Tendencia para la "Sugerencia de la IA": grado con más registros de ánimo bajo (7 días vs 7 anteriores)
        const ahora = Date.now();
        const porGrado = {};
        emociones.forEach((r) => {
            if (EMOCION_A_ANIMO[r.id_emocion] !== 'sad') return;
            const dias = (ahora - new Date(r.fecha).getTime()) / 86400000;
            porGrado[r.grado] = porGrado[r.grado] || { actual: 0, anterior: 0 };
            if (dias <= 7) porGrado[r.grado].actual += 1;
            else if (dias <= 14) porGrado[r.grado].anterior += 1;
        });
        const [grupo, datosGrupo] = Object.entries(porGrado).sort((a, b) => b[1].actual - a[1].actual)[0] || [];
        const tendencia = grupo && datosGrupo.actual > 0
            ? { group: grupo, topic: 'ánimo bajo (registros "Mal" y "Muy mal")', currentCount: datosGrupo.actual, previousCount: datosGrupo.anterior, currentPeriod: 'últimos 7 días', previousPeriod: '7 días anteriores' }
            : null;

        return res.json({
            animo,
            kpis: {
                evaluados: new Set(emociones.map((r) => r.id_estudiante)).size,
                riesgoAlto: listaEstudiantes.filter((s) => s.risk === 'high').length,
                alertasActivas: activas.length,
                casosCerrados: ayudas.filter((a) => a.estado === 'Resuelta').length
            },
            estudiantes: listaEstudiantes,
            alertas,
            tendencia
        });
    } catch (error) {
        console.error('Inicio psicología:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar el panorama.' });
    }
});

// =========================================================
// INTERVENCIONES (tabla `intervension`)
//   POST /intervenciones           -> registrar una intervención de un estudiante
//   GET  /intervenciones/:idUsuario -> historial de intervenciones del estudiante
// Al registrar una intervención, las alertas "Nueva" del estudiante pasan a
// "En atención" (siguen contando como activas hasta que se marquen resueltas).
// =========================================================

const ROL_ESTUDIANTE = 8;
const textoLargo = (valor, max = 2000) => String(valor ?? '').trim().slice(0, max);

router.post('/intervenciones', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const body = req.body || {};
        const idEstudiante = soloDigitos(body.idUsuario);
        const fecha = String(body.fecha || '').trim();
        const datos = {
            factores: textoLargo(body.factores),
            situacion: textoLargo(body.situacion),
            causas: textoLargo(body.causas),
            proceso: textoLargo(body.proceso),
            avance: textoLargo(body.avance),
            observaciones: textoLargo(body.observaciones)
        };

        if (!idEstudiante) return res.status(400).json({ message: 'No se identificó al estudiante.' });
        if (!datos.situacion || !datos.proceso) {
            return res.status(400).json({ message: 'Describe al menos la situación y el proceso realizado.' });
        }
        if (fecha && (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || new Date(`${fecha}T00:00:00`) > new Date())) {
            return res.status(400).json({ message: 'La fecha de la intervención no es válida (no puede ser futura).' });
        }

        const db = connection.promise();
        const [[estudiante]] = await db.query(
            'SELECT id_usuario, nombre, apellido FROM usuario WHERE id_usuario = ? AND id_rol = ? LIMIT 1',
            [idEstudiante, ROL_ESTUDIANTE]
        );
        if (!estudiante) return res.status(404).json({ message: 'No se encontró al estudiante.' });

        // Si la fecha es hoy se guarda la hora actual; si es de otro día, al mediodía de ese día
        const hoy = new Date().toISOString().slice(0, 10);
        const fechaGuardar = !fecha || fecha === hoy ? new Date() : new Date(`${fecha}T12:00:00`);

        const [resultado] = await db.query(
            `INSERT INTO intervension
                (fecha, factores_identificados, situacion, causa_identificada, proceso_realizado, avance, observaciones, id_usuario, id_psicologo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fechaGuardar, datos.factores, datos.situacion, datos.causas, datos.proceso, datos.avance, datos.observaciones,
                estudiante.id_usuario, idPsicologa]
        );

        const alertas = await cambiarEstadoAlertas(db, estudiante.id_usuario, 'En atención', ['Nueva']);

        return res.status(201).json({
            message: 'Intervención registrada.',
            id: resultado.insertId,
            alertasEnAtencion: alertas.affectedRows
        });
    } catch (error) {
        console.error('Registrar intervención:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar la intervención. Inténtalo de nuevo.' });
    }
});

router.get('/intervenciones/:idUsuario', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const [filas] = await connection.promise().query(
            `SELECT i.*, DATE_FORMAT(i.fecha, '%Y-%m-%d') AS fecha_iso,
                    p.nombre AS psicologa_nombre, p.apellido AS psicologa_apellido
             FROM intervension i
             LEFT JOIN usuario p ON p.id_usuario = i.id_psicologo
             WHERE i.id_usuario = ?
             ORDER BY i.fecha DESC, i.id_intervencion DESC`,
            [soloDigitos(req.params.idUsuario)]
        );

        return res.json({
            intervenciones: filas.map((f) => ({
                id: f.id_intervencion,
                fecha: f.fecha_iso,
                factores: f.factores_identificados,
                situacion: f.situacion,
                causas: f.causa_identificada,
                proceso: f.proceso_realizado,
                avance: f.avance,
                observaciones: f.observaciones,
                psicologa: f.psicologa_nombre ? capitalizar(`${f.psicologa_nombre} ${f.psicologa_apellido}`) : ''
            }))
        });
    } catch (error) {
        console.error('Historial de intervenciones:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar el historial.' });
    }
});

// =========================================================
// CONTACTO CON ACUDIENTES
// El acudiente principal sale de estudiante.id_acudiente (lo registra la secretaría).
// Los contactos alternativos se guardan también en la tabla acudiente, con
// acudiente.id_estudiante = id del estudiante al que pertenecen.
// Cada contacto realizado queda en contacto_acudiente.
// =========================================================

const MEDIOS_CONTACTO = ['llamada', 'whatsapp', 'correo', 'presencial'];
const TIPOS_DOCUMENTO = ['Cédula', 'Tarjeta identidad', 'PPI', 'Pasaporte', 'Otro'];   // los mismos de la secretaría

async function estudianteExiste(db, idUsuario) {
    const [[estudiante]] = await db.query(
        'SELECT id_usuario FROM usuario WHERE id_usuario = ? AND id_rol = ? LIMIT 1',
        [idUsuario, ROL_ESTUDIANTE]
    );
    return Boolean(estudiante);
}

router.get('/acudientes/:idUsuario', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const idEstudiante = soloDigitos(req.params.idUsuario);

        const [[ficha]] = await db.query(
            'SELECT id_estudiante, id_acudiente FROM estudiante WHERE id_usuario = ? LIMIT 1',
            [idEstudiante]
        );
        const [acudientes] = ficha ? await db.query(
            `SELECT * FROM acudiente
             WHERE id_acudiente = ? OR id_estudiante = ?
             ORDER BY (id_acudiente = ?) DESC, nombre`,
            [ficha.id_acudiente, ficha.id_estudiante, ficha.id_acudiente]
        ) : [[]];
        const [registros] = await db.query(
            `SELECT c.*, p.nombre AS psicologa_nombre, p.apellido AS psicologa_apellido
             FROM contacto_acudiente c
             LEFT JOIN usuario p ON p.id_usuario = c.id_psicologo
             WHERE c.id_usuario = ?
             ORDER BY c.fecha DESC, c.id_registro DESC
             LIMIT 20`,
            [idEstudiante]
        );

        return res.json({
            tieneFicha: Boolean(ficha),
            contactos: acudientes.map((a) => {
                const principal = String(a.id_acudiente) === String(ficha.id_acudiente);
                return {
                    id: String(a.id_acudiente),
                    nombre: capitalizar(`${a.nombre} ${a.apellido}`),
                    parentesco: capitalizar(a.parentesco || (principal ? 'Acudiente' : 'Contacto alternativo')),
                    telefono: String(a.celular || ''),
                    correo: a.correo || '',
                    principal
                };
            }),
            registros: registros.map((r) => ({
                id: r.id_registro,
                nombre: r.nombre_contacto,
                parentesco: r.parentesco,
                telefono: r.telefono,
                medio: r.medio,
                mensaje: r.mensaje,
                observacion: r.observacion,
                fecha: r.fecha,
                psicologa: r.psicologa_nombre ? capitalizar(`${r.psicologa_nombre} ${r.psicologa_apellido}`) : ''
            }))
        });
    } catch (error) {
        console.error('Contactos de acudientes:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar los contactos del acudiente.' });
    }
});

router.post('/acudientes/:idUsuario/alternativos', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const idUsuario = soloDigitos(req.params.idUsuario);
        const body = req.body || {};
        const documento = soloDigitos(body.documento);
        const tipoDocumento = TIPOS_DOCUMENTO.includes(body.tipoDocumento) ? body.tipoDocumento : '';
        const nombre = texto(body.nombre, 20);
        const apellido = texto(body.apellido, 20);
        const parentesco = texto(body.parentesco, 200);
        const ocupacion = texto(body.ocupacion, 200);
        const telefono = soloDigitos(body.telefono);
        const correo = texto(body.correo, 100).toLowerCase();

        if (documento.length < 5 || documento.length > 15) return res.status(400).json({ message: 'Escribe un número de documento válido (5 a 15 dígitos).' });
        if (!tipoDocumento) return res.status(400).json({ message: 'Elige el tipo de documento.' });
        if (!nombreRegex.test(nombre) || !nombreRegex.test(apellido)) return res.status(400).json({ message: 'Escribe nombre y apellido válidos (solo letras, máximo 20 caracteres cada uno).' });
        if (!parentesco) return res.status(400).json({ message: 'Escribe el parentesco con el estudiante.' });
        if (telefono.length < 7 || telefono.length > 15) return res.status(400).json({ message: 'Escribe un número de celular válido.' });
        if (correo && !emailRegex.test(correo)) return res.status(400).json({ message: 'El correo no es válido.' });

        const [[ficha]] = await db.query('SELECT id_estudiante, id_acudiente FROM estudiante WHERE id_usuario = ? LIMIT 1', [idUsuario]);
        if (!ficha) return res.status(404).json({ message: 'El estudiante no tiene ficha registrada por la secretaría.' });

        const [[existente]] = await db.query('SELECT id_acudiente FROM acudiente WHERE id_acudiente = ? LIMIT 1', [documento]);
        if (existente) {
            return res.status(409).json({ message: 'Ya hay un acudiente registrado con ese número de documento.' });
        }

        await db.query(
            `INSERT INTO acudiente
                (id_acudiente, parentesco, ocupacion, nombre, apellido, correo, celular, tipo_documento, id_estudiante)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [documento, capitalizar(parentesco), ocupacion, capitalizar(nombre), capitalizar(apellido), correo,
                Number(telefono), tipoDocumento, ficha.id_estudiante]
        );
        return res.status(201).json({ message: 'Contacto alternativo agregado.', id: documento });
    } catch (error) {
        console.error('Agregar contacto alternativo:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar el contacto alternativo.' });
    }
});

router.delete('/acudientes/alternativos/:id', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const documento = soloDigitos(req.params.id);

        // Nunca se borra un acudiente principal (el que está en la ficha de algún estudiante)
        const [[enUso]] = await db.query('SELECT id_estudiante FROM estudiante WHERE id_acudiente = ? LIMIT 1', [documento]);
        if (enUso) return res.status(409).json({ message: 'Ese contacto es el acudiente principal; solo la secretaría puede cambiarlo.' });

        const [resultado] = await db.query(
            'DELETE FROM acudiente WHERE id_acudiente = ? AND id_estudiante IS NOT NULL',
            [documento]
        );
        if (!resultado.affectedRows) return res.status(404).json({ message: 'El contacto ya no existe.' });
        return res.json({ message: 'Contacto eliminado.' });
    } catch (error) {
        console.error('Eliminar contacto alternativo:', error.message);
        return res.status(500).json({ message: 'No se pudo eliminar el contacto.' });
    }
});

router.post('/acudientes/:idUsuario/contactos', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const idEstudiante = soloDigitos(req.params.idUsuario);
        const body = req.body || {};
        const medio = String(body.medio || '').toLowerCase();
        const nombre = texto(body.nombre, 150);

        if (!MEDIOS_CONTACTO.includes(medio)) return res.status(400).json({ message: 'Elige cómo se hizo el contacto.' });
        if (!nombre) return res.status(400).json({ message: 'Elige a quién contactaste.' });
        if (!(await estudianteExiste(db, idEstudiante))) return res.status(404).json({ message: 'No se encontró al estudiante.' });

        const [resultado] = await db.query(
            `INSERT INTO contacto_acudiente
                (id_usuario, id_psicologo, nombre_contacto, parentesco, telefono, medio, mensaje, observacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [idEstudiante, idPsicologa, nombre, texto(body.parentesco, 100), soloDigitos(body.telefono).slice(0, 20),
                medio, textoLargo(body.mensaje), textoLargo(body.observacion)]
        );

        // Contactar a la familia es atender el caso: sus alertas nuevas pasan a "En atención"
        await cambiarEstadoAlertas(db, idEstudiante, 'En atención', ['Nueva']);

        return res.status(201).json({ message: 'Contacto registrado.', id: resultado.insertId });
    } catch (error) {
        console.error('Registrar contacto con acudiente:', error.message);
        return res.status(500).json({ message: 'No se pudo registrar el contacto.' });
    }
});

// =========================================================
// DERIVACIONES A RED DE APOYO (EPS u otra entidad externa)
// =========================================================

router.get('/derivaciones/:idUsuario', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const [filas] = await connection.promise().query(
            `SELECT d.*, DATE_FORMAT(d.fecha_derivacion, '%Y-%m-%d') AS fecha_iso,
                    p.nombre AS psicologa_nombre, p.apellido AS psicologa_apellido
             FROM derivacion d
             LEFT JOIN usuario p ON p.id_usuario = d.id_psicologo
             WHERE d.id_usuario = ?
             ORDER BY d.fecha_derivacion DESC, d.id_derivacion DESC`,
            [soloDigitos(req.params.idUsuario)]
        );

        return res.json({
            derivaciones: filas.map((d) => ({
                id: d.id_derivacion,
                eps: d.eps,
                servicio: d.servicio,
                fecha: d.fecha_iso,
                motivo: d.motivo,
                estado: d.estado,
                psicologa: d.psicologa_nombre ? capitalizar(`${d.psicologa_nombre} ${d.psicologa_apellido}`) : ''
            }))
        });
    } catch (error) {
        console.error('Derivaciones:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar las derivaciones.' });
    }
});

router.post('/derivaciones', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const body = req.body || {};
        const idEstudiante = soloDigitos(body.idUsuario);
        const eps = texto(body.eps, 150);
        const servicio = texto(body.servicio, 100);
        const motivo = textoLargo(body.motivo);
        const fecha = String(body.fecha || '').trim() || new Date().toISOString().slice(0, 10);

        if (!idEstudiante) return res.status(400).json({ message: 'No se identificó al estudiante.' });
        if (eps.length < 2) return res.status(400).json({ message: 'Escribe el nombre de la EPS o entidad.' });
        if (motivo.length < 5) return res.status(400).json({ message: 'Escribe el motivo de la derivación.' });
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || new Date(`${fecha}T00:00:00`) > new Date()) {
            return res.status(400).json({ message: 'La fecha de la derivación no es válida (no puede ser futura).' });
        }
        if (!(await estudianteExiste(db, idEstudiante))) return res.status(404).json({ message: 'No se encontró al estudiante.' });

        const [resultado] = await db.query(
            `INSERT INTO derivacion (id_usuario, id_psicologo, eps, servicio, fecha_derivacion, motivo)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [idEstudiante, idPsicologa, eps, servicio, fecha, motivo]
        );

        // Derivar es atender el caso: sus alertas nuevas pasan a "En atención"
        await cambiarEstadoAlertas(db, idEstudiante, 'En atención', ['Nueva']);

        return res.status(201).json({ message: 'Derivación registrada.', id: resultado.insertId });
    } catch (error) {
        console.error('Registrar derivación:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar la derivación.' });
    }
});

// =========================================================
// DISPONIBILIDAD (Agenda): franjas por día en la tabla disponibilidad.
// Una franja con cita asignada (cita.id_disponibilidad) queda "Reservada"
// y no se puede borrar desde aquí.
// =========================================================

const fechaValida = (valor) => /^\d{4}-\d{2}-\d{2}$/.test(String(valor || '')) && !Number.isNaN(new Date(`${valor}T00:00:00`).getTime());
const horaValida = (valor) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(valor || ''));
const DURACIONES = [15, 20, 30, 45, 60, 90, 120];

function hoyLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sumarDias(fecha, dias) {
    const d = new Date(`${fecha}T12:00:00`);
    d.setDate(d.getDate() + dias);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Horas entre inicio y fin (sin pasarse del fin) cada "duracion" minutos
function horasEntre(inicio, fin, duracion) {
    const aMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const horas = [];
    for (let m = aMin(inicio); m + duracion <= aMin(fin); m += duracion) {
        horas.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    return horas;
}

async function leerFranjas(db, idPsicologa, desde, hasta) {
    const [filas] = await db.query(
        `SELECT d.id_disponibilidad, DATE_FORMAT(d.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(d.hora, '%H:%i') AS hora,
                d.duracion_min, d.estado,
                EXISTS (SELECT 1 FROM cita c WHERE c.id_disponibilidad = d.id_disponibilidad) AS reservada
         FROM disponibilidad d
         WHERE d.id_usuario = ? AND d.fecha BETWEEN ? AND ?
         ORDER BY d.fecha, d.hora`,
        [idPsicologa, desde, hasta]
    );
    return filas.map((f) => ({
        id: f.id_disponibilidad,
        fecha: f.fecha,
        hora: f.hora,
        duracion: f.duracion_min,
        estado: f.reservada ? 'Reservada' : f.estado || 'Disponible',
        reservada: Boolean(f.reservada)
    }));
}

router.get('/disponibilidad', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const { desde, hasta } = req.query;
        if (!fechaValida(desde) || !fechaValida(hasta) || desde > hasta) {
            return res.status(400).json({ message: 'El rango de fechas no es válido.' });
        }
        return res.json({ franjas: await leerFranjas(connection.promise(), idPsicologa, desde, hasta) });
    } catch (error) {
        console.error('Leer disponibilidad:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar la disponibilidad.' });
    }
});

// Crea la disponibilidad de uno o varios días (un día, una semana o un mes) con el mismo horario
router.post(['/disponibilidad', '/disponibilidad/semana'], async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const body = req.body || {};
        const fechas = [...new Set(Array.isArray(body.fechas) ? body.fechas.map(String) : [])];
        const duracion = Number(body.duracion);
        const bloques = Array.isArray(body.bloques) ? body.bloques : [];

        if (!fechas.length || !fechas.every(fechaValida)) return res.status(400).json({ message: 'Elige al menos un día.' });
        if (fechas.length > 31) return res.status(400).json({ message: 'Puedes crear disponibilidad de máximo un mes a la vez.' });
        if (fechas.some((f) => f < hoyLocal())) return res.status(400).json({ message: 'No se puede crear disponibilidad en días que ya pasaron.' });
        if (!DURACIONES.includes(duracion)) return res.status(400).json({ message: 'Elige una duración válida para cada franja.' });
        if (!bloques.length || !bloques.every((b) => horaValida(b.inicio) && horaValida(b.fin) && b.inicio < b.fin)) {
            return res.status(400).json({ message: 'Revisa el horario: la hora de inicio debe ser antes de la hora de fin.' });
        }

        const horas = [...new Set(bloques.flatMap((b) => horasEntre(b.inicio, b.fin, duracion)))].sort();
        if (!horas.length) return res.status(400).json({ message: 'El horario es más corto que la duración de una franja.' });

        const filas = fechas.flatMap((fecha) => horas.map((hora) => [idPsicologa, fecha, hora, duracion, 'Disponible']));
        const [resultado] = await connection.promise().query(
            'INSERT IGNORE INTO disponibilidad (id_usuario, fecha, hora, duracion_min, estado) VALUES ?',
            [filas]
        );

        return res.status(201).json({
            message: 'Disponibilidad creada.',
            creadas: resultado.affectedRows,
            repetidas: filas.length - resultado.affectedRows
        });
    } catch (error) {
        console.error('Crear disponibilidad semanal:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar la disponibilidad.' });
    }
});

// Reemplaza las franjas de un día (las reservadas se conservan siempre)
router.put('/disponibilidad/dia/:fecha', async (req, res) => {
    const db = connection.promise();
    let transaccion = false;
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const fecha = req.params.fecha;
        const body = req.body || {};
        const franjas = Array.isArray(body.franjas) ? body.franjas : [];

        if (!fechaValida(fecha)) return res.status(400).json({ message: 'La fecha no es válida.' });
        if (fecha < hoyLocal()) return res.status(400).json({ message: 'No se puede editar un día que ya pasó.' });
        if (!franjas.every((f) => horaValida(f.hora) && DURACIONES.includes(Number(f.duracion)))) {
            return res.status(400).json({ message: 'Revisa las horas y la duración de cada franja.' });
        }
        const horas = franjas.map((f) => f.hora);
        if (new Set(horas).size !== horas.length) return res.status(400).json({ message: 'Hay horas repetidas en el día.' });

        await db.beginTransaction();
        transaccion = true;

        const actuales = await leerFranjas(db, idPsicologa, fecha, fecha);
        const reservadas = actuales.filter((f) => f.reservada);
        const borrar = actuales.filter((f) => !f.reservada && !horas.includes(f.hora)).map((f) => f.id);
        if (borrar.length) await db.query('DELETE FROM disponibilidad WHERE id_disponibilidad IN (?)', [borrar]);

        for (const franja of franjas) {
            if (reservadas.some((r) => r.hora === franja.hora)) continue;
            await db.query(
                `INSERT INTO disponibilidad (id_usuario, fecha, hora, duracion_min, estado) VALUES (?, ?, ?, ?, 'Disponible')
                 ON DUPLICATE KEY UPDATE duracion_min = VALUES(duracion_min)`,
                [idPsicologa, fecha, franja.hora, Number(franja.duracion)]
            );
        }

        await db.commit();
        transaccion = false;

        const conservadas = reservadas.filter((r) => !horas.includes(r.hora)).map((r) => r.hora);
        return res.json({
            message: 'Día actualizado.',
            franjas: await leerFranjas(db, idPsicologa, fecha, fecha),
            reservadasConservadas: conservadas
        });
    } catch (error) {
        if (transaccion) await db.rollback().catch(() => {});
        console.error('Editar disponibilidad del día:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar el día.' });
    }
});

// =========================================================
// CITAS / SEGUIMIENTOS
//   Estados: Pendiente (la pidió el estudiante) → Programada → Realizada / No asistió
//            Rechazada / Cancelada (la franja vuelve a quedar libre)
//   Cada cita programada ocupa una franja de la disponibilidad de la psicóloga.
//   Cada cambio le llega al estudiante como notificación.
// =========================================================

const TIPOS_CITA = ['Seguimiento de caso', 'Sesión individual', 'Reunión con acudiente', 'Reunión con docente', 'Consulta breve'];

function ahoraLocal() {
    const d = new Date();
    return { fecha: hoyLocal(), hora: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
}

const esFuturo = (fecha, hora) => {
    const ahora = ahoraLocal();
    return fecha > ahora.fecha || (fecha === ahora.fecha && hora > ahora.hora);
};

/* Deja reservada una franja para la cita (dentro de una transacción).
   horario = { idDisponibilidad } o { fecha, hora, duracion } (si no existe la franja, se crea).
   ignorarCita: al reprogramar, la propia cita no cuenta como choque. */
async function reservarFranja(db, idPsicologa, horario, ignorarCita = 0) {
    let idFranja = soloDigitos(horario.idDisponibilidad);
    if (!idFranja) {
        const fecha = String(horario.fecha || '');
        const hora = String(horario.hora || '').slice(0, 5);
        const duracion = Number(horario.duracion) || 60;
        if (!fechaValida(fecha) || !horaValida(hora)) return { status: 400, message: 'Elige la fecha y la hora de la cita.' };
        if (!DURACIONES.includes(duracion)) return { status: 400, message: 'Elige una duración válida.' };
        if (!esFuturo(fecha, hora)) return { status: 400, message: 'La fecha y hora de la cita deben ser futuras.' };

        // No puede cruzarse con otra cita de ese día
        const [delDia] = await db.query(
            `SELECT TIME_FORMAT(d.hora, '%H:%i') AS hora, d.duracion_min FROM disponibilidad d
             JOIN cita c ON c.id_disponibilidad = d.id_disponibilidad
             WHERE d.id_usuario = ? AND d.fecha = ? AND d.hora <> ? AND c.id_cita <> ?`,
            [idPsicologa, fecha, hora, ignorarCita]
        );
        const aMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
        const choque = delDia.find((c) => aMin(hora) < aMin(c.hora) + c.duracion_min && aMin(c.hora) < aMin(hora) + duracion);
        if (choque) return { status: 409, message: `Ya tienes una cita a las ${choque.hora} que se cruza con ese horario.` };

        // Usa la franja si ya existe; si no, la agrega a la disponibilidad
        await db.query(
            `INSERT INTO disponibilidad (id_usuario, fecha, hora, duracion_min, estado) VALUES (?, ?, ?, ?, 'Disponible')
             ON DUPLICATE KEY UPDATE id_disponibilidad = LAST_INSERT_ID(id_disponibilidad)`,
            [idPsicologa, fecha, hora, duracion]
        );
        const [[creada]] = await db.query('SELECT LAST_INSERT_ID() AS id');
        idFranja = creada.id;
    }

    // Bloquea la franja para que nadie más la tome al mismo tiempo
    const [[franja]] = await db.query(
        `SELECT id_disponibilidad, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(hora, '%H:%i') AS hora
         FROM disponibilidad WHERE id_disponibilidad = ? AND id_usuario = ? FOR UPDATE`,
        [idFranja, idPsicologa]
    );
    if (!franja || !esFuturo(franja.fecha, franja.hora)) return { status: 409, message: 'Ese horario ya no está disponible. Elige otro.' };
    const [[ocupada]] = await db.query('SELECT id_cita FROM cita WHERE id_disponibilidad = ? AND id_cita <> ? LIMIT 1', [idFranja, ignorarCita]);
    if (ocupada) return { status: 409, message: 'Ese horario ya está ocupado por otra cita. Elige otro.' };
    return { franja };
}

function leerTipo(body) {
    // "Otro": la psicóloga escribe el tipo de cita
    if (body.tipo === 'Otro') return texto(body.tipoOtro, 60);
    return TIPOS_CITA.includes(body.tipo) ? body.tipo : '';
}

// La cita debe ser de esta psicóloga (o una solicitud del estudiante aún sin asignar)
async function citaDeLaPsicologa(db, idCita, idPsicologa, bloquear = false) {
    const [[cita]] = await db.query(
        `SELECT c.*, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha_iso, TIME_FORMAT(c.hora, '%H:%i') AS hora_txt,
                COALESCE(c.id_psicologo, d.id_usuario) AS responsable
         FROM cita c LEFT JOIN disponibilidad d ON d.id_disponibilidad = c.id_disponibilidad
         WHERE c.id_cita = ?${bloquear ? ' FOR UPDATE' : ''}`,
        [soloDigitos(idCita)]
    );
    if (!cita) return null;
    if (cita.responsable && String(cita.responsable) !== String(idPsicologa)) return null;
    return cita;
}

// Franjas futuras sin cita, para elegir dónde agendar
router.get('/disponibilidad/libres', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const ahora = ahoraLocal();
        const hasta = sumarDias(ahora.fecha, Math.min(Math.max(Number(req.query.dias) || 30, 1), 90));
        const franjas = (await leerFranjas(connection.promise(), idPsicologa, ahora.fecha, hasta))
            .filter((f) => !f.reservada && esFuturo(f.fecha, f.hora));
        return res.json({ franjas });
    } catch (error) {
        console.error('Franjas libres:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar la disponibilidad.' });
    }
});

// Citas de la psicóloga + solicitudes de estudiantes aún sin asignar
router.get('/citas', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const desde = fechaValida(req.query.desde) ? req.query.desde : sumarDias(hoyLocal(), -60);
        const [filas] = await connection.promise().query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha, TIME_FORMAT(c.hora, '%H:%i') AS hora,
                    c.tipo, c.origen, c.motivo, c.estado, c.observacion, c.id_usuario, c.id_disponibilidad,
                    COALESCE(d.duracion_min, 60) AS duracion_min, COALESCE(c.id_psicologo, d.id_usuario) AS responsable,
                    u.nombre, u.apellido, e.grado, c.fecha_solicitud
             FROM cita c
             LEFT JOIN disponibilidad d ON d.id_disponibilidad = c.id_disponibilidad
             JOIN usuario u ON u.id_usuario = c.id_usuario
             LEFT JOIN estudiante e ON e.id_usuario = c.id_usuario
             WHERE c.estado IN ('Pendiente', 'Programada', 'Realizada', 'No asistió')
               AND (COALESCE(c.id_psicologo, d.id_usuario) = ?
                    OR (COALESCE(c.id_psicologo, d.id_usuario) IS NULL AND c.estado = 'Pendiente'))
               AND (c.fecha >= ? OR c.estado = 'Pendiente')
             ORDER BY c.fecha, c.hora`,
            [idPsicologa, desde]
        );
        return res.json({
            citas: filas.map((c) => ({
                id: c.id_cita,
                fecha: c.fecha,
                hora: c.hora,
                duracion: c.duracion_min,
                tipo: c.tipo,
                origen: c.origen,
                motivo: c.motivo,
                estado: c.estado,
                observacion: c.observacion,
                conHorario: Boolean(c.id_disponibilidad),
                sinAsignar: !c.responsable,
                solicitada: c.fecha_solicitud,
                idUsuario: c.id_usuario,
                estudiante: capitalizar(`${c.nombre} ${c.apellido}`),
                grado: c.grado || ''
            }))
        });
    } catch (error) {
        console.error('Citas:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar las citas.' });
    }
});

// Crear cita (queda programada y se le avisa al estudiante)
router.post('/citas', async (req, res) => {
    const db = connection.promise();
    let transaccion = false;
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const body = req.body || {};
        const idEstudiante = soloDigitos(body.idUsuario);
        const tipo = leerTipo(body);
        const motivo = textoLargo(body.motivo);

        if (!idEstudiante) return res.status(400).json({ message: 'No se identificó al estudiante.' });
        if (body.tipo === 'Otro' && tipo.length < 3) return res.status(400).json({ message: 'Escribe cuál es el tipo de cita.' });
        if (!tipo) return res.status(400).json({ message: 'Elige el tipo de cita.' });
        if (motivo.length < 5) return res.status(400).json({ message: 'Escribe el motivo de la cita.' });
        if (!(await estudianteExiste(db, idEstudiante))) return res.status(404).json({ message: 'No se encontró al estudiante.' });

        await db.beginTransaction();
        transaccion = true;

        const r = await reservarFranja(db, idPsicologa, body);
        if (!r.franja) {
            await db.rollback();
            transaccion = false;
            return res.status(r.status).json({ message: r.message });
        }

        const [resultado] = await db.query(
            `INSERT INTO cita (fecha, hora, tipo, origen, id_usuario, id_psicologo, motivo, estado, observacion, id_disponibilidad)
             VALUES (?, ?, ?, 'psicologia', ?, ?, ?, 'Programada', '', ?)`,
            [r.franja.fecha, r.franja.hora, tipo, idEstudiante, idPsicologa, motivo, r.franja.id_disponibilidad]
        );
        await notificar(db, {
            destino: idEstudiante,
            idCita: resultado.insertId,
            tipo: 'cita_asignada',
            titulo: 'Tienes una cita con psicología',
            mensaje: `Se te asignó una cita (${tipo}) para el ${conPunto(cuandoTexto(r.franja.fecha, r.franja.hora))} Motivo: ${motivo}`
        });

        await db.commit();
        transaccion = false;
        return res.status(201).json({ message: 'Cita agendada.', id: resultado.insertId, fecha: r.franja.fecha, hora: r.franja.hora });
    } catch (error) {
        if (transaccion) await db.rollback().catch(() => {});
        console.error('Agendar cita:', error.message);
        return res.status(500).json({ message: 'No se pudo agendar la cita.' });
    }
});

// Reprogramar o editar una cita (nuevo horario, tipo o motivo).
// Si era una solicitud pendiente del estudiante, al guardarla queda aceptada.
router.put('/citas/:id', async (req, res) => {
    const db = connection.promise();
    let transaccion = false;
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const body = req.body || {};
        const tipo = leerTipo(body);
        const motivo = textoLargo(body.motivo);
        if (body.tipo === 'Otro' && tipo.length < 3) return res.status(400).json({ message: 'Escribe cuál es el tipo de cita.' });
        if (!tipo) return res.status(400).json({ message: 'Elige el tipo de cita.' });
        if (motivo.length < 5) return res.status(400).json({ message: 'Escribe el motivo de la cita.' });

        await db.beginTransaction();
        transaccion = true;

        const cita = await citaDeLaPsicologa(db, req.params.id, idPsicologa, true);
        if (!cita || !['Pendiente', 'Programada'].includes(cita.estado)) {
            await db.rollback();
            transaccion = false;
            return res.status(404).json({ message: 'La cita ya no se puede modificar.' });
        }

        const r = await reservarFranja(db, idPsicologa, body, cita.id_cita);
        if (!r.franja) {
            await db.rollback();
            transaccion = false;
            return res.status(r.status).json({ message: r.message });
        }

        await db.query(
            `UPDATE cita SET fecha = ?, hora = ?, tipo = ?, motivo = ?, id_disponibilidad = ?, id_psicologo = ?, estado = 'Programada'
             WHERE id_cita = ?`,
            [r.franja.fecha, r.franja.hora, tipo, motivo, r.franja.id_disponibilidad, idPsicologa, cita.id_cita]
        );
        const eraPendiente = cita.estado === 'Pendiente';
        const cambioHorario = r.franja.fecha !== cita.fecha_iso || r.franja.hora !== cita.hora_txt;
        await notificar(db, {
            destino: cita.id_usuario,
            idCita: cita.id_cita,
            tipo: eraPendiente ? 'cita_aceptada' : 'cita_cambiada',
            titulo: eraPendiente ? '¡Tu cita fue aceptada!' : (cambioHorario ? 'Tu cita cambió de horario' : 'Tu cita fue actualizada'),
            mensaje: `Tu cita (${tipo}) quedó para el ${conPunto(cuandoTexto(r.franja.fecha, r.franja.hora))}`
        });

        await db.commit();
        transaccion = false;
        return res.json({ message: 'Cita actualizada.', fecha: r.franja.fecha, hora: r.franja.hora });
    } catch (error) {
        if (transaccion) await db.rollback().catch(() => {});
        console.error('Editar cita:', error.message);
        return res.status(500).json({ message: 'No se pudo actualizar la cita.' });
    }
});

// Aceptar una solicitud del estudiante (en el horario que pidió)
router.put('/citas/:id/aceptar', async (req, res) => {
    const db = connection.promise();
    let transaccion = false;
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        await db.beginTransaction();
        transaccion = true;

        const cita = await citaDeLaPsicologa(db, req.params.id, idPsicologa, true);
        if (!cita || cita.estado !== 'Pendiente') {
            await db.rollback();
            transaccion = false;
            return res.status(404).json({ message: 'Esta solicitud ya fue atendida.' });
        }

        const horario = cita.id_disponibilidad
            ? { idDisponibilidad: cita.id_disponibilidad }
            : { fecha: cita.fecha_iso, hora: cita.hora_txt, duracion: 60 };
        const r = await reservarFranja(db, idPsicologa, horario, cita.id_cita);
        if (!r.franja) {
            await db.rollback();
            transaccion = false;
            return res.status(r.status).json({ message: `${r.message} Puedes reprogramarla a otro horario.` });
        }

        await db.query(
            "UPDATE cita SET estado = 'Programada', id_psicologo = ?, id_disponibilidad = ? WHERE id_cita = ?",
            [idPsicologa, r.franja.id_disponibilidad, cita.id_cita]
        );
        await notificar(db, {
            destino: cita.id_usuario,
            idCita: cita.id_cita,
            tipo: 'cita_aceptada',
            titulo: '¡Tu cita fue aceptada!',
            mensaje: `La psicóloga aceptó tu cita para el ${conPunto(cuandoTexto(r.franja.fecha, r.franja.hora))} Te esperamos.`
        });

        await db.commit();
        transaccion = false;
        return res.json({ message: 'Cita aceptada.' });
    } catch (error) {
        if (transaccion) await db.rollback().catch(() => {});
        console.error('Aceptar cita:', error.message);
        return res.status(500).json({ message: 'No se pudo aceptar la cita.' });
    }
});

// Rechazar una solicitud del estudiante
router.put('/citas/:id/rechazar', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const cita = await citaDeLaPsicologa(db, req.params.id, idPsicologa);
        if (!cita || cita.estado !== 'Pendiente') return res.status(404).json({ message: 'Esta solicitud ya fue atendida.' });
        const motivo = textoLargo((req.body || {}).motivo, 500);

        await db.query(
            "UPDATE cita SET estado = 'Rechazada', id_disponibilidad = NULL, id_psicologo = ?, observacion = ? WHERE id_cita = ?",
            [idPsicologa, motivo, cita.id_cita]
        );
        await notificar(db, {
            destino: cita.id_usuario,
            idCita: cita.id_cita,
            tipo: 'cita_rechazada',
            titulo: 'Tu solicitud de cita no pudo agendarse',
            mensaje: `No fue posible atenderte el ${conPunto(cuandoTexto(cita.fecha_iso, cita.hora_txt))}${motivo ? ` ${motivo}` : ''} Puedes pedir otro horario.`
        });
        return res.json({ message: 'Solicitud rechazada.' });
    } catch (error) {
        console.error('Rechazar cita:', error.message);
        return res.status(500).json({ message: 'No se pudo rechazar la solicitud.' });
    }
});

// Marcar como realizada o como "no asistió" (o volver a programada)
router.put('/citas/:id/estado', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const body = req.body || {};
        const estado = String(body.estado || '');
        if (!['Realizada', 'No asistió', 'Programada'].includes(estado)) return res.status(400).json({ message: 'Estado no válido.' });

        const db = connection.promise();
        const cita = await citaDeLaPsicologa(db, req.params.id, idPsicologa);
        if (!cita || !['Programada', 'Realizada', 'No asistió'].includes(cita.estado)) return res.status(404).json({ message: 'La cita no se encontró.' });

        await db.query('UPDATE cita SET estado = ?, observacion = ? WHERE id_cita = ?',
            [estado, textoLargo(body.observacion, 1000) || cita.observacion, cita.id_cita]);
        return res.json({ message: 'Estado actualizado.' });
    } catch (error) {
        console.error('Estado de cita:', error.message);
        return res.status(500).json({ message: 'No se pudo actualizar la cita.' });
    }
});

// Cancelar: la franja queda libre y se le avisa al estudiante
router.delete('/citas/:id', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const db = connection.promise();
        const cita = await citaDeLaPsicologa(db, req.params.id, idPsicologa);
        if (!cita || !['Pendiente', 'Programada'].includes(cita.estado)) return res.status(404).json({ message: 'La cita ya no existe.' });

        await db.query(
            "UPDATE cita SET estado = 'Cancelada', id_disponibilidad = NULL, id_psicologo = ? WHERE id_cita = ?",
            [idPsicologa, cita.id_cita]
        );
        await notificar(db, {
            destino: cita.id_usuario,
            idCita: cita.id_cita,
            tipo: 'cita_cancelada',
            titulo: 'Tu cita fue cancelada',
            mensaje: `La cita del ${cuandoTexto(cita.fecha_iso, cita.hora_txt)} fue cancelada por psicología. Si lo necesitas, puedes pedir una nueva.`
        });
        return res.json({ message: 'Cita cancelada.' });
    } catch (error) {
        console.error('Cancelar cita:', error.message);
        return res.status(500).json({ message: 'No se pudo cancelar la cita.' });
    }
});

// =========================================================
// NOTIFICACIONES DE LA PSICÓLOGA (campanita): alertas de riesgo, solicitudes de
// ayuda, alertas de docentes y avisos de citas. Todas llegan también por correo.
// =========================================================

router.get('/notificaciones', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const [filas] = await connection.promise().query(
            `SELECT id_notificacion, id_ayuda, id_cita, tipo, titulo, mensaje, nivel_riesgo, leida, fecha
             FROM notificacion WHERE id_usuario_destino = ?
             ORDER BY fecha DESC, id_notificacion DESC LIMIT 40`,
            [idPsicologa]
        );
        const [[conteo]] = await connection.promise().query(
            'SELECT COUNT(*) AS n FROM notificacion WHERE id_usuario_destino = ? AND leida = 0', [idPsicologa]
        );
        return res.json({
            sinLeer: Number(conteo.n || 0),
            notificaciones: filas.map((n) => ({
                id: n.id_notificacion,
                idAyuda: n.id_ayuda,
                idCita: n.id_cita,
                tipo: n.tipo,
                titulo: n.titulo,
                mensaje: n.mensaje,
                nivel: n.nivel_riesgo,
                leida: Boolean(n.leida),
                fecha: n.fecha
            }))
        });
    } catch (error) {
        console.error('Notificaciones de psicología:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar las notificaciones.' });
    }
});

router.put('/notificaciones/leidas', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;

        const ids = Array.isArray((req.body || {}).ids) ? req.body.ids.map(soloDigitos).filter(Boolean) : [];
        if (ids.length) {
            await connection.promise().query(
                'UPDATE notificacion SET leida = 1 WHERE id_usuario_destino = ? AND id_notificacion IN (?)', [idPsicologa, ids]
            );
        } else {
            await connection.promise().query('UPDATE notificacion SET leida = 1 WHERE id_usuario_destino = ?', [idPsicologa]);
        }
        return res.json({ message: 'Listo.' });
    } catch (error) {
        console.error('Marcar notificaciones de psicología:', error.message);
        return res.status(500).json({ message: 'No se pudieron actualizar las notificaciones.' });
    }
});

export default router;
