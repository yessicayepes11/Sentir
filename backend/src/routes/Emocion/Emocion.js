import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';

const router = Router();

// Las 5 emociones de "¿Cómo te sientes hoy?" (EmotionalDiary.html).
// `foto` guarda el emoji que representa cada recuadro.
const EMOCIONES = [
    { nombre: 'Muy bien', descripcion: 'Me siento genial', foto: '😄' },
    { nombre: 'Bien', descripcion: 'Estoy tranquilo/a', foto: '🙂' },
    { nombre: 'Regular', descripcion: 'Estoy estable', foto: '😐' },
    { nombre: 'Mal', descripcion: 'No estoy muy bien', foto: '😟' },
    { nombre: 'Muy mal', descripcion: 'Necesito apoyo', foto: '😠' }
];

// Inserta las emociones que todavía no estén en la tabla (se busca por nombre).
// Se puede llamar muchas veces sin crear duplicados.
async function asegurarEmociones() {
    const [rows] = await connection.promise().query('SELECT nombre FROM emocion');
    const existentes = new Set(rows.map((row) => row.nombre.trim().toLowerCase()));

    for (const emocion of EMOCIONES) {
        if (!existentes.has(emocion.nombre.toLowerCase())) {
            await connection.promise().query(
                'INSERT INTO emocion (nombre, descripcion, foto) VALUES (?, ?, ?)',
                [emocion.nombre, emocion.descripcion, emocion.foto]
            );
        }
    }
}

router.get('/listar', async (_req, res) => {
    try {
        await asegurarEmociones();

        const [rows] = await connection.promise().query(
            'SELECT id_emocion, nombre, descripcion, foto FROM emocion ORDER BY id_emocion ASC'
        );

        return res.json(rows);
    } catch (error) {
        console.error('Error al listar emociones:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar las emociones' });
    }
});

export default router;
