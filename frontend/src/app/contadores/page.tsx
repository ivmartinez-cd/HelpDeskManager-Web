"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Download, Loader2, CheckCircle2,
  AlertCircle, Database, Calculator, Wand2, Eraser,
  PlusCircle, Server, Search, Play, X, ArrowRight
} from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { PageShell } from "@/components/ui/page-shell"
import { PageHeader } from "@/components/ui/page-header"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { FileInput } from "@/components/ui/file-input"
import { toast } from "@/hooks/use-toast"

interface Client {
  id: number;
  name: string;
}

export default function ContadoresPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resultFiles, setResultFiles] = useState<string[]>([])
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [modalError, setModalError] = useState<string | null>(null)

  const addLog = (msg: string, delay: number = 0) => {
    setTimeout(() => setLogs(prev => [...prev.slice(-4), msg]), delay)
  }

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [clientSearch, setClientSearch] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010"

  const [toolData, setToolData] = useState({
    en0_cliente: "",
    en0_fecha: new Date().toLocaleDateString('es-ES'),
    suma_hojas: 1000,
    suma_fecha: new Date().toLocaleDateString('es-ES'),
    auto_fecha: new Date().toLocaleDateString('es-ES'),
    manual_fecha: "",
    calc: { ci: 0, cf: 0, fi: "", ff: "", fe: "" }
  })
  const [calcResult, setCalcResult] = useState<any>(null)

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true)
      try {
        const response = await fetch(`${apiUrl}/api/ftp/clients`)
        const data = await response.json()
        if (data.clients) setClients(data.clients)
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast("Error al cargar lista de clientes", "error")
      } finally {
        setIsLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  const runManualProcess = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsProcessing(true)
    setStatus("idle")
    setResultFiles([])

    addLog("Iniciando carga de archivo DB3...", 0)
    addLog("Validando estructura de base de datos...", 1000)
    addLog("Filtrando registros por fecha...", 2500)

    const formData = new FormData()
    formData.append("file", files[0])
    formData.append("fecha_maxima", toolData.manual_fecha)

    try {
      const response = await fetch(`${apiUrl}/api/contadores/process-db3`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al procesar DB3")
      }

      addLog("Generando archivo CSV...", 4000)
      addLog("Proceso completado con éxito.", 5500)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = files[0].name.replace(".db3", ".csv")
      document.body.appendChild(a)
      a.click()
      a.remove()

      setStatus("success")
      setMessage("¡DB3 procesado y descargado con éxito!")
      toast("Proceso DB3 finalizado", "success")
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message)
      setModalError(error.message)
    } finally {
      setIsProcessing(false)
      setLogs([])
    }
  }

  const runFtpProcess = async () => {
    if (!selectedClient) return
    setIsProcessing(true)
    setStatus("idle")
    setResultFiles([])

    addLog(`Conectando al servidor FTP de ${selectedClient}...`, 0)
    addLog("Autenticando credenciales...", 1500)
    addLog("Buscando bases de datos recientes...", 3000)

    try {
      const response = await fetch(`${apiUrl}/api/ftp/process-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: selectedClient }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)

      addLog("Descarga exitosa. Iniciando conversión...", 5000)
      addLog("Generando proyecciones temporales...", 7000)

      setResultFiles([data.csv_file, data.db3_file])
      setStatus("success")
      setMessage(data.message)
      toast("Sincronización FTP completada", "success")
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message)
      setModalError(error.message)
    } finally {
      setIsProcessing(false)
      setLogs([])
    }
  }

  const runTool = async (tool: string, toolFiles: FileList | null) => {
    if (!toolFiles || toolFiles.length === 0) return
    setIsProcessing(true)
    setStatus("idle")
    setResultFiles([])

    addLog(`Iniciando herramienta: ${tool.toUpperCase()}...`, 0)
    addLog("Preparando archivos para transferencia...", 1000)

    const formData = new FormData()
    let endpoint = ""

    if (tool === "en0") {
      endpoint = "/api/tools/en0"
      formData.append("file", toolFiles[0])
      formData.append("fecha", toolData.en0_fecha)
      formData.append("cliente", toolData.en0_cliente || "CLIENTE")
      addLog("Limpiando equipos a cero...", 2500)
    } else if (tool === "suma") {
      endpoint = "/api/tools/suma-fija"
      for (let i = 0; i < toolFiles.length; i++) formData.append("files", toolFiles[i])
      formData.append("fecha", toolData.suma_fecha)
      formData.append("hojas", toolData.suma_hojas.toString())
      addLog(`Aplicando suma fija de ${toolData.suma_hojas} hojas...`, 2500)
    } else if (tool === "auto") {
      endpoint = "/api/tools/autoestim"
      formData.append("file", toolFiles[0])
      formData.append("fecha", toolData.auto_fecha)
      addLog("Generando proyecciones IA...", 2500)
    }

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Error en la herramienta")

      addLog("Recibiendo resultados del servidor...", 4500)
      addLog("Verificando integridad del reporte...", 6000)

      if (data.file) setResultFiles([data.file])
      if (data.files) setResultFiles(data.files)

      setStatus("success")
      setMessage(data.message || "Proceso completado.")
      toast(`Herramienta ${tool.toUpperCase()} ejecutada`, "success")
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message)
      setModalError(error.message)
      toast("Error en la ejecución", "error")
    } finally {
      setIsProcessing(false)
      setLogs([])
    }
  }

  const runCalc = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tools/calc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolData.calc),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      setCalcResult(data)
    } catch (error: any) { setModalError(error.message) }
  }

  const closeModal = () => {
    setActiveTool(null)
    setStatus("idle")
    setMessage("")
    setResultFiles([])
    setModalError(null)
    setCalcResult(null)
  }

  return (
    <PageShell>
      <div className="h-full flex flex-col items-center px-4">
        <PageHeader
          badge="Panel de Herramientas de Datos"
          titleLine1="CENTRO DE"
          titleLine2="CONTADORES"
          description="Automatización de reportes y gestión de bases de datos con precisión industrial."
        />

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 max-w-[1600px] mx-auto">
            <ActionCard
              icon={Server}
              title="Descarga FTP"
              desc="Obtén las bases de datos directamente desde los servidores de los clientes."
              color="text-indigo-500"
              onClick={() => setActiveTool("ftp")}
              delay={0.4}
            />
            <ActionCard
              icon={Database}
              title="Procesar DB3"
              desc="Sube manualmente archivos .db3 para convertirlos a CSV localmente."
              color="text-orange-500"
              onClick={() => setActiveTool("manual")}
              delay={0.5}
            />
            <ActionCard
              icon={Eraser}
              title="Estimación en 0"
              desc="Resetea equipos que no reportaron usando el último contador conocido."
              color="text-rose-500"
              onClick={() => setActiveTool("en0")}
              delay={0.6}
            />
            <ActionCard
              icon={PlusCircle}
              title="Suma Fija"
              desc="Aplica incrementos masivos de hojas a partir de archivos Excel."
              color="text-emerald-500"
              onClick={() => setActiveTool("suma")}
              delay={0.7}
            />
            <ActionCard
              icon={Wand2}
              title="Asistente IA"
              desc="Genera proyecciones automáticas basadas en el historial de consumo."
              color="text-amber-500"
              onClick={() => setActiveTool("auto")}
              delay={0.8}
            />
            <ActionCard
              icon={Calculator}
              title="Calculadora"
              desc="Herramienta interactiva para proyecciones manuales por fecha."
              color="text-sky-500"
              onClick={() => setActiveTool("calc")}
              delay={0.9}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!activeTool}
        onClose={closeModal}
        title={
          activeTool === "ftp" ? "Descarga FTP" :
          activeTool === "manual" ? "Procesar DB3" :
          activeTool === "en0" ? "Estimación en 0" :
          activeTool === "suma" ? "Suma Fija" :
          activeTool === "auto" ? "Asistente IA" :
          activeTool === "calc" ? "Calculadora" : ""
        }
        maxWidth="max-w-lg"
        error={modalError}
      >
        <div className={`space-y-6 relative z-10 transition-all duration-300 ${showClientDropdown ? "pb-64" : ""}`}>
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="py-12 flex flex-col items-center justify-center gap-6"
              >
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
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i}
                          className="text-accent flex items-center gap-2"
                        >
                          <span className="text-accent/30 font-bold">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <span className="text-foreground/90">{log}</span>
                        </motion.p>
                      ))}
                      <motion.p
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-accent/50 italic"
                      >
                        _ analizando subprocesos técnicos...
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : status === "success" || status === "error" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 py-4"
              >
                <div className={`p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 ${status === "success" ? "bg-green-500/10 border border-green-500/20 text-green-600" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
                  <div className={`p-4 rounded-2xl ${status === "success" ? "bg-green-500/20" : "bg-destructive/20"}`}>
                    {status === "success" ? <CheckCircle2 className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black tracking-tighter uppercase">{status === "success" ? "¡Completado!" : "Error en el proceso"}</h3>
                    <p className="font-medium text-sm opacity-80">{message}</p>
                  </div>
                </div>

                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Resultado</p>
                      <p className="text-xs font-bold text-foreground">Procesado OK</p>
                    </div>
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Seguridad</p>
                      <p className="text-xs font-bold text-foreground">Validado</p>
                    </div>
                  </motion.div>
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
                  onClick={() => setStatus("idle")}
                  className="w-full h-14 bg-secondary hover:bg-secondary/80 rounded-2xl font-bold transition-all text-foreground"
                >
                  Volver a intentar
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {activeTool === "ftp" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Seleccionar Cliente</label>
                      {isLoadingClients ? (
                        <div className="h-14 flex items-center justify-center border rounded-2xl bg-muted/20">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="relative">
                          <div
                            className="w-full h-14 px-5 rounded-2xl border bg-background flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition-all shadow-sm"
                            onClick={() => setShowClientDropdown(!showClientDropdown)}
                          >
                            <span className={selectedClient ? "text-foreground font-medium" : "text-muted-foreground"}>
                              {selectedClient || "Selecciona un cliente..."}
                            </span>
                            <PlusCircle className={`h-5 w-5 text-muted-foreground transition-transform ${showClientDropdown ? "rotate-45" : ""}`} />
                          </div>
                          <AnimatePresence>
                            {showClientDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-3xl shadow-2xl z-[60] overflow-hidden"
                              >
                                <div className="p-4 border-b bg-muted/20">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                      autoFocus
                                      type="text"
                                      placeholder="Buscar cliente..."
                                      className="w-full h-10 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
                                      value={clientSearch}
                                      onChange={(e) => setClientSearch(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                                  {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                                    <button
                                      key={c.id}
                                      onClick={() => {
                                        setSelectedClient(c.name)
                                        setShowClientDropdown(false)
                                        setClientSearch("")
                                      }}
                                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${selectedClient === c.name ? "bg-orange-500 text-white font-bold" : "hover:bg-accent text-foreground"}`}
                                    >
                                      {c.name}
                                    </button>
                                  ))}
                                  {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 && (
                                    <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron clientes.</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={runFtpProcess}
                      disabled={!selectedClient || isProcessing}
                      className="w-full h-14 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      Iniciar Descarga
                    </button>
                  </div>
                )}

                {activeTool === "manual" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha Máxima (Opcional)</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground"
                        value={toolData.manual_fecha}
                        onChange={e => setToolData({ ...toolData, manual_fecha: e.target.value })}
                      />
                    </div>
                    <FileInput label="Seleccionar archivo .db3" accept=".db3" onChange={(files) => runManualProcess(files)} error={status === "error"} />
                  </div>
                )}

                {activeTool === "en0" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cliente</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={toolData.en0_cliente} onChange={e => setToolData({ ...toolData, en0_cliente: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={toolData.en0_fecha} onChange={e => setToolData({ ...toolData, en0_fecha: e.target.value })} />
                      </div>
                    </div>
                    <FileInput label="Sube el CSV de entrada" accept=".csv" onChange={(files) => runTool("en0", files)} error={status === "error"} />
                  </div>
                )}

                {activeTool === "suma" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Hojas a Sumar</label>
                        <input type="number" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={toolData.suma_hojas} onChange={e => setToolData({ ...toolData, suma_hojas: parseInt(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={toolData.suma_fecha} onChange={e => setToolData({ ...toolData, suma_fecha: e.target.value })} />
                      </div>
                    </div>
                    <FileInput label="Selecciona archivos XLS/XLSX" multiple accept=".xls,.xlsx" onChange={(files) => runTool("suma", files)} error={status === "error"} />
                  </div>
                )}

                {activeTool === "auto" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha de Estimación</label>
                      <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={toolData.auto_fecha} onChange={e => setToolData({ ...toolData, auto_fecha: e.target.value })} />
                    </div>
                    <FileInput label="Selecciona CSV Detalle" accept=".csv" onChange={(files) => runTool("auto", files)} error={status === "error"} />
                  </div>
                )}

                {activeTool === "calc" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3 p-5 bg-muted/20 rounded-[2rem] border">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Lectura Inicial</p>
                        <input type="text" placeholder="DD/MM/YYYY" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={toolData.calc.fi} onChange={e => setToolData({ ...toolData, calc: { ...toolData.calc, fi: e.target.value } })} />
                        <input type="number" placeholder="Contador" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" onChange={e => setToolData({ ...toolData, calc: { ...toolData.calc, ci: parseInt(e.target.value) } })} />
                      </div>
                      <div className="space-y-3 p-5 bg-muted/20 rounded-[2rem] border">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Lectura Final</p>
                        <input type="text" placeholder="DD/MM/YYYY" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={toolData.calc.ff} onChange={e => setToolData({ ...toolData, calc: { ...toolData.calc, ff: e.target.value } })} />
                        <input type="number" placeholder="Contador" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" onChange={e => setToolData({ ...toolData, calc: { ...toolData.calc, cf: parseInt(e.target.value) } })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha a Proyectar</label>
                      <input type="text" placeholder="DD/MM/YYYY" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={toolData.calc.fe} onChange={e => setToolData({ ...toolData, calc: { ...toolData.calc, fe: e.target.value } })} />
                    </div>
                    <button onClick={runCalc} className="w-full h-14 bg-sky-500 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-sky-500/20">Calcular Proyección</button>

                    {calcResult && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-sky-500/5 border border-sky-500/20 rounded-[2rem] grid grid-cols-2 gap-6">
                        <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Imp. Diarias</p><p className="text-2xl font-bold text-foreground">{calcResult.imp_dia}</p></div>
                        <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Cont. Estimado</p><p className="text-2xl font-bold text-sky-500">{calcResult.cont_est}</p></div>
                        <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Imp. Mensual</p><p className="text-2xl font-bold text-foreground">{calcResult.imp_mes}</p></div>
                        <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Días Totales</p><p className="text-2xl font-bold text-foreground">{calcResult.dias_est}</p></div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </PageShell>
  )
}

function ActionCard({ icon: Icon, title, desc, color, onClick, delay }: {
  icon: React.ElementType
  title: string
  desc: string
  color: string
  onClick: () => void
  delay: number
}) {
  return (
    <SpotlightCard onClick={onClick} delay={delay}>
      <div className="p-4">
        <div className={`mb-2 p-2 inline-flex rounded-lg bg-orange-500/10 ${color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold mb-0.5 text-foreground group-hover:text-orange-500 transition-colors">{title}</h3>
        <p className="text-muted-foreground text-[11px] leading-tight mb-3 line-clamp-2">{desc}</p>
        <div className="flex items-center gap-2 text-[9px] font-bold text-orange-500">
          INICIAR PROCESO
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </SpotlightCard>
  )
}
