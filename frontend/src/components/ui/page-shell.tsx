export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 flex flex-col bg-background text-foreground overflow-hidden font-sans w-full">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-fade" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 dark:bg-accent/10 blur-[120px] rounded-full" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
