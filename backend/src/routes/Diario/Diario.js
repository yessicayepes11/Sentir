import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenEstudiante } from '../../config/studentToken.js';

const router = Router();

// Preguntas opcionales del diario. Solo se guarda la respuesta del estudiante:
//   1. "Algo que está pasando."        -> pensamiento1
//   2. "Algo que yo pienso sobre eso." -> pensamiento2
//   3. "Lo que necesito."              -> pensamiento3
const PREGUNTAS = [
    { clave: 'situacion' },
    { clave: 'pensamiento' },
    { clave: 'necesidad' }
];

const texto = (valor, max) => String(valor ?? '').trim().slice(0, max);

router.post('/guardar', async (req, res) => {
    try {
        // 1) Quién guarda: sale del token firmado, nunca de un id enviado por el navegador
        const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const idUsuario = leerTokenEstudiante(token);

        if (!idUsuario) {
            return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        }

        const [estudiantes] = await connection.promise().query(
            'SELECT id_estudiante FROM estudiante WHERE id_usuario = ? LIMIT 1',
            [idUsuario]
        );

        if (!estudiantes.length) {
            return res.status(409).json({
                message: 'Tu usuario todavía no tiene ficha de estudiante. Pide a la secretaría del colegio que la registre.'
            });
        }

        // 2) Datos del formulario
        const idEmocion = Number(req.body.idEmocion);
        const nivel = Number(req.body.nivel);
        const descripcion = texto(req.body.descripcion, 500);

        if (!Number.isInteger(idEmocion) || idEmocion <= 0) {
            return res.status(400).json({ message: 'Selecciona cómo te sientes hoy.' });
        }

        const [emociones] = await connection.promise().query(
            'SELECT id_emocion FROM emocion WHERE id_emocion = ? LIMIT 1',
            [idEmocion]
        );

        if (!emociones.length) {
            return res.status(400).json({ message: 'La emoción seleccionada no es válida.' });
        }

        if (!Number.isInteger(nivel) || nivel < 1 || nivel > 10) {
            return res.status(400).json({ message: 'La intensidad debe estar entre 1 y 10.' });
        }

        // necesidad = opciones de "Cuéntame un poco más" (con el texto de "Otra")
        const etiquetas = (Array.isArray(req.body.etiquetas) ? req.body.etiquetas : [])
            .map((etiqueta) => texto(etiqueta, 60))
            .filter((etiqueta) => etiqueta && etiqueta !== 'Otra');
        const otra = texto(req.body.otra, 100);
        if (otra) etiquetas.push(`Otra: ${otra}`);
        const necesidad = etiquetas.join(', ');

        // pensamientoN = respuesta del estudiante a la pregunta N
        const respuestas = req.body.respuestas || {};
        const [r1, r2, r3] = PREGUNTAS.map(({ clave }) => texto(respuestas[clave], 180));

        if (!descripcion && !necesidad && !r1 && !r2 && !r3) {
            return res.status(400).json({ message: 'Escribe algo o elige una opción antes de guardar.' });
        }

        // 3) Guardar (la fecha la pone la base de datos)
        const [resultado] = await connection.promise().query(
            `INSERT INTO diario_emocinal
                (descripcion, nivel, situacion, necesidad, id_emocion, id_estudiante,
                 pensamiento1, pensamiento2, pensamiento3)
             VALUES (?, ?, '', ?, ?, ?, ?, ?, ?)`,
            [descripcion, nivel, necesidad, idEmocion, estudiantes[0].id_estudiante, r1, r2, r3]
        );

        return res.status(201).json({ message: 'Tu diario se guardó', id_diario: resultado.insertId });
    } catch (error) {
        console.error('Error al guardar el diario:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar tu diario. Inténtalo de nuevo.' });
    }
});

// ---------------- Estado de ánimo de los últimos 7 días (Mi seguimiento) ----------------
// Devuelve, por cada día con entradas, el promedio del estado de ánimo del estudiante:
// Muy bien = 5 · Bien = 4 · Regular = 3 · Mal = 2 · Muy mal = 1

