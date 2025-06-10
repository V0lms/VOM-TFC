"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Database } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis de errores
    console.error(error)
  }, [error])

  // Determinar si es un error de base de datos
  const isDatabaseError = error.message.includes("base de datos") || error.message.includes("database")

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {isDatabaseError ? (
              <Database className="h-6 w-6 text-red-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-500" />
            )}
            <CardTitle className="text-2xl">Algo salió mal</CardTitle>
          </div>
          <CardDescription>
            {isDatabaseError
              ? "No se pudo conectar a la base de datos. Esto puede deberse a un problema de configuración."
              : "Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">
              {error.message || "Error desconocido. Por favor, contacta al soporte técnico."}
            </p>
          </div>

          {isDatabaseError && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">Posibles soluciones:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verifica que las variables de entorno de la base de datos estén configuradas correctamente</li>
                <li>Asegúrate de que la base de datos esté en funcionamiento</li>
                <li>Comprueba que las tablas necesarias existan en la base de datos</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
          <Button onClick={() => reset()}>Intentar de nuevo</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
