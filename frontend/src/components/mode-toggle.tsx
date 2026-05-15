"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-14 h-7" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-7 w-14 items-center rounded-full bg-muted p-1 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
      aria-label="Toggle theme"
    >
      <div
        className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm border border-muted-foreground/10 transition-transform duration-200"
        style={{ transform: isDark ? "translateX(28px)" : "translateX(0)" }}
      >
        <div className="relative h-3 w-3">
          <Sun
            className={`absolute inset-0 h-3 w-3 text-orange-600 transition-all duration-200 ${
              isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <Moon
            className={`absolute inset-0 h-3 w-3 text-orange-500 fill-orange-500/20 transition-all duration-200 ${
              isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
            }`}
          />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-muted-foreground/30 pointer-events-none">
        <Sun className="h-3 w-3" />
        <Moon className="h-3 w-3" />
      </div>
    </button>
  )
}
