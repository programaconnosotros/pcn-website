import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fades a block in as it scrolls into view, with a scroll-driven CSS animation (`.reveal` in
 * globals.css): no JavaScript, so the content is visible in the server HTML and wherever the
 * animation isn't supported. Off-screen blocks also skip rendering until they get close.
 */
export const Reveal = ({ children, className }: RevealProps) => (
  <div className={cn('reveal', className)}>{children}</div>
);
