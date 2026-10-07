'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { sendEventBroadcast } from '@/actions/events/event-broadcast';
import type { BroadcastAudience } from '@/lib/event-broadcast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

const AUDIENCES: { value: BroadcastAudience; label: string }[] = [
  { value: 'confirmados', label: 'confirmados' },
  { value: 'lista-de-espera', label: 'lista de espera' },
  { value: 'todos', label: 'todos' },
];

export interface BroadcastHistoryItem {
  id: string;
  audience: string;
  subject: string;
  recipients: number;
  failed: number;
  createdAt: Date;
  author: string | null;
}

const audienceLabel = (value: string) =>
  AUDIENCES.find((audience) => audience.value === value)?.label ?? value;

/**
 * Mail everyone signed up for an event (the confirmed ones, the waitlist or both): pick who,
 * write it, confirm how many people it reaches. Past sends are listed below.
 */
export function EventBroadcastForm({
  eventId,
  counts,
  history,
}: {
  eventId: string;
  counts: Record<BroadcastAudience, number>;
  history: BroadcastHistoryItem[];
}) {
  const router = useRouter();
  const [audience, setAudience] = useState<BroadcastAudience>('confirmados');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const reach = counts[audience];
  const ready = subject.trim().length >= 3 && message.trim().length >= 10 && reach > 0;

  const send = () =>
    startTransition(async () => {
      try {
        const { sent, failed } = await sendEventBroadcast(eventId, { audience, subject, message });
        if (failed > 0) toast.warning(`Se mandaron ${sent} mails; ${failed} no se pudieron enviar`);
        else toast.success(`Listo: ${sent} ${sent === 1 ? 'mail enviado' : 'mails enviados'}`);
        setSubject('');
        setMessage('');
        setConfirming(false);
        router.refresh();
      } catch (error) {
        setConfirming(false);
        toast.error(actionErrorMessage(error, 'No se pudieron enviar los mails'));
      }
    });

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="A quién"
        className="flex flex-wrap gap-1.5 font-mono text-xs"
      >
        {AUDIENCES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={audience === option.value}
            onClick={() => setAudience(option.value)}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-sm border px-2.5 transition-colors',
              audience === option.value
                ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
                : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500',
            )}
          >
            {option.label}
            <span className="tabular-nums text-muted-foreground">[{counts[option.value]}]</span>
          </button>
        ))}
      </div>
      <Input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="Asunto: cambio de aula, qué traer, link del stream…"
        aria-label="Asunto"
        maxLength={120}
      />
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="El mensaje. Dejá una línea en blanco entre párrafos."
        aria-label="Mensaje"
        rows={6}
        maxLength={5000}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] text-muted-foreground">
          {reach > 0
            ? `le llega a ${reach} ${reach === 1 ? 'persona' : 'personas'}`
            : 'no hay nadie en este grupo'}
        </p>
        <Button
          type="button"
          variant="pcn"
          size="sm"
          disabled={!ready}
          onClick={() => setConfirming(true)}
          className="gap-1.5"
        >
          <Mail className="size-4" />
          enviarMails();
        </Button>
      </div>

      {history.length > 0 && (
        <div className="border-t border-dashed border-pcnGreen-200 pt-3">
          <p className="mb-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>history | grep mail
          </p>
          <ul className="space-y-1 font-mono text-xs">
            {history.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="tabular-nums text-muted-foreground">
                  {item.createdAt.toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
                <span className="text-foreground/90">{item.subject}</span>
                <span className="text-muted-foreground">
                  → {audienceLabel(item.audience)} · {item.recipients}
                  {item.failed > 0 && (
                    <span className="text-red-400"> ({item.failed} fallaron)</span>
                  )}
                  {item.author && ` · ${item.author}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AlertDialog open={confirming} onOpenChange={(open) => !isPending && setConfirming(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Mandar el mail?</AlertDialogTitle>
            <AlertDialogDescription>
              “{subject.trim()}” le va a llegar a {reach} {reach === 1 ? 'persona' : 'personas'} (
              {audienceLabel(audience)}). No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                send();
              }}
              disabled={isPending}
            >
              {isPending ? 'enviando…' : 'mandar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
