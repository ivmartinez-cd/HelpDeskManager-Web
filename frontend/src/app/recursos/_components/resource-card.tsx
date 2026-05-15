import { memo, useState } from "react"
import { ExternalLink, Copy, Trash2, FileText, Bookmark, Globe, Check } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import type { Resource } from "../_hooks/use-recursos"

interface ResourceCardProps {
  res: Resource
  onDelete: (id: number, name: string) => void
}

function CategoryIcon({ category }: { category: string }) {
  if (category === "Manuales") return <FileText className="h-5 w-5" />
  if (category === "Documentación") return <Bookmark className="h-5 w-5" />
  return <Globe className="h-5 w-5" />
}

export const ResourceCard = memo(function ResourceCard({ res, onDelete }: ResourceCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(res.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SpotlightCard>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110 group-hover:-rotate-3">
            <CategoryIcon category={res.category} />
          </div>
          <button
            onClick={() => onDelete(res.id, res.name)}
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
            {copied
              ? <Check className="h-4 w-4 transition-transform scale-110" />
              : <Copy className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </SpotlightCard>
  )
})

export function ResourceSkeleton() {
  return (
    <div className="rounded-[1.2rem] bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 space-y-4 h-[200px] flex flex-col justify-between animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-xl bg-muted" />
        <div className="h-10 w-10 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
