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
        <header className="flex items-center px-4 h-14 bg-white border-b lg:px-6">
          <Link className="flex justify-center items-center" href={`/viaje/${encodeURIComponent(viajeName)}`}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="font-medium">Volver al Álbum</span>
          </Link>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="p-6 bg-white rounded-lg border">
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
