-- Usuarios de prueba (contraseñas cifradas con BCrypt):
--   admin@canchaya.com   / Admin123*
--   cliente@canchaya.com / Cliente123*
INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Administrador', 'admin@canchaya.com',
     '$2a$10$K3l3Pr1OfKvKvGkKHIF11ee7lugwzB6tsCbHnlk3UzUSi.uSdunrK', 'ADMIN'),
    ('Cliente Demo', 'cliente@canchaya.com',
     '$2a$10$i66d/h6muFDrf/9UTumJguqalRTgU5SQp3xxsxeNw0JE5LMW9Xm.u', 'CLIENTE');

INSERT INTO canchas (nombre, tipo, precio_por_hora, hora_apertura, hora_cierre) VALUES
    ('Cancha Principal', 'FUTBOL_5', 80000, '08:00', '23:00'),
    ('Cancha Sintética Norte', 'FUTBOL_5', 70000, '07:00', '22:00'),
    ('Cancha El Estadio', 'FUTBOL_8', 120000, '08:00', '22:00'),
    ('Cancha Mundialista', 'FUTBOL_11', 250000, '06:00', '21:00');
