import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const dbConnected = await testDatabaseConnection()

    const status = {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        mode: process.env.DATABASE_URL ? "production" : "demo",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error en health check:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
