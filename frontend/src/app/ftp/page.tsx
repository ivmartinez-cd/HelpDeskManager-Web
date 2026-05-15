"use client"

import { Navbar } from "@/components/navbar"
import { Modal } from "@/components/ui/modal"
import {
  Search, RefreshCw, Play, CheckCircle2, AlertCircle,
  Loader2, Download, Plus, Server, Database, AlertTriangle, Trash2
} from "lucide-react"

import { useFtpPage } from "./_hooks/use-ftp-page"
import { ClientListItem } from "./_components/client-list-item"
import { ClientForm } from "./_components/client-form"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010"

export default function FtpPage() {
  const p = useFtpPage(apiUrl)

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestión de Clientes FTP</h1>
              <p className="text-muted-foreground">Configura y procesa contadores desde la base de datos centralizada.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={p.openAddModal}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </button>
              <button
                onClick={p.fetchClients}
                disabled={p.isLoadingClients}
                className="bg-accent/10 text-accent-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/20 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${p.isLoadingClients ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar: Client List */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  value={p.searchTerm}
                  onChange={e => p.setSearchTerm(e.target.value)}
                />
              </div>

              <div className="border rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm h-[65vh] overflow-y-auto custom-scrollbar">
                {p.isLoadingClients ? (
                  <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Cargando...</p>
                  </div>
                ) : p.filteredClients.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {p.filteredClients.map(client => (
                      <ClientListItem
                        key={client.id}
                        client={client}
                        isSelected={p.selectedClient?.id === client.id}
                        onSelect={p.selectClient}
                        onEdit={p.openEditModal}
                        onDelete={p.requestDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No hay clientes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Action Area */}
            <div className="md:col-span-2 space-y-6">
              {p.selectedClient ? (
                <div className="p-8 rounded-3xl border bg-card/50 space-y-8 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                      <Database className="h-10 w-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{p.selectedClient.name}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Configuración gestionada en Cloud Database <CheckCircle2 className="h-3 w-3 text-green-500" />
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-accent/5 border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Servidor FTP</p>
                      <p className="text-sm font-mono truncate">{p.selectedClient.host}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-accent/5 border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Ruta Remota</p>
                      <p className="text-sm font-mono truncate">{p.selectedClient.path}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      El sistema descargará todos los archivos coincidentes con el patrón{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{p.selectedClient.pattern}</code>, los fusionará y generará el reporte.
                    </p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Fecha Límite de Procesamiento (Opcional)</label>
                      <input
                        type="date"
                        className="w-full h-14 px-6 rounded-2xl border bg-black/[0.02] dark:bg-white/5 font-bold outline-none transition-all border-black/5 dark:border-white/10 focus:border-orange-500/50"
                        value={p.fechaMaxima}
                        onChange={e => p.setFechaMaxima(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={p.handleProcess}
                      disabled={p.isProcessing || p.status === "success"}
                      className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-lg ${
                        p.status === "success"
                          ? "bg-green-500 text-white cursor-default"
                          : "bg-primary text-primary-foreground hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
                      }`}
                    >
                      {p.isProcessing ? (
                        <><Loader2 className="h-6 w-6 animate-spin" />Descargando y Fusionando...</>
                      ) : p.status === "success" ? (
                        <><CheckCircle2 className="h-6 w-6" />¡Procesamiento Completado!</>
                      ) : (
                        <><Play className="h-5 w-5 fill-current" />Iniciar Descarga y Proceso</>
                      )}
                    </button>
                  </div>

                  {(p.message || p.csvFile || p.db3File) && (
                    <div className="space-y-6 pt-6 border-t">
                      {p.message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                          p.status === "success"
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}>
                          {p.status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                          <span className="text-sm font-medium">{p.message}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {p.csvFile && (
                          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary p-2 rounded-xl text-primary-foreground"><Download className="h-5 w-5" /></div>
                              <div>
                                <p className="font-bold text-sm">Reporte CSV</p>
                                <p className="text-[10px] text-muted-foreground">Contadores extraídos</p>
                              </div>
                            </div>
                            <a href={`${apiUrl}/api/download/${p.csvFile}`} download={p.csvFile} className="w-full bg-primary text-primary-foreground h-9 rounded-xl flex items-center justify-center font-bold text-xs hover:opacity-90 transition-all">
                              Descargar CSV
                            </a>
                          </div>
                        )}
                        {p.db3File && (
                          <div className="bg-accent/10 border border-accent/20 p-5 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent p-2 rounded-xl text-accent-foreground"><Server className="h-5 w-5" /></div>
                              <div>
                                <p className="font-bold text-sm">Base de Datos</p>
                                <p className="text-[10px] text-muted-foreground">Archivo fusionado (.db3)</p>
                              </div>
                            </div>
                            <a href={`${apiUrl}/api/download/${p.db3File}`} download={p.db3File} className="w-full bg-accent text-accent-foreground h-9 rounded-xl flex items-center justify-center font-bold text-xs hover:opacity-90 transition-all">
                              Descargar DB3
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[500px] rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center p-12">
                  <div className="bg-muted/50 p-6 rounded-full mb-4 text-muted-foreground">
                    <Database className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Base de Datos de Clientes</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Selecciona un cliente de la lista lateral o utiliza el botón &quot;Nuevo Cliente&quot; para añadir una configuración.
                  </p>
                </div>
              )}

              <div className="p-6 rounded-3xl border bg-orange-500/5 border-orange-500/10">
                <h4 className="font-bold text-orange-600 mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Almacenamiento Cloud
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Los datos de configuración ahora se almacenan de forma segura en PostgreSQL (Neon). Esto garantiza redundancia, mayor velocidad y elimina la dependencia de archivos locales o del NAS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={p.isModalOpen}
        onClose={p.closeModal}
        title={p.modalMode === "add" ? "Nuevo Cliente" : "Editar Cliente"}
        subtitle={p.modalMode === "add" ? "Configuración FTP" : `Editando ${p.editingClient?.name}`}
        error={p.modalError}
      >
        <ClientForm
          mode={p.modalMode}
          editingName={p.editingClient?.name}
          formData={p.formData}
          error={p.modalError}
          onChange={p.setFormData}
          onSubmit={p.handleSubmitModal}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!p.confirmDelete}
        onClose={() => !p.isDeleting && p.setConfirmDelete(null)}
        title="Eliminar cliente"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            ¿Eliminar <span className="font-bold text-foreground">{p.confirmDelete?.name}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => p.setConfirmDelete(null)}
              disabled={p.isDeleting}
              className="flex-1 h-12 rounded-2xl border font-bold text-sm hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={p.confirmAndDelete}
              disabled={p.isDeleting}
              className="flex-1 h-12 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {p.isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </>
  )
}
