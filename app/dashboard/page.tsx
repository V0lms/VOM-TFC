import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Folder, LogOut, Plus, AlertCircle, Database, Wifi } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getUserAlbums } from "@/app/actions"
import { logoutUser } from "@/app/actions"
import { testDatabaseConnection } from "@/lib/db"

export default async function DashboardPage() {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testDatabaseConnection()
    const isDemoMode = !process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL

    // Intentar obtener el usuario actual
    const user = await getCurrentUser()

    // Si no hay usuario autenticado, mostrar una interfaz de "no autenticado"
    if (!user) {
      return (
        <div className="flex flex-col min-h-screen">
          <header className="px-4 lg:px-6 h-14 flex items-center border-b">
            <Link className="flex items-center justify-center" href="/">
              <span className="font-bold text-xl">Nube viajes - tfc VOM</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              {isDemoMode && (
                <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  <Database className="h-3 w-3" />
                  Modo Demo
                </div>
              )}
              {dbConnected && !isDemoMode && (
                <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <Wifi className="h-3 w-3" />
                  BD Conectada
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
            <div className="text-center max-w-md p-6 bg-white rounded-lg border">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Sesión no iniciada</h1>
              <p className="text-gray-600 mb-6">Necesitas iniciar sesión para acceder al panel de control.</p>
              {isDemoMode && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <p className="font-medium">Modo Demostración</p>
                  <p>Puedes usar: demo@ejemplo.com / demo123</p>
                </div>
              )}
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
        <header className="px-4 lg:px-6 h-14 flex items-center border-b">
          <Link className="flex items-center justify-center" href="/">
            <span className="font-bold text-xl">Nube viajes - tfc VOM</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isDemoMode && (
                <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  <Database className="h-3 w-3" />
                  Modo Demo
                </div>
              )}
              {dbConnected && !isDemoMode && (
                <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <Wifi className="h-3 w-3" />
                  BD Conectada
                </div>
              )}
            </div>
            <p className="text-sm font-medium">Hola, {user.name}</p>
            <form action={logoutUser}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Tus Viajes</h1>
            <Link href="/crear-viaje">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Viaje
              </Button>
            </Link>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {isDemoMode && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
              <p className="font-medium">🔄 Modo Demostración Activo</p>
              <p className="text-sm mt-1">
                Los datos se almacenan temporalmente. Para persistencia completa, configura una base de datos.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {albums.length > 0 ? (
              albums.map((album) => (
                <div
                  key={album.name}
                  className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-2">
                    <Folder className="h-5 w-5 mr-2 text-teal-500" />
                    <h3 className="font-medium">{album.name}</h3>
                  </div>
                  {album.description && <p className="text-sm text-gray-600 mb-2">{album.description}</p>}
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
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <Folder className="h-12 w-12 text-teal-500 mb-4" />
                <h3 className="text-lg font-medium">Aún no hay viajes</h3>
                <p className="text-sm text-gray-500 mt-1">Crea tu primer viaje para comenzar.</p>
                <Link href="/crear-viaje">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Viaje
                  </Button>
                </Link>
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
        <header className="px-4 lg:px-6 h-14 flex items-center border-b">
          <Link className="flex items-center justify-center" href="/">
            <span className="font-bold text-xl">Nube viajes - tfc VOM</span>
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white rounded-lg border">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Error en el Dashboard</h1>
            <p className="text-gray-600 mb-6">
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
