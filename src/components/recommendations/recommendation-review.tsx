'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Pencil, StickyNote, TriangleAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  approveRecommendation,
  rejectRecommendation,
  updateRecommendation,
} from '@/actions/recommendations/review-recommendations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import type { ReviewRecommendation } from '@/lib/recommendations';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import {
  RECOMMENDATION_KINDS,
  RECOMMENDATION_KIND_INFO,
  missingToPublish,
  toRecommendationForm,
  type RecommendationKindValue,
} from '@/schemas/recommendation-schema';
import { RecommendationForm } from './recommendation-form';

type Status = ReviewRecommendation['status'];

const STATUSES: { value: Status; flag: string }[] = [
  { value: 'PENDING', flag: '--pendientes' },
  { value: 'APPROVED', flag: '--publicadas' },
  { value: 'REJECTED', flag: '--rechazadas' },
];

const STATUS_TAG: Record<Status, { label: string; className: string }> = {
  PENDING: { label: 'pendiente', className: 'border-amber-400/60 text-amber-300' },
  APPROVED: { label: 'publicada', className: 'border-pcnGreen-600 text-pcnGreen' },
  REJECTED: { label: 'rechazada', className: 'border-red-400/50 text-red-400' },
};

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

/** Where an item points to: its YouTube video, or its own link. */
const itemHref = (item: ReviewRecommendation) =>
  item.kind === 'VIDEO' ? `https://www.youtube.com/watch?v=${item.slug}` : item.url;

const flagClassName = (active: boolean) =>
  cn(
    'flex h-8 shrink-0 items-center gap-1.5 rounded-sm border px-3 font-mono text-xs transition-colors',
    active
      ? 'border-pcnGreen-600 bg-pcnGreen-100 text-pcnGreen'
      : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-400 hover:text-foreground',
  );

/**
 * The admins' queue of recommendations: what members sent waits here to be approved (published
 * in its listing), corrected or rejected. Published and rejected ones stay reachable to edit them
 * or take them down.
 */
export function RecommendationReview({ items }: { items: ReviewRecommendation[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('PENDING');
  const [kind, setKind] = useState<RecommendationKindValue | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ReviewRecommendation | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter(
      (item) =>
        item.status === status &&
        (kind === 'ALL' || item.kind === kind) &&
        (!needle ||
          normalize(
            [item.title, item.author, item.source, item.submittedBy?.name].join(' '),
          ).includes(needle)),
    );
  }, [items, status, kind, query]);

  const act = async (item: ReviewRecommendation, action: 'approve' | 'reject') => {
    setBusy(item.id);
    try {
      const result =
        action === 'approve'
          ? await approveRecommendation(item.id)
          : await rejectRecommendation(item.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(action === 'approve' ? 'Recomendación publicada' : 'Recomendación rechazada');
      router.refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo revisar la recomendación'));
    } finally {
      setBusy(null);
    }
  };

  const countOf = (value: Status) =>
    items.filter((item) => item.status === value && (kind === 'ALL' || item.kind === kind)).length;

  return (
    <div className="mb-14">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUSES.map(({ value, flag }) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
            className={flagClassName(status === value)}
          >
            {flag}
            <span className="text-[10px] tabular-nums opacity-60">{countOf(value)}</span>
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-pcnGreen-200" />
        {(['ALL', ...RECOMMENDATION_KINDS] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
            className={flagClassName(kind === value)}
          >
            {value === 'ALL' ? 'todo' : RECOMMENDATION_KIND_INFO[value].plural}
          </button>
        ))}
        <SearchBar
          searchQuery={query}
          setSearchQuery={setQuery}
          placeholder="título, autor o quién la mandó"
          label="Buscar recomendaciones"
          className="md:ml-auto md:max-w-xs"
        />
      </div>

      {visible.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 px-3 py-6 text-center font-mono text-xs text-muted-foreground">
          {status === 'PENDING' ? 'No hay recomendaciones para revisar.' : 'No hay nada acá.'}
        </p>
      ) : (
        <RuledGrid className="grid-cols-1">
          {visible.map((item) => {
            const info = RECOMMENDATION_KIND_INFO[item.kind];
            const href = itemHref(item);
            const missing = missingToPublish(item.kind, item);
            const tag = STATUS_TAG[item.status];
            return (
              <article
                key={item.id}
                className={cn(ruledCellClassName, 'flex flex-col gap-2 p-3 sm:flex-row')}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                    <span className="rounded-sm border border-pcnGreen-200 px-1 text-[10px] text-pcnGreen-600 uppercase">
                      {info.label}
                    </span>
                    <span
                      className={cn('rounded-sm border px-1 text-[10px] uppercase', tag.className)}
                    >
                      {tag.label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 items-center gap-1 font-semibold hover:text-pcnGreen"
                      >
                        <span className="truncate">{item.title}</span>
                        <ArrowUpRight className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="truncate font-semibold">{item.title}</span>
                    )}
                  </div>

                  <p className="truncate font-mono text-[11px] text-muted-foreground/80">
                    {[item.author, item.source, item.categories.join(' · ')]
                      .filter(Boolean)
                      .join(' · ') || 'sin autor'}
                  </p>

                  {item.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  )}

                  {item.note && (
                    <p className="flex items-start gap-1.5 text-xs text-foreground/80">
                      <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-pcnGreen-600" />
                      <span className="italic">“{item.note}”</span>
                    </p>
                  )}

                  <p className="font-mono text-[11px] text-muted-foreground/70">
                    {item.submittedBy ? `por ${item.submittedBy.name}` : 'de la lista original'}
                    {' · '}
                    {formatDate(item.createdAt)}
                    {item.reviewedBy &&
                      ` · revisó ${item.reviewedBy.name}${item.reviewedAt ? ` el ${formatDate(item.reviewedAt)}` : ''}`}
                  </p>

                  {missing.length > 0 && item.status !== 'APPROVED' && (
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                      <TriangleAlert className="h-3 w-3" />
                      para publicarla falta: {missing.join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-start gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(item)}
                    disabled={busy === item.id}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    editar
                  </Button>
                  {item.status !== 'APPROVED' && (
                    <Button
                      variant="pcn"
                      size="sm"
                      onClick={() => act(item, 'approve')}
                      disabled={busy === item.id || missing.length > 0}
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      aprobar
                    </Button>
                  )}
                  {item.status !== 'REJECTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => act(item, 'reject')}
                      disabled={busy === item.id}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      {item.status === 'APPROVED' ? 'despublicar' : 'rechazar'}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </RuledGrid>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">
              <span className="text-pcnGreen">$</span> vim{' '}
              {editing && RECOMMENDATION_KIND_INFO[editing.kind].label}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <RecommendationForm
              key={editing.id}
              kind={editing.kind}
              asAdmin
              initialValues={toRecommendationForm(editing)}
              submitLabel="guardar"
              onCancel={() => setEditing(null)}
              onSubmit={async (values) => {
                try {
                  const result = await updateRecommendation(editing.id, values);
                  if (!result.success) return result.error;
                  toast.success('Recomendación guardada');
                  setEditing(null);
                  router.refresh();
                  return null;
                } catch (error) {
                  return actionErrorMessage(error, 'No se pudo guardar la recomendación');
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
