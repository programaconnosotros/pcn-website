'use client';

import { cn } from '@/lib/utils';
import { Check, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Copies the absolute URL of `path` so it can be shared, confirming it for a moment. */
export function CopyLinkButton({ path, className }: { path: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setCopied(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar link para compartir"
      className={cn(
        'inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs lowercase transition-colors focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:outline-hidden',
        copied
          ? 'border-pcnGreen text-pcnGreen'
          : 'border-pcnGreen-200 bg-black/40 text-muted-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      <span aria-live="polite">{copied ? 'link copiado' : 'copiar link'}</span>
    </button>
  );
}
