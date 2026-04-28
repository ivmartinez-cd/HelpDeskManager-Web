import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recursos",
  description: "Directorio centralizado de manuales, enlaces y documentación técnica del HelpDesk.",
}

export default function RecursosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
