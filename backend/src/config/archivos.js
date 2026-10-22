import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connection } from './mysql/dbmysql.js';

// =========================================================
// COPIA DE LOS ARCHIVOS SUBIDOS EN MYSQL
// En Render el disco se borra en cada despliegue o reinicio, así que las fotos de
// perfil, los avatares IA y los archivos de actividades se guardan también en la
// tabla archivo_subido. Al arrancar, los que falten en /uploads se vuelven a escribir
// desde la base de datos (y los que solo estén en el disco se suben a ella).
// La "ruta" es relativa a /uploads: "foto.jpg" o "avatares/usuario-1-....png".
// =========================================================

export const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const TIPOS = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
    '.avif': 'image/avif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf'
};
const tipoDe = (ruta) => TIPOS[path.extname(ruta).toLowerCase()] || 'application/octet-stream';
const rutaRelativa = (absoluta) => path.relative(uploadsDir, absoluta).split(path.sep).join('/');

let tablaLista = null;
function crearTabla() {
    tablaLista ??= connection.promise().query(`CREATE TABLE IF NOT EXISTS archivo_subido (
        ruta VARCHAR(255) NOT NULL PRIMARY KEY,
        tipo VARCHAR(100) NOT NULL,
        datos LONGBLOB NOT NULL,
        creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).catch((error) => { tablaLista = null; throw error; });
    return tablaLista;
}

// Guarda (o reemplaza) un archivo de /uploads en la base de datos. Nunca lanza errores.
export async function respaldarArchivo(absoluta, datos) {
    try {
        await crearTabla();
        const ruta = rutaRelativa(absoluta);
        await connection.promise().query(
            'REPLACE INTO archivo_subido (ruta, tipo, datos) VALUES (?, ?, ?)',
            [ruta, tipoDe(ruta), datos || fs.readFileSync(absoluta)]
        );
    } catch (error) {
        console.error('Archivos (respaldo):', error.message);
    }
}

export async function borrarRespaldo(absolutas) {
    try {
        if (!absolutas.length) return;
        await crearTabla();
        await connection.promise().query('DELETE FROM archivo_subido WHERE ruta IN (?)', [absolutas.map(rutaRelativa)]);
    } catch (error) {
        console.error('Archivos (borrar):', error.message);
    }
}

// Si el archivo no está en el disco pero sí en la base de datos, se vuelve a escribir. Devuelve si existe.
export async function asegurarArchivo(absoluta) {
    if (fs.existsSync(absoluta)) return true;
    if (!absoluta.startsWith(uploadsDir + path.sep)) return false;
    try {
        await crearTabla();
        const [[fila]] = await connection.promise().query('SELECT datos FROM archivo_subido WHERE ruta = ?', [rutaRelativa(absoluta)]);
        if (!fila) return false;
        fs.mkdirSync(path.dirname(absoluta), { recursive: true });
        fs.writeFileSync(absoluta, fila.datos);
        return true;
    } catch (error) {
        console.error('Archivos (recuperar):', error.message);
        return false;
    }
}

// Middleware para /uploads: recupera desde MySQL el archivo pedido antes de que express.static lo busque
export async function recuperarSubida(req, res, next) {
    try {
        await asegurarArchivo(path.join(uploadsDir, ...decodeURIComponent(req.path).split('/').filter(Boolean)));
    } catch {
        // ruta mal formada: express.static responde 404
    }
    next();
}

// Middleware global: cuando una petición con archivo (multer) termina bien, el archivo se respalda
export function respaldarSubidas(req, res, next) {
    res.on('finish', () => {
        if (res.statusCode >= 400) return;
        const archivos = [req.file, ...(Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat())];
        archivos.filter((f) => f?.path && fs.existsSync(f.path)).forEach((f) => respaldarArchivo(f.path));
    });
    next();
}

function archivosEnDisco(carpeta = uploadsDir) {
    if (!fs.existsSync(carpeta)) return [];
    return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
        const absoluta = path.join(carpeta, e.name);
        if (e.isDirectory()) return archivosEnDisco(absoluta);
        return e.name === '.gitkeep' ? [] : [absoluta];
    });
}

// Al arrancar: base de datos -> disco (lo que falte) y disco -> base de datos (lo que falte)
export async function sincronizarArchivos() {
    try {
        await crearTabla();
        const [filas] = await connection.promise().query('SELECT ruta FROM archivo_subido');
        const enBase = new Set(filas.map((f) => f.ruta));
        let restaurados = 0;
        for (const ruta of enBase) {
            const destino = path.join(uploadsDir, ...ruta.split('/'));
            if (!destino.startsWith(uploadsDir) || fs.existsSync(destino)) continue;
            const [[fila]] = await connection.promise().query('SELECT datos FROM archivo_subido WHERE ruta = ?', [ruta]);
            if (!fila) continue;
            fs.mkdirSync(path.dirname(destino), { recursive: true });
            fs.writeFileSync(destino, fila.datos);
            restaurados++;
        }
        const soloEnDisco = archivosEnDisco().filter((a) => !enBase.has(rutaRelativa(a)));
        for (const absoluta of soloEnDisco) await respaldarArchivo(absoluta);
        if (restaurados || soloEnDisco.length) console.log(`Archivos: ${restaurados} restaurado(s) desde MySQL, ${soloEnDisco.length} respaldado(s) en MySQL`);
    } catch (error) {
        console.error('Archivos (sincronizar):', error.message);
    }
}
