import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contadores",
  description: "Herramientas de procesamiento y conversión de archivos de contadores de impresión (DB3/CSV).",
}

export default function ContadoresLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
