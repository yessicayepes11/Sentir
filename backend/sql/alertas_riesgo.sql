-- =========================================================
-- ALERTAS DE FACTORES DE RIESGO (chat Sentir IA -> psicología)
-- Se puede ejecutar varias veces: no duplica nada.
-- Ejecutar en phpMyAdmin sobre la base de datos `sentir`.
-- =========================================================

-- 1) La solicitud de ayuda guarda de dónde viene y qué riesgo se detectó
ALTER TABLE `ayuda`
  ADD COLUMN IF NOT EXISTS `origen` VARCHAR(20) NOT NULL DEFAULT 'formulario' COMMENT 'formulario | chat',
  ADD COLUMN IF NOT EXISTS `nivel_riesgo` VARCHAR(20) NOT NULL DEFAULT '' COMMENT 'bajo | medio | alto | critico',
  ADD COLUMN IF NOT EXISTS `factores_riesgo` TEXT NOT NULL DEFAULT '' COMMENT 'códigos separados por coma (ver backend/src/config/factoresRiesgo.js)';

-- 2) Notificaciones para el perfil del psicólogo/a (una por psicólogo/a y por alerta)
CREATE TABLE IF NOT EXISTS `notificacion` (
  `id_notificacion` INT(11) NOT NULL AUTO_INCREMENT,
  `id_usuario_destino` BIGINT(20) NOT NULL COMMENT 'usuario (psicólogo/a) que recibe la notificación',
  `id_ayuda` INT(10) DEFAULT NULL COMMENT 'solicitud de ayuda que la generó',
  `tipo` VARCHAR(30) NOT NULL DEFAULT 'alerta_riesgo',
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `nivel_riesgo` VARCHAR(20) NOT NULL DEFAULT '',
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `id_usuario_destino` (`id_usuario_destino`),
  KEY `id_ayuda` (`id_ayuda`),
  CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`id_usuario_destino`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `notificacion_ibfk_2` FOREIGN KEY (`id_ayuda`) REFERENCES `ayuda` (`id_ayuda`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
