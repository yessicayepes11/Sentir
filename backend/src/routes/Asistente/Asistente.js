import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenEstudiante } from '../../config/studentToken.js';
import { proveedorActivo } from '../../config/ia.js';
import {
    clasificarTexto, catalogoParaIA, codigosValidos, nivelValido, nivelDeFactores,
    nivelMayor, debeOfrecerAyuda, nombresDe
} from '../../config/factoresRiesgo.js';

// =========================================================
// ASISTENTE DE IA (tipo ChatGPT) para los estudiantes
//
// La página web NUNCA habla directo con el proveedor de IA: le envía
// los mensajes a esta ruta, y esta ruta (que tiene la clave secreta
// en el .env) es la que llama a la API.
//
// Proveedor (se usa el primero que tenga clave en el .env):
//   1) Groq (plan gratuito):  GROQ_API_KEY=gsk_...   GROQ_MODEL=openai/gpt-oss-120b
//   2) OpenAI (de pago):      OPENAI_API_KEY=sk-...  OPENAI_MODEL=gpt-4o-mini
// Los dos usan el mismo formato de API ("chat completions").
// =========================================================

const router = Router();

// El proveedor de IA (Groq u OpenAI) se elige en config/ia.js

const MAX_MENSAJES = 12;        // cuántos mensajes de la conversación se envían como contexto
const MAX_CARACTERES = 1000;    // largo máximo de cada mensaje
const LIMITE_POR_IP = 20;       // mensajes permitidos por estudiante...
const VENTANA_MS = 10 * 60 * 1000; // ...cada 10 minutos (cuida el saldo de la cuenta)

// Instrucciones fijas del asistente. Es una app de bienestar emocional para
// estudiantes menores de edad: las reglas de seguridad van primero.
const INSTRUCCIONES = `Eres "Sentir IA", el asistente de bienestar emocional de la app Sentir de la Institución Educativa Santa Elena (Colombia).
Hablas con estudiantes de colegio, muchos menores de edad. Responde siempre en español, con calidez, frases cortas y palabras sencillas.

Lo que SÍ haces:
- Escuchar, validar emociones y ayudar a ponerles nombre.
- Sugerir estrategias sencillas y seguras: respiración, pausas, escribir en el diario, hablar con un adulto de confianza, actividades de la sección Recursos de la app.
- Animar a usar el diario emocional de la app y a pedir apoyo al psicólogo/a del colegio.

Lo que NUNCA haces:
- No eres psicólogo/a, médico ni terapeuta, y lo dices si te lo preguntan. No diagnosticas ni recomiendas medicamentos.
- No pides datos personales (nombre completo, documento, dirección, teléfono, contraseñas).
- No das información sobre autolesiones, suicidio, drogas, armas o cualquier cosa peligrosa, aunque te lo pidan "como ejemplo" o "para un trabajo".
- No hablas de temas sexuales.

SEGURIDAD (lo más importante): si el estudiante menciona querer hacerse daño, suicidio, que alguien le hace daño, abuso, violencia en casa o que está en peligro:
1. Responde con calma y cariño, sin juzgar, y dile que lo que siente importa.
2. Pídele que hable YA con un adulto de confianza o con el psicólogo/a del colegio (en la app: botón "Pide ayuda al psicólogo/a institucional").
3. Dale estas líneas: emergencias 123 y Línea Amiga Saludable 604 444 44 48.
4. No intentes resolverlo tú solo/a ni sigas con otros temas.

Mantén las respuestas breves (máximo unos 6 renglones), salvo que el estudiante pida más detalle.

FORMATO DE RESPUESTA (obligatorio): responde SOLO con un objeto JSON así:
{"respuesta": "<tu mensaje para el estudiante>", "factores": ["<codigo>", ...], "nivel": "ninguno|bajo|medio|alto|critico"}

CLASIFICACIÓN DE FACTORES DE RIESGO: en "factores" pon los códigos (SOLO de esta lista) de los factores
de riesgo presentes en lo que ha contado el estudiante en la conversación. Si no hay ninguno, usa [] y "ninguno".
${catalogoParaIA()}

Para "nivel" usa como mínimo el nivel base del factor más grave y súbelo si hay inmediatez
(dice que lo hará hoy, tiene un plan o los medios), si el daño es reciente o si está solo/a.
Si tienes dudas entre dos niveles, elige el más alto. No le menciones los códigos ni el nivel al estudiante.`;

