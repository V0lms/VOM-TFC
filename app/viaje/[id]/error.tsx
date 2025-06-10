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
      <header className="flex items-center px-4 h-14 border-b lg:px-6">
        <Link className="flex justify-center items-center" href="/dashboard">
          <ArrowLeft className="mr-2 w-4 h-4" />
          <span className="font-medium">Volver al Panel</span>
        </Link>
      </header>
      <main className="flex flex-1 justify-center items-center p-4 md:p-6">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <Database className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Error al cargar el viaje</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error.message || "No se pudo cargar la información del viaje. Por favor, inténtalo de nuevo."}
          </p>
          <div className="flex flex-col gap-2 justify-center sm:flex-row">
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
