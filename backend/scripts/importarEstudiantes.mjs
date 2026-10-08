// =========================================================
// IMPORTAR ESTUDIANTES REALES desde un archivo CSV
// (para cuando el colegio tenga los datos y las fotos CON AUTORIZACIÓN
//  de las familias: fotos de menores solo con consentimiento).
//
// El CSV (separado por comas o punto y coma, con encabezado) lleva estas columnas;
// ver la plantilla scripts/plantillaEstudiantes.csv:
//   documento, tipo_documento, nombres, apellidos, fecha_nacimiento (AAAA-MM-DD),
//   grado (ej. 9-3), correo, celular, foto (nombre del archivo en la carpeta de fotos),
//   acudiente_documento, acudiente_nombres, acudiente_apellidos, acudiente_parentesco,
//   acudiente_ocupacion, acudiente_correo, acudiente_celular
//
// Uso (desde la carpeta backend):
//   node scripts/importarEstudiantes.mjs archivo.csv [carpetaDeFotos] [--probar]
//   --probar  revisa el archivo y muestra los errores sin guardar nada
//
// La clave inicial de cada estudiante es su número de documento (puede cambiarla luego).
// Los estudiantes que ya existen (mismo documento) no se modifican.
// =========================================================

import '../src/config/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connection } from '../src/config/mysql/dbmysql.js';
import { cifrarContrasena } from '../src/config/contrasenas.js';

const UPLOADS = path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
const db = connection.promise();
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const PROBAR = process.argv.includes('--probar');
const [archivo, carpetaFotos] = args;

if (!archivo) {
    console.log('Uso: node scripts/importarEstudiantes.mjs archivo.csv [carpetaDeFotos] [--probar]');
    process.exit(1);
}

// CSV sencillo con comillas ("a, b") y separador , o ;
function leerCSV(texto) {
    const lineas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
    const sep = (lineas[0].match(/;/g) || []).length > (lineas[0].match(/,/g) || []).length ? ';' : ',';
    const partir = (linea) => {
        const celdas = [];
        let actual = '', comillas = false;
        for (let i = 0; i < linea.length; i++) {
            const c = linea[i];
            if (c === '"' && linea[i + 1] === '"' && comillas) { actual += '"'; i++; }
            else if (c === '"') comillas = !comillas;
            else if (c === sep && !comillas) { celdas.push(actual.trim()); actual = ''; }
            else actual += c;
        }
        celdas.push(actual.trim());
        return celdas;
    };
    const cabecera = partir(lineas[0]).map((h) => h.toLowerCase().trim());
    return lineas.slice(1).map((l, i) => {
        const celdas = partir(l);
        return { fila: i + 2, ...Object.fromEntries(cabecera.map((h, j) => [h, celdas[j] ?? ''])) };
    });
}

const soloDigitos = (v) => String(v || '').replace(/\D/g, '');
const correoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function edadEn(fechaNac) {
    const hoy = new Date();
    const n = new Date(`${fechaNac}T12:00:00`);
    let edad = hoy.getFullYear() - n.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), n.getMonth(), n.getDate())) edad -= 1;
    return edad;
}

function validar(r) {
    const errores = [];
    if (!soloDigitos(r.documento)) errores.push('documento vacío');
    if (!r.nombres || !r.apellidos) errores.push('faltan nombres o apellidos');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.fecha_nacimiento) || Number.isNaN(new Date(r.fecha_nacimiento).getTime())) errores.push('fecha_nacimiento debe ser AAAA-MM-DD');
    if (!/^(0|[1-9]|1[01])-[1-9]\d?$/.test(r.grado)) errores.push('grado debe ser como 9-3');
    if (!correoValido(r.correo)) errores.push('correo no válido');
    if (!soloDigitos(r.acudiente_documento)) errores.push('documento del acudiente vacío');
    if (!r.acudiente_nombres) errores.push('nombre del acudiente vacío');
    if (r.foto) {
        if (!carpetaFotos) errores.push('trae foto pero no se indicó la carpeta de fotos');
        else if (!fs.existsSync(path.join(carpetaFotos, r.foto))) errores.push(`no se encontró la foto ${r.foto}`);
        else if (!/\.(jpe?g|png|webp)$/i.test(r.foto)) errores.push('la foto debe ser jpg, png o webp');
    }
    return errores;
}

