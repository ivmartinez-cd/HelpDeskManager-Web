import { memo, type ElementType } from "react"
import { ArrowRight } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"

interface ActionCardProps {
  icon: ElementType
  title: string
  desc: string
  color: string
  onClick: () => void
  delay: number
}

export const ActionCard = memo(function ActionCard({ icon: Icon, title, desc, color, onClick, delay }: ActionCardProps) {
  return (
    <SpotlightCard onClick={onClick} delay={delay}>
      <div className="p-4">
        <div className={`mb-2 p-2 inline-flex rounded-lg bg-orange-500/10 ${color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold mb-0.5 text-foreground group-hover:text-orange-500 transition-colors">{title}</h3>
        <p className="text-muted-foreground text-[11px] leading-tight mb-3 line-clamp-2">{desc}</p>
        <div className="flex items-center gap-2 text-[9px] font-bold text-orange-500">
          INICIAR PROCESO
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </SpotlightCard>
  )
})
