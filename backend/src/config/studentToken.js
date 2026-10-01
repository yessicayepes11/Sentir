import crypto from 'node:crypto';

// Token firmado que se entrega al estudiante cuando ingresa a "Mi espacio personal".
// Sirve para saber, sin confiar en el navegador, qué estudiante está guardando su diario.

const DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas

// Si no hay SESSION_SECRET en el .env se usa uno aleatorio: funciona, pero al
// reiniciar el servidor los estudiantes tendrán que volver a ingresar.
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function firmar(texto) {
    return crypto.createHmac('sha256', SECRET).update(texto).digest('base64url');
}

export function crearTokenEstudiante(idUsuario) {
    const payload = Buffer.from(JSON.stringify({
        id: String(idUsuario),
        exp: Date.now() + DURACION_MS
    })).toString('base64url');

    return `${payload}.${firmar(payload)}`;
}

// Devuelve el id_usuario del token, o null si es inválido o ya venció
export function leerTokenEstudiante(token) {
    const [payload, firma] = String(token || '').split('.');
    if (!payload || !firma) return null;

    const esperada = firmar(payload);
    if (firma.length !== esperada.length ||
        !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) {
        return null;
    }

    try {
        const datos = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return datos.exp > Date.now() ? datos.id : null;
    } catch {
        return null;
    }
}

export function crearTokenDocente(idUsuario) {
    const payload = Buffer.from(JSON.stringify({
        id: String(idUsuario),
        rol: 'docente',
        exp: Date.now() + DURACION_MS
    })).toString('base64url');

    return `${payload}.${firmar(payload)}`;
}

export function leerTokenDocente(token) {
    const [payload, firma] = String(token || '').split('.');
    if (!payload || !firma) return null;

    const esperada = firmar(payload);
    if (firma.length !== esperada.length ||
        !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) {
        return null;
    }

    try {
        const datos = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return datos.rol === 'docente' && datos.exp > Date.now() ? datos.id : null;
    } catch {
        return null;
    }
}
