"use server"

import { redirect } from "next/navigation"
import {
  createUsuario,
  getUsuarioByEmail,
  createAlbum,
  getUserAlbums as getUserAlbumsFromDB,
  createFoto,
  createNota,
  createLugar,
  deleteAlbum,
  deleteFoto,
  deleteNota,
  deleteLugar,
} from "@/lib/db"
import { hashPassword, verifyPassword, setUserCookie, clearUserCookie } from "@/lib/auth"

// Registro de usuario
export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string

  if (!email || !name || !password) {
    return { error: "Todos los campos son obligatorios" }
  }

  try {
    const existingUser = await getUsuarioByEmail(email)
    if (existingUser) {
      return { error: "El correo electrónico ya está registrado" }
    }

    const hashedPassword = await hashPassword(password)
    await createUsuario({
      email,
      user_name: name,
      password_hash: hashedPassword,
    })

    console.log("Usuario registrado, estableciendo cookies para:", email)
    await setUserCookie(email)
    return { success: true }
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return { error: "Error al crear la cuenta. Por favor, inténtalo de nuevo." }
  }
}

// Inicio de sesión
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Todos los campos son obligatorios" }
  }

  try {
    const user = await getUsuarioByEmail(email)
    if (!user) {
      return { error: "Credenciales incorrectas" }
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return { error: "Credenciales incorrectas" }
    }

    console.log("Usuario autenticado, estableciendo cookies para:", email)
    await setUserCookie(email)
    return { success: true }
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return { error: "Error al iniciar sesión. Por favor, inténtalo de nuevo." }
  }
}

// Cerrar sesión
export async function logoutUser() {
  await clearUserCookie()
  redirect("/")
}

// Crear álbum con mejor logging
export async function createNewAlbum(formData: FormData) {
  const name = formData.get("name") as string
  const userEmail = formData.get("userEmail") as string
  const description = (formData.get("description") as string) || ""

  console.log("createNewAlbum llamado con:", { name, userEmail, description })

  if (!name || !userEmail) {
    console.error("Faltan datos requeridos:", { name: !!name, userEmail: !!userEmail })
    return { error: "El nombre del viaje y el email del usuario son obligatorios" }
  }

  try {
    console.log("Creando álbum en la base de datos...")
    const newAlbum = await createAlbum({
      name,
      user_email: userEmail,
      description,
    })

    console.log("Álbum creado exitosamente:", newAlbum)
    return { success: true, album: newAlbum }
  } catch (error) {
    console.error("Error al crear viaje:", error)
    return { error: "Error al crear el viaje. Por favor, inténtalo de nuevo." }
  }
}

// Obtener álbumes con mejor manejo de errores
export async function getUserAlbums(userEmail: string) {
  try {
    if (!userEmail) {
      console.error("getUserAlbums: No se proporcionó email de usuario")
      return { error: "No se proporcionó email de usuario", albums: [] }
    }

    console.log("Obteniendo álbumes para:", userEmail)
    const albums = await getUserAlbumsFromDB(userEmail)
    console.log(`Se encontraron ${albums?.length || 0} álbumes para el usuario`)

    return { success: true, albums: albums || [] }
  } catch (error) {
    console.error("Error al obtener viajes:", error)
    return { error: "Error al obtener los viajes. Por favor, inténtalo de nuevo.", albums: [] }
  }
}

// Añadir foto
export async function addPhotoToAlbum(formData: FormData) {
  const albumId = formData.get("albumId") as string
  const title = formData.get("title") as string
  const base64 = formData.get("base64") as string

  console.log("Añadiendo foto:", { albumId, title, base64Length: base64?.length || 0 })

  if (!albumId || !title || !base64) {
    console.error("Faltan datos para añadir foto:", { albumId, title, base64: !!base64 })
    return { error: "Todos los campos son obligatorios" }
  }

  try {
    const newPhoto = await createFoto({
      album_id: albumId,
      title,
      base64,
    })

    console.log("Foto añadida con éxito:", newPhoto.id)
    return { success: true, photo: newPhoto }
  } catch (error) {
    console.error("Error al añadir foto:", error)
    return { error: "Error al añadir la foto. Por favor, inténtalo de nuevo." }
  }
}

// Añadir nota
export async function addNoteToAlbum(formData: FormData) {
  const albumId = formData.get("albumId") as string
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  console.log("Añadiendo nota:", { albumId, title, content })

  if (!albumId || !title) {
    console.error("Faltan datos para añadir nota:", { albumId, title })
    return { error: "El título es obligatorio" }
  }

  try {
    const newNote = await createNota({
      album_id: albumId,
      title,
      content,
    })

    console.log("Nota añadida con éxito:", newNote.id)
    return { success: true, note: newNote }
  } catch (error) {
    console.error("Error al añadir nota:", error)
    return { error: "Error al añadir la nota. Por favor, inténtalo de nuevo." }
  }
}

// Añadir lugar
export async function addPlaceToAlbum(formData: FormData) {
  const albumId = formData.get("albumId") as string
  const name = formData.get("name") as string
  const link = formData.get("link") as string

  console.log("Añadiendo lugar:", { albumId, name, link })

  if (!albumId || !name) {
    console.error("Faltan datos para añadir lugar:", { albumId, name })
    return { error: "El nombre es obligatorio" }
  }

  try {
    const newPlace = await createLugar({
      album_id: albumId,
      name,
      link,
    })

    console.log("Lugar añadido con éxito:", newPlace.name)
    return { success: true, place: newPlace }
  } catch (error) {
    console.error("Error al añadir lugar:", error)
    return { error: "Error al añadir el lugar. Por favor, inténtalo de nuevo." }
  }
}

// Eliminar álbum
export async function deleteAlbumAction(formData: FormData) {
  const albumName = formData.get("albumName") as string
  const userEmail = formData.get("userEmail") as string

  if (!albumName || !userEmail) {
    return { error: "Información insuficiente para eliminar el viaje" }
  }

  try {
    await deleteAlbum(albumName, userEmail)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar viaje:", error)
    return { error: "Error al eliminar el viaje. Por favor, inténtalo de nuevo." }
  }
}

// Eliminar foto
export async function deletePhotoAction(formData: FormData) {
  const photoId = formData.get("photoId") as string
  const albumId = formData.get("albumId") as string

  if (!photoId || !albumId) {
    return { error: "Información insuficiente para eliminar la foto" }
  }

  try {
    await deleteFoto(photoId, albumId)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar foto:", error)
    return { error: "Error al eliminar la foto. Por favor, inténtalo de nuevo." }
  }
}

// Eliminar nota
export async function deleteNoteAction(formData: FormData) {
  const noteId = formData.get("noteId") as string
  const albumId = formData.get("albumId") as string

  if (!noteId || !albumId) {
    return { error: "Información insuficiente para eliminar la nota" }
  }

  try {
    await deleteNota(noteId, albumId)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar nota:", error)
    return { error: "Error al eliminar la nota. Por favor, inténtalo de nuevo." }
  }
}

// Eliminar lugar
export async function deletePlaceAction(formData: FormData) {
  const placeName = formData.get("placeName") as string
  const albumId = formData.get("albumId") as string

  if (!placeName || !albumId) {
    return { error: "Información insuficiente para eliminar el lugar" }
  }

  try {
    await deleteLugar(placeName, albumId)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar lugar:", error)
    return { error: "Error al eliminar el lugar. Por favor, inténtalo de nuevo." }
  }
}
