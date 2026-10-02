import crypto from 'node:crypto';

// =========================================================
// CONTRASEÑAS CIFRADAS
// Se guardan con scrypt (incluido en Node.js) y una sal aleatoria
// por contraseña:  scrypt$<sal en hex>$<resultado en hex>
// Una contraseña cifrada NO se puede volver a leer: solo se puede
// comprobar si la que escribe el usuario es la misma.
// =========================================================

const PREFIJO = 'scrypt';
const LARGO_CLAVE = 64;

function scrypt(contrasena, sal) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(String(contrasena), sal, LARGO_CLAVE, (error, clave) => (error ? reject(error) : resolve(clave)));
    });
}

export function estaCifrada(valor) {
    return String(valor || '').startsWith(`${PREFIJO}$`);
}

export async function cifrarContrasena(contrasena) {
    const sal = crypto.randomBytes(16).toString('hex');
    const clave = await scrypt(contrasena, sal);
    return `${PREFIJO}$${sal}$${clave.toString('hex')}`;
}

// Devuelve { valida, debeCifrarse }.
// debeCifrarse = true cuando la contraseña guardada todavía estaba en texto plano
// (usuarios antiguos): quien la llame debe guardarla cifrada.
export async function verificarContrasena(contrasena, guardada) {
    const valor = String(guardada || '');

    if (!estaCifrada(valor)) {
        const a = Buffer.from(String(contrasena));
        const b = Buffer.from(valor);
        const valida = a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
        return { valida, debeCifrarse: valida };
    }

    const [, sal, claveHex] = valor.split('$');
    if (!sal || !claveHex) return { valida: false, debeCifrarse: false };

    const esperada = Buffer.from(claveHex, 'hex');
    const calculada = await scrypt(contrasena, sal);
    const valida = esperada.length === calculada.length && crypto.timingSafeEqual(esperada, calculada);
    return { valida, debeCifrarse: false };
}
