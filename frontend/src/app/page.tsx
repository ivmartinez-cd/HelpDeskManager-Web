"use client"

import Link from "next/link"
import { Calculator, Monitor, Link as LinkIcon, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { PageShell } from "@/components/ui/page-shell"
import { SpotlightCard } from "@/components/ui/spotlight-card"

function ModuleCard({
  href,
  icon: Icon,
  title,
  description,
  delay,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
  delay: number
}) {
  return (
    <Link href={href} className="block h-full">
      <SpotlightCard
        rounded="rounded-[2rem]"
        bg="bg-white dark:bg-white/5"
        className="home-module-card h-full hover:shadow-2xl hover:shadow-orange-500/10"
        delay={delay}
      >
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-orange-500 transition-colors">
          {title}
        </h3>
        <p className="mb-6 text-[13px] leading-snug text-muted-foreground">
          {description}
        </p>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 transition-colors group-hover:text-orange-400">
          Lanzar Módulo
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </SpotlightCard>
    </Link>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  if (!mounted) return null

  return (
    <PageShell>
      <div className="home-page">
        <div className="m-auto w-full flex flex-col gap-8 md:gap-12 lg:gap-16">
          {/* Hero */}
          <section className="home-hero">
            <div className="home-eyebrow px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm animate-fade-in-scale">
              <span className="text-[9px] font-black tracking-[0.3em] text-accent uppercase">
                Sistema de Gestión de Operaciones v3.0
              </span>
            </div>

            <h1
              className="home-title text-display font-black tracking-tighter leading-[0.8] animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-foreground block">HELPDESK</span>
              <span className="text-accent block">MANAGER</span>
            </h1>

            <div
              className="home-copy max-w-lg mx-auto animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-sm md:text-base font-medium text-muted-foreground/60 leading-relaxed tracking-wide">
                Optimización técnica y procesamiento de datos con estándares de precisión industrial para el equipo de soporte.
              </p>
            </div>
          </section>

          {/* Module Cards */}
          <div className="home-card-grid mx-auto">
            <ModuleCard
              href="/contadores"
              icon={Calculator}
              title="Contadores"
              description="Procesamiento masivo de DB3 con algoritmos de estimación y reportes."
              delay={0.4}
            />
            <ModuleCard
              href="/stc"
              icon={Monitor}
              title="STC"
              description="Extracción inteligente de IPs y generación de rangos de red."
              delay={0.5}
            />
            <ModuleCard
              href="/recursos"
              icon={LinkIcon}
              title="Recursos"
              description="Biblioteca centralizada de manuales, guías y accesos directos."
              delay={0.6}
            />
          </div>
        </div>

        <footer className="home-footer mt-auto pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <p>© 2026 HelpDesk Manager Web • Hecho por Iván Martínez</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contacto</Link>
            </div>
          </div>
        </footer>
      </div>
    </PageShell>
  )
}
