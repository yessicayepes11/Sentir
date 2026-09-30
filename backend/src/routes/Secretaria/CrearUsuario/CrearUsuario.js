import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { Router } from 'express';
import { connection } from '../../../config/mysql/dbmysql.js';

const router = Router();
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../../../uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

function normalizeFullName(fullName) {
    const cleanName = String(fullName || '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);

    if (!parts.length) {
        return { nombre: 'Sin', apellido: 'nombre' };
    }

    if (parts.length === 1) {
        return { nombre: parts[0], apellido: 'No especificado' };
    }

    return {
        nombre: parts[0],
        apellido: parts.slice(1).join(' ')
    };
}

function getSubmittedNameParts(payload) {
    const hasSplitNameFields = [
        'firstName',
        'secondName',
        'firstSurname',
        'secondSurname'
    ].some((field) => Object.prototype.hasOwnProperty.call(payload, field));

    if (!hasSplitNameFields) {
        const normalized = normalizeFullName(payload.name || '');
        const firstNameParts = normalized.nombre.split(/\s+/);
        const surnameParts = normalized.apellido.split(/\s+/);
        return {
            nombre: normalized.nombre,
            apellido: normalized.apellido,
            firstName: firstNameParts[0] || '',
            secondName: firstNameParts.slice(1).join(' '),
            firstSurname: surnameParts[0] || '',
            secondSurname: surnameParts.slice(1).join(' ')
        };
    }

    const firstName = String(payload.firstName || '').trim();
    const secondName = String(payload.secondName || '').trim();
    const firstSurname = String(payload.firstSurname || '').trim();
    const secondSurname = String(payload.secondSurname || '').trim();

    return {
        nombre: [firstName, secondName].filter(Boolean).join(' '),
        apellido: [firstSurname, secondSurname].filter(Boolean).join(' '),
        firstName,
        secondName,
        firstSurname,
        secondSurname
    };
}

function toDateInputValue(value) {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    return String(value || '').slice(0, 10);
}

async function getColumnNames() {
    const [columnRows] = await connection.promise().query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME IN ('documento', 'codigo_registro')"
    );

    return new Set(columnRows.map((column) => column.COLUMN_NAME));
}

router.get('/roles', async (req, res) => {
    try {
        const [rows] = await connection.promise().query(
            'SELECT id_rol, nombre, descripcion FROM rol ORDER BY nombre ASC'
        );

        return res.json({
            roles: rows.map((rol) => ({
                id_rol: rol.id_rol,
                nombre: rol.nombre,
                descripcion: rol.descripcion || ''
            }))
        });
    } catch (error) {
        console.error('Error al consultar roles:', error.message);
        return res.status(500).json({
            message: 'No se pudieron consultar los roles',
            error: error.message
        });
    }
});

router.get('/listar', async (req, res) => {
    try {
        const [rows] = await connection.promise().query(`
            SELECT
                u.id_usuario AS id,
                u.nombre,
                u.apellido,
                u.edad,
                u.correo AS email,
                u.contrasena AS password,
                u.fecha_nac AS birthDate,
                u.fecha_reg AS registrationDate,
                u.estadi AS status,
                u.foto,
                u.tipo_id AS documentType,
                u.celular AS phone,
                u.id_rol AS roleId,
                u.comite_convivencia AS committeeMember,
                r.nombre AS role
            FROM usuario u
            LEFT JOIN rol r ON r.id_rol = u.id_rol
            ORDER BY u.id_usuario DESC
        `);

        const usuarios = rows.map((usuario) => ({
            id: Number(usuario.id),
            firstName: String(usuario.nombre || '').trim().split(/\s+/)[0] || '',
            secondName: String(usuario.nombre || '').trim().split(/\s+/).slice(1).join(' '),
            firstSurname: String(usuario.apellido || '').trim().split(/\s+/)[0] || '',
            secondSurname: String(usuario.apellido || '').trim().split(/\s+/).slice(1).join(' '),
            name: `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre',
            document: String(usuario.id),
            age: Number(usuario.edad) || 0,
            email: usuario.email || '',
            phone: usuario.phone ? String(usuario.phone) : 'No disponible',
            password: usuario.password || '',
            documentType: usuario.documentType || 'Cédula',
            roleId: Number(usuario.roleId),
            committeeMember: Number(usuario.committeeMember) === 1,
            photo: usuario.foto ? (usuario.foto.startsWith('http') ? usuario.foto : `http://localhost:3000${usuario.foto}`) : '',
            role: usuario.role?.trim() || 'Sin rol',
            grade: '',
            groupDirector: '',
            directorGroup: '',
            status: usuario.status || 'Activo',
            registrationDate: usuario.registrationDate
                ? new Date(usuario.registrationDate).toISOString().slice(0, 10)
                : '',
            birthDate: usuario.birthDate ? new Date(usuario.birthDate).toISOString().slice(0, 10) : ''
        }));

        return res.json({ usuarios });
    } catch (error) {
        console.error('Error al consultar usuarios:', error.message);
        return res.status(500).json({
            message: 'No se pudieron consultar los usuarios',
            error: error.message
        });
    }
});

