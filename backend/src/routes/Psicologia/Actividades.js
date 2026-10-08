import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenUsuario } from '../../config/studentToken.js';
import { pedirJSON } from '../../config/ia.js';
import { notificar } from '../../config/citas.js';

// =========================================================
// CONTROL DE ACTIVIDADES (psicología) — montado en /api/Psicologia
//   GET    /actividades                 catálogo
//   POST   /actividades                 crear (con archivo opcional y/o URL)
//   PUT    /actividades/:id             editar
//   DELETE /actividades/:id             eliminar
//   POST   /actividades/generar         la IA propone una actividad (borrador, no se guarda)
//   POST   /actividades/:id/sugerir     sugerirla a un estudiante (le llega aviso + correo)
// Las actividades publicadas se muestran al estudiante en Recursos.
// =========================================================

const router = Router();
const ROL_PSICOLOGIA = 6;
const ROL_ESTUDIANTE = 8;

export const TIPOS_ACTIVIDAD = ['Respiración', 'Mindfulness', 'Movimiento', 'Escritura terapéutica', 'Arte terapia', 'Música', 'Autocuidado', 'Juego y creatividad'];
export const NIVELES_ACTIVIDAD = ['Todos', 'Bienestar general', 'Estable', 'Riesgo bajo', 'Riesgo medio', 'Riesgo alto', 'Acompañamiento cercano'];

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const MIME_PERMITIDOS = /^(image\/|audio\/|video\/|application\/pdf$)/;
const subida = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
            cb(null, `${Date.now()}-actividad${extension || ''}`);
        }
    }),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, MIME_PERMITIDOS.test(file.mimetype))
});

const texto = (valor, max) => String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const textoLargo = (valor, max = 3000) => String(valor ?? '').trim().slice(0, max);
const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

function urlValida(valor) {
    const url = String(valor || '').trim();
    if (!url) return '';
    try {
        const u = new URL(url);
        return ['http:', 'https:'].includes(u.protocol) ? u.toString().slice(0, 500) : null;
    } catch (e) {
        return null;
    }
}

function archivoPublico(ruta) {
    const valor = String(ruta || '').trim();
    if (!valor) return '';
    return valor.startsWith('http') ? valor : `http://localhost:3001${valor}`;
}

async function psicologaDeLaSesion(req, res) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenUsuario(token);
    if (!idUsuario) {
        res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });
        return null;
    }
    const [[usuario]] = await connection.promise().query('SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = ? LIMIT 1', [idUsuario]);
    if (!usuario || Number(usuario.id_rol) !== ROL_PSICOLOGIA) {
        res.status(403).json({ message: 'Esta sección es solo para psicología.' });
        return null;
    }
    return usuario.id_usuario;
}

export function actividadDesdeFila(a) {
    return {
        id: a.id_relajacion,
        titulo: a.titulo,
        descripcion: a.descripcion,
        tipo: a.tipo,
        nivel: a.nivel || 'Todos',
        pasos: String(a.pasos || '').split('\n').map((p) => p.trim()).filter(Boolean),
        duracion: a.duracion_min || 0,
        url: a.url || '',
        archivo: archivoPublico(a.archivo),
        archivoNombre: a.archivo_nombre || '',
        generadaPor: a.generada_por || '',
        fecha: a.fecha_iso || '',
        autor: a.autor_nombre ? `${a.autor_nombre} ${a.autor_apellido}`.replace(/\s+/g, ' ').trim() : '',
        sugerencias: Number(a.sugerencias || 0)
    };
}

// Lee y valida los campos del formulario (sirve para crear y editar)
function leerCampos(body) {
    const tipo = texto(body.tipo, 60);
    const nivel = NIVELES_ACTIVIDAD.includes(body.nivel) ? body.nivel : 'Todos';
    const url = urlValida(body.url);
    const pasos = String(body.pasos || '').split('\n').map((p) => texto(p, 300)).filter(Boolean).slice(0, 15).join('\n');
    const duracion = Math.min(Math.max(Number(body.duracion) || 0, 0), 240);
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(String(body.fecha || '')) ? body.fecha : null;
    return {
        titulo: texto(body.titulo, 120),
        descripcion: textoLargo(body.descripcion, 1500),
        tipo, nivel, url, pasos, duracion, fecha,
        generadaPor: texto(body.generadaPor, 60)
    };
}

function validar(c) {
    if (c.titulo.length < 3) return 'Escribe el título de la actividad.';
    if (c.descripcion.length < 10) return 'Escribe una descripción de al menos 10 caracteres.';
    if (c.tipo.length < 3) return 'Escribe o elige el tipo de actividad.';
    if (c.url === null) return 'El enlace no es válido. Debe empezar por http:// o https://';
    return '';
}

