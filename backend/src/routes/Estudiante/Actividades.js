import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenEstudiante } from '../../config/studentToken.js';
import { actividadDesdeFila } from '../Psicologia/Actividades.js';

// Actividades publicadas por psicología, para Recursos del estudiante (montado en /api/Estudiante).
//   GET /actividades   catálogo + las que su psicóloga le sugirió (primero), con la nota

const router = Router();

router.get('/actividades', async (req, res) => {
    try {
        const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const idUsuario = leerTokenEstudiante(token);
        if (!idUsuario) return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });

        const [filas] = await connection.promise().query(
            `SELECT r.*, DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha_iso, u.nombre AS autor_nombre, u.apellido AS autor_apellido,
                    s.nota AS sug_nota, s.fecha AS sug_fecha
             FROM relajacion r
             LEFT JOIN usuario u ON u.id_usuario = r.id_usuario
             LEFT JOIN (
                 SELECT id_relajacion, nota, fecha FROM relajacion_sugerida rs
                 WHERE rs.id_usuario = ? AND rs.id_sugerencia = (
                     SELECT MAX(x.id_sugerencia) FROM relajacion_sugerida x
                     WHERE x.id_usuario = rs.id_usuario AND x.id_relajacion = rs.id_relajacion)
             ) s ON s.id_relajacion = r.id_relajacion
             WHERE r.publicada = 1
             ORDER BY (s.id_relajacion IS NOT NULL) DESC, s.fecha DESC, r.fecha DESC`,
            [idUsuario]
        );
        return res.json({
            actividades: filas.map((f) => {
                const a = actividadDesdeFila(f);
                delete a.sugerencias;
                return { ...a, sugerida: Boolean(f.sug_fecha), nota: f.sug_nota || '' };
            })
        });
    } catch (error) {
        console.error('Actividades del estudiante:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar las actividades.' });
    }
});

export default router;
