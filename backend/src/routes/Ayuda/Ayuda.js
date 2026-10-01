import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { codigosValidos, nivelValido, nivelDeFactores, nivelMayor } from '../../config/factoresRiesgo.js';
import { avisarPsicologia } from '../../config/alertasPsicologia.js';

const router = Router();

const ROL_ESTUDIANTE = 8;
const PRIORIDADES = ['Urgente', 'Muy alta', 'Alta', 'Media', 'Leve'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Límite de documentos no válidos por dispositivo (IP), para que nadie pueda
// probar muchos números seguidos y descubrir cuáles son de estudiantes
const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const intentosFallidos = new Map(); // ip -> { fallos, bloqueadoHasta }

function estaBloqueado(ip) {
    const registro = intentosFallidos.get(ip);
    return Boolean(registro && registro.bloqueadoHasta > Date.now());
}

function registrarFallo(ip) {
    const registro = intentosFallidos.get(ip) || { fallos: 0, bloqueadoHasta: 0 };
    registro.fallos += 1;
    if (registro.fallos >= MAX_FALLOS) {
        registro.fallos = 0;
        registro.bloqueadoHasta = Date.now() + BLOQUEO_MS;
    }
    intentosFallidos.set(ip, registro);
}

router.post('/solicitar', async (req, res) => {
    try {
        const ip = req.ip;
        const identificacion = String(req.body.identificacion || '').replace(/\D/g, '');
        const nombre = String(req.body.nombre || '').trim();
        const descripcion = String(req.body.descripcion || '').trim();
        const correo = String(req.body.correo || '').trim().toLowerCase();
        const prioridad = String(req.body.prioridad || '').trim();
        const gradoNumero = String(req.body.gradoNumero || '').trim();
        const gradoLetra = String(req.body.gradoLetra || '').trim().toUpperCase();

        if (!identificacion) {
            return res.status(400).json({ message: 'Ingresa tu número de identificación' });
        }

        if (!nombre || nombre.length > 100) {
            return res.status(400).json({ message: 'Ingresa tu nombre completo (máximo 100 caracteres)' });
        }

        if (!descripcion) {
            return res.status(400).json({ message: 'Cuéntanos brevemente la situación' });
        }

        if (!emailRegex.test(correo) || correo.length > 150) {
            return res.status(400).json({ message: 'Ingresa un correo electrónico institucional válido' });
        }

        if (!PRIORIDADES.includes(prioridad)) {
            return res.status(400).json({ message: 'Selecciona una prioridad válida' });
        }

        const numero = Number(gradoNumero);
        if (!/^\d{1,2}$/.test(gradoNumero) || numero < 0 || numero > 11 || !/^[A-Z]$/.test(gradoLetra)) {
            return res.status(400).json({ message: 'El grado debe ser un número del 0 al 11 y una letra, por ejemplo 9 - A' });
        }

        if (estaBloqueado(ip)) {
            return res.status(429).json({ message: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' });
        }

        // Se verifica que el documento sea de un estudiante, sin devolver ningún dato suyo
        const [rows] = await connection.promise().query(
            `SELECT id_usuario
             FROM usuario
             WHERE id_usuario = ? AND id_rol = ?
             LIMIT 1`,
            [identificacion, ROL_ESTUDIANTE]
        );

        if (!rows.length) {
            registrarFallo(ip);
            return res.status(401).json({
                message: 'El número de identificación no corresponde a un estudiante registrado'
            });
        }

        // Si viene del chat de IA: factores de riesgo detectados (solo códigos del catálogo)
        const origen = req.body.origen === 'chat' ? 'chat' : 'formulario';
        const factores = origen === 'chat' ? codigosValidos(req.body.factores) : [];
        let nivel = origen === 'chat' ? nivelValido(req.body.nivel) : '';
        if (factores.length) nivel = nivelMayor(nivelDeFactores(factores), nivel || 'bajo');

        // La fecha se registra sola (DEFAULT current_timestamp en la tabla)
        const grado = `${numero}-${gradoLetra}`;
        const [resultado] = await connection.promise().query(
            `INSERT INTO ayuda (nombre, descripcion, tipo_contacto, prioridad, grado, id_usuario, nombre_docente,
                                origen, nivel_riesgo, factores_riesgo)
             VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, ?)`,
            [nombre, descripcion, correo, prioridad, grado, rows[0].id_usuario, origen, nivel, factores.join(',')]
        );

        // Aviso a psicología: notificación en su perfil + correo.
        // Si el correo falla, la solicitud ya quedó guardada: solo se registra el error.
        try {
            const aviso = await avisarPsicologia({
                idAyuda: resultado.insertId, nombre, grado, prioridad, descripcion, origen, nivel, factores
            });
            console.log(`Solicitud de ayuda ${resultado.insertId}: ${aviso.notificaciones} notificaciones, correo a ${aviso.correos} destinatario(s)`);
        } catch (errorAviso) {
            console.error(`Solicitud de ayuda ${resultado.insertId}: no se pudo avisar a psicología:`, errorAviso.message);
        }

        return res.status(201).json({ message: 'Tu solicitud fue enviada al psicólogo/a institucional' });
    } catch (error) {
        console.error('Error al registrar solicitud de ayuda:', error.message);
        return res.status(500).json({ message: 'No se pudo enviar tu solicitud. Inténtalo de nuevo.' });
    }
});

export default router;
