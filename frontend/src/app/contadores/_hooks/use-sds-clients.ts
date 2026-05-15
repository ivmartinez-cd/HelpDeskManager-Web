"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "@/hooks/use-toast"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SdsClient = Record<string, any>

export function useSdsClients(apiUrl: string) {
  const [sdsClients, setSdsClients] = useState<SdsClient[]>([])
  const [selectedSdsClient, setSelectedSdsClient] = useState<SdsClient | null>(null)
  const [isLoadingSdsClients, setIsLoadingSdsClients] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState("")

  const filteredSdsClients = useMemo(
    () => sdsClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [sdsClients, search]
  )

  const fetchSdsClients = useCallback(async () => {
    setIsLoadingSdsClients(true)
    try {
      const res = await fetch(`${apiUrl}/api/sds/clients`)
      const data = await res.json()
      if (data.clients) setSdsClients(data.clients)
    } catch (err) {
      console.error("Error fetching SDS clients:", err)
      toast("Error al cargar lista de clientes SDS", "error")
    } finally {
      setIsLoadingSdsClients(false)
    }
  }, [apiUrl])

  const resetDropdown = useCallback(() => {
    setShowDropdown(false)
    setSearch("")
  }, [])

  return {
    sdsClients, filteredSdsClients,
    selectedSdsClient, setSelectedSdsClient,
    isLoadingSdsClients,
    showDropdown, setShowDropdown,
    search, setSearch,
    fetchSdsClients, resetDropdown,
  }
}
