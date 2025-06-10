import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    // Filtrar información sensible
    const safeCookies = allCookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.name === "user_email" ? "***REDACTED***" : "***HIDDEN***",
      exists: true,
      path: cookie.path || "/",
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
    }))

    return NextResponse.json({
      status: "ok",
      cookieCount: allCookies.length,
      cookies: safeCookies,
      hasUserEmail: allCookies.some((c) => c.name === "user_email"),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error al obtener cookies:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Error al obtener información de cookies",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
