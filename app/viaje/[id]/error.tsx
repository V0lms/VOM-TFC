"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="font-medium">Volver al Panel</span>
        </Link>
      </header>
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error al cargar el viaje</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message || "No se pudo cargar la información del viaje. Por favor, inténtalo de nuevo."}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Volver al panel</Link>
            </Button>
            <Button onClick={() => reset()}>Intentar de nuevo</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
