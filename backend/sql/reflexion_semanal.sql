-- =========================================================
-- REFLEXIÓN DE LA SEMANA (Mi seguimiento -> "Tu reflexión de hoy")
-- La genera el agente de IA una vez por semana y la ven todos los estudiantes.
-- Se puede ejecutar varias veces: no duplica nada.
-- =========================================================

CREATE TABLE IF NOT EXISTS `reflexion_semanal` (
  `semana` VARCHAR(10) NOT NULL COMMENT 'año y semana ISO, ej. 2026-W40',
  `texto` VARCHAR(400) NOT NULL,
  `generada_por` VARCHAR(40) NOT NULL DEFAULT '' COMMENT 'proveedor/modelo de IA que la escribió',
  `fecha` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
