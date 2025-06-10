import { NextResponse } from "next/server"

export async function GET() {
  // Verificar si estamos en modo de demostración
  const demoMode = !process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL

  return NextResponse.json({ demoMode })
}
