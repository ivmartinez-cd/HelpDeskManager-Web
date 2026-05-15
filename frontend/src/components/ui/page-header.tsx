import { type ReactNode } from "react"

interface PageHeaderProps {
  badge: string
  titleLine1: string
  titleLine2: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ badge, titleLine1, titleLine2, description, action }: PageHeaderProps) {
  return (
    <section className="flex flex-col items-center text-center shrink-0 pt-4 pb-2 px-4">
      <div className="mb-4 px-5 py-2 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm animate-fade-in-scale">
        <span className="text-[10px] md:text-xs font-black tracking-[0.35em] text-accent uppercase">{badge}</span>
      </div>

      <h1 className="text-display text-[clamp(3rem,6vw,6.5rem)] font-black tracking-tighter leading-[0.9] mb-4 animate-fade-in-up">
        <span className="text-foreground block">{titleLine1}</span>
        <span className="text-accent block">{titleLine2}</span>
      </h1>

      {description && (
        <p
          className="text-sm md:text-[clamp(0.875rem,1.2vw,1.125rem)] font-medium text-muted-foreground/50 leading-relaxed max-w-3xl animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          {description}
        </p>
      )}

      {action && <div className="mt-3">{action}</div>}
    </section>
  )
}
