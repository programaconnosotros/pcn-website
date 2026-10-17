'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowUpRight, Building2, Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteJobOffer, setJobOfferAvailable } from '@/actions/job-offers/job-offers';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { StickyHeader } from '@/components/ui/sticky-header';
import type { JobOfferWithAuthor } from '@/lib/job-offers';
import { timeAgo } from '@/lib/forum-utils';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import {
  applyHref,
  JOB_MODALITIES,
  JOB_SENIORITIES,
  JOB_TYPES,
  type JobOfferInput,
} from '@/schemas/job-offer-schema';
import { JobOfferForm } from './job-offer-form';

type Viewer = { id: string; isAdmin: boolean } | null;
type Modality = keyof typeof JOB_MODALITIES;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const label = (options: Record<string, string>, value: string | null) =>
  value ? (options[value] ?? value) : null;

const toInput = (offer: JobOfferWithAuthor): { id: string } & JobOfferInput => ({
  id: offer.id,
  title: offer.title,
  company: offer.company,
  location: offer.location,
  type: offer.type as JobOfferInput['type'],
  modality: offer.modality as JobOfferInput['modality'],
  seniority: offer.seniority as JobOfferInput['seniority'],
  description: offer.description,
  tags: offer.tags,
  applyUrl: offer.applyUrl ?? '',
});

/** /empleos: the open offers members posted, searchable and filterable by modality. */
export function JobOffersClient({
  offers,
  viewer,
}: {
  offers: JobOfferWithAuthor[];
  viewer: Viewer;
}) {
  const [query, setQuery] = useState('');
  const [modality, setModality] = useState<Modality | null>(null);
  const [editing, setEditing] = useState<JobOfferWithAuthor | 'new' | null>(null);

  const visible = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return offers.filter((offer) => {
      if (modality && offer.modality !== modality) return false;
      const text = normalize(
        [offer.title, offer.company, offer.location, offer.description, ...offer.tags].join(' '),
      );
      return words.every((word) => text.includes(word));
    });
  }, [offers, query, modality]);

  const run = async (action: () => Promise<void>, success: string, failure: string) => {
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(actionErrorMessage(error, failure));
    }
  };

  const filtered = !!query.trim() || modality !== null;

  return (
    <div className="mt-4 mb-14">
      <StickyHeader>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <PageTitle
            path="empleos"
            meta={`${offers.length} ${offers.length === 1 ? 'oferta abierta' : 'ofertas abiertas'}`}
            className="mb-0 flex-1"
          />
          {viewer ? (
            <Button variant="pcn" size="sm" onClick={() => setEditing('new')}>
              <Plus className="mr-1.5 size-4" />
              publicarOferta();
            </Button>
          ) : (
            <Link
              href="/iniciar-sesion?redirect=/empleos"
              className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
            >
              iniciá sesión para publicar una oferta
            </Link>
          )}
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SearchBar
            searchQuery={query}
            setSearchQuery={setQuery}
            placeholder="puesto, empresa o tecnología"
            label="Buscar ofertas"
          />
          <div role="group" aria-label="Modalidad" className="flex h-8 gap-1 font-mono text-xs">
            {(Object.entries(JOB_MODALITIES) as [Modality, string][]).map(([id, text]) => (
              <button
                key={id}
                type="button"
                aria-pressed={modality === id}
                onClick={() => setModality(modality === id ? null : id)}
                className={cn(
                  'h-8 rounded-sm border px-2.5 transition-colors',
                  modality === id
                    ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
                    : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500',
                )}
              >
                --{text}
              </button>
            ))}
          </div>
        </div>
      </StickyHeader>

      {visible.length === 0 ? (
        <EmptyState
          command={filtered ? `grep -i "${query.trim()}" ~/empleos` : 'ls ~/empleos'}
          output={filtered ? '0 ofertas' : 'total 0'}
          title={filtered ? 'Ninguna oferta coincide' : 'Todavía no hay ofertas abiertas'}
          description={
            filtered
              ? 'Probá con otra tecnología o sacá el filtro de modalidad.'
              : '¿Tu empresa está buscando gente? Publicá la búsqueda y llegale a toda la comunidad.'
          }
          showRefresh={filtered}
          onRefresh={() => {
            setQuery('');
            setModality(null);
          }}
        />
      ) : (
        <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {visible.map((offer) => {
            const canChange = !!viewer && (viewer.isAdmin || viewer.id === offer.authorId);
            const facts = [
              label(JOB_MODALITIES, offer.modality),
              label(JOB_TYPES, offer.type),
              label(JOB_SENIORITIES, offer.seniority),
            ].filter(Boolean);
            return (
              <article key={offer.id} className={cn(ruledCellClassName, 'flex flex-col gap-3 p-4')}>
                <header className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-mono text-sm font-semibold">{offer.title}</h2>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3 shrink-0" aria-hidden />
                        {offer.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" aria-hidden />
                        {offer.location}
                      </span>
                    </p>
                  </div>
                  {canChange && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        aria-label={`Editar ${offer.title}`}
                        title="Editar"
                        onClick={() => setEditing(offer)}
                        className="text-muted-foreground hover:text-pcnGreen"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Marcar ${offer.title} como cubierta`}
                        title="Ya se cubrió: cerrarla"
                        onClick={() =>
                          run(
                            () => setJobOfferAvailable(offer.id, false),
                            'Oferta cerrada',
                            'No se pudo cerrar la oferta',
                          )
                        }
                        className="text-muted-foreground hover:text-pcnGreen"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar ${offer.title}`}
                        title="Eliminar"
                        onClick={() =>
                          run(
                            () => deleteJobOffer(offer.id),
                            'Oferta eliminada',
                            'No se pudo eliminar la oferta',
                          )
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </header>

                <p className="flex flex-wrap gap-1 font-mono text-[11px]">
                  {facts.map((fact) => (
                    <span
                      key={fact}
                      className="border border-pcnGreen-300 px-1.5 text-pcnGreen-800"
                    >
                      {fact}
                    </span>
                  ))}
                  {offer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-pcnGreen-200 px-1.5 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </p>

                <p className="line-clamp-6 text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">
                  {offer.description}
                </p>

                <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[11px] text-muted-foreground/80">
                  <span>
                    {offer.author && (
                      <Link href={`/perfil/${offer.author.id}`} className="hover:text-pcnGreen">
                        <span className="text-pcnGreen-500">@ </span>
                        {offer.author.name}
                      </Link>
                    )}{' '}
                    · {timeAgo(offer.createdAt)}
                  </span>
                  {offer.applyUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={applyHref(offer.applyUrl)} target="_blank" rel="noopener noreferrer">
                        postularme();
                        <ArrowUpRight className="ml-1 size-3.5" />
                      </a>
                    </Button>
                  )}
                </footer>
              </article>
            );
          })}
        </RuledGrid>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Publicar una oferta' : 'Editar oferta'}</DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <JobOfferForm
              offer={editing === 'new' ? undefined : toInput(editing)}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
