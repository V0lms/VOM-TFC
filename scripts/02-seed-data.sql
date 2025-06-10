-- Insertar usuario de ejemplo (contraseña: "demo123")
INSERT INTO usuarios (email, user_name, password_hash) 
VALUES (
    'demo@ejemplo.com', 
    'Usuario Demo', 
    '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC'
) ON CONFLICT (email) DO NOTHING;

-- Insertar álbumes de ejemplo
INSERT INTO carpetas (name, user_email, description) 
VALUES 
    ('Viaje a Barcelona', 'demo@ejemplo.com', 'Vacaciones de verano 2023'),
    ('Japón 2024', 'demo@ejemplo.com', 'Viaje a Japón en primavera')
ON CONFLICT (name, user_email) DO NOTHING;

-- Insertar notas de ejemplo
INSERT INTO notas (album_id, title, content) 
VALUES 
    ('Viaje a Barcelona', 'Lugares recomendados', 'La Sagrada Familia es imprescindible. También visitar el Parque Güell.'),
    ('Japón 2024', 'Consejos de viaje', 'Comprar el JR Pass antes del viaje. Los cerezos en flor están en su mejor momento en abril.')
ON CONFLICT DO NOTHING;

-- Insertar lugares de ejemplo
INSERT INTO lugares (name, album_id, link) 
VALUES 
    ('Sagrada Familia', 'Viaje a Barcelona', 'https://maps.google.com/?q=Sagrada+Familia+Barcelona'),
    ('Templo Senso-ji', 'Japón 2024', 'https://maps.google.com/?q=Senso-ji+Temple+Tokyo')
ON CONFLICT (name, album_id) DO NOTHING;
