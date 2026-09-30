/** Terminal backdrop shared by every authentication screen. */
const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <div className="relative min-h-screen overflow-hidden">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pcnGreen/[0.07] blur-[160px]" />
      <div className="bg-grid-fade absolute inset-0" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

export default AuthLayout;
