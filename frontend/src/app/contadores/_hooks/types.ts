export interface CalcResult {
  imp_dia: number
  cont_est: number
  imp_mes: number
  dias_est: number
}

export interface ProyeccionSummary {
  fecha_toma: string
  total: number
  reales: number
  proyectados: number
  sin_datos: number
  n_hist: number
  n_futuro: number
  n_1dia: number
  pct_1dia: number
  dias_mediana: number
  dias_max: number
  consumo_mediana: number
  consumo_max: number
  dist: Record<string, number>
}

export interface ValidationRow {
  "Nro Serie": string
  "Clase": string
  "Fecha Toma": string
  "Contador Proyectado": number | null
  "Fecha Lectura Real": string | null
  "Contador Real": number | null
  "Diferencia": number | null
  "Error %": number | null
  "Nota": string
}

export interface ProyeccionRow {
  "Nro Serie": string
  "Clase": string
  "Articulo": string
  "Sector": string
  "Fecha Ultima Lectura": string | null
  "Contador Base": number | null
  "Dias Proyectados": number | null
  "Consumo Diario Promedio": number | null
  "Paginas Sumadas": number | null
  "Fecha Toma": string
  "Contador Proyectado": number | null
  "Metodo": "REAL" | "PROYECTADO" | "SIN DATOS"
  "Observaciones": string
}

export interface AuditRow {
  "Nro Serie": string
  "Clase": string
  "Fecha": string | null
  "Contador": number | null
  "Tipo Contador": string | null
  "Usado": boolean
  "Motivo": string
}
