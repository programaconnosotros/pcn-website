'use client';

import { useTheme } from 'next-themes';
import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const iconClassName = 'size-4 drop-shadow-[0_0_6px_currentColor]';

// PCN_OS notifications: a terminal panel with scanlines, a lit edge on the left that takes the
// toast's color, a `>` prompt before the title and a bar along the bottom that drains while the
// toast is on screen.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheck className={`${iconClassName} text-pcnGreen`} />,
        info: <Info className={`${iconClassName} text-pcnGreen`} />,
        warning: <TriangleAlert className={`${iconClassName} text-amber-400`} />,
        error: <CircleAlert className={`${iconClassName} text-red-400`} />,
        loading: <Loader2 className={`${iconClassName} animate-spin text-pcnGreen`} />,
      }}
      toastOptions={{
        classNames: {
          toast: [
            'group toast pcn-toast font-mono',
            'group-[.toaster]:rounded-none group-[.toaster]:border-pcnGreen-400 group-[.toaster]:text-foreground group-[.toaster]:backdrop-blur-xl',
            'group-[.toaster]:bg-black/90 group-[.toaster]:bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.035)_0_1px,transparent_1px_3px)]',
            'group-[.toaster]:shadow-[inset_0_1px_0_rgba(4,244,190,0.35),0_16px_40px_-12px_rgba(0,0,0,0.95),0_0_32px_-10px_rgba(4,244,190,0.6)]',
            'overflow-hidden group-[.toaster]:pl-5',
            'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-pcnGreen before:shadow-[0_0_12px_rgba(4,244,190,0.9)]',
            'after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:bg-pcnGreen/70',
          ].join(' '),
          title:
            "text-[13px] font-semibold tracking-tight before:mr-1.5 before:text-pcnGreen before:content-['>']",
          description: 'group-[.toast]:text-xs group-[.toast]:text-muted-foreground',
          actionButton: [
            'group-[.toast]:!rounded-none group-[.toast]:!border group-[.toast]:!border-pcnGreen group-[.toast]:!bg-pcnGreen group-[.toast]:!px-2.5 group-[.toast]:!py-1 group-[.toast]:!h-auto',
            'group-[.toast]:!font-mono group-[.toast]:!text-[10px] group-[.toast]:!font-semibold group-[.toast]:!uppercase group-[.toast]:!tracking-[0.14em] group-[.toast]:!text-black',
            'group-[.toast]:shadow-[0_0_14px_-2px_rgba(4,244,190,0.8)] transition-[filter] hover:brightness-110',
          ].join(' '),
          cancelButton:
            'group-[.toast]:!rounded-none group-[.toast]:!border group-[.toast]:!border-pcnGreen-300 group-[.toast]:!bg-transparent group-[.toast]:!font-mono group-[.toast]:!text-[10px] group-[.toast]:!uppercase group-[.toast]:!text-pcnGreen-700',
          closeButton:
            'group-[.toast]:!left-auto group-[.toast]:!right-1.5 group-[.toast]:!top-1.5 group-[.toast]:!translate-x-0 group-[.toast]:!translate-y-0 group-[.toast]:!size-4 group-[.toast]:!rounded-none group-[.toast]:!border-pcnGreen-300 group-[.toast]:!bg-black group-[.toast]:!text-pcnGreen-700 hover:group-[.toast]:!border-pcnGreen hover:group-[.toast]:!text-pcnGreen',
          error:
            'group-[.toaster]:!border-red-500/60 before:!bg-red-500 before:!shadow-[0_0_12px_rgba(239,68,68,0.9)] after:!bg-red-500/70 [&_[data-title]]:before:!text-red-400',
          warning:
            'group-[.toaster]:!border-amber-400/60 before:!bg-amber-400 before:!shadow-[0_0_12px_rgba(251,191,36,0.9)] after:!bg-amber-400/70 [&_[data-title]]:before:!text-amber-400',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
