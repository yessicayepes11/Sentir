-- =========================================================
-- CITAS ENTRE PSICOLOGÍA Y ESTUDIANTES + NOTIFICACIONES AL ESTUDIANTE
--   cita.id_psicologo      -> psicóloga responsable (vacío = solicitud del estudiante sin asignar)
--   cita.origen            -> 'psicologia' (la creó la psicóloga) | 'estudiante' (la pidió el estudiante)
--   cita.id_disponibilidad -> ahora puede quedar vacío: el estudiante puede proponer otro horario
--   cita.estado            -> Pendiente | Programada | Realizada | No asistió | Rechazada | Cancelada
--   notificacion.id_cita   -> aviso relacionado con una cita (cita asignada, aceptada, cambiada...)
-- Requiere haber ejecutado antes disponibilidad.sql y cita.sql
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `cita`
  MODIFY `id_disponibilidad` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `id_psicologo` bigint(20) DEFAULT NULL COMMENT 'psicóloga responsable' AFTER `id_usuario`,
  ADD COLUMN IF NOT EXISTS `origen` varchar(20) NOT NULL DEFAULT 'psicologia' COMMENT 'psicologia | estudiante' AFTER `tipo`,
  ADD KEY IF NOT EXISTS `cita_estudiante` (`id_usuario`),
  ADD KEY IF NOT EXISTS `cita_psicologo` (`id_psicologo`);

-- Las citas que ya existían fueron creadas por psicología: se les asigna la dueña de la franja
UPDATE `cita` c JOIN `disponibilidad` d ON d.id_disponibilidad = c.id_disponibilidad
   SET c.id_psicologo = d.id_usuario
 WHERE c.id_psicologo IS NULL;

ALTER TABLE `notificacion`
  ADD COLUMN IF NOT EXISTS `id_cita` int(20) DEFAULT NULL COMMENT 'cita relacionada' AFTER `id_ayuda`,
  ADD KEY IF NOT EXISTS `id_cita` (`id_cita`);

ALTER TABLE `notificacion`
  ADD CONSTRAINT `notificacion_ibfk_3` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`) ON DELETE SET NULL;
