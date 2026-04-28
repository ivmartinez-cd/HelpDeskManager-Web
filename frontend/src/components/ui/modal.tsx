"use client"

import { useEffect, useRef, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      
      // We wait a bit for the animation to start so we don't grab focus too early
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

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-card border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden focus:outline-none`}
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
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, mb: 0 }}
                    animate={{ opacity: 1, height: "auto", mb: 24 }}
                    exit={{ opacity: 0, height: 0, mb: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <p className="text-xs font-bold uppercase tracking-wide leading-tight">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
