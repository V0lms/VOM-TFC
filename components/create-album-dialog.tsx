"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createNewAlbum } from "@/app/actions"
import { useRouter } from "next/navigation"
// Importar el contexto de usuario
import { useUser } from "@/lib/user-context"

// Modificar el componente para usar el contexto
export function CreateAlbumDialog({
  userEmail: propUserEmail,
  children,
}: {
  userEmail: string
  children?: React.ReactNode
}) {
  const router = useRouter()
  const { getUserEmail } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Maneja la creación de un nuevo álbum
  async function handleCreateAlbum(formData: FormData) {
    setIsLoading(true)
    setError("")

    // Usar el email del contexto como fallback si no se proporciona como prop
    const userEmail = propUserEmail || getUserEmail()

    if (!userEmail) {
      setError("No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.")
      setIsLoading(false)
      return
    }

    // Añadir el email del usuario al formulario
    formData.append("userEmail", userEmail)

    try {
      const result = await createNewAlbum(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Cerrar el diálogo y actualizar la página
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      setError("Error al crear el viaje. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Viaje
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Viaje</DialogTitle>
          <DialogDescription>Dale un nombre a tu nueva aventura.</DialogDescription>
        </DialogHeader>
        <form action={handleCreateAlbum}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Viaje</Label>
              <Input id="name" name="name" placeholder="ej., Roma 2023" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea id="description" name="description" placeholder="Describe tu viaje..." rows={3} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
