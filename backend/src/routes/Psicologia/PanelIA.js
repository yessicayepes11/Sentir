import crypto from 'node:crypto';
import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenUsuario } from '../../config/studentToken.js';
import { pedirJSON } from '../../config/ia.js';
import { nombresDe, NOMBRE_NIVEL } from '../../config/factoresRiesgo.js';
import { notificar } from '../../config/citas.js';

// =========================================================
// INICIO DE PSICOLOGÍA — montado en /api/Psicologia
//   GET  /sugerencia-ia   "Sugerencia de la IA" y "Tip" generados con IA a partir de
//                         datos AGREGADOS por grado (nunca nombres de estudiantes).
//                         Se guarda 30 min en memoria; ?nueva=1 pide otra.
//   POST /coordinacion    "Notificar a Coordinación": aviso (campanita + correo) a las
//                         coordinadoras académica y/o de convivencia.
// =========================================================

const router = Router();
const ROL_PSICOLOGIA = 6;
const ROLES_COORDINACION = { academica: [3], convivencia: [4], ambas: [3, 4] };
const CACHE_MS = 30 * 60 * 1000;
const cache = new Map();   // idPsicologa -> { huella, hora, resultado }

const texto = (valor, max) => String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

async function psicologaDeLaSesion(req, res) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenUsuario(token);
    if (!idUsuario) {
        res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });
        return null;
    }
    const [[usuario]] = await connection.promise().query('SELECT id_usuario, id_rol, nombre, apellido FROM usuario WHERE id_usuario = ? LIMIT 1', [idUsuario]);
    if (!usuario || Number(usuario.id_rol) !== ROL_PSICOLOGIA) {
        res.status(403).json({ message: 'Esta sección es solo para psicología.' });
        return null;
    }
    return usuario;
}

// Datos agregados de la institución (sin nombres) para que la IA los analice
async function datosAgregados() {
    const db = connection.promise();
    const [animos] = await db.query(
        `SELECT e.grado, DATEDIFF(CURDATE(), DATE(d.fecha)) AS dias, d.id_emocion
         FROM diario_emocinal d JOIN estudiante e ON e.id_estudiante = d.id_estudiante
         WHERE d.fecha >= CURDATE() - INTERVAL 14 DAY`
    );
    const [alertas] = await db.query(
        `SELECT a.grado, a.nivel_riesgo, a.factores_riesgo, a.origen, a.estado, DATEDIFF(CURDATE(), DATE(a.fecha)) AS dias
         FROM ayuda a WHERE a.fecha >= CURDATE() - INTERVAL 30 DAY`
    );
    const [[citas]] = await db.query("SELECT SUM(estado = 'Pendiente') AS pendientes, SUM(estado = 'Programada' AND fecha >= CURDATE()) AS programadas FROM cita");
    const [[procesos]] = await db.query("SELECT COUNT(*) AS activos FROM proceso_terapia WHERE estado = 'Activo'");
    const [actividades] = await db.query('SELECT tipo, titulo FROM relajacion ORDER BY id_relajacion DESC LIMIT 15');

    const porGrado = {};
    animos.forEach((r) => {
        const g = (porGrado[r.grado] = porGrado[r.grado] || { registros: 0, animoBajoSemana: 0, animoBajoSemanaAnterior: 0, animoBienSemana: 0 });
        const bajo = Number(r.id_emocion) >= 4;
        if (r.dias <= 7) {
            g.registros += 1;
            if (bajo) g.animoBajoSemana += 1;
            if (Number(r.id_emocion) <= 2) g.animoBienSemana += 1;
        } else if (bajo) {
            g.animoBajoSemanaAnterior += 1;
        }
    });

    const factores = {};
    const niveles = {};
    const alertasPorGrado = {};
    alertas.forEach((a) => {
        if (a.nivel_riesgo) niveles[NOMBRE_NIVEL[a.nivel_riesgo] || a.nivel_riesgo] = (niveles[NOMBRE_NIVEL[a.nivel_riesgo] || a.nivel_riesgo] || 0) + 1;
        nombresDe(String(a.factores_riesgo || '').split(',').filter(Boolean)).forEach((f) => { factores[f] = (factores[f] || 0) + 1; });
        alertasPorGrado[a.grado] = (alertasPorGrado[a.grado] || 0) + 1;
    });

    return {
        animoPorGrado: porGrado,
        alertasUltimos30Dias: alertas.length,
        alertasActivas: alertas.filter((a) => a.estado !== 'Resuelta').length,
        alertasPorNivel: niveles,
        factoresDeRiesgoMasFrecuentes: Object.entries(factores).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f, n]) => `${f} (${n})`),
        alertasPorGrado,
        alertasPorOrigen: alertas.reduce((acc, a) => { acc[a.origen] = (acc[a.origen] || 0) + 1; return acc; }, {}),
        citasPorAceptar: Number(citas.pendientes || 0),
        citasProgramadas: Number(citas.programadas || 0),
        estudiantesEnProceso: Number(procesos.activos || 0),
        actividadesPublicadas: actividades.map((a) => `${a.titulo} (${a.tipo})`)
    };
}

