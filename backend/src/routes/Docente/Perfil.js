import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenUsuario } from '../../config/studentToken.js';
import { correoConfigurado, enviarCorreo } from '../../config/correo.js';
import { clasificarTexto, nombresDe, NOMBRE_NIVEL } from '../../config/factoresRiesgo.js';
import { pedirTexto } from '../../config/ia.js';

// =========================================================
// PERFIL DEL DOCENTE
// Ver toda su información (datos personales, información docente y
// grados que enseña) y editar su nombre, apellido, correo, celular y foto.
// Quién es el docente sale SIEMPRE del token firmado del inicio de sesión.
// =========================================================

const router = Router();

const ROL_DOCENTE = 5;

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
            cb(null, `${Date.now()}-perfil-docente${extension || '.jpg'}`);
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

// Devuelve el id del docente que inició sesión, o responde el error
async function docenteDeLaSesion(req, res) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenUsuario(token);

    if (!idUsuario) {
        res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });
        return null;
    }

    const [filas] = await connection.promise().query(
        'SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = ? LIMIT 1',
        [idUsuario]
    );

    if (!filas.length || Number(filas[0].id_rol) !== ROL_DOCENTE) {
        res.status(403).json({ message: 'Esta sección es solo para docentes.' });
        return null;
    }

    return filas[0].id_usuario;
}

async function leerPerfil(idUsuario) {
    const db = connection.promise();

    const [[usuario]] = await db.query(
        `SELECT u.id_usuario, u.tipo_id, u.nombre, u.apellido, u.edad, u.correo, u.celular, u.foto, u.estadi,
                u.comite_convivencia, r.nombre AS rol,
                DATE_FORMAT(u.fecha_nac, '%Y-%m-%d') AS fecha_nac,
                DATE_FORMAT(u.fecha_reg, '%Y-%m-%d') AS fecha_reg
         FROM usuario u LEFT JOIN rol r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = ? LIMIT 1`,
        [idUsuario]
    );

    const [[docente]] = await db.query(
        'SELECT id_docente, ano_cursado, director_grupo, grado_asignado FROM docente WHERE id_usuario = ? LIMIT 1',
        [idUsuario]
    );

    let grados = [];

    if (docente) {
        const [filas] = await db.query(
            'SELECT grado FROM docente_grado WHERE id_docente = ? ORDER BY grado',
            [docente.id_docente]
        );
        grados = filas.map((fila) => fila.grado);
    }

    // Cuántos estudiantes hay registrados en cada grado del docente
    const todos = [...new Set([...grados, docente?.grado_asignado].filter(Boolean))];
    const conteo = {};

    if (todos.length) {
        const [filas] = await db.query(
            'SELECT grado, COUNT(*) AS total FROM estudiante WHERE grado IN (?) GROUP BY grado',
            [todos]
        );
        filas.forEach((fila) => { conteo[fila.grado] = Number(fila.total); });
    }

    // Orden natural: 9-1, 9-2, 10-1...
    const ordenar = (a, b) => a.localeCompare(b, 'es', { numeric: true });

    return {
        usuario: {
            id_usuario: usuario.id_usuario,
            tipo_id: usuario.tipo_id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            edad: usuario.edad,
            correo: usuario.correo,
            celular: usuario.celular ? String(usuario.celular) : '',
            fecha_nac: usuario.fecha_nac,
            fecha_reg: usuario.fecha_reg,
            estado: usuario.estadi,
            comite_convivencia: Boolean(usuario.comite_convivencia),
            rol: usuario.rol,
            foto: fotoPublica(usuario.foto)
        },
        docente: docente
            ? {
                ano_cursado: docente.ano_cursado,
                director_grupo: Boolean(docente.director_grupo),
                grado_asignado: docente.grado_asignado || '',
                estudiantes_grado_asignado: conteo[docente.grado_asignado] || 0
            }
            : null,
        grados: grados.sort(ordenar).map((grado) => ({ grado, estudiantes: conteo[grado] || 0 }))
    };
}

router.get('/perfil', async (req, res) => {
    try {
        const idUsuario = await docenteDeLaSesion(req, res);
        if (!idUsuario) return;

        return res.json(await leerPerfil(idUsuario));
    } catch (error) {
        console.error('Perfil docente:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu perfil.' });
    }
});

