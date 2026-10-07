import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { technologyTimelines, type Stance } from '@/data/opiniones-tecnologia';
import { cn } from '@/lib/utils';
import { tabTitle } from '@/lib/tab-title';

const DESCRIPTION =
  'Cómo cambió lo que piensa el grupo de cada tecnología: una línea de tiempo armada a partir de sus conversaciones.';

export const metadata: Metadata = {
  title: tabTitle.ls('conversaciones/opiniones'),
  description: DESCRIPTION,
};

const STANCE: Record<Stance, { label: string; dot: string; text: string }> = {
  positiva: { label: 'a favor', dot: 'bg-pcnGreen', text: 'text-pcnGreen' },
  mixta: { label: 'dividido', dot: 'bg-amber-400', text: 'text-amber-400' },
  negativa: { label: 'en contra', dot: 'bg-red-400', text: 'text-red-400' },
};

const monthYear = new Intl.DateTimeFormat('es-AR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** The stances of a timeline as a strip of colored ticks, oldest to newest. */
const StanceStrip = ({ stances }: { stances: Stance[] }) => (
  <span className="flex h-2 gap-px" aria-hidden>
    {stances.map((stance, i) => (
      <span key={i} className={cn('w-1.5', STANCE[stance].dot)} />
    ))}
  </span>
);

// /conversaciones/opiniones: one timeline per technology the group keeps coming back to.
export default function OpinionsPage() {
  const timelines = technologyTimelines.filter(({ opinions }) => opinions.length > 0);
  const total = timelines.reduce((sum, { opinions }) => sum + opinions.length, 0);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'conversaciones', href: '/conversaciones' }, { label: 'opiniones' }]}
            meta={`${timelines.length} tecnologías · ${total} momentos · lo que opinó el grupo`}
          />
        </StickyHeader>

        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          {DESCRIPTION} Son opiniones del grupo en conjunto, resumidas de cada conversación: nunca
          de una persona.
        </p>

        <nav aria-label="Tecnologías" className="mb-8 flex flex-wrap gap-1.5 font-mono text-xs">
          {timelines.map(({ slug, name, opinions }) => (
            <a
              key={slug}
              href={`#${slug}`}
              className="flex items-center gap-2 border border-pcnGreen-200 px-2 py-1 text-muted-foreground transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen"
            >
              {name}
              <StanceStrip stances={opinions.map(({ stance }) => stance)} />
            </a>
          ))}
        </nav>

        <div className="mb-14 grid gap-6 xl:grid-cols-2">
          {timelines.map(({ slug, name, summary, opinions }) => (
            <section
              key={slug}
              id={slug}
              aria-labelledby={`${slug}-title`}
              className="scroll-mt-20 border border-pcnGreen-200"
            >
              <header className="border-b border-dashed border-pcnGreen-200 p-4">
                <h2 id={`${slug}-title`} className="text-base font-semibold text-foreground">
                  {name}
                </h2>
                <p className="font-mono text-[11px] text-pcnGreen-600">$ git log --{slug}</p>
                <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
              </header>
              <ol className="relative p-4 pl-8">
                <span
                  aria-hidden
                  className="absolute bottom-6 left-[1.1rem] top-6 w-px bg-pcnGreen-200"
                />
                {opinions.map((opinion) => (
                  <li key={`${opinion.date}-${opinion.text}`} className="relative pb-4 last:pb-0">
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -left-[0.9rem] top-1.5 size-2.5 ring-4 ring-background',
                        STANCE[opinion.stance].dot,
                      )}
                    />
                    <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] text-muted-foreground">
                      <time dateTime={opinion.date}>
                        {monthYear.format(new Date(`${opinion.date}T12:00:00Z`))}
                      </time>
                      <span className={STANCE[opinion.stance].text}>
                        {STANCE[opinion.stance].label}
                      </span>
                      <Link
                        href={opinion.conversation.href}
                        title={`«${opinion.conversation.title}»`}
                        className="text-pcnGreen-600 underline decoration-dotted underline-offset-2 hover:text-pcnGreen"
                      >
                        #{opinion.conversation.hash}
                      </Link>
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
                      {opinion.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
