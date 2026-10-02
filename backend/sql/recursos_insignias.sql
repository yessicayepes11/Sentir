-- =========================================================
-- INSIGNIAS Y RECURSOS GENERADOS CON IA
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
--
-- insignia            -> se le agregan columnas para saber a qué recurso
--                        pertenece cada insignia y cuál es su meta.
-- recurso_ia          -> respiraciones y meditaciones que la IA crea para
--                        cada estudiante, ligadas a la insignia que ayudan a conseguir.
-- actividad_recurso   -> cada vez que el estudiante termina una respiración,
--                        una meditación o ve un video (sirve para el progreso).
-- =========================================================

ALTER TABLE `insignia`
  ADD COLUMN `categoria` varchar(20) NOT NULL DEFAULT '' AFTER `imagen`,
  ADD COLUMN `nivel` int(11) NOT NULL DEFAULT 1 AFTER `categoria`,
  ADD COLUMN `meta` int(11) NOT NULL DEFAULT 1 AFTER `nivel`,
  ADD COLUMN `fecha_obtenida` datetime DEFAULT NULL AFTER `meta`,
  ADD COLUMN `generada_por` varchar(40) NOT NULL DEFAULT '' AFTER `fecha_obtenida`,
  ADD UNIQUE KEY `insignia_estudiante_nivel` (`id_estudiante`, `categoria`, `nivel`);

CREATE TABLE IF NOT EXISTS `recurso_ia` (
  `id_recurso` int(11) NOT NULL AUTO_INCREMENT,
  `id_estudiante` int(20) NOT NULL,
  `id_insignia` int(10) DEFAULT NULL,
  `tipo` varchar(20) NOT NULL,
  `titulo` varchar(80) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `beneficio` varchar(300) NOT NULL DEFAULT '',
  `icono` varchar(40) NOT NULL,
  `color` varchar(10) NOT NULL,
  `contenido` text NOT NULL,
  `duracion_seg` int(11) NOT NULL,
  `generado_por` varchar(40) NOT NULL DEFAULT '',
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_recurso`),
  KEY `id_estudiante` (`id_estudiante`),
  KEY `id_insignia` (`id_insignia`),
  CONSTRAINT `recurso_ia_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiante` (`id_estudiante`),
  CONSTRAINT `recurso_ia_ibfk_2` FOREIGN KEY (`id_insignia`) REFERENCES `insignia` (`id_insignia`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `actividad_recurso` (
  `id_actividad` int(11) NOT NULL AUTO_INCREMENT,
  `id_estudiante` int(20) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `clave` varchar(80) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_actividad`),
  KEY `estudiante_tipo` (`id_estudiante`, `tipo`),
  CONSTRAINT `actividad_recurso_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiante` (`id_estudiante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
