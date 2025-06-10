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

  console.warn("No se encontró conexión a la base de datos. Usando modo de demostración.")
  return ""
}

const databaseUrl = getDatabaseUrl()
const DEMO_MODE = !databaseUrl

// Datos de ejemplo para el modo de demostración
const demoData = {
  usuarios: [
    {
      email: "demo@ejemplo.com",
      user_name: "Usuario Demo",
      password_hash: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC",
    },
  ],
  carpetas: [
    {
      name: "Viaje a Barcelona",
      user_email: "demo@ejemplo.com",
      description: "Vacaciones de verano 2023",
      date: new Date("2023-07-15"),
    },
    {
      name: "Japón 2024",
      user_email: "demo@ejemplo.com",
      description: "Viaje a Japón 2024",
      date: new Date("2024-03-10"),
    },
  ],
  fotos: [],
  notas: [
    {
      id: "demo-nota-1",
      album_id: "Viaje a Barcelona",
      title: "Lugares recomendados",
      content: "La Sagrada Familia es imprescindible. También visitar el Parque Güell.",
      date: new Date("2023-07-16"),
    },
    {
      id: "demo-nota-2",
      album_id: "Japón 2024",
      title: "Consejos de viaje",
      content: "Comprar el JR Pass antes del viaje. Los cerezos en flor están en su mejor momento en abril.",
      date: new Date("2024-03-11"),
    },
  ],
  lugares: [
    {
      name: "Sagrada Familia",
      album_id: "Viaje a Barcelona",
      link: "https://maps.google.com/?q=Sagrada+Familia+Barcelona",
      date: new Date("2023-07-16"),
    },
    {
      name: "Templo Senso-ji",
      album_id: "Japón 2024",
      link: "https://maps.google.com/?q=Senso-ji+Temple+Tokyo",
      date: new Date("2024-03-11"),
    },
  ],
}

