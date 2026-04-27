"use client"

import { Navbar } from "@/components/navbar";
import { Calculator, ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-linear-to-b from-background via-background to-secondary/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase"
          >
            <Zap className="h-3 w-3 fill-current" />
            Estándares 2026 • Web Edition
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl"
          >
            Gestión de Operaciones <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-amber-400">
              Simplificada y Premium
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
          >
            La evolución web de HelpDesk Manager. Procesa contadores, gestiona alertas y optimiza tus procesos con una interfaz de vanguardia.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="/contadores"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 gap-2 group"
            >
              Comenzar Ahora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="h-12 px-8 rounded-full border border-input bg-background hover:bg-accent transition-colors font-bold">
              Ver Documentación
            </button>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={item} className="p-8 rounded-3xl border bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all group">
              <div className="bg-orange-500/10 p-3 rounded-2xl w-fit mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                <Calculator className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Procesamiento de Contadores</h3>
              <p className="text-muted-foreground">
                Sube tus archivos DB3 y XLS para generar reportes unificados en segundos con precisión garantizada.
              </p>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-3xl border bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all group">
              <div className="bg-blue-500/10 p-3 rounded-2xl w-fit mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <Activity className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Monitor de Flota</h3>
              <p className="text-muted-foreground">
                Control en tiempo real de todos tus dispositivos conectados con alertas automáticas y diagnóstico preventivo.
              </p>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-3xl border bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all group">
              <div className="bg-green-500/10 p-3 rounded-2xl w-fit mb-6 text-green-500 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Arquitectura Segura</h3>
              <p className="text-muted-foreground">
                Diseñado bajo estándares de seguridad modernos para proteger la integridad de tus datos operativos.
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="w-full border-t py-12 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2026 HelpDesk Manager Web • Hecho con precisión por Iván Martínez
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
