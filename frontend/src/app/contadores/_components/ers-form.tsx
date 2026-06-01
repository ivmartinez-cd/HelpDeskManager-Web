import { memo } from "react"
import { Loader2, PlusCircle, Search, Download } from "lucide-react"
import type { ErsClient } from "../_hooks/use-ers-clients"

interface ErsFormProps {
  isLoadingErsClients: boolean
  filteredErsClients: ErsClient[]
  selectedErsClient: ErsClient | null
  showDropdown: boolean
  search: string
  ersSumaColor: boolean
  isProcessing: boolean
  fecha: string
  onToggleDropdown: () => void
  onSelectClient: (c: ErsClient) => void
  onSearchChange: (v: string) => void
  onToggleSumaColor: () => void
  onFechaChange: (v: string) => void
  onRun: () => void
}

export const ErsForm = memo(function ErsForm(p: ErsFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Seleccionar Cliente ERS</label>
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

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={p.onToggleSumaColor}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${p.ersSumaColor ? "bg-orange-500" : "bg-border"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${p.ersSumaColor ? "translate-x-5" : "translate-x-0"}`} />
        </div>
        <span className="text-sm font-medium text-foreground">Suma color</span>
        <span className="text-[11px] text-muted-foreground">(equipo color: suma ciclos totales en CLASE 20, TIPO 21)</span>
      </label>

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
