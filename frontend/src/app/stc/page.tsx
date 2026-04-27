"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { Shield, FileText, Database, Upload, Download, Loader2, CheckCircle2, AlertCircle, Network } from "lucide-react"

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
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-4">
              <Network className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Utilidades STC & Red</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Extrae direcciones IP desde bases de datos o archivos de texto para generar rangos de red unificados.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DB3 Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-3xl p-8 flex flex-col items-center text-center space-y-6 hover:shadow-xl transition-all"
            >
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                <Database className="h-12 w-12" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Extraer IPs desde DB3</h2>
                <p className="text-sm text-muted-foreground">
                  Sube uno o varios archivos .db3 para extraer las IPs de la tabla de contadores y agruparlas por rangos /24.
                </p>
              </div>
              <div className="w-full relative">
                <input 
                  type="file" 
                  multiple
                  accept=".db3,.sqlite,.db"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleUpload("db3", e.target.files)}
                  disabled={isProcessing}
                />
                <button className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Seleccionar Archivos
                </button>
              </div>
            </motion.div>

            {/* TXT Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-3xl p-8 flex flex-col items-center text-center space-y-6 hover:shadow-xl transition-all"
            >
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500">
                <FileText className="h-12 w-12" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Extraer IPs desde TXT</h2>
                <p className="text-sm text-muted-foreground">
                  Procesa cualquier archivo de texto para identificar direcciones IPv4 y generar el listado de rangos /24.
                </p>
              </div>
              <div className="w-full relative">
                <input 
                  type="file" 
                  accept=".txt,.log,.csv"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleUpload("txt", e.target.files)}
                  disabled={isProcessing}
                />
                <button className="w-full bg-accent text-accent-foreground h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  Seleccionar TXT
                </button>
              </div>
            </motion.div>
          </div>

          {/* Status & Results */}
          <AnimatePresence>
            {(isProcessing || status !== "idle") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-12 p-8 border rounded-3xl bg-card/50 backdrop-blur-sm"
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-bold">Procesando y extrayendo IPs...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`
                      p-4 rounded-2xl flex items-center gap-3
                      ${status === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}
                    `}>
                      {status === "success" ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                      <span className="font-bold">{message}</span>
                    </div>

                    {status === "success" && resultFile && (
                      <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary p-3 rounded-xl text-primary-foreground">
                            <Download className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">Archivo de Rangos Listo</p>
                            <p className="text-xs text-muted-foreground">Listado de red unificado (.txt)</p>
                          </div>
                        </div>
                        <a 
                          href={`${apiUrl}/api/download/${resultFile}`} 
                          download={resultFile}
                          className="w-full sm:w-auto bg-primary text-primary-foreground h-12 px-10 rounded-xl flex items-center justify-center font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                          Descargar TXT
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}

import { AnimatePresence } from "framer-motion"
