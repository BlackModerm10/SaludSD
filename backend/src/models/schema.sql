-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    rut VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Centros de Salud
CREATE TABLE IF NOT EXISTS centros_salud (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    capacidad_diaria INT NOT NULL,
    ocupacion_actual INT DEFAULT 0,
    tiempo_espera_promedio INT DEFAULT 0
);

-- Tabla Relacional de Especialidades por Centro
CREATE TABLE IF NOT EXISTS especialidades_centro (
    centro_id VARCHAR(50),
    especialidad VARCHAR(100) NOT NULL,
    PRIMARY KEY (centro_id, especialidad),
    FOREIGN KEY (centro_id) REFERENCES centros_salud(id) ON DELETE CASCADE
);

-- Tabla de Listas de Espera
CREATE TABLE IF NOT EXISTS lista_espera (
    id VARCHAR(36) PRIMARY KEY,
    paciente_id VARCHAR(36) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    centro_id VARCHAR(50) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    prioridad VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'en_espera',
    tiempo_estimado_dias INT NOT NULL DEFAULT 30,
    posicion INT,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (centro_id) REFERENCES centros_salud(id) ON DELETE RESTRICT
);

-- Tabla de Citas Médicas
CREATE TABLE IF NOT EXISTS citas (
    id VARCHAR(36) PRIMARY KEY,
    paciente_id VARCHAR(36) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    medico VARCHAR(100) NOT NULL,
    centro_id VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (centro_id) REFERENCES centros_salud(id) ON DELETE RESTRICT
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATE NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    tipo VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
