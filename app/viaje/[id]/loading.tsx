import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-4 h-14 border-b lg:px-6">
        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-800"></div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col gap-2 items-center">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <p className="text-sm text-gray-500">Cargando detalles del viaje...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
