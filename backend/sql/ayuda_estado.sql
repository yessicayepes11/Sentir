-- =========================================================
-- ESTADO DE CADA SOLICITUD DE AYUDA / ALERTA
-- Nueva -> En atención -> Resuelta (la marca psicología).
-- Sirve para "Alertas activas" y "Casos cerrados" en el Inicio de psicología.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `ayuda`
  ADD COLUMN `estado` varchar(20) NOT NULL DEFAULT 'Nueva' COMMENT 'Nueva | En atención | Resuelta' AFTER `prioridad`;

-- La fecha de la solicitud no debe cambiar cuando psicología actualiza su estado
ALTER TABLE `ayuda`
  MODIFY `fecha` timestamp NOT NULL DEFAULT current_timestamp();
