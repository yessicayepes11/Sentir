-- =========================================================
-- ACTIVIDADES DE BIENESTAR (Control de Actividades de psicología)
-- La tabla `relajacion` es el catálogo que psicología publica y que el
-- estudiante ve en Recursos ("Actividades de tu psicóloga").
--   tipo          -> categoría (Respiración, Mindfulness... u otra escrita por la psicóloga)
--   archivo       -> ruta del archivo subido (imagen, audio, video o PDF)
--   url           -> enlace externo (video de YouTube, artículo, audio...)
--   nivel         -> a quién se recomienda (Todos, Riesgo bajo/medio/alto...)
--   pasos         -> instrucciones paso a paso (una por línea)
--   generada_por  -> modelo de IA que la propuso (vacío si la escribió la psicóloga)
--   fecha         -> ya no se cambia sola al editar
-- relajacion_sugerida: actividad que la psicóloga le sugirió a un estudiante.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `relajacion`
  MODIFY `tipo` varchar(60) NOT NULL,
  MODIFY `archivo` varchar(1000) NOT NULL DEFAULT '',
  MODIFY `animacion` varchar(1000) NOT NULL DEFAULT '',
  MODIFY `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  ADD COLUMN IF NOT EXISTS `url` varchar(500) NOT NULL DEFAULT '' AFTER `archivo`,
  ADD COLUMN IF NOT EXISTS `archivo_nombre` varchar(255) NOT NULL DEFAULT '' AFTER `url`,
  ADD COLUMN IF NOT EXISTS `nivel` varchar(60) NOT NULL DEFAULT 'Todos' AFTER `archivo_nombre`,
  ADD COLUMN IF NOT EXISTS `pasos` text NOT NULL DEFAULT '' AFTER `nivel`,
  ADD COLUMN IF NOT EXISTS `duracion_min` int(11) NOT NULL DEFAULT 0 AFTER `pasos`,
  ADD COLUMN IF NOT EXISTS `generada_por` varchar(60) NOT NULL DEFAULT '' AFTER `duracion_min`,
  ADD COLUMN IF NOT EXISTS `publicada` tinyint(1) NOT NULL DEFAULT 1 AFTER `generada_por`;

CREATE TABLE IF NOT EXISTS `relajacion_sugerida` (
  `id_sugerencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_relajacion` int(10) NOT NULL,
  `id_usuario` bigint(20) NOT NULL COMMENT 'estudiante',
  `id_psicologo` bigint(20) DEFAULT NULL,
  `nota` text NOT NULL DEFAULT '',
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_sugerencia`),
  KEY `id_relajacion` (`id_relajacion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `relajacion_sugerida_ibfk_1` FOREIGN KEY (`id_relajacion`) REFERENCES `relajacion` (`id_relajacion`) ON DELETE CASCADE,
  CONSTRAINT `relajacion_sugerida_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Actividades iniciales (solo si el catálogo está vacío), a nombre de la primera psicóloga activa
INSERT INTO `relajacion` (tipo, titulo, descripcion, archivo, url, nivel, pasos, duracion_min, id_usuario, animacion)
SELECT x.tipo, x.titulo, x.descripcion, '', '', x.nivel, x.pasos, x.duracion, p.id_usuario, ''
FROM (
  SELECT 'Respiración' tipo, 'Respiración 4-7-8' titulo,
         'Técnica de respiración para reducir la ansiedad en momentos difíciles.' descripcion,
         'Todos' nivel, 'Siéntate cómodo y relaja los hombros.\nInhala por la nariz contando hasta 4.\nSostén el aire contando hasta 7.\nExhala despacio por la boca contando hasta 8.\nRepite 4 veces.' pasos, 3 duracion
  UNION ALL SELECT 'Mindfulness', 'Meditación guiada',
         'Meditación de atención plena para manejar el estrés académico antes de evaluaciones.',
         'Riesgo medio', 'Cierra los ojos y lleva la atención a tu respiración.\nNota los sonidos a tu alrededor sin juzgarlos.\nSi tu mente se distrae, vuelve con suavidad a la respiración.\nTermina abriendo los ojos despacio.', 5
  UNION ALL SELECT 'Escritura terapéutica', 'Diario emocional',
         'Espacio de escritura libre para identificar y procesar las emociones del día.',
         'Todos', 'Escribe qué pasó hoy que te hizo sentir algo fuerte.\nPonle nombre a esa emoción.\nEscribe qué necesitabas en ese momento.\nTermina con una frase amable para ti.', 10
  UNION ALL SELECT 'Movimiento', 'Caminata consciente',
         'Actividad física suave y guiada para liberar tensión y mejorar el estado de ánimo.',
         'Riesgo alto', 'Camina despacio durante 5 minutos.\nFíjate en cómo apoyas cada pie.\nRespira al ritmo de tus pasos.\nAl terminar, nota cómo se siente tu cuerpo.', 10
) x
JOIN (SELECT id_usuario FROM usuario WHERE id_rol = 6 AND LOWER(TRIM(estadi)) = 'activo' ORDER BY id_usuario LIMIT 1) p
WHERE NOT EXISTS (SELECT 1 FROM relajacion);
