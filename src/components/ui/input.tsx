import * as React from 'react';

import { cn } from '@/lib/utils';
import { fieldClassName } from './field-surface';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        spellCheck={type === 'email' || type === 'password' || type === 'url' ? false : undefined}
        className={cn(fieldClassName, 'flex h-9', className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
