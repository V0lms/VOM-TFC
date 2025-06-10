import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Folder, LogOut, Plus, AlertCircle, Database, Wifi, ExternalLink } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getUserAlbums } from "@/app/actions"
import { logoutUser } from "@/app/actions"
import { DEMO_MODE } from "@/lib/db"
import { CreateAlbumModal } from "@/components/create-album-modal"

export default async function DashboardPage() {
  try {
    // Si no hay base de datos configurada, mostrar mensaje de configuración
    if (DEMO_MODE) {
      return (
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center px-4 h-14 border-b lg:px-6">
            <Link className="flex justify-center items-center" href="/">
              <span className="text-xl font-bold">Nube viajes - tfc VOM</span>
            </Link>
          </header>
          <main className="flex flex-1 justify-center items-center p-4 md:p-6">
            <div className="p-6 max-w-lg text-center bg-white rounded-lg border">
              <Database className="mx-auto mb-4 w-16 h-16 text-red-500" />
              <h1 className="mb-4 text-2xl font-bold">Base de Datos No Configurada</h1>
              <p className="mb-6 text-gray-600">
                Para usar la aplicación, necesitas configurar una base de datos. Te recomendamos usar Neon para una
                configuración rápida y gratuita.
              </p>
              <div className="space-y-4">
                <div className="p-4 text-left bg-blue-50 rounded border border-blue-200">
                  <h3 className="mb-2 font-medium text-blue-900">Pasos para configurar:</h3>
                  <ol className="space-y-1 text-sm list-decimal list-inside text-blue-800">
                    <li>Crea una cuenta en Neon (gratis)</li>
                    <li>Crea una nueva base de datos</li>
                    <li>Copia la URL de conexión</li>
                    <li>Configúrala como variable de entorno DATABASE_URL</li>
                    <li>Ejecuta los scripts de migración</li>
                  </ol>
                </div>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://neon.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center py-2 px-4 text-white bg-green-600 rounded transition-colors hover:bg-green-700"
                  >
                    Ir a Neon
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Volver al inicio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      )
    }

    // Intentar obtener el usuario actual
    const user = await getCurrentUser()

    // Si no hay usuario autenticado, mostrar una interfaz de "no autenticado"
    if (!user) {
      return (
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center px-4 h-14 border-b lg:px-6">
            <Link className="flex justify-center items-center" href="/">
              <span className="text-xl font-bold">Nube viajes - tfc VOM</span>
            </Link>
            <div className="flex gap-2 items-center ml-auto">
              <div className="flex gap-1 items-center py-1 px-2 text-xs text-green-800 bg-green-100 rounded">
                <Wifi className="w-3 h-3" />
                BD Conectada
              </div>
            </div>
          </header>
          <main className="flex flex-1 justify-center items-center p-4 md:p-6">
            <div className="p-6 max-w-md text-center bg-white rounded-lg border">
              <AlertCircle className="mx-auto mb-4 w-12 h-12 text-amber-500" />
              <h1 className="mb-4 text-2xl font-bold">Sesión no iniciada</h1>
              <p className="mb-6 text-gray-600">Necesitas iniciar sesión para acceder al panel de control.</p>
              <div className="flex flex-col gap-3">
                <Link href="/login">
                  <Button className="w-full">Iniciar sesión</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      )
    }

    // Obtener los álbumes del usuario con manejo de errores mejorado
    let albums = []
    let error = null

    try {
      console.log("Obteniendo álbumes para el usuario:", user.email)
      const result = await getUserAlbums(user.email)

      if (result.error) {
        console.error("Error al obtener álbumes:", result.error)
        error = result.error
      } else {
        albums = result.albums || []
        console.log(`Se encontraron ${albums.length} álbumes`)
      }
    } catch (err) {
      console.error("Error al obtener álbumes:", err)
      error = "Error al cargar los viajes. Por favor, inténtalo de nuevo."
    }

    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center px-4 h-14 border-b lg:px-6">
          <Link className="flex justify-center items-center" href="/">
            <span className="text-xl font-bold">Nube viajes - tfc VOM</span>
          </Link>
          <div className="flex gap-4 items-center ml-auto">
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center py-1 px-2 text-xs text-green-800 bg-green-100 rounded">
                <Wifi className="w-3 h-3" />
                BD Conectada
              </div>
            </div>
            <p className="text-sm font-medium">Hola, {user.name}</p>
            <form action={logoutUser}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="mr-2 w-4 h-4" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tus Viajes</h1>
            <CreateAlbumModal userEmail={user.email}>
              <Button>
                <Plus className="mr-2 w-4 h-4" />
                Nuevo Viaje
              </Button>
            </CreateAlbumModal>
          </div>

          {error && <div className="py-3 px-4 mb-4 text-red-700 bg-red-100 rounded border border-red-400">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {albums.length > 0 ? (
              albums.map((album) => (
                <div
                  key={album.name}
                  className="p-4 bg-white rounded-lg border shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center mb-2">
                    <Folder className="mr-2 w-5 h-5 text-teal-500" />
                    <h3 className="font-medium">{album.name}</h3>
                  </div>
                  {album.description && <p className="mb-2 text-sm text-gray-600">{album.description}</p>}
                  <p className="text-xs text-gray-500">Creado el {new Date(album.date).toLocaleDateString()}</p>
                  <div className="mt-3">
                    <Link href={`/viaje/${encodeURIComponent(album.name)}`} className="w-full">
                      <Button size="sm" className="w-full">
                        Entrar Carpeta
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col col-span-full justify-center items-center p-12 text-center">
                <Folder className="mb-4 w-12 h-12 text-teal-500" />
                <h3 className="text-lg font-medium">Aún no hay viajes</h3>
                <p className="mt-1 text-sm text-gray-500">Crea tu primer viaje para comenzar.</p>
                <CreateAlbumModal userEmail={user.email}>
                  <Button className="mt-4">
                    <Plus className="mr-2 w-4 h-4" />
                    Crear Viaje
                  </Button>
                </CreateAlbumModal>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error en dashboard:", error)

    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center px-4 h-14 border-b lg:px-6">
          <Link className="flex justify-center items-center" href="/">
            <span className="text-xl font-bold">Nube viajes - tfc VOM</span>
          </Link>
        </header>
        <main className="flex flex-1 justify-center items-center p-4 md:p-6">
          <div className="p-6 max-w-md text-center bg-white rounded-lg border">
            <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
            <h1 className="mb-4 text-2xl font-bold">Error en el Dashboard</h1>
            <p className="mb-6 text-gray-600">
              Ha ocurrido un error al cargar el dashboard. Por favor, inténtalo de nuevo.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button className="w-full">Volver al inicio</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
