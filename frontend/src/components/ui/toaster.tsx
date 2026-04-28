"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react"
import { useToast, Toast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertTriangle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const borderColors = {
    success: "border-green-500/20",
    error: "border-red-500/20",
    info: "border-blue-500/20",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl bg-white/10 dark:bg-black/40 shadow-2xl ${borderColors[toast.type]}`}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-[11px] font-black uppercase tracking-widest text-foreground/90">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground/50 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
