-- =========================================================
-- CITAS / SEGUIMIENTOS (Agenda de psicología)
-- Cada cita ocupa una franja de la tabla disponibilidad (id_disponibilidad).
--   * tipo: Seguimiento de caso, Sesión individual, Reunión con acudiente...
--   * fecha_solicitud ya no se cambia sola al editar la cita.
-- Requiere haber ejecutado antes backend/sql/disponibilidad.sql
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `cita`
  MODIFY `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  ADD COLUMN IF NOT EXISTS `tipo` varchar(60) NOT NULL DEFAULT 'Seguimiento de caso' AFTER `hora`;
