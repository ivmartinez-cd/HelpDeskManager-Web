"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { Server, Search, RefreshCw, Play, CheckCircle2, AlertCircle, Loader2, Download, ExternalLink, Plus, Edit2, Trash2, X, Database, AlertTriangle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { toast } from "@/hooks/use-toast"

interface Client {
  id: number;
  name: string;
  host: string;
  user: string;
  password: string;
  path: string;
  pattern: string;
}

export default function FtpPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [csvFile, setCsvFile] = useState("")
  const [db3File, setDb3File] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    host: "www.cdsisa.com.ar",
    user: "",
    password: "",
    path: "/",
    pattern: "PrinterMonitorClient.db3.*"
  })
  const [modalError, setModalError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";

  const fetchClients = async () => {
    setIsLoadingClients(true)
    try {
      const response = await fetch(`${apiUrl}/api/ftp/clients`)
      const data = await response.json()
      if (data.clients) {
        setClients(data.clients)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleProcess = async () => {
    if (!selectedClient) return

    setIsProcessing(true)
    setStatus("idle")
    setMessage("")
    setCsvFile("")
    setDb3File("")

    try {
      const response = await fetch(`${apiUrl}/api/ftp/process-client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client_name: selectedClient.name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Error al procesar el cliente")
      }

      setCsvFile(data.csv_file)
      setDb3File(data.db3_file)
      setStatus("success")
      setMessage(data.message)
    } catch (error: any) {
      console.error(error)
      setStatus("error")
      setMessage(error.message || "Error de conexión con el servidor.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenAddModal = () => {
    setModalMode("add")
    setFormData({
      name: "",
      host: "www.cdsisa.com.ar",
      user: "",
      password: "",
      path: "/",
      pattern: "PrinterMonitorClient.db3.*"
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation()
    setModalMode("edit")
    setEditingClient(client)
    setFormData({
      name: client.name,
      host: client.host,
      user: client.user,
      password: client.password,
      path: client.path,
      pattern: client.pattern
    })
    setIsModalOpen(true)
  }

  const handleDeleteClient = async (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete({ id, name })
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${apiUrl}/api/ftp/clients/${confirmDelete.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        if (selectedClient?.id === confirmDelete.id) setSelectedClient(null)
        await fetchClients()
        setConfirmDelete(null)
        toast("Cliente eliminado", "success")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      toast("Error al eliminar cliente", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = modalMode === "add" ? "POST" : "PUT"
    const url = modalMode === "add" 
      ? `${apiUrl}/api/ftp/clients` 
      : `${apiUrl}/api/ftp/clients/${editingClient?.id}`

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setModalError(null)
        fetchClients()
        toast(modalMode === "add" ? "Cliente creado" : "Cliente actualizado", "success")
      } else {
        const errorData = await response.json()
        setModalError(errorData.detail || "Error al guardar el cliente")
      }
    } catch (error) {
      console.error("Error saving client:", error)
      setModalError("Error de conexión con el servidor")
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestión de Clientes FTP</h1>
              <p className="text-muted-foreground">Configura y procesa contadores desde la base de datos centralizada.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleOpenAddModal}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </button>
              <button 
                onClick={fetchClients}
                className="bg-accent/10 text-accent-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/20 transition-all"
                disabled={isLoadingClients}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingClients ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar: Client List */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="border rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm h-[65vh] overflow-y-auto custom-scrollbar">
                {isLoadingClients ? (
                  <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Cargando...</p>
                  </div>
                ) : filteredClients.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    <AnimatePresence mode="popLayout">
                      {filteredClients.map((client) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={client.id}
                          onClick={() => setSelectedClient(client)}
                          className={`
                            group w-full cursor-pointer px-6 py-4 transition-all flex items-center justify-between
                            ${selectedClient?.id === client.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-accent/30 border-l-4 border-transparent"}
                          `}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Server className={`h-4 w-4 shrink-0 ${selectedClient?.id === client.id ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`font-medium text-sm truncate ${selectedClient?.id === client.id ? "text-primary" : ""}`}>{client.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleOpenEditModal(client, e)}
                              className="p-1.5 hover:bg-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClient(client.id, client.name, e)}
                              className="p-1.5 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No hay clientes.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Main Action Area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2 space-y-6"
            >
              {selectedClient ? (
                <div className="p-8 rounded-3xl border bg-card/50 space-y-8 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                        <Database className="h-10 w-10" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{selectedClient.name}</h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          Configuración gestionada en Cloud Database <CheckCircle2 className="h-3 w-3 text-green-500" />
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-accent/5 border">
                       <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Servidor FTP</p>
                       <p className="text-sm font-mono truncate">{selectedClient.host}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-accent/5 border">
                       <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Ruta Remota</p>
                       <p className="text-sm font-mono truncate">{selectedClient.path}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      El sistema descargará todos los archivos coincidentes con el patrón <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{selectedClient.pattern}</code>, los fusionará y generará el reporte.
                    </p>
                    
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing || status === "success"}
                      className={`
                        w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-lg
                        ${status === "success" 
                          ? "bg-green-500 text-white cursor-default" 
                          : "bg-primary text-primary-foreground hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"}
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Descargando y Fusionando...
                        </>
                      ) : status === "success" ? (
                        <>
                          <CheckCircle2 className="h-6 w-6" />
                          ¡Procesamiento Completado!
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 fill-current" />
                          Iniciar Descarga y Proceso
                        </>
                      )}
                    </button>
                  </div>

                  {/* Result Section */}
                  {(message || csvFile || db3File) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6 pt-6 border-t"
                    >
                      {message && (
                        <div className={`
                          p-4 rounded-2xl flex items-center gap-3
                          ${status === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}
                        `}>
                          {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                          <span className="text-sm font-medium">{message}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {csvFile && (
                          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                                <Download className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">Reporte CSV</p>
                                <p className="text-[10px] text-muted-foreground">Contadores extraídos</p>
                              </div>
                            </div>
                            <a 
                              href={`${apiUrl}/api/download/${csvFile}`} 
                              download={csvFile}
                              className="w-full bg-primary text-primary-foreground h-9 rounded-xl flex items-center justify-center font-bold text-xs hover:opacity-90 transition-all"
                            >
                              Descargar CSV
                            </a>
                          </div>
                        )}

                        {db3File && (
                          <div className="bg-accent/10 border border-accent/20 p-5 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent p-2 rounded-xl text-accent-foreground">
                                <Server className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">Base de Datos</p>
                                <p className="text-[10px] text-muted-foreground">Archivo fusionado (.db3)</p>
                              </div>
                            </div>
                            <a 
                              href={`${apiUrl}/api/download/${db3File}`} 
                              download={db3File}
                              className="w-full bg-accent text-accent-foreground h-9 rounded-xl flex items-center justify-center font-bold text-xs hover:opacity-90 transition-all"
                            >
                              Descargar DB3
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[500px] rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center p-12">
                  <div className="bg-muted/50 p-6 rounded-full mb-4 text-muted-foreground">
                    <Database className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Base de Datos de Clientes</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Selecciona un cliente de la lista lateral o utiliza el botón "Nuevo Cliente" para añadir una configuración.
                  </p>
                </div>
              )}

              {/* Status Info Card */}
              <div className="p-6 rounded-3xl border bg-orange-500/5 border-orange-500/10">
                <h4 className="font-bold text-orange-600 mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Almacenamiento Cloud
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Los datos de configuración ahora se almacenan de forma segura en PostgreSQL (Neon). Esto garantiza redundancia, mayor velocidad y elimina la dependencia de archivos locales o del NAS.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setModalError(null)
        }}
        title={modalMode === "add" ? "Nuevo Cliente" : "Editar Cliente"}
        subtitle={modalMode === "add" ? "Configuración FTP" : `Editando ${editingClient?.name}`}
        error={modalError}
      >
        <form onSubmit={handleSubmitModal} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre del Cliente</label>
              <input 
                required
                type="text" 
                placeholder="Ej: ISSN"
                className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !formData.name ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Servidor FTP (Host)</label>
              <input 
                required
                type="text" 
                placeholder="www.cdsisa.com.ar"
                className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !formData.host ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
                value={formData.host}
                onChange={(e) => setFormData({...formData, host: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Usuario FTP</label>
                <input 
                  required
                  type="text" 
                  placeholder="usuario"
                  className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !formData.user ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
                  value={formData.user}
                  onChange={(e) => setFormData({...formData, user: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Contraseña FTP</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !formData.password ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Ruta FTP</label>
                <input 
                  required
                  type="text" 
                  placeholder="/"
                  className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !formData.path ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
                  value={formData.path}
                  onChange={(e) => setFormData({...formData, path: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Patrón de Archivos</label>
                <input 
                  required
                  type="text" 
                  placeholder="*.db3"
                  className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !formData.pattern ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
                  value={formData.pattern}
                  onChange={(e) => setFormData({...formData, pattern: e.target.value})}
                />
              </div>
            </div>
          </div>
          <button 
            type="submit"
            className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 group"
          >
            <CheckCircle2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
            {modalMode === "add" ? "Crear Cliente" : "Guardar Cambios"}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => !isDeleting && setConfirmDelete(null)}
        title="Eliminar cliente"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              ¿Eliminar <span className="font-bold text-foreground">{confirmDelete?.name}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => setConfirmDelete(null)}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-2xl border font-bold text-sm hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAndDelete}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
     
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </>
  )
}
