-- =========================================================
-- INTERVENCIONES DE PSICOLOGÍA (tabla `intervension`)
-- - id_usuario     = estudiante intervenido (ya existía)
-- - id_psicologo   = psicóloga que registró la intervención (nuevo).
--   Sin llave foránea a propósito: si se elimina a la psicóloga del
--   sistema, las intervenciones del estudiante NO se borran.
-- - La fecha ya no cambia sola cuando se edita el registro.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `intervension`
  ADD COLUMN `id_psicologo` bigint(20) DEFAULT NULL COMMENT 'psicóloga que registró la intervención' AFTER `id_usuario`,
  ADD KEY `id_psicologo` (`id_psicologo`),
  MODIFY `fecha` timestamp NOT NULL DEFAULT current_timestamp();
