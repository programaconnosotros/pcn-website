import { CheckCircle2, Sparkles } from 'lucide-react';
import type { Specialty, SpecialtyListItem } from '@/components/especialidades/specialties';
import { cn } from '@/lib/utils';

const itemLabel = (item: SpecialtyListItem) => (typeof item === 'string' ? item : item.label);

export function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  const Icon = specialty.icon;

  return (
    <article
      id={specialty.id}
      className="scroll-mt-32 rounded-2xl border bg-card p-5 transition-colors hover:border-pcnPurple/40 dark:hover:border-pcnGreen/40 sm:p-7 lg:scroll-mt-28"
    >
      <header className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/40 dark:bg-pcnGreen/10 dark:shadow-[0_0_12px_rgba(4,244,190,0.25)]">
          <Icon className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-semibold tracking-tight">{specialty.title}</h3>
          <p className="mt-1.5 text-[15px] leading-7 text-muted-foreground">{specialty.summary}</p>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {specialty.sections.map((section) => {
          const twoColumns = section.items.every((item) => typeof item === 'string');
          return (
            <div key={section.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </h4>
              <ul className={cn('mt-3 grid gap-x-6 gap-y-2', twoColumns && 'sm:grid-cols-2')}>
                {section.items.map((item) => (
                  <li
                    key={itemLabel(item)}
                    className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-pcnPurple/70 dark:text-pcnGreen/70" />
                    <span>
                      {typeof item === 'string' ? (
                        item
                      ) : (
                        <>
                          <span className="font-medium text-foreground">{item.label}:</span>{' '}
                          {item.description}
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-pcnPurple/20 bg-pcnPurple/5 p-4 dark:border-pcnGreen/20 dark:bg-pcnGreen/5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pcnPurple dark:text-pcnGreen" />
        <div>
          <p className="text-sm font-semibold">¿Para quién es ideal?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{specialty.idealFor}</p>
        </div>
      </div>
    </article>
  );
}
