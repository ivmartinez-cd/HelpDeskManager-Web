"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ExternalLink, Copy, Search, Plus, Trash2,
  Link as LinkIcon, Bookmark, Globe, FileText,
  Loader2, CheckCircle2, Filter, ChevronDown, Check, AlertTriangle
} from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { PageShell } from "@/components/ui/page-shell"
import { PageHeader } from "@/components/ui/page-header"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

interface Resource {
  id: number
  name: string
  url: string
  category: string
}

export default function RecursosPage() {
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010"

  const fetchResources = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/resources`)
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResources()
  }, [fetchResources])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!newRes.name.trim() || !newRes.url.trim()) {
      setModalError("El nombre y la URL son obligatorios")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${apiUrl}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRes),
      })
      if (response.ok) {
        await fetchResources()
        setShowAddModal(false)
        setNewRes({ name: "", url: "", category: "Documentación" })
        toast("Recurso agregado correctamente", "success")
      } else {
        const data = await response.json()
        setModalError(data.detail || "Error al guardar el recurso")
      }
    } catch (error) {
      console.error(error)
      setModalError("Error de conexión con el servidor")
      toast("Error al agregar recurso", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const requestDelete = (id: number, name: string) => {
    setConfirmDelete({ id, name })
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      await fetch(`${apiUrl}/api/resources/${confirmDelete.id}`, { method: "DELETE" })
      setResources(resources.filter(r => r.id !== confirmDelete.id))
      setConfirmDelete(null)
      toast("Recurso eliminado", "success")
    } catch (error) {
      console.error(error)
      toast("Error al eliminar recurso", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.url.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = activeCategory === "Todos" || r.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["Todos", ...Array.from(new Set(resources.map(r => r.category)))]

  return (
    <PageShell>
      <div className="h-full overflow-y-auto custom-scrollbar flex flex-col px-4">
        <div className="m-auto w-full flex flex-col gap-8 md:gap-12 py-8">
        <PageHeader
          badge="Biblioteca de Conocimiento"
          titleLine1="CENTRO DE"
          titleLine2="RECURSOS"
          description="Acceso centralizado a documentación técnica, guías de usuario y herramientas de soporte."
          action={
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-orange-500/20"
            >
              <Plus className="h-4 w-4" />
              Nuevo Recurso
            </motion.button>
          }
        />

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row items-center gap-2 w-full max-w-4xl mx-auto"
        >
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="BUSCAR RECURSOS POR NOMBRE O URL..."
              className="w-full h-10 pl-11 pr-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 outline-none focus:border-orange-500/50 transition-all font-bold text-[10px] tracking-widest uppercase"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>

          <div className="relative min-w-[180px] w-full md:w-auto">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
            <select
              className="w-full h-10 pl-11 pr-8 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 outline-none focus:border-orange-500/50 transition-all appearance-none font-bold text-[10px] tracking-widest uppercase cursor-pointer"
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-background">{cat.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </motion.div>

        {/* Grid de recursos */}
        <div className="w-full flex flex-col pb-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-[1600px] mx-auto w-full">
              {[...Array(8)].map((_, i) => (
                <ResourceSkeleton key={i} />
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-16 text-center"
            >
              <LinkIcon className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Sin resultados</h3>
              <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Prueba con otra búsqueda o añade un nuevo enlace.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-[1600px] mx-auto w-full">
              <AnimatePresence mode="popLayout">
                {filteredResources.map((res, idx) => (
                  <ResourceCard
                    key={res.id}
                    res={res}
                    idx={idx}
                    onDelete={(id) => requestDelete(id, res.name)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Modal Agregar */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setModalError(null)
        }}
        title="Nuevo Recurso"
        subtitle="Agregar al directorio"
        error={modalError}
      >
        <form onSubmit={handleAdd} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Identificador / Nombre</label>
            <input
              required
              type="text"
              className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !newRes.name ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
              value={newRes.name}
              onChange={e => setNewRes({ ...newRes, name: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Dirección URL (Link)</label>
            <input
              required
              type="url"
              placeholder="https://..."
              className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${modalError && !newRes.url ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
              value={newRes.url}
              onChange={e => setNewRes({ ...newRes, url: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Categoría de Sistema</label>
            <div className="relative">
              <select
                className="w-full h-14 px-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 font-bold outline-none appearance-none"
                value={newRes.category}
                onChange={e => setNewRes({ ...newRes, category: e.target.value })}
              >
                <option value="Manuales">Manuales</option>
                <option value="Documentación">Documentación</option>
                <option value="Otros">Otros</option>
              </select>
              <Filter className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 group"
          >
            {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6 group-hover:scale-110 transition-transform" />}
            Confirmar Registro
          </button>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => !isDeleting && setConfirmDelete(null)}
        title="Eliminar recurso"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              ¿Eliminar <span className="font-bold text-foreground">{confirmDelete?.name}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => setConfirmDelete(null)}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-2xl border font-bold text-sm hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAndDelete}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}

function ResourceCard({ res, idx, onDelete }: {
  res: Resource
  idx: number
  onDelete: (id: number) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(res.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SpotlightCard delay={idx * 0.05} exit={{ opacity: 0, scale: 0.95 }} layout>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110 group-hover:-rotate-3">
            {res.category === "Manuales" ? <FileText className="h-5 w-5" /> :
              res.category === "Documentación" ? <Bookmark className="h-5 w-5" /> :
                <Globe className="h-5 w-5" />}
          </div>
          <button
            onClick={() => onDelete(res.id)}
            aria-label={`Eliminar ${res.name}`}
            className="p-2 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{res.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-md tracking-widest">{res.category}</span>
          <p className="text-[9px] font-mono text-muted-foreground/60 line-clamp-1">{res.url}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white/5 hover:bg-orange-500 text-foreground hover:text-white h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Acceder
          </a>
          <button
            onClick={handleCopy}
            aria-label="Copiar URL"
            title={copied ? "¡Copiado!" : "Copiar URL"}
            className={`p-2.5 rounded-xl transition-all ${copied ? "bg-green-500/20 text-green-500" : "bg-white/5 hover:bg-white/10 text-foreground"}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </SpotlightCard>
  )
}

function ResourceSkeleton() {
  return (
    <div className="rounded-[1.2rem] bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 space-y-4 h-[200px] flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  )
}
