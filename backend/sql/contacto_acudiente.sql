-- =========================================================
-- CONTACTO CON ACUDIENTES (módulo de psicología)
--   acudiente.id_estudiante -> los contactos alternativos (tío, abuela, vecino...)
--                              se guardan en la tabla acudiente con el id del
--                              estudiante. El acudiente principal sigue enlazado
--                              desde estudiante.id_acudiente (y tiene id_estudiante vacío).
--   contacto_acudiente      -> registro de cada vez que psicología contactó a alguien
--                              (llamada, WhatsApp, correo o presencial)
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `acudiente`
  ADD COLUMN IF NOT EXISTS `id_estudiante` int(11) DEFAULT NULL COMMENT 'solo contactos alternativos: estudiante al que pertenece' AFTER `tipo_documento`,
  ADD KEY IF NOT EXISTS `acudiente_estudiante` (`id_estudiante`);

ALTER TABLE `acudiente`
  ADD CONSTRAINT `acudiente_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiante` (`id_estudiante`) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS `contacto_acudiente` (
  `id_registro` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint(20) NOT NULL COMMENT 'estudiante',
  `id_psicologo` bigint(20) DEFAULT NULL COMMENT 'psicóloga que hizo el contacto',
  `nombre_contacto` varchar(150) NOT NULL,
  `parentesco` varchar(100) NOT NULL DEFAULT '',
  `telefono` varchar(20) NOT NULL DEFAULT '',
  `medio` varchar(20) NOT NULL COMMENT 'llamada | whatsapp | correo | presencial',
  `mensaje` text NOT NULL DEFAULT '' COMMENT 'mensaje enviado por WhatsApp',
  `observacion` text NOT NULL DEFAULT '' COMMENT 'qué se habló / resultado',
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_registro`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `contacto_acudiente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Si ya se había creado la tabla de la versión anterior, ya no se usa
DROP TABLE IF EXISTS `contacto_alternativo`;
