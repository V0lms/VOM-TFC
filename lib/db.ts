import { neon } from "@neondatabase/serverless"

// Obtener URL de conexión a la base de datos
function getDatabaseUrl(): string {
  const possibleEnvVars = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "DATABASE_URL_UNPOOLED",
  ]

  for (const envVar of possibleEnvVars) {
    if (process.env[envVar]) {
      console.log(`Usando variable de entorno: ${envVar}`)
      return process.env[envVar] as string
    }
  }

  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const url = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}?sslmode=require`
    console.log("Construyendo URL desde variables PG individuales")
    return url
  }

  console.warn("No se encontró conexión a la base de datos.")
  return ""
}

const databaseUrl = getDatabaseUrl()
export const DEMO_MODE = !databaseUrl

// Crear conexión SQL solo si hay URL de base de datos
export const sql = DEMO_MODE
  ? null
  : (() => {
      console.log("🔗 Conectando a la base de datos:", databaseUrl.substring(0, 50) + "...")
      return neon(databaseUrl)
    })()

// Interfaces de datos
export interface Usuario {
  email: string
  user_name: string
  password_hash: string
}

export interface Album {
  name: string
  user_email: string
  description?: string
  date: Date
}

export interface Foto {
  id: string
  album_id: string
  title: string
  base64: string
  date: Date
}

export interface Nota {
  id: string
  album_id: string
  title: string
  content?: string
  date: Date
}

export interface Lugar {
  name: string
  album_id: string
  link?: string
  date: Date
}

// Función para verificar la conexión a la base de datos
export async function testDatabaseConnection(): Promise<boolean> {
  if (DEMO_MODE || !sql) {
    console.log("❌ Base de datos no configurada")
    return false
  }

  try {
    await sql`SELECT 1 as test`
    console.log("✅ Conexión a la base de datos exitosa")
    return true
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error)
    return false
  }
}

// Función helper para verificar si la BD está disponible
function checkDatabaseAvailable() {
  if (DEMO_MODE || !sql) {
    throw new Error("Base de datos no configurada. Por favor, configura las variables de entorno de la base de datos.")
  }
}

// Funciones de usuarios
export async function getUsuarioByEmail(email: string): Promise<Usuario | undefined> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`SELECT * FROM usuarios WHERE email = ${email} LIMIT 1`
    return result[0] as Usuario | undefined
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    throw error
  }
}

export async function createUsuario(usuario: Omit<Usuario, "id">): Promise<Usuario> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      INSERT INTO usuarios (email, user_name, password_hash)
      VALUES (${usuario.email}, ${usuario.user_name}, ${usuario.password_hash})
      RETURNING *
    `
    console.log("✅ Usuario creado en BD:", result[0]?.email)
    return result[0] as Usuario
  } catch (error) {
    console.error("❌ Error al crear usuario:", error)
    throw error
  }
}

// Funciones de álbumes
export async function getUserAlbums(email: string): Promise<Album[]> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`SELECT * FROM carpetas WHERE user_email = ${email} ORDER BY date DESC`
    return result as Album[]
  } catch (error) {
    console.error("Error al obtener álbumes:", error)
    throw error
  }
}

export async function getAlbumByName(name: string): Promise<Album | undefined> {
  console.log("🔍 Buscando álbum:", name)
  checkDatabaseAvailable()

  try {
    const result = await sql!`SELECT * FROM carpetas WHERE LOWER(name) = LOWER(${name}) LIMIT 1`
    console.log("📁 Álbum encontrado en BD:", result[0]?.name)
    return result[0] as Album | undefined
  } catch (error) {
    console.error("❌ Error al obtener álbum por nombre:", error)
    throw error
  }
}

export async function createAlbum(album: Omit<Album, "date">): Promise<Album> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      INSERT INTO carpetas (name, user_email, description)
      VALUES (${album.name}, ${album.user_email}, ${album.description || null})
      RETURNING *
    `
    console.log("✅ Álbum creado en BD:", result[0]?.name)
    return result[0] as Album
  } catch (error) {
    console.error("❌ Error al crear álbum:", error)
    throw error
  }
}

export async function deleteAlbum(name: string, userEmail: string): Promise<Album | undefined> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      DELETE FROM carpetas 
      WHERE name = ${name} AND user_email = ${userEmail}
      RETURNING *
    `
    console.log("🗑️ Álbum eliminado de BD:", result[0]?.name)
    return result[0] as Album | undefined
  } catch (error) {
    console.error("❌ Error al eliminar álbum:", error)
    throw error
  }
}

