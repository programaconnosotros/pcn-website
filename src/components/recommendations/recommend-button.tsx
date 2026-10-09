'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { Clock, Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMyRecommendations } from '@/actions/recommendations/get-my-recommendations';
import { submitRecommendation } from '@/actions/recommendations/submit-recommendation';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import {
  EMPTY_RECOMMENDATION_FORM,
  RECOMMENDATION_KIND_INFO,
  type RecommendationFormValues,
  type RecommendationKindValue,
} from '@/schemas/recommendation-schema';
import { RecommendationForm } from './recommendation-form';

type Props = {
  kind: RecommendationKindValue;
  /** Starting values, e.g. `isTalk` when recommending from the external talks. */
  defaults?: Partial<RecommendationFormValues>;
  /** What the button says; `recomendar <kind>` by default. */
  label?: string;
  className?: string;
};

export const myRecommendationsKey = (kind: RecommendationKindValue) => ['my-recommendations', kind];

/**
 * `+ recomendar` for a listing: opens the form to recommend one more item. Members' items wait
 * for an admin (and show up here as pending); visitors without a session go to the login first.
 */
export function RecommendButton({ kind, defaults, label, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  // External talks are videos with `isTalk`, but on /charlas they're talks, not videos
  const info = defaults?.isTalk
    ? {
        ...RECOMMENDATION_KIND_INFO[kind],
        label: 'charla',
        article: 'una' as const,
        href: '/charlas',
      }
    : RECOMMENDATION_KIND_INFO[kind];
  const it = defaults?.isTalk ? 'la' : 'lo';

  const { data } = useQuery({
    queryKey: myRecommendationsKey(kind),
    queryFn: () => getMyRecommendations(kind),
    staleTime: 60 * 1000,
  });
  const pending = data?.items.filter((item) => item.status === 'PENDING').length ?? 0;

  const handleClick = () => {
    if (data && !data.isAuthenticated) {
      router.push(`/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (values: RecommendationFormValues) => {
    try {
      const result = await submitRecommendation(kind, values);
      if (!result.success) return result.error;
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: myRecommendationsKey(kind) });
      if (result.status === 'APPROVED') {
        toast.success(
          `Publicaste ${info.article} ${info.label} ${defaults?.isTalk ? 'nueva' : 'nuevo'}`,
        );
        router.refresh();
      } else {
        toast.success(`¡Gracias! Un admin ${it} va a revisar antes de sumar${it} a la lista`);
      }
      return null;
    } catch (error) {
      return actionErrorMessage(error, 'No pudimos guardar tu recomendación. Probá de nuevo.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex h-8 shrink-0 items-center gap-1.5 rounded-sm border border-pcnGreen-200 px-3 font-mono text-xs text-pcnGreen-700 transition-colors hover:border-pcnGreen-400 hover:text-pcnGreen',
          className,
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {label ?? `recomendar ${info.label}`}
        {pending > 0 && (
          <span
            title={`${pending} pendiente${pending === 1 ? '' : 's'} de revisión`}
            className="bg-pcnGreen px-1 text-[10px] text-black tabular-nums"
          >
            {pending}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">
              <span className="text-pcnGreen">$</span> recomendar {info.label}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {data?.isAdmin
                ? `Como sos admin, ${info.article} ${info.label} que cargues se publica directo.`
                : `Un admin ${it} revisa y, si va, ${it} sumamos a ${info.href}.`}
            </DialogDescription>
          </DialogHeader>

          {open && (
            <RecommendationForm
              kind={kind}
              asAdmin={data?.isAdmin}
              initialValues={{ ...EMPTY_RECOMMENDATION_FORM, ...defaults }}
              submitLabel={data?.isAdmin ? 'publicar' : 'enviar'}
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
            />
          )}

          {data && data.items.length > 0 && (
            <div className="border-t border-pcnGreen-200 pt-3">
              <p className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                tus recomendaciones
              </p>
              <ul className="flex flex-col divide-y divide-pcnGreen-200 border border-pcnGreen-200">
                {data.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 px-3 py-2 font-mono text-xs">
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    {item.status === 'PENDING' ? (
                      <span className="flex shrink-0 items-center gap-1 text-pcnGreen-700">
                        <Clock className="h-3 w-3" />
                        pendiente de revisión
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                        <XCircle className="h-3 w-3" />
                        no se sumó
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
