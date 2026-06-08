"use client"

import { useState, useCallback } from "react"
import type { ProyeccionSummary, ProyeccionRow, ValidationRow, AuditRow } from "./types"

export type ProcessStatus = "idle" | "success" | "error"

export interface LogEntry { msg: string; time: string }

export function useProcess() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<ProcessStatus>("idle")
  const [message, setMessage] = useState("")
  const [resultFiles, setResultFiles] = useState<string[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [modalError, setModalError] = useState<string | null>(null)
  const [proyeccionSummary, setProyeccionSummary] = useState<ProyeccionSummary | null>(null)
  const [proyeccionData, setProyeccionData] = useState<ProyeccionRow[]>([])
  const [proyeccionValidation, setProyeccionValidation] = useState<ValidationRow[]>([])
  const [proyeccionAudit, setProyeccionAudit] = useState<AuditRow[]>([])

  const addLog = useCallback((msg: string, delay: number = 0) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setTimeout(() => setLogs(prev => [...prev.slice(-4), { msg, time }]), delay)
  }, [])

  const resetProcess = useCallback(() => {
    setStatus("idle")
    setMessage("")
    setResultFiles([])
    setModalError(null)
    setLogs([])
    setProyeccionSummary(null)
    setProyeccionData([])
    setProyeccionValidation([])
    setProyeccionAudit([])
  }, [])

  return {
    isProcessing, setIsProcessing,
    status, setStatus,
    message, setMessage,
    resultFiles, setResultFiles,
    logs,
    modalError, setModalError,
    addLog,
    resetProcess,
    proyeccionSummary, setProyeccionSummary,
    proyeccionData, setProyeccionData,
    proyeccionValidation, setProyeccionValidation,
    proyeccionAudit, setProyeccionAudit,
  }
}
