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
import CitasEstudianteRouter from '../routes/Estudiante/Citas.js';
import AsistenteRouter from '../routes/Asistente/Asistente.js';
import BienestarRouter from '../routes/Bienestar/Bienestar.js';
import PerfilDocenteRouter from '../routes/Docente/Perfil.js';
import PsicologiaRouter from '../routes/Psicologia/Psicologia.js';
import ActividadesPsicologiaRouter from '../routes/Psicologia/Actividades.js';
import PanelIAPsicologiaRouter from '../routes/Psicologia/PanelIA.js';
import ActividadesEstudianteRouter from '../routes/Estudiante/Actividades.js';
import AvatarRouter from '../routes/Avatar/Avatar.js';

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

        // Cada avatar tiene un nombre único (cambia cuando se crea uno nuevo): el navegador lo guarda
        // en caché y no lo vuelve a descargar en cada página
        this.app.use('/uploads/avatares', express.static(path.join(uploadsDir, 'avatares'), { maxAge: '365d', immutable: true }));
        this.app.use('/uploads', express.static(uploadsDir));
    }

    routes() {
        this.app.use('/api/CrearUsuario', CrearUsuarioRouter);
        this.app.use('/api/InicioSesion', InicioSesionRouter);
        this.app.use('/api/Ayuda', AyudaRouter);
        this.app.use('/api/Emocion', EmocionRouter);
        this.app.use('/api/Diario', DiarioRouter);
        this.app.use('/api/Estudiante', PerfilEstudianteRouter);
        this.app.use('/api/Estudiante', CitasEstudianteRouter);
        this.app.use('/api/Asistente', AsistenteRouter);
        this.app.use('/api/Bienestar', BienestarRouter);
        this.app.use('/api/Docente', PerfilDocenteRouter);
        this.app.use('/api/Psicologia', PsicologiaRouter);
        this.app.use('/api/Psicologia', ActividadesPsicologiaRouter);
        this.app.use('/api/Psicologia', PanelIAPsicologiaRouter);
        this.app.use('/api/Estudiante', ActividadesEstudianteRouter);
        this.app.use('/api/Avatar', AvatarRouter);
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
