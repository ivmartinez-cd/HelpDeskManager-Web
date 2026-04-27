"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ExternalLink, Copy, Search, Plus, Trash2, 
  Link as LinkIcon, Bookmark, Globe, FileText, 
  Loader2, CheckCircle2, X
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
    // Podríamos añadir un toast aquí
  }

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) || 
                          r.url.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = activeCategory === "Todos" || r.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["Todos", ...Array.from(new Set(resources.map(r => r.category)))]

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Directorio de Recursos</h1>
              <p className="text-muted-foreground">Enlaces importantes, manuales y documentación técnica.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-primary-foreground h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              Nuevo Recurso
            </button>
          </header>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar recursos por nombre o URL..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:col-span-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 h-14 rounded-2xl font-medium transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-accent'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Recursos */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium text-muted-foreground">Cargando recursos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredResources.map((res, idx) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-card border rounded-[2rem] p-6 hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        {res.category === "Manuales" ? <FileText className="h-6 w-6" /> : 
                         res.category === "Documentación" ? <Bookmark className="h-6 w-6" /> : 
                         <Globe className="h-6 w-6" />}
                      </div>
                      <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1 line-clamp-1">{res.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mb-6 line-clamp-1">{res.url}</p>
                    
                    <div className="flex items-center gap-3 mt-auto">
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-accent/50 hover:bg-primary hover:text-primary-foreground h-11 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir
                      </a>
                      <button 
                        onClick={() => copyToClipboard(res.url)}
                        className="p-3 bg-accent/50 hover:bg-accent rounded-xl transition-colors"
                        title="Copiar URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filteredResources.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed rounded-[3rem] border-muted-foreground/10 bg-muted/5">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-bold mb-2">No se encontraron recursos</h3>
              <p className="text-muted-foreground">Prueba con otra búsqueda o añade un nuevo enlace.</p>
            </div>
          )}

        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-card border rounded-[2.5rem] shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Plus className="h-6 w-6 text-primary" /> Nuevo Recurso
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nombre del Recurso</label>
                  <input 
                    required
                    type="text" 
                    className="w-full h-12 px-4 rounded-2xl border bg-background" 
                    value={newRes.name}
                    onChange={e => setNewRes({...newRes, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Dirección URL</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://..."
                    className="w-full h-12 px-4 rounded-2xl border bg-background" 
                    value={newRes.url}
                    onChange={e => setNewRes({...newRes, url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Categoría</label>
                  <select 
                    className="w-full h-12 px-4 rounded-2xl border bg-background appearance-none"
                    value={newRes.category}
                    onChange={e => setNewRes({...newRes, category: e.target.value})}
                  >
                    <option value="Manuales">Manuales</option>
                    <option value="Documentación">Documentación</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Guardar Recurso
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
