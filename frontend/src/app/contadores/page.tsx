"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, FileText, Download, Loader2, CheckCircle2, 
  AlertCircle, Database, Calculator, Wand2, Eraser, 
  PlusCircle, Server, Search, Play, X, Clock
} from "lucide-react"

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
  
  // FTP State
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [clientSearch, setClientSearch] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";

  // Tool Specific States
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

    const formData = new FormData()
    formData.append("file", files[0])
    formData.append("fecha_maxima", toolData.manual_fecha)

    try {
      const response = await fetch(`${apiUrl}/api/contadores/process-db3`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Error al procesar DB3")
      
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
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const runFtpProcess = async () => {
    if (!selectedClient) return
    setIsProcessing(true)
    setStatus("idle")
    setResultFiles([])

    try {
      const response = await fetch(`${apiUrl}/api/ftp/process-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: selectedClient }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      
      setResultFiles([data.csv_file, data.db3_file])
      setStatus("success")
      setMessage(data.message)
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const runTool = async (tool: string, toolFiles: FileList | null) => {
    if (!toolFiles || toolFiles.length === 0) return
    setIsProcessing(true)
    setStatus("idle")
    setResultFiles([])

    const formData = new FormData()
    let endpoint = ""

    if (tool === "en0") {
      endpoint = "/api/tools/en0"
      formData.append("file", toolFiles[0])
      formData.append("fecha", toolData.en0_fecha)
      formData.append("cliente", toolData.en0_cliente || "CLIENTE")
    } else if (tool === "suma") {
      endpoint = "/api/tools/suma-fija"
      for(let i=0; i<toolFiles.length; i++) formData.append("files", toolFiles[i])
      formData.append("fecha", toolData.suma_fecha)
      formData.append("hojas", toolData.suma_hojas.toString())
    } else if (tool === "auto") {
      endpoint = "/api/tools/autoestim"
      formData.append("file", toolFiles[0])
      formData.append("fecha", toolData.auto_fecha)
    }

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Error en la herramienta")
      
      if (data.file) setResultFiles([data.file])
      if (data.files) setResultFiles(data.files)
      
      setStatus("success")
      setMessage(data.message || "Proceso completado.")
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message)
    } finally {
      setIsProcessing(false)
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
    } catch (error: any) { alert(error.message) }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Centro de Contadores
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Gestiona el procesamiento de datos, descargas automáticas y herramientas de estimación en un solo lugar.
            </p>
          </motion.div>

          {/* Grid de Acciones Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. FTP Card */}
            <ActionCard 
              icon={<Server className="h-8 w-8" />}
              title="Descarga FTP"
              desc="Obtén las bases de datos directamente desde los servidores de los clientes."
              color="bg-indigo-500"
              onClick={() => setActiveTool("ftp")}
            />

            {/* 2. Manual DB3 Card */}
            <ActionCard 
              icon={<Database className="h-8 w-8" />}
              title="Procesar DB3"
              desc="Sube manualmente archivos .db3 para convertirlos a CSV localmente."
              color="bg-primary"
              onClick={() => setActiveTool("manual")}
            />

            {/* 3. Limpiar a Cero Card */}
            <ActionCard 
              icon={<Eraser className="h-8 w-8" />}
              title="Limpiar a Cero"
              desc="Resetea equipos que no reportaron usando el último contador conocido."
              color="bg-rose-500"
              onClick={() => setActiveTool("en0")}
            />

            {/* 4. Suma Fija Card */}
            <ActionCard 
              icon={<PlusCircle className="h-8 w-8" />}
              title="Suma Fija"
              desc="Aplica incrementos masivos de hojas a partir de archivos Excel."
              color="bg-emerald-500"
              onClick={() => setActiveTool("suma")}
            />

            {/* 5. Asistente IA Card */}
            <ActionCard 
              icon={<Wand2 className="h-8 w-8" />}
              title="Asistente IA"
              desc="Genera proyecciones automáticas basadas en el historial de consumo."
              color="bg-amber-500"
              onClick={() => setActiveTool("auto")}
            />

            {/* 6. Calculadora Card */}
            <ActionCard 
              icon={<Calculator className="h-8 w-8" />}
              title="Calculadora"
              desc="Herramienta interactiva para proyecciones manuales por fecha."
              color="bg-sky-500"
              onClick={() => setActiveTool("calc")}
            />

          </div>

          {/* El estado y los resultados ahora se manejan directamente dentro de los modales de cada herramienta */}

        </div>
      </main>

      {/* Modals for Tools */}
      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setActiveTool(null); setStatus("idle"); setMessage(""); setResultFiles([]); }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-card border rounded-[2.5rem] shadow-2xl p-8">
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {activeTool === "ftp" && <><Server className="h-6 w-6 text-indigo-500" /> Descarga FTP</>}
                  {activeTool === "manual" && <><Database className="h-6 w-6 text-primary" /> Procesar DB3</>}
                  {activeTool === "en0" && <><Eraser className="h-6 w-6 text-rose-500" /> Limpiar a Cero</>}
                  {activeTool === "suma" && <><PlusCircle className="h-6 w-6 text-emerald-500" /> Suma Fija</>}
                  {activeTool === "auto" && <><Wand2 className="h-6 w-6 text-amber-500" /> Asistente IA</>}
                  {activeTool === "calc" && <><Calculator className="h-6 w-6 text-sky-500" /> Calculadora</>}
                </h2>
                <button onClick={() => { setActiveTool(null); setStatus("idle"); setMessage(""); setResultFiles([]); }} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="py-12 flex flex-col items-center justify-center gap-6"
                    >
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-1">Procesando solicitud</h3>
                        <p className="text-muted-foreground animate-pulse">Esto puede tardar unos segundos...</p>
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
                          <h3 className="text-2xl font-bold">{status === "success" ? "¡Completado!" : "Error en el proceso"}</h3>
                          <p className="font-medium opacity-80">{message}</p>
                        </div>
                      </div>

                      {resultFiles.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase text-muted-foreground ml-1">Archivos listos para descargar</p>
                          <div className="grid grid-cols-1 gap-3">
                            {resultFiles.map(f => (
                              <a 
                                key={f} 
                                href={`${apiUrl}/api/download/${f}`} 
                                download 
                                className="flex items-center justify-between p-5 bg-card border rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-primary/10 rounded-xl">
                                    <FileText className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-sm truncate max-w-[200px]">{f}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Documento Generado</p>
                                  </div>
                                </div>
                                <Download className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => setStatus("idle")}
                        className="w-full h-14 bg-accent hover:bg-accent/80 rounded-2xl font-bold transition-all"
                      >
                        Volver a intentar
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      {activeTool === "ftp" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Seleccionar Cliente</label>
                            {isLoadingClients ? (
                              <div className="h-12 flex items-center justify-center border rounded-2xl bg-muted/20">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="relative">
                                <div 
                                  className="w-full h-14 px-5 rounded-2xl border bg-background flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all shadow-sm"
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
                                      className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-[2rem] shadow-2xl z-[60] overflow-hidden"
                                    >
                                      <div className="p-4 border-b bg-muted/20">
                                        <div className="relative">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <input 
                                            autoFocus
                                            type="text" 
                                            placeholder="Buscar cliente..." 
                                            className="w-full h-10 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${selectedClient === c.name ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"}`}
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
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Fecha Máxima (Opcional)</label>
                            <input 
                              type="text" 
                              placeholder="DD/MM/YYYY" 
                              className="w-full h-12 px-4 rounded-2xl border bg-background" 
                              value={toolData.manual_fecha}
                              onChange={e => setToolData({...toolData, manual_fecha: e.target.value})}
                            />
                          </div>
                          <FileInput label="Seleccionar archivo .db3" accept=".db3" onChange={files => runManualProcess(files)} />
                        </div>
                      )}

                      {activeTool === "en0" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Cliente</label>
                              <input type="text" className="w-full h-12 px-4 rounded-2xl border bg-background" value={toolData.en0_cliente} onChange={e => setToolData({...toolData, en0_cliente: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Fecha</label>
                              <input type="text" className="w-full h-12 px-4 rounded-2xl border bg-background" value={toolData.en0_fecha} onChange={e => setToolData({...toolData, en0_fecha: e.target.value})} />
                            </div>
                          </div>
                          <FileInput label="Sube el CSV de entrada" accept=".csv" onChange={files => runTool("en0", files)} />
                        </div>
                      )}

                      {activeTool === "suma" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Hojas a Sumar</label>
                              <input type="number" className="w-full h-12 px-4 rounded-2xl border bg-background" value={toolData.suma_hojas} onChange={e => setToolData({...toolData, suma_hojas: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Fecha</label>
                              <input type="text" className="w-full h-12 px-4 rounded-2xl border bg-background" value={toolData.suma_fecha} onChange={e => setToolData({...toolData, suma_fecha: e.target.value})} />
                            </div>
                          </div>
                          <FileInput label="Selecciona archivos XLS/XLSX" multiple accept=".xls,.xlsx" onChange={files => runTool("suma", files)} />
                        </div>
                      )}

                      {activeTool === "auto" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Fecha de Estimación</label>
                            <input type="text" className="w-full h-12 px-4 rounded-2xl border bg-background" value={toolData.auto_fecha} onChange={e => setToolData({...toolData, auto_fecha: e.target.value})} />
                          </div>
                          <FileInput label="Selecciona CSV Detalle" accept=".csv" onChange={files => runTool("auto", files)} />
                        </div>
                      )}

                      {activeTool === "calc" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3 p-4 bg-muted/20 rounded-3xl border">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Lectura Inicial</p>
                              <input type="text" placeholder="DD/MM/YYYY" className="w-full h-10 px-3 rounded-xl border bg-background text-sm" value={toolData.calc.fi} onChange={e => setToolData({...toolData, calc: {...toolData.calc, fi: e.target.value}})} />
                              <input type="number" placeholder="Contador" className="w-full h-10 px-3 rounded-xl border bg-background text-sm" onChange={e => setToolData({...toolData, calc: {...toolData.calc, ci: parseInt(e.target.value)}})} />
                            </div>
                            <div className="space-y-3 p-4 bg-muted/20 rounded-3xl border">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Lectura Final</p>
                              <input type="text" placeholder="DD/MM/YYYY" className="w-full h-10 px-3 rounded-xl border bg-background text-sm" value={toolData.calc.ff} onChange={e => setToolData({...toolData, calc: {...toolData.calc, ff: e.target.value}})} />
                              <input type="number" placeholder="Contador" className="w-full h-10 px-3 rounded-xl border bg-background text-sm" onChange={e => setToolData({...toolData, calc: {...toolData.calc, cf: parseInt(e.target.value)}})} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Fecha a Proyectar</label>
                            <input type="text" placeholder="DD/MM/YYYY" className="w-full h-12 px-4 rounded-2xl border bg-background" value={toolData.calc.fe} onChange={e => setToolData({...toolData, calc: {...toolData.calc, fe: e.target.value}})} />
                          </div>
                          <button onClick={runCalc} className="w-full h-14 bg-sky-500 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-sky-500/20">Calcular Proyección</button>
                          
                          {calcResult && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-sky-500/5 border border-sky-500/20 rounded-[2rem] grid grid-cols-2 gap-6">
                              <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Imp. Diarias</p><p className="text-2xl font-bold">{calcResult.imp_dia}</p></div>
                              <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Cont. Estimado</p><p className="text-2xl font-bold text-sky-600">{calcResult.cont_est}</p></div>
                              <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Imp. Mensual</p><p className="text-2xl font-bold">{calcResult.imp_mes}</p></div>
                              <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Días Totales</p><p className="text-2xl font-bold">{calcResult.dias_est}</p></div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function ActionCard({ icon, title, desc, color, onClick }: any) {
  return (
    <motion.button 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card border rounded-[2.5rem] p-8 text-left hover:shadow-2xl transition-all group relative overflow-hidden"
    >
      <div className={`mb-6 p-4 inline-flex rounded-3xl text-white ${color} shadow-lg group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      <div className="mt-6 flex items-center text-xs font-bold text-primary group-hover:gap-2 transition-all">
        INICIAR PROCESO <Play className="h-3 w-3 fill-current ml-1" />
      </div>
    </motion.button>
  )
}

function FileInput({ label, accept, multiple, onChange }: any) {
  return (
    <div className="relative border-2 border-dashed rounded-[2rem] p-10 text-center hover:bg-accent/10 transition-colors group">
      <input type="file" accept={accept} multiple={multiple} className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => onChange(e.target.files)} />
      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
      <p className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">{label}</p>
    </div>
  )
}
