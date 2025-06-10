-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    email VARCHAR(255) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de carpetas (álbumes)
CREATE TABLE IF NOT EXISTS carpetas (
    name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (name, user_email),
    FOREIGN KEY (user_email) REFERENCES usuarios(email) ON DELETE CASCADE
);

-- Crear tabla de fotos
CREATE TABLE IF NOT EXISTS fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    base64 TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de notas
CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de lugares
CREATE TABLE IF NOT EXISTS lugares (
    name VARCHAR(255) NOT NULL,
    album_id VARCHAR(255) NOT NULL,
    link TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (name, album_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_carpetas_user_email ON carpetas(user_email);
CREATE INDEX IF NOT EXISTS idx_fotos_album_id ON fotos(album_id);
CREATE INDEX IF NOT EXISTS idx_notas_album_id ON notas(album_id);
CREATE INDEX IF NOT EXISTS idx_lugares_album_id ON lugares(album_id);
