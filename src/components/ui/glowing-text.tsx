export const GlowingText = ({ children }: { children: React.ReactNode }) => (
  <>
    <span className="absolute mx-auto box-content flex w-fit select-none border bg-gradient-to-r from-pcnGreen via-teal-500 to-pcnGreen bg-clip-text py-4 text-center text-6xl font-extrabold text-transparent blur-xl">
      {children}
    </span>

    <h1 className="relative top-0 flex h-auto w-fit select-auto items-center justify-center bg-gradient-to-r from-pcnGreen via-teal-500 to-pcnGreen bg-clip-text py-4 text-center text-6xl font-extrabold text-transparent">
      <code>{children}</code>
    </h1>
  </>
);
