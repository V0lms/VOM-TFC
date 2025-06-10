import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col gap-2 items-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    </div>
  )
}
