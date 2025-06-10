import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUsuarioByEmail } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

// Ruta para obtener el usuario actual
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await getUsuarioByEmail(userEmail)

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // No devolver la contraseña hash
    return NextResponse.json(
      {
        user: {
          email: user.email,
          name: user.user_name,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Ruta para iniciar sesión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    const user = await getUsuarioByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Establecer cookie
    cookies().set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    return NextResponse.json(
      {
        user: {
          email: user.email,
          name: user.user_name,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Ruta para cerrar sesión
export async function DELETE(request: NextRequest) {
  try {
    cookies().delete("user_email")
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
