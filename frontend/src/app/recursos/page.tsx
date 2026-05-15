"use client"

import {
  Search, Plus, Filter, ChevronDown,
  Link as LinkIcon, Loader2, CheckCircle2, AlertTriangle, Trash2
} from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { PageShell } from "@/components/ui/page-shell"
import { PageHeader } from "@/components/ui/page-header"
import { ResourceCard, ResourceSkeleton } from "./_components/resource-card"
import { useRecursos } from "./_hooks/use-recursos"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010"

export default function RecursosPage() {
  const p = useRecursos(apiUrl)

  return (
    <PageShell>
      <div className="h-full overflow-y-auto custom-scrollbar flex flex-col px-4">
        <div className="m-auto w-full max-w-[1600px] flex flex-col gap-[clamp(2rem,5vh,4rem)] py-[clamp(1.5rem,4vh,3rem)]">
          <PageHeader
            badge="Biblioteca de Conocimiento"
            titleLine1="CENTRO DE"
            titleLine2="RECURSOS"
            description="Acceso centralizado a documentación técnica, guías de usuario y herramientas de soporte."
            action={
              <button
                onClick={p.openAddModal}
                className="bg-orange-500 text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-orange-500/20"
              >
                <Plus className="h-4 w-4" />
                Nuevo Recurso
              </button>
            }
          />

          {/* Filtros */}
          <div className="flex flex-col md:flex-row items-center gap-2 w-full max-w-4xl mx-auto">
            <div className="flex-1 relative group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR RECURSOS POR NOMBRE O URL..."
                className="w-full h-10 pl-11 pr-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 outline-none focus:border-orange-500/50 transition-all font-bold text-[10px] tracking-widest uppercase"
                value={p.filter}
                onChange={e => p.setFilter(e.target.value)}
              />
            </div>
            <div className="relative min-w-[180px] w-full md:w-auto">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
              <select
                className="w-full h-10 pl-11 pr-8 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 outline-none focus:border-orange-500/50 transition-all appearance-none font-bold text-[10px] tracking-widest uppercase cursor-pointer"
                value={p.activeCategory}
                onChange={e => p.setActiveCategory(e.target.value)}
              >
                {p.categories.map(cat => (
                  <option key={cat} value={cat} className="bg-background">{cat.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Grid de recursos */}
          <div className="w-full flex flex-col pb-4">
            {p.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {[...Array(8)].map((_, i) => <ResourceSkeleton key={i} />)}
              </div>
            ) : p.filteredResources.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-16 text-center">
                <LinkIcon className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Sin resultados</h3>
                <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Prueba con otra búsqueda o añade un nuevo enlace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {p.filteredResources.map(res => (
                  <ResourceCard key={res.id} res={res} onDelete={p.requestDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Agregar */}
      <Modal
        isOpen={p.showAddModal}
        onClose={p.closeAddModal}
        title="Nuevo Recurso"
        subtitle="Agregar al directorio"
        error={p.modalError}
      >
        <form onSubmit={p.handleAdd} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Identificador / Nombre</label>
            <input
              required
              type="text"
              className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${p.modalError && !p.newRes.name ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
              value={p.newRes.name}
              onChange={e => p.setNewRes({ ...p.newRes, name: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Dirección URL (Link)</label>
            <input
              required
              type="url"
              placeholder="https://..."
              className={`w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all ${p.modalError && !p.newRes.url ? "border-destructive/50 focus:border-destructive" : "border-black/5 dark:border-white/10 focus:border-orange-500/50"}`}
              value={p.newRes.url}
              onChange={e => p.setNewRes({ ...p.newRes, url: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Categoría de Sistema</label>
            <div className="relative">
              <select
                className="w-full h-14 px-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 font-bold outline-none appearance-none"
                value={p.newRes.category}
                onChange={e => p.setNewRes({ ...p.newRes, category: e.target.value })}
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
            disabled={p.isSaving}
            className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 group"
          >
            {p.isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6 group-hover:scale-110 transition-transform" />}
            Confirmar Registro
          </button>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={!!p.confirmDelete}
        onClose={() => !p.isDeleting && p.setConfirmDelete(null)}
        title="Eliminar recurso"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            ¿Eliminar <span className="font-bold text-foreground">{p.confirmDelete?.name}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => p.setConfirmDelete(null)}
              disabled={p.isDeleting}
              className="flex-1 h-12 rounded-2xl border font-bold text-sm hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={p.confirmAndDelete}
              disabled={p.isDeleting}
              className="flex-1 h-12 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {p.isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
