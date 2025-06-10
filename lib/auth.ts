import { getUsuarioByEmail } from "./db"
import * as bcrypt from "bcryptjs"

// Función para verificar la contraseña
export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

// Función para hashear la contraseña
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

// Función para obtener el usuario actual
export async function getCurrentUser() {
  try {
    // En el servidor, usamos cookies() de next/headers
    if (typeof window === "undefined") {
      // Importación dinámica para evitar errores en el cliente
      const { cookies } = await import("next/headers")
      const userEmail = cookies().get("user_email")?.value

      if (!userEmail) {
        console.log("No se encontró cookie de usuario")
        return null
      }

      console.log("Buscando usuario con email:", userEmail)
      const user = await getUsuarioByEmail(userEmail)

      if (!user) {
        console.log("No se encontró usuario con el email:", userEmail)
        return null
      }

      console.log("Usuario encontrado:", user.email)
      return {
        email: user.email,
        name: user.user_name,
      }
    }
    // En el cliente, usamos document.cookie
    else {
      const userEmail = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_email_client="))
        ?.split("=")[1]

      if (!userEmail) {
        return null
      }

      // En el cliente, devolvemos solo la información básica
      return {
        email: decodeURIComponent(userEmail),
        name: "Usuario", // No podemos obtener el nombre en el cliente
      }
    }
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}

// Función para establecer la cookie de sesión
export async function setUserCookie(email: string) {
  if (typeof window === "undefined") {
    // En el servidor, establecemos tanto httpOnly como una cookie accesible desde el cliente
    const { cookies } = await import("next/headers")

    // Cookie httpOnly para seguridad en el servidor
    cookies().set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "lax",
    })

    // Cookie accesible desde el cliente para funcionalidad
    cookies().set("user_email_client", email, {
      httpOnly: false, // Accesible desde el cliente
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "lax",
    })
  } else {
    // En el cliente, establecemos la cookie accesible
    const encodedEmail = encodeURIComponent(email)
    document.cookie = `user_email_client=${encodedEmail}; path=/; max-age=${60 * 60 * 24 * 7}; ${
      process.env.NODE_ENV === "production" ? "secure;" : ""
    } samesite=lax;`
  }
}

// Función para eliminar la cookie de sesión
export async function clearUserCookie() {
  if (typeof window === "undefined") {
    // Importación dinámica para evitar errores en el cliente
    const { cookies } = await import("next/headers")
    cookies().delete("user_email")
    cookies().delete("user_email_client")
  } else {
    // En el cliente, eliminamos ambas cookies
    document.cookie = "user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "user_email_client=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

// Función para obtener el email del usuario desde el cliente
export function getUserEmailFromClient(): string | null {
  if (typeof window === "undefined") return null

  try {
    // Intentar obtener de la cookie accesible desde el cliente
    const userEmail = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_email_client="))
      ?.split("=")[1]

    if (userEmail) {
      return decodeURIComponent(userEmail)
    }

    // Fallback a la cookie original (aunque no debería ser accesible)
    const fallbackEmail = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_email="))
      ?.split("=")[1]

    return fallbackEmail ? decodeURIComponent(fallbackEmail) : null
  } catch (error) {
    console.error("Error al obtener email del usuario desde el cliente:", error)
    return null
  }
}
