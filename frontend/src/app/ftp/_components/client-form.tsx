import { memo, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"

type FormData = {
  name: string; host: string; user: string
  password: string; path: string; pattern: string
}

interface ClientFormProps {
  mode: "add" | "edit"
  editingName?: string
  formData: FormData
  error: string | null
  onChange: (data: FormData) => void
  onSubmit: (e: FormEvent) => void
}

const INPUT_BASE = "w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all"
const INPUT_OK = "border-black/5 dark:border-white/10 focus:border-orange-500/50"
const INPUT_ERR = "border-destructive/50 focus:border-destructive"

export const ClientForm = memo(function ClientForm({
  mode, editingName, formData, error, onChange, onSubmit
}: ClientFormProps) {
  const field = (key: keyof FormData) => ({
    value: formData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, [key]: e.target.value }),
    className: `${INPUT_BASE} ${error && !formData[key] ? INPUT_ERR : INPUT_OK}`,
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre del Cliente</label>
          <input required type="text" placeholder="Ej: ISSN" {...field("name")} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Servidor FTP (Host)</label>
          <input required type="text" placeholder="www.cdsisa.com.ar" {...field("host")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Usuario FTP</label>
            <input required type="text" placeholder="usuario" {...field("user")} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Contraseña FTP</label>
            <input required type="password" placeholder="••••••••" {...field("password")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Ruta FTP</label>
            <input required type="text" placeholder="/" {...field("path")} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Patrón de Archivos</label>
            <input required type="text" placeholder="*.db3" {...field("pattern")} />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 group"
      >
        <CheckCircle2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
        {mode === "add" ? "Crear Cliente" : `Guardar Cambios — ${editingName}`}
      </button>
    </form>
  )
})