// Editar nombre, apellido, correo, celular y (opcional) la foto
router.put('/perfil', upload.single('foto'), async (req, res) => {
    try {
        const idUsuario = await docenteDeLaSesion(req, res);
        if (!idUsuario) return;

        const body = req.body || {};
        const nombre = texto(body.nombre, 100);
        const apellido = texto(body.apellido, 100);
        const correo = texto(body.correo, 150).toLowerCase();
        const celular = soloDigitos(body.celular);

        if (!nombreRegex.test(nombre)) {
            return res.status(400).json({ message: 'Escribe un nombre válido (solo letras).' });
        }
        if (!nombreRegex.test(apellido)) {
            return res.status(400).json({ message: 'Escribe un apellido válido (solo letras).' });
        }
        if (!emailRegex.test(correo)) {
            return res.status(400).json({ message: 'Escribe un correo electrónico válido.' });
        }
        if (celular.length < 7 || celular.length > 15) {
            return res.status(400).json({ message: 'Escribe un número de celular válido (7 a 15 dígitos).' });
        }

        const db = connection.promise();

        const [correoOcupado] = await db.query(
            'SELECT id_usuario FROM usuario WHERE LOWER(correo) = ? AND id_usuario <> ? LIMIT 1',
            [correo, idUsuario]
        );
        if (correoOcupado.length) {
            return res.status(409).json({ message: 'Ese correo ya lo usa otro usuario.' });
        }

        const campos = ['nombre = ?', 'apellido = ?', 'correo = ?', 'celular = ?'];
        const valores = [nombre, apellido, correo, Number(celular)];

        if (req.file) {
            campos.push('foto = ?');
            valores.push(`/uploads/${req.file.filename}`);
        }

        await db.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = ?`, [...valores, idUsuario]);

        return res.json({ message: 'Tu perfil se actualizó correctamente.', ...(await leerPerfil(idUsuario)) });
    } catch (error) {
        console.error('Editar perfil docente:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar tu perfil.' });
    }
});

// =========================================================
// MIS ESTUDIANTES
// Estudiantes de los grupos que el docente enseña o dirige.
// Solo información general (sin diagnósticos ni datos del acudiente).
// =========================================================

const NOMBRE_GRADO = ['Transición', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto',
    'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo'];

function nombreDelGrado(grupo) {
    const numero = Number(String(grupo || '').split('-')[0]);
    return Number.isInteger(numero) && NOMBRE_GRADO[numero] ? NOMBRE_GRADO[numero] : String(grupo || '');
}

async function gruposDelDocente(idUsuario) {
    const db = connection.promise();
    const [[docente]] = await db.query(
        'SELECT id_docente, director_grupo, grado_asignado FROM docente WHERE id_usuario = ? LIMIT 1',
        [idUsuario]
    );
    if (!docente) return [];

    const [filas] = await db.query('SELECT grado FROM docente_grado WHERE id_docente = ?', [docente.id_docente]);
    const grupos = new Set(filas.map((fila) => fila.grado));
    if (docente.director_grupo && docente.grado_asignado) grupos.add(docente.grado_asignado);

    return [...grupos].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
}

router.get('/estudiantes', async (req, res) => {
    try {
        const idUsuario = await docenteDeLaSesion(req, res);
        if (!idUsuario) return;

        const grupos = await gruposDelDocente(idUsuario);
        let estudiantes = [];

        if (grupos.length) {
            const [filas] = await connection.promise().query(
                `SELECT u.id_usuario, u.tipo_id, u.nombre, u.apellido, u.correo, u.foto, e.grado,
                        TIMESTAMPDIFF(YEAR, u.fecha_nac, CURDATE()) AS edad
                 FROM estudiante e
                 INNER JOIN usuario u ON u.id_usuario = e.id_usuario
                 WHERE e.grado IN (?) AND LOWER(TRIM(u.estadi)) = 'activo'
                 ORDER BY e.grado, u.apellido, u.nombre`,
                [grupos]
            );

            estudiantes = filas.map((fila) => ({
                id: fila.id_usuario,
                tipo_id: fila.tipo_id,
                nombre: fila.nombre,
                apellido: fila.apellido,
                correo: fila.correo,
                foto: fotoPublica(fila.foto),
                grupo: fila.grado,
                grado: nombreDelGrado(fila.grado),
                edad: Number.isFinite(Number(fila.edad)) ? Number(fila.edad) : null
            }));
        }

        return res.json({ grupos, estudiantes });
    } catch (error) {
        console.error('Estudiantes del docente:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar tus estudiantes.' });
    }
});

// =========================================================
// ALERTAS DEL DOCENTE sobre un estudiante
// Se guarda en la tabla `ayuda` (origen = 'docente', con el nombre del docente
// en nombre_docente) y psicología recibe una notificación ligada a esa
// solicitud (y un correo si el servidor de correo está configurado).
// =========================================================

const TIPOS_ALERTA = ['Cambio de comportamiento', 'Aislamiento', 'Dificultades de convivencia',
    'Cambio en participación', 'Cambio en rendimiento académico', 'Otro'];

router.post('/alertas', async (req, res) => {
    try {
        const idUsuario = await docenteDeLaSesion(req, res);
        if (!idUsuario) return;

        const idEstudiante = String(req.body?.idEstudiante ?? '').replace(/\D/g, '');
        const tipo = texto(req.body?.tipo, 60);
        const motivo = texto(req.body?.motivo, 80);
        const descripcion = String(req.body?.descripcion ?? '').trim().slice(0, 500);

        if (!idEstudiante) return res.status(400).json({ message: 'Selecciona un estudiante.' });
        if (!TIPOS_ALERTA.includes(tipo)) return res.status(400).json({ message: 'Selecciona la situación observada.' });
        if (tipo === 'Otro' && motivo.length < 3) return res.status(400).json({ message: 'Escribe cuál es el motivo de la alerta.' });
        if (descripcion.length < 10) return res.status(400).json({ message: 'Describe la situación (mínimo 10 caracteres).' });

        // Si eligió "Otro", la situación es el motivo que escribió
        const situacion = tipo === 'Otro' ? motivo : tipo;

        const db = connection.promise();
        const grupos = await gruposDelDocente(idUsuario);

        // Solo puede alertar sobre estudiantes de sus propios grupos
        const [[estudiante]] = grupos.length
            ? await db.query(
                `SELECT u.id_usuario, u.nombre, u.apellido, e.grado
                 FROM estudiante e INNER JOIN usuario u ON u.id_usuario = e.id_usuario
                 WHERE u.id_usuario = ? AND e.grado IN (?) LIMIT 1`,
                [idEstudiante, grupos]
            )
            : [[]];

        if (!estudiante) {
            return res.status(403).json({ message: 'Ese estudiante no pertenece a tus grupos.' });
        }

        const [[docente]] = await db.query('SELECT nombre, apellido, correo FROM usuario WHERE id_usuario = ?', [idUsuario]);

        const nombreEstudiante = `${estudiante.nombre} ${estudiante.apellido}`;
        const nombreDocente = `${docente.nombre} ${docente.apellido}`;

        // Clasificación de riesgo (la misma del chat): si el texto habla de riesgo para
        // la vida u otro factor grave, la alerta sube de prioridad automáticamente
        const riesgo = clasificarTexto(`${situacion}. ${descripcion}`);
        const prioridad = { critico: 'Urgente', alto: 'Muy alta', medio: 'Alta' }[riesgo.nivel] || 'Media';

        // Se guarda como una solicitud de ayuda hecha por el docente
        const [resultado] = await db.query(
            `INSERT INTO ayuda (nombre, descripcion, tipo_contacto, prioridad, grado, id_usuario, nombre_docente, id_docente,
                                origen, nivel_riesgo, factores_riesgo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'docente', ?, ?)`,
            [nombreEstudiante.slice(0, 100), `Situación observada: ${situacion}.\n${descripcion}`,
                String(docente.correo || '').slice(0, 150), prioridad, estudiante.grado, estudiante.id_usuario,
                nombreDocente.slice(0, 200), idUsuario, riesgo.nivel, riesgo.factores.join(',')]
        );

        // Aviso a psicología: notificación en su perfil + correo
        const conRiesgo = ['alto', 'critico'].includes(riesgo.nivel);
        const titulo = `${conRiesgo ? `Alerta de riesgo ${NOMBRE_NIVEL[riesgo.nivel].toLowerCase()} · ` : ''}Docente ${nombreDocente}: ${nombreEstudiante} (${estudiante.grado})`;
        const mensaje = [
            `Enviada por el docente: ${nombreDocente}.`,
            `Prioridad: ${prioridad}.`,
            riesgo.nivel ? `Nivel de riesgo detectado: ${NOMBRE_NIVEL[riesgo.nivel]}.` : '',
            riesgo.factores.length ? `Factores detectados: ${nombresDe(riesgo.factores).join(', ')}.` : '',
            `Situación observada: ${situacion}.`,
            `Descripción: ${descripcion}`
        ].filter(Boolean).join('\n');

        try {
            const [psicologos] = await db.query(
                "SELECT id_usuario, correo FROM usuario WHERE id_rol = 6 AND LOWER(TRIM(estadi)) = 'activo'"
            );
            for (const psicologo of psicologos) {
                await db.query(
                    `INSERT INTO notificacion (id_usuario_destino, id_ayuda, tipo, titulo, mensaje, nivel_riesgo)
                     VALUES (?, ?, 'alerta_docente', ?, ?, ?)`,
                    [psicologo.id_usuario, resultado.insertId, titulo.slice(0, 150), mensaje, riesgo.nivel]
                );
            }

            const fijos = String(process.env.PSICOLOGIA_CORREOS || '').split(',').map((c) => c.trim()).filter(Boolean);
            const destinatarios = fijos.length ? fijos : psicologos.map((p) => p.correo).filter(Boolean);

            if (destinatarios.length && correoConfigurado()) {
                await enviarCorreo({
                    para: destinatarios.join(', '),
                    asunto: `Sentir · ${titulo}`,
                    texto: `${titulo}\n\n${mensaje}`,
                    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2d2a3e">
                        <h2 style="color:#4e2fc7">Sentir · Alerta de un docente</h2>
                        <p><b>Estudiante:</b> ${escaparHtml(nombreEstudiante)} (${escaparHtml(estudiante.grado)})</p>
                        <p><b>Docente:</b> ${escaparHtml(nombreDocente)}</p>
                        <p><b>Prioridad:</b> ${escaparHtml(prioridad)}${riesgo.nivel ? ` · <b>Riesgo detectado:</b> ${escaparHtml(NOMBRE_NIVEL[riesgo.nivel])}` : ''}</p>
                        ${riesgo.factores.length ? `<p><b>Factores detectados:</b> ${escaparHtml(nombresDe(riesgo.factores).join(', '))}</p>` : ''}
                        <p><b>Situación observada:</b> ${escaparHtml(situacion)}</p>
                        <p><b>Descripción:</b> ${escaparHtml(descripcion)}</p></div>`
                });
            }
        } catch (errorAviso) {
            console.error(`Alerta docente ${resultado.insertId}: no se pudo avisar a psicología:`, errorAviso.message);
        }

        return res.status(201).json({ message: 'Tu alerta fue enviada al equipo de orientación y psicología.', id: resultado.insertId });
    } catch (error) {
        console.error('Alerta docente:', error.message);
        return res.status(500).json({ message: 'No se pudo enviar la alerta. Inténtalo de nuevo.' });
    }
});

