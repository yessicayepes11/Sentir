import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { Router } from 'express';
import { connection } from '../../../config/mysql/dbmysql.js';
import { leerTokenDocente } from '../../../config/studentToken.js';
import { cifrarContrasena } from '../../../config/contrasenas.js';

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

function getTeacherData(role, payload) {
    if (String(role || '').trim().toLowerCase() !== 'docente') {
        return null;
    }

    const anoCursadoValue = String(payload.anoCursado ?? '').trim();
    const anoCursado = anoCursadoValue ? Number(anoCursadoValue) : null;
    const directorGrupo = String(payload.directorGrupo ?? '');
    const gradoNumero = String(payload.gradoNumero ?? '').trim();
    // El grupo es un número: 9-1, 10-2...
    const gradoLetra = String(payload.gradoLetra ?? '').trim();
    let teachingGrades = [];

    try {
        const submittedGrades = typeof payload.teachingGrades === 'string'
            ? JSON.parse(payload.teachingGrades)
            : payload.teachingGrades;
        teachingGrades = Array.isArray(submittedGrades)
            ? submittedGrades.map((grade) => String(grade).trim().toLocaleUpperCase('es'))
            : [];
    } catch {
        throw new Error('La lista de grados que enseña no tiene un formato válido');
    }

    if (anoCursado !== null && (!Number.isInteger(anoCursado) || anoCursado < 1900 || anoCursado > 2200)) {
        throw new Error('Ingresa un año cursado válido');
    }

    if (directorGrupo && !['0', '1'].includes(directorGrupo)) {
        throw new Error('Selecciona una opción válida para director de grupo');
    }

    if ((gradoNumero || gradoLetra) && (!/^\d{1,2}$/.test(gradoNumero) || !/^[1-9]\d?$/.test(gradoLetra))) {
        throw new Error('Completa el grado y el número del grupo, o deja ambos vacíos');
    }

    const gradoAsignado = gradoNumero && gradoLetra ? `${gradoNumero}-${gradoLetra}` : null;
    if (!['0', '1'].includes(directorGrupo)) {
        throw new Error('Indica si es director de grupo');
    }
    if (directorGrupo === '1' && (!/^\d{1,2}$/.test(gradoNumero) || !/^[1-9]\d?$/.test(gradoLetra))) {
        throw new Error('Completa el grado y el número del grupo que dirige');
    }
    if (!teachingGrades.length || teachingGrades.some((grade) => !/^\d{1,2}-[1-9]\d?$/.test(grade))) {
        throw new Error('Añade al menos un grado válido que enseñe el docente');
    }
    if (new Set(teachingGrades).size !== teachingGrades.length) {
        throw new Error('No repitas grados en la lista');
    }

    return {
        anoCursado,
        directorGrupo: directorGrupo ? Number(directorGrupo) : null,
        gradoAsignado: directorGrupo === '1' ? gradoAsignado : null,
        teachingGrades
    };
}

async function saveTeacherData(userId, teacherData) {
    if (!teacherData) {
        await connection.promise().query('DELETE FROM docente WHERE id_usuario = ?', [userId]);
        return;
    }

    const [existingRows] = await connection.promise().query(
        'SELECT id_docente FROM docente WHERE id_usuario = ? LIMIT 1',
        [userId]
    );

    let teacherId;
    if (existingRows.length) {
        teacherId = existingRows[0].id_docente;
        await connection.promise().query(
            'UPDATE docente SET ano_cursado = ?, director_grupo = ?, grado_asignado = ? WHERE id_usuario = ?',
            [teacherData.anoCursado, teacherData.directorGrupo, teacherData.gradoAsignado, userId]
        );
    } else {
        const [idRows] = await connection.promise().query(
            'SELECT COALESCE(MAX(id_docente), 0) + 1 AS nextId FROM docente'
        );
        teacherId = idRows[0].nextId;
        await connection.promise().query(
            'INSERT INTO docente (id_docente, id_usuario, ano_cursado, director_grupo, grado_asignado) VALUES (?, ?, ?, ?, ?)',
            [teacherId, userId, teacherData.anoCursado, teacherData.directorGrupo, teacherData.gradoAsignado]
        );
    }

    await connection.promise().query('DELETE FROM docente_grado WHERE id_docente = ?', [teacherId]);
    for (const grade of teacherData.teachingGrades) {
        await connection.promise().query(
            'INSERT INTO docente_grado (id_docente, grado) VALUES (?, ?)',
            [teacherId, grade]
        );
    }
}

