// =========================================================
// ESTUDIANTES DE DEMOSTRACIÓN para los grupos de la profesora Mónica
// (6-1, 8-3, 9-3, 9-4 y 10-1): 10 por grupo, con acudiente y foto.
//
// - Las personas son FICTICIAS: nombres, documentos y teléfonos inventados.
// - Las fotos son retratos generados con IA (Pollinations, POLLINATIONS_KEY del .env):
//   no son fotos de menores reales.
// - Los correos usan el dominio reservado .test: nunca se entregan, así que los
//   recordatorios automáticos no le llegan a nadie.
// - Clave de ingreso de todos: Sentir2026*
// - Lo creado queda anotado en scripts/estudiantesDemo.json (ids exactos).
//
// Uso (desde la carpeta backend):
//   node scripts/sembrarEstudiantesDemo.mjs           crea los que falten (con la foto si ya existe)
//   node scripts/sembrarEstudiantesDemo.mjs --fotos   genera los retratos que falten
//   node scripts/sembrarEstudiantesDemo.mjs --borrar  borra SOLO lo anotado en el JSON
// =========================================================

import '../src/config/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connection } from '../src/config/mysql/dbmysql.js';
import { cifrarContrasena } from '../src/config/contrasenas.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS = path.join(aqui, '../uploads');
const MANIFIESTO = path.join(aqui, 'estudiantesDemo.json');
const CLAVE = 'Sentir2026*';
const db = connection.promise();

// Grupo -> años de nacimiento posibles (edad acorde al grado en 2026)
const GRUPOS = {
    '6-1': [2014, 2015],
    '8-3': [2012, 2013],
    '9-3': [2011, 2012],
    '9-4': [2011, 2012],
    '10-1': [2010, 2011]
};

const NOMBRES_F = ['Valentina', 'Sofía', 'Isabella', 'Mariana', 'Luciana', 'Salomé', 'Gabriela', 'Daniela', 'Sara',
    'Antonella', 'María José', 'Juliana', 'Manuela', 'Valeria', 'Camila', 'Emilia', 'Ana Sofía', 'Laura Sofía',
    'Mía', 'Isabela', 'Natalia', 'Paula Andrea', 'Allison', 'Luisa Fernanda', 'Samantha'];
const NOMBRES_M = ['Santiago', 'Samuel', 'Matías', 'Sebastián', 'Juan José', 'Emiliano', 'Tomás', 'Jerónimo', 'Martín',
    'Alejandro', 'Juan Pablo', 'Nicolás', 'Daniel', 'David', 'Miguel Ángel', 'Simón', 'Felipe', 'Juan Esteban',
    'Maximiliano', 'Thiago', 'Andrés Felipe', 'Esteban', 'Mateo', 'Jacobo', 'Kevin'];
const APELLIDOS = ['Restrepo', 'Gómez', 'Ospina', 'Zapata', 'Arango', 'Montoya', 'Vélez', 'Henao', 'Cardona', 'Giraldo',
    'Londoño', 'Mejía', 'Correa', 'Muñoz', 'Álvarez', 'Castaño', 'Echeverri', 'Patiño', 'Quintero', 'Valencia',
    'Rendón', 'Agudelo', 'Bedoya', 'Úsuga', 'Mosquera', 'Palacios', 'Rivas', 'Córdoba', 'Hincapié', 'Jaramillo'];
const NOMBRES_ACUDIENTE = {
    Madre: ['Claudia', 'Paola', 'Diana', 'Sandra', 'Liliana', 'Marcela', 'Adriana', 'Yuliana', 'Catalina', 'Natalia'],
    Padre: ['Jorge', 'Carlos', 'Luis', 'Andrés', 'John', 'Wilson', 'Mauricio', 'Diego', 'Fredy', 'Hernán'],
    Abuela: ['Rosa', 'Gloria', 'Amparo', 'Luz Marina', 'Fabiola'],
    Tía: ['Beatriz', 'Mónica', 'Yolanda', 'Patricia', 'Lina']
};
const OCUPACIONES = ['Comerciante', 'Docente', 'Enfermera', 'Conductor', 'Auxiliar contable', 'Ama de casa', 'Agricultor',
    'Operario', 'Estilista', 'Vendedor', 'Mecánico', 'Secretaria', 'Independiente', 'Guía turístico', 'Cocinera'];

