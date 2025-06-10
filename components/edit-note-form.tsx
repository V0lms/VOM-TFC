"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Save } from "lucide-react"
import { deleteNoteAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface EditNoteFormProps {
  note: {
    id: string
    title: string
    content?: string
  }
  albumName: string
}

export function EditNoteForm({ note, albumName }: EditNoteFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave() {
    setIsSaving(true)

    try {
      // Aquí iría la lógica para actualizar la nota
      // Por ahora solo mostramos un toast
      toast({
        title: "Nota guardada",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar nota:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
      return
    }

    setIsDeleting(true)

    try {
      const formData = new FormData()
      formData.append("noteId", note.id)
      formData.append("albumId", albumName)

      const result = await deleteNoteAction(formData)

      if (result.success) {
        toast({
          title: "Nota eliminada",
          description: "La nota se ha eliminado correctamente",
        })
        router.push(`/viaje/${encodeURIComponent(albumName)}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo eliminar la nota",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar nota:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la nota",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="content">Contenido</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="mt-1"
            placeholder="Escribe tu nota aquí..."
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="mr-2 w-4 h-4" />
          Delete
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  )
}
