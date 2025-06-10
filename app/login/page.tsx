"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loginUser } from "@/app/actions"

// Página de inicio de sesión
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Maneja el envío del formulario de inicio de sesión
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData(event.currentTarget)
      const result = await loginUser(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Redirigir al dashboard o a la URL de redirección en caso de éxito
      router.push(redirectUrl)
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" placeholder="juan@ejemplo.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" required type="password" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-teal-500 hover:underline font-medium">
                Crear cuenta nueva
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
