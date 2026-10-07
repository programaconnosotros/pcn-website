import { ArrowUpRight, Library } from 'lucide-react';
import { learningPlatforms } from '@/data/recommended-courses';

/** Platforms the community recommends for going deeper than a single course. */
export function LearningPlatforms() {
  return (
    <section aria-labelledby="plataformas" className="mb-14 mt-8">
      <h2
        id="plataformas"
        className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-pcnGreen-600"
      >
        <span className="text-pcnGreen-300">{'// '}</span>
        para ir más a fondo
      </h2>
      <ul className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
        {learningPlatforms.map((platform) => (
          <li key={platform.name}>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 p-4 transition-colors hover:bg-pcnGreen/[0.04] sm:flex-row sm:items-center"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-300 bg-pcnGreen/5">
                <Library className="size-5 text-pcnGreen" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2 font-mono text-sm font-semibold group-hover:text-pcnGreen">
                  {platform.name}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {platform.pricing}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {platform.description}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {platform.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-sm border border-pcnGreen-200 px-1.5 py-0.5 text-pcnGreen-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-pcnGreen">
                visitar <ArrowUpRight className="size-3.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
