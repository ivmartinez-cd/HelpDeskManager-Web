"use client"

import { useState, useMemo, useEffect, useRef, memo } from "react"
import { Search, Download, FileText, X, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import type { ProyeccionSummary, ProyeccionRow } from "../_hooks/types"

const PAGE_SIZE = 15

type MethodFilter = "ALL" | "REAL" | "PROYECTADO" | "SIN DATOS"

const DIST_RANGES = [
  { key: "1 dia",       label: "1 día",        color: "bg-emerald-500",  text: "text-emerald-500",  desc: "Máxima Precisión" },
  { key: "2-7 dias",    label: "2–7 días",      color: "bg-green-400",    text: "text-green-400",    desc: "Alta Precisión" },
  { key: "8-30 dias",   label: "8–30 días",     color: "bg-amber-500",    text: "text-amber-500",    desc: "Buena Precisión" },
  { key: "31-90 dias",  label: "31–90 días",    color: "bg-orange-500",   text: "text-orange-500",   desc: "Precisión Media" },
  { key: "91-365 dias", label: "91–365 días",   color: "bg-red-500",      text: "text-red-500",      desc: "Crítica" },
  { key: "+365 dias",   label: "+365 días",     color: "bg-rose-700",     text: "text-rose-700",     desc: "Histórica Crítica" },
]

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

interface KpiCardProps {
  label: string
  value: number
  sub?: string
  glowClass: string
  textClass: string
  pct?: number
  wide?: boolean
}

const KpiCard = memo(function KpiCard({ label, value, sub, glowClass, textClass, pct, wide }: KpiCardProps) {
  const animated = useCountUp(value)
  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-md p-6 flex flex-col gap-2 ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 ${glowClass}`} />
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`text-4xl font-black tabular-nums tracking-tighter ${textClass}`}>{animated.toLocaleString()}</p>
      {pct !== undefined && (
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${glowClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
        </div>
      )}
      {sub && <p className="text-[10px] text-muted-foreground font-medium">{sub}</p>}
    </div>
  )
})

function MethodBadge({ method }: { method: string }) {
  if (method === "REAL") return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />REAL
    </span>
  )
  if (method === "PROYECTADO") return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />PROY.
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />S/D
    </span>
  )
}

interface Props {
  summary: ProyeccionSummary
  data: ProyeccionRow[]
  resultFiles: string[]
  apiUrl: string
  onReset: () => void
}

export const ProyeccionDashboard = memo(function ProyeccionDashboard({ summary, data, resultFiles, apiUrl, onReset }: Props) {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL")
  const [page, setPage] = useState(1)

  const pctReal = summary.total > 0 ? (summary.reales / summary.total) * 100 : 0
  const pctProy = summary.total > 0 ? (summary.proyectados / summary.total) * 100 : 0
  const pctSin  = summary.total > 0 ? (summary.sin_datos  / summary.total) * 100 : 0

  const distTotal = Object.values(summary.dist).reduce((a, b) => a + b, 0) || 1

  const filtered = useMemo(() => {
    let rows = data
    if (methodFilter !== "ALL") rows = rows.filter(r => r["Metodo"] === methodFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(r =>
        r["Nro Serie"]?.toLowerCase().includes(q) ||
        r["Articulo"]?.toLowerCase().includes(q) ||
        r["Sector"]?.toLowerCase().includes(q) ||
        r["Metodo"]?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [data, methodFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, methodFilter])

  const isOldDate = (dateStr: string | null) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const today = new Date()
    const diffDays = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays > 60
  }

  const formatDate = (s: string | null) => {
    if (!s) return "—"
    const d = new Date(s)
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })
  }

  return (
    <div className="space-y-6 animate-fade-in-scale">
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-4">
          <KpiCard
            label="Total Equipos Procesados"
            value={summary.total}
            sub={`Fecha de toma: ${formatDate(summary.fecha_toma)}`}
            glowClass="bg-blue-500"
            textClass="text-blue-500"
          />
        </div>
        <KpiCard label="Lectura Real" value={summary.reales} pct={pctReal} glowClass="bg-emerald-500" textClass="text-emerald-500" />
        <KpiCard label="Proyectado" value={summary.proyectados} pct={pctProy} glowClass="bg-amber-500" textClass="text-amber-500" />
        <KpiCard label="Sin Datos" value={summary.sin_datos} pct={pctSin} glowClass="bg-rose-500" textClass="text-rose-500" />
        <KpiCard
          label="Mediana Días Base"
          value={Math.round(summary.dias_mediana)}
          sub={`Máx: ${summary.dias_max} días`}
          glowClass="bg-violet-500"
          textClass="text-violet-500"
        />
      </div>

      {/* Distribution bars */}
      {summary.proyectados > 0 && (
        <div className="rounded-3xl border bg-card/60 backdrop-blur-md p-5 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Distribución de Antigüedad (Proyectados)</p>
          <div className="space-y-2">
            {DIST_RANGES.map(range => {
              const count = summary.dist[range.key] ?? 0
              const pct = (count / distTotal) * 100
              return (
                <div key={range.key} className="flex items-center gap-3">
                  <span className={`w-20 text-[9px] font-bold shrink-0 ${range.text}`}>{range.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${range.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[9px] font-bold text-muted-foreground tabular-nums">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Download buttons */}
      {resultFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {resultFiles.map(f => (
            <a
              key={f}
              href={`${apiUrl}/api/download/${f}`}
              download
              className="group flex items-center gap-3 p-4 rounded-2xl border bg-background/50 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
            >
              <div className="p-2 bg-orange-500/10 rounded-xl shrink-0">
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-foreground truncate">{f.endsWith(".csv") ? "CSV SiGes" : "Planilla Excel"}</p>
                <p className="text-[9px] text-muted-foreground truncate">{f}</p>
              </div>
              <Download className="h-4 w-4 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
            </a>
          ))}
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-3xl border bg-card/60 backdrop-blur-md overflow-hidden">
        {/* Table toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por serie, modelo, sector..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-xl border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {(["ALL", "REAL", "PROYECTADO", "SIN DATOS"] as MethodFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setMethodFilter(f)}
                className={`px-3 h-9 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                  methodFilter === f
                    ? f === "ALL"       ? "bg-foreground text-background"
                    : f === "REAL"      ? "bg-emerald-500 text-white"
                    : f === "PROYECTADO"? "bg-amber-500 text-white"
                    :                    "bg-rose-500 text-white"
                    : "border bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "ALL" ? "Todos" : f === "PROYECTADO" ? "Proy." : f === "SIN DATOS" ? "S/D" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Serie</th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Modelo / Sector</th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Últ. Lectura</th>
                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Días Proy.</th>
                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Págs. Sumadas</th>
                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Cont. Proyectado</th>
                <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Método</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    Sin resultados para los filtros aplicados.
                  </td>
                </tr>
              ) : pageRows.map((row, i) => {
                const old = isOldDate(row["Fecha Ultima Lectura"])
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground whitespace-nowrap">{row["Nro Serie"]}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground truncate max-w-[140px]">{row["Articulo"]}</p>
                      <p className="text-[9px] text-muted-foreground truncate max-w-[140px]">{row["Sector"]}</p>
                    </td>
                    <td className={`px-4 py-3 font-mono whitespace-nowrap ${old ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                      {formatDate(row["Fecha Ultima Lectura"])}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                      {row["Dias Proyectados"] != null ? row["Dias Proyectados"] : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-500 tabular-nums">
                      {row["Paginas Sumadas"] != null ? row["Paginas Sumadas"]?.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-foreground tabular-nums">
                      {row["Contador Proyectado"] != null ? row["Contador Proyectado"]?.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
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
          <p className="text-[9px] text-muted-foreground font-bold">
            {filtered.length} equipos &middot; pág. {safePage}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-xs font-bold text-muted-foreground"
      >
        <RefreshCw className="h-4 w-4" />
        Nueva proyección
      </button>
    </div>
  )
})
