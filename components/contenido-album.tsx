"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
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

interface ContenidoAlbumProps {
  nombreAlbum: string
}

export function ContenidoAlbum({ nombreAlbum }: ContenidoAlbumProps) {
  const [pestanaActiva, setPestanaActiva] = useState("fotos")
  const [dialogoFotoAbierto, setDialogoFotoAbierto] = useState(false)
  const [dialogoNotaAbierto, setDialogoNotaAbierto] = useState(false)
  const [dialogoLugarAbierto, setDialogoLugarAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [actualizando, setActualizando] = useState(false)

  const [fotos, setFotos] = useState([])
  const [notas, setNotas] = useState([])
  const [lugares, setLugares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError("")

      console.log("Cargando datos para el álbum:", nombreAlbum)

      const [fotosData, notasData, lugaresData] = await Promise.all([
        getFotosByAlbum(nombreAlbum),
        getNotasByAlbum(nombreAlbum),
        getLugaresByAlbum(nombreAlbum),
      ])

      console.log("Datos cargados:", {
        fotos: fotosData?.length || 0,
        notas: notasData?.length || 0,
        lugares: lugaresData?.length || 0,
      })

      setFotos(fotosData || [])
      setNotas(notasData || [])
      setLugares(lugaresData || [])
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar los datos del álbum")
    } finally {
      setCargando(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [nombreAlbum])

  // Función para actualizar datos manualmente
  const actualizarDatos = async () => {
    setActualizando(true)
    await cargarDatos()
    setActualizando(false)
    toast({
      title: "Datos actualizados",
      description: "Se han actualizado los datos del álbum",
    })
  }

  // Manejar adición de foto
  const manejarAgregarFoto = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviando(true)

    const formData = new FormData(evento.currentTarget)
    formData.append("albumId", nombreAlbum)

    const archivoFoto = formData.get("photo") as File
    if (archivoFoto && archivoFoto.size > 0) {
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string
            formData.append("base64", base64)

            const resultado = await addPhotoToAlbum(formData)

            if (resultado.success) {
              toast({
                title: "Foto añadida",
                description: "La foto se ha añadido correctamente",
              })
              setDialogoFotoAbierto(false)
              // Recargar datos inmediatamente
              await cargarDatos()
            } else {
              toast({
                title: "Error",
                description: resultado.error || "No se pudo añadir la foto",
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
            setEnviando(false)
          }
        }
        reader.readAsDataURL(archivoFoto)
      } catch (error) {
        console.error("Error al leer el archivo:", error)
        setEnviando(false)
      }
    } else {
      toast({
        title: "Error",
        description: "Debes seleccionar una imagen",
        variant: "destructive",
      })
      setEnviando(false)
    }
  }

  // Manejar adición de nota
  const manejarAgregarNota = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviando(true)

    const formData = new FormData(evento.currentTarget)
    formData.append("albumId", nombreAlbum)

    try {
      const resultado = await addNoteToAlbum(formData)

      if (resultado.success) {
        toast({
          title: "Nota añadida",
          description: "La nota se ha añadido correctamente",
        })
        setDialogoNotaAbierto(false)
        // Recargar datos inmediatamente
        await cargarDatos()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "No se pudo añadir la nota",
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
      setEnviando(false)
    }
  }

  // Manejar adición de lugar
  const manejarAgregarLugar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviando(true)

    const formData = new FormData(evento.currentTarget)
    formData.append("albumId", nombreAlbum)

    try {
      const resultado = await addPlaceToAlbum(formData)

      if (resultado.success) {
        toast({
          title: "Lugar añadido",
          description: "El lugar se ha añadido correctamente",
        })
        setDialogoLugarAbierto(false)
        // Recargar datos inmediatamente
        await cargarDatos()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "No se pudo añadir el lugar",
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
      setEnviando(false)
    }
  }

  // Manejar eliminación de foto
  const manejarEliminarFoto = async (fotoId: string) => {
    try {
      const formData = new FormData()
      formData.append("photoId", fotoId)
      formData.append("albumId", nombreAlbum)

      const resultado = await deletePhotoAction(formData)

      if (resultado.success) {
        toast({
          title: "Foto eliminada",
          description: "La foto se ha eliminado correctamente",
        })
        // Recargar datos inmediatamente
        await cargarDatos()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "No se pudo eliminar la foto",
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
  const manejarEliminarNota = async (notaId: string) => {
    try {
      const formData = new FormData()
      formData.append("noteId", notaId)
      formData.append("albumId", nombreAlbum)

      const resultado = await deleteNoteAction(formData)

      if (resultado.success) {
        toast({
          title: "Nota eliminada",
          description: "La nota se ha eliminado correctamente",
        })
        // Recargar datos inmediatamente
        await cargarDatos()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "No se pudo eliminar la nota",
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
  const manejarEliminarLugar = async (nombreLugar: string) => {
    try {
      const formData = new FormData()
      formData.append("placeName", nombreLugar)
      formData.append("albumId", nombreAlbum)

      const resultado = await deletePlaceAction(formData)

      if (resultado.success) {
        toast({
          title: "Lugar eliminado",
          description: "El lugar se ha eliminado correctamente",
        })
        // Recargar datos inmediatamente
        await cargarDatos()
      } else {
        toast({
          title: "Error",
          description: resultado.error || "No se pudo eliminar el lugar",
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

  if (cargando) {
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
        <Button onClick={cargarDatos} className="mt-2">
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <Tabs value={pestanaActiva} onValueChange={setPestanaActiva} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="fotos" className="relative">
            Fotos
            {fotos.length > 0 && (
              <span className="ml-1 text-xs bg-teal-500 text-white rounded-full px-1.5 py-0.5">{fotos.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notas" className="relative">
            Notas
            {notas.length > 0 && (
              <span className="ml-1 text-xs bg-teal-500 text-white rounded-full px-1.5 py-0.5">{notas.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="lugares" className="relative">
            Lugares
            {lugares.length > 0 && (
              <span className="ml-1 text-xs bg-teal-500 text-white rounded-full px-1.5 py-0.5">{lugares.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={actualizarDatos}
            disabled={actualizando}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${actualizando ? "animate-spin" : ""}`} />
            {actualizando ? "Actualizando..." : "Actualizar"}
          </Button>

          {pestanaActiva === "fotos" && (
            <Dialog open={dialogoFotoAbierto} onOpenChange={setDialogoFotoAbierto}>
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
                <form onSubmit={manejarAgregarFoto}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="titulo-foto">Título</Label>
                      <Input id="titulo-foto" name="title" placeholder="ej., Atardecer en la Playa" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subir-foto">Subir Foto</Label>
                      <Input id="subir-foto" name="photo" type="file" accept="image/*" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={enviando}>
                      {enviando ? (
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

          {pestanaActiva === "notas" && (
            <Dialog open={dialogoNotaAbierto} onOpenChange={setDialogoNotaAbierto}>
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
                <form onSubmit={manejarAgregarNota}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="titulo-nota">Título</Label>
                      <Input id="titulo-nota" name="title" placeholder="ej., Consejos de Viaje" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contenido-nota">Contenido</Label>
                      <Textarea id="contenido-nota" name="content" placeholder="Escribe tu nota aquí..." rows={5} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={enviando}>
                      {enviando ? (
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

          {pestanaActiva === "lugares" && (
            <Dialog open={dialogoLugarAbierto} onOpenChange={setDialogoLugarAbierto}>
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
                <form onSubmit={manejarAgregarLugar}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nombre-lugar">Nombre</Label>
                      <Input id="nombre-lugar" name="name" placeholder="ej., Playa del Atardecer" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="enlace-lugar">Enlace (opcional)</Label>
                      <Input id="enlace-lugar" name="link" placeholder="ej., https://maps.google.com/..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={enviando}>
                      {enviando ? (
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

      <TabsContent value="fotos" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fotos.length > 0 ? (
            fotos.map((foto) => (
              <Card key={foto.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  <Image
                    src={foto.base64 || "/placeholder.svg?height=300&width=400"}
                    alt={foto.title}
                    fill
                    className="object-cover"
                    unoptimized={foto.base64?.startsWith("data:")}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmDialog
                      title="¿Eliminar foto?"
                      description={`¿Estás seguro de que deseas eliminar la foto "${foto.title}"?`}
                      onConfirm={() => manejarEliminarFoto(foto.id)}
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
                  <p className="text-sm font-medium">{foto.title}</p>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <Camera className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aún no hay fotos</h3>
              <p className="text-sm text-gray-500 mt-1">Añade tu primera foto a este álbum.</p>
              <Button className="mt-4" onClick={() => setDialogoFotoAbierto(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Foto
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="notas" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {notas.length > 0 ? (
            notas.map((nota) => (
              <Card key={nota.id} className="group">
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmDialog
                      title="¿Eliminar nota?"
                      description={`¿Estás seguro de que deseas eliminar la nota "${nota.title}"?`}
                      onConfirm={() => manejarEliminarNota(nota.id)}
                      variant="ghost"
                      size="icon"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmDialog>
                  </div>
                  <CardTitle>{nota.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{nota.content}</p>
                </CardContent>
                <CardFooter className="text-xs text-gray-500">{new Date(nota.date).toLocaleDateString()}</CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <PenSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aún no hay notas</h3>
              <p className="text-sm text-gray-500 mt-1">Añade tu primera nota a este álbum.</p>
              <Button className="mt-4" onClick={() => setDialogoNotaAbierto(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Nota
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="lugares" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {lugares.length > 0 ? (
            lugares.map((lugar) => (
              <Card key={lugar.name} className="group">
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmDialog
                      title="¿Eliminar lugar?"
                      description={`¿Estás seguro de que deseas eliminar el lugar "${lugar.name}"?`}
                      onConfirm={() => manejarEliminarLugar(lugar.name)}
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
                    {lugar.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lugar.link && (
                    <a
                      href={lugar.link}
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
                  Añadido el {new Date(lugar.date).toLocaleDateString()}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aún no hay lugares</h3>
              <p className="text-sm text-gray-500 mt-1">Añade tu primer lugar a este álbum.</p>
              <Button className="mt-4" onClick={() => setDialogoLugarAbierto(true)}>
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