const SELECT_ACTIVIDADES = `
    SELECT r.*, DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha_iso, u.nombre AS autor_nombre, u.apellido AS autor_apellido,
           (SELECT COUNT(*) FROM relajacion_sugerida s WHERE s.id_relajacion = r.id_relajacion) AS sugerencias
    FROM relajacion r LEFT JOIN usuario u ON u.id_usuario = r.id_usuario`;

router.get('/actividades', async (req, res) => {
    try {
        if (!(await psicologaDeLaSesion(req, res))) return;
        const [filas] = await connection.promise().query(`${SELECT_ACTIVIDADES} ORDER BY r.fecha DESC, r.id_relajacion DESC`);
        return res.json({ actividades: filas.map(actividadDesdeFila), tipos: TIPOS_ACTIVIDAD, niveles: NIVELES_ACTIVIDAD });
    } catch (error) {
        console.error('Actividades:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar las actividades.' });
    }
});

router.post('/actividades', subida.single('archivo'), async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;
        const c = leerCampos(req.body || {});
        const error = validar(c);
        if (error) return res.status(400).json({ message: error });

        const archivo = req.file ? `/uploads/${req.file.filename}` : '';
        const [r] = await connection.promise().query(
            `INSERT INTO relajacion (tipo, titulo, descripcion, archivo, url, archivo_nombre, nivel, pasos, duracion_min, generada_por, fecha, id_usuario, animacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, '')`,
            [c.tipo, c.titulo, c.descripcion, archivo, c.url || '', req.file ? texto(req.file.originalname, 255) : '',
                c.nivel, c.pasos, c.duracion, c.generadaPor, c.fecha ? `${c.fecha} 12:00:00` : null, idPsicologa]
        );
        return res.status(201).json({ message: 'Actividad publicada.', id: r.insertId });
    } catch (error) {
        console.error('Crear actividad:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar la actividad.' });
    }
});

router.put('/actividades/:id', subida.single('archivo'), async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;
        const id = soloDigitos(req.params.id);
        const [[actual]] = await connection.promise().query('SELECT archivo, archivo_nombre FROM relajacion WHERE id_relajacion = ?', [id]);
        if (!actual) return res.status(404).json({ message: 'La actividad ya no existe.' });

        const c = leerCampos(req.body || {});
        const error = validar(c);
        if (error) return res.status(400).json({ message: error });

        // Archivo: uno nuevo lo reemplaza; "quitarArchivo" lo elimina; si no, se conserva
        let archivo = actual.archivo, archivoNombre = actual.archivo_nombre;
        if (req.file) { archivo = `/uploads/${req.file.filename}`; archivoNombre = texto(req.file.originalname, 255); }
        else if (String(req.body.quitarArchivo) === '1') { archivo = ''; archivoNombre = ''; }

        await connection.promise().query(
            `UPDATE relajacion SET tipo = ?, titulo = ?, descripcion = ?, archivo = ?, url = ?, archivo_nombre = ?, nivel = ?, pasos = ?,
                    duracion_min = ?, fecha = COALESCE(?, fecha)
             WHERE id_relajacion = ?`,
            [c.tipo, c.titulo, c.descripcion, archivo, c.url || '', archivoNombre, c.nivel, c.pasos, c.duracion,
                c.fecha ? `${c.fecha} 12:00:00` : null, id]
        );
        return res.json({ message: 'Actividad actualizada.' });
    } catch (error) {
        console.error('Editar actividad:', error.message);
        return res.status(500).json({ message: 'No se pudo actualizar la actividad.' });
    }
});

router.delete('/actividades/:id', async (req, res) => {
    try {
        if (!(await psicologaDeLaSesion(req, res))) return;
        const [r] = await connection.promise().query('DELETE FROM relajacion WHERE id_relajacion = ?', [soloDigitos(req.params.id)]);
        if (!r.affectedRows) return res.status(404).json({ message: 'La actividad ya no existe.' });
        return res.json({ message: 'Actividad eliminada.' });
    } catch (error) {
        console.error('Eliminar actividad:', error.message);
        return res.status(500).json({ message: 'No se pudo eliminar la actividad.' });
    }
});

const INSTRUCCIONES_ACTIVIDAD = `Eres psicóloga escolar en un colegio de Colombia. Diseñas actividades breves de bienestar emocional
para estudiantes de 11 a 17 años, que puedan hacer solos y sin materiales costosos.
Responde SOLO con un objeto JSON con esta forma exacta:
{"titulo": "máximo 60 caracteres", "descripcion": "2 o 3 frases en segunda persona, cálidas y claras",
 "tipo": "una categoría corta", "nivel": "uno de los niveles indicados",
 "duracion_min": número entre 2 y 30, "pasos": ["paso 1", "paso 2", ... entre 3 y 7 pasos cortos]}
Reglas: lenguaje sencillo y respetuoso; nada de diagnósticos ni contenido médico; si la actividad es para riesgo alto,
incluye en un paso que puede buscar a un adulto de confianza o a la psicóloga del colegio. No uses emojis.`;

