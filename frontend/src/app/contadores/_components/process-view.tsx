import { memo, type ReactNode } from "react"
import { motion } from "framer-motion"
import { FileText, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { LogEntry, ProcessStatus } from "../_hooks/use-process"

interface ProcessingProps {
  logs: LogEntry[]
}

export const ProcessingView = memo(function ProcessingView({ logs }: ProcessingProps) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-6">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
        <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-accent animate-pulse" />
      </div>
      <div className="w-full space-y-3">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-1 text-foreground">Procesando solicitud</h3>
          <p className="text-muted-foreground animate-pulse text-xs text-display">Ejecución en curso...</p>
        </div>
        <div className="bg-muted/50 dark:bg-black/40 rounded-2xl p-4 border border-border dark:border-white/10 font-mono text-[10px] h-36 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <p key={i} className="text-accent flex items-center gap-2 animate-fade-in">
                <span className="text-accent/30 font-bold">[{log.time}]</span>
                <span className="text-foreground/90">{log.msg}</span>
              </p>
            ))}
            <p className="text-accent/50 italic animate-pulse">_ analizando subprocesos técnicos...</p>
          </div>
        </div>
      </div>
    </div>
  )
})

interface ResultViewProps {
  status: ProcessStatus
  message: string
  resultFiles: string[]
  apiUrl: string
  onRetry: () => void
}

export const ResultView = memo(function ResultView({ status, message, resultFiles, apiUrl, onRetry }: ResultViewProps) {
  const isSuccess = status === "success"
  return (
    <div className="space-y-6 py-4">
      <div className={`p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 ${isSuccess ? "bg-green-500/10 border border-green-500/20 text-green-600" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
        <div className={`p-4 rounded-2xl ${isSuccess ? "bg-green-500/20" : "bg-destructive/20"}`}>
          {isSuccess ? <CheckCircle2 className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
        </div>
        <div>
          <h3 className="text-2xl font-display font-black tracking-tighter uppercase">{isSuccess ? "¡Completado!" : "Error en el proceso"}</h3>
          <p className="font-medium text-sm opacity-80">{message}</p>
        </div>
      </div>

      {isSuccess && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Resultado</p>
            <p className="text-xs font-bold text-foreground">Procesado OK</p>
          </div>
          <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Seguridad</p>
            <p className="text-xs font-bold text-foreground">Validado</p>
          </div>
        </div>
      )}

      {resultFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Archivos listos para descargar</p>
          <div className="grid grid-cols-1 gap-3">
            {resultFiles.map(f => (
              <a
                key={f}
                href={`${apiUrl}/api/download/${f}`}
                download
                className="flex items-center justify-between p-5 bg-background/50 border rounded-2xl hover:border-orange-500/50 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm truncate max-w-[200px] text-foreground">{f}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Documento Generado</p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRetry}
        className="w-full h-14 bg-secondary hover:bg-secondary/80 rounded-2xl font-bold transition-all text-foreground"
      >
        Volver a intentar
      </button>
    </div>
  )
})

interface ModalContentProps {
  isProcessing: boolean
  status: ProcessStatus
  logs: LogEntry[]
  message: string
  resultFiles: string[]
  apiUrl: string
  onRetry: () => void
  children: ReactNode
  hasDropdownOpen: boolean
}

export const ModalContent = memo(function ModalContent({
  isProcessing, status, logs, message, resultFiles, apiUrl, onRetry, children, hasDropdownOpen
}: ModalContentProps) {
  return (
    <div className={`space-y-6 relative z-10 transition-all duration-300 ${hasDropdownOpen ? "pb-64" : ""}`}>
      {isProcessing ? (
        <ProcessingView logs={logs} />
      ) : status !== "idle" ? (
        <ResultView status={status} message={message} resultFiles={resultFiles} apiUrl={apiUrl} onRetry={onRetry} />
      ) : (
        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {children}
        </motion.div>
      )}
    </div>
  )
})
