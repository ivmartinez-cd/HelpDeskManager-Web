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
  const [isManaging, setIsManaging] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)

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

  const saveSumaColor = useCallback(async (client: SdsClient, sumaColor: boolean) => {
    setSavingId(client.customerId)
    try {
      const res = await fetch(`${apiUrl}/api/sds/clients/${client.customerId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: client.name, suma_color: sumaColor }),
      })
      if (!res.ok) throw new Error("Error al guardar la preferencia del cliente")
      setSdsClients(prev => prev.map(c => c.customerId === client.customerId ? { ...c, suma_color: sumaColor } : c))
      if (selectedSdsClient?.customerId === client.customerId) {
        setSelectedSdsClient(prev => prev ? { ...prev, suma_color: sumaColor } : prev)
      }
      toast("Preferencia de cliente guardada", "success")
    } catch (err) {
      console.error("Error saving SDS client config:", err)
      toast("Error al guardar la preferencia del cliente", "error")
    } finally {
      setSavingId(null)
    }
  }, [apiUrl, selectedSdsClient])

  const resetDropdown = useCallback(() => {
    setShowDropdown(false)
    setSearch("")
    setIsManaging(false)
  }, [])

  return {
    sdsClients, filteredSdsClients,
    selectedSdsClient, setSelectedSdsClient,
    isLoadingSdsClients,
    showDropdown, setShowDropdown,
    search, setSearch,
    isManaging, setIsManaging,
    savingId, saveSumaColor,
    fetchSdsClients, resetDropdown,
  }
}
