import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CrearUsuarioRouter from '../routes/Secretaria/CrearUsuario/CrearUsuario.js';
import InicioSesionRouter from '../routes/InicioSesion/InicioSesion.js';
import AyudaRouter from '../routes/Ayuda/Ayuda.js';
import EmocionRouter from '../routes/Emocion/Emocion.js';
import DiarioRouter from '../routes/Diario/Diario.js';
import PerfilEstudianteRouter from '../routes/Estudiante/Perfil.js';
import AsistenteRouter from '../routes/Asistente/Asistente.js';

const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

class Server {
    constructor() {
        this.app = express();
        this.port = 3001;
        this.middleware();
        this.routes();
        this.handleErrors();
    }

    middleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use('/uploads', express.static(uploadsDir));
    }

    routes() {
        this.app.use('/api/CrearUsuario', CrearUsuarioRouter);
        this.app.use('/api/InicioSesion', InicioSesionRouter);
        this.app.use('/api/Ayuda', AyudaRouter);
        this.app.use('/api/Emocion', EmocionRouter);
        this.app.use('/api/Diario', DiarioRouter);
        this.app.use('/api/Estudiante', PerfilEstudianteRouter);
        this.app.use('/api/Asistente', AsistenteRouter);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Conectado al puerto ${this.port}`);
        });
    }

    handleErrors() {
        this.app.use((err, req, res, next) => {
            if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
                console.error("JSON inválido en la petición:", err.message);
                return res.status(400).json({ message: "JSON inválido en la petición" });
            }
            next(err);
        });
    }
}

export default Server;
