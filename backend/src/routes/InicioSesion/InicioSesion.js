import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { cifrarContrasena, verificarContrasena } from '../../config/contrasenas.js';

// Comprueba la contraseña (cifrada con scrypt). Si el usuario todavía tenía la
// contraseña en texto plano y es correcta, se guarda cifrada en ese momento.
async function contrasenaCorrecta(usuario, contrasena) {
    if (!usuario) return false;
    const { valida, debeCifrarse } = await verificarContrasena(contrasena, usuario.contrasena);
    if (valida && debeCifrarse) {
        await connection.promise().query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?',
            [await cifrarContrasena(contrasena), usuario.id_usuario]);
    }
    return valida;
}
import { crearTokenDocente, crearTokenEstudiante, crearTokenUsuario } from '../../config/studentToken.js';

const router = Router();

// Página a la que se redirige cada rol (rutas relativas a /Client)
const redirectByRole = {
    1: './ScreenAdmin/Admin.html',
    2: './ScreenDirectivo/Rectora/rector.html',
    3: './ScreenDirectivo/Corrdinacion/academico.html',
    4: './ScreenDirectivo/Corrdinacion/convivencia.html',
    5: './ScreenTeacher/teacher.html',
    6: './ScreenPsicology/home/Home.html',
    7: './ScreeUAI/uai.html'
};

router.post('/login', async (req, res) => {
    try {
        const rol = Number(req.body.rol);
        const correo = String(req.body.correo || '').trim();
        const identificacion = String(req.body.identificacion || '').trim();
        const contrasena = String(req.body.contrasena || '');

        // Todos los roles pueden entrar con su número de identificación o con su correo:
        // si lo escrito son solo números se busca por identificación; si no, por correo.
        const loginIdentifier = identificacion || correo;
        const porIdentificacion = /^\d+$/.test(loginIdentifier);

        if (!rol || !loginIdentifier || !contrasena) {
            return res.status(400).json({ message: 'Selecciona tu rol e ingresa tu identificación o correo y tu contraseña' });
        }

        if (!redirectByRole[rol]) {
            return res.status(400).json({ message: 'El rol seleccionado no tiene acceso por este medio' });
        }

        const loginColumn = porIdentificacion ? 'u.id_usuario' : 'u.correo';
        const [rows] = await connection.promise().query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.contrasena, u.estadi, u.id_rol, r.nombre AS rol
             FROM usuario u
             INNER JOIN rol r ON r.id_rol = u.id_rol
             WHERE ${loginColumn} = ?
             LIMIT 1`,
            [loginIdentifier]
        );

        const usuario = rows[0];

        if (!(await contrasenaCorrecta(usuario, contrasena))) {
            return res.status(401).json({
                message: porIdentificacion ? 'Identificación o contraseña incorrectas' : 'Correo o contraseña incorrectos'
            });
        }

        if (Number(usuario.id_rol) !== rol) {
            return res.status(403).json({ message: 'El rol seleccionado no corresponde a este usuario' });
        }

        if (String(usuario.estadi || '').toLowerCase() !== 'activo') {
            return res.status(403).json({ message: 'El usuario no está activo' });
        }

        const usuarioResponse = {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            id_rol: usuario.id_rol,
            rol: usuario.rol,
            correo: usuario.correo
        };
        // Token firmado: con él cada pantalla sabe quién inició sesión.
        // El docente recibe el token "de docente" (sirve para su perfil); los demás roles, uno general.
        usuarioResponse.token = rol === 5
            ? crearTokenDocente(usuario.id_usuario)
            : crearTokenUsuario(usuario.id_usuario);

        return res.json({
            message: 'Inicio de sesión exitoso',
            usuario: usuarioResponse,
            redirect: redirectByRole[rol]
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        return res.status(500).json({ message: 'Error interno al iniciar sesión' });
    }
});

// ---------------- Ingreso del estudiante a "Mi espacio personal" ----------------

const ROL_ESTUDIANTE = 8;
const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const fallosPorIp = new Map(); // ip -> { fallos, bloqueadoHasta }

router.post('/estudiante', async (req, res) => {
    try {
        const ip = req.ip;
        const identificacion = String(req.body.identificacion || '').replace(/\D/g, '');
        const contrasena = String(req.body.contrasena || '');

        if (!identificacion || !contrasena) {
            return res.status(400).json({ message: 'Ingresa tu número de identificación y tu clave' });
        }

        const registro = fallosPorIp.get(ip);
        if (registro && registro.bloqueadoHasta > Date.now()) {
            return res.status(429).json({ message: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' });
        }

        const [rows] = await connection.promise().query(
            `SELECT id_usuario, nombre, apellido, contrasena, estadi
             FROM usuario
             WHERE id_usuario = ? AND id_rol = ?
             LIMIT 1`,
            [identificacion, ROL_ESTUDIANTE]
        );

        const estudiante = rows[0];

        // Mismo mensaje si no existe o si la clave no coincide, para no revelar qué documentos están registrados
        if (!(await contrasenaCorrecta(estudiante, contrasena))) {
            const actual = fallosPorIp.get(ip) || { fallos: 0, bloqueadoHasta: 0 };
            actual.fallos += 1;
            if (actual.fallos >= MAX_FALLOS) {
                actual.fallos = 0;
                actual.bloqueadoHasta = Date.now() + BLOQUEO_MS;
            }
            fallosPorIp.set(ip, actual);
            return res.status(401).json({ message: 'Número de identificación o clave incorrectos' });
        }

        if (String(estudiante.estadi || '').toLowerCase() !== 'activo') {
            return res.status(403).json({ message: 'Tu usuario no está activo. Habla con la secretaría del colegio.' });
        }

        fallosPorIp.delete(ip);

        return res.json({
            message: 'Ingreso correcto',
            estudiante: {
                id_usuario: estudiante.id_usuario,
                nombre: estudiante.nombre,
                apellido: estudiante.apellido,
                token: crearTokenEstudiante(estudiante.id_usuario)
            }
        });
    } catch (error) {
        console.error('Error en ingreso del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudo iniciar sesión. Inténtalo de nuevo.' });
    }
});

export default router;
