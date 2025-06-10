"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, Plus, Loader2 } from "lucide-react"
import { createNewAlbum } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface CreateAlbumFallbackProps {
  viajeName: string
  userEmail: string
}

export function CreateAlbumFallback({ viajeName, userEmail }: CreateAlbumFallbackProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreateAlbum() {
    try {
      setIsCreating(true)

      const formData = new FormData()
      formData.append("name", viajeName)
      formData.append("userEmail", userEmail)
      formData.append("description", `Viaje a ${viajeName}`)

      const result = await createNewAlbum(formData)

      if (result.success) {
        toast({
          title: "Álbum creado",
          description: `El álbum "${viajeName}" ha sido creado correctamente`,
        })
        // Recargar la página para mostrar el álbum creado
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear el álbum",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear álbum:", error)
      toast({
        title: "Error",
        description: "Error al crear el álbum",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center px-4 h-14 bg-white border-b lg:px-6">
        <Link className="flex justify-center items-center" href="/dashboard">
          <ArrowLeft className="mr-2 w-4 h-4" />
          <span className="font-medium">Volver al Panel</span>
        </Link>
      </header>
      <main className="flex flex-1 justify-center items-center">
        <div className="p-6 max-w-md text-center bg-white rounded-lg border">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-amber-500" />
          <h1 className="mb-4 text-2xl font-bold">Álbum no encontrado</h1>
          <p className="mb-6 text-gray-600">
            El álbum <strong>"{viajeName}"</strong> no existe. ¿Te gustaría crearlo?
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleCreateAlbum} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creando álbum...
                </>
              ) : (
                <>
                  <Plus className="mr-2 w-4 h-4" />
                  Crear álbum "{viajeName}"
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
