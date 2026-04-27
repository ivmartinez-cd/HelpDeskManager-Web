"use client"

import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { Monitor, Calculator, ExternalLink, Server, Link as LinkIcon } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <Monitor className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              HelpDesk Manager
            </span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/contadores" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Calculator className="h-4 w-4" />
            Contadores
          </Link>
          <Link 
            href="/stc" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            STC
          </Link>
          <Link 
            href="/recursos" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <LinkIcon className="h-4 w-4" />
            Recursos
          </Link>
          <div className="border-l pl-4">
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
