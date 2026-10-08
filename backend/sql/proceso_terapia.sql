-- =========================================================
-- PROCESOS DE TERAPIA (estudiantes en acompañamiento de psicología)
-- Un estudiante entra en proceso por:
--   docente    -> alerta enviada por un docente
--   formulario -> pidió ayuda por su cuenta
--   chat       -> lo derivó el chat de Sentir IA
--   psicologia -> la psicóloga lo añadió directamente
-- Los estudiantes los sigue registrando la secretaría (tabla usuario/estudiante);
-- esta tabla solo dice quiénes están en proceso y por qué.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

CREATE TABLE IF NOT EXISTS `proceso_terapia` (
  `id_proceso` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint(20) NOT NULL COMMENT 'estudiante en proceso',
  `id_psicologo` bigint(20) DEFAULT NULL COMMENT 'psicóloga que lo abrió (vacío si se abrió automáticamente)',
  `origen` varchar(20) NOT NULL COMMENT 'docente | formulario | chat | psicologia',
  `id_ayuda` int(10) DEFAULT NULL COMMENT 'alerta o solicitud de ayuda que lo originó',
  `motivo` text NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Activo' COMMENT 'Activo | Cerrado',
  `fecha_inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` datetime DEFAULT NULL,
  `observacion_cierre` text NOT NULL DEFAULT '',
  PRIMARY KEY (`id_proceso`),
  KEY `estudiante_estado` (`id_usuario`, `estado`),
  KEY `id_ayuda` (`id_ayuda`),
  CONSTRAINT `proceso_terapia_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `proceso_terapia_ibfk_2` FOREIGN KEY (`id_ayuda`) REFERENCES `ayuda` (`id_ayuda`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
