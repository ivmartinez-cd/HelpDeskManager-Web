import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, PlusCircle, Search, Settings, Play, ChevronLeft, Edit, Trash2, Plus } from "lucide-react"
import type { Client } from "../_hooks/use-ftp-clients"

interface FtpFormProps {
  isLoadingClients: boolean
  clients: Client[]
  filteredClients: Client[]
  selectedClient: string
  showDropdown: boolean
  search: string
  deletingId: number | null
  isManaging: boolean
  editingClient: Client | null
  formData: Omit<Client, "id">
  isProcessing: boolean
  onSelectClient: (name: string) => void
  onToggleDropdown: () => void
  onSearchChange: (v: string) => void
  onToggleManaging: () => void
  onSetDeletingId: (id: number | null) => void
  onStartEdit: (c: Client) => void
  onSetFormData: (d: Omit<Client, "id">) => void
  onSetEditingClient: (c: Client | null) => void
  onSave: () => void
  onDelete: (id: number) => void
  onRun: () => void
  fecha: string
  onFechaChange: (v: string) => void
  onModalError: (msg: string) => void
}

export const FtpForm = memo(function FtpForm(p: FtpFormProps) {
  if (p.isManaging) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => { p.onToggleManaging(); p.onSetEditingClient(null) }}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            VOLVER A SELECCIÓN
          </button>
          {!p.editingClient && (
            <h3 className="text-sm font-black uppercase tracking-widest text-accent">Gestión de Clientes</h3>
          )}
        </div>

        {(p.editingClient || p.formData.name) ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 bg-muted/20 p-6 rounded-[2rem] border border-border">
            <div className="grid grid-cols-2 gap-4">
              {(["name", "host", "user", "password", "path", "pattern"] as const).map(field => (
                <div key={field} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    {field === "name" ? "Nombre Cliente" : field === "host" ? "Host FTP" : field === "user" ? "Usuario" : field === "password" ? "Contraseña" : field === "path" ? "Ruta Remota" : "Patrón DB3"}
                  </label>
                  <input
                    type={field === "password" ? "password" : "text"}
                    title={field === "password" ? "Contraseña FTP" : undefined}
                    className="w-full h-11 px-4 rounded-xl border bg-background text-sm"
                    value={p.formData[field]}
                    onChange={e => p.onSetFormData({ ...p.formData, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => { try { await p.onSave() } catch (err) { p.onModalError((err as Error).message) } }}
                className="flex-1 h-12 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
              >
                {p.editingClient ? "Actualizar Cliente" : "Guardar Nuevo Cliente"}
              </button>
              <button
                onClick={() => { p.onSetEditingClient(null); p.onSetFormData({ name: "", host: "", user: "", password: "", path: "/", pattern: "PrinterMonitorClient.db3.*" }) }}
                className="px-6 h-12 bg-muted rounded-xl font-bold hover:bg-muted/80 transition-all"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => p.onSetFormData({ name: "NUEVO CLIENTE", host: "", user: "", password: "", path: "/", pattern: "PrinterMonitorClient.db3.*" })}
              className="w-full h-14 border-2 border-dashed border-accent/20 rounded-2xl flex items-center justify-center gap-2 text-accent font-bold hover:bg-accent/5 transition-all mb-4"
            >
              <Plus className="h-5 w-5" />
              AGREGAR NUEVO CLIENTE
            </button>
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {p.clients.map(c => (
                <div key={c.id} className="p-4 bg-muted/20 border rounded-2xl transition-all hover:border-accent/50">
                  {p.deletingId === c.id ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-destructive">¿Eliminar <span className="text-foreground">{c.name}</span>?</p>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => p.onDelete(c.id)} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 transition-all">Eliminar</button>
                        <button onClick={() => p.onSetDeletingId(null)} className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.host}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => p.onStartEdit(c)} className="p-2 hover:bg-accent/10 rounded-lg text-muted-foreground hover:text-accent transition-colors"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => p.onSetDeletingId(c.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-bold uppercase text-muted-foreground">Seleccionar Cliente</label>
          <button onClick={p.onToggleManaging} className="flex items-center gap-1.5 text-[10px] font-black text-accent hover:text-orange-400 transition-colors uppercase tracking-wider">
            <Settings className="h-3 w-3" />
            Gestionar Clientes
          </button>
        </div>
        {p.isLoadingClients ? (
          <div className="h-14 flex items-center justify-center border rounded-2xl bg-muted/20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="relative">
            <div
              className="w-full h-14 px-5 rounded-2xl border bg-background flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition-all shadow-sm"
              onClick={p.onToggleDropdown}
            >
              <span className={p.selectedClient ? "text-foreground font-medium" : "text-muted-foreground"}>
                {p.selectedClient || "Selecciona un cliente..."}
              </span>
              <PlusCircle className={`h-5 w-5 text-muted-foreground transition-transform ${p.showDropdown ? "rotate-45" : ""}`} />
            </div>
            <AnimatePresence>
              {p.showDropdown && (
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
                        value={p.search}
                        onChange={e => p.onSearchChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                    {p.filteredClients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { p.onSelectClient(c.name); p.onSearchChange("") }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${p.selectedClient === c.name ? "bg-orange-500 text-white font-bold" : "hover:bg-accent text-foreground"}`}
                      >
                        {c.name}
                      </button>
                    ))}
                    {p.filteredClients.length === 0 && (
                      <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron clientes.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha Máxima de Procesamiento</label>
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
          value={p.fecha}
          onChange={e => p.onFechaChange(e.target.value)}
        />
      </div>

      <button
        onClick={p.onRun}
        disabled={!p.selectedClient || p.isProcessing}
        className="w-full h-14 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
      >
        <Play className="h-5 w-5 fill-current" />
        Iniciar Descarga
      </button>
    </div>
  )
})
