"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import Link from "next/link"
import { Calculator, ExternalLink, Link as LinkIcon, ArrowRight, Monitor } from "lucide-react"
import { MouseEvent, useState, useEffect } from "react"

function SpotlightCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  href: string; 
  icon: any; 
  title: string; 
  description: string;
  delay: number;
}) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(249, 115, 22, ${mouseX.get() === 0 ? 0 : 0.07}), transparent 40%)`
  )

  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        onMouseMove={handleMouseMove}
        className="relative h-full rounded-[2rem] border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/5 p-6 transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ background: spotlightBg }}
        />
        
        <div className="relative z-10">
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
        </div>
      </motion.div>
    </Link>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="h-full flex flex-col bg-background selection:bg-accent/30 overflow-hidden">
      
      <main className="relative flex-1 flex flex-col items-center justify-center">
        {/* Modern Industrial Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-noise opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-fade" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 dark:bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center gap-10 md:gap-12 py-8 h-full">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm"
            >
              <span className="text-[9px] font-black tracking-[0.3em] text-accent uppercase">
                Sistema de Gestión de Operaciones v3.0
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-display text-6xl md:text-[8.5rem] font-black tracking-tighter leading-[0.8] mb-8"
            >
              <span className="text-foreground block">HELPDESK</span>
              <span className="text-accent block">MANAGER</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-lg mx-auto"
            >
              <p className="text-sm md:text-base font-medium text-muted-foreground/60 leading-relaxed tracking-wide">
                Optimización técnica y procesamiento de datos con estándares de precisión industrial para el equipo de soporte.
              </p>
            </motion.div>
          </section>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto mb-4">
            <SpotlightCard
              href="/contadores"
              icon={Calculator}
              title="Contadores"
              description="Procesamiento masivo de DB3 con algoritmos de estimación y reportes."
              delay={0.6}
            />
            
            <SpotlightCard
              href="/stc"
              icon={Monitor}
              title="STC"
              description="Extracción inteligente de IPs y generación de rangos de red."
              delay={0.7}
            />
            
            <SpotlightCard
              href="/recursos"
              icon={LinkIcon}
              title="Recursos"
              description="Biblioteca centralizada de manuales, guías y accesos directos."
              delay={0.8}
            />
          </div>

          <footer className="w-full opacity-40 hover:opacity-100 transition-opacity">
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
      </main>
    </div>
  )
}
