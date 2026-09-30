import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;
const connection = mysql.createConnection(
    {
        host: host,
        user: username,
        password: password, 
        database: database,
        port: Number(port),
    }
);


const dbConnectMysql = async () => {
    try {
        await connection.promise().connect();
        console.log('Conectado a la base de datos mysql');
    } catch (error) {
        console.error('No se pudo conectar a MySQL:', error.message);
        throw error;
    }
}

export { connection, dbConnectMysql };

