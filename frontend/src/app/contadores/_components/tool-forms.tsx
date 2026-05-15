import { memo } from "react"
import { FileInput } from "@/components/ui/file-input"
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

interface AutoFormProps {
  fecha: string
  onFechaChange: (v: string) => void
  onRun: (files: FileList | null) => void
}

export const AutoForm = memo(function AutoForm({ fecha, onFechaChange, onRun }: AutoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha de Estimación</label>
        <input type="text" className="w-full h-14 px-5 rounded-2xl border bg-background text-foreground" value={fecha} onChange={e => onFechaChange(e.target.value)} />
      </div>
      <FileInput label="Selecciona CSV Detalle" accept=".csv" onChange={onRun} />
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
