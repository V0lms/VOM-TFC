"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Camera, MapPin, PenSquare, Plus, Trash2, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { getFotosByAlbum, getNotasByAlbum, getLugaresByAlbum } from "@/lib/db"
import {
  addPhotoToAlbum,
  addNoteToAlbum,
  addPlaceToAlbum,
  deletePhotoAction,
  deleteNoteAction,
  deletePlaceAction,
} from "@/app/actions"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/components/ui/use-toast"

interface AlbumContentProps {
  albumName: string
}

export function AlbumContent({ albumName }: AlbumContentProps) {
  const [activeTab, setActiveTab] = useState("photos")
  const [isAddPhotoDialogOpen, setIsAddPhotoDialogOpen] = useState(false)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isAddPlaceDialogOpen, setIsAddPlaceDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [photos, setPhotos] = useState([])
  const [notes, setNotes] = useState([])
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Función para cargar todos los datos
  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Cargando datos para el álbum:", albumName)

      const [photosData, notesData, placesData] = await Promise.all([
        getFotosByAlbum(albumName),
        getNotasByAlbum(albumName),
        getLugaresByAlbum(albumName),
      ])

      console.log("Datos cargados:", {
        fotos: photosData?.length || 0,
        notas: notesData?.length || 0,
        lugares: placesData?.length || 0,
      })

      setPhotos(photosData || [])
      setNotes(notesData || [])
      setPlaces(placesData || [])
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar los datos del álbum")
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    if (albumName) {
      loadData()
    }
  }, [albumName])

  // Función para actualizar datos manualmente
  const refreshData = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    toast({
      title: "Datos actualizados",
      description: "Se han actualizado los datos del álbum",
    })
  }

  // Manejar adición de foto
  const handleAddPhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    formData.append("albumId", albumName)

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
              // Recargar datos inmediatamente
              await loadData()
              // Limpiar el formulario
              event.currentTarget.reset()
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

    const formData = new FormData(event.currentTarget)
    formData.append("albumId", albumName)

    try {
      const result = await addNoteToAlbum(formData)

      if (result.success) {
        toast({
          title: "Nota añadida",
          description: "La nota se ha añadido correctamente",
        })
        setIsAddNoteDialogOpen(false)
        // Recargar datos inmediatamente
        await loadData()
        // Limpiar el formulario
        event.currentTarget.reset()
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

    const formData = new FormData(event.currentTarget)
    formData.append("albumId", albumName)

    try {
      const result = await addPlaceToAlbum(formData)

      if (result.success) {
        toast({
          title: "Lugar añadido",
          description: "El lugar se ha añadido correctamente",
        })
        setIsAddPlaceDialogOpen(false)
        // Recargar datos inmediatamente
        await loadData()
        // Limpiar el formulario
        event.currentTarget.reset()
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
      formData.append("albumId", albumName)

      const result = await deletePhotoAction(formData)

      if (result.success) {
        toast({
          title: "Foto eliminada",
          description: "La foto se ha eliminado correctamente",
        })
        // Recargar datos inmediatamente
        await loadData()
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
      formData.append("albumId", albumName)

      const result = await deleteNoteAction(formData)

      if (result.success) {
        toast({
          title: "Nota eliminada",
          description: "La nota se ha eliminado correctamente",
        })
        // Recargar datos inmediatamente
        await loadData()
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
      formData.append("albumId", albumName)

      const result = await deletePlaceAction(formData)

      if (result.success) {
        toast({
          title: "Lugar eliminado",
          description: "El lugar se ha eliminado correctamente",
        })
        // Recargar datos inmediatamente
        await loadData()
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm text-gray-500">Cargando contenido del viaje...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{error}</p>
        <Button onClick={loadData} className="mt-2">
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="photos" className="relative">
            Fotos
            {photos.length > 0 && (
              <span className="ml-1 text-xs bg-teal-500 text-white rounded-full px-1.5 py-0.5">{photos.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notes" className="relative">
            Notas
            {notes.length > 0 && (
              <span className="ml-1 text-xs bg-teal-500 text-white rounded-full px-1.5 py-0.5">{notes.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="places" className="relative">
            Lugares
            {places.length > 0 && (
              <span className="ml-1 text-xs bg-teal-500 text-white rounded-full px-1.5 py-0.5">{places.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando..." : "Actualizar"}
          </Button>

          {activeTab === "photos" && (
            <Dialog open={isAddPhotoDialogOpen} onOpenChange={setIsAddPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Camera className="h-4 w-4 mr-2" />
                  Añadir Foto
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          )}

          {activeTab === "notes" && (
            <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PenSquare className="h-4 w-4 mr-2" />
                  Añadir Nota
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          )}

          {activeTab === "places" && (
            <Dialog open={isAddPlaceDialogOpen} onOpenChange={setIsAddPlaceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <MapPin className="h-4 w-4 mr-2" />
                  Añadir Lugar
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          )}
        </div>
      </div>

      <TabsContent value="photos" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  {photo.base64 ? (
                    <img
                      src={photo.base64 || "/placeholder.svg"}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmDialog
                      title="¿Eliminar foto?"
                      description={`¿Estás seguro de que deseas eliminar la foto "${photo.title}"?`}
                      onConfirm={() => handleDeletePhoto(photo.id)}
                      variant="destructive"
                      size="icon"
                    >
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmDialog>
                  </div>
                </div>
                <CardFooter className="p-2">
                  <p className="text-sm font-medium">{photo.title}</p>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <Camera className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aún no hay fotos</h3>
              <p className="text-sm text-gray-500 mt-1">Añade tu primera foto a este álbum.</p>
              <Button className="mt-4" onClick={() => setIsAddPhotoDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Foto
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="notes" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {notes.length > 0 ? (
            notes.map((note) => (
              <Card key={note.id} className="group">
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmDialog
                      title="¿Eliminar nota?"
                      description={`¿Estás seguro de que deseas eliminar la nota "${note.title}"?`}
                      onConfirm={() => handleDeleteNote(note.id)}
                      variant="ghost"
                      size="icon"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmDialog>
                  </div>
                  <CardTitle>{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{note.content}</p>
                </CardContent>
                <CardFooter className="text-xs text-gray-500">{new Date(note.date).toLocaleDateString()}</CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <PenSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aún no hay notas</h3>
              <p className="text-sm text-gray-500 mt-1">Añade tu primera nota a este álbum.</p>
              <Button className="mt-4" onClick={() => setIsAddNoteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Nota
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="places" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {places.length > 0 ? (
            places.map((place) => (
              <Card key={place.name} className="group">
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmDialog
                      title="¿Eliminar lugar?"
                      description={`¿Estás seguro de que deseas eliminar el lugar "${place.name}"?`}
                      onConfirm={() => handleDeletePlace(place.name)}
                      variant="ghost"
                      size="icon"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmDialog>
                  </div>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-teal-500" />
                    {place.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {place.link && (
                    <a
                      href={place.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-500 hover:underline flex items-center gap-1"
                    >
                      Ver en el mapa
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-gray-500">
                  Añadido el {new Date(place.date).toLocaleDateString()}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aún no hay lugares</h3>
              <p className="text-sm text-gray-500 mt-1">Añade tu primer lugar a este álbum.</p>
              <Button className="mt-4" onClick={() => setIsAddPlaceDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Lugar
              </Button>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
