"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => Promise<void>
  children?: React.ReactNode
  variant?: "outline" | "destructive" | "ghost" | "link" | "default" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  children,
  variant = "destructive",
  size = "sm",
  showIcon = true,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleConfirm() {
    setIsLoading(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error("Error en la acción de confirmación:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size} className="flex items-center gap-1">
            {showIcon && <Trash2 className="h-4 w-4" />}
            Eliminar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
