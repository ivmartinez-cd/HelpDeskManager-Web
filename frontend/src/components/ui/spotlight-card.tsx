"use client"

import { useRef, type ReactNode, type MouseEvent, type KeyboardEvent } from "react"

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  rounded?: string
  bg?: string
  onClick?: () => void
  delay?: number
}

export function SpotlightCard({
  children,
  className = "",
  rounded = "rounded-[1.2rem]",
  bg = "bg-black/[0.02] dark:bg-white/5",
  onClick,
  delay = 0,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const { left, top } = el.getBoundingClientRect()
    el.style.setProperty("--spotlight-x", `${e.clientX - left}px`)
    el.style.setProperty("--spotlight-y", `${e.clientY - top}px`)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative ${rounded} ${bg} border border-black/5 dark:border-white/10 transition-colors hover:border-orange-500/50 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background animate-fade-in ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ animationDelay: delay ? `${delay}s` : undefined }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(500px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(249, 115, 22, 0.1), transparent 40%)",
          borderRadius: "inherit",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