router.get('/perfil-administrador', async (_req, res) => {
    try {
        const [rows] = await connection.promise().query(`
            SELECT u.id_usuario AS id, u.nombre, u.apellido, u.correo AS email,
                   u.celular AS phone, u.foto AS photo, r.nombre AS role
            FROM usuario u
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE LOWER(TRIM(r.nombre)) IN ('rectora', 'rector')
            ORDER BY u.id_usuario ASC
            LIMIT 1
        `);

        if (!rows.length) {
            return res.status(404).json({ message: 'No se encontró el perfil administrador de Rectoría' });
        }

        const administrator = rows[0];
        return res.json({
            profile: {
                id: Number(administrator.id),
                name: `${administrator.nombre || ''} ${administrator.apellido || ''}`.trim(),
                email: administrator.email || '',
                phone: administrator.phone ? String(administrator.phone) : '',
                photo: administrator.photo
                    ? (administrator.photo.startsWith('http') ? administrator.photo : `http://localhost:3000${administrator.photo}`)
                    : '',
                role: administrator.role
            }
        });
    } catch (error) {
        console.error('Error al consultar perfil administrador:', error.message);
        return res.status(500).json({ message: 'No se pudo consultar el perfil administrador' });
    }
});

router.put('/perfil-administrador', upload.single('foto'), async (req, res) => {
    try {
        const payload = req.body || {};
        const currentPassword = String(payload.currentPassword || '');
        const newPassword = String(payload.newPassword || '');
        const email = String(payload.email || '').trim();
        const phone = Number(String(payload.phone || '').replace(/\D/g, '')) || 0;
        const { nombre, apellido } = normalizeFullName(payload.name || '');

        if (!currentPassword || !email || nombre === 'Sin') {
            return res.status(400).json({ message: 'Nombre, correo y contraseña actual son obligatorios' });
        }

        const [adminRows] = await connection.promise().query(`
            SELECT u.id_usuario, u.contrasena, u.foto
            FROM usuario u
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE LOWER(TRIM(r.nombre)) IN ('rectora', 'rector')
            ORDER BY u.id_usuario ASC
            LIMIT 1
        `);

        if (!adminRows.length) {
            return res.status(404).json({ message: 'No se encontró el perfil administrador de Rectoría' });
        }

        const administrator = adminRows[0];
        if (administrator.contrasena !== currentPassword) {
            return res.status(401).json({ message: 'La contraseña actual no es correcta' });
        }

        if (newPassword && !passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'La nueva contraseña debe tener 8+ caracteres, mayúsculas, números y un símbolo.'
            });
        }

        const [emailRows] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE correo = ? AND id_usuario <> ? LIMIT 1',
            [email, administrator.id_usuario]
        );

        if (emailRows.length) {
            return res.status(409).json({ message: 'Ese correo ya está asociado a otro usuario' });
        }

        const photo = req.file ? `/uploads/${req.file.filename}` : administrator.foto;
        if (photo && photo.length > 400) {
            return res.status(400).json({ message: 'La ruta de la foto supera el límite permitido' });
        }

        const values = [nombre, apellido, email, phone, photo || ''];
        let passwordSql = '';
        if (newPassword) {
            passwordSql = ', contrasena = ?';
            values.push(newPassword);
        }
        values.push(administrator.id_usuario);

        await connection.promise().query(
            `UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, celular = ?, foto = ?${passwordSql} WHERE id_usuario = ?`,
            values
        );

        return res.json({
            message: 'Perfil administrador actualizado correctamente',
            profile: {
                id: Number(administrator.id_usuario),
                name: `${nombre} ${apellido}`.trim(),
                email,
                phone: phone ? String(phone) : '',
                photo: photo
                    ? (photo.startsWith('http') ? photo : `http://localhost:3000${photo}`)
                    : ''
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil administrador:', error.message);
        return res.status(500).json({ message: 'No se pudo actualizar el perfil administrador' });
    }
});

