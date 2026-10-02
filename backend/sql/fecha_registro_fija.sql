-- =========================================================
-- LA FECHA DE REGISTRO DEL USUARIO YA NO CAMBIA AL EDITARLO
-- Antes, `fecha_reg` tenía "ON UPDATE current_timestamp()": cada vez que
-- se editaba un usuario (perfil, contraseña, foto...) su fecha de registro
-- pasaba a ser la de ese día. Ahora solo se llena al crear el usuario.
-- Ejecutar UNA vez en la base de datos `sentir` (phpMyAdmin > SQL).
-- =========================================================

ALTER TABLE `usuario`
  MODIFY `fecha_reg` timestamp NOT NULL DEFAULT current_timestamp();