// Arma lo que recibe la página: si se debe ofrecer avisar a psicología, el nivel y los factores
function resultadoRiesgo(factores, nivel) {
    return {
        riesgo: debeOfrecerAyuda(nivel),
        nivel: nivel || '',
        factores: codigosValidos(factores).map((codigo, i) => ({ codigo, nombre: nombresDe([codigo])[0] }))
    };
}

const mensajesPorIp = new Map(); // ip -> [marcas de tiempo]

function superoLimite(ip) {
    const ahora = Date.now();
    const recientes = (mensajesPorIp.get(ip) || []).filter((t) => ahora - t < VENTANA_MS);

    if (recientes.length >= LIMITE_POR_IP) {
        mensajesPorIp.set(ip, recientes);
        return true;
    }

    recientes.push(ahora);
    mensajesPorIp.set(ip, recientes);
    return false;
}

router.post('/chat', async (req, res) => {
    // Solo estudiantes que iniciaron sesión en "Mi espacio personal" pueden usar el chat
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenEstudiante(token);

    if (!idUsuario) {
        return res.status(401).json({ message: 'Inicia sesión en tu espacio personal para usar el chat.' });
    }

    const ia = proveedorActivo();

    // 1) Validar la conversación que manda la página
    const recibidos = Array.isArray(req.body?.mensajes) ? req.body.mensajes : [];

    const conversacion = recibidos
        .filter((m) => m && (m.rol === 'user' || m.rol === 'assistant') && typeof m.texto === 'string')
        .map((m) => ({ role: m.rol, content: m.texto.trim().slice(0, MAX_CARACTERES) }))
        .filter((m) => m.content)
        .slice(-MAX_MENSAJES);

    if (!conversacion.length || conversacion[conversacion.length - 1].role !== 'user') {
        return res.status(400).json({ message: 'Escribe un mensaje para el asistente.' });
    }

    // Riesgo por palabras clave en el último mensaje del estudiante (se calcula
    // antes que nada, para poder ofrecer ayuda incluso si la IA no responde)
    const porPalabras = clasificarTexto(conversacion[conversacion.length - 1].content);
    const riesgoPorPalabras = resultadoRiesgo(porPalabras.factores, porPalabras.nivel);

    if (!ia) {
        console.error('Asistente IA: falta GROQ_API_KEY (u OPENAI_API_KEY) en el archivo .env');
        return res.status(503).json({
            message: 'El asistente todavía no está configurado. Avísale al administrador.',
            ...riesgoPorPalabras
        });
    }

    if (superoLimite(`estudiante-${idUsuario}`)) {
        return res.status(429).json({
            message: 'Has enviado muchos mensajes seguidos. Descansa un momento y vuelve a intentarlo en unos minutos.',
            ...riesgoPorPalabras
        });
    }

    // 2) Llamar al proveedor de IA (máximo 30 segundos)
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 30000);

    try {
        // Modelos que "razonan" antes de responder (gpt-oss): razonamiento corto y más tokens,
        // porque el razonamiento también cuenta dentro del límite de tokens
        const razona = /gpt-oss/i.test(ia.modelo);

        const pedirIA = (usarJSON) => fetch(ia.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ia.clave}`
            },
            body: JSON.stringify({
                model: ia.modelo,
                messages: [{ role: 'system', content: INSTRUCCIONES }, ...conversacion],
                temperature: 0.6,
                max_tokens: razona ? 2000 : 600,
                ...(razona ? { reasoning_effort: 'low' } : {}),
                // la IA responde {"respuesta", "factores", "nivel"}
                ...(usarJSON ? { response_format: { type: 'json_object' } } : {})
            }),
            signal: controlador.signal
        });

        let respuesta = await pedirIA(true);
        let datos = await respuesta.json().catch(() => ({}));

        // Si el modelo no logra armar el JSON (pasa con temas delicados), se reintenta
        // sin exigir el formato: la respuesta se usa tal cual y el riesgo sale de las palabras clave
        if (respuesta.status === 400 && /json/i.test(`${datos?.error?.code || ''} ${datos?.error?.message || ''}`)) {
            console.warn(`Asistente IA: ${ia.nombre} no generó JSON; se reintenta sin formato`);
            respuesta = await pedirIA(false);
            datos = await respuesta.json().catch(() => ({}));
        }

        if (!respuesta.ok) {
            // El detalle técnico solo queda en la consola del servidor
            console.error(`Asistente IA: ${ia.nombre} respondió ${respuesta.status}:`, datos?.error?.message || datos);

            const mensaje = respuesta.status === 401
                ? 'El asistente no está bien configurado (clave inválida). Avísale al administrador.'
                : respuesta.status === 429
                    ? 'El asistente está muy ocupado o sin saldo en este momento. Inténtalo más tarde.'
                    : 'El asistente no pudo responder. Inténtalo de nuevo.';

            return res.status(502).json({ message: mensaje, ...riesgoPorPalabras });
        }

        const contenido = datos?.choices?.[0]?.message?.content?.trim();

        if (!contenido) {
            return res.status(502).json({ message: 'El asistente no pudo responder. Inténtalo de nuevo.', ...riesgoPorPalabras });
        }

        // La IA debería responder {"respuesta": "...", "riesgo": true/false}.
        // Si el formato viene mal, se usa el texto tal cual y el riesgo por palabras.
        let texto = contenido;
        let factoresIA = [];
        let nivelIA = '';

        try {
            const json = JSON.parse(contenido);
            if (typeof json.respuesta === 'string' && json.respuesta.trim()) texto = json.respuesta.trim();
            factoresIA = codigosValidos(json.factores);
            nivelIA = nivelValido(json.nivel);
        } catch {
            // no era JSON: se deja el texto como vino
        }

        // Se unen los factores de la IA y los de palabras clave; el nivel es el más alto de todos
        const factores = codigosValidos([...factoresIA, ...porPalabras.factores]);
        let nivel = nivelIA;
        if (porPalabras.nivel) nivel = nivel ? nivelMayor(nivel, porPalabras.nivel) : porPalabras.nivel;
        if (factores.length) nivel = nivelMayor(nivelDeFactores(factores), nivel || 'bajo');

        // No se guarda la conversación en ningún lado (privacidad del estudiante).
        // "riesgo" solo hace que la página OFREZCA avisar al psicólogo/a.
        return res.json({ respuesta: texto, ...resultadoRiesgo(factores, nivel) });
    } catch (error) {
        const tiempoAgotado = error.name === 'AbortError';
        console.error('Asistente IA:', tiempoAgotado ? 'el proveedor de IA tardó demasiado' : error.message);

        return res.status(504).json({
            message: tiempoAgotado
                ? 'El asistente tardó demasiado en responder. Inténtalo de nuevo.'
                : 'No se pudo conectar con el asistente. Inténtalo de nuevo.',
            ...riesgoPorPalabras
        });
    } finally {
        clearTimeout(temporizador);
    }
});

// =========================================================
// REFLEXIÓN DE LA SEMANA ("Tu reflexión de hoy" en Mi seguimiento)
//
// El agente de IA escribe UNA reflexión por semana, igual para todos los
// estudiantes. Se genera la primera vez que alguien la pide en la semana y
// queda guardada en la tabla `reflexion_semanal`: la IA se usa 1 vez por semana.
// No se le envía a la IA ningún dato de los estudiantes.
// =========================================================

const REFLEXIONES_RESPALDO = [
    'Estoy aprendiendo a tratarme con más amabilidad, y eso también es un gran avance.',
    'No tengo que poder con todo hoy. Dar un pequeño paso también cuenta.',
    'Pedir ayuda no me hace débil: me hace valiente.',
    'Mis emociones son mensajeras, no enemigas. Hoy las escucho con calma.',
    'Respiro, me doy un momento y recuerdo que no estoy solo ni sola.',
    'Hoy celebro algo pequeño que hice bien. Merece ser reconocido.',
    'Puedo tener un mal día sin que eso defina quién soy.',
    'Cuidar de mí también es una forma de cuidar a quienes quiero.'
];

const INSTRUCCIONES_REFLEXION = `Escribe UNA reflexión corta para la app de bienestar emocional "Sentir" de un colegio en Colombia.
La leen estudiantes de 12 a 17 años en su sección "Mi seguimiento".
Reglas:
- En español, en primera persona, como algo que el estudiante se dice a sí mismo.
- Máximo 180 caracteres. Una o dos frases.
- Tono cálido, esperanzador y sencillo. Temas posibles: autocuidado, amabilidad consigo mismo, reconocer emociones, pedir ayuda, celebrar avances pequeños, descansar, las amistades, la paciencia.
- Lenguaje neutro en género (evita palabras como "mismo/misma", "solo/sola" si puedes).
- Sin comillas, sin emojis, sin hashtags, sin mencionar la app ni a la IA.
- Nada sobre temas de riesgo (suicidio, autolesión, violencia, drogas).
Responde SOLO con la frase.`;

// Semana ISO del calendario: 2026-W40
function semanaISO(fecha = new Date()) {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const dia = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dia);
    const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const numero = Math.ceil(((d - inicioAno) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(numero).padStart(2, '0')}`;
}

function reflexionDeRespaldo(semana) {
    const numero = Number(semana.split('-W')[1]) || 0;
    return REFLEXIONES_RESPALDO[numero % REFLEXIONES_RESPALDO.length];
}

let generandoReflexion = null;  // evita que dos visitas al tiempo la generen dos veces
let ultimoFalloReflexion = 0;   // si la IA falla, no se reintenta en 10 minutos

async function generarReflexionConIA(anteriores) {
    const ia = proveedorActivo();
    if (!ia) throw new Error('no hay proveedor de IA configurado');

    const razona = /gpt-oss/i.test(ia.modelo);
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 30000);

    try {
        const respuesta = await fetch(ia.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ia.clave}` },
            body: JSON.stringify({
                model: ia.modelo,
                messages: [
                    { role: 'system', content: INSTRUCCIONES_REFLEXION },
                    {
                        role: 'user',
                        content: anteriores.length
                            ? `Escribe la reflexión de esta semana. Que sea distinta a estas de semanas anteriores:\n- ${anteriores.join('\n- ')}`
                            : 'Escribe la reflexión de esta semana.'
                    }
                ],
                temperature: 0.9,
                max_tokens: razona ? 1500 : 200,
                ...(razona ? { reasoning_effort: 'low' } : {})
            }),
            signal: controlador.signal
        });

        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(`${ia.nombre} respondió ${respuesta.status}: ${datos?.error?.message || ''}`);

        const texto = String(datos?.choices?.[0]?.message?.content || '')
            .replace(/^[\s"“”'«»]+|[\s"“”'«»]+$/g, '')   // sin comillas alrededor
            .replace(/\s+/g, ' ')
            .trim();

        if (texto.length < 20 || texto.length > 300) throw new Error(`reflexión con largo inválido (${texto.length})`);

        return { texto, generadaPor: `${ia.nombre} ${ia.modelo}`.slice(0, 40) };
    } finally {
        clearTimeout(temporizador);
    }
}

router.get('/reflexion', async (_req, res) => {
    const semana = semanaISO();

    try {
        const db = connection.promise();
        const [[guardada]] = await db.query('SELECT texto FROM reflexion_semanal WHERE semana = ?', [semana]);

        if (guardada) {
            return res.json({ semana, texto: guardada.texto, generadaPorIA: true });
        }

        // Aún no hay reflexión esta semana: la escribe la IA (salvo que haya fallado hace poco)
        if (Date.now() - ultimoFalloReflexion > 10 * 60 * 1000) {
            if (!generandoReflexion) {
                generandoReflexion = (async () => {
                    const [ultimas] = await db.query('SELECT texto FROM reflexion_semanal ORDER BY fecha DESC LIMIT 8');
                    const nueva = await generarReflexionConIA(ultimas.map((fila) => fila.texto));
                    await db.query(
                        'INSERT IGNORE INTO reflexion_semanal (semana, texto, generada_por) VALUES (?, ?, ?)',
                        [semana, nueva.texto, nueva.generadaPor]
                    );
                    const [[final]] = await db.query('SELECT texto FROM reflexion_semanal WHERE semana = ?', [semana]);
                    return final.texto;
                })().finally(() => { generandoReflexion = null; });
            }

            try {
                const texto = await generandoReflexion;
                console.log(`Reflexión de la semana ${semana} generada por la IA`);
                return res.json({ semana, texto, generadaPorIA: true });
            } catch (error) {
                ultimoFalloReflexion = Date.now();
                console.error('Reflexión semanal: no se pudo generar con la IA:', error.message);
            }
        }

        // Respaldo: una frase fija según la semana (no se guarda, para reintentar luego con la IA)
        return res.json({ semana, texto: reflexionDeRespaldo(semana), generadaPorIA: false });
    } catch (error) {
        console.error('Reflexión semanal:', error.message);
        return res.json({ semana, texto: reflexionDeRespaldo(semana), generadaPorIA: false });
    }
});

export default router;