// Rasgos variados para los retratos (diversidad de la región)
const PIEL = ['light skin', 'light olive skin', 'tan skin', 'medium brown skin', 'dark brown skin', 'olive skin'];
const PELO_F = ['long straight black hair', 'long wavy brown hair in a ponytail', 'curly dark hair tied back', 'shoulder-length straight brown hair',
    'long dark hair in a braid', 'curly black hair with a headband', 'light brown hair in a low ponytail'];
const PELO_M = ['short black hair', 'short wavy brown hair', 'short curly black hair', 'buzz cut dark hair', 'short straight brown hair with bangs',
    'short dark hair neatly combed'];

// Generador pseudoaleatorio con semilla: siempre salen los mismos datos
let semilla = 20261008;
const azar = () => ((semilla = (semilla * 1664525 + 1013904223) % 4294967296) / 4294967296);
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ñ/g, 'n');

function leerManifiesto() {
    try { return JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8')); } catch { return { creados: [] }; }
}

function edadEn(fechaNac, hoy = new Date()) {
    const n = new Date(`${fechaNac}T12:00:00`);
    let edad = hoy.getFullYear() - n.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), n.getMonth(), n.getDate())) edad -= 1;
    return edad;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
// Con saldo en la cuenta se usa gen.pollinations.ai (con clave); si se acaba, el servicio
// público gratuito (de a una imagen, con marca de agua pequeña en una esquina)
let usarGratis = !process.env.POLLINATIONS_KEY;

async function generarFoto(est) {
    // Si ya se generó en una corrida anterior, se reutiliza
    const previa = fs.readdirSync(UPLOADS).find((f) => f.endsWith(`-estudiante-demo-${est.id}.jpg`));
    if (previa) return `/uploads/${previa}`;

    const genero = est.genero === 'F' ? 'girl' : 'boy';
    const prompt = encodeURIComponent(`realistic school ID portrait photo of a smiling ${est.edad} year old Colombian ${genero}, ${est.piel}, ${est.pelo}, `
        + 'wearing a white school uniform polo shirt, plain light gray background, head and shoulders, centered, natural soft light, sharp focus, photorealistic');
    for (let intento = 1; intento <= 6; intento++) {
        try {
            const r = usarGratis
                ? await fetch(`https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&seed=${est.seed}&nologo=true`, { signal: AbortSignal.timeout(120000) })
                : await fetch(`https://gen.pollinations.ai/image/${prompt}?model=flux&width=512&height=512&seed=${est.seed}&nologo=true`,
                    { headers: { Authorization: `Bearer ${process.env.POLLINATIONS_KEY}` }, signal: AbortSignal.timeout(120000) });
            if (!r.ok) {
                const texto = await r.text().catch(() => '');
                if (!usarGratis && r.status === 402) { usarGratis = true; console.warn('  sin saldo en Pollinations: se usa el servicio gratuito'); intento--; continue; }
                throw new Error(`HTTP ${r.status} ${texto.slice(0, 80)}`);
            }
            const datos = Buffer.from(await r.arrayBuffer());
            if (datos.length < 5000) throw new Error('imagen vacía');
            const nombre = `${Date.now()}-estudiante-demo-${est.id}.jpg`;
            fs.writeFileSync(path.join(UPLOADS, nombre), datos);
            return `/uploads/${nombre}`;
        } catch (error) {
            console.warn(`  foto de ${est.nombre} (intento ${intento}): ${error.message}`);
            await esperar(intento * 10000);   // el servicio gratuito limita las peticiones seguidas
        }
    }
    return '';
}

