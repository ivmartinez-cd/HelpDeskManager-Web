"use client"

import { Upload } from "lucide-react"

interface FileInputProps {
  label: string
  accept?: string
  multiple?: boolean
  onChange: (files: FileList | null) => void
  error?: boolean
}

export function FileInput({ label, accept, multiple, onChange, error }: FileInputProps) {
  return (
    <div className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all group cursor-pointer ${error ? "border-destructive/50 bg-destructive/5" : "border-orange-500/20 hover:bg-orange-500/5"}`}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={e => onChange(e.target.files)}
      />
      <Upload className={`h-8 w-8 mx-auto mb-2 transition-all pointer-events-none ${error ? "text-destructive" : "text-muted-foreground group-hover:text-orange-500 group-hover:scale-110"}`} />
      <p className={`text-sm font-bold transition-colors pointer-events-none ${error ? "text-destructive" : "text-muted-foreground group-hover:text-orange-500"}`}>{label}</p>
    </div>
  )
}
