import type { Specialty, SpecialtyListItem } from '@/components/especialidades/specialties';
import { cn } from '@/lib/utils';

const itemLabel = (item: SpecialtyListItem) => (typeof item === 'string' ? item : item.label);

export function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  const Icon = specialty.icon;

  return (
    <article
      id={specialty.id}
      className="scroll-mt-32 p-4 lg:scroll-mt-[calc(var(--sticky-header-offset,0px)+1rem)]"
    >
      <header className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-300 bg-pcnGreen/5">
          <Icon className="h-4 w-4 text-pcnGreen" />
        </div>
        <div className="min-w-0">
          <h3 className="font-mono text-base font-semibold tracking-tight">{specialty.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{specialty.summary}</p>
        </div>
      </header>

      <div className="mt-4 space-y-4">
        {specialty.sections.map((section) => {
          const twoColumns = section.items.every((item) => typeof item === 'string');
          return (
            <div key={section.heading}>
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </h4>
              <ul className={cn('mt-2 grid gap-x-6 gap-y-1', twoColumns && 'sm:grid-cols-2')}>
                {section.items.map((item) => (
                  <li
                    key={itemLabel(item)}
                    className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                  >
                    <span className="shrink-0 font-mono text-pcnGreen-500">›</span>
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

      <p className="mt-4 border-t border-dashed border-pcnGreen-200 pt-3 text-sm leading-6 text-muted-foreground">
        <span className="font-mono text-pcnGreen">&gt; ideal para: </span>
        {specialty.idealFor}
      </p>
    </article>
  );
}
