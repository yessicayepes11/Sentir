import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;
const useSsl = String(process.env.MYSQL_SSL).toLowerCase() === 'true';
const RECONNECT_DELAY_MS = 3000;

function createConnection() {
    const nextConnection = mysql.createConnection(
        {
            host: host,
            user: username,
            password: password,
            database: database,
            port: Number(port),
            enableKeepAlive: true,
            ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        }
    );

    // Sin este manejador, una conexión cerrada por MySQL termina el proceso de Node
    nextConnection.on('error', (error) => {
        console.error('Conexión MySQL perdida:', error.code || error.message);
        if (error.fatal && connection === nextConnection) {
            scheduleReconnect();
        }
    });

    return nextConnection;
}

let connection = createConnection();
let reconnectTimer = null;

function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        const replacement = createConnection();
        try {
            await replacement.promise().connect();
            connection = replacement;
            console.log('Reconectado a la base de datos mysql');
        } catch (error) {
            console.error('No se pudo reconectar a MySQL:', error.message);
            replacement.destroy();
            scheduleReconnect();
        }
    }, RECONNECT_DELAY_MS);
}


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

