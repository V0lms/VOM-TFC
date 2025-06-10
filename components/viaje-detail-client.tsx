"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Camera, MapPin, PenSquare, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react"
import {
  addPhotoToAlbum,
  addNoteToAlbum,
  addPlaceToAlbum,
  deletePhotoAction,
  deleteNoteAction,
  deletePlaceAction,
} from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ViajeDetailClientProps {
  viaje: {
    name: string
    description?: string
    date: Date
    user_email: string
  }
  initialFotos: any[]
  initialNotas: any[]
  initialLugares: any[]
}

export function ViajeDetailClient({ viaje, initialFotos, initialNotas, initialLugares }: ViajeDetailClientProps) {
  const router = useRouter()

  // Estados para los datos
  const [fotos, setFotos] = useState(initialFotos)
  const [notas, setNotas] = useState(initialNotas)
  const [lugares, setLugares] = useState(initialLugares)

  // Estados para los modales
  const [isAddPhotoDialogOpen, setIsAddPhotoDialogOpen] = useState(false)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isAddPlaceDialogOpen, setIsAddPlaceDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para recargar la página
  const refreshPage = () => {
    router.refresh()
  }

  // Manejar adición de foto
  const handleAddPhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append("albumId", viaje.name)

    const photoFile = formData.get("photo") as File
    if (photoFile && photoFile.size > 0) {
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string
            formData.append("base64", base64)

            const result = await addPhotoToAlbum(formData)

            if (result.success) {
              toast({
                title: "Foto añadida",
                description: "La foto se ha añadido correctamente",
              })
              setIsAddPhotoDialogOpen(false)
              if (form) {
                form.reset()
              }
              refreshPage()
            } else {
              toast({
                title: "Error",
                description: result.error || "No se pudo añadir la foto",
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error("Error al procesar la foto:", error)
            toast({
              title: "Error",
              description: "Error al procesar la imagen",
              variant: "destructive",
            })
          } finally {
            setIsSubmitting(false)
          }
        }
        reader.readAsDataURL(photoFile)
      } catch (error) {
        console.error("Error al leer el archivo:", error)
        setIsSubmitting(false)
      }
    } else {
      toast({
        title: "Error",
        description: "Debes seleccionar una imagen",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Manejar adición de nota
  const handleAddNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append("albumId", viaje.name)

    try {
      const result = await addNoteToAlbum(formData)

      if (result.success) {
        toast({
          title: "Nota añadida",
          description: "La nota se ha añadido correctamente",
        })
        setIsAddNoteDialogOpen(false)
        if (form) {
          form.reset()
        }
        refreshPage()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo añadir la nota",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al añadir nota:", error)
      toast({
        title: "Error",
        description: "Error al añadir la nota",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar adición de lugar
  const handleAddPlace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append("albumId", viaje.name)

    try {
      const result = await addPlaceToAlbum(formData)

      if (result.success) {
        toast({
          title: "Lugar añadido",
          description: "El lugar se ha añadido correctamente",
        })
        setIsAddPlaceDialogOpen(false)
        if (form) {
          form.reset()
        }
        refreshPage()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo añadir el lugar",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al añadir lugar:", error)
      toast({
        title: "Error",
        description: "Error al añadir el lugar",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar eliminación de foto
  const handleDeletePhoto = async (photoId: string) => {
    try {
      const formData = new FormData()
      formData.append("photoId", photoId)
      formData.append("albumId", viaje.name)

      const result = await deletePhotoAction(formData)

      if (result.success) {
        toast({
          title: "Foto eliminada",
          description: "La foto se ha eliminado correctamente",
        })
        refreshPage()
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
    }
  }

  // Manejar eliminación de nota
  const handleDeleteNote = async (noteId: string) => {
    try {
      const formData = new FormData()
      formData.append("noteId", noteId)
      formData.append("albumId", viaje.name)

      const result = await deleteNoteAction(formData)

      if (result.success) {
        toast({
          title: "Nota eliminada",
          description: "La nota se ha eliminado correctamente",
        })
        refreshPage()
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
    }
  }

  // Manejar eliminación de lugar
  const handleDeletePlace = async (placeName: string) => {
    try {
      const formData = new FormData()
      formData.append("placeName", placeName)
      formData.append("albumId", viaje.name)

      const result = await deletePlaceAction(formData)

      if (result.success) {
        toast({
          title: "Lugar eliminado",
          description: "El lugar se ha eliminado correctamente",
        })
        refreshPage()
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

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header del álbum */}
          <div className="p-6 mb-6 bg-white rounded-lg border">
            <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{viaje.name}</h1>
                {viaje.description && <p className="mt-1 text-gray-600">{viaje.description}</p>}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-1 w-4 h-4" />
                <span>Creado el {new Date(viaje.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Contenido con pestañas */}
          <div className="bg-white rounded-lg border">
            <Tabs defaultValue="photos" className="w-full">
              <div className="px-6 border-b">
                <TabsList className="grid grid-cols-3 p-0 w-full max-w-md h-auto bg-transparent">
                  <TabsTrigger
                    value="photos"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none py-4 px-6"
                  >
                    Photos ({fotos.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none py-4 px-6"
                  >
                    Notes ({notas.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="map"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-500 rounded-none py-4 px-6"
                  >
                    Map ({lugares.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="photos" className="p-6 mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Fotos ({fotos.length})</h2>
                  <Dialog open={isAddPhotoDialogOpen} onOpenChange={setIsAddPhotoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-full">
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nueva Foto</DialogTitle>
                        <DialogDescription>Sube una foto a tu colección de viajes.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddPhoto}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="photo-title">Título</Label>
                            <Input id="photo-title" name="title" placeholder="ej., Atardecer en la Playa" required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="photo-upload">Subir Foto</Label>
                            <Input id="photo-upload" name="photo" type="file" accept="image/*" required />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                Añadiendo...
                              </>
                            ) : (
                              "Añadir Foto"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {fotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {fotos.map((foto, index) => (
                      <div key={foto.id} className="relative group">
                        <Link href={`/viaje/${encodeURIComponent(viaje.name)}/fotos/${foto.id}`} className="block">
                          <div className="p-4 rounded-lg border transition-colors hover:bg-gray-50">
                            <div className="overflow-hidden mb-2 bg-gray-100 rounded aspect-square">
                              {foto.base64 ? (
                                <img
                                  src={foto.base64 || "/placeholder.svg"}
                                  alt={foto.title}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex justify-center items-center w-full h-full">
                                  <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-center">{foto.title}</p>
                          </div>
                        </Link>
                        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <ConfirmDialog
                            title="¿Eliminar foto?"
                            description={`¿Estás seguro de que deseas eliminar la foto "${foto.title}"?`}
                            onConfirm={() => handleDeletePhoto(foto.id)}
                            variant="destructive"
                            size="icon"
                          >
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </ConfirmDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <Camera className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                    <p>No hay fotos en este álbum</p>
                    <Button className="mt-4" onClick={() => setIsAddPhotoDialogOpen(true)}>
                      <Plus className="mr-2 w-4 h-4" />
                      Añadir Primera Foto
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="p-6 mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Notas ({notas.length})</h2>
                  <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-full">
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nueva Nota</DialogTitle>
                        <DialogDescription>Crea una nota para tu viaje.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddNote}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="note-title">Título</Label>
                            <Input id="note-title" name="title" placeholder="ej., Consejos de Viaje" required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="note-content">Contenido</Label>
                            <Textarea id="note-content" name="content" placeholder="Escribe tu nota aquí..." rows={5} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                Añadiendo...
                              </>
                            ) : (
                              "Añadir Nota"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {notas.length > 0 ? (
                  <div className="space-y-3">
                    {notas.map((nota, index) => (
                      <div key={nota.id} className="relative group">
                        <Link href={`/viaje/${encodeURIComponent(viaje.name)}/notas/${nota.id}`} className="block">
                          <div className="p-4 rounded-lg border transition-colors hover:bg-gray-50">
                            <p className="font-medium">{nota.title}</p>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{nota.content}</p>
                          </div>
                        </Link>
                        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <ConfirmDialog
                            title="¿Eliminar nota?"
                            description={`¿Estás seguro de que deseas eliminar la nota "${nota.title}"?`}
                            onConfirm={() => handleDeleteNote(nota.id)}
                            variant="ghost"
                            size="icon"
                          >
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-500 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </ConfirmDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <PenSquare className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                    <p>No hay notas en este álbum</p>
                    <Button className="mt-4" onClick={() => setIsAddNoteDialogOpen(true)}>
                      <Plus className="mr-2 w-4 h-4" />
                      Añadir Primera Nota
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map" className="p-6 mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Lugares ({lugares.length})</h2>
                  <Dialog open={isAddPlaceDialogOpen} onOpenChange={setIsAddPlaceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-full">
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nuevo Lugar</DialogTitle>
                        <DialogDescription>Guarda una ubicación de tu viaje.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddPlace}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="place-name">Nombre</Label>
                            <Input id="place-name" name="name" placeholder="ej., Playa del Atardecer" required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="place-link">Enlace (opcional)</Label>
                            <Input id="place-link" name="link" placeholder="ej., https://maps.google.com/..." />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                Añadiendo...
                              </>
                            ) : (
                              "Añadir Lugar"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {lugares.length > 0 ? (
                  <div className="space-y-3">
                    {lugares.map((lugar, index) => (
                      <div key={lugar.name} className="relative group">
                        <Link
                          href={`/viaje/${encodeURIComponent(viaje.name)}/lugares/${encodeURIComponent(lugar.name)}`}
                          className="block"
                        >
                          <div className="p-4 rounded-lg border transition-colors hover:bg-gray-50">
                            <p className="font-medium">{lugar.name}</p>
                            {lugar.link && (
                              <a
                                href={lugar.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-1 items-center mt-1 text-teal-500 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Ver en el mapa
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </Link>
                        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <ConfirmDialog
                            title="¿Eliminar lugar?"
                            description={`¿Estás seguro de que deseas eliminar el lugar "${lugar.name}"?`}
                            onConfirm={() => handleDeletePlace(lugar.name)}
                            variant="ghost"
                            size="icon"
                          >
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-500 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </ConfirmDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <MapPin className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                    <p>No hay lugares en este álbum</p>
                    <Button className="mt-4" onClick={() => setIsAddPlaceDialogOpen(true)}>
                      <Plus className="mr-2 w-4 h-4" />
                      Añadir Primer Lugar
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
