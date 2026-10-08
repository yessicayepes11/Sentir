import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { connection } from './mysql/dbmysql.js';

// =========================================================
// AVATAR ANIMADO CON IA (para la portada de Inicio de cada rol)
// A partir de la foto de perfil se crea un personaje animado con la paleta
// de Sentir (morados, detalles de corazón), vestido según el rol.
//
// Personaje 3D de cuerpo completo (estilo película animada) a partir de la FOTO.
// Proveedores (se prueban en este orden; si uno falla se pasa al siguiente):
//   1) OPENAI_API_KEY  -> gpt-image-1: foto + 1 ilustración de referencia + prompt completo (promptAvatar.txt)
//   2) GEMINI_API_KEY  -> gemini-2.5-flash-image: igual que OpenAI (fondo verde que se recorta)
//   3) POLLINATIONS_KEY (cuenta gratis en enter.pollinations.ai, clave sk_...) -> FLUX.1 Kontext Pro
//      y, si ese falla, FLUX.2 Klein. Usa el saldo gratuito diario de la cuenta.
//      Opcional POLLINATIONS_IMAGE_MODELS (lista separada por comas, por defecto "kontext,klein").
//   4) GRATIS, sin clave -> FLUX.1 Kontext (Hugging Face Space público): foto + versión corta del prompt.
//      Opcional HF_TOKEN para más cupo diario; AVATAR_KONTEXT=off para desactivarlo.
//   Opcionales: OPENAI_IMAGE_MODEL, OPENAI_IMAGE_QUALITY (high), GEMINI_IMAGE_MODEL, KONTEXT_SPACE_URL
//
// Si fallan todos, no se guarda nada: la página conserva su ilustración original y se reintenta en 10 minutos.
// Se guarda en uploads/avatares y se vuelve a crear solo cuando cambia la foto.
// Opcional: GROQ_VISION_MODEL (por defecto qwen/qwen3.8-27b)
// =========================================================

const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const carpeta = path.join(uploadsDir, 'avatares');
fs.mkdirSync(carpeta, { recursive: true });

const INSTRUCCIONES = `Ayudas a un ilustrador a crear un personaje animado a partir de una foto de perfil.
Responde SOLO un JSON: {"hayPersona": true|false, "descripcion": "..."}
"descripcion": 2 o 3 frases en inglés MUY detalladas, SOLO con rasgos visibles: forma de la cara; cabello (color exacto, largo, textura lisa/ondulada/rizada, peinado, flequillo, raya); cejas; color de ojos; tono de piel; nariz y sonrisa; gafas (forma, grosor y color del marco) o "no glasses"; barba o bigote solo si se ven claramente, o "clean-shaven"; aretes, piercings u otros accesorios; y la ROPA visible con detalle (tipo de prenda, color de cada prenda, cuello, botones, cremalleras, estampados, textura, reloj, joyería).
Describe solo lo que se ve. No adivines identidad, edad, etnia ni salud.
Si en la foto no hay una persona clara (logo, paisaje, dibujo), pon "hayPersona": false.`;

const clave = (n) => String(process.env[n] || '').trim();

const generando = new Map(); // id -> { promesa, huella } del avatar que se está creando
const fallos = new Map(); // id -> { cuando, huella } de la última vez que falló la IA
const pendientes = new Map(); // id -> { foto, tipo } que llegó mientras se creaba otro avatar
const REINTENTO_MS = 10 * 60 * 1000;

// Cambiar ESTILO_VERSION hace que todos los avatares se vuelvan a crear (la huella incluye la versión)
const ESTILO_VERSION = 'tierno-1';

function huellaFoto(foto) {
    return crypto.createHash('sha1').update(`${ESTILO_VERSION}|${String(foto || '')}`).digest('hex').slice(0, 12);
}

function archivosDe(id) {
    return fs.readdirSync(carpeta).filter((f) => f.startsWith(`usuario-${id}-`) && /\.(png|jpg|webp)$/.test(f))
        .sort((a, b) => Number(a.split('-')[3].split('.')[0]) - Number(b.split('-')[3].split('.')[0]));
}

// Avatar guardado de un usuario (o null). La huella de la foto va en el nombre del archivo.
// Versión ya recortada (fondo transparente, webp liviano) que guarda el primer navegador que la procesa
const nombreRecorte = (archivo) => `recorte-${archivo.replace(/\.(png|jpg|webp)$/, '')}.webp`;

