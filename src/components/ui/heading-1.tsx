import { ReactNode } from 'react';

export const Heading1 = ({ children }: { children: ReactNode }) => (
  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{children}</h1>
);
