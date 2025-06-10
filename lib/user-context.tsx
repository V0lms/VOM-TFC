"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserEmailFromClient } from "./auth"

interface User {
  email: string
  name: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  getUserEmail: () => string | null
  refreshUser: () => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  getUserEmail: () => null,
  refreshUser: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserFromCookies = () => {
    try {
      const userEmail = getUserEmailFromClient()

      console.log("Cargando usuario desde cookies:", userEmail)

      if (userEmail) {
        setUser({
          email: userEmail,
          name: "Usuario",
        })
        console.log("Usuario cargado exitosamente:", userEmail)
      } else {
        setUser(null)
        console.log("No se encontró usuario en las cookies")
      }
    } catch (error) {
      console.error("Error al cargar usuario desde cookies:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserFromCookies()
  }, [])

  // Función para obtener el email del usuario de forma segura
  const getUserEmail = (): string | null => {
    if (user) {
      console.log("Obteniendo email del contexto:", user.email)
      return user.email
    }

    // Intento de obtener directamente de las cookies como fallback
    const emailFromCookies = getUserEmailFromClient()
    console.log("Obteniendo email directamente de cookies:", emailFromCookies)
    return emailFromCookies
  }

  // Función para refrescar el usuario
  const refreshUser = () => {
    console.log("Refrescando información del usuario...")
    loadUserFromCookies()
  }

  return (
    <UserContext.Provider value={{ user, loading, setUser, getUserEmail, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
