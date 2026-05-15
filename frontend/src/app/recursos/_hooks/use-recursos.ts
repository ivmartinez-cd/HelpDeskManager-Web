"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "@/hooks/use-toast"

export interface Resource {
  id: number
  name: string
  url: string
  category: string
}

export function useRecursos(apiUrl: string) {
  const [resources, setResources] = useState<Resource[]>([])
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRes, setNewRes] = useState({ name: "", url: "", category: "Documentación" })
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const filteredResources = useMemo(() => resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.url.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = activeCategory === "Todos" || r.category === activeCategory
    return matchesSearch && matchesCategory
  }), [resources, filter, activeCategory])

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(resources.map(r => r.category)))],
    [resources]
  )

  const fetchResources = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/resources`)
      const data = await res.json()
      setResources(data)
    } catch (err) {
      console.error("Error fetching resources:", err)
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResources()
  }, [fetchResources])

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    if (!newRes.name.trim() || !newRes.url.trim()) {
      setModalError("El nombre y la URL son obligatorios")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(`${apiUrl}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRes),
      })
      if (res.ok) {
        await fetchResources()
        setShowAddModal(false)
        setNewRes({ name: "", url: "", category: "Documentación" })
        toast("Recurso agregado correctamente", "success")
      } else {
        const data = await res.json()
        setModalError(data.detail || "Error al guardar el recurso")
      }
    } catch {
      setModalError("Error de conexión con el servidor")
      toast("Error al agregar recurso", "error")
    } finally {
      setIsSaving(false)
    }
  }, [apiUrl, newRes, fetchResources])

  const requestDelete = useCallback((id: number, name: string) => {
    setConfirmDelete({ id, name })
  }, [])

  const confirmAndDelete = useCallback(async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      await fetch(`${apiUrl}/api/resources/${confirmDelete.id}`, { method: "DELETE" })
      setResources(prev => prev.filter(r => r.id !== confirmDelete.id))
      setConfirmDelete(null)
      toast("Recurso eliminado", "success")
    } catch {
      toast("Error al eliminar recurso", "error")
    } finally {
      setIsDeleting(false)
    }
  }, [apiUrl, confirmDelete])

  const openAddModal = useCallback(() => {
    setShowAddModal(true)
    setModalError(null)
  }, [])

  const closeAddModal = useCallback(() => {
    setShowAddModal(false)
    setModalError(null)
  }, [])

  return {
    resources, filteredResources, categories,
    filter, setFilter,
    isLoading,
    activeCategory, setActiveCategory,
    showAddModal, openAddModal, closeAddModal,
    newRes, setNewRes,
    isSaving, modalError,
    confirmDelete, setConfirmDelete,
    isDeleting,
    handleAdd, requestDelete, confirmAndDelete,
  }
}
