-- =========================================================
-- DISPONIBILIDAD DE LA PSICÓLOGA (Agenda)
-- Cada fila es una franja disponible: un día (fecha) y una hora de inicio.
--   * fecha pasa a ser DATE y ya no se cambia sola al editar (antes tenía
--     ON UPDATE current_timestamp(), que borraba el día elegido).
--   * duracion_min: minutos que dura la franja.
--   * no se puede repetir la misma hora el mismo día para la misma persona.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `disponibilidad`
  MODIFY `fecha` date NOT NULL,
  ADD COLUMN IF NOT EXISTS `duracion_min` int(11) NOT NULL DEFAULT 60 AFTER `hora`;

ALTER TABLE `disponibilidad`
  ADD UNIQUE KEY IF NOT EXISTS `franja_unica` (`id_usuario`, `fecha`, `hora`);
