import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenEstudiante } from '../../config/studentToken.js';

// Perfil del estudiante en "Mi espacio personal": ver y editar sus datos y los de su acudiente.
// Quién es el estudiante sale SIEMPRE del token firmado del inicio de sesión.

const router = Router();

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
            cb(null, `${Date.now()}-perfil-estudiante${extension || '.jpg'}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (valor, max) => String(valor ?? '').trim().slice(0, max);
const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

function idDesdeToken(req) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    return leerTokenEstudiante(token);
}

function fotoPublica(foto) {
    const valor = String(foto || '').trim();
    if (!valor) return '';
    return valor.startsWith('http') ? valor : `http://localhost:3001${valor}`;
}

function edadDesde(fechaNacimiento) {
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumple = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
    if (hoy < cumple) edad -= 1;
    return edad;
}

async function leerPerfil(idUsuario) {
    const [usuarios] = await connection.promise().query(
        `SELECT u.id_usuario, u.nombre, u.apellido, u.edad, u.correo, u.celular, u.tipo_id, u.foto, u.estadi,
                DATE_FORMAT(u.fecha_nac, '%Y-%m-%d') AS fecha_nac, r.nombre AS rol
         FROM usuario u LEFT JOIN rol r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = ? LIMIT 1`,
        [idUsuario]
    );

    if (!usuarios.length) return null;
    const usuario = usuarios[0];

    const [fichas] = await connection.promise().query(
        `SELECT e.grado, e.diagnostico, e.nombre_diagnostico,
                a.id_acudiente, a.tipo_documento, a.nombre, a.apellido, a.parentesco, a.ocupacion, a.correo, a.celular
         FROM estudiante e LEFT JOIN acudiente a ON a.id_acudiente = e.id_acudiente
         WHERE e.id_usuario = ? LIMIT 1`,
        [idUsuario]
    );
    const ficha = fichas[0];

    return {
        usuario: {
            id_usuario: usuario.id_usuario,
            tipo_id: usuario.tipo_id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            celular: usuario.celular ? String(usuario.celular) : '',
            fecha_nac: usuario.fecha_nac,
            edad: usuario.edad,
            rol: usuario.rol,
            estado: usuario.estadi,
            foto: fotoPublica(usuario.foto)
        },
        estudiante: ficha ? {
            grado: ficha.grado,
            diagnostico: ficha.diagnostico ? (ficha.nombre_diagnostico || 'Sí') : 'No'
        } : null,
        acudiente: ficha && ficha.id_acudiente ? {
            id_acudiente: ficha.id_acudiente,
            tipo_documento: ficha.tipo_documento,
            nombre: ficha.nombre,
            apellido: ficha.apellido,
            parentesco: ficha.parentesco,
            ocupacion: ficha.ocupacion,
            correo: ficha.correo,
            celular: ficha.celular ? String(ficha.celular) : ''
        } : null
    };
}

router.get('/perfil', async (req, res) => {
    try {
        const idUsuario = idDesdeToken(req);
        if (!idUsuario) {
            return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        }

        const perfil = await leerPerfil(idUsuario);
        if (!perfil) {
            return res.status(404).json({ message: 'No se encontró tu usuario.' });
        }

        return res.json(perfil);
    } catch (error) {
        console.error('Error al leer el perfil del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu perfil.' });
    }
});

router.put('/perfil', upload.single('foto'), async (req, res) => {
    const db = connection.promise();
    let transaccion = false;

    try {
        const idUsuario = idDesdeToken(req);
        if (!idUsuario) {
            return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
        }

        const body = req.body || {};

        // ---- Datos del estudiante ----
        const nombre = texto(body.nombre, 100);
        const apellido = texto(body.apellido, 100);
        const correo = texto(body.correo, 150).toLowerCase();
        const celular = soloDigitos(body.celular);
        const fechaNac = texto(body.fecha_nac, 10);

        if (!nombre || !apellido) {
            return res.status(400).json({ message: 'Escribe tu nombre y tu apellido.' });
        }
        if (!emailRegex.test(correo)) {
            return res.status(400).json({ message: 'Escribe un correo válido.' });
        }
        if (celular.length < 7 || celular.length > 15) {
            return res.status(400).json({ message: 'Escribe un número de celular válido.' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNac) || Number.isNaN(new Date(fechaNac).getTime()) || new Date(fechaNac) > new Date()) {
            return res.status(400).json({ message: 'Escribe una fecha de nacimiento válida.' });
        }

        const [correoOcupado] = await db.query(
            'SELECT id_usuario FROM usuario WHERE LOWER(correo) = ? AND id_usuario <> ? LIMIT 1',
            [correo, idUsuario]
        );
        if (correoOcupado.length) {
            return res.status(409).json({ message: 'Ese correo ya lo usa otro usuario.' });
        }

        // ---- Datos del acudiente (solo si el estudiante tiene ficha con acudiente) ----
        const [fichas] = await db.query(
            'SELECT id_acudiente FROM estudiante WHERE id_usuario = ? LIMIT 1',
            [idUsuario]
        );
        const idAcudiente = fichas[0]?.id_acudiente;
        let acudiente = null;

        if (idAcudiente) {
            acudiente = {
                tipo_documento: texto(body.acudiente_tipo_documento, 20),
                nombre: texto(body.acudiente_nombre, 20),
                apellido: texto(body.acudiente_apellido, 20),
                parentesco: texto(body.acudiente_parentesco, 200),
                ocupacion: texto(body.acudiente_ocupacion, 200),
                correo: texto(body.acudiente_correo, 100).toLowerCase(),
                celular: soloDigitos(body.acudiente_celular)
            };

            if (!acudiente.nombre || !acudiente.apellido) {
                return res.status(400).json({ message: 'Escribe el nombre y el apellido del acudiente.' });
            }
            if (!acudiente.parentesco) {
                return res.status(400).json({ message: 'Escribe el parentesco del acudiente.' });
            }
            if (!emailRegex.test(acudiente.correo)) {
                return res.status(400).json({ message: 'Escribe un correo válido para el acudiente.' });
            }
            if (acudiente.celular.length < 7 || acudiente.celular.length > 15) {
                return res.status(400).json({ message: 'Escribe un celular válido para el acudiente.' });
            }
        }

        // ---- Guardar todo junto ----
        await db.beginTransaction();
        transaccion = true;

        const campos = ['nombre = ?', 'apellido = ?', 'correo = ?', 'celular = ?', 'fecha_nac = ?', 'edad = ?'];
        const valores = [nombre, apellido, correo, Number(celular), fechaNac, edadDesde(fechaNac)];

        if (req.file) {
            campos.push('foto = ?');
            valores.push(`/uploads/${req.file.filename}`);
        }

        valores.push(idUsuario);
        await db.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = ?`, valores);

        if (acudiente) {
            await db.query(
                `UPDATE acudiente SET tipo_documento = ?, nombre = ?, apellido = ?, parentesco = ?,
                        ocupacion = ?, correo = ?, celular = ?
                 WHERE id_acudiente = ?`,
                [acudiente.tipo_documento, acudiente.nombre, acudiente.apellido, acudiente.parentesco,
                    acudiente.ocupacion, acudiente.correo, Number(acudiente.celular), idAcudiente]
            );
        }

        await db.commit();
        transaccion = false;

        return res.json({ message: 'Tu perfil se actualizó', perfil: await leerPerfil(idUsuario) });
    } catch (error) {
        if (transaccion) await db.rollback().catch(() => {});
        console.error('Error al actualizar el perfil del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar tu perfil. Inténtalo de nuevo.' });
    }
});

export default router;