export function avatarGuardado(id) {
    const archivos = archivosDe(id);
    if (!archivos.length) return null;
    const archivo = archivos[archivos.length - 1];
    const [, , huella] = archivo.split('.')[0].split('-');
    const recorte = fs.existsSync(path.join(carpeta, nombreRecorte(archivo))) ? `http://localhost:3001/uploads/avatares/${nombreRecorte(archivo)}` : '';
    return { archivo, huella, recorte, url: `http://localhost:3001/uploads/avatares/${archivo}` };
}

// Guarda el recorte del avatar ACTUAL del usuario (solo imágenes webp o png de hasta 5 MB)
export function guardarRecorte(id, archivo, datos) {
    const actual = avatarGuardado(id);
    if (!actual || actual.archivo !== archivo) return false;
    const esWebp = datos.length > 12 && datos.toString('ascii', 0, 4) === 'RIFF' && datos.toString('ascii', 8, 12) === 'WEBP';
    const esPng = datos.length > 8 && datos.readUInt32BE(0) === 0x89504e47;
    if (!(esWebp || esPng) || datos.length > 5 * 1024 * 1024) return false;
    fs.writeFileSync(path.join(carpeta, nombreRecorte(archivo)), datos);
    return true;
}

// Lee la foto (archivo en /uploads o URL pública)
async function leerFoto(foto) {
    const valor = String(foto || '').trim();
    if (/^https?:\/\//.test(valor)) {
        const r = await fetch(valor, { signal: AbortSignal.timeout(20000) });
        if (!r.ok) throw new Error('no se pudo descargar la foto');
        return { datos: Buffer.from(await r.arrayBuffer()), tipo: (r.headers.get('content-type') || 'image/jpeg').split(';')[0] };
    }
    const ruta = path.join(uploadsDir, path.basename(valor));
    if (!fs.existsSync(ruta)) throw new Error('la foto no existe en /uploads');
    const ext = path.extname(ruta).toLowerCase();
    const TIPOS = { '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };
    return { datos: fs.readFileSync(ruta), tipo: TIPOS[ext] || 'image/jpeg' };
}

// Las fotos se analizan de a una (el plan gratuito de Groq limita los tokens por minuto)
let cola = Promise.resolve();
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function rasgosDeLaFoto(foto) {
    const turno = cola.then(async () => {
        for (let intento = 1; ; intento++) {
            try {
                return await pedirRasgos(foto);
            } catch (error) {
                // "Please try again in 21.6s" o "in 145.7ms"
                const espera = error.message.match(/try again in ([\d.]+)(ms|s)/i);
                if (intento >= 4 || !espera) throw error;
                await esperar(Math.ceil(Number(espera[1]) * (espera[2] === 'ms' ? 1 : 1000)) + 500);
            }
        }
    });
    cola = turno.catch(() => {});
    return turno;
}

async function pedirRasgos(foto) {
    if (!clave('GROQ_API_KEY')) throw new Error('falta GROQ_API_KEY');
    const imagen = await leerFoto(foto);
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clave('GROQ_API_KEY')}` },
        body: JSON.stringify({
            model: clave('GROQ_VISION_MODEL') || 'qwen/qwen3.8-27b',
            temperature: 0.2,
            max_tokens: 450, // Groq descuenta max_tokens del límite por minuto
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: INSTRUCCIONES },
                { role: 'user', content: [
                    { type: 'text', text: 'Describe los rasgos visibles de esta foto de perfil.' },
                    { type: 'image_url', image_url: { url: `data:${imagen.tipo};base64,${imagen.datos.toString('base64')}` } }
                ] }
            ]
        }),
        signal: AbortSignal.timeout(60000)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Groq: ${j?.error?.message || r.status}`);
    return JSON.parse(j.choices[0].message.content);
}

