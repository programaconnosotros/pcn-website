'use client';

import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { reportContent } from '@/actions/moderation/content-reports';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  REPORT_REASONS,
  REPORTABLE_LABELS,
  type ReportableType,
  type ReportReason,
} from '@/lib/content-report-types';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

/**
 * "reportar": lets a signed-in member flag a piece of content for the admins, with a reason. Hidden
 * without a session and on your own content (`hidden`), where reporting makes no sense.
 */
export function ReportButton({
  contentType,
  contentId,
  hidden,
  className,
}: {
  contentType: ReportableType;
  contentId: string;
  hidden?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (hidden) return null;

  const close = (next: boolean) => {
    if (isPending) return;
    setOpen(next);
    if (!next) {
      setReason(null);
      setDetails('');
      setError(null);
    }
  };

  const submit = () =>
    startTransition(async () => {
      if (!reason) return;
      try {
        const result = await reportContent({ contentType, contentId, reason, details });
        if (!result.success) {
          setError(result.error);
          return;
        }
        toast.success('Gracias por avisar: un admin lo va a revisar.');
        close(false);
      } catch (err) {
        setError(actionErrorMessage(err, 'No se pudo enviar el reporte'));
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-amber-400',
          className,
        )}
      >
        <Flag className="size-3" aria-hidden />
        reportar
      </button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Reportar {REPORTABLE_LABELS[contentType]}</DialogTitle>
              <DialogDescription>
                Lo ve solo el equipo de admins, nunca quien lo publicó.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 font-mono text-xs text-muted-foreground">
                {'> '}motivo
              </legend>
              {(Object.entries(REPORT_REASONS) as [ReportReason, string][]).map(([id, label]) => (
                <label
                  key={id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 border px-3 py-2 font-mono text-xs transition-colors',
                    reason === id
                      ? 'border-pcnGreen bg-pcnGreen-100 text-pcnGreen'
                      : 'border-pcnGreen-200 hover:border-pcnGreen-500',
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={id}
                    checked={reason === id}
                    onChange={() => setReason(id)}
                    className="accent-[#04f4be]"
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`report-details-${contentId}`}>Contanos más (opcional)</Label>
              <Textarea
                id={`report-details-${contentId}`}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={500}
                className="min-h-20 font-mono text-xs"
              />
            </div>

            {error && (
              <p role="alert" className="font-mono text-xs text-red-400">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => close(false)}>
                cancelar();
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!reason}
                loading={isPending}
                loadingText="enviando..."
              >
                reportar();
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