router.get('/semana', async (req, res) => {
    try {
        const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const idUsuario = leerTokenEstudiante(token);

        if (!idUsuario) {
            return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        }

        const [estudiantes] = await connection.promise().query(
            'SELECT id_estudiante FROM estudiante WHERE id_usuario = ? LIMIT 1',
            [idUsuario]
        );

        if (!estudiantes.length) {
            return res.json({ dias: [], sinFicha: true });
        }

        const [dias] = await connection.promise().query(
            `SELECT DATE_FORMAT(DATE(d.fecha), '%Y-%m-%d') AS fecha,
                    ROUND(AVG(CASE LOWER(TRIM(e.nombre))
                        WHEN 'muy bien' THEN 5
                        WHEN 'bien' THEN 4
                        WHEN 'regular' THEN 3
                        WHEN 'mal' THEN 2
                        WHEN 'muy mal' THEN 1
                    END), 2) AS promedio,
                    COUNT(*) AS entradas
             FROM diario_emocinal d
             JOIN emocion e ON e.id_emocion = d.id_emocion
             WHERE d.id_estudiante = ?
               AND d.fecha >= CURDATE() - INTERVAL 6 DAY
             GROUP BY DATE(d.fecha)
             ORDER BY DATE(d.fecha)`,
            [estudiantes[0].id_estudiante]
        );

        const [[hoy]] = await connection.promise().query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hoy");

        return res.json({
            hoy: hoy.hoy,
            dias: dias
                .filter((dia) => dia.promedio !== null)
                .map((dia) => ({ fecha: dia.fecha, promedio: Number(dia.promedio), entradas: dia.entradas }))
        });
    } catch (error) {
        console.error('Error al leer el estado de ánimo semanal:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu estado de ánimo.' });
    }
});

// ---------------- Balance emocional del mes (Mi seguimiento) ----------------
// Cuántas veces registró cada emoción este mes, su porcentaje, el "equilibrio"
// (promedio del estado de ánimo en escala 0-100 %) y el equilibrio del mes pasado.

const VALOR_EMOCION = `CASE LOWER(TRIM(e.nombre))
        WHEN 'muy bien' THEN 5 WHEN 'bien' THEN 4 WHEN 'regular' THEN 3
        WHEN 'mal' THEN 2 WHEN 'muy mal' THEN 1 END`;

// promedio 1..5  ->  0..100 %
const equilibrioDesde = (promedio) =>
    promedio === null || promedio === undefined ? null : Math.round(((Number(promedio) - 1) / 4) * 100);

router.get('/balance', async (req, res) => {
    try {
        const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const idUsuario = leerTokenEstudiante(token);

        if (!idUsuario) {
            return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        }

        const db = connection.promise();
        const [estudiantes] = await db.query('SELECT id_estudiante FROM estudiante WHERE id_usuario = ? LIMIT 1', [idUsuario]);

        // Todas las emociones del catálogo, aunque este mes tengan 0 registros
        const [catalogo] = await db.query('SELECT id_emocion, nombre, foto FROM emocion ORDER BY id_emocion');

        if (!estudiantes.length) {
            return res.json({ sinFicha: true, total: 0, equilibrio: null, equilibrioMesPasado: null,
                emociones: catalogo.map((e) => ({ ...e, cantidad: 0, porcentaje: 0 })) });
        }

        const idEstudiante = estudiantes[0].id_estudiante;
        const inicioMes = "DATE_FORMAT(CURDATE(), '%Y-%m-01')";

        const [conteos] = await db.query(
            `SELECT d.id_emocion, COUNT(*) AS cantidad
             FROM diario_emocinal d
             WHERE d.id_estudiante = ? AND d.fecha >= ${inicioMes}
             GROUP BY d.id_emocion`,
            [idEstudiante]
        );

        const [[actual]] = await db.query(
            `SELECT AVG(${VALOR_EMOCION}) AS promedio
             FROM diario_emocinal d JOIN emocion e ON e.id_emocion = d.id_emocion
             WHERE d.id_estudiante = ? AND d.fecha >= ${inicioMes}`,
            [idEstudiante]
        );

        const [[anterior]] = await db.query(
            `SELECT AVG(${VALOR_EMOCION}) AS promedio
             FROM diario_emocinal d JOIN emocion e ON e.id_emocion = d.id_emocion
             WHERE d.id_estudiante = ?
               AND d.fecha >= ${inicioMes} - INTERVAL 1 MONTH
               AND d.fecha < ${inicioMes}`,
            [idEstudiante]
        );

        const porEmocion = new Map(conteos.map((fila) => [fila.id_emocion, Number(fila.cantidad)]));
        const total = conteos.reduce((suma, fila) => suma + Number(fila.cantidad), 0);

        // Porcentajes que siempre suman 100 (se reparte el sobrante a los decimales más grandes)
        const emociones = catalogo.map((emocion) => {
            const cantidad = porEmocion.get(emocion.id_emocion) || 0;
            const exacto = total ? (cantidad / total) * 100 : 0;
            return { id_emocion: emocion.id_emocion, nombre: emocion.nombre, foto: emocion.foto,
                cantidad, porcentaje: Math.floor(exacto), resto: exacto - Math.floor(exacto) };
        });

        let faltante = total ? 100 - emociones.reduce((suma, e) => suma + e.porcentaje, 0) : 0;
        [...emociones].sort((a, b) => b.resto - a.resto).forEach((e) => {
            if (faltante > 0 && e.cantidad > 0) { e.porcentaje += 1; faltante -= 1; }
        });

        return res.json({
            total,
            equilibrio: equilibrioDesde(actual.promedio),
            equilibrioMesPasado: equilibrioDesde(anterior.promedio),
            emociones: emociones.map(({ resto, ...emocion }) => emocion)
        });
    } catch (error) {
        console.error('Error al leer el balance emocional:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu balance emocional.' });
    }
});