// ---------------------------------------------------------
// AVATAR DETALLADO (personaje 3D como las ilustraciones originales)
// ---------------------------------------------------------
// Ropa por rol: solo se usa si la foto no muestra ninguna prenda
const VESTUARIO = {
    psicologia: 'dressed as a school psychologist: open crisp white doctor coat with a small violet heart enamel pin on the lapel and a pen in the chest pocket, violet V-neck knit sweater over a lavender collared shirt, purple trousers with a brown leather belt, holding a violet clipboard with a lavender heart against the chest with one hand, the other hand relaxed in the coat pocket',
    docente: 'dressed as a friendly school teacher: soft knit cardigan in violet or deep navy with ribbed cuffs and buttons over a light lavender or light blue button-up shirt (or a white blouse), a dark lanyard with a white ID badge that reads "Docente" with a small graduation cap icon, a leather belt, a wristwatch, holding two spiral notebooks or a tablet against the body with one arm, the other hand in the trouser pocket',
    estudiante: 'dressed as a cheerful high school student: cozy violet or lavender hoodie with drawstrings, kangaroo pocket and a small lavender heart on the chest, blue jeans, a violet backpack with padded straps on the shoulders, small stud earrings only if the person wears them',
    personal: 'dressed as a school administrator: tailored violet blazer over a white blouse or shirt, a violet lanyard with a white ID badge with a small heart icon, a wristwatch, holding a tablet or a violet folder with both hands'
};

// Ilustraciones de referencia de estilo (se envían junto con la foto a OpenAI / Gemini)
const IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../Client/img');
const REFERENCIAS = {
    psicologia: ['Imagen_docente.png', 'DocenteHombre.png'],
    docente: ['DocenteHombre.png', 'Imagen_docente.png'],
    estudiante: ['personajes.png', 'Muñecos png.png'],
    personal: ['Imagen_docente.png', 'PersonajesAdmin.png']
};

function referenciasDe(tipoUsuario) {
    return (REFERENCIAS[tipoUsuario] || REFERENCIAS.personal)
        .map((nombre) => path.join(IMG, nombre))
        .filter((ruta) => fs.existsSync(ruta))
        .slice(0, 1)
        .map((ruta) => ({ datos: fs.readFileSync(ruta), tipo: 'image/png', nombre: path.basename(ruta) }));
}

// Velocidad: el banner muestra el personaje a ~250-340 px de alto, así que no hace falta una imagen enorme.
// Menos píxeles y menos pasos = el avatar se crea más rápido y pesa menos al cargar.
// Opcionales: AVATAR_TAMANO (por defecto 640x960) y AVATAR_PASOS_KONTEXT (por defecto 20; antes 28).
const TAMANO_POLLINATIONS = /^\d{3,4}x\d{3,4}$/.test(clave('AVATAR_TAMANO')) ? clave('AVATAR_TAMANO') : '640x960';
const PASOS_KONTEXT = Math.min(40, Math.max(12, Number(clave('AVATAR_PASOS_KONTEXT')) || 20));

const FONDO_VERDE_ES ='verde croma puro (#00FF00), plano y uniforme, sin degradado, sin resplandor, sin sombras y sin suelo, para recortar al personaje y ponerlo en el banner.';
const ESPERA_IMAGEN_MS = 240000;

// Proveedores configurados, en orden de preferencia
export function proveedoresDeImagen() {
    const lista = [];
    if (clave('OPENAI_API_KEY')) lista.push('OpenAI');
    if (clave('GEMINI_API_KEY')) lista.push('Gemini');
    if (clave('POLLINATIONS_KEY')) lista.push('Pollinations');
    if (clave('AVATAR_KONTEXT').toLowerCase() !== 'off') lista.push('Kontext');
    return lista;
}

export function proveedorDeImagen() {
    return proveedoresDeImagen()[0] || null;
}

// Prompt principal (director de arte). Se puede editar en promptAvatar.txt sin tocar el código.
const PROMPT_AVATAR = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'promptAvatar.txt'), 'utf8').trim();

const MARCA = `Página/web: "Sentir", plataforma de bienestar emocional escolar (Institución Educativa Santa Elena). Identidad visual:
- color principal: violeta #6C4DF6; secundarios: lavanda #B8A8FF y lila suave #EDE9FE; apoyo: blanco y azul marino profundo #1E1B4B; acento: azul cielo #65B8FF y rosa suave.
- temperatura cálida-suave, saturación media, contraste suave; atmósfera cercana, amable y de cuidado; pequeños detalles de corazones.
- las ilustraciones de la marca usan luz de borde cálida y un resplandor violeta suave.`;

