"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "@/hooks/use-toast"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErsClient = Record<string, any>

export function useErsClients(apiUrl: string) {
  const [ersClients, setErsClients] = useState<ErsClient[]>([])
  const [selectedErsClient, setSelectedErsClient] = useState<ErsClient | null>(null)
  const [isLoadingErsClients, setIsLoadingErsClients] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState("")

  const filteredErsClients = useMemo(
    () => ersClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [ersClients, search]
  )

  const fetchErsClients = useCallback(async () => {
    setIsLoadingErsClients(true)
    try {
      const res = await fetch(`${apiUrl}/api/ers/clients`)
      const data = await res.json()
      if (data.clients) setErsClients(data.clients)
    } catch (err) {
      console.error("Error fetching ERS clients:", err)
      toast("Error al cargar lista de clientes ERS", "error")
    } finally {
      setIsLoadingErsClients(false)
    }
  }, [apiUrl])

  const resetDropdown = useCallback(() => {
    setShowDropdown(false)
    setSearch("")
  }, [])

  return {
    ersClients, filteredErsClients,
    selectedErsClient, setSelectedErsClient,
    isLoadingErsClients,
    showDropdown, setShowDropdown,
    search, setSearch,
    fetchErsClients, resetDropdown,
  }
}
