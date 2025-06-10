import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware para proteger rutas que requieren autenticación
export function middleware(request: NextRequest) {
  // Verificar ambas cookies
  const userEmail = request.cookies.get("user_email")?.value || request.cookies.get("user_email_client")?.value
  const path = request.nextUrl.pathname

  console.log("Middleware - Path:", path, "User email:", userEmail ? "presente" : "ausente")

  // Si el usuario no está autenticado y está intentando acceder a rutas protegidas específicas
  if (!userEmail && path.startsWith("/viaje")) {
    console.log("Redirigiendo a login desde:", path)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si el usuario está autenticado e intenta acceder a rutas de autenticación
  if (userEmail && (path.startsWith("/login") || path.startsWith("/register"))) {
    console.log("Usuario autenticado redirigiendo a dashboard desde:", path)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: ["/viaje/:path*", "/login", "/register"],
}