// =========================================================
// MIS ALERTAS: las alertas que envió el docente que inició sesión
// Estado: "Recibido" cuando alguna psicóloga ya leyó la notificación.
// =========================================================

router.get('/alertas', async (req, res) => {
    try {
        const idUsuario = await docenteDeLaSesion(req, res);
        if (!idUsuario) return;

        const [filas] = await connection.promise().query(
            `SELECT a.id_ayuda, a.nombre, a.grado, a.descripcion, a.prioridad, a.nivel_riesgo,
                    DATE_FORMAT(a.fecha, '%Y-%m-%dT%H:%i:%s') AS fecha, u.foto,
                    (SELECT MAX(n.leida) FROM notificacion n WHERE n.id_ayuda = a.id_ayuda) AS leida
             FROM ayuda a
             LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
             WHERE a.origen = 'docente' AND a.id_docente = ?
             ORDER BY a.fecha DESC, a.id_ayuda DESC`,
            [idUsuario]
        );

        const alertas = filas.map((fila) => {
            // La descripción se guarda como "Situación observada: X.\n<detalle>"
            const [primera, ...resto] = String(fila.descripcion || '').split('\n');
            const coincide = primera.match(/^Situación observada:\s*(.*?)\.?$/);
            return {
                id: fila.id_ayuda,
                estudiante: fila.nombre,
                foto: fotoPublica(fila.foto),
                grado: fila.grado,
                fecha: fila.fecha,
                situacion: coincide ? coincide[1] : 'Otro',
                descripcion: coincide ? resto.join('\n').trim() : String(fila.descripcion || ''),
                prioridad: fila.prioridad,
                nivelRiesgo: fila.nivel_riesgo,
                estado: Number(fila.leida) === 1 ? 'Recibido' : 'Enviado'
            };
        });

        return res.json({ alertas });
    } catch (error) {
        console.error('Alertas del docente:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar tus alertas.' });
    }
});

