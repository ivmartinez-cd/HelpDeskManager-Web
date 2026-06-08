"use client"

import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react"
import {
  Search, Download, FileText, X, RefreshCw,
  ChevronLeft, ChevronRight, AlertTriangle, BarChart3, Edit3, Check,
  ArrowUp, ArrowDown, ArrowUpDown,
} from "lucide-react"
import type { ProyeccionSummary, ProyeccionRow, ValidationRow } from "../_hooks/types"

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

type MethodFilter = "ALL" | "REAL" | "PROYECTADO" | "SIN DATOS" | "CRITICO"
type ActiveTab = "dashboard" | "validation"

const DIST_RANGES = [
  { key: "1 dia",       label: "1 día",      color: "bg-emerald-500", text: "text-emerald-500" },
  { key: "2-7 dias",    label: "2–7 días",   color: "bg-green-400",   text: "text-green-400"   },
  { key: "8-30 dias",   label: "8–30 días",  color: "bg-amber-500",   text: "text-amber-500"   },
  { key: "31-90 dias",  label: "31–90 días", color: "bg-orange-500",  text: "text-orange-500"  },
  { key: "91-365 dias", label: "91–365 días",color: "bg-red-500",     text: "text-red-500"     },
  { key: "+365 dias",   label: "+365 días",  color: "bg-rose-700",    text: "text-rose-700"    },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return value
}