function getStudentData(role, payload) {
    if (String(role || '').trim().toLowerCase() !== 'estudiante') {
        return null;
    }

    const gradeNumber = String(payload.studentGradeNumber || '').trim();
    const gradeLetter = String(payload.studentGradeLetter || '').trim();
    const guardianDocument = String(payload.guardianDocument || '').trim();
    const guardianDocumentType = String(payload.guardianDocumentType || '').trim();
    const guardianFirstName = String(payload.guardianFirstName || '').trim();
    const guardianSecondName = String(payload.guardianSecondName || '').trim();
    const guardianFirstSurname = String(payload.guardianFirstSurname || '').trim();
    const guardianSecondSurname = String(payload.guardianSecondSurname || '').trim();
    const guardianName = [guardianFirstName, guardianSecondName].filter(Boolean).join(' ');
    const guardianSurname = [guardianFirstSurname, guardianSecondSurname].filter(Boolean).join(' ');
    const guardianEmail = String(payload.guardianEmail || '').trim();
    const guardianPhone = Number(String(payload.guardianPhone || '').replace(/\D/g, '')) || 0;
    const relationship = String(payload.guardianRelationship || '').trim();
    const occupation = String(payload.guardianOccupation || '').trim();
    const hasDiagnosis = payload.hasDiagnosis === '1' || payload.hasDiagnosis === 'true';
    const diagnosisName = hasDiagnosis ? String(payload.diagnosisName || '').trim() : '';
    const diagnosisDescription = hasDiagnosis ? String(payload.diagnosisDescription || '').trim() : '';

    if (!/^\d{1,2}$/.test(gradeNumber) || !/^[1-9]\d?$/.test(gradeLetter)) {
        throw new Error('Ingresa el grado y el número del grupo del estudiante');
    }
    if (!/^\d+$/.test(guardianDocument) || !Number.isSafeInteger(Number(guardianDocument))) {
        throw new Error('Ingresa un número de identificación válido para el acudiente');
    }
    if (!guardianDocumentType || guardianDocumentType.length > 20) {
        throw new Error('Selecciona un tipo de identificación válido para el acudiente');
    }
    if (!guardianFirstName || !guardianFirstSurname || guardianName.length > 20 || guardianSurname.length > 20) {
        throw new Error('El nombre y apellido del acudiente son obligatorios y no pueden superar 20 caracteres');
    }
    if (!guardianEmail || guardianEmail.length > 100 || !Number.isSafeInteger(guardianPhone) || guardianPhone < 1) {
        throw new Error('Ingresa un correo y celular válidos para el acudiente');
    }
    if (!relationship || relationship.length > 200 || !occupation || occupation.length > 200) {
        throw new Error('Parentesco y ocupación son obligatorios');
    }
    if (hasDiagnosis && (!diagnosisName || diagnosisName.length > 300 || !diagnosisDescription)) {
        throw new Error('Completa el nombre y la descripción del diagnóstico');
    }

    return {
        grade: `${gradeNumber}-${gradeLetter}`,
        hasDiagnosis: hasDiagnosis ? 1 : 0,
        diagnosisName,
        diagnosisDescription,
        guardian: {
            id: Number(guardianDocument),
            documentType: guardianDocumentType,
            name: guardianName,
            surname: guardianSurname,
            email: guardianEmail,
            phone: guardianPhone,
            relationship,
            occupation
        }
    };
}