function pedidoDesdeFoto(tipoUsuario, fondo, rasgos, conReferencias) {
    return [
        PROMPT_AVATAR,
        '========================================\nDATOS DE ESTA SOLICITUD\n========================================',
        conReferencias
            ? 'PRIMERA IMAGEN = la FOTO DE PERFIL de la persona. SEGUNDA IMAGEN = la referencia de estilo y calidad (una ilustración de la marca).'
            : 'La imagen adjunta es la FOTOGRAFÍA REAL de la persona.',
        MARCA,
        rasgos?.descripcion ? `Rasgos y ropa visibles en la fotografía (apoyo; la foto manda): ${String(rasgos.descripcion).slice(0, 700).replace(/[.\s]+$/, '')}.` : '',
        `Si la fotografía no muestra todo el cuerpo, completa las partes que no se ven de forma coherente con la ropa visible y con la paleta de la marca. Si no se ve ninguna prenda, usa como guía: ${VESTUARIO[tipoUsuario] || VESTUARIO.personal}.`,
        'Estilo TIERNO (prioridad visual, sin perder la semejanza): rasgos suaves y redondeados, ojos grandes y brillantes, mejillas rosadas, piel suave, sonrisa dulce y cálida, expresión amable, cabello esponjoso, luz cálida con un brillo lila suave. Que se vea adorable y cercano.',
        'Encuadre: un solo personaje de cuerpo completo, de la cabeza a los pies, centrado, imagen vertical, con un pequeño margen.',
        `Fondo (requisito técnico de la página, tiene prioridad sobre el fondo de marca): ${fondo} La paleta de la marca aplícala con la iluminación, los reflejos y los detalles secundarios.`
    ].filter(Boolean).join('\n\n');
}

