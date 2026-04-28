"use client"

import { useState, useEffect } from "react"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
}

type Listener = (toasts: Toast[]) => void
let listeners: Array<Listener> = []
let memoryToasts: Toast[] = []

export const toast = (message: string, type: ToastType = "info") => {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast: Toast = { id, message, type }
  memoryToasts = [...memoryToasts, newToast]
  listeners.forEach((listener) => listener(memoryToasts))

  setTimeout(() => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(memoryToasts))
  }, 5000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  const dismiss = (id: string) => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(memoryToasts))
  }

  return {
    toasts,
    toast,
    dismiss
  }
}
