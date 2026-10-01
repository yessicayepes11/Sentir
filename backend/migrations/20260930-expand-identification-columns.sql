-- Run against the Sentir database before creating records with IDs above INT range.
-- Existing INT foreign keys must be removed before their columns can be widened.
ALTER TABLE ayuda DROP FOREIGN KEY ayuda_ibfk_1;
ALTER TABLE disponibilidad DROP FOREIGN KEY disponibilidad_ibfk_1;
ALTER TABLE docente DROP FOREIGN KEY docente_ibfk_1;
ALTER TABLE estudiante
    DROP FOREIGN KEY estudiante_ibfk_1,
    DROP FOREIGN KEY estudiante_ibfk_2;
ALTER TABLE estudiante_docente DROP FOREIGN KEY estudiante_docente_ibfk_1;
ALTER TABLE intervension DROP FOREIGN KEY intervension_ibfk_1;
ALTER TABLE relajacion DROP FOREIGN KEY relajacion_ibfk_1;

ALTER TABLE usuario MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE acudiente MODIFY id_acudiente BIGINT NOT NULL;
ALTER TABLE ayuda MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE cita MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE disponibilidad MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE docente MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE estudiante
    MODIFY id_usuario BIGINT NOT NULL,
    MODIFY id_acudiente BIGINT NOT NULL;
ALTER TABLE estudiante_docente MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE intervension MODIFY id_usuario BIGINT NOT NULL;
ALTER TABLE relajacion MODIFY id_usuario BIGINT NOT NULL;

ALTER TABLE ayuda
    ADD CONSTRAINT ayuda_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario);
ALTER TABLE disponibilidad
    ADD CONSTRAINT disponibilidad_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario);
ALTER TABLE docente
    ADD CONSTRAINT docente_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario);
ALTER TABLE estudiante
    ADD CONSTRAINT estudiante_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    ADD CONSTRAINT estudiante_ibfk_2 FOREIGN KEY (id_acudiente) REFERENCES acudiente (id_acudiente);
ALTER TABLE estudiante_docente
    ADD CONSTRAINT estudiante_docente_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario);
ALTER TABLE intervension
    ADD CONSTRAINT intervension_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario);
ALTER TABLE relajacion
    ADD CONSTRAINT relajacion_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario);