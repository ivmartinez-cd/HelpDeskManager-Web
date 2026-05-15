import { memo, type ElementType } from "react"
import { Upload } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"

interface StcActionCardProps {
  icon: ElementType
  title: string
  desc: string
  color: string
  accept: string
  multiple: boolean
  onUpload: (files: FileList | null) => void
  isProcessing: boolean
  delay: number
}

export const StcActionCard = memo(function StcActionCard({
  icon: Icon, title, desc, color, accept, multiple, onUpload, isProcessing, delay
}: StcActionCardProps) {
  return (
    <SpotlightCard delay={delay}>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-orange-500/10 ${color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground group-hover:text-orange-500 transition-colors">{title}</h2>
        </div>

        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{desc}</p>

        <div className="w-full relative group/btn">
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
            onChange={e => onUpload(e.target.files)}
            disabled={isProcessing}
          />
          <button className="w-full bg-orange-500 text-white h-10 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 group-hover/btn:scale-[1.02] transition-transform text-[10px] uppercase tracking-widest pointer-events-none">
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                PROCESANDO...
              </span>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                Seleccionar Archivos
              </>
            )}
          </button>
        </div>
      </div>
    </SpotlightCard>
  )
})