// Funciones de fotos
export async function getFotosByAlbum(albumId: string): Promise<Foto[]> {
  console.log("📸 Obteniendo fotos para el álbum:", albumId)
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      SELECT id, album_id, title, base64, date 
      FROM fotos 
      WHERE LOWER(album_id) = LOWER(${albumId})
      ORDER BY date DESC
    `
    console.log(`📸 Encontradas ${result.length} fotos en BD`)
    return result as Foto[]
  } catch (error) {
    console.error("❌ Error al obtener fotos:", error)
    throw error
  }
}

export async function createFoto(foto: Omit<Foto, "id" | "date">): Promise<Foto> {
  console.log("📸 Creando foto:", foto.title)
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      INSERT INTO fotos (album_id, title, base64)
      VALUES (${foto.album_id}, ${foto.title}, ${foto.base64})
      RETURNING id, album_id, title, base64, date
    `
    console.log("✅ Foto creada en BD:", result[0]?.id)
    return result[0] as Foto
  } catch (error) {
    console.error("❌ Error al crear foto:", error)
    throw error
  }
}

export async function deleteFoto(id: string, albumId: string): Promise<Foto | undefined> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      DELETE FROM fotos 
      WHERE id = ${id} AND LOWER(album_id) = LOWER(${albumId})
      RETURNING *
    `
    console.log("🗑️ Foto eliminada de BD:", result[0]?.id)
    return result[0] as Foto | undefined
  } catch (error) {
    console.error("❌ Error al eliminar foto:", error)
    throw error
  }
}

// Funciones de notas
export async function getNotasByAlbum(albumId: string): Promise<Nota[]> {
  console.log("📝 Obteniendo notas para el álbum:", albumId)
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      SELECT id, album_id, title, content, date 
      FROM notas 
      WHERE LOWER(album_id) = LOWER(${albumId})
      ORDER BY date DESC
    `
    console.log(`📝 Encontradas ${result.length} notas en BD`)
    return result as Nota[]
  } catch (error) {
    console.error("❌ Error al obtener notas:", error)
    throw error
  }
}

export async function createNota(nota: Omit<Nota, "id" | "date">): Promise<Nota> {
  console.log("📝 Creando nota:", nota.title)
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      INSERT INTO notas (album_id, title, content)
      VALUES (${nota.album_id}, ${nota.title}, ${nota.content || null})
      RETURNING id, album_id, title, content, date
    `
    console.log("✅ Nota creada en BD:", result[0]?.id)
    return result[0] as Nota
  } catch (error) {
    console.error("❌ Error al crear nota:", error)
    throw error
  }
}

export async function deleteNota(id: string, albumId: string): Promise<Nota | undefined> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      DELETE FROM notas 
      WHERE id = ${id} AND LOWER(album_id) = LOWER(${albumId})
      RETURNING *
    `
    console.log("🗑️ Nota eliminada de BD:", result[0]?.id)
    return result[0] as Nota | undefined
  } catch (error) {
    console.error("❌ Error al eliminar nota:", error)
    throw error
  }
}

// Funciones de lugares
export async function getLugaresByAlbum(albumId: string): Promise<Lugar[]> {
  console.log("📍 Obteniendo lugares para el álbum:", albumId)
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      SELECT name, album_id, link, date 
      FROM lugares 
      WHERE LOWER(album_id) = LOWER(${albumId})
      ORDER BY date DESC
    `
    console.log(`📍 Encontrados ${result.length} lugares en BD`)
    return result as Lugar[]
  } catch (error) {
    console.error("❌ Error al obtener lugares:", error)
    throw error
  }
}

export async function createLugar(lugar: Omit<Lugar, "date">): Promise<Lugar> {
  console.log("📍 Creando lugar:", lugar.name)
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      INSERT INTO lugares (name, album_id, link)
      VALUES (${lugar.name}, ${lugar.album_id}, ${lugar.link || null})
      RETURNING name, album_id, link, date
    `
    console.log("✅ Lugar creado en BD:", result[0]?.name)
    return result[0] as Lugar
  } catch (error) {
    console.error("❌ Error al crear lugar:", error)
    throw error
  }
}

export async function deleteLugar(name: string, albumId: string): Promise<Lugar | undefined> {
  checkDatabaseAvailable()

  try {
    const result = await sql!`
      DELETE FROM lugares 
      WHERE name = ${name} AND LOWER(album_id) = LOWER(${albumId})
      RETURNING *
    `
    console.log("🗑️ Lugar eliminado de BD:", result[0]?.name)
    return result[0] as Lugar | undefined
  } catch (error) {
    console.error("❌ Error al eliminar lugar:", error)
    throw error
  }
}