router.put('/actualizar/:id', upload.single('foto'), async (req, res) => {
    try {
        const usuarioId = Number(req.params.id);
        const payload = req.body || {};
        const selectedRole = String(payload.role || '').trim();
        const email = String(payload.email || '').trim();
        const password = String(payload.password || '').trim();
        const birthDate = String(payload.birthDate || '').trim();
        const registrationDate = String(payload.registrationDate || '').trim();
        const requestedDocumentType = String(payload.documentType || '').trim();
        const committeeMember = payload.committeeMember === 'true' || payload.committeeMember === '1' ? 1 : 0;

        if (!Number.isInteger(usuarioId) || usuarioId < 1) {
            return res.status(400).json({ message: 'El identificador del usuario no es válido' });
        }

        if (!selectedRole || !email || !password) {
            return res.status(400).json({ message: 'Faltan datos obligatorios para actualizar el usuario' });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8+ caracteres, mayúsculas, números y un símbolo.'
            });
        }

        const { nombre, apellido } = getSubmittedNameParts(payload);
        if (!nombre || !apellido) {
            return res.status(400).json({ message: 'El primer nombre y el primer apellido son obligatorios' });
        }

        if (nombre.length > 100 || apellido.length > 100) {
            return res.status(400).json({ message: 'Los nombres y apellidos completos no pueden superar 100 caracteres cada uno' });
        }

        const [roleRows] = await connection.promise().query(
            'SELECT id_rol FROM rol WHERE TRIM(nombre) = ? LIMIT 1',
            [selectedRole]
        );

        if (!roleRows.length) {
            return res.status(404).json({ message: `No existe un rol llamado "${selectedRole}" en la base de datos` });
        }

        const [userRows] = await connection.promise().query(
            'SELECT id_usuario, foto, fecha_nac, fecha_reg, tipo_id FROM usuario WHERE id_usuario = ? LIMIT 1',
            [usuarioId]
        );

        if (!userRows.length) {
            return res.status(404).json({ message: 'No se encontró el usuario que deseas editar' });
        }

        const [emailRows] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE correo = ? AND id_usuario <> ? LIMIT 1',
            [email, usuarioId]
        );

        if (emailRows.length) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
        }

        const uploadedPhoto = req.file ? `/uploads/${req.file.filename}` : userRows[0].foto;
        if (uploadedPhoto && uploadedPhoto.length > 400) {
            return res.status(400).json({ message: 'La ruta de la foto supera el límite permitido por la base de datos' });
        }

        const effectiveBirthDate = birthDate || toDateInputValue(userRows[0].fecha_nac);
        const effectiveRegistrationDate = registrationDate || toDateInputValue(userRows[0].fecha_reg);
        const documentType = requestedDocumentType || userRows[0].tipo_id;
        const birth = new Date(`${effectiveBirthDate}T00:00:00`);
        if (Number.isNaN(birth.getTime())) {
            return res.status(400).json({ message: 'La fecha de nacimiento no es válida' });
        }

        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age -= 1;
        }

        const phone = Number(String(payload.phone || '').replace(/\D/g, '')) || 0;
        const status = String(payload.status || 'Activo').trim();

        await connection.promise().query(
            `UPDATE usuario
             SET nombre = ?, apellido = ?, edad = ?, correo = ?, contrasena = ?, fecha_nac = ?,
                 fecha_reg = ?, estadi = ?, foto = ?, tipo_id = ?, celular = ?, id_rol = ?, comite_convivencia = ?
             WHERE id_usuario = ?`,
            [
                nombre,
                apellido,
                age,
                email,
                password,
                effectiveBirthDate,
                effectiveRegistrationDate,
                status,
                uploadedPhoto || '',
                documentType,
                phone,
                roleRows[0].id_rol,
                committeeMember,
                usuarioId
            ]
        );

        return res.json({
            message: 'Usuario actualizado correctamente',
            usuario: {
                id_usuario: usuarioId,
                nombre,
                apellido,
                correo: email,
                id_rol: roleRows[0].id_rol,
                foto: uploadedPhoto || ''
            }
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error.message);
        return res.status(500).json({
            message: 'No se pudo actualizar el usuario',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    const usuarioId = Number(req.params.id);

    if (!Number.isInteger(usuarioId) || usuarioId < 1) {
        return res.status(400).json({ message: 'El identificador del usuario no es válido' });
    }

    try {
        const [result] = await connection.promise().query(
            'DELETE FROM usuario WHERE id_usuario = ?',
            [usuarioId]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'No se encontró el usuario que deseas eliminar' });
        }

        return res.json({ message: 'Usuario eliminado correctamente', id_usuario: usuarioId });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(409).json({
                message: 'No se puede eliminar este usuario porque tiene registros relacionados en el sistema'
            });
        }

        console.error('Error al eliminar usuario:', error.message);
        return res.status(500).json({
            message: 'No se pudo eliminar el usuario',
            error: error.message
        });
    }
});

