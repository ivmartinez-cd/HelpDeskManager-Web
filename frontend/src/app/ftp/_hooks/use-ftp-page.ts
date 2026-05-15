"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "@/hooks/use-toast"

export interface Client {
  id: number
  name: string
  host: string
  user: string
  password: string
  path: string
  pattern: string
}

const DEFAULT_FORM = {
  name: "",
  host: "www.cdsisa.com.ar",
  user: "",
  password: "",
  path: "/",
  pattern: "PrinterMonitorClient.db3.*",
}

export function useFtpPage(apiUrl: string) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Process state
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [csvFile, setCsvFile] = useState("")
  const [db3File, setDb3File] = useState("")
  const [fechaMaxima, setFechaMaxima] = useState("")

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [modalError, setModalError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredClients = useMemo(
    () => clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [clients, searchTerm]
  )

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true)
    try {
      const res = await fetch(`${apiUrl}/api/ftp/clients`)
      const data = await res.json()
      if (data.clients) setClients(data.clients)
    } catch (err) {
      console.error("Error fetching clients:", err)
    } finally {
      setIsLoadingClients(false)
    }
  }, [apiUrl])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients()
  }, [fetchClients])

  const handleProcess = useCallback(async () => {
    if (!selectedClient) return
    setIsProcessing(true)
    setStatus("idle")
    setMessage("")
    setCsvFile("")
    setDb3File("")
    try {
      const formattedDate = fechaMaxima ? fechaMaxima.split("-").reverse().join("/") : ""
      const res = await fetch(`${apiUrl}/api/ftp/process-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: selectedClient.name, fecha_maxima: formattedDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Error al procesar el cliente")
      setCsvFile(data.csv_file)
      setDb3File(data.db3_file)
      setStatus("success")
      setMessage(data.message)
    } catch (err) {
      const e = err as Error
      setStatus("error")
      setMessage(e.message || "Error de conexión con el servidor.")
    } finally {
      setIsProcessing(false)
    }
  }, [apiUrl, selectedClient, fechaMaxima])

  const openAddModal = useCallback(() => {
    setModalMode("add")
    setFormData(DEFAULT_FORM)
    setModalError(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((client: Client) => {
    setModalMode("edit")
    setEditingClient(client)
    setFormData({ name: client.name, host: client.host, user: client.user, password: client.password, path: client.path, pattern: client.pattern })
    setModalError(null)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setModalError(null)
  }, [])

  const handleSubmitModal = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const method = modalMode === "add" ? "POST" : "PUT"
    const url = modalMode === "add" ? `${apiUrl}/api/ftp/clients` : `${apiUrl}/api/ftp/clients/${editingClient?.id}`
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setIsModalOpen(false)
        setModalError(null)
        fetchClients()
        toast(modalMode === "add" ? "Cliente creado" : "Cliente actualizado", "success")
      } else {
        const err = await res.json()
        setModalError(err.detail || "Error al guardar el cliente")
      }
    } catch {
      setModalError("Error de conexión con el servidor")
    }
  }, [apiUrl, modalMode, editingClient, formData, fetchClients])

  const requestDelete = useCallback((id: number, name: string) => {
    setConfirmDelete({ id, name })
  }, [])

  const confirmAndDelete = useCallback(async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${apiUrl}/api/ftp/clients/${confirmDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        setSelectedClient(prev => prev?.id === confirmDelete.id ? null : prev)
        await fetchClients()
        setConfirmDelete(null)
        toast("Cliente eliminado", "success")
      }
    } catch {
      toast("Error al eliminar cliente", "error")
    } finally {
      setIsDeleting(false)
    }
  }, [apiUrl, confirmDelete, fetchClients])

  const selectClient = useCallback((client: Client) => {
    setSelectedClient(client)
    setStatus("idle")
    setMessage("")
    setCsvFile("")
    setDb3File("")
  }, [])

  return {
    clients, filteredClients, selectedClient, selectClient,
    isLoadingClients, searchTerm, setSearchTerm,
    isProcessing, status, message, csvFile, db3File,
    fechaMaxima, setFechaMaxima,
    handleProcess, fetchClients,
    isModalOpen, modalMode, editingClient, formData, setFormData, modalError,
    openAddModal, openEditModal, closeModal, handleSubmitModal,
    confirmDelete, isDeleting, requestDelete, confirmAndDelete, setConfirmDelete,
  }
}
