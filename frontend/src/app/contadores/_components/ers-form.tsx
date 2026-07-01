import { memo } from "react"
import { Loader2, PlusCircle, Search, Download, Settings, ChevronLeft } from "lucide-react"
import type { ErsClient } from "../_hooks/use-ers-clients"

interface ErsFormProps {
  isLoadingErsClients: boolean
  filteredErsClients: ErsClient[]
  selectedErsClient: ErsClient | null
  showDropdown: boolean
  search: string
  isManaging: boolean
  savingId: string | null
  isProcessing: boolean
  fecha: string
  onToggleDropdown: () => void
  onSelectClient: (c: ErsClient) => void
  onSearchChange: (v: string) => void
  onToggleManaging: () => void
  onSaveSumaColor: (c: ErsClient, sumaColor: boolean) => void
  onFechaChange: (v: string) => void
  onRun: () => void
}

export const ErsForm = memo(function ErsForm(p: ErsFormProps) {
  if (p.isManaging) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={p.onToggleManaging}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            VOLVER A SELECCIÓN
          </button>
          <h3 className="text-sm font-black uppercase tracking-widest text-accent">Gestión de Clientes ERS</h3>
        </div>
        <p className="text-[11px] text-muted-foreground px-1">
          Definí por cliente si suma mono+color en un solo contador (según su contrato), para que se aplique automáticamente en cada descarga.
        </p>
        <div className="max-h-[340px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {p.filteredErsClients.map(c => (
            <div key={c.customer_id} className="p-4 bg-muted/20 border rounded-2xl transition-all hover:border-orange-500/50">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-sm text-foreground truncate">{c.name}</p>
                <div
                  onClick={() => p.savingId === c.customer_id ? undefined : p.onSaveSumaColor(c, !c.suma_color)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${c.suma_color ? "bg-orange-500" : "bg-border"} ${p.savingId === c.customer_id ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${c.suma_color ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>
            </div>
          ))}
          {p.filteredErsClients.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron clientes.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-bold uppercase text-muted-foreground">Seleccionar Cliente ERS</label>
          <button onClick={p.onToggleManaging} className="flex items-center gap-1.5 text-[10px] font-black text-accent hover:text-orange-400 transition-colors uppercase tracking-wider">
            <Settings className="h-3 w-3" />
            Gestionar Clientes
          </button>
        </div>
        {p.isLoadingErsClients ? (
          <div className="h-14 flex items-center justify-center border rounded-2xl bg-muted/20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="relative">
            <div
              className="w-full h-14 px-5 rounded-2xl border bg-background flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition-all shadow-sm"
              onClick={p.onToggleDropdown}
            >
              <span className={p.selectedErsClient ? "text-foreground font-medium" : "text-muted-foreground"}>
                {p.selectedErsClient ? p.selectedErsClient.name : "Selecciona un cliente..."}
              </span>
              <PlusCircle className={`h-5 w-5 text-muted-foreground transition-transform ${p.showDropdown ? "rotate-45" : ""}`} />
            </div>
            {p.showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-3xl shadow-2xl z-[60] overflow-hidden animate-slide-from-top">
                  <div className="p-4 border-b bg-muted/20">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Buscar cliente ERS..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
                        value={p.search}
                        onChange={e => p.onSearchChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                    {p.filteredErsClients.map(c => (
                      <button
                        key={c.customer_id}
                        onClick={() => { p.onSelectClient(c); p.onSearchChange("") }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${p.selectedErsClient?.customer_id === c.customer_id ? "bg-orange-500 text-white font-bold" : "hover:bg-accent text-foreground"}`}
                      >
                        {c.name}
                      </button>
                    ))}
                    {p.filteredErsClients.length === 0 && (
                      <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron clientes.</p>
                    )}
                  </div>
                </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha Máxima de Proceso</label>
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
          value={p.fecha}
          onChange={e => p.onFechaChange(e.target.value)}
        />
      </div>

      {p.selectedErsClient && (
        <div className="flex items-center gap-2 px-1 text-sm">
          <span className="text-muted-foreground">Suma color:</span>
          <span className={`font-bold ${p.selectedErsClient.suma_color ? "text-orange-500" : "text-foreground"}`}>
            {p.selectedErsClient.suma_color ? "Sí" : "No"}
          </span>
          <span className="text-[11px] text-muted-foreground">(según contrato del cliente — editar en &quot;Gestionar Clientes&quot;)</span>
        </div>
      )}

      <button
        onClick={p.onRun}
        disabled={!p.selectedErsClient || p.isProcessing}
        className="w-full h-14 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
      >
        <Download className="h-5 w-5" />
        Descargar Contadores
      </button>
    </div>
  )
})
