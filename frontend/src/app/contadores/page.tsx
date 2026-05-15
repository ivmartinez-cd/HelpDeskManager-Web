"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText, Database, Calculator, Wand2, Eraser,
  PlusCircle, Server, CloudDownload
} from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { PageShell } from "@/components/ui/page-shell"
import { PageHeader } from "@/components/ui/page-header"
import { toast } from "@/hooks/use-toast"

import { useProcess } from "./_hooks/use-process"
import { useFtpClients } from "./_hooks/use-ftp-clients"
import { useSdsClients } from "./_hooks/use-sds-clients"
import { ActionCard } from "./_components/action-card"
import { ModalContent } from "./_components/process-view"
import { FtpForm } from "./_components/ftp-form"
import { SdsForm } from "./_components/sds-form"
import { ManualForm, En0Form, SumaForm, AutoForm, CalcForm } from "./_components/tool-forms"

import type { CalcResult } from "./_hooks/types"

const TOOLS = [
  { id: "sds", icon: CloudDownload, title: "Descargar SDS", desc: "Obtén los contadores de impresoras directamente desde el API de HP SDS.", color: "text-blue-500", delay: 0.3 },
  { id: "ftp", icon: Server, title: "Descarga FTP", desc: "Obtén las bases de datos directamente desde los servidores de los clientes.", color: "text-indigo-500", delay: 0.4 },
  { id: "manual", icon: Database, title: "Procesar DB3", desc: "Sube manualmente archivos .db3 para convertirlos a CSV localmente.", color: "text-orange-500", delay: 0.5 },
  { id: "en0", icon: Eraser, title: "Estimación en 0", desc: "Resetea equipos que no reportaron usando el último contador conocido.", color: "text-rose-500", delay: 0.6 },
  { id: "suma", icon: PlusCircle, title: "Suma Fija", desc: "Aplica incrementos masivos de hojas a partir de archivos Excel.", color: "text-emerald-500", delay: 0.7 },
  { id: "auto", icon: Wand2, title: "Autoestimación", desc: "Genera proyecciones automáticas basadas en el historial de consumo.", color: "text-amber-500", delay: 0.8 },
  { id: "calc", icon: Calculator, title: "Calculadora", desc: "Herramienta interactiva para proyecciones manuales por fecha.", color: "text-sky-500", delay: 0.9 },
] as const

type ToolId = typeof TOOLS[number]["id"]

const TOOL_TITLES: Record<ToolId, string> = {
  sds: "Descargar SDS", ftp: "Descarga FTP", manual: "Procesar DB3",
  en0: "Estimación en 0", suma: "Suma Fija", auto: "Autoestimación", calc: "Calculadora"
}

const today = () => new Date().toLocaleDateString("es-ES")

