import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Camera } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getAlbumByName, getFotosByAlbum } from "@/lib/db"
import { DeletePhotoButton } from "@/components/delete-photo-button"

export default async function PhotoDetailPage({
  params,
}: {
  params: { id: string; photoId: string }
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const viajeName = decodeURIComponent(params.id)
    const photoId = params.photoId

    const viaje = await getAlbumByName(viajeName)

    if (!viaje || viaje.user_email !== user.email) {
      redirect("/dashboard")
    }

    // Obtener la foto específica
    const fotos = await getFotosByAlbum(viaje.name)
    const foto = fotos?.find((f) => f.id === photoId)

    if (!foto) {
      redirect(`/viaje/${encodeURIComponent(viajeName)}`)
    }

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="flex items-center px-4 h-14 bg-white border-b lg:px-6">
          <Link className="flex justify-center items-center" href={`/viaje/${encodeURIComponent(viajeName)}`}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="font-medium">Volver al Álbum</span>
          </Link>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="p-6 bg-white rounded-lg border">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold">Photo 1</h1>
                <DeletePhotoButton photoId={foto.id} albumName={viajeName} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Imagen */}
                <div className="overflow-hidden bg-gray-100 rounded-lg aspect-square">
                  {foto.base64 ? (
                    <img
                      src={foto.base64 || "/placeholder.svg"}
                      alt={foto.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex justify-center items-center w-full h-full text-center text-gray-400">
                      <div>
                        <Camera className="mx-auto mb-2 w-16 h-16" />
                        <p>Imagen no disponible</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detalles */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">{foto.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-2 w-4 h-4" />
                        <span>Upload: {new Date(foto.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span>Show detail</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error en página de foto:", error)
    redirect(`/viaje/${encodeURIComponent(params.id)}`)
  }
}
