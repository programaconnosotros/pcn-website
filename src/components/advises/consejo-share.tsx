'use client';

import { cn } from '@/lib/utils';
import { Check, Link2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { consejoUrl, keyCapClassName } from './consejo-utils';

const copyLink = async (id: string) => {
  try {
    await navigator.clipboard.writeText(consejoUrl(id));
    toast.success('Link copiado', { description: consejoUrl(id) });
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    toast.error('No se pudo copiar el link');
    return false;
  }
};

// Copies the consejo's own link (/consejos/<id>), which opens it straight away.
export function CopyConsejoLink({ id, className }: { id: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      type="button"
      className={cn(keyCapClassName, copied && 'border-pcnGreen text-pcnGreen', className)}
      onClick={async () => setCopied(await copyLink(id))}
      title={copied ? 'Link copiado' : 'Copiar link'}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copiado' : 'Copiar link'}
      </span>
    </button>
  );
}

// The system share sheet where there is one (phones, Safari); copies the link everywhere else.
export function ShareConsejo({
  id,
  author,
  content,
  className,
}: {
  id: string;
  author: string;
  content: string;
  className?: string;
}) {
  const handleShare = async () => {
    const url = consejoUrl(id);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Consejo de ${author}`,
          text: content.length > 140 ? `${content.slice(0, 139)}…` : content,
          url,
        });
        return;
      } catch (error) {
        // Closing the share sheet isn't an error worth a fallback.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copyLink(id);
  };

  return (
    <button
      type="button"
      className={cn(keyCapClassName, className)}
      onClick={handleShare}
      title="Compartir"
    >
      <Share2 className="size-4" />
      <span className="sr-only">Compartir</span>
    </button>
  );
}
