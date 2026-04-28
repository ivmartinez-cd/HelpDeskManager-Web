"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ModeToggle } from "./mode-toggle"
import { Monitor, Calculator, ExternalLink, Link as LinkIcon, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { href: "/contadores", label: "Contadores", icon: Calculator },
  { href: "/stc",        label: "STC",        icon: ExternalLink },
  { href: "/recursos",   label: "Recursos",   icon: LinkIcon },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
      pathname === href
        ? "text-accent bg-accent/10 font-bold"
        : "text-muted-foreground hover:text-primary hover:bg-muted/50"
    }`

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="bg-accent p-2 rounded-xl text-accent-foreground shadow-lg shadow-accent/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
            <Monitor className="h-6 w-6" />
          </div>
          <span className="text-display font-black text-2xl tracking-tighter uppercase hidden sm:inline-block">
            HelpDesk<span className="text-accent ml-1">Manager</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="border-l ml-3 pl-4">
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile: toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <ModeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t bg-background/95 backdrop-blur"
          >
            <nav className="flex flex-col gap-1 p-3">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(href)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