function planificar() {
    const usados = new Set();
    const lista = [];
    let n = 0;
    for (const [grupo, anos] of Object.entries(GRUPOS)) {
        for (let i = 0; i < 10; i++) {
            n += 1;
            const genero = i % 2 === 0 ? 'F' : 'M';
            let nombre, apellidos;
            do {
                nombre = elegir(genero === 'F' ? NOMBRES_F : NOMBRES_M);
                apellidos = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`;
            } while (usados.has(`${nombre} ${apellidos}`) || apellidos.split(' ')[0] === apellidos.split(' ')[1]);
            usados.add(`${nombre} ${apellidos}`);

            const ano = elegir(anos);
            const mes = 1 + Math.floor(azar() * 12);
            const dia = 1 + Math.floor(azar() * 28);
            const fechaNac = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

            const parentesco = elegir(['Madre', 'Madre', 'Madre', 'Padre', 'Padre', 'Abuela', 'Tía']);
            const apellidoAcudiente = parentesco === 'Padre' ? apellidos.split(' ')[0]
                : parentesco === 'Madre' ? apellidos.split(' ')[1] : elegir(APELLIDOS);

            lista.push({
                id: 1099100000 + n,                 // tarjeta de identidad ficticia
                idAcudiente: 9900100000 + n,        // cédula ficticia
                grupo, genero, nombre, apellidos, fechaNac,
                edad: edadEn(fechaNac),
                correo: `${sinTildes(nombre).replace(/ /g, '')}.${sinTildes(apellidos.split(' ')[0])}${n}@iesantaelena.test`,
                celular: 3001000000 + n * 137,
                piel: elegir(PIEL),
                pelo: elegir(genero === 'F' ? PELO_F : PELO_M),
                seed: 5000 + n,
                acudiente: {
                    parentesco,
                    nombre: elegir(NOMBRES_ACUDIENTE[parentesco]),
                    apellido: `${apellidoAcudiente} ${elegir(APELLIDOS)}`.slice(0, 20),
                    ocupacion: elegir(OCUPACIONES),
                    celular: 3101000000 + n * 211
                }
            });
        }
    }
    return lista;
}

async function sembrar() {
    const manifiesto = leerManifiesto();
    const plan = planificar();
    const clave = await cifrarContrasena(CLAVE);

    const pendientes = [];
    for (const est of plan) {
        const [[existe]] = await db.query('SELECT id_usuario FROM usuario WHERE id_usuario = ?', [est.id]);
        if (existe) { console.log(`Ya existe ${est.id} (${est.nombre}), se omite`); continue; }
        pendientes.push(est);
    }
    // Los estudiantes se crean ya; si su retrato aún no existe quedan sin foto
    // y se completan después con --fotos (la generación puede tardar o quedarse sin saldo)
    for (const est of pendientes) {
        const previa = fs.readdirSync(UPLOADS).find((f) => f.endsWith(`-estudiante-demo-${est.id}.jpg`));
        est.foto = previa ? `/uploads/${previa}` : '';
    }

    for (const est of pendientes) {
        const conexion = db;   // una sola conexión (la de la app)
        try {
            await conexion.beginTransaction();
            await conexion.query(
                `INSERT INTO acudiente (id_acudiente, parentesco, ocupacion, nombre, apellido, correo, celular, tipo_documento, id_estudiante)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'Cédula', NULL)`,
                [est.idAcudiente, est.acudiente.parentesco, est.acudiente.ocupacion, est.acudiente.nombre, est.acudiente.apellido,
                    `${sinTildes(est.acudiente.nombre).replace(/ /g, '')}.${sinTildes(est.acudiente.apellido.split(' ')[0])}@familia.test`,
                    est.acudiente.celular]
            );
            await conexion.query(
                `INSERT INTO usuario (id_usuario, nombre, apellido, edad, correo, contrasena, fecha_nac, estadi, foto, tipo_id, celular, id_rol, comite_convivencia)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'Activo', ?, 'Tarjeta de identidad', ?, 8, 0)`,
                [est.id, est.nombre.toLowerCase(), est.apellidos.toLowerCase(), est.edad, est.correo, clave, est.fechaNac,
                    est.foto, est.celular]
            );
            const [[{ siguiente }]] = await conexion.query('SELECT COALESCE(MAX(id_estudiante), 0) + 1 AS siguiente FROM estudiante FOR UPDATE');
            await conexion.query(
                `INSERT INTO estudiante (id_estudiante, id_usuario, grado, diagnostico, nombre_diagnostico, id_acudiente, descripcion_diagnostico)
                 VALUES (?, ?, ?, 0, '', ?, '')`,
                [siguiente, est.id, est.grupo, est.idAcudiente]
            );
            await conexion.commit();
            manifiesto.creados.push({ idUsuario: est.id, idEstudiante: siguiente, idAcudiente: est.idAcudiente, foto: est.foto, grupo: est.grupo });
            fs.writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2));
            console.log(`✓ ${est.grupo}  ${est.nombre} ${est.apellidos} (${est.edad} años)${est.foto ? '' : '  [sin foto]'}`);
        } catch (error) {
            await conexion.rollback().catch(() => {});
            console.error(`✗ ${est.nombre} ${est.apellidos}: ${error.message}`);
        }
    }
}

// Genera los retratos que faltan (solo para estudiantes de la demo que siguen sin foto).
// Se detiene si el servicio falla 3 veces seguidas (sin saldo o limitado): se puede repetir más tarde.
async function completarFotos() {
    const manifiesto = leerManifiesto();
    const plan = new Map(planificar().map((e) => [e.id, e]));
    const ids = manifiesto.creados.map((c) => c.idUsuario);
    if (!ids.length) return console.log('No hay estudiantes de la demo.');
    const [sinFoto] = await db.query("SELECT id_usuario FROM usuario WHERE id_usuario IN (?) AND TRIM(foto) = ''", [ids]);
    console.log(`Faltan ${sinFoto.length} retratos.`);
    let fallosSeguidos = 0;
    for (const [i, fila] of sinFoto.entries()) {
        const est = plan.get(Number(fila.id_usuario));
        if (!est) continue;
        const foto = await generarFoto(est);
        if (!foto) {
            if (++fallosSeguidos >= 3) { console.log('El servicio de imágenes no responde; vuelve a intentarlo más tarde con --fotos.'); break; }
            continue;
        }
        fallosSeguidos = 0;
        await db.query("UPDATE usuario SET foto = ? WHERE id_usuario = ? AND TRIM(foto) = ''", [foto, est.id]);
        const c = manifiesto.creados.find((x) => x.idUsuario === est.id);
        if (c) c.foto = foto;
        fs.writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2));
        console.log(`  ${i + 1} / ${sinFoto.length}  ${est.nombre} ${est.apellidos}`);
        if (usarGratis) await esperar(4000);
    }
}

async function borrar() {
    const manifiesto = leerManifiesto();
    for (const c of manifiesto.creados) {
        await db.query('DELETE FROM estudiante WHERE id_estudiante = ? AND id_usuario = ?', [c.idEstudiante, c.idUsuario]);
        await db.query('DELETE FROM usuario WHERE id_usuario = ? AND id_rol = 8', [c.idUsuario]);
        await db.query('DELETE FROM acudiente WHERE id_acudiente = ?', [c.idAcudiente]);
        if (c.foto) fs.rmSync(path.join(UPLOADS, path.basename(c.foto)), { force: true });
        console.log(`Borrado ${c.idUsuario}`);
    }
    fs.writeFileSync(MANIFIESTO, JSON.stringify({ creados: [] }, null, 2));
}

try {
    if (process.argv.includes('--borrar')) await borrar();
    else if (process.argv.includes('--fotos')) await completarFotos();
    else await sembrar();
} finally {
    connection.end?.();
}