router.post('/actividades/generar', async (req, res) => {
    try {
        if (!(await psicologaDeLaSesion(req, res))) return;
        const body = req.body || {};
        const tema = texto(body.tema, 300);
        const tipo = texto(body.tipo, 60);
        const nivel = NIVELES_ACTIVIDAD.includes(body.nivel) ? body.nivel : 'Todos';
        if (tema.length < 3 && !tipo) return res.status(400).json({ message: 'Escribe un tema o elige un tipo para que la IA proponga la actividad.' });

        const [existentes] = await connection.promise().query('SELECT titulo FROM relajacion ORDER BY id_relajacion DESC LIMIT 40');
        const pedido = [
            `Tema o necesidad: ${tema || 'bienestar general'}.`,
            `Tipo de actividad: ${tipo || 'el que mejor se ajuste'}.`,
            `Nivel recomendado: ${nivel}. Niveles posibles: ${NIVELES_ACTIVIDAD.join(', ')}.`,
            `No repitas estos títulos: ${JSON.stringify(existentes.map((e) => e.titulo))}`
        ].join('\n');

        const respuesta = await pedirJSON(INSTRUCCIONES_ACTIVIDAD, pedido, { temperatura: 0.85, maxTokens: 900 });
        const j = respuesta.json || {};
        const pasos = (Array.isArray(j.pasos) ? j.pasos : []).map((p) => texto(p, 300)).filter(Boolean).slice(0, 8);
        const borrador = {
            titulo: texto(j.titulo, 120).replace(/["“”«»]/g, ''),
            descripcion: textoLargo(j.descripcion, 1500),
            tipo: tipo || texto(j.tipo, 60) || 'Autocuidado',
            nivel: NIVELES_ACTIVIDAD.includes(j.nivel) ? j.nivel : nivel,
            duracion: Math.min(Math.max(Number(j.duracion_min) || 5, 1), 60),
            pasos,
            generadaPor: respuesta.generadoPor || 'IA'
        };
        if (borrador.titulo.length < 3 || borrador.descripcion.length < 10 || !pasos.length) {
            return res.status(502).json({ message: 'La IA no dio una propuesta completa. Intenta de nuevo.' });
        }
        return res.json({ borrador });
    } catch (error) {
        console.error('Generar actividad con IA:', error.message);
        return res.status(502).json({ message: 'La IA no respondió en este momento. Intenta de nuevo en unos segundos.' });
    }
});

router.post('/actividades/:id/sugerir', async (req, res) => {
    try {
        const idPsicologa = await psicologaDeLaSesion(req, res);
        if (!idPsicologa) return;
        const db = connection.promise();
        const idActividad = soloDigitos(req.params.id);
        const idEstudiante = soloDigitos((req.body || {}).idUsuario);
        const nota = textoLargo((req.body || {}).nota, 600);

        const [[actividad]] = await db.query('SELECT id_relajacion, titulo, tipo FROM relajacion WHERE id_relajacion = ?', [idActividad]);
        if (!actividad) return res.status(404).json({ message: 'La actividad ya no existe.' });
        const [[estudiante]] = await db.query('SELECT id_usuario FROM usuario WHERE id_usuario = ? AND id_rol = ?', [idEstudiante, ROL_ESTUDIANTE]);
        if (!estudiante) return res.status(404).json({ message: 'Elige un estudiante.' });

        await db.query('INSERT INTO relajacion_sugerida (id_relajacion, id_usuario, id_psicologo, nota) VALUES (?, ?, ?, ?)',
            [actividad.id_relajacion, estudiante.id_usuario, idPsicologa, nota]);
        await notificar(db, {
            destino: estudiante.id_usuario,
            tipo: 'actividad_sugerida',
            titulo: 'Tu psicóloga te sugirió una actividad',
            mensaje: `Te sugirió "${actividad.titulo}" (${actividad.tipo}). La encuentras en Recursos, en "Actividades de tu psicóloga".${nota ? ` Nota: ${nota}` : ''}`
        });
        return res.status(201).json({ message: 'Actividad sugerida.' });
    } catch (error) {
        console.error('Sugerir actividad:', error.message);
        return res.status(500).json({ message: 'No se pudo sugerir la actividad.' });
    }
});

export default router;