async function respuestaJSON(r, quien) {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${quien}: ${j?.error?.message || r.status}`);
    return j;
}

// OpenAI: foto + ilustraciones de referencia -> PNG con fondo transparente
async function detalladoOpenAI(imagen, tipoUsuario, rasgos) {
    const refs = referenciasDe(tipoUsuario);
    const form = new FormData();
    form.append('model', clave('OPENAI_IMAGE_MODEL') || 'gpt-image-1');
    form.append('image[]', new Blob([imagen.datos], { type: imagen.tipo }), imagen.tipo === 'image/png' ? 'foto.png' : 'foto.jpg');
    refs.forEach((ref, i) => form.append('image[]', new Blob([ref.datos], { type: ref.tipo }), `referencia-${i + 1}.png`));
    form.append('prompt', pedidoDesdeFoto(tipoUsuario, 'transparente, con el personaje completamente aislado.', rasgos, refs.length > 0));
    form.append('size', '1024x1536');
    form.append('background', 'transparent');
    form.append('quality', clave('OPENAI_IMAGE_QUALITY') || 'high');
    form.append('input_fidelity', 'high'); // conserva mejor los rasgos de la foto
    const r = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST', headers: { Authorization: `Bearer ${clave('OPENAI_API_KEY')}` }, body: form, signal: AbortSignal.timeout(ESPERA_IMAGEN_MS)
    });
    const j = await respuestaJSON(r, 'OpenAI');
    return { datos: Buffer.from(j.data[0].b64_json, 'base64'), ext: 'png' };
}

// Gemini: foto + ilustraciones de referencia -> imagen con fondo verde (se recorta en la página)
async function detalladoGemini(imagen, tipoUsuario, rasgos) {
    const refs = referenciasDe(tipoUsuario);
    const modelo = clave('GEMINI_IMAGE_MODEL') || 'gemini-2.5-flash-image';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave('GEMINI_API_KEY') },
        body: JSON.stringify({
            contents: [{ parts: [
                { inline_data: { mime_type: imagen.tipo, data: imagen.datos.toString('base64') } },
                ...refs.map((ref) => ({ inline_data: { mime_type: ref.tipo, data: ref.datos.toString('base64') } })),
                { text: pedidoDesdeFoto(tipoUsuario, FONDO_VERDE_ES, rasgos, refs.length > 0) + ' Imagen vertical 2:3.' }
            ] }],
            generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '2:3' } }
        }),
        signal: AbortSignal.timeout(ESPERA_IMAGEN_MS)
    });
    const j = await respuestaJSON(r, 'Gemini');
    const parte = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData || p.inline_data);
    if (!parte) throw new Error('Gemini no devolvió ninguna imagen');
    const img = parte.inlineData || parte.inline_data;
    return { datos: Buffer.from(img.data, 'base64'), ext: /png/.test(img.mimeType || img.mime_type || '') ? 'png' : 'jpg' };
}

// FLUX.1 Kontext (gratis): edita la foto según una versión corta del prompt (el modelo admite ~500 tokens)
function pedidoKontext(tipoUsuario) {
    return [
        'Convert this person into an adorable, cute and sweet premium 3D animated movie character in the style of Pixar and Disney 3D films (like Encanto, Luca or Up):',
        'cute soft rounded facial features, slightly bigger head and big sparkling glossy 3D eyes with bright catchlights, soft round rosy cheeks, smooth soft velvety stylized skin, a sweet warm friendly smile, gentle kind expression, soft rounded shapes, hair modeled in fluffy detailed stylized strands and locks, cozy soft fabric with natural folds, seams and texture, warm soft cinematic lighting with a gentle pastel violet rim light (#B8A8FF) and a soft glow.',
        'Keep the SAME person clearly recognizable: same face shape and facial proportions, same eyes, eyebrows, nose, mouth and smile, same skin tone, same hairstyle, hair length and hair color, same glasses if any (no glasses if none), same facial hair if any, same earrings.',
        `Keep the SAME clothes and colors as in the photo; complete the parts that are not visible in a discreet modern way${tipoUsuario === 'estudiante' ? ' (young student style)' : ' (professional school staff style)'}.`,
        'Full body from head to shoes with a small margin, standing in a relaxed cheerful pose, warm sweet smile, looking at the camera, centered, charming slightly stylized proportions, correct hands with five fingers.',
        'Background: solid flat pure chroma key green (#00FF00), nothing else. Not 2D, not flat, not a caricature.'
    ].join(' ');
}

async function detalladoKontext(imagen, tipoUsuario) {
    const SPACE = (clave('KONTEXT_SPACE_URL') || 'https://black-forest-labs-flux-1-kontext-dev.hf.space').replace(/\/$/, '');
    const auth = clave('HF_TOKEN') ? { Authorization: `Bearer ${clave('HF_TOKEN')}` } : {};
    const r = await fetch(`${SPACE}/gradio_api/call/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ data: [
            { url: `data:${imagen.tipo};base64,${imagen.datos.toString('base64')}`, meta: { _type: 'gradio.FileData' } },
            pedidoKontext(tipoUsuario), 0, true, 2.5, PASOS_KONTEXT
        ] }),
        signal: AbortSignal.timeout(60000)
    });
    const cola = await r.json().catch(() => ({}));
    if (!r.ok || !cola.event_id) throw new Error(`Kontext: ${cola.error || r.status}`);

    // La respuesta llega como eventos (heartbeat ... complete | error)
    const eventos = await (await fetch(`${SPACE}/gradio_api/call/infer/${cola.event_id}`, { headers: auth, signal: AbortSignal.timeout(ESPERA_IMAGEN_MS) })).text();
    const url = (eventos.match(/"url":\s*"([^"]+)"/) || [])[1];
    if (!url) {
        const detalle = ((eventos.match(/data: (.+)/g) || []).pop() || '').replace(/^data: /, '');
        // "event: error / data: null" = Hugging Face rechazó la petición: casi siempre es el cupo gratuito agotado
        throw new Error(detalle && detalle !== 'null'
            ? `Kontext: ${detalle}`.slice(0, 300)
            : `Kontext: Hugging Face rechazó la petición (cupo gratuito diario agotado${clave('HF_TOKEN') ? ' también para tu HF_TOKEN' : '; agrega HF_TOKEN en backend/.env o espera a que se renueve'}).`);
    }
    const img = await fetch(url, { headers: auth, signal: AbortSignal.timeout(60000) });
    if (!img.ok) throw new Error(`Kontext: no se pudo descargar la imagen (${img.status})`);
    const tipo = img.headers.get('content-type') || 'image/webp';
    return { datos: Buffer.from(await img.arrayBuffer()), ext: /png/.test(tipo) ? 'png' : /jpe?g/.test(tipo) ? 'jpg' : 'webp' };
}

// Tipo real de la imagen según sus primeros bytes
function extensionDe(datos) {
    if (datos.length > 8 && datos.readUInt32BE(0) === 0x89504e47) return 'png';
    if (datos.length > 12 && datos.toString('ascii', 0, 4) === 'RIFF' && datos.toString('ascii', 8, 12) === 'WEBP') return 'webp';
    return 'jpg';
}