async function saveStudentData(userId, studentData) {
    if (!studentData) {
        await connection.promise().query('DELETE FROM estudiante WHERE id_usuario = ?', [userId]);
        return;
    }

    const guardian = studentData.guardian;
    await connection.promise().query(
        `INSERT INTO acudiente
            (id_acudiente, parentesco, ocupacion, nombre, apellido, correo, celular, tipo_documento)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE parentesco = VALUES(parentesco), ocupacion = VALUES(ocupacion),
            nombre = VALUES(nombre), apellido = VALUES(apellido), correo = VALUES(correo),
            celular = VALUES(celular), tipo_documento = VALUES(tipo_documento)`,
        [guardian.id, guardian.relationship, guardian.occupation, guardian.name, guardian.surname,
            guardian.email, guardian.phone, guardian.documentType]
    );

    const [existingRows] = await connection.promise().query(
        'SELECT id_estudiante FROM estudiante WHERE id_usuario = ? LIMIT 1',
        [userId]
    );

    if (existingRows.length) {
        await connection.promise().query(
            `UPDATE estudiante SET grado = ?, diagnostico = ?, nombre_diagnostico = ?,
                id_acudiente = ?, descripcion_diagnostico = ? WHERE id_usuario = ?`,
            [studentData.grade, studentData.hasDiagnosis, studentData.diagnosisName, guardian.id,
                studentData.diagnosisDescription, userId]
        );
        return;
    }

    const [idRows] = await connection.promise().query(
        'SELECT COALESCE(MAX(id_estudiante), 0) + 1 AS nextId FROM estudiante'
    );
    await connection.promise().query(
        `INSERT INTO estudiante
            (id_estudiante, id_usuario, grado, diagnostico, nombre_diagnostico, id_acudiente, descripcion_diagnostico)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idRows[0].nextId, userId, studentData.grade, studentData.hasDiagnosis,
            studentData.diagnosisName, guardian.id, studentData.diagnosisDescription]
    );
}

function toDateInputValue(value) {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    return String(value || '').slice(0, 10);
}

function toPublicPhotoUrl(photo) {
    const storedPhoto = String(photo || '').trim();
    if (!storedPhoto) {
        return '';
    }

    if (/^https?:\/\//i.test(storedPhoto)) {
        return storedPhoto;
    }

    const normalizedPath = storedPhoto.replace(/\\/g, '/');
    const uploadPath = normalizedPath.startsWith('/uploads/')
        ? normalizedPath
        : normalizedPath.startsWith('uploads/')
            ? `/${normalizedPath}`
            : `/uploads/${path.basename(normalizedPath)}`;

    return `http://localhost:3001${uploadPath}`;
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
                u.fecha_nac AS birthDate,
                u.fecha_reg AS registrationDate,
                u.estadi AS status,
                u.foto,
                u.tipo_id AS documentType,
                u.celular AS phone,
                u.id_rol AS roleId,
                u.comite_convivencia AS committeeMember,
                r.nombre AS role,
                d.ano_cursado AS anoCursado,
                d.director_grupo AS directorGrupo,
                d.grado_asignado AS gradoAsignado,
                (SELECT GROUP_CONCAT(dg.grado ORDER BY dg.id_docente_grado SEPARATOR ',')
                 FROM docente_grado dg WHERE dg.id_docente = d.id_docente) AS teachingGrades,
                e.grado AS studentGrade,
                e.diagnostico AS hasDiagnosis,
                e.nombre_diagnostico AS diagnosisName,
                e.descripcion_diagnostico AS diagnosisDescription,
                e.id_acudiente AS guardianDocument,
                a.tipo_documento AS guardianDocumentType,
                a.nombre AS guardianName,
                a.apellido AS guardianSurname,
                a.correo AS guardianEmail,
                a.celular AS guardianPhone,
                a.parentesco AS guardianRelationship,
                a.ocupacion AS guardianOccupation
            FROM usuario u
            LEFT JOIN rol r ON r.id_rol = u.id_rol
            LEFT JOIN docente d ON d.id_usuario = u.id_usuario
            LEFT JOIN estudiante e ON e.id_usuario = u.id_usuario
            LEFT JOIN acudiente a ON a.id_acudiente = e.id_acudiente
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
            password: '',   // las contraseñas están cifradas y nunca se envían
            documentType: usuario.documentType || 'Cédula',
            roleId: Number(usuario.roleId),
            committeeMember: Number(usuario.committeeMember) === 1,
            photo: usuario.foto ? (usuario.foto.startsWith('http') ? usuario.foto : `http://localhost:3001${usuario.foto}`) : '',
            role: usuario.role?.trim() || 'Sin rol',
            grade: usuario.studentGrade || '',
            groupDirector: usuario.directorGrupo === null ? '' : (Number(usuario.directorGrupo) === 1 ? 'Sí' : 'No'),
            directorGroup: usuario.gradoAsignado || '',
            directorGrupo: usuario.directorGrupo === null ? '' : Number(usuario.directorGrupo),
            anoCursado: usuario.anoCursado === null ? '' : Number(usuario.anoCursado),
            gradoAsignado: usuario.gradoAsignado || '',
            teachingGrades: usuario.teachingGrades ? usuario.teachingGrades.split(',') : [],
            studentGrade: usuario.studentGrade || '',
            hasDiagnosis: Number(usuario.hasDiagnosis) === 1,
            diagnosisName: usuario.diagnosisName || '',
            diagnosisDescription: usuario.diagnosisDescription || '',
            guardianDocument: usuario.guardianDocument ? String(usuario.guardianDocument) : '',
            guardianDocumentType: usuario.guardianDocumentType || '',
            guardianName: usuario.guardianName || '',
            guardianSurname: usuario.guardianSurname || '',
            guardianEmail: usuario.guardianEmail || '',
            guardianPhone: usuario.guardianPhone ? String(usuario.guardianPhone) : '',
            guardianRelationship: usuario.guardianRelationship || '',
            guardianOccupation: usuario.guardianOccupation || '',
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

async function getTeacherProfile(usuarioId) {
    const [rows] = await connection.promise().query(`
        SELECT u.id_usuario AS id, u.nombre, u.apellido, u.correo AS email,
               u.celular AS phone, u.foto AS photo, u.tipo_id AS documentType,
               r.nombre AS role, d.ano_cursado AS anoCursado,
               d.director_grupo AS directorGrupo, d.grado_asignado AS gradoAsignado,
               (SELECT GROUP_CONCAT(dg.grado ORDER BY dg.id_docente_grado SEPARATOR ',')
                FROM docente_grado dg WHERE dg.id_docente = d.id_docente) AS teachingGrades
        FROM usuario u
        INNER JOIN rol r ON r.id_rol = u.id_rol
        LEFT JOIN docente d ON d.id_usuario = u.id_usuario
        WHERE u.id_usuario = ? AND u.id_rol = 5
        LIMIT 1
    `, [usuarioId]);

    if (!rows.length) return null;
    const teacher = rows[0];
    const [firstName = '', ...secondNames] = String(teacher.nombre || '').trim().split(/\s+/).filter(Boolean);
    const [firstSurname = '', ...secondSurnames] = String(teacher.apellido || '').trim().split(/\s+/).filter(Boolean);
    return {
        id: Number(teacher.id),
        firstName,
        secondName: secondNames.join(' '),
        firstSurname,
        secondSurname: secondSurnames.join(' '),
        email: teacher.email || '',
        phone: teacher.phone ? String(teacher.phone) : '',
        photo: toPublicPhotoUrl(teacher.photo),
        documentType: teacher.documentType || '',
        role: teacher.role || 'Docente',
        anoCursado: teacher.anoCursado === null ? '' : Number(teacher.anoCursado),
        directorGrupo: teacher.directorGrupo === null ? null : Number(teacher.directorGrupo),
        gradoAsignado: teacher.gradoAsignado || '',
        teachingGrades: teacher.teachingGrades ? teacher.teachingGrades.split(',') : []
    };
}

function teacherIdFromRequest(req) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    return leerTokenDocente(token);
}

function requireTeacherSession(req, res, next) {
    const usuarioId = teacherIdFromRequest(req);
    if (!usuarioId) {
        return res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });
    }
    req.teacherUserId = usuarioId;
    return next();
}

