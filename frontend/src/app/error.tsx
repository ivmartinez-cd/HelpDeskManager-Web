'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full p-10 rounded-[3rem] border border-destructive/20 bg-destructive/5 backdrop-blur-xl relative overflow-hidden text-center animate-fade-in-scale">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive/20" />

        <div className="mb-8 relative inline-block">
          <div className="p-5 rounded-[2rem] bg-destructive/10 text-destructive relative z-10">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <div className="absolute inset-0 bg-destructive rounded-[2rem] blur-xl -z-10 animate-pulse-scale" />
        </div>

        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Error Crítico</h1>
        <p className="text-muted-foreground font-medium mb-8 uppercase text-xs tracking-widest leading-relaxed">
          Se ha detectado una anomalía en el sistema. Los datos pueden estar corruptos o el módulo no responde correctamente.
        </p>

        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-8 text-left">
          <p className="text-[10px] font-mono text-muted-foreground break-all">
            ID: {error.digest || 'N/A'}<br />
            MSG: {error.message}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full h-14 bg-destructive text-destructive-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-destructive/20"
          >
            <RefreshCcw className="h-4 w-4" />
            Reiniciar Segmento
          </button>
          <Link
            href="/"
            className="w-full h-14 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          >
            <Home className="h-4 w-4" />
            Volver al Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
