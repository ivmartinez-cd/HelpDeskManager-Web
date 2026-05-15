"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { X, AlertTriangle } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  maxWidth?: string
  showCloseButton?: boolean
  error?: string | null
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = true,
  error
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements.length > 0) {
            ;(focusableElements[0] as HTMLElement).focus()
          } else {
            modalRef.current.focus()
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidth} bg-card border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden focus:outline-none animate-fade-in-scale`}
      >
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 relative z-10">
          <div>
            <h2 id="modal-title" className="text-3xl font-black tracking-tighter uppercase leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 pt-4 relative z-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-fade-in">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wide leading-tight">{error}</p>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