// Grado que más atención necesita según los datos (respaldo y apoyo a la IA)
function grupoPrioritario(datos) {
    const candidatos = Object.entries(datos.animoPorGrado).map(([grado, g]) => ({
        grado,
        puntos: g.animoBajoSemana * 2 + (datos.alertasPorGrado[grado] || 0),
        ...g
    })).sort((a, b) => b.puntos - a.puntos);
    if (candidatos.length && candidatos[0].puntos > 0) return candidatos[0];
    const [grado] = Object.entries(datos.alertasPorGrado).sort((a, b) => b[1] - a[1])[0] || [];
    return grado ? { grado, puntos: datos.alertasPorGrado[grado], animoBajoSemana: 0, animoBajoSemanaAnterior: 0, registros: 0 } : null;
}

function sugerenciaDeRespaldo(datos) {
    const g = grupoPrioritario(datos);
    if (!g) {
        return {
            sugerencia: 'Por ahora no hay una concentración de ánimo bajo ni de alertas en un grado. Es un buen momento para actividades preventivas de bienestar.',
            tip: 'Publica una actividad breve de respiración o autocuidado para todos y recuérdales que pueden pedir cita desde su espacio personal.',
            grupo: '', temaActividad: 'bienestar general y autocuidado', tipoActividad: 'Autocuidado'
        };
    }
    const factor = datos.factoresDeRiesgoMasFrecuentes[0];
    return {
        sugerencia: `El grado ${g.grado} concentra más señales esta semana: ${g.animoBajoSemana} registro(s) de ánimo bajo (antes ${g.animoBajoSemanaAnterior}) y ${datos.alertasPorGrado[g.grado] || 0} alerta(s) en el último mes.`,
        tip: `Te sugerimos un espacio grupal con el grado ${g.grado}${factor ? ` enfocado en ${factor.replace(/ \(\d+\)$/, '').toLowerCase()}` : ''} y sugerirles una actividad de regulación emocional.`,
        grupo: g.grado, temaActividad: factor ? factor.replace(/ \(\d+\)$/, '') : 'manejo del estrés', tipoActividad: 'Respiración'
    };
}

const INSTRUCCIONES = `Eres una asistente para la psicóloga de un colegio en Colombia. Recibes datos AGREGADOS (sin nombres)
del diario emocional y de las alertas. Tu tarea: una recomendación breve y accionable para priorizar el trabajo de la semana.
Responde SOLO con JSON con esta forma exacta:
{"sugerencia": "1 o 2 frases con el hallazgo principal, citando cifras concretas de los datos",
 "tip": "1 o 2 frases con una acción concreta que la psicóloga puede hacer esta semana",
 "grupo": "el grado al que se refiere (ej. 11-4) o cadena vacía si es institucional",
 "temaActividad": "tema corto para crear una actividad de bienestar para ese grupo",
 "tipoActividad": "Respiración | Mindfulness | Movimiento | Escritura terapéutica | Arte terapia | Música | Autocuidado | Juego y creatividad"}
Reglas: háblale a la psicóloga de "tú" (ej. "Te sugiero contactar..."); no inventes datos que no estén en el JSON; no hagas diagnósticos; lenguaje profesional y cálido; sin emojis;
si hay alertas de nivel Alto o Crítico, el tip debe priorizar contactar y hacer seguimiento a esos casos.`;

