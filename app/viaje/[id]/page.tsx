import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAlbumByName, getFotosByAlbum, getNotasByAlbum, getLugaresByAlbum } from "@/lib/db"
import { ViajeDetailClient } from "@/components/viaje-detail-client"
import { CreateAlbumFallback } from "@/components/create-album-fallback"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ViajeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    // Obtener usuario actual
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const viajeName = decodeURIComponent(params.id)

    console.log("Cargando página de viaje:", viajeName)
    console.log("Usuario actual:", user.email)

    // Intentar obtener el álbum
    const viaje = await getAlbumByName(viajeName)

    console.log("Álbum encontrado:", viaje)

    // Si el álbum no existe, mostrar opción para crearlo
    if (!viaje) {
      console.log("Álbum no encontrado, mostrando fallback")
      return <CreateAlbumFallback viajeName={viajeName} userEmail={user.email} />
    }

    // Verificar que el usuario tiene acceso al álbum
    if (viaje.user_email !== user.email) {
      console.log("Usuario no tiene acceso al álbum")
      redirect("/dashboard")
    }

    // Cargar todo el contenido del álbum en paralelo
    console.log("Cargando contenido del álbum...")

    const [fotos, notas, lugares] = await Promise.all([
      getFotosByAlbum(viaje.name).catch((err) => {
        console.error("Error al cargar fotos:", err)
        return []
      }),
      getNotasByAlbum(viaje.name).catch((err) => {
        console.error("Error al cargar notas:", err)
        return []
      }),
      getLugaresByAlbum(viaje.name).catch((err) => {
        console.error("Error al cargar lugares:", err)
        return []
      }),
    ])

    console.log("Contenido cargado:", {
      fotos: fotos.length,
      notas: notas.length,
      lugares: lugares.length,
    })

    // Pasar todos los datos al componente cliente
    return <ViajeDetailClient viaje={viaje} initialFotos={fotos} initialNotas={notas} initialLugares={lugares} />
  } catch (error) {
    console.error("Error en página de viaje:", error)

    // Mostrar un mensaje de error en lugar de redirigir
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
          <Link className="flex items-center justify-center" href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Volver al Panel</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white rounded-lg border">
            <h1 className="text-2xl font-bold mb-4">Error al cargar el viaje</h1>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error al cargar los datos del viaje. Por favor, inténtalo de nuevo.
            </p>
            <Link href="/dashboard">
              <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
                Volver al Dashboard
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
  }
}
