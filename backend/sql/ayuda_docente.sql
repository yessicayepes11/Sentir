-- =========================================================
-- ALERTAS DE LOS DOCENTES EN LA TABLA `ayuda`
-- Guarda la identificación del docente que envió la alerta
-- (Docente > Mis estudiantes > "Enviar alerta"), para mostrarle
-- sus alertas en "Mis alertas recientes".
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `ayuda`
  ADD COLUMN `id_docente` bigint(20) DEFAULT NULL COMMENT 'docente que envió la alerta (origen = docente)' AFTER `nombre_docente`,
  ADD KEY `id_docente` (`id_docente`),
  MODIFY `origen` varchar(20) NOT NULL DEFAULT 'formulario' COMMENT 'formulario | chat | docente';
