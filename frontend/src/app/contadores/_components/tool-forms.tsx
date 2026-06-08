import { memo } from "react"
import { FileInput } from "@/components/ui/file-input"
import { Loader2, PlusCircle, Search, Wand2 } from "lucide-react"
import type { CalcResult } from "../_hooks/types"

interface ManualFormProps {
  fecha: string
  onFechaChange: (v: string) => void
  onRun: (files: FileList | null) => void
}

export const ManualForm = memo(function ManualForm({ fecha, onFechaChange, onRun }: ManualFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha Máxima (Opcional)</label>
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground"
          value={fecha}
          onChange={e => onFechaChange(e.target.value)}
        />
      </div>
      <FileInput label="Seleccionar archivos .db3" multiple onChange={onRun} />
    </div>
  )
})

interface En0FormProps {
  cliente: string
  fecha: string
  onClienteChange: (v: string) => void
  onFechaChange: (v: string) => void
  onRun: (files: FileList | null) => void
}

export const En0Form = memo(function En0Form({ cliente, fecha, onClienteChange, onFechaChange, onRun }: En0FormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cliente</label>
          <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={cliente} onChange={e => onClienteChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha</label>
          <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={fecha} onChange={e => onFechaChange(e.target.value)} />
        </div>
      </div>
      <FileInput label="Sube el CSV de entrada" accept=".csv" onChange={onRun} />
    </div>
  )
})

interface SumaFormProps {
  hojas: number
  fecha: string
  onHojasChange: (v: number) => void
  onFechaChange: (v: string) => void
  onRun: (files: FileList | null) => void
}

export const SumaForm = memo(function SumaForm({ hojas, fecha, onHojasChange, onFechaChange, onRun }: SumaFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Hojas a Sumar</label>
          <input type="number" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={hojas} onChange={e => onHojasChange(parseInt(e.target.value))} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha</label>
          <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={fecha} onChange={e => onFechaChange(e.target.value)} />
        </div>
      </div>
      <FileInput label="Selecciona archivos XLS/XLSX" multiple accept=".xls,.xlsx" onChange={onRun} />
    </div>
  )
})

interface ProyeccionFormProps {
  fecha: string
  tolerancia: number
  minIntervalo: number
  ventana: number
  umbral: number
  maxAntiguedad: number
  isLoadingEmpresas: boolean
  filteredEmpresas: string[]
  selectedEmpresa: string | null
  showDropdown: boolean
  search: string
  isProcessing: boolean
  onFechaChange: (v: string) => void
  onToleranciaChange: (v: number) => void
  onMinIntervaloChange: (v: number) => void
  onVentanaChange: (v: number) => void
  onUmbralChange: (v: number) => void
  onMaxAntiguedadChange: (v: number) => void
  onSelectEmpresa: (name: string) => void
  onToggleDropdown: () => void
  onSearchChange: (v: string) => void
  onRun: () => void
}

