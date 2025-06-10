import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm text-gray-500">Cargando detalles del viaje...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
