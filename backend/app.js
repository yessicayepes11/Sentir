
import './src/config/env.js';
import Server from './src/server/express.server.js';
import { dbConnectMysql } from './src/config/mysql/dbmysql.js';
import { iniciarRecordatorios } from './src/config/recordatorios.js';
import { prepararAvataresPersonal } from './src/config/avatarIA.js';


async function main() {
    try {
        // Conexión a la base de datos
        //await dbConnectMongoose();
        await dbConnectMysql();


        const server = new Server();
        await server.start();

        // Recordatorios de próximas citas e intervenciones (campanita + correo)
        iniciarRecordatorios();

        // Avatares del personal listos antes de que inicien sesión (banner de saludo)
        setTimeout(prepararAvataresPersonal, 10000);
    } catch (error) {
        process.exit(1);
    }
}

// Manejo de errores e inicio del servidor
main().catch(
    (error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    }
);