"use client"

import { useState, useCallback } from "react"

export type ProcessStatus = "idle" | "success" | "error"

export interface LogEntry { msg: string; time: string }

export function useProcess() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<ProcessStatus>("idle")
  const [message, setMessage] = useState("")
  const [resultFiles, setResultFiles] = useState<string[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [modalError, setModalError] = useState<string | null>(null)

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
  }
}
