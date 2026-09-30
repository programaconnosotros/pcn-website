const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="flex items-center gap-2 rounded-sm border border-pcnGreen-200 bg-background/95 px-4 py-2 font-mono text-sm text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span className="text-pcnGreen-500">$</span>
      cargando
      <span className="inline-block h-[1.1em] w-2 animate-pulse bg-pcnGreen" />
    </div>
  </div>
);

export default Loading;
