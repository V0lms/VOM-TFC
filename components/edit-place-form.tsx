"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { deletePlaceAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface EditPlaceFormProps {
  place: {
    name: string
    link?: string
  }
  albumName: string
}

export function EditPlaceForm({ place, albumName }: EditPlaceFormProps) {
  const router = useRouter()
  const [name, setName] = useState(place.name)
  const [link, setLink] = useState(place.link || "")
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que deseas eliminar este lugar?")) {
      return
    }

    setIsDeleting(true)

    try {
      const formData = new FormData()
      formData.append("placeName", place.name)
      formData.append("albumId", albumName)

      const result = await deletePlaceAction(formData)

      if (result.success) {
        toast({
          title: "Lugar eliminado",
          description: "El lugar se ha eliminado correctamente",
        })
        router.push(`/viaje/${encodeURIComponent(albumName)}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo eliminar el lugar",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar lugar:", error)
      toast({
        title: "Error",
        description: "Error al eliminar el lugar",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Mapa placeholder */}
      <div className="flex justify-center items-center bg-gray-100 rounded-lg aspect-square">
        <div className="text-center text-gray-400">
          <div className="mx-auto mb-2 w-16 h-16 bg-gray-200 rounded"></div>
          <p>Map</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="mr-2 w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
