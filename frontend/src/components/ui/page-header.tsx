"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-3 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm"
      >
        <span className="text-[10px] font-black tracking-[0.3em] text-accent uppercase">{badge}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-display text-4xl md:text-5xl font-black tracking-tighter leading-none mb-2"
      >
        <span className="text-foreground block">{titleLine1}</span>
        <span className="text-accent block">{titleLine2}</span>
      </motion.h1>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs md:text-sm font-medium text-muted-foreground/50 leading-relaxed max-w-xl"
        >
          {description}
        </motion.p>
      )}

      {action && <div className="mt-3">{action}</div>}
    </section>
  )
}