export default function ContadoresPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010"
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const [sdsSumaColor, setSdsSumaColor] = useState(false)
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)

  const [toolData, setToolData] = useState({
    en0_cliente: "",
    en0_fecha: "",
    suma_hojas: 1000,
    suma_fecha: "",
    auto_fecha: "",
    manual_fecha: "",
    ftp_fecha: "",
    sds_fecha: "",
    calc: { ci: 0, cf: 0, fi: "", ff: "", fe: "" },
  })

  useEffect(() => {
    const t = today()
    setToolData(prev => ({ ...prev, en0_fecha: t, suma_fecha: t, auto_fecha: t, ftp_fecha: t, sds_fecha: t }))
  }, [])

  const proc = useProcess()
  const ftp = useFtpClients(apiUrl)
  const sds = useSdsClients(apiUrl)

  useEffect(() => {
    if (activeTool === "sds" && sds.sdsClients.length === 0) {
      sds.fetchSdsClients()
    }
  }, [activeTool, sds])

  const closeModal = useCallback(() => {
    setActiveTool(null)
    proc.resetProcess()
    setCalcResult(null)
    ftp.resetDropdown()
    sds.resetDropdown()
  }, [proc, ftp, sds])

  const runManualProcess = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    proc.setIsProcessing(true)
    proc.setStatus("idle")
    proc.setResultFiles([])
    proc.addLog(`Iniciando carga de ${files.length} archivo(s) DB3...`, 0)
    proc.addLog("Validando estructura de bases de datos...", 1000)
    proc.addLog("Filtrando registros por fecha...", 2500)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) formData.append("files", files[i])
    formData.append("fecha_maxima", toolData.manual_fecha)

    try {
      const response = await fetch(`${apiUrl}/api/contadores/process-db3`, { method: "POST", body: formData })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Error al procesar DB3")
      }
      proc.addLog("Consolidando datos y generando CSV...", 4000)

      const warningsHeader = response.headers.get("X-Warnings")
      let warningCount = 0
      if (warningsHeader) {
        try {
          const warnings = JSON.parse(warningsHeader)
          warningCount = warnings.length
          warnings.forEach((w: string, idx: number) => proc.addLog(`⚠️ ${w}`, 4500 + idx * 500))
          toast(`${warningCount} archivo(s) omitido(s). Revisa los logs.`, "warning")
        } catch (e) { console.error("Error parseando warnings", e) }
      }

      proc.addLog("Proceso completado.", 5500)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = files.length === 1 ? files[0].name.replace(/\.db3.*$/i, ".csv") : `Consolidado_${files.length - warningCount}_archivos.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()

      proc.setStatus("success")
      proc.setMessage(warningCount > 0
        ? `Procesados ${files.length - warningCount} de ${files.length} archivos. ${warningCount} omitidos por errores.`
        : `¡${files.length} archivo(s) procesado(s) y descargado(s) con éxito!`)
      toast("Proceso DB3 finalizado", "success")
    } catch (err) {
      const e = err as Error
      proc.setStatus("error")
      proc.setMessage(e.message)
      proc.setModalError(e.message)
    } finally {
      proc.setIsProcessing(false)
      proc.setResultFiles([])
    }
  }, [apiUrl, toolData.manual_fecha, proc])

  const runFtpProcess = useCallback(async () => {
    if (!ftp.selectedClient) return
    proc.setIsProcessing(true)
    proc.setStatus("idle")
    proc.setResultFiles([])
    proc.addLog(`Conectando al servidor FTP de ${ftp.selectedClient}...`, 0)
    proc.addLog("Autenticando credenciales...", 1500)
    proc.addLog("Buscando bases de datos recientes...", 3000)

    try {
      const response = await fetch(`${apiUrl}/api/ftp/process-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: ftp.selectedClient, fecha_maxima: toolData.ftp_fecha }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      proc.addLog("Descarga exitosa. Iniciando conversión...", 5000)
      proc.addLog("Generando proyecciones temporales...", 7000)
      proc.setResultFiles([data.csv_file, data.db3_file])
      proc.setStatus("success")
      proc.setMessage(data.message)
      toast("Sincronización FTP completada", "success")
    } catch (err) {
      const e = err as Error
      proc.setStatus("error")
      proc.setMessage(e.message)
      proc.setModalError(e.message)
    } finally {
      proc.setIsProcessing(false)
    }
  }, [apiUrl, ftp.selectedClient, toolData.ftp_fecha, proc])

  const runSdsProcess = useCallback(async () => {
    if (!sds.selectedSdsClient) return
    proc.setIsProcessing(true)
    proc.setStatus("idle")
    proc.setResultFiles([])
    proc.addLog(`Conectando con API de HP SDS para ${sds.selectedSdsClient.name}...`, 0)
    proc.addLog("Obteniendo ciclos de motor...", 1500)

    let isoDate = ""
    try {
      const parts = toolData.sds_fecha.split("/")
      if (parts.length === 3) {
        const [d, m, y] = parts
        isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T23:59:59`
      } else {
        isoDate = new Date().toISOString()
      }
    } catch { isoDate = new Date().toISOString() }

    try {
      const response = await fetch(`${apiUrl}/api/sds/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: sds.selectedSdsClient.customerId, customer_name: sds.selectedSdsClient.name, fecha_maxima: isoDate, suma_color: sdsSumaColor }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      proc.addLog("Generando archivo CSV...", 4000)
      proc.setResultFiles([data.csv_file])
      proc.setStatus("success")
      proc.setMessage(data.message)
      toast("Descarga de SDS completada", "success")
    } catch (err) {
      const e = err as Error
      proc.setStatus("error")
      proc.setMessage(e.message)
      proc.setModalError(e.message)
    } finally {
      proc.setIsProcessing(false)
    }
  }, [apiUrl, sds.selectedSdsClient, toolData.sds_fecha, sdsSumaColor, proc])

  const runTool = useCallback(async (tool: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    proc.setIsProcessing(true)
    proc.setStatus("idle")
    proc.setResultFiles([])
    proc.addLog(`Iniciando herramienta: ${tool.toUpperCase()}...`, 0)
    proc.addLog("Preparando archivos para transferencia...", 1000)

    const formData = new FormData()
    let endpoint = ""

    if (tool === "en0") {
      endpoint = "/api/tools/en0"
      formData.append("file", files[0])
      formData.append("fecha", toolData.en0_fecha)
      formData.append("cliente", toolData.en0_cliente || "CLIENTE")
      proc.addLog("Limpiando equipos a cero...", 2500)
    } else if (tool === "suma") {
      endpoint = "/api/tools/suma-fija"
      for (let i = 0; i < files.length; i++) formData.append("files", files[i])
      formData.append("fecha", toolData.suma_fecha)
      formData.append("hojas", toolData.suma_hojas.toString())
      proc.addLog(`Aplicando suma fija de ${toolData.suma_hojas} hojas...`, 2500)
    } else if (tool === "auto") {
      endpoint = "/api/tools/autoestim"
      formData.append("file", files[0])
      formData.append("fecha", toolData.auto_fecha)
      proc.addLog("Generando proyecciones IA...", 2500)
    }

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Error en la herramienta")
      proc.addLog("Recibiendo resultados del servidor...", 4500)
      proc.addLog("Verificando integridad del reporte...", 6000)
      if (data.file) proc.setResultFiles([data.file])
      if (data.files) proc.setResultFiles(data.files)
      proc.setStatus("success")
      proc.setMessage(data.message || "Proceso completado.")
      toast(`Herramienta ${tool.toUpperCase()} ejecutada`, "success")
    } catch (err) {
      const e = err as Error
      proc.setStatus("error")
      proc.setMessage(e.message)
      proc.setModalError(e.message)
      toast("Error en la ejecución", "error")
    } finally {
      proc.setIsProcessing(false)
    }
  }, [apiUrl, toolData, proc])

  const runCalc = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tools/calc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolData.calc),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      setCalcResult(data)
    } catch (err) {
      proc.setModalError((err as Error).message)
    }
  }, [apiUrl, toolData.calc, proc])

  const hasDropdownOpen = ftp.showDropdown || sds.showDropdown

  return (
    <PageShell>
      <div className="h-full overflow-y-auto custom-scrollbar flex flex-col px-4">
        <div className="m-auto w-full max-w-[1600px] flex flex-col gap-[clamp(2rem,5vh,4rem)] py-[clamp(1.5rem,4vh,3rem)]">
          <PageHeader
            badge="Panel de Herramientas de Datos"
            titleLine1="CENTRO DE"
            titleLine2="CONTADORES"
            description="Automatización de reportes y gestión de bases de datos con precisión industrial."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {TOOLS.map(t => (
              <ActionCard key={t.id} icon={t.icon} title={t.title} desc={t.desc} color={t.color} onClick={() => setActiveTool(t.id)} delay={t.delay} />
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!activeTool}
        onClose={closeModal}
        title={activeTool ? TOOL_TITLES[activeTool] : ""}
        maxWidth="max-w-lg"
        error={proc.modalError}
      >
        <ModalContent
          isProcessing={proc.isProcessing}
          status={proc.status}
          logs={proc.logs}
          message={proc.message}
          resultFiles={proc.resultFiles}
          apiUrl={apiUrl}
          onRetry={() => proc.setStatus("idle")}
          hasDropdownOpen={hasDropdownOpen}
        >
          {activeTool === "ftp" && (
            <FtpForm
              isLoadingClients={ftp.isLoadingClients}
              clients={ftp.clients}
              filteredClients={ftp.filteredClients}
              selectedClient={ftp.selectedClient}
              showDropdown={ftp.showDropdown}
              search={ftp.search}
              deletingId={ftp.deletingId}
              isManaging={ftp.isManaging}
              editingClient={ftp.editingClient}
              formData={ftp.formData}
              isProcessing={proc.isProcessing}
              onSelectClient={(name) => { ftp.setSelectedClient(name); ftp.setShowDropdown(false) }}
              onToggleDropdown={() => ftp.setShowDropdown(v => !v)}
              onSearchChange={ftp.setSearch}
              onToggleManaging={() => ftp.setIsManaging(v => !v)}
              onSetDeletingId={ftp.setDeletingId}
              onStartEdit={ftp.startEdit}
              onSetFormData={ftp.setFormData}
              onSetEditingClient={ftp.setEditingClient}
              onSave={ftp.handleSave}
              onDelete={ftp.handleDelete}
              onRun={runFtpProcess}
              fecha={toolData.ftp_fecha}
              onFechaChange={v => setToolData(prev => ({ ...prev, ftp_fecha: v }))}
              onModalError={proc.setModalError}
            />
          )}
          {activeTool === "sds" && (
            <SdsForm
              isLoadingSdsClients={sds.isLoadingSdsClients}
              filteredSdsClients={sds.filteredSdsClients}
              selectedSdsClient={sds.selectedSdsClient}
              showDropdown={sds.showDropdown}
              search={sds.search}
              sdsSumaColor={sdsSumaColor}
              isProcessing={proc.isProcessing}
              fecha={toolData.sds_fecha}
              onToggleDropdown={() => sds.setShowDropdown(v => !v)}
              onSelectClient={(c) => { sds.setSelectedSdsClient(c); sds.setShowDropdown(false) }}
              onSearchChange={sds.setSearch}
              onToggleSumaColor={() => setSdsSumaColor(v => !v)}
              onFechaChange={v => setToolData(prev => ({ ...prev, sds_fecha: v }))}
              onRun={runSdsProcess}
            />
          )}
          {activeTool === "manual" && (
            <ManualForm
              fecha={toolData.manual_fecha}
              onFechaChange={v => setToolData(prev => ({ ...prev, manual_fecha: v }))}
              onRun={runManualProcess}
            />
          )}
          {activeTool === "en0" && (
            <En0Form
              cliente={toolData.en0_cliente}
              fecha={toolData.en0_fecha}
              onClienteChange={v => setToolData(prev => ({ ...prev, en0_cliente: v }))}
              onFechaChange={v => setToolData(prev => ({ ...prev, en0_fecha: v }))}
              onRun={files => runTool("en0", files)}
            />
          )}
          {activeTool === "suma" && (
            <SumaForm
              hojas={toolData.suma_hojas}
              fecha={toolData.suma_fecha}
              onHojasChange={v => setToolData(prev => ({ ...prev, suma_hojas: v }))}
              onFechaChange={v => setToolData(prev => ({ ...prev, suma_fecha: v }))}
              onRun={files => runTool("suma", files)}
            />
          )}
          {activeTool === "auto" && (
            <AutoForm
              fecha={toolData.auto_fecha}
              onFechaChange={v => setToolData(prev => ({ ...prev, auto_fecha: v }))}
              onRun={files => runTool("auto", files)}
            />
          )}
          {activeTool === "calc" && (
            <CalcForm
              calc={toolData.calc}
              calcResult={calcResult}
              onCalcChange={calc => setToolData(prev => ({ ...prev, calc }))}
              onRun={runCalc}
            />
          )}
        </ModalContent>
      </Modal>
    </PageShell>
  )
}
