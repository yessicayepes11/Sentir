import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenUsuario } from '../../config/studentToken.js';
import { nombresDe, NOMBRE_NIVEL } from '../../config/factoresRiesgo.js';

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

router.get('/inicio', async (req, res) => {
    try {
        const id = await psicologaDeLaSesion(req, res);
        if (!id) return;
        const db = connection.promise();

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
                riskHistory: suyas.slice().reverse().map((a) => ({ fecha: a.fecha_iso.slice(0, 10), risk: riesgoDe(a) }))
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

export default router;
