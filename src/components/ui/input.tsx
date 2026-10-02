import * as React from 'react';

import { cn } from '@/lib/utils';
import { fieldClassName } from './field-surface';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Email inputs hide their caret position from scripts, which TerminalCaret needs to draw
    // the block caret, so they render as text with the email keyboard and autofill instead.
    // Forms validate the address themselves.
    const emailProps: InputProps =
      type === 'email' ? { inputMode: 'email', autoComplete: 'email', autoCapitalize: 'none' } : {};

    return (
      <input
        type={type === 'email' ? 'text' : type}
        spellCheck={type === 'email' || type === 'password' || type === 'url' ? false : undefined}
        className={cn(fieldClassName, 'flex h-9', className)}
        ref={ref}
        {...emailProps}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