// Pollinations (gen.pollinations.ai, compatible con OpenAI /v1/images/edits). Cuenta gratis con saldo diario.
// Prueba los modelos en orden (por defecto FLUX.1 Kontext Pro y luego FLUX.2 Klein, el más económico).
async function detalladoPollinations(imagen, tipoUsuario) {
    const modelos = (clave('POLLINATIONS_IMAGE_MODELS') || 'kontext,klein').split(',').map((m) => m.trim()).filter(Boolean);
    let ultimoError = null;
    for (const modelo of modelos) {
        try {
            const form = new FormData();
            form.append('model', modelo);
            form.append('image', new Blob([imagen.datos], { type: imagen.tipo }), imagen.tipo === 'image/png' ? 'foto.png' : 'foto.jpg');
            form.append('prompt', pedidoKontext(tipoUsuario));
            form.append('size', TAMANO_POLLINATIONS);
            form.append('response_format', 'b64_json');
            const r = await fetch('https://gen.pollinations.ai/v1/images/edits', {
                method: 'POST', headers: { Authorization: `Bearer ${clave('POLLINATIONS_KEY')}` }, body: form, signal: AbortSignal.timeout(ESPERA_IMAGEN_MS)
            });
            const j = await respuestaJSON(r, `Pollinations (${modelo})`);
            const dato = j.data?.[0] || {};
            let datos;
            if (dato.b64_json) datos = Buffer.from(dato.b64_json, 'base64');
            else if (dato.url) {
                const img = await fetch(dato.url, { signal: AbortSignal.timeout(60000) });
                if (!img.ok) throw new Error(`Pollinations (${modelo}): no se pudo descargar la imagen (${img.status})`);
                datos = Buffer.from(await img.arrayBuffer());
            } else throw new Error(`Pollinations (${modelo}) no devolvió ninguna imagen`);
            return { datos, ext: extensionDe(datos) };
        } catch (error) {
            ultimoError = error;
            console.error('Avatar IA:', error.message);
        }
    }
    throw ultimoError || new Error('Pollinations: no hay modelos configurados');
}

const DIBUJANTES = {
    OpenAI: (imagen, tipo, rasgos) => detalladoOpenAI(imagen, tipo, rasgos),
    Gemini: (imagen, tipo, rasgos) => detalladoGemini(imagen, tipo, rasgos),
    Pollinations: (imagen, tipo) => detalladoPollinations(imagen, tipo),
    Kontext: (imagen, tipo) => detalladoKontext(imagen, tipo)
};

// Los dibujos detallados también van de a uno. Si un proveedor falla (cupo agotado, sin saldo...) se usa el siguiente.
let colaImagen = Promise.resolve();
function dibujarDetallado(foto, rasgos, tipoUsuario) {
    const turno = colaImagen.then(async () => {
        const imagen = await leerFoto(foto);
        const errores = [];
        for (const proveedor of proveedoresDeImagen()) {
            try {
                const hecho = await DIBUJANTES[proveedor](imagen, tipoUsuario, rasgos);
                console.log(`Avatar IA: creado con ${proveedor}`);
                return hecho;
            } catch (error) {
                console.error(`Avatar IA (${proveedor}):`, error.message);
                errores.push(error.message);
            }
        }
        throw new Error(errores.length ? `fallaron todos los proveedores -> ${errores.join(' | ')}` : 'no hay ningún proveedor de imágenes configurado');
    });
    colaImagen = turno.catch(() => {});
    return turno;
}

// Crea (o devuelve el que se está creando) el avatar detallado a partir de la foto.
// Si falla, no se guarda nada (la página sigue con su ilustración) y se reintenta en 10 minutos.
export function crearAvatar(id, foto, tipoUsuario = 'personal') {
    const llave = String(id);
    if (generando.has(llave)) {
        // Si llega una foto nueva mientras se crea el avatar de la anterior, se crea apenas termine
        if (generando.get(llave).huella !== huellaFoto(foto)) pendientes.set(llave, { foto, tipo: tipoUsuario });
        return generando.get(llave).promesa;
    }
    const promesa = (async () => {
        let rasgos = null;
        try {
            // La descripción de rasgos solo la usan OpenAI y Gemini
            if (proveedoresDeImagen().some((p) => p === 'OpenAI' || p === 'Gemini')) rasgos = await rasgosDeLaFoto(foto);
        } catch (error) {
            console.error('Avatar IA (descripción):', error.message);
        }
        try {
            const hecho = await dibujarDetallado(foto, rasgos, tipoUsuario);
            const nombre = `usuario-${id}-${huellaFoto(foto)}-${Date.now()}.${hecho.ext}`;
            fs.writeFileSync(path.join(carpeta, nombre), hecho.datos);
            // Se borran los anteriores (incluidos los sencillos .svg de la versión anterior)
            fs.readdirSync(carpeta).filter((f) => (f.startsWith(`usuario-${id}-`) || f.startsWith(`recorte-usuario-${id}-`)) && f !== nombre).forEach((f) => fs.rmSync(path.join(carpeta, f), { force: true }));
            fallos.delete(llave);
            return avatarGuardado(id);
        } catch (error) {
            console.error('Avatar IA (dibujo):', error.message);
            fallos.set(llave, { cuando: Date.now(), huella: huellaFoto(foto) });
            return null;
        } finally {
            generando.delete(llave);
            const siguiente = pendientes.get(llave);
            pendientes.delete(llave);
            if (siguiente) crearAvatar(id, siguiente.foto, siguiente.tipo);
        }
    })();
    generando.set(llave, { promesa, huella: huellaFoto(foto) });
    return promesa;
}