router.get('/perfil-docente', requireTeacherSession, async (req, res) => {
    try {
        const usuarioId = req.teacherUserId;

        const profile = await getTeacherProfile(usuarioId);
        if (!profile) {
            return res.status(404).json({ message: 'No se encontró el perfil del docente' });
        }
        return res.json({ profile });
    } catch (error) {
        console.error('Error al consultar perfil docente:', error.message);
        return res.status(500).json({ message: 'No se pudo consultar el perfil docente' });
    }
});

router.put('/perfil-docente', requireTeacherSession, upload.single('foto'), async (req, res) => {
    try {
        const usuarioId = req.teacherUserId;
        const email = String(req.body?.email || '').trim();
        const phone = String(req.body?.phone || '').replace(/\D/g, '');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
            return res.status(400).json({ message: 'Ingresa un correo electrónico válido' });
        }
        if (!/^\d{7,15}$/.test(phone)) {
            return res.status(400).json({ message: 'El celular debe contener entre 7 y 15 números' });
        }
        if (req.file && !['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
            fs.unlink(req.file.path, () => {});
            return res.status(400).json({ message: 'La foto debe estar en formato JPG, PNG o WEBP' });
        }

        const currentProfile = await getTeacherProfile(usuarioId);
        if (!currentProfile) {
            return res.status(404).json({ message: 'No se encontró el perfil del docente' });
        }

        const [duplicateEmails] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE LOWER(TRIM(correo)) = LOWER(?) AND id_usuario <> ? LIMIT 1',
            [email, usuarioId]
        );
        if (duplicateEmails.length) {
            return res.status(409).json({ message: 'Ese correo ya está asociado a otro usuario' });
        }

        const photo = req.file ? `/uploads/${req.file.filename}` : currentProfile.photo;
        const storedPhoto = req.file ? `/uploads/${req.file.filename}` : null;
        if (storedPhoto && storedPhoto.length > 400) {
            return res.status(400).json({ message: 'La ruta de la foto supera el límite permitido' });
        }

        await connection.promise().query(
            'UPDATE usuario SET correo = ?, celular = ?, foto = COALESCE(?, foto) WHERE id_usuario = ? AND id_rol = 5',
            [email, phone, storedPhoto, usuarioId]
        );

        const profile = await getTeacherProfile(usuarioId);
        return res.json({ message: 'Perfil actualizado correctamente', profile: { ...profile, photo } });
    } catch (error) {
        console.error('Error al actualizar perfil docente:', error.message);
        return res.status(500).json({ message: 'No se pudo actualizar el perfil docente' });
    }
});

