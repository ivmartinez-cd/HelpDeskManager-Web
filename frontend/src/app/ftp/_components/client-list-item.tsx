import { memo } from "react"
import { Server, Edit2, Trash2 } from "lucide-react"
import type { Client } from "../_hooks/use-ftp-page"

interface ClientListItemProps {
  client: Client
  isSelected: boolean
  onSelect: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (id: number, name: string) => void
}

export const ClientListItem = memo(function ClientListItem({
  client, isSelected, onSelect, onEdit, onDelete
}: ClientListItemProps) {
  return (
    <div
      onClick={() => onSelect(client)}
      className={`group w-full cursor-pointer px-6 py-4 transition-colors flex items-center justify-between border-l-4 ${
        isSelected
          ? "bg-primary/10 border-primary"
          : "hover:bg-accent/30 border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <Server className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`font-medium text-sm truncate ${isSelected ? "text-primary" : ""}`}>
          {client.name}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onEdit(client) }}
          className="p-1.5 hover:bg-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(client.id, client.name) }}
          className="p-1.5 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
})
