const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="flex items-center gap-3 rounded-lg bg-background/95 px-6 py-3 text-base font-semibold text-muted-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      Cargando...
    </div>
  </div>
);

export default Loading;
