import { Metadata } from "next"

export const metadata: Metadata = {
  title: "STC",
  description: "Módulo de gestión del Sistema Técnico Central y procesamiento de datos técnicos.",
}

export default function StcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