// ---------------- Racha de bienestar (Mi seguimiento) ----------------
// Días seguidos en que el estudiante escribió en su diario, hasta hoy.
// Si hoy aún no escribe pero ayer sí, la racha sigue viva (cuenta hasta ayer).

const sumarDias = (fechaISO, dias) => {
    const fecha = new Date(`${fechaISO}T12:00:00Z`);
    fecha.setUTCDate(fecha.getUTCDate() + dias);
    return fecha.toISOString().slice(0, 10);
};

router.get('/racha', async (req, res) => {
    try {
        const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const idUsuario = leerTokenEstudiante(token);

        if (!idUsuario) {
            return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        }

        const db = connection.promise();
        const [[{ hoy }]] = await db.query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hoy");
        const [estudiantes] = await db.query('SELECT id_estudiante FROM estudiante WHERE id_usuario = ? LIMIT 1', [idUsuario]);

        if (!estudiantes.length) {
            return res.json({ hoy, racha: 0, escribioHoy: false, diasConEntrada: [], totalDias: 0, sinFicha: true });
        }

        const [filas] = await db.query(
            `SELECT DISTINCT DATE_FORMAT(DATE(fecha), '%Y-%m-%d') AS dia
             FROM diario_emocinal
             WHERE id_estudiante = ?
             ORDER BY dia DESC`,
            [estudiantes[0].id_estudiante]
        );

        const dias = new Set(filas.map((fila) => fila.dia));
        const escribioHoy = dias.has(hoy);

        // Se cuenta hacia atrás desde hoy (o desde ayer si hoy aún no escribe)
        let cursor = escribioHoy ? hoy : sumarDias(hoy, -1);
        let racha = 0;

        while (dias.has(cursor)) {
            racha += 1;
            cursor = sumarDias(cursor, -1);
        }

        // Días con entrada de la semana actual (lunes a domingo), para los círculos
        const diaSemana = new Date(`${hoy}T12:00:00Z`).getUTCDay(); // 0 = domingo
        const lunes = sumarDias(hoy, -((diaSemana + 6) % 7));
        const semana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));

        return res.json({
            hoy,
            racha,
            escribioHoy,
            totalDias: dias.size,
            semana,
            diasConEntrada: semana.filter((dia) => dias.has(dia))
        });
    } catch (error) {
        console.error('Error al calcular la racha:', error.message);
        return res.status(500).json({ message: 'No se pudo calcular tu racha.' });
    }
});

export default router;