// =========================================================
// ORIENTACIÓN CON IA PARA EL DOCENTE
// Responde inquietudes sobre situaciones del aula, convivencia y
// estrategias de acompañamiento. No diagnostica ni reemplaza a
// psicología. La conversación NO se guarda en la base de datos.
// =========================================================

const INSTRUCCIONES_ORIENTACION = `Eres "Sentir IA", el asistente de orientación para DOCENTES de la Institución Educativa Santa Elena (Colombia), dentro de la app Sentir.
Hablas con un docente (no con un estudiante). Su nombre es: {NOMBRE}.

Tu función:
- Dar orientación inicial y práctica sobre situaciones que el docente observa en sus estudiantes, la convivencia en el aula, la comunicación con estudiantes y familias, el manejo de grupo y estrategias de acompañamiento socioemocional.
- Proponer acciones concretas y realistas para el aula (qué decir, qué observar, cómo abordar al estudiante con respeto y confidencialidad).
- Recordar, cuando aplique, la ruta: el docente observa y reporta; la valoración y la intervención las hacen psicología/orientación escolar y el comité de convivencia (Ley 1620 de 2013, ruta de atención integral para la convivencia escolar).

Reglas:
- Español de Colombia, tono cálido, respetuoso y profesional. Trata al docente de "tú".
- Respuestas breves y organizadas: un párrafo corto y, si sirve, una lista de 3 a 5 pasos con guiones ("- ").
- NO diagnostiques ni pongas etiquetas clínicas a los estudiantes. NO sugieras medicamentos ni terapias específicas.
- NO pidas ni repitas datos personales innecesarios de los estudiantes (nombres completos, documentos).
- Si el docente describe riesgo para la vida o la integridad (ideas o intentos de suicidio, autolesiones, abuso, maltrato, violencia, consumo, amenazas), dilo con claridad: es prioritario, no debe manejarlo solo, debe enviar una alerta en Sentir (Mis estudiantes > Enviar alerta) e informar de inmediato a psicología/orientación y a coordinación. Si hay peligro inminente: línea 123 o urgencias; protección de niños, niñas y adolescentes: línea 141 del ICBF.
- Si te preguntan algo que no tiene que ver con el trabajo docente o el bienestar escolar, redirige amablemente.
- No inventes normas ni datos. Si no sabes algo, dilo y sugiere consultarlo con coordinación o psicología.`;