router.get('/sugerencia-ia', async (req, res) => {
    try {
        const psicologa = await psicologaDeLaSesion(req, res);
        if (!psicologa) return;

        const datos = await datosAgregados();
        const huella = crypto.createHash('sha1').update(JSON.stringify(datos)).digest('hex');
        const guardada = cache.get(String(psicologa.id_usuario));
        const nueva = String(req.query.nueva) === '1';
        if (!nueva && guardada && guardada.huella === huella && Date.now() - guardada.hora < CACHE_MS) {
            return res.json({ ...guardada.resultado, enCache: true });
        }

        let resultado;
        try {
            const respuesta = await pedirJSON(INSTRUCCIONES, `Datos de la institución:\n${JSON.stringify(datos)}`, { temperatura: nueva ? 0.9 : 0.6, maxTokens: 700, esperaMs: 30000 });
            const j = respuesta.json || {};
            resultado = {
                sugerencia: texto(j.sugerencia, 400),
                tip: texto(j.tip, 400),
                grupo: texto(j.grupo, 20),
                temaActividad: texto(j.temaActividad, 120),
                tipoActividad: texto(j.tipoActividad, 60),
                generadoPor: respuesta.generadoPor || 'IA'
            };
            if (resultado.sugerencia.length < 10 || resultado.tip.length < 10) throw new Error('respuesta incompleta');
        } catch (error) {
            console.warn('Sugerencia de la IA: se usa el respaldo:', error.message);
            resultado = { ...sugerenciaDeRespaldo(datos), generadoPor: '' };
        }

        // Base del análisis (para "Ver base del análisis")
        const g = resultado.grupo ? datos.animoPorGrado[resultado.grupo] : null;
        resultado.base = {
            grupo: resultado.grupo,
            animoBajoSemana: g ? g.animoBajoSemana : null,
            animoBajoSemanaAnterior: g ? g.animoBajoSemanaAnterior : null,
            registrosSemana: Object.values(datos.animoPorGrado).reduce((s, x) => s + x.registros, 0),
            alertasActivas: datos.alertasActivas,
            alertasPorNivel: datos.alertasPorNivel,
            factores: datos.factoresDeRiesgoMasFrecuentes.slice(0, 3),
            citasPorAceptar: datos.citasPorAceptar
        };
        resultado.fecha = new Date().toISOString();

        cache.set(String(psicologa.id_usuario), { huella, hora: Date.now(), resultado });
        return res.json(resultado);
    } catch (error) {
        console.error('Sugerencia de la IA:', error.message);
        return res.status(500).json({ message: 'No se pudo generar la sugerencia.' });
    }
});

router.post('/coordinacion', async (req, res) => {
    try {
        const psicologa = await psicologaDeLaSesion(req, res);
        if (!psicologa) return;
        const body = req.body || {};
        const roles = ROLES_COORDINACION[body.destino] || ROLES_COORDINACION.ambas;
        const asunto = texto(body.asunto, 120) || 'Mensaje de psicología';
        const mensaje = String(body.mensaje ?? '').trim().slice(0, 2000);
        if (mensaje.length < 5) return res.status(400).json({ message: 'Escribe el mensaje para Coordinación.' });

        const db = connection.promise();
        const [destinos] = await db.query(
            "SELECT id_usuario FROM usuario WHERE id_rol IN (?) AND LOWER(TRIM(estadi)) = 'activo'", [roles]
        );
        if (!destinos.length) return res.status(404).json({ message: 'No hay coordinadoras activas registradas para recibir el mensaje.' });

        const firma = `${psicologa.nombre} ${psicologa.apellido}`.replace(/\s+/g, ' ').trim();
        for (const d of destinos) {
            await notificar(db, {
                destino: d.id_usuario,
                tipo: 'mensaje_psicologia',
                titulo: `Psicología: ${asunto}`,
                mensaje: `${mensaje}\n\nEnviado por ${firma} (psicología).`
            });
        }
        return res.status(201).json({ message: 'Mensaje enviado.', enviados: destinos.length });
    } catch (error) {
        console.error('Notificar a Coordinación:', error.message);
        return res.status(500).json({ message: 'No se pudo enviar el mensaje.' });
    }
});

export default router;
