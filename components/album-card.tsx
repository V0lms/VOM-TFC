"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { deleteAlbumAction } from "@/app/actions"
import { Button } from "@/components/ui/button"

interface AlbumCardProps {
  album: {
    name: string
    description?: string
    date: Date
  }
  userEmail: string
}

export function AlbumCard({ album, userEmail }: AlbumCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAlbum() {
    setIsDeleting(true)
    try {
      const formData = new FormData()
      formData.append("albumName", album.name)
      formData.append("userEmail", userEmail)

      await deleteAlbumAction(formData)
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar álbum:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="h-full transition-shadow hover:shadow-md group">
      <CardHeader className="relative">
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <ConfirmDialog
            title="¿Eliminar álbum?"
            description={`¿Estás seguro de que deseas eliminar el álbum "${album.name}"? Esta acción no se puede deshacer y se eliminarán todas las fotos, notas y lugares asociados.`}
            onConfirm={handleDeleteAlbum}
            variant="ghost"
            size="icon"
          />
        </div>
        <CardTitle className="flex items-center">
          <Folder className="mr-2 w-5 h-5 text-teal-500" />
          {album.name}
        </CardTitle>
        <CardDescription>{album.description || "Sin descripción"}</CardDescription>
      </CardHeader>
      <Link href={`/viaje/${encodeURIComponent(album.name)}`}>
        <CardContent>
          <div className="flex justify-center items-center h-32 bg-gray-100 rounded-md dark:bg-gray-800">
            <p className="text-sm text-gray-500">Vista previa no disponible</p>
          </div>
        </CardContent>
      </Link>
      <CardFooter>
        <p className="text-sm text-gray-500">Creado el {new Date(album.date).toLocaleDateString()}</p>
        <Link href={`/viaje/${encodeURIComponent(album.name)}`} className="mt-2 w-full">
          <Button size="sm" className="w-full">
            Entrar Carpeta
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