const usoOrientacion = new Map(); // id docente -> marcas de tiempo (máx. 30 mensajes cada 10 minutos)

router.post('/orientacion', async (req, res) => {
    try {
        const idUsuario = await docenteDeLaSesion(req, res);
        if (!idUsuario) return;

        const mensajes = (Array.isArray(req.body?.mensajes) ? req.body.mensajes : [])
            .slice(-12)
            .map((m) => ({
                role: m?.rol === 'asistente' ? 'assistant' : 'user',
                content: String(m?.texto ?? '').trim().slice(0, 1500)
            }))
            .filter((m) => m.content);

        if (!mensajes.length || mensajes[mensajes.length - 1].role !== 'user') {
            return res.status(400).json({ message: 'Escribe tu pregunta.' });
        }

        const ahora = Date.now();
        const recientes = (usoOrientacion.get(idUsuario) || []).filter((t) => ahora - t < 10 * 60 * 1000);
        if (recientes.length >= 30) {
            return res.status(429).json({ message: 'Has enviado muchos mensajes seguidos. Espera unos minutos e inténtalo de nuevo.' });
        }
        recientes.push(ahora);
        usoOrientacion.set(idUsuario, recientes);

        const [[docente]] = await connection.promise().query('SELECT nombre, apellido FROM usuario WHERE id_usuario = ?', [idUsuario]);
        const nombre = `${docente?.nombre || ''} ${docente?.apellido || ''}`.trim() || 'Docente';

        // Si lo que escribió el docente habla de un riesgo, se le recomienda enviar una alerta
        const riesgo = clasificarTexto(mensajes[mensajes.length - 1].content);
        const sugerirAlerta = ['medio', 'alto', 'critico'].includes(riesgo.nivel);

        let respuesta;
        try {
            respuesta = await pedirTexto(INSTRUCCIONES_ORIENTACION.replace('{NOMBRE}', nombre), mensajes);
        } catch (errorIA) {
            console.error('Orientación docente (IA):', errorIA.message);
            return res.status(503).json({
                message: 'El asistente no está disponible en este momento. Si la situación es urgente, comunícate directamente con psicología/orientación escolar.'
            });
        }

        return res.json({
            respuesta,
            sugerirAlerta,
            nivelRiesgo: riesgo.nivel || '',
            factores: nombresDe(riesgo.factores)
        });
    } catch (error) {
        console.error('Orientación docente:', error.message);
        return res.status(500).json({ message: 'No se pudo procesar tu mensaje. Inténtalo de nuevo.' });
    }
});

function escaparHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default router;
