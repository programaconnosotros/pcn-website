import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export const Heading2 = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h2
    className={cn('scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}
  >
    {children}
  </h2>
);
