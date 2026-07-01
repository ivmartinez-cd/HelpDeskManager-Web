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
  const [isManaging, setIsManaging] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

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

  const saveSumaColor = useCallback(async (client: ErsClient, sumaColor: boolean) => {
    setSavingId(client.customer_id)
    try {
      const res = await fetch(`${apiUrl}/api/ers/clients/${client.customer_id}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: client.name, suma_color: sumaColor }),
      })
      if (!res.ok) throw new Error("Error al guardar la preferencia del cliente")
      setErsClients(prev => prev.map(c => c.customer_id === client.customer_id ? { ...c, suma_color: sumaColor } : c))
      if (selectedErsClient?.customer_id === client.customer_id) {
        setSelectedErsClient(prev => prev ? { ...prev, suma_color: sumaColor } : prev)
      }
      toast("Preferencia de cliente guardada", "success")
    } catch (err) {
      console.error("Error saving ERS client config:", err)
      toast("Error al guardar la preferencia del cliente", "error")
    } finally {
      setSavingId(null)
    }
  }, [apiUrl, selectedErsClient])

  const resetDropdown = useCallback(() => {
    setShowDropdown(false)
    setSearch("")
    setIsManaging(false)
  }, [])

  return {
    ersClients, filteredErsClients,
    selectedErsClient, setSelectedErsClient,
    isLoadingErsClients,
    showDropdown, setShowDropdown,
    search, setSearch,
    isManaging, setIsManaging,
    savingId, saveSumaColor,
    fetchErsClients, resetDropdown,
  }
}