export const ProyeccionForm = memo(function ProyeccionForm({
  fecha, tolerancia, minIntervalo, ventana, umbral, maxAntiguedad,
  isLoadingEmpresas, filteredEmpresas, selectedEmpresa, showDropdown, search, isProcessing,
  onFechaChange, onToleranciaChange, onMinIntervaloChange, onVentanaChange,
  onUmbralChange, onMaxAntiguedadChange, onSelectEmpresa, onToggleDropdown, onSearchChange, onRun,
}: ProyeccionFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Empresa</label>
        {isLoadingEmpresas ? (
          <div className="h-14 flex items-center justify-center border rounded-2xl bg-muted/20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando empresas desde SSRS...</span>
          </div>
        ) : (
          <div className="relative">
            <div
              className="w-full h-14 px-5 rounded-2xl border bg-background flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-all shadow-sm"
              onClick={onToggleDropdown}
            >
              <span className={selectedEmpresa ? "text-foreground font-medium" : "text-muted-foreground"}>
                {selectedEmpresa ?? "Selecciona una empresa..."}
              </span>
              <PlusCircle className={`h-5 w-5 text-muted-foreground transition-transform ${showDropdown ? "rotate-45" : ""}`} />
            </div>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-3xl shadow-2xl z-[60] overflow-hidden animate-slide-from-top">
                <div className="p-4 border-b bg-muted/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar empresa..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                      value={search}
                      onChange={e => onSearchChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                  {filteredEmpresas.map(e => (
                    <button
                      key={e}
                      onClick={() => { onSelectEmpresa(e); onSearchChange("") }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${selectedEmpresa === e ? "bg-amber-500 text-white font-bold" : "hover:bg-accent text-foreground"}`}
                    >
                      {e}
                    </button>
                  ))}
                  {filteredEmpresas.length === 0 && (
                    <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron empresas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha de Toma</label>
        <input
          type="text"
          className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground"
          value={fecha}
          onChange={e => onFechaChange(e.target.value)}
          placeholder="DD/MM/YYYY"
        />
      </div>

      <details className="group border border-border rounded-2xl overflow-hidden bg-muted/5">
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-[10px] uppercase text-muted-foreground select-none">
          <span>Ajustes Avanzados</span>
          <span className="transition-transform group-open:rotate-180 text-xs">▼</span>
        </summary>
        <div className="p-4 pt-0 border-t grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Tolerancia (Días)</label>
            <input type="number" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={tolerancia} onChange={e => onToleranciaChange(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Intervalo Mín. (Días)</label>
            <input type="number" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={minIntervalo} onChange={e => onMinIntervaloChange(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Ventana Historial (Días)</label>
            <input type="number" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={ventana} onChange={e => onVentanaChange(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Umbral Mín. Consumo</label>
            <input type="number" step="0.01" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={umbral} onChange={e => onUmbralChange(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Antigüedad Máx. Lectura (Días)</label>
            <input type="number" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={maxAntiguedad} onChange={e => onMaxAntiguedadChange(parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </details>

      <button
        onClick={onRun}
        disabled={!selectedEmpresa || isProcessing}
        className="w-full h-14 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
      >
        <Wand2 className="h-5 w-5" />
        Calcular Proyección
      </button>
    </div>
  )
})

interface CalcData { ci: number; cf: number; fi: string; ff: string; fe: string }

interface CalcFormProps {
  calc: CalcData
  calcResult: CalcResult | null
  onCalcChange: (d: CalcData) => void
  onRun: () => void
}

export const CalcForm = memo(function CalcForm({ calc, calcResult, onCalcChange, onRun }: CalcFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3 p-5 bg-muted/20 rounded-[2rem] border">
          <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Lectura Inicial</p>
          <input type="text" placeholder="DD/MM/YYYY" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={calc.fi} onChange={e => onCalcChange({ ...calc, fi: e.target.value })} />
          <input type="number" placeholder="Contador" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" onChange={e => onCalcChange({ ...calc, ci: parseInt(e.target.value) })} />
        </div>
        <div className="space-y-3 p-5 bg-muted/20 rounded-[2rem] border">
          <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Lectura Final</p>
          <input type="text" placeholder="DD/MM/YYYY" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" value={calc.ff} onChange={e => onCalcChange({ ...calc, ff: e.target.value })} />
          <input type="number" placeholder="Contador" className="w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground" onChange={e => onCalcChange({ ...calc, cf: parseInt(e.target.value) })} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha a Proyectar</label>
        <input type="text" placeholder="DD/MM/YYYY" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={calc.fe} onChange={e => onCalcChange({ ...calc, fe: e.target.value })} />
      </div>
      <button onClick={onRun} className="w-full h-14 bg-sky-500 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-sky-500/20">Calcular Proyección</button>

      {calcResult && (
        <div className="p-6 bg-sky-500/5 border border-sky-500/20 rounded-[2rem] grid grid-cols-2 gap-6 animate-fade-in-scale">
          <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Imp. Diarias</p><p className="text-2xl font-bold text-foreground">{calcResult.imp_dia}</p></div>
          <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Cont. Estimado</p><p className="text-2xl font-bold text-sky-500">{calcResult.cont_est}</p></div>
          <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Imp. Mensual</p><p className="text-2xl font-bold text-foreground">{calcResult.imp_mes}</p></div>
          <div><p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Días Totales</p><p className="text-2xl font-bold text-foreground">{calcResult.dias_est}</p></div>
        </div>
      )}
    </div>
  )
})
