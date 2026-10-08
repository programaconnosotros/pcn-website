export const GlowingText = ({ children }: { children: React.ReactNode }) => (
  <>
    <span className="absolute mx-auto box-content flex w-fit border bg-linear-to-r from-pcnGreen via-teal-500 to-pcnGreen bg-clip-text py-4 text-center text-3xl font-extrabold text-transparent blur-xl select-none md:text-5xl lg:text-6xl">
      {children}
    </span>

    <h1 className="relative top-0 flex h-auto w-fit items-center justify-center bg-linear-to-r from-pcnGreen via-teal-500 to-pcnGreen bg-clip-text py-4 text-center text-3xl font-extrabold text-transparent select-auto md:text-5xl lg:text-6xl">
      <code>{children}</code>
    </h1>
  </>
);
