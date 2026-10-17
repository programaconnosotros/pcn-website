import Link from 'next/link';
import type { Specialty, SpecialtyListItem } from '@/components/especialidades/specialties';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Specialist } from '@/lib/specialists';
import { cn } from '@/lib/utils';

/** How many specialists the card lists before "+N". */
const SPECIALISTS_SHOWN = 8;

const firstName = (name: string) => name.split(' ')[0] ?? name;

/** Who in the community works in this specialty, linked to their profiles to reach them. */
function Specialists({ specialists }: { specialists: Specialist[] }) {
  const shown = specialists.slice(0, SPECIALISTS_SHOWN);
  const rest = specialists.length - shown.length;

  return (
    <div className="mt-3 border-t border-dashed border-pcnGreen-200 pt-3">
      <p className="mb-2 font-mono text-[11px] text-muted-foreground">
        <span className="text-pcnGreen">&gt; en la comunidad </span>
        {specialists.length > 0 ? (
          <span className="tabular-nums">[{specialists.length}]</span>
        ) : (
          <span>· nadie todavía</span>
        )}
      </p>
      {specialists.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {shown.map((person) => (
            <li key={person.id}>
              <Link
                href={`/perfil/${person.id}`}
                title={
                  person.explicit
                    ? `${person.name}: se marcó como especialista`
                    : `${person.name}: por su puesto actual`
                }
                className="group/person flex h-7 items-center gap-1.5 rounded-sm border border-pcnGreen-200 pr-2 pl-0.5 font-mono text-[11px] text-foreground/80 transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen"
              >
                <Avatar className="size-5 rounded-sm">
                  <AvatarImage src={person.image ?? undefined} alt="" />
                  <AvatarFallback className="rounded-sm text-[9px]">
                    {person.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {firstName(person.name)}
                {person.explicit && (
                  <span aria-hidden className="text-pcnGreen-500">
                    ✓
                  </span>
                )}
              </Link>
            </li>
          ))}
          {rest > 0 && (
            <li className="flex h-7 items-center px-1 font-mono text-[11px] text-muted-foreground">
              +{rest} más
            </li>
          )}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          ¿Trabajás en esto?{' '}
          <Link href="/perfil#especialidades" className="text-pcnGreen hover:underline">
            Marcalo en tu perfil
          </Link>{' '}
          y aparecés acá para que te contacten.
        </p>
      )}
    </div>
  );
}

const itemLabel = (item: SpecialtyListItem) => (typeof item === 'string' ? item : item.label);

export function SpecialtyCard({
  specialty,
  specialists,
}: {
  specialty: Specialty;
  /** Members working in it; leave it out to skip the row. */
  specialists?: Specialist[];
}) {
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
              <h4 className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
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

      {specialists && <Specialists specialists={specialists} />}
    </article>
  );
}
