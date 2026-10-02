// =========================================================
// CIFRA LAS CONTRASEÑAS QUE TODAVÍA ESTÁN EN TEXTO PLANO
// Uso (desde la carpeta backend):   node scripts/cifrarContrasenas.mjs
// Se puede ejecutar varias veces: las que ya están cifradas no se tocan.
// =========================================================
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { cifrarContrasena, estaCifrada } from '../src/config/contrasenas.js';

const conexion = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
});

const [usuarios] = await conexion.query('SELECT id_usuario, contrasena FROM usuario');
let cifradas = 0;

for (const usuario of usuarios) {
    if (estaCifrada(usuario.contrasena) || !usuario.contrasena) continue;
    await conexion.query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?',
        [await cifrarContrasena(usuario.contrasena), usuario.id_usuario]);
    cifradas += 1;
}

console.log(`Usuarios: ${usuarios.length} · contraseñas cifradas ahora: ${cifradas} · ya estaban cifradas: ${usuarios.length - cifradas}`);
await conexion.end();
