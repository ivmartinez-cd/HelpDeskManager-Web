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
  onFechaChange: (v: string) => void
  onToleranciaChange: (v: number) => void
  onMinIntervaloChange: (v: number) => void
  onVentanaChange: (v: number) => void
  onUmbralChange: (v: number) => void
  onMaxAntiguedadChange: (v: number) => void
  onRun: (files: FileList | null) => void
}

export const ProyeccionForm = memo(function ProyeccionForm({
  fecha, tolerancia, minIntervalo, ventana, umbral, maxAntiguedad,
  onFechaChange, onToleranciaChange, onMinIntervaloChange, onVentanaChange,
  onUmbralChange, onMaxAntiguedadChange, onRun,
}: ProyeccionFormProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Proceso Manual Requerido
        </div>
        <p>
          Debes descargar previamente el reporte{" "}
          <a
            href="http://reportes.cdsa.com.ar:8090/Reports/Pages/Report.aspx?ItemPath=%2fImpresi%c3%b3n%2fContadores+Facturables+por+empresa"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-600 dark:hover:text-amber-300 transition-colors font-bold"
          >
            "Contadores Facturables por empresa"
          </a>{" "}
          en formato Excel desde el servidor de reportes (SSRS) de la empresa y subirlo aquí para procesar la proyección.
        </p>
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

          <div className="col-span-2 mt-4 pt-4 border-t border-border/40 space-y-2.5 text-[10px] leading-normal">
            <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
              ¿Qué hace cada ajuste?
            </h4>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">Tolerancia (Días):</strong> Si la última lectura histórica tiene menos de estos días de antigüedad, se asume como <span className="font-semibold text-emerald-500">REAL</span> sin proyectar.
              </p>
              <p>
                <strong className="text-foreground">Intervalo Mín. (Días):</strong> Días mínimos que deben transcurrir entre lecturas históricas para poder calcular el consumo diario.
              </p>
              <p>
                <strong className="text-foreground">Ventana Historial (Días):</strong> Días máximos hacia atrás para evaluar la tendencia reciente (descartando lecturas más antiguas).
              </p>
              <p>
                <strong className="text-foreground">Umbral Mín. Consumo:</strong> Consumo diario mínimo requerido. Si la tendencia es menor, se forzará a 0 (se replica el último contador).
              </p>
              <p>
                <strong className="text-foreground">Antigüedad Máx. Lectura (Días):</strong> Si la lectura base supera estos días, se asume desactualizada y se fuerza la proyección a consumo 0.
              </p>
            </div>
          </div>
        </div>
      </details>

      <FileInput label="Subir reporte 'Contadores Facturables por empresa'" accept=".xlsx,.xls" onChange={onRun} />
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