export const sql = DEMO_MODE
  ? (() => {
      console.log("🔄 Usando modo de demostración con datos de ejemplo")
      return () => Promise.resolve([])
    })()
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
  if (DEMO_MODE) {
    console.log("✅ Modo demo activo - no se requiere conexión a BD")
    return true
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

// Funciones de usuarios
export async function getUsuarioByEmail(email: string): Promise<Usuario | undefined> {
  if (DEMO_MODE) {
    return demoData.usuarios.find((u) => u.email === email)
  }

  try {
    const result = await sql`SELECT * FROM usuarios WHERE email = ${email} LIMIT 1`
    return result[0] as Usuario | undefined
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return undefined
  }
}

export async function createUsuario(usuario: Omit<Usuario, "id">): Promise<Usuario> {
  if (DEMO_MODE) {
    const newUser = { ...usuario }
    demoData.usuarios.push(newUser)
    console.log("✅ Usuario creado en modo demo:", newUser.email)
    return newUser
  }

  try {
    const result = await sql`
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
  if (DEMO_MODE) {
    return demoData.carpetas.filter((c) => c.user_email === email)
  }

  try {
    const result = await sql`SELECT * FROM carpetas WHERE user_email = ${email} ORDER BY date DESC`
    return result as Album[]
  } catch (error) {
    console.error("Error al obtener álbumes:", error)
    return []
  }
}

export async function getAlbumByName(name: string): Promise<Album | undefined> {
  console.log("🔍 Buscando álbum:", name)

  if (DEMO_MODE) {
    const album = demoData.carpetas.find((c) => c.name.toLowerCase() === name.toLowerCase())
    console.log("📁 Álbum encontrado en modo demo:", album?.name)
    return album
  }

  try {
    const result = await sql`SELECT * FROM carpetas WHERE LOWER(name) = LOWER(${name}) LIMIT 1`
    console.log("📁 Álbum encontrado en BD:", result[0]?.name)
    return result[0] as Album | undefined
  } catch (error) {
    console.error("❌ Error al obtener álbum por nombre:", error)
    return undefined
  }
}

export async function createAlbum(album: Omit<Album, "date">): Promise<Album> {
  if (DEMO_MODE) {
    const newAlbum = { ...album, date: new Date() }
    demoData.carpetas.push(newAlbum)
    console.log("✅ Álbum creado en modo demo:", newAlbum.name)
    return newAlbum
  }

  try {
    const result = await sql`
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
  if (DEMO_MODE) {
    const index = demoData.carpetas.findIndex((c) => c.name === name && c.user_email === userEmail)
    if (index !== -1) {
      const deleted = demoData.carpetas[index]
      demoData.carpetas.splice(index, 1)
      console.log("🗑️ Álbum eliminado en modo demo:", deleted.name)
      return deleted
    }
    return undefined
  }

  try {
    const result = await sql`
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

  if (DEMO_MODE) {
    const results = demoData.fotos.filter((f) => f.album_id.toLowerCase() === albumId.toLowerCase())
    console.log(`📸 Encontradas ${results.length} fotos en modo demo`)
    return results as Foto[]
  }

  try {
    const result = await sql`
      SELECT id, album_id, title, base64, date 
      FROM fotos 
      WHERE LOWER(album_id) = LOWER(${albumId})
      ORDER BY date DESC
    `
    console.log(`📸 Encontradas ${result.length} fotos en BD`)
    return result as Foto[]
  } catch (error) {
    console.error("❌ Error al obtener fotos:", error)
    return []
  }
}

export async function createFoto(foto: Omit<Foto, "id" | "date">): Promise<Foto> {
  console.log("📸 Creando foto:", foto.title)

  if (DEMO_MODE) {
    const newFoto = {
      id: `demo-${Date.now()}`,
      album_id: foto.album_id,
      title: foto.title,
      base64: foto.base64,
      date: new Date(),
    }
    demoData.fotos.push(newFoto)
    console.log("✅ Foto creada en modo demo:", newFoto.id)
    return newFoto as Foto
  }

  try {
    const result = await sql`
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
  if (DEMO_MODE) {
    const index = demoData.fotos.findIndex((f) => f.id === id && f.album_id.toLowerCase() === albumId.toLowerCase())
    if (index !== -1) {
      const deleted = demoData.fotos[index]
      demoData.fotos.splice(index, 1)
      console.log("🗑️ Foto eliminada en modo demo:", deleted.id)
      return deleted as Foto | undefined
    }
    return undefined
  }

  try {
    const result = await sql`
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

  if (DEMO_MODE) {
    const results = demoData.notas.filter((n) => n.album_id.toLowerCase() === albumId.toLowerCase())
    console.log(`📝 Encontradas ${results.length} notas en modo demo`)
    return results as Nota[]
  }

  try {
    const result = await sql`
      SELECT id, album_id, title, content, date 
      FROM notas 
      WHERE LOWER(album_id) = LOWER(${albumId})
      ORDER BY date DESC
    `
    console.log(`📝 Encontradas ${result.length} notas en BD`)
    return result as Nota[]
  } catch (error) {
    console.error("❌ Error al obtener notas:", error)
    return []
  }
}

export async function createNota(nota: Omit<Nota, "id" | "date">): Promise<Nota> {
  console.log("📝 Creando nota:", nota.title)

  if (DEMO_MODE) {
    const newNota = {
      id: `demo-${Date.now()}`,
      album_id: nota.album_id,
      title: nota.title,
      content: nota.content,
      date: new Date(),
    }
    demoData.notas.push(newNota)
    console.log("✅ Nota creada en modo demo:", newNota.id)
    return newNota as Nota
  }

  try {
    const result = await sql`
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
  if (DEMO_MODE) {
    const index = demoData.notas.findIndex((n) => n.id === id && n.album_id.toLowerCase() === albumId.toLowerCase())
    if (index !== -1) {
      const deleted = demoData.notas[index]
      demoData.notas.splice(index, 1)
      console.log("🗑️ Nota eliminada en modo demo:", deleted.id)
      return deleted as Nota | undefined
    }
    return undefined
  }

  try {
    const result = await sql`
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

  if (DEMO_MODE) {
    const results = demoData.lugares.filter((l) => l.album_id.toLowerCase() === albumId.toLowerCase())
    console.log(`📍 Encontrados ${results.length} lugares en modo demo`)
    return results as Lugar[]
  }

  try {
    const result = await sql`
      SELECT name, album_id, link, date 
      FROM lugares 
      WHERE LOWER(album_id) = LOWER(${albumId})
      ORDER BY date DESC
    `
    console.log(`📍 Encontrados ${result.length} lugares en BD`)
    return result as Lugar[]
  } catch (error) {
    console.error("❌ Error al obtener lugares:", error)
    return []
  }
}

export async function createLugar(lugar: Omit<Lugar, "date">): Promise<Lugar> {
  console.log("📍 Creando lugar:", lugar.name)

  if (DEMO_MODE) {
    const newLugar = {
      name: lugar.name,
      album_id: lugar.album_id,
      link: lugar.link,
      date: new Date(),
    }
    demoData.lugares.push(newLugar)
    console.log("✅ Lugar creado en modo demo:", newLugar.name)
    return newLugar as Lugar
  }

  try {
    const result = await sql`
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
  if (DEMO_MODE) {
    const index = demoData.lugares.findIndex(
      (l) => l.name === name && l.album_id.toLowerCase() === albumId.toLowerCase(),
    )
    if (index !== -1) {
      const deleted = demoData.lugares[index]
      demoData.lugares.splice(index, 1)
      console.log("🗑️ Lugar eliminado en modo demo:", deleted.name)
      return deleted as Lugar | undefined
    }
    return undefined
  }

  try {
    const result = await sql`
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
