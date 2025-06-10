"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deletePhotoAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface DeletePhotoButtonProps {
  photoId: string
  albumName: string
}

export function DeletePhotoButton({ photoId, albumName }: DeletePhotoButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que deseas eliminar esta foto?")) {
      return
    }

    setIsDeleting(true)

    try {
      const formData = new FormData()
      formData.append("photoId", photoId)
      formData.append("albumId", albumName)

      const result = await deletePhotoAction(formData)

      if (result.success) {
        toast({
          title: "Foto eliminada",
          description: "La foto se ha eliminado correctamente",
        })
        router.push(`/viaje/${encodeURIComponent(albumName)}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo eliminar la foto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar foto:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la foto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      <Trash2 className="mr-2 w-4 h-4" />
      Delete
    </Button>
  )
}
