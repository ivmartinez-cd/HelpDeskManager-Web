"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Database, Upload,
  Download, Loader2, CheckCircle2, AlertCircle
} from "lucide-react"
import { PageShell } from "@/components/ui/page-shell"
import { PageHeader } from "@/components/ui/page-header"
import { SpotlightCard } from "@/components/ui/spotlight-card"

export default function StcPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resultFile, setResultFile] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010"

  const handleUpload = async (type: "db3" | "txt", files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    setStatus("idle")
    setMessage("")
    setResultFile("")

    const formData = new FormData()
    if (type === "db3") {
      for (let i = 0; i < files.length; i++) formData.append("files", files[i])
    } else {
      formData.append("file", files[0])
    }

    try {
      const endpoint = type === "db3" ? "/api/stc/process-db3" : "/api/stc/process-txt"
      const response = await fetch(`${apiUrl}${endpoint}`, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Error al procesar el archivo")
      setResultFile(data.file)
      setStatus("success")
      setMessage(data.message)
    } catch (error) {
      const err = error as Error;
      setStatus("error")
      setMessage(err.message || "Error de conexión.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PageShell>
      <div className="h-full overflow-y-auto custom-scrollbar flex flex-col px-4">
        <div className="m-auto w-full max-w-4xl flex flex-col items-center gap-8 md:gap-12 py-8">
          <PageHeader
            badge="Utilidades de Infraestructura"
            titleLine1="UTILIDADES"
            titleLine2="STC & RED"
            description="Extracción inteligente de IPs y generación de rangos de red con precisión industrial."
          />

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <StcActionCard
                icon={Database}
                title="IPs desde DB3"
                desc="Sube uno o varios archivos .db3 para extraer las IPs de la tabla de contadores y agruparlas por rangos /24."
                color="text-blue-500"
                accept=".db3,.sqlite,.db"
                multiple={true}
                onUpload={(files) => handleUpload("db3", files)}
                isProcessing={isProcessing}
                delay={0.4}
              />
              <StcActionCard
                icon={FileText}
                title="IPs desde TXT"
                desc="Procesa cualquier archivo de texto para identificar direcciones IPv4 y generar el listado de rangos /24."
                color="text-orange-500"
                accept=".txt,.log,.csv"
                multiple={false}
                onUpload={(files) => handleUpload("txt", files)}
                isProcessing={isProcessing}
                delay={0.5}
              />
            </div>

            <AnimatePresence>
              {(isProcessing || status !== "idle") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full p-8 border rounded-[2.5rem] bg-card/30 backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full" />

                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-6 py-6">
                      <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                        <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-orange-500 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-xl mb-1 text-foreground">Extrayendo direcciones...</p>
                        <p className="text-muted-foreground text-sm animate-pulse">Analizando estructura de red</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                      <div className={`p-6 rounded-3xl flex items-center gap-4 ${status === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                        {status === "success" ? <CheckCircle2 className="h-8 w-8 shrink-0" /> : <AlertCircle className="h-8 w-8 shrink-0" />}
                        <span className="font-bold text-lg">{message}</span>
                      </div>

                      {status === "success" && resultFile && (
                        <div className="bg-background/50 border border-orange-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 group">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-500/10 p-4 rounded-2xl text-orange-500 transition-transform group-hover:scale-110">
                              <Download className="h-7 w-7" />
                            </div>
                            <div>
                              <p className="font-bold text-lg text-foreground">Rangos Generados</p>
                              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Documento de red (.txt)</p>
                            </div>
                          </div>
                          <a
                            href={`${apiUrl}/api/download/${resultFile}`}
                            download={resultFile}
                            className="w-full sm:w-auto bg-orange-500 text-white h-12 px-10 rounded-2xl flex items-center justify-center font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
                          >
                            Descargar TXT
                          </a>
                        </div>
                      )}

                      <button
                        onClick={() => setStatus("idle")}
                        className="w-full h-12 bg-secondary/50 hover:bg-secondary rounded-2xl font-bold transition-all text-foreground text-sm"
                      >
                        Limpiar y Volver
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

function StcActionCard({ icon: Icon, title, desc, color, accept, multiple, onUpload, isProcessing, delay }: {
  icon: React.ElementType
  title: string
  desc: string
  color: string
  accept: string
  multiple: boolean
  onUpload: (files: FileList | null) => void
  isProcessing: boolean
  delay: number
}) {
  return (
    <SpotlightCard delay={delay}>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-orange-500/10 ${color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground group-hover:text-orange-500 transition-colors">{title}</h2>
        </div>

        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{desc}</p>

        <div className="w-full relative group/btn">
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
            onChange={(e) => onUpload(e.target.files)}
            disabled={isProcessing}
          />
          <button className="w-full bg-orange-500 text-white h-10 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 group-hover/btn:scale-[1.02] transition-transform text-[10px] uppercase tracking-widest">
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                PROCESANDO...
              </span>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                Seleccionar Archivos
              </>
            )}
          </button>
        </div>
      </div>
    </SpotlightCard>
  )
}
