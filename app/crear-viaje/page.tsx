"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { createNewAlbum } from "@/app/actions"
import { useUser } from "@/lib/user-context"
import { getUserEmailFromClient } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export default function CrearViajePage() {
  const router = useRouter()
  const { getUserEmail, refreshUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Función de debugging para mostrar información de cookies
  useEffect(() => {
    const checkUserInfo = () => {
      const emailFromContext = getUserEmail()
      const emailFromCookies = getUserEmailFromClient()
      const allCookies = document.cookie

      const debug = `
Debug Info:
- Email desde contexto: ${emailFromContext || "No encontrado"}
- Email desde cookies: ${emailFromCookies || "No encontrado"}
- Todas las cookies: ${allCookies || "Ninguna"}
      `.trim()

      setDebugInfo(debug)
      console.log("Debug info:", debug)
    }

    checkUserInfo()

    // Refrescar usuario al cargar la página
    refreshUser()
  }, [getUserEmail, refreshUser])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)

    // Intentar múltiples métodos para obtener el email
    let userEmail = getUserEmail()

    if (!userEmail) {
      console.log("No se encontró email en contexto, intentando cookies directamente...")
      userEmail = getUserEmailFromClient()
    }

    if (!userEmail) {
      console.log("No se encontró email en cookies, intentando refrescar...")
      refreshUser()
      // Esperar un momento y volver a intentar
      setTimeout(() => {
        userEmail = getUserEmail()
      }, 100)
    }

    console.log("Email final obtenido:", userEmail)

    if (!userEmail) {
      const errorMsg = "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente."
      setError(errorMsg)
      setIsLoading(false)

      toast({
        title: "Error de autenticación",
        description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })

      // Mostrar información de debug
      console.error("Error de autenticación. Debug info:", debugInfo)

      setTimeout(() => {
        router.push("/login")
      }, 3000)

      return
    }

    formData.append("userEmail", userEmail)

    try {
      console.log("Creando álbum con email:", userEmail)
      const result = await createNewAlbum(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      toast({
        title: "¡Viaje creado!",
        description: `El viaje "${formData.get("name")}" ha sido creado correctamente.`,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error al crear el viaje:", error)
      setError("Error al crear el viaje. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="font-medium">Volver al Panel</span>
        </Link>
      </header>
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crear Nuevo Viaje</CardTitle>
            <CardDescription>Dale un nombre a tu nueva aventura.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Viaje</Label>
                <Input id="name" name="name" placeholder="ej., Roma 2023" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea id="description" name="description" placeholder="Describe tu viaje..." rows={3} />
              </div>

              {/* Mostrar información de debug en desarrollo */}
              {process.env.NODE_ENV === "development" && debugInfo && (
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <pre>{debugInfo}</pre>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                    {process.env.NODE_ENV === "development" && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">Información de debug</summary>
                        <pre className="mt-1 text-xs">{debugInfo}</pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Viaje"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
