"use client"

import { useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { 
  Shield, FileText, Database, Upload, Download, 
  Loader2, CheckCircle2, AlertCircle, Network, ArrowRight, X 
} from "lucide-react"

export default function StcPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resultFile, setResultFile] = useState("")
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";

  const handleUpload = async (type: "db3" | "txt", files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    setStatus("idle")
    setMessage("")
    setResultFile("")

    const formData = new FormData()
    if (type === "db3") {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }
    } else {
      formData.append("file", files[0])
    }

    try {
      const endpoint = type === "db3" ? "/api/stc/process-db3" : "/api/stc/process-txt"
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Error al procesar el archivo")
      }

      setResultFile(data.file)
      setStatus("success")
      setMessage(data.message)
    } catch (error: any) {
      console.error(error)
      setStatus("error")
      setMessage(error.message || "Error de conexión.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative h-full bg-background text-foreground p-4 md:p-8 overflow-y-auto custom-scrollbar font-sans">
      
      <main className="relative flex-1 flex flex-col items-center justify-center">
        {/* Modern Industrial Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-fade" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center gap-4 py-4 h-full">
          
          <section className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase">
                Utilidades de Infraestructura
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-display text-4xl md:text-6xl font-black tracking-tighter leading-none mb-2"
            >
              <span className="text-foreground block">UTILIDADES</span>
              <span className="text-accent block">STC & RED</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs md:text-sm font-medium text-muted-foreground/50 leading-relaxed max-w-xl"
            >
              Extracción inteligente de IPs y generación de rangos de red con precisión industrial.
            </motion.p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <StcActionCard 
              icon={Database}
              title="IPs desde DB3"
              desc="Sube uno o varios archivos .db3 para extraer las IPs de la tabla de contadores y agruparlas por rangos /24."
              color="text-blue-500"
              accept=".db3,.sqlite,.db"
              multiple={true}
              onUpload={(files: FileList | null) => handleUpload("db3", files)}
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
              onUpload={(files: FileList | null) => handleUpload("txt", files)}
              isProcessing={isProcessing}
              delay={0.5}
            />
          </div>

          {/* Status & Results */}
          <AnimatePresence>
            {(isProcessing || status !== "idle") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-12 max-w-2xl mx-auto p-8 border rounded-[2.5rem] bg-card/30 backdrop-blur-xl relative overflow-hidden"
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
                    <div className={`
                      p-6 rounded-3xl flex items-center gap-4
                      ${status === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}
                    `}>
                      {status === "success" ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
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
      </main>
    </div>
  )
}

function StcActionCard({ icon: Icon, title, desc, color, accept, multiple, onUpload, isProcessing, delay }: any) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(249, 115, 22, 0.1), transparent 40%)`
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-[1.2rem] border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 p-5 transition-colors hover:border-orange-500/50 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[1.2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: spotlightBg }}
      />
      
      <div className="relative z-10 flex flex-col space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-orange-500/10 ${color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground group-hover:text-orange-500 transition-colors">{title}</h2>
        </div>
        
        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
          {desc}
        </p>

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
    </motion.div>
  )
}