// Estado del avatar. Sin clave de imágenes no se crea nada (la página deja su ilustración).
export function estadoAvatar(id, foto, tipoUsuario) {
    if (!String(foto || '').trim()) return { estado: 'sin-foto', url: '' };
    const guardado = avatarGuardado(id);
    const extra = { archivo: guardado?.archivo || '', recorte: guardado?.recorte || '' };
    if (!proveedorDeImagen()) return { estado: 'sin-clave', url: guardado?.url || '', detallado: Boolean(guardado), ...extra };
    const vigente = guardado && guardado.huella === huellaFoto(foto);
    // La espera de 10 minutos tras un fallo es solo para la MISMA foto: una foto nueva se intenta de inmediato
    const fallo = fallos.get(String(id));
    const falloReciente = Boolean(fallo) && fallo.huella === huellaFoto(foto) && Date.now() - fallo.cuando < REINTENTO_MS;
    if (!vigente && !falloReciente) crearAvatar(id, foto, tipoUsuario);
    if (generando.has(String(id))) return { estado: 'generando', url: guardado?.url || '', detallado: Boolean(guardado), ...extra };
    return { estado: guardado ? 'listo' : 'error', url: guardado?.url || '', detallado: Boolean(guardado), ...extra };
}

// El rol define la ropa del personaje (paleta de Sentir)
const TIPO_POR_ROL = { 5: 'docente', 6: 'psicologia', 8: 'estudiante' };
export const tipoPorRol = (idRol) => TIPO_POR_ROL[Number(idRol)] || 'personal';

// Se llama justo después de guardar una foto de perfil: si la foto cambió, el avatar nuevo
// empieza a crearse ya, sin esperar a que el usuario abra una página con avatar. Nunca lanza errores.
export async function fotoCambiada(id) {
    try {
        const [[usuario]] = await connection.promise().query('SELECT id_usuario, id_rol, foto FROM usuario WHERE id_usuario = ? LIMIT 1', [id]);
        if (usuario) estadoAvatar(usuario.id_usuario, usuario.foto, tipoPorRol(usuario.id_rol));
    } catch (error) {
        console.error('Avatar IA (foto nueva):', error.message);
    }
}

// Al arrancar el servidor se dejan listos los avatares del personal (docentes, psicología...)
// que tienen foto pero aún no tienen avatar, o lo tienen de una foto/estilo anterior.
// Así, al iniciar sesión, el banner de saludo ya muestra el avatar. Van en cola, de a uno.
export async function prepararAvataresPersonal() {
    try {
        if (!proveedorDeImagen()) return;
        const [usuarios] = await connection.promise().query(
            `SELECT id_usuario, id_rol, foto FROM usuario
             WHERE id_rol <> 8 AND LOWER(TRIM(estadi)) = 'activo' AND TRIM(COALESCE(foto, '')) <> ''`
        );
        const faltan = usuarios.filter((u) => avatarGuardado(u.id_usuario)?.huella !== huellaFoto(u.foto));
        if (faltan.length) console.log(`Avatar IA: preparando ${faltan.length} avatar(es) del personal`);
        faltan.forEach((u) => estadoAvatar(u.id_usuario, u.foto, tipoPorRol(u.id_rol)));
    } catch (error) {
        console.error('Avatar IA (preparar personal):', error.message);
    }
}
