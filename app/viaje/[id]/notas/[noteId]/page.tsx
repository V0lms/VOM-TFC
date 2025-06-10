import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getAlbumByName, getNotasByAlbum } from "@/lib/db"
import { EditNoteForm } from "@/components/edit-note-form"

export default async function NoteDetailPage({
  params,
}: {
  params: { id: string; noteId: string }
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const viajeName = decodeURIComponent(params.id)
    const noteId = params.noteId

    const viaje = await getAlbumByName(viajeName)

    if (!viaje || viaje.user_email !== user.email) {
      redirect("/dashboard")
    }

    // Obtener la nota específica
    const notas = await getNotasByAlbum(viaje.name)
    const nota = notas?.find((n) => n.id === noteId)

    if (!nota) {
      redirect(`/viaje/${encodeURIComponent(viajeName)}`)
    }

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
          <Link className="flex items-center justify-center" href={`/viaje/${encodeURIComponent(viajeName)}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Volver al Álbum</span>
          </Link>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Note 1</h1>
              </div>

              <EditNoteForm note={nota} albumName={viajeName} />
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error en página de nota:", error)
    redirect(`/viaje/${encodeURIComponent(params.id)}`)
  }
}
