-- btree_gist permite combinar igualdad (cancha_id) y solapamiento de rangos en una misma restricción
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE usuarios (
    id             BIGSERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    password       VARCHAR(100) NOT NULL,
    rol            VARCHAR(20)  NOT NULL,
    fecha_registro TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('ADMIN', 'CLIENTE'))
);

CREATE TABLE canchas (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(100)   NOT NULL,
    tipo            VARCHAR(20)    NOT NULL,
    precio_por_hora NUMERIC(12, 2) NOT NULL,
    hora_apertura   TIME           NOT NULL,
    hora_cierre     TIME           NOT NULL,
    activa          BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_canchas_nombre UNIQUE (nombre),
    CONSTRAINT ck_canchas_tipo CHECK (tipo IN ('FUTBOL_5', 'FUTBOL_8', 'FUTBOL_11')),
    CONSTRAINT ck_canchas_precio CHECK (precio_por_hora > 0),
    CONSTRAINT ck_canchas_horario CHECK (hora_cierre > hora_apertura)
);

CREATE TABLE reservas (
    id             BIGSERIAL PRIMARY KEY,
    usuario_id     BIGINT         NOT NULL REFERENCES usuarios (id),
    cancha_id      BIGINT         NOT NULL REFERENCES canchas (id),
    fecha          DATE           NOT NULL,
    hora_inicio    TIME           NOT NULL,
    hora_fin       TIME           NOT NULL,
    precio_total   NUMERIC(12, 2) NOT NULL,
    estado         VARCHAR(20)    NOT NULL,
    fecha_creacion TIMESTAMP      NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservas_horas CHECK (hora_fin > hora_inicio),
    CONSTRAINT ck_reservas_estado CHECK (estado IN ('CONFIRMADA', 'CANCELADA', 'COMPLETADA')),
    -- Segunda línea de defensa frente a reservas simultáneas: aunque el servicio bloquea la cancha,
    -- la base de datos rechaza cualquier par de reservas confirmadas que se solapen.
    CONSTRAINT ex_reservas_solapadas EXCLUDE USING gist (
        cancha_id WITH =,
        tsrange(fecha + hora_inicio, fecha + hora_fin) WITH &&
    ) WHERE (estado = 'CONFIRMADA')
);

CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_cancha_fecha ON reservas (cancha_id, fecha);
