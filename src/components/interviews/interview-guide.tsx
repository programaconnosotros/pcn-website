'use client';

import {
  guideSectionKey,
  type InterviewGuide as Guide,
} from '@/app/(platform)/entrevistas/guias/guides/types';
import { renderInlineCode } from '@/components/interviews/inline-code';
import { GuideProgressBar } from '@/components/interviews/guide-progress-bar';
import { MarkToggle } from '@/components/ui/mark-toggle';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { TableOfContents } from '@/components/ui/table-of-contents';
import { useContentMarks } from '@/hooks/use-content-marks';
import { cn } from '@/lib/utils';
import { ArrowRight, BookCheck, Check } from 'lucide-react';
import Link from 'next/link';

interface InterviewGuideProps {
  guide: Guide;
  label: string;
  stack: string;
}

/** A preparation guide read section by section; each section can be marked as read. */
export function InterviewGuide({ guide, label, stack }: InterviewGuideProps) {
  const marks = useContentMarks('interview-guide');
  const readIds = marks.ids('read');
  const isRead = (sectionId: string) => readIds.has(guideSectionKey(guide.track, sectionId));
  const readCount = guide.sections.filter(({ id }) => isRead(id)).length;
  const total = guide.sections.length;

  // Marking a section as read from its footer jumps to the next unread one.
  const markReadAndContinue = (index: number) => {
    const { id } = guide.sections[index];
    if (!isRead(id)) marks.toggle(guideSectionKey(guide.track, id), 'read');
    if (!marks.isAuthenticated) return;
    const next = guide.sections.find((section, i) => i > index && !isRead(section.id));
    if (next) document.getElementById(next.id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <StickyHeader pinnedOnDesktop>
        <PageTitle
          path={[
            { label: 'entrevistas', href: '/entrevistas' },
            { label: 'guias', href: '/entrevistas/guias' },
            { label: guide.track },
          ]}
          meta={
            <span className="tabular-nums">
              {readCount}/{total} leídas
            </span>
          }
          action={
            <Link
              href={`/entrevistas?tipo=${guide.track}`}
              className="inline-flex items-center gap-1.5 border border-pcnGreen bg-pcnGreen/15 px-3 py-1.5 font-mono text-xs lowercase text-pcnGreen transition-colors hover:bg-pcnGreen/25"
            >
              simular entrevista
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </StickyHeader>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <TableOfContents
          path={`entrevistas/guias/${guide.track}`}
          sections={guide.sections.map(({ id, title }) => ({
            id,
            title,
            meta: isRead(id) ? '✓' : undefined,
          }))}
        />

        <div className="mb-14 min-w-0 flex-1">
          <div className="mx-auto max-w-3xl">
            <header className="mb-4 mt-4 font-mono">
              <h2 className="text-lg font-semibold">
                <span className="text-pcnGreen-500"># </span>
                {label}
              </h2>
              <p className="text-xs text-muted-foreground">{stack}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>
              <GuideProgressBar read={readCount} total={total} className="mt-4" />
              {!marks.isLoading && !marks.isAuthenticated && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  <Link
                    href="/autenticacion/iniciar-sesion"
                    className="text-pcnGreen hover:underline"
                  >
                    iniciá sesión
                  </Link>{' '}
                  para marcar las secciones como leídas y guardar tu progreso
                </p>
              )}
            </header>

            <div className="border border-pcnGreen-200">
              {guide.sections.map((section, index) => {
                const read = isRead(section.id);
                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-32 border-b border-pcnGreen-200 p-4 last:border-b-0 lg:scroll-mt-[calc(var(--sticky-header-offset,0px)+1rem)]"
                  >
                    <div className="flex items-start gap-3">
                      <h3 className="flex-1 font-mono text-base font-semibold tracking-tight">
                        <span className="text-pcnGreen-500">
                          {String(index + 1).padStart(2, '0')}{' '}
                        </span>
                        <span className={cn(read && 'text-muted-foreground')}>{section.title}</span>
                      </h3>
                      <MarkToggle
                        active={read}
                        onToggle={() =>
                          marks.toggle(guideSectionKey(guide.track, section.id), 'read')
                        }
                        icon={BookCheck}
                        label="leída"
                        title={read ? 'Desmarcar como leída' : 'Marcar como leída'}
                        className="mt-0.5"
                      />
                    </div>

                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                      {section.body.map((paragraph, i) => (
                        <p key={i}>{renderInlineCode(paragraph)}</p>
                      ))}
                    </div>

                    <div className="mt-4 border-l-2 border-pcnGreen-500 pl-4">
                      <p className="mb-1.5 font-mono text-xs text-pcnGreen-500">
                        # antes de la entrevista, sabé:
                      </p>
                      <ul className="space-y-1 text-sm">
                        {section.checklist.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="shrink-0 font-mono text-pcnGreen-500/70">-</span>
                            <span>{renderInlineCode(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!read && (
                      <button
                        type="button"
                        onClick={() => markReadAndContinue(index)}
                        className="mt-4 inline-flex items-center gap-1.5 border border-pcnGreen-200 bg-black/40 px-3 py-1.5 font-mono text-xs lowercase text-muted-foreground transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
                      >
                        <Check className="size-3.5" />
                        {index < total - 1 ? 'marcar como leída y seguir' : 'marcar como leída'}
                      </button>
                    )}
                  </section>
                );
              })}
            </div>

            {readCount === total && (
              <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="text-pcnGreen">guía completa. ahora ponete a prueba:</span>
                <Link
                  href={`/entrevistas?tipo=${guide.track}`}
                  className="inline-flex items-center gap-1.5 border border-pcnGreen bg-pcnGreen/15 px-3 py-1.5 lowercase text-pcnGreen transition-colors hover:bg-pcnGreen/25"
                >
                  simular entrevista
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
