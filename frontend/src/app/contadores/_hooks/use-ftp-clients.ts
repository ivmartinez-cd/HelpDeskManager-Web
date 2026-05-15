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

const DEFAULT_FORM: Omit<Client, "id"> = {
  name: "", host: "", user: "", password: "", path: "/", pattern: "PrinterMonitorClient.db3.*"
}

export function useFtpClients(apiUrl: string) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isManaging, setIsManaging] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<Omit<Client, "id">>(DEFAULT_FORM)

  const filteredClients = useMemo(
    () => clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [clients, search]
  )

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true)
    try {
      const res = await fetch(`${apiUrl}/api/ftp/clients`)
      const data = await res.json()
      if (data.clients) setClients(data.clients)
    } catch (err) {
      console.error("Error fetching clients:", err)
      toast("Error al cargar lista de clientes", "error")
    } finally {
      setIsLoadingClients(false)
    }
  }, [apiUrl])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleSave = useCallback(async () => {
    const isEdit = !!editingClient
    const url = isEdit ? `${apiUrl}/api/ftp/clients/${editingClient!.id}` : `${apiUrl}/api/ftp/clients`
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Error al guardar cliente")
      }
      toast(isEdit ? "Cliente actualizado" : "Cliente creado", "success")
      await fetchClients()
      setEditingClient(null)
      setIsManaging(false)
      setFormData(DEFAULT_FORM)
    } catch (err) {
      throw err
    }
  }, [apiUrl, editingClient, formData, fetchClients])

  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/ftp/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar cliente")
      toast("Cliente eliminado", "success")
      setDeletingId(null)
      await fetchClients()
    } catch (err) {
      const e = err as Error
      toast(e.message, "error")
      setDeletingId(null)
    }
  }, [apiUrl, fetchClients])

  const resetDropdown = useCallback(() => {
    setShowDropdown(false)
    setSearch("")
  }, [])

  const startEdit = useCallback((c: Client) => {
    setEditingClient(c)
    setFormData({ name: c.name, host: c.host, user: c.user, password: c.password, path: c.path, pattern: c.pattern })
  }, [])

  return {
    clients, filteredClients,
    selectedClient, setSelectedClient,
    isLoadingClients,
    showDropdown, setShowDropdown,
    search, setSearch,
    deletingId, setDeletingId,
    isManaging, setIsManaging,
    editingClient, setEditingClient,
    formData, setFormData,
    handleSave, handleDelete,
    resetDropdown, startEdit,
  }
}
