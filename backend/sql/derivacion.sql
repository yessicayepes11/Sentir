-- =========================================================
-- DERIVACIONES A RED DE APOYO (módulo de psicología)
-- Cada vez que la psicóloga remite a un estudiante a una EPS o entidad externa.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

CREATE TABLE IF NOT EXISTS `derivacion` (
  `id_derivacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint(20) NOT NULL COMMENT 'estudiante derivado',
  `id_psicologo` bigint(20) DEFAULT NULL COMMENT 'psicóloga que hizo la derivación',
  `eps` varchar(150) NOT NULL COMMENT 'nombre de la EPS o entidad',
  `servicio` varchar(100) NOT NULL DEFAULT '' COMMENT 'psicología, psiquiatría, medicina general...',
  `fecha_derivacion` date NOT NULL,
  `motivo` text NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Enviada',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_derivacion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `derivacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
