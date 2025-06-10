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
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { createNewAlbum } from "@/app/actions"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { getUserEmailFromClient } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

interface CreateAlbumModalProps {
  userEmail?: string
  children?: React.ReactNode
}

export function CreateAlbumModal({ userEmail: propUserEmail, children }: CreateAlbumModalProps) {
  const router = useRouter()
  const { getUserEmail, refreshUser } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const form = event.currentTarget
    const formData = new FormData(form)

    // Intentar múltiples métodos para obtener el email
    let userEmail = propUserEmail || getUserEmail()

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

      // Cerrar el modal y limpiar el formulario
      setIsOpen(false)
      if (form) {
        form.reset()
      }
      setError("")

      // Actualizar la página para mostrar el nuevo álbum
      router.refresh()
    } catch (error) {
      console.error("Error al crear el viaje:", error)
      setError("Error al crear el viaje. Por favor, inténtalo de nuevo.")
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Dale un nombre a tu nueva aventura y comienza a documentar tus recuerdos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Viaje</Label>
              <Input id="name" name="name" placeholder="ej., Roma 2023" required className="col-span-3" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe tu viaje..."
                rows={3}
                className="col-span-3"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Viaje"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