function formatDate(s: string | null | undefined): string {
  if (!s) return "—"
  const dateStr = s.includes("T") ? s : `${s}T00:00:00`
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function dlBlob(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function buildSigesCSV(data: ProyeccionRow[], overrides: Record<string, number>): string {
  const withOv = data.map(r => {
    const ov = overrides[`${r["Nro Serie"]}|||${r["Clase"]}`]
    return ov !== undefined ? { ...r, "Contador Proyectado": ov } : r
  })
  const proyecSeries = new Set(
    withOv.filter(r => r["Metodo"] === "PROYECTADO").map(r => r["Nro Serie"])
  )
  const filtered = withOv.filter(r => proyecSeries.has(r["Nro Serie"]))

  const bySerie = new Map<string, ProyeccionRow[]>()
  for (const r of filtered) {
    bySerie.set(r["Nro Serie"], [...(bySerie.get(r["Nro Serie"]) ?? []), r])
  }

  const lines = ["SERIE;FECHA;TIPO;CLASE_10;CONTADOR_10;CLASE_20;CONTADOR_20;MOTIVO;OBSERVACIONES"]
  for (const [serie, grupo] of bySerie) {
    const mono  = grupo.find(r => r["Clase"] === "Mono")  ?? null
    const color = grupo.find(r => r["Clase"] === "Color") ?? null
    const ref   = mono ?? color
    const fecha = ref?.["Fecha Toma"] ?? ""
    const obsParts: string[] = []
    if (mono?.["Observaciones"])  obsParts.push(`Mono: ${mono["Observaciones"]}`)
    if (color?.["Observaciones"]) obsParts.push(`Color: ${color["Observaciones"]}`)
    if (mono && color && mono["Observaciones"] === color["Observaciones"]) {
      obsParts.length = 0
      if (mono["Observaciones"]) obsParts.push(String(mono["Observaciones"]))
    }
    const metodos = [...new Set(grupo.map(r => r["Metodo"]))]
    lines.push([
      serie, fecha, 4,
      mono  ? 10 : "", mono?.["Contador Proyectado"]  ?? "",
      color ? 20 : "", color?.["Contador Proyectado"] ?? "",
      metodos.length === 1 ? metodos[0] : metodos.join(" / "),
      obsParts.join(" | "),
    ].join(";"))
  }
  return lines.join("\r\n")
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const KpiCard = memo(function KpiCard({ label, value, sub, glowColor, textClass, pct }: {
  label: string; value: number; sub?: string
  glowColor: string; textClass: string; pct?: number
}) {
  const animated = useCountUp(value)
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-md p-5 flex flex-col gap-1.5">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${glowColor}`} />
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`text-3xl font-black tabular-nums tracking-tighter leading-none ${textClass}`}>
        {animated.toLocaleString()}
      </p>
      {pct !== undefined && (
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${glowColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-[9px] font-bold text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
        </div>
      )}
      {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
})

function MethodBadge({ method }: { method: string }) {
  const cfg = method === "REAL"
    ? { ring: "bg-emerald-500 animate-pulse", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "REAL" }
    : method === "PROYECTADO"
    ? { ring: "bg-amber-500",  cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",   label: "PROY." }
    : { ring: "bg-rose-500",   cls: "bg-rose-500/10 text-rose-500 border-rose-500/20",       label: "S/D" }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.ring}`} />{cfg.label}
    </span>
  )
}

function ValidationView({ validation }: { validation: ValidationRow[] }) {
  const withReal    = validation.filter(r => r["Contador Real"] != null)
  const withoutReal = validation.filter(r => r["Contador Real"] == null)

  if (validation.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-4 text-center">
        <div className="p-4 rounded-2xl bg-muted/20 border">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="max-w-sm">
          <p className="font-bold text-sm text-foreground">Sin datos de validación</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Esta función requiere lecturas reales posteriores a la fecha de toma en el archivo Excel. Carga un reporte con historial futuro para ver la precisión de las proyecciones.
          </p>
        </div>
      </div>
    )
  }

  const avgError = withReal.length > 0
    ? withReal.reduce((s, r) => s + Math.abs(r["Error %"] ?? 0), 0) / withReal.length
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card/60 p-4 text-center">
          <p className="text-2xl font-black text-blue-500">{withReal.length}</p>
          <p className="text-[9px] font-black uppercase text-muted-foreground mt-1">Con lectura real</p>
        </div>
        <div className="rounded-2xl border bg-card/60 p-4 text-center">
          <p className="text-2xl font-black text-amber-500">{withoutReal.length}</p>
          <p className="text-[9px] font-black uppercase text-muted-foreground mt-1">Sin lectura aún</p>
        </div>
        <div className={`rounded-2xl border bg-card/60 p-4 text-center ${avgError > 10 ? "border-rose-500/30" : "border-emerald-500/30"}`}>
          <p className={`text-2xl font-black ${avgError > 10 ? "text-rose-500" : "text-emerald-500"}`}>
            {avgError.toFixed(1)}%
          </p>
          <p className="text-[9px] font-black uppercase text-muted-foreground mt-1">Error prom.</p>
        </div>
      </div>

      {withReal.length > 0 && (
        <div className="rounded-3xl border bg-card/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[560px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Serie", "Clase", "Proyectado", "Real", "Diferencia", "Error %"].map(h => (
                    <th key={h} className={`px-4 py-3 text-[9px] font-black uppercase tracking-wider text-muted-foreground ${h === "Serie" || h === "Clase" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withReal.map((r, i) => {
                  const abs = Math.abs(r["Error %"] ?? 0)
                  const errCls = abs > 10 ? "text-rose-500" : abs > 5 ? "text-amber-500" : "text-emerald-500"
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold">{r["Nro Serie"]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r["Clase"]}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{r["Contador Proyectado"]?.toLocaleString() ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-blue-500">{r["Contador Real"]?.toLocaleString() ?? "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${(r["Diferencia"] ?? 0) >= 0 ? "text-amber-500" : "text-blue-500"}`}>
                        {r["Diferencia"] != null ? `${r["Diferencia"] > 0 ? "+" : ""}${r["Diferencia"].toLocaleString()}` : "—"}
                      </td>
                      <td className={`px-4 py-3 text-right font-black tabular-nums ${errCls}`}>
                        {r["Error %"] != null ? `${r["Error %"] > 0 ? "+" : ""}${r["Error %"].toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar Panels (shared between xl sidebar and < xl inline) ──────────────

interface SidebarPanelsProps {
  monoPages: number
  colorPages: number
  totalClassPages: number
  resultFiles: string[]
  apiUrl: string
  hasOverrides: boolean
  overrideCount: number
  onExport: () => void
}

function SidebarPanels({
  monoPages, colorPages, totalClassPages,
  resultFiles, apiUrl, hasOverrides, overrideCount, onExport,
}: SidebarPanelsProps) {
  return (
    <>
      {/* Mono vs Color */}
      <div className="rounded-3xl border bg-card/60 p-5 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Páginas por Clase
        </p>
        <div className="flex items-center gap-3">
          <div className="text-center shrink-0">
            <p className="text-xl font-black text-slate-400">{monoPages.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-muted-foreground">Mono</p>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="w-full h-4 rounded-full overflow-hidden bg-muted flex">
              <div className="h-full bg-slate-400 transition-all duration-700"
                style={{ width: `${(monoPages / totalClassPages) * 100}%` }} />
              <div className="h-full bg-cyan-500 flex-1 transition-all duration-700" />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
              <span><span className="text-slate-400">■</span> {((monoPages / totalClassPages) * 100).toFixed(1)}%</span>
              <span>{((colorPages / totalClassPages) * 100).toFixed(1)}% <span className="text-cyan-500">■</span></span>
            </div>
          </div>
          <div className="text-center shrink-0">
            <p className="text-xl font-black text-cyan-500">{colorPages.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-muted-foreground">Color</p>
          </div>
        </div>
      </div>

      {/* Downloads */}
      {resultFiles.length > 0 && (
        <div className="space-y-2">
          {resultFiles.map(f => (
            <a key={f} href={`${apiUrl}/api/download/${f}`} download
              className="group flex items-center gap-2.5 p-3 rounded-2xl border bg-background/50 hover:border-orange-500/50 hover:shadow-md transition-all">
              <div className="p-1.5 bg-orange-500/10 rounded-xl shrink-0">
                <FileText className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-foreground">{f.endsWith(".csv") ? "CSV SiGes" : "Excel"}</p>
                <p className="text-[8px] text-muted-foreground truncate">{f}</p>
              </div>
              <Download className="h-3 w-3 text-orange-500 group-hover:scale-110 transition-transform shrink-0" />
            </a>
          ))}
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 text-center leading-tight">
              Exportar SiGes con correcciones
              {hasOverrides ? ` · ${overrideCount}` : ""}
            </span>
          </button>
        </div>
      )}
    </>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface Props {
  summary: ProyeccionSummary
  data: ProyeccionRow[]
  validation: ValidationRow[]
  resultFiles: string[]
  apiUrl: string
  onReset: () => void
}

type SortField =
  | "Nro Serie"
  | "Articulo"
  | "Clase"
  | "Fecha Ultima Lectura"
  | "Dias Proyectados"
  | "Paginas Sumadas"
  | "Contador Proyectado"
  | "Metodo"

type SortOrder = "asc" | "desc"

export const ProyeccionDashboard = memo(function ProyeccionDashboard({
  summary, data, validation, resultFiles, apiUrl, onReset,
}: Props) {
  const [activeTab, setActiveTab]       = useState<ActiveTab>("dashboard")
  const [search, setSearch]             = useState("")
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL")
  const [page, setPage]                 = useState(1)
  const [overrides, setOverrides]       = useState<Record<string, number>>({})
  const [editingKey, setEditingKey]     = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [sortField, setSortField]       = useState<SortField | null>(null)
  const [sortOrder, setSortOrder]       = useState<SortOrder>("asc")
  const editInputRef = useRef<HTMLInputElement>(null)

  const hasOverrides     = Object.keys(overrides).length > 0
  const criticoCount     = summary.dist["+365 dias"] ?? 0
  const validationWithReal = useMemo(() => validation.filter(r => r["Contador Real"] != null), [validation])

  const pctReal = summary.total > 0 ? (summary.reales      / summary.total) * 100 : 0
  const pctProy = summary.total > 0 ? (summary.proyectados / summary.total) * 100 : 0
  const pctSin  = summary.total > 0 ? (summary.sin_datos   / summary.total) * 100 : 0

  const distTotal = Object.values(summary.dist).reduce((a, b) => a + b, 0) || 1

  const monoPages  = useMemo(() => data.filter(r => r["Clase"] === "Mono" ).reduce((s, r) => s + (r["Paginas Sumadas"] ?? 0), 0), [data])
  const colorPages = useMemo(() => data.filter(r => r["Clase"] === "Color").reduce((s, r) => s + (r["Paginas Sumadas"] ?? 0), 0), [data])
  const totalClassPages = monoPages + colorPages || 1

  const filtered = useMemo(() => {
    let rows = data
    if (methodFilter === "CRITICO") {
      rows = rows.filter(r => r["Metodo"] === "PROYECTADO" && (r["Dias Proyectados"] ?? 0) > 365)
    } else if (methodFilter !== "ALL") {
      rows = rows.filter(r => r["Metodo"] === methodFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r["Nro Serie"]?.toLowerCase().includes(q) ||
        r["Articulo"]?.toLowerCase().includes(q)  ||
        r["Sector"]?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [data, methodFilter, search])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc")
      } else {
        setSortField(null)
        setSortOrder("asc")
      }
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }, [sortField, sortOrder])

  const renderHeader = useCallback((label: string, field: SortField, align: "left" | "right" | "center" = "left") => {
    const isSorted = sortField === field
    const alignCls = align === "left" ? "text-left" : align === "right" ? "justify-end text-right" : "justify-center text-center"
    const thAlignCls = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center"

    return (
      <th
        onClick={() => handleSort(field)}
        className={`group px-4 py-3 ${thAlignCls} text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:bg-muted/50 hover:text-foreground transition-all`}
      >
        <div className={`flex items-center gap-1.5 ${alignCls}`}>
          <span>{label}</span>
          <span className="shrink-0">
            {isSorted ? (
              sortOrder === "asc" ? (
                <ArrowUp className="h-3 w-3 text-foreground" />
              ) : (
                <ArrowDown className="h-3 w-3 text-foreground" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 hover:opacity-40 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    )
  }, [sortField, sortOrder, handleSort])

  const sorted = useMemo(() => {
    if (!sortField) return filtered

    const sortedRows = [...filtered]
    sortedRows.sort((a, b) => {
      let valA = sortField === "Contador Proyectado"
        ? (overrides[`${a["Nro Serie"]}|||${a["Clase"]}`] ?? a["Contador Proyectado"])
        : a[sortField]
      let valB = sortField === "Contador Proyectado"
        ? (overrides[`${b["Nro Serie"]}|||${b["Clase"]}`] ?? b["Contador Proyectado"])
        : b[sortField]

      if (valA === null || valA === undefined) {
        if (valB === null || valB === undefined) return 0
        return sortOrder === "asc" ? 1 : -1
      }
      if (valB === null || valB === undefined) {
        return sortOrder === "asc" ? -1 : 1
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      if (strA < strB) return sortOrder === "asc" ? -1 : 1
      if (strA > strB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
    return sortedRows
  }, [filtered, sortField, sortOrder, overrides])

  const tableTotalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage   = Math.min(page, tableTotalPages)
  const pageRows   = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, methodFilter, sortField, sortOrder])
  useEffect(() => {
    if (editingKey && editInputRef.current) editInputRef.current.focus()
  }, [editingKey])
  useEffect(() => {
    if (activeTab !== "dashboard") setEditingKey(null)
  }, [activeTab])

  const startEdit = useCallback((key: string, cur: number | null) => {
    setEditingKey(key)
    setEditingValue(String(cur ?? ""))
  }, [])

  const commitEdit = useCallback(() => {
    if (!editingKey) return
    const n = parseInt(editingValue, 10)
    if (!isNaN(n) && n >= 0) setOverrides(prev => ({ ...prev, [editingKey]: n }))
    setEditingKey(null)
  }, [editingKey, editingValue])

  const cancelEdit = useCallback(() => setEditingKey(null), [])

  return (
    <div className="space-y-5 animate-fade-in-scale">

      {/* ── Header: tabs + reset ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl">
          {(["dashboard", "validation"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "dashboard"
                ? "Dashboard"
                : `Validación${validationWithReal.length > 0 ? ` (${validationWithReal.length})` : ""}`}
            </button>
          ))}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
        >
          <RefreshCw className="h-3 w-3" />
          Nueva proyección
        </button>
      </div>

      {/* ── Dashboard Tab ────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <>
          {/* KPI Grid — 5 cols on large */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <KpiCard label="Total Procesados" value={summary.total}
                sub={`Toma: ${formatDate(summary.fecha_toma)}`}
                glowColor="bg-blue-500" textClass="text-blue-500" />
            </div>
            <KpiCard label="Total Real"  value={summary.reales}      pct={pctReal} glowColor="bg-emerald-500" textClass="text-emerald-500" />
            <KpiCard label="Total Proyectado"    value={summary.proyectados}  pct={pctProy} glowColor="bg-amber-500"   textClass="text-amber-500"   />
            <KpiCard label="Sin Datos"     value={summary.sin_datos}    pct={pctSin}  glowColor="bg-rose-500"    textClass="text-rose-500"    />
            <KpiCard label="Impresiones Proyectadas" value={monoPages + colorPages}
              sub={`Mono: ${monoPages.toLocaleString()} · Color: ${colorPages.toLocaleString()}`} glowColor="bg-violet-500" textClass="text-violet-500" />
          </div>

          {/* Body: [dist + table] | [sidebar] on xl+; stacked otherwise */}
          <div className="xl:flex xl:gap-4 xl:items-start space-y-4 xl:space-y-0">

            {/* ── Left / Main column ─────────────────────────────── */}
            <div className="xl:flex-1 xl:min-w-0 space-y-4">

              {/* Distribution bars */}
              <div className="rounded-3xl border bg-card/60 p-5 space-y-2.5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Antigüedad de Base (Proyectados)
                </p>
                {DIST_RANGES.map(range => {
                  const count = summary.dist[range.key] ?? 0
                  const pct   = (count / distTotal) * 100
                  return (
                    <div key={range.key} className="flex items-center gap-3">
                      <span className={`w-20 text-[9px] font-bold shrink-0 ${range.text}`}>{range.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${range.color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-7 text-right text-[9px] font-bold text-muted-foreground tabular-nums">{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Mono/Color + Downloads — visible only on < xl (sidebar takes over on xl+) */}
              <div className="xl:hidden space-y-3">
                <SidebarPanels
                  monoPages={monoPages} colorPages={colorPages} totalClassPages={totalClassPages}
                  resultFiles={resultFiles} apiUrl={apiUrl}
                  hasOverrides={hasOverrides} overrideCount={Object.keys(overrides).length}
                  onExport={() => dlBlob(buildSigesCSV(data, overrides), `SiGes_corregido_${Date.now()}.csv`)}
                />
              </div>

              {/* ── Data Table ─────────────────────────────────────── */}
              <div className="rounded-3xl border bg-card/60 backdrop-blur-md overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b flex flex-wrap gap-2.5 items-center">
              {/* Critical alert chip */}
              {criticoCount > 0 && (
                <button
                  onClick={() => setMethodFilter(f => f === "CRITICO" ? "ALL" : "CRITICO")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border shrink-0 transition-all ${
                    methodFilter === "CRITICO"
                      ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Lecturas +365 días: {criticoCount}
                </button>
              )}

              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar serie, modelo, sector..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 rounded-xl border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Method filter pills */}
              <div className="flex gap-1.5 shrink-0">
                {(["ALL", "REAL", "PROYECTADO", "SIN DATOS"] as MethodFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setMethodFilter(f)}
                    className={`px-3 h-9 rounded-xl text-[9px] font-black uppercase transition-all ${
                      methodFilter === f
                        ? f === "ALL"        ? "bg-foreground text-background"
                        : f === "REAL"       ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                        : f === "PROYECTADO" ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                        :                     "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                        : "border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "ALL" ? "Todos" : f === "PROYECTADO" ? "Proy." : f === "SIN DATOS" ? "S/D" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[720px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {renderHeader("Serie", "Nro Serie", "left")}
                    {renderHeader("Modelo / Sector", "Articulo", "left")}
                    {renderHeader("Clase", "Clase", "left")}
                    {renderHeader("Últ. Lectura", "Fecha Ultima Lectura", "left")}
                    {renderHeader("Días", "Dias Proyectados", "right")}
                    {renderHeader("Págs. Sumadas", "Paginas Sumadas", "right")}
                    {renderHeader("Cont. Proyectado", "Contador Proyectado", "right")}
                    {renderHeader("Método", "Metodo", "center")}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-xs">
                        Sin resultados para los filtros aplicados.
                      </td>
                    </tr>
                  ) : pageRows.map((row, i) => {
                    const rowKey     = `${row["Nro Serie"]}|||${row["Clase"]}`
                    const isEditing  = editingKey === rowKey
                    const ovVal      = overrides[rowKey]
                    const isModified = ovVal !== undefined
                    const displayCtr = ovVal ?? row["Contador Proyectado"]
                    const dias       = row["Dias Proyectados"] ?? 0
                    const isCritico  = dias > 365
                    const isOld      = dias > 60

                    return (
                      <tr key={i} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isCritico ? "bg-rose-500/[0.04]" : ""}`}>
                        <td className="px-4 py-2.5 font-mono font-bold text-foreground whitespace-nowrap">{row["Nro Serie"]}</td>
                        <td className="px-4 py-2.5 max-w-[200px]">
                          <p className="font-semibold text-foreground truncate" title={row["Articulo"]}>{row["Articulo"]}</p>
                          <p className="text-[9px] text-muted-foreground truncate" title={row["Sector"]}>{row["Sector"]}</p>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{row["Clase"]}</td>
                        <td className={`px-4 py-2.5 font-mono whitespace-nowrap ${isCritico ? "text-rose-500 font-bold" : isOld ? "text-amber-500" : "text-muted-foreground"}`}>
                          {formatDate(row["Fecha Ultima Lectura"])}
                        </td>
                        <td className={`px-4 py-2.5 text-right tabular-nums whitespace-nowrap ${isCritico ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                          {row["Dias Proyectados"] ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-amber-500 tabular-nums whitespace-nowrap">
                          {row["Paginas Sumadas"]?.toLocaleString() ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          {row["Metodo"] !== "REAL" ? (
                            isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  ref={editInputRef}
                                  type="number"
                                  value={editingValue}
                                  onChange={e => setEditingValue(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit() }}
                                  onBlur={commitEdit}
                                  className="w-24 h-7 px-2 rounded-lg border bg-background text-xs text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                                <button onClick={commitEdit} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(rowKey, displayCtr)}
                                title="Clic para editar"
                                className={`group flex items-center gap-1 justify-end w-full transition-colors ${
                                  isModified ? "text-emerald-500 font-black" : "font-black text-foreground hover:text-accent"
                                }`}
                              >
                                <span className="tabular-nums">{displayCtr?.toLocaleString() ?? "—"}</span>
                                <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                                {isModified && <span className="text-[8px] text-emerald-500/70 font-black">✓</span>}
                              </button>
                            )
                          ) : (
                            <span className="font-black text-foreground tabular-nums">{displayCtr?.toLocaleString() ?? "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <MethodBadge method={row["Metodo"]} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[9px] text-muted-foreground font-bold">
                  {filtered.length} equipos · pág. {safePage}/{tableTotalPages}
                </p>
                {hasOverrides && (
                  <span className="text-[9px] font-black text-emerald-500">
                    {Object.keys(overrides).length} corrección(es) pendiente(s)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-muted/50 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(tableTotalPages, p + 1))}
                  disabled={safePage === tableTotalPages}
                  className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-muted/50 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>{/* end table */}
        </div>{/* end left column */}

        {/* ── Right sidebar (xl+ only) ─────────────────────────── */}
        <div className="hidden xl:flex xl:flex-col xl:gap-3 xl:w-[280px] xl:shrink-0">
          <SidebarPanels
            monoPages={monoPages} colorPages={colorPages} totalClassPages={totalClassPages}
            resultFiles={resultFiles} apiUrl={apiUrl}
            hasOverrides={hasOverrides} overrideCount={Object.keys(overrides).length}
            onExport={() => dlBlob(buildSigesCSV(data, overrides), `SiGes_corregido_${Date.now()}.csv`)}
          />
        </div>

      </div>{/* end outer wrapper */}
        </>
      )}

      {/* ── Validation Tab ───────────────────────────────────────── */}
      {activeTab === "validation" && (
        <ValidationView validation={validation} />
      )}
    </div>
  )
})
