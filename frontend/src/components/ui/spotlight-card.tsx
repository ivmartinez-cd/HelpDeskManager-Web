"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { KeyboardEvent, MouseEvent, ReactNode } from "react"

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  rounded?: string
  bg?: string
  onClick?: () => void
  delay?: number
  exit?: { [key: string]: any }
  layout?: boolean | "position" | "size"
}

export function SpotlightCard({
  children,
  className = "",
  rounded = "rounded-[1.2rem]",
  bg = "bg-black/[0.02] dark:bg-white/5",
  onClick,
  delay = 0,
  exit,
  layout
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(500px circle at ${x}px ${y}px, rgba(249, 115, 22, 0.1), transparent 40%)`
  )

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={exit}
      layout={layout}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative ${rounded} ${bg} border border-black/5 dark:border-white/10 transition-colors hover:border-orange-500/50 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <motion.div
        className={`pointer-events-none absolute -inset-px ${rounded} opacity-0 transition duration-300 group-hover:opacity-100`}
        style={{ background: spotlightBg }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}
