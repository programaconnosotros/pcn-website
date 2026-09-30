import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-sm border border-input bg-black/60 px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground/60 hover:border-pcnGreen-400 focus-visible:border-pcnGreen focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
