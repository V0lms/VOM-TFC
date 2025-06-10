import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, ExternalLink } from "lucide-react"
import { DEMO_MODE } from "@/lib/db"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">Nube viajes - tfc VOM</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Iniciar Sesión
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
            Registrarse
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="h-[50vh] py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Documenta tus Viajes
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Crea álbumes para guardar recuerdos, momentos y lugares de tus aventuras.
                </p>
              </div>
              <div>
                <Link href="/register">
                  <Button className="px-8">
                    Comenzar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-950 rounded-full">
                  <svg
                    className="h-6 w-6 text-teal-500 dark:text-teal-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect height="18" rx="2" width="18" x="3" y="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Fotos</h3>
                <p className="text-gray-500 dark:text-gray-400">Captura momentos especiales de tus viajes.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-950 rounded-full">
                  <svg
                    className="h-6 w-6 text-teal-500 dark:text-teal-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Notas</h3>
                <p className="text-gray-500 dark:text-gray-400">Escribe anécdotas y experiencias de tus aventuras.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-950 rounded-full">
                  <svg
                    className="h-6 w-6 text-teal-500 dark:text-teal-400"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Lugares</h3>
                <p className="text-gray-500 dark:text-gray-400">Guarda ubicaciones de sitios que has visitado.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 Nube viajes - tfc VOM. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
