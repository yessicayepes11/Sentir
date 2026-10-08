import express, { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenUsuario } from '../../config/studentToken.js';
import { estadoAvatar, guardarRecorte, tipoPorRol } from '../../config/avatarIA.js';

// =========================================================
// AVATAR ANIMADO CON IA (cualquier rol: estudiante, docente, psicología...)
//   GET  /api/Avatar         -> { estado: listo | generando | sin-foto, url, recorte }
//   POST /api/Avatar/recorte -> guarda la versión ya recortada (imagen webp/png en el cuerpo)
// El avatar se crea a partir de la foto de perfil y se vuelve a crear solo
// cuando la foto cambia. Quién es el usuario sale del token firmado.
// =========================================================

const router = Router();

router.get('/', async (req, res) => {
    try {
        const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const id = leerTokenUsuario(token);
        if (!id) return res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });

        const [[usuario]] = await connection.promise().query('SELECT id_usuario, id_rol, foto FROM usuario WHERE id_usuario = ? LIMIT 1', [id]);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const tipo = tipoPorRol(usuario.id_rol); // el rol define la ropa del personaje
        return res.json(estadoAvatar(usuario.id_usuario, usuario.foto, tipo));
    } catch (error) {
        console.error('Avatar IA:', error.message);
        return res.status(500).json({ message: 'No se pudo cargar tu avatar.' });
    }
});

// El navegador recorta el fondo una sola vez y lo guarda aquí; así las demás cargas son inmediatas
router.post('/recorte', express.raw({ type: ['image/webp', 'image/png'], limit: '5mb' }), (req, res) => {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const id = leerTokenUsuario(token);
    if (!id) return res.status(401).json({ message: 'Tu sesión venció. Vuelve a iniciar sesión.' });
    const archivo = String(req.query.archivo || '');
    if (!Buffer.isBuffer(req.body) || !/^usuario-\d+-[0-9a-fx]+-\d+\.(png|jpg|webp)$/.test(archivo)) {
        return res.status(400).json({ message: 'Recorte no válido.' });
    }
    return guardarRecorte(id, archivo, req.body) ? res.status(201).json({ ok: true }) : res.status(409).json({ message: 'El avatar cambió o la imagen no es válida.' });
});

export default router;