router.get('/perfil-administrador', async (_req, res) => {
    try {
        const [rows] = await connection.promise().query(`
            SELECT u.id_usuario AS id, u.nombre, u.apellido, u.correo AS email,
                   u.celular AS phone, u.foto AS photo, r.nombre AS role
            FROM usuario u
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE LOWER(TRIM(r.nombre)) = 'secretaria'
            ORDER BY u.id_usuario ASC
            LIMIT 1
        `);

        if (!rows.length) {
            return res.status(404).json({ message: 'No se encontró el perfil de la secretaria' });
        }

        const administrator = rows[0];
        const [firstName = '', ...secondNames] = String(administrator.nombre || '').trim().split(/\s+/).filter(Boolean);
        const [firstSurname = '', ...secondSurnames] = String(administrator.apellido || '').trim().split(/\s+/).filter(Boolean);
        return res.json({
            profile: {
                id: Number(administrator.id),
                name: `${administrator.nombre || ''} ${administrator.apellido || ''}`.trim(),
            firstName,
            secondName: secondNames.join(' '),
            firstSurname,
            secondSurname: secondSurnames.join(' '),
                email: administrator.email || '',
                phone: administrator.phone ? String(administrator.phone) : '',
                photo: toPublicPhotoUrl(administrator.photo),
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
        const email = String(payload.email || '').trim();
        const phone = Number(String(payload.phone || '').replace(/\D/g, '')) || 0;
        const nameParts = getSubmittedNameParts(payload);
        const { nombre, apellido } = nameParts;

        if (!email || !nameParts.firstName || !nameParts.firstSurname) {
            return res.status(400).json({ message: 'El primer nombre, el primer apellido y el correo son obligatorios' });
        }

        if (nombre.length > 100 || apellido.length > 100) {
            return res.status(400).json({ message: 'Los nombres y apellidos completos no pueden superar 100 caracteres cada uno' });
        }

        const [adminRows] = await connection.promise().query(`
            SELECT u.id_usuario, u.foto, r.nombre AS role
            FROM usuario u
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE LOWER(TRIM(r.nombre)) = 'secretaria'
            ORDER BY u.id_usuario ASC
            LIMIT 1
        `);

        if (!adminRows.length) {
            return res.status(404).json({ message: 'No se encontró el perfil de la secretaria' });
        }

        const administrator = adminRows[0];
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
        values.push(administrator.id_usuario);

        await connection.promise().query(
            'UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, celular = ?, foto = ? WHERE id_usuario = ?',
            values
        );

        return res.json({
            message: 'Perfil administrador actualizado correctamente',
            profile: {
                id: Number(administrator.id_usuario),
                name: `${nombre} ${apellido}`.trim(),
                firstName: nameParts.firstName,
                secondName: nameParts.secondName,
                firstSurname: nameParts.firstSurname,
                secondSurname: nameParts.secondSurname,
                email,
                phone: phone ? String(phone) : '',
                photo: toPublicPhotoUrl(photo),
                role: administrator.role
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil administrador:', error.message);
        return res.status(500).json({ message: 'No se pudo actualizar el perfil administrador' });
    }
});

router.put('/actualizar/:id', upload.single('foto'), async (req, res) => {
    let transactionStarted = false;
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

        if (!selectedRole || !email) {
            return res.status(400).json({ message: 'Faltan datos obligatorios para actualizar el usuario' });
        }

        let teacherData;
        let studentData;
        try {
            teacherData = getTeacherData(selectedRole, payload);
            studentData = getStudentData(selectedRole, payload);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // Solo se cambia la contraseña si el administrador escribió una nueva
        if (password && !passwordRegex.test(password)) {
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

        await connection.promise().beginTransaction();
        transactionStarted = true;

        await connection.promise().query(
            `UPDATE usuario
             SET nombre = ?, apellido = ?, edad = ?, correo = ?, contrasena = COALESCE(?, contrasena), fecha_nac = ?,
                 fecha_reg = ?, estadi = ?, foto = ?, tipo_id = ?, celular = ?, id_rol = ?, comite_convivencia = ?
             WHERE id_usuario = ?`,
            [
                nombre,
                apellido,
                age,
                email,
                password ? await cifrarContrasena(password) : null,
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

        await saveTeacherData(usuarioId, teacherData);
        await saveStudentData(usuarioId, studentData);
        await connection.promise().commit();
        transactionStarted = false;

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
        if (transactionStarted) {
            await connection.promise().rollback().catch(() => {});
        }
        console.error('Error al actualizar usuario:', error.message);
        return res.status(500).json({
            message: 'No se pudo actualizar el usuario',
            error: error.message
        });
    }
});

// ---------------- Eliminación de usuarios con todos sus registros relacionados ----------------

// Nombres legibles para el resumen que ve el administrador
const NOMBRES_TABLAS = {
    ayuda: 'solicitudes de ayuda',
    cita: 'citas',
    disponibilidad: 'horarios de disponibilidad',
    docente: 'ficha de docente',
    docente_grado: 'grados del docente',
    estudiante: 'ficha de estudiante',
    diario_emocinal: 'entradas del diario',
    seguimiento: 'seguimientos',
    estadistica: 'estadísticas',
    insignia: 'insignias',
    estudiante_docente: 'notas de estudiantes',
    intervension: 'intervenciones',
    relajacion: 'recursos de relajación',
    recurso_ia: 'recursos creados con IA',
    actividad_recurso: 'actividades de recursos'
};

// Columnas que apuntan a un usuario pero no tienen llave foránea en la base de datos
const REFERENCIAS_SIN_LLAVE = [
    { tabla: 'cita', columna: 'id_usuario', padre: 'usuario', columnaPadre: 'id_usuario' }
];

const esIdentificador = (nombre) => /^[A-Za-z0-9_]+$/.test(nombre);

// Lee de la base de datos qué tablas dependen de cuáles (llaves foráneas)
async function leerRelaciones(db) {
    const [rows] = await db.query(`
        SELECT TABLE_NAME AS tabla, COLUMN_NAME AS columna,
               REFERENCED_TABLE_NAME AS padre, REFERENCED_COLUMN_NAME AS columnaPadre
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    return [...rows, ...REFERENCIAS_SIN_LLAVE].filter((relacion) =>
        [relacion.tabla, relacion.columna, relacion.padre, relacion.columnaPadre].every(esIdentificador)
    );
}

// Borra las filas de `tabla` donde `columna` está en `valores`, pero antes borra
// (de abajo hacia arriba) todo lo que dependa de esas filas.
async function borrarEnCascada(db, relaciones, tabla, columna, valores, resumen, profundidad = 0) {
    if (!valores.length || profundidad > 10) return;

    for (const relacion of relaciones.filter((item) => item.padre === tabla)) {
        const [filas] = await db.query(
            `SELECT DISTINCT \`${relacion.columnaPadre}\` AS valor FROM \`${tabla}\` WHERE \`${columna}\` IN (?)`,
            [valores]
        );
        const valoresHijos = filas.map((fila) => fila.valor).filter((valor) => valor !== null);

        await borrarEnCascada(db, relaciones, relacion.tabla, relacion.columna, valoresHijos, resumen, profundidad + 1);
    }

    const [resultado] = await db.query(`DELETE FROM \`${tabla}\` WHERE \`${columna}\` IN (?)`, [valores]);

    if (resultado.affectedRows && tabla !== 'usuario') {
        resumen[tabla] = (resumen[tabla] || 0) + resultado.affectedRows;
    }
}

router.delete('/:id', async (req, res) => {
    const usuarioId = Number(req.params.id);

    if (!Number.isInteger(usuarioId) || usuarioId < 1) {
        return res.status(400).json({ message: 'El identificador del usuario no es válido' });
    }

    const db = connection.promise();
    let transactionStarted = false;

    try {
        const [usuarios] = await db.query('SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1', [usuarioId]);

        if (!usuarios.length) {
            return res.status(404).json({ message: 'No se encontró el usuario que deseas eliminar' });
        }

        const relaciones = await leerRelaciones(db);
        const resumen = {};

        // Todo o nada: si algo falla, no se borra ningún registro
        await db.beginTransaction();
        transactionStarted = true;

        await borrarEnCascada(db, relaciones, 'usuario', 'id_usuario', [usuarioId], resumen);

        await db.commit();
        transactionStarted = false;

        const detalle = Object.entries(resumen)
            .map(([tabla, cantidad]) => `${cantidad} ${NOMBRES_TABLAS[tabla] || tabla}`)
            .join(', ');

        return res.json({
            message: detalle
                ? `Usuario eliminado junto con: ${detalle}`
                : 'Usuario eliminado correctamente',
            id_usuario: usuarioId,
            registros_eliminados: resumen
        });
    } catch (error) {
        if (transactionStarted) {
            await db.rollback().catch(() => {});
        }

        console.error('Error al eliminar usuario:', error.message);
        return res.status(500).json({
            message: 'No se pudo eliminar el usuario. No se borró ningún dato.',
            error: error.message
        });
    }
});

router.post('/crear', upload.single('foto'), async (req, res) => {
    let transactionStarted = false;
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

        let teacherData;
        let studentData;
        try {
            teacherData = getTeacherData(selectedRole, payload);
            studentData = getStudentData(selectedRole, payload);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        if (!/^\d+$/.test(documents) || !Number.isSafeInteger(Number(documents))) {
            return res.status(400).json({
                message: 'El número de identificación debe ser numérico y válido'
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
            await cifrarContrasena(password),
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

        await connection.promise().beginTransaction();
        transactionStarted = true;
        await connection.promise().query(
            `INSERT INTO usuario (${insertColumns.join(', ')}) VALUES (${insertColumns.map(() => '?').join(', ')})`,
            insertValues
        );

        await saveTeacherData(usuarioId, teacherData);
        await saveStudentData(usuarioId, studentData);
        await connection.promise().commit();
        transactionStarted = false;

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
        if (transactionStarted) {
            await connection.promise().rollback().catch(() => {});
        }
        console.error('Error al crear usuario:', error.message);
        return res.status(500).json({
            message: 'No se pudo crear el usuario',
            error: error.message
        });
    }
});

// ---------------- Recuperación de contraseña por PIN al correo ----------------

const PIN_TTL_MS = 10 * 60 * 1000;   // el PIN vence a los 10 minutos
const PIN_MAX_ATTEMPTS = 5;          // intentos permitidos antes de invalidar el PIN
const RESET_LINK_TTL_MS = 30 * 60 * 1000;

// correo -> { pin, expiresAt, attempts, resetToken, resetExpiresAt }
const passwordResets = new Map();
const passwordResetLinks = new Map();

// La contraseña de aplicación de Google se copia con espacios ("abcd efgh ijkl mnop"); se quitan aquí
const smtpUser = String(process.env.SMTP_USER || '').trim();
const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');

const mailTransporter = nodemailer.createTransport({
    service: String(process.env.SMTP_SERVICE || 'gmail').trim(),
    auth: {
        user: smtpUser,
        pass: smtpPass
    }
});

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

router.post('/recuperar/enviar-enlace', async (req, res) => {
    try {
        const correo = normalizeEmail(req.body.correo);
        if (!correo) {
            return res.status(400).json({ message: 'Ingresa tu correo electrónico' });
        }

        const [rows] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE LOWER(TRIM(correo)) = ? LIMIT 1',
            [correo]
        );
        const genericMessage = 'Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.';
        if (!rows.length) {
            return res.json({ message: genericMessage });
        }

        if (!smtpUser || !smtpPass) {
            console.error('Faltan SMTP_USER / SMTP_PASS en el archivo .env');
            return res.status(500).json({ message: 'El servidor de correo no está configurado' });
        }

        const origin = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5502';
        const resetPageUrl = new URL(
            '/Client/ScreenStudents/EmotionalDiary/DiaryAccess/Forget/Forget.html',
            origin
        );
        if (!['http:', 'https:'].includes(resetPageUrl.protocol)) {
            return res.status(500).json({ message: 'La dirección del sitio no está configurada correctamente' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const resetUrl = new URL(resetPageUrl);
        resetUrl.searchParams.set('token', token);

        for (const [storedHash, reset] of passwordResetLinks) {
            if (reset.correo === correo || Date.now() > reset.expiresAt) {
                passwordResetLinks.delete(storedHash);
            }
        }
        passwordResetLinks.set(tokenHash, {
            correo,
            expiresAt: Date.now() + RESET_LINK_TTL_MS
        });

        try {
            await mailTransporter.sendMail({
                from: `"Sentir" <${smtpUser}>`,
                to: correo,
                subject: 'Sentir - Enlace para cambiar tu contraseña',
                text: `Solicitaste cambiar tu contraseña de Sentir. Abre este enlace antes de 30 minutos: ${resetUrl.href}. Si no hiciste esta solicitud, ignora este correo.`,
                html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;text-align:center"><h2 style="color:#4E2FC7">Sentir</h2><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p><p><a href="${resetUrl.href}" style="display:inline-block;padding:14px 22px;background:#6C4DF6;color:#fff;text-decoration:none;border-radius:8px">Crear nueva contraseña</a></p><p>El enlace vence en 30 minutos y solo puede usarse una vez.</p><p style="color:#666;font-size:13px">Si no solicitaste este cambio, ignora este correo.</p></div>`
            });
        } catch (error) {
            passwordResetLinks.delete(tokenHash);
            throw error;
        }

        return res.json({ message: genericMessage });
    } catch (error) {
        console.error('Error al enviar enlace de recuperación:', error.message);
        return res.status(500).json({ message: 'No se pudo enviar el enlace de recuperación' });
    }
});

router.post('/recuperar/restablecer-enlace', async (req, res) => {
    try {
        const token = String(req.body.token || '').trim();
        const nuevaContrasena = String(req.body.nuevaContrasena || '');
        const confirmarContrasena = String(req.body.confirmarContrasena || '');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const reset = passwordResetLinks.get(tokenHash);

        if (!reset || Date.now() > reset.expiresAt) {
            passwordResetLinks.delete(tokenHash);
            return res.status(401).json({ message: 'El enlace venció o ya fue utilizado. Solicita uno nuevo.' });
        }
        if (nuevaContrasena !== confirmarContrasena) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        }
        if (!passwordRegex.test(nuevaContrasena)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8+ caracteres, mayúsculas, minúsculas, números y un símbolo.'
            });
        }

        const [result] = await connection.promise().query(
            'UPDATE usuario SET contrasena = ? WHERE LOWER(TRIM(correo)) = ?',
            [await cifrarContrasena(nuevaContrasena), reset.correo]
        );
        if (!result.affectedRows) {
            passwordResetLinks.delete(tokenHash);
            return res.status(404).json({ message: 'No se encontró el usuario asociado al enlace' });
        }

        passwordResetLinks.delete(tokenHash);
        return res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña desde enlace:', error.message);
        return res.status(500).json({ message: 'No se pudo cambiar la contraseña' });
    }
});

router.post('/recuperar/enviar-pin', async (req, res) => {
    try {
        const correo = normalizeEmail(req.body.correo);

        if (!correo) {
            return res.status(400).json({ message: 'Ingresa tu correo electrónico' });
        }

        const [rows] = await connection.promise().query(
            'SELECT id_usuario, nombre FROM usuario WHERE LOWER(TRIM(correo)) = ? LIMIT 1',
            [correo]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'No existe un usuario registrado con ese correo' });
        }

        if (!smtpUser || !smtpPass) {
            console.error('Faltan SMTP_USER / SMTP_PASS en el archivo .env');
            return res.status(500).json({ message: 'El servidor de correo no está configurado' });
        }

        const pin = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

        await mailTransporter.sendMail({
            from: `"Sentir" <${smtpUser}>`,
            to: correo,
            subject: 'Sentir - Código para recuperar tu contraseña',
            text: `Hola ${rows[0].nombre}, tu código de verificación es: ${pin}. Vence en 10 minutos.`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;text-align:center">
                    <h2 style="color:#4E2FC7">Sentir</h2>
                    <p>Hola <b>${rows[0].nombre}</b>, usa este código para recuperar tu contraseña:</p>
                    <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#4E2FC7">${pin}</p>
                    <p style="color:#666;font-size:13px">El código vence en 10 minutos. Si no solicitaste este cambio, ignora este correo.</p>
                </div>`
        });

        passwordResets.set(correo, {
            pin,
            expiresAt: Date.now() + PIN_TTL_MS,
            attempts: 0,
            resetToken: null,
            resetExpiresAt: 0
        });

        return res.json({ message: 'Te enviamos un código de 6 dígitos a tu correo' });
    } catch (error) {
        console.error('Error al enviar PIN de recuperación:', error.message);
        return res.status(500).json({ message: 'No se pudo enviar el código al correo' });
    }
});

router.post('/recuperar/verificar-pin', (req, res) => {
    const correo = normalizeEmail(req.body.correo);
    const pin = String(req.body.pin || '').trim();
    const reset = passwordResets.get(correo);

    if (!/^\d{6}$/.test(pin)) {
        return res.status(400).json({ message: 'El código debe tener 6 números' });
    }

    if (!reset || Date.now() > reset.expiresAt) {
        passwordResets.delete(correo);
        return res.status(400).json({ message: 'El código venció o no fue solicitado. Pide uno nuevo.' });
    }

    if (reset.pin !== pin) {
        reset.attempts += 1;
        if (reset.attempts >= PIN_MAX_ATTEMPTS) {
            passwordResets.delete(correo);
            return res.status(400).json({ message: 'Demasiados intentos. Solicita un código nuevo.' });
        }
        return res.status(400).json({
            message: `Código incorrecto. Te quedan ${PIN_MAX_ATTEMPTS - reset.attempts} intentos.`
        });
    }

    reset.resetToken = crypto.randomUUID();
    reset.resetExpiresAt = Date.now() + PIN_TTL_MS;

    return res.json({ message: 'Código verificado', resetToken: reset.resetToken });
});

router.post('/recuperar/cambiar-contrasena', async (req, res) => {
    try {
        const correo = normalizeEmail(req.body.correo);
        const resetToken = String(req.body.resetToken || '');
        const nuevaContrasena = String(req.body.nuevaContrasena || '');
        const confirmarContrasena = String(req.body.confirmarContrasena || '');
        const reset = passwordResets.get(correo);

        if (!reset || !reset.resetToken || reset.resetToken !== resetToken || Date.now() > reset.resetExpiresAt) {
            return res.status(401).json({ message: 'La verificación venció. Solicita un código nuevo.' });
        }

        if (nuevaContrasena !== confirmarContrasena) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        }

        if (!passwordRegex.test(nuevaContrasena)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8+ caracteres, mayúsculas, minúsculas, números y un símbolo.'
            });
        }

        const [result] = await connection.promise().query(
            'UPDATE usuario SET contrasena = ? WHERE LOWER(TRIM(correo)) = ?',
            [await cifrarContrasena(nuevaContrasena), correo]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'No se encontró el usuario' });
        }

        passwordResets.delete(correo);
        return res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error.message);
        return res.status(500).json({ message: 'No se pudo cambiar la contraseña' });
    }
});

export default router;
