/** Terminal backdrop shared by every authentication screen. */
const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <div className="relative min-h-screen overflow-clip">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute top-1/2 left-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pcnGreen/[0.07] blur-[160px]" />
      <div className="absolute inset-0 bg-grid-fade" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

export default AuthLayout;
