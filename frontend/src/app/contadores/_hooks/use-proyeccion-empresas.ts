"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "@/hooks/use-toast"

export function useProyeccionEmpresas(apiUrl: string) {
  const [empresas, setEmpresas] = useState<string[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null)
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState("")

  const filteredEmpresas = useMemo(
    () => empresas.filter(e => e.toLowerCase().includes(search.toLowerCase())),
    [empresas, search]
  )

  const fetchEmpresas = useCallback(async () => {
    setIsLoadingEmpresas(true)
    try {
      const res = await fetch(`${apiUrl}/api/tools/proyeccion/empresas`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Error al cargar empresas")
      if (data.empresas) setEmpresas(data.empresas)
    } catch (err) {
      console.error("Error fetching SSRS empresas:", err)
      toast("Error al cargar lista de empresas desde SSRS", "error")
    } finally {
      setIsLoadingEmpresas(false)
    }
  }, [apiUrl])

  const resetDropdown = useCallback(() => {
    setShowDropdown(false)
    setSearch("")
    setSelectedEmpresa(null)
  }, [])

  return {
    empresas,
    filteredEmpresas,
    selectedEmpresa,
    setSelectedEmpresa,
    isLoadingEmpresas,
    showDropdown,
    setShowDropdown,
    search,
    setSearch,
    fetchEmpresas,
    resetDropdown,
  }
}
