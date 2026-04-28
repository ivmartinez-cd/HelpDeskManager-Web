import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clientes FTP",
  description: "Administración de clientes y automatización de descarga/procesamiento de datos vía FTP.",
}

export default function FtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
