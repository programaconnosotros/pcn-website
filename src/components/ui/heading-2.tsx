import { ReactNode } from "react";

export const Heading2 = ({ children }: { children: ReactNode }) => ( 
  <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
    {children}
  </h2>
)