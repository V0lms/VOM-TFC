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
        <header className="flex items-center px-4 h-14 bg-white border-b lg:px-6">
          <Link className="flex justify-center items-center" href="/dashboard">
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="font-medium">Volver al Panel</span>
          </Link>
        </header>
        <main className="flex flex-1 justify-center items-center">
          <div className="p-6 max-w-md text-center bg-white rounded-lg border">
            <h1 className="mb-4 text-2xl font-bold">Error al cargar el viaje</h1>
            <p className="mb-6 text-gray-600">
              Ha ocurrido un error al cargar los datos del viaje. Por favor, inténtalo de nuevo.
            </p>
            <Link href="/dashboard">
              <button className="py-2 px-4 text-white bg-teal-500 rounded hover:bg-teal-600">
                Volver al Dashboard
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
  }
}
