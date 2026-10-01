import '../src/config/env.js';
import { connection, dbConnectMysql } from '../src/config/mysql/dbmysql.js';

await dbConnectMysql();

try {
    await connection.promise().query('ALTER TABLE usuario MODIFY celular BIGINT NOT NULL');
    await connection.promise().query('ALTER TABLE acudiente MODIFY celular BIGINT NOT NULL');

    const [userColumns] = await connection.promise().query("SHOW COLUMNS FROM usuario LIKE 'celular'");
    const [guardianColumns] = await connection.promise().query("SHOW COLUMNS FROM acudiente LIKE 'celular'");

    console.log(`usuario.celular: ${userColumns[0].Type}`);
    console.log(`acudiente.celular: ${guardianColumns[0].Type}`);
} finally {
    await connection.promise().end();
}