const filas = leerCSV(fs.readFileSync(archivo, 'utf8'));
let creados = 0, omitidos = 0, conError = 0;

try {
    for (const r of filas) {
        const errores = validar(r);
        if (errores.length) { conError++; console.log(`✗ fila ${r.fila}: ${errores.join('; ')}`); continue; }

        const id = soloDigitos(r.documento);
        const [[existe]] = await db.query('SELECT id_usuario FROM usuario WHERE id_usuario = ?', [id]);
        if (existe) { omitidos++; console.log(`· fila ${r.fila}: el documento ${id} ya está registrado, se omite`); continue; }
        if (PROBAR) { creados++; console.log(`✓ fila ${r.fila}: ${r.nombres} ${r.apellidos} (${r.grado}) — correcto`); continue; }

        let foto = '';
        if (r.foto) {
            const ext = path.extname(r.foto).toLowerCase();
            const nombre = `${Date.now()}-estudiante-${id}${ext}`;
            fs.copyFileSync(path.join(carpetaFotos, r.foto), path.join(UPLOADS, nombre));
            foto = `/uploads/${nombre}`;
        }

        try {
            await db.beginTransaction();
            const idAcudiente = soloDigitos(r.acudiente_documento);
            const [[acudienteExiste]] = await db.query('SELECT id_acudiente FROM acudiente WHERE id_acudiente = ?', [idAcudiente]);
            if (!acudienteExiste) {
                await db.query(
                    `INSERT INTO acudiente (id_acudiente, parentesco, ocupacion, nombre, apellido, correo, celular, tipo_documento, id_estudiante)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'Cédula', NULL)`,
                    [idAcudiente, r.acudiente_parentesco || 'Acudiente', r.acudiente_ocupacion || '', r.acudiente_nombres.slice(0, 20),
                        (r.acudiente_apellidos || '').slice(0, 20), r.acudiente_correo || '', soloDigitos(r.acudiente_celular) || 0]
                );
            }
            await db.query(
                `INSERT INTO usuario (id_usuario, nombre, apellido, edad, correo, contrasena, fecha_nac, estadi, foto, tipo_id, celular, id_rol, comite_convivencia)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'Activo', ?, ?, ?, 8, 0)`,
                [id, r.nombres.toLowerCase(), r.apellidos.toLowerCase(), edadEn(r.fecha_nacimiento), r.correo.toLowerCase(),
                    await cifrarContrasena(id), r.fecha_nacimiento, foto, r.tipo_documento || 'Tarjeta de identidad', soloDigitos(r.celular) || 0]
            );
            const [[{ siguiente }]] = await db.query('SELECT COALESCE(MAX(id_estudiante), 0) + 1 AS siguiente FROM estudiante FOR UPDATE');
            await db.query(
                `INSERT INTO estudiante (id_estudiante, id_usuario, grado, diagnostico, nombre_diagnostico, id_acudiente, descripcion_diagnostico)
                 VALUES (?, ?, ?, 0, '', ?, '')`,
                [siguiente, id, r.grado, idAcudiente]
            );
            await db.commit();
            creados++;
            console.log(`✓ fila ${r.fila}: ${r.nombres} ${r.apellidos} (${r.grado})`);
        } catch (error) {
            await db.rollback().catch(() => {});
            if (foto) fs.rmSync(path.join(UPLOADS, path.basename(foto)), { force: true });
            conError++;
            console.log(`✗ fila ${r.fila}: ${error.message}`);
        }
    }
    console.log(`\n${PROBAR ? 'Revisión' : 'Importación'}: ${creados} ${PROBAR ? 'correctos' : 'creados'}, ${omitidos} ya existían, ${conError} con errores.`);
} finally {
    connection.end?.();
}
