-- =========================================================
-- GRUPOS CON NÚMERO EN VEZ DE LETRA
-- Desde ahora el grado se guarda como  9-1, 10-2, 11-3...
-- Este script convierte los grados viejos con letra:
--   9-A -> 9-1,  9-B -> 9-2,  10-C -> 10-3 ...
-- Los que ya tienen número no se tocan.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

UPDATE `estudiante`
SET `grado` = CONCAT(SUBSTRING_INDEX(`grado`, '-', 1), '-', ASCII(UPPER(RIGHT(`grado`, 1))) - 64)
WHERE `grado` REGEXP '^[0-9]{1,2}-[A-Za-z]$';

UPDATE `docente`
SET `grado_asignado` = CONCAT(SUBSTRING_INDEX(`grado_asignado`, '-', 1), '-', ASCII(UPPER(RIGHT(`grado_asignado`, 1))) - 64)
WHERE `grado_asignado` REGEXP '^[0-9]{1,2}-[A-Za-z]$';

UPDATE `docente_grado`
SET `grado` = CONCAT(SUBSTRING_INDEX(`grado`, '-', 1), '-', ASCII(UPPER(RIGHT(`grado`, 1))) - 64)
WHERE `grado` REGEXP '^[0-9]{1,2}-[A-Za-z]$';

UPDATE `ayuda`
SET `grado` = CONCAT(SUBSTRING_INDEX(`grado`, '-', 1), '-', ASCII(UPPER(RIGHT(`grado`, 1))) - 64)
WHERE `grado` REGEXP '^[0-9]{1,2}-[A-Za-z]$';