router.post('/crear', upload.single('foto'), async (req, res) => {
    try {
        const payload = req.body || {};
        const documents = String(payload.document || '').trim();
        const selectedRole = String(payload.role || '').trim();
        const documentType = String(payload.documentType || '').trim() || 'Cédula';
        const email = String(payload.email || '').trim();
        const password = String(payload.password || '').trim();
        const status = String(payload.status || 'Activo').trim();
        const committeeMember = payload.committeeMember === 'true' || payload.committeeMember === '1' ? 1 : 0;

        if (!documents || !selectedRole || !email || !password) {
            return res.status(400).json({
                message: 'Faltan datos obligatorios para crear el usuario'
            });
        }

        if (!/^\d+$/.test(documents) || Number(documents) > 2147483647) {
            return res.status(400).json({
                message: 'El número de identificación debe ser numérico y no superar 2147483647'
            });
        }

        const usuarioId = Number(documents);

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8+ caracteres, mayúsculas, números y un símbolo.'
            });
        }

        const [roleRows] = await connection.promise().query(
            'SELECT id_rol FROM rol WHERE TRIM(nombre) = ? LIMIT 1',
            [selectedRole]
        );

        if (!roleRows.length) {
            return res.status(404).json({
                message: `No existe un rol llamado "${selectedRole}" en la base de datos`
            });
        }

        const existingColumns = await getColumnNames();

        const [documentRows] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1',
            [usuarioId]
        );

        if (documentRows.length) {
            return res.status(409).json({
                message: 'Ya existe un usuario con ese número de identificación'
            });
        }

        const [emailRows] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE correo = ? LIMIT 1',
            [email]
        );

        if (emailRows.length) {
            return res.status(409).json({
                message: 'Ya existe un usuario con ese correo'
            });
        }

        const { nombre, apellido } = getSubmittedNameParts(payload);
        if (!nombre || !apellido) {
            return res.status(400).json({ message: 'El primer nombre y el primer apellido son obligatorios' });
        }

        if (nombre.length > 100 || apellido.length > 100) {
            return res.status(400).json({ message: 'Los nombres y apellidos completos no pueden superar 100 caracteres cada uno' });
        }
        const uploadedPhoto = req.file ? `/uploads/${req.file.filename}` : String(payload.photo || '').trim();
        const fotoGuardada = uploadedPhoto.startsWith('/uploads/') && uploadedPhoto.length <= 400
            ? uploadedPhoto
            : '';
        const celular = Number(String(payload.phone || '').replace(/\D/g, '')) || 0;
        const fechaNac = payload.birthDate || '2000-01-01';
        const edad = (() => {
            if (!fechaNac || fechaNac === '2000-01-01') {
                return Number(payload.age || 0) || 0;
            }

            const birth = new Date(fechaNac);
            if (Number.isNaN(birth.getTime())) {
                return Number(payload.age || 0) || 0;
            }

            const today = new Date();
            let years = today.getFullYear() - birth.getFullYear();
            const monthDifference = today.getMonth() - birth.getMonth();

            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
                years -= 1;
            }

            return years;
        })();
        const fechaReg = payload.registrationDate || new Date().toISOString().slice(0, 10);
        const codigoRegistro = String(
            payload.codigoRegistro || payload.codigo || payload.code || `USR-${String(usuarioId).padStart(6, '0')}`
        ).trim() || `USR-${String(usuarioId).padStart(6, '0')}`;

        const insertColumns = [
            'id_usuario',
            'nombre',
            'apellido',
            'edad',
            'correo',
            'contrasena',
            'fecha_nac',
            'fecha_reg',
            'estadi',
            'foto',
            'tipo_id',
            'celular',
            'id_rol',
            'comite_convivencia'
        ];

        const insertValues = [
            usuarioId,
            nombre,
            apellido,
            edad,
            email,
            password,
            fechaNac,
            fechaReg,
            status,
            fotoGuardada,
            documentType,
            celular,
            roleRows[0].id_rol,
            committeeMember
        ];

        if (existingColumns.has('documento')) {
            insertColumns.push('documento');
            insertValues.push(documents);
        }

        if (existingColumns.has('codigo_registro')) {
            insertColumns.push('codigo_registro');
            insertValues.push(codigoRegistro);
        }

        await connection.promise().query(
            `INSERT INTO usuario (${insertColumns.join(', ')}) VALUES (${insertColumns.map(() => '?').join(', ')})`,
            insertValues
        );

        return res.status(201).json({
            message: 'Usuario registrado correctamente',
            usuario: {
                id_usuario: usuarioId,
                codigo_registro: existingColumns.has('codigo_registro') ? codigoRegistro : null,
                documento: documents,
                nombre,
                apellido,
                correo: email,
                id_rol: roleRows[0].id_rol,
                foto: fotoGuardada
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        return res.status(500).json({
            message: 'No se pudo crear el usuario',
            error: error.message
        });
    }
});

export default router;
