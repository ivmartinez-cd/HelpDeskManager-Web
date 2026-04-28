"use client"

import { useState, useEffect, MouseEvent } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { 
  ExternalLink, Copy, Search, Plus, Trash2, 
  Link as LinkIcon, Bookmark, Globe, FileText, 
  Loader2, CheckCircle2, X, Filter
} from "lucide-react"

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
  
  // Form state
  const [newRes, setNewRes] = useState({ name: "", url: "", category: "Documentación" })
  const [isSaving, setIsSaving] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
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
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
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
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este recurso?")) return
    try {
      await fetch(`${apiUrl}/api/resources/${id}`, { method: "DELETE" })
      setResources(resources.filter(r => r.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) || 
                          r.url.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = activeCategory === "Todos" || r.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["Todos", ...Array.from(new Set(resources.map(r => r.category)))]

  return (
    <div className="relative min-h-screen bg-[#050505] text-foreground p-4 md:p-8 overflow-hidden font-sans">
      
      <main className="relative flex-1 flex flex-col items-center overflow-hidden">
        {/* Modern Industrial Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-fade" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 px-4 py-12 md:py-16">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
              >
                <span className="text-orange-500 drop-shadow-2xl">DIRECTORIO</span>{" "}
                <span className="text-foreground drop-shadow-2xl">RECURSOS</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm md:text-base font-bold tracking-[0.2em] text-muted-foreground uppercase"
              >
                Documentación técnica <span className="text-orange-500">•</span> Manuales de usuario
              </motion.p>
            </div>
            
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white h-16 px-8 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20"
            >
              <Plus className="h-6 w-6" />
              Nuevo Recurso
            </motion.button>
          </header>

          {/* Filtros y Búsqueda */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="md:col-span-3 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="BUSCAR RECURSOS POR NOMBRE O URL..."
                className="w-full h-16 pl-16 pr-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 outline-none focus:border-orange-500/50 transition-all font-bold text-sm tracking-wide"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 md:flex-wrap">
              <div className="flex items-center gap-2 h-16 px-4 bg-black/[0.02] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                <Filter className="h-4 w-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Categoría:</span>
                <select 
                  className="bg-transparent outline-none font-bold text-sm text-foreground pr-2"
                  value={activeCategory}
                  onChange={e => setActiveCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-background">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Grid de Recursos */}
          {isLoading ? (
            <div className="py-32 flex flex-col items-center gap-6">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              </div>
              <p className="font-black text-sm uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sincronizando Base de Datos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredResources.map((res, idx) => (
                  <ResourceCard 
                    key={res.id} 
                    res={res} 
                    idx={idx} 
                    onDelete={handleDelete}
                    onCopy={copyToClipboard}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filteredResources.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center border-2 border-dashed rounded-[3rem] border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]"
            >
              <LinkIcon className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Sin resultados</h3>
              <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Prueba con otra búsqueda o añade un nuevo enlace.</p>
            </motion.div>
          )}

        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg bg-card border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">Nuevo Recurso</h2>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Agregar al directorio</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Identificador / Nombre</label>
                  <input 
                    required
                    type="text" 
                    className="w-full h-14 px-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 font-bold outline-none focus:border-orange-500/50" 
                    value={newRes.name}
                    onChange={e => setNewRes({...newRes, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Dirección URL (Link)</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://..."
                    className="w-full h-14 px-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 font-bold outline-none focus:border-orange-500/50" 
                    value={newRes.url}
                    onChange={e => setNewRes({...newRes, url: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Categoría de Sistema</label>
                  <div className="relative group">
                    <select 
                      className="w-full h-14 px-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 font-bold outline-none appearance-none"
                      value={newRes.category}
                      onChange={e => setNewRes({...newRes, category: e.target.value})}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResourceCard({ res, idx, onDelete, onCopy }: any) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(249, 115, 22, 0.08), transparent 40%)`
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.05 }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-[2.5rem] border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 p-8 transition-colors hover:border-orange-500/30 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: spotlightBg }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110 group-hover:-rotate-3">
            {res.category === "Manuales" ? <FileText className="h-7 w-7" /> : 
             res.category === "Documentación" ? <Bookmark className="h-7 w-7" /> : 
             <Globe className="h-7 w-7" />}
          </div>
          <button 
            onClick={() => onDelete(res.id)}
            className="p-3 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <h3 className="text-2xl font-black mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{res.name}</h3>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-md tracking-widest">{res.category}</span>
          <p className="text-[10px] font-mono text-muted-foreground line-clamp-1">{res.url}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href={res.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-white/5 hover:bg-orange-500 text-foreground hover:text-white h-12 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Acceder
          </a>
          <button 
            onClick={() => onCopy(res.url)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group/copy"
            title="Copiar URL"
          >
            <Copy className="h-4 w-4 group-active:scale-90 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
