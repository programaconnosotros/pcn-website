'use client';

import type { Course } from '@/app/(platform)/cursos/courses';
import { CourseRow } from '@/components/courses/course-row';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { StickyHeader } from '@/components/ui/sticky-header';
import { cn } from '@/lib/utils';
import { useMemo, useState, type ReactNode } from 'react';

type Filter = 'all' | 'pcn' | 'video' | 'web';

const FILTERS: { value: Filter; flag: string; matches: (_course: Course) => boolean }[] = [
  { value: 'all', flag: '--all', matches: () => true },
  { value: 'pcn', flag: '--pcn', matches: (course) => course.isMadeByCommunity },
  { value: 'video', flag: '--video', matches: (course) => Boolean(course.youtubeUrls?.length) },
  { value: 'web', flag: '--web', matches: (course) => Boolean(course.websiteUrl) },
];

// Accent-insensitive, so "latex" finds "LaTeX" and "agustin" finds "Agustín".
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const byName = (a: Course, b: Course) =>
  a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });

const SectionHeading = ({ label, count }: { label: string; count: number }) => (
  <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-pcnGreen-500">
    <span className="text-pcnGreen-500/60">#</span>
    {label}
    <span className="text-muted-foreground/60">({count})</span>
    <span className="h-px flex-1 bg-pcnGreen-200" />
  </h2>
);

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className="flex flex-col gap-0.5 border-b border-r border-pcnGreen-200 px-3 py-2.5 sm:px-4">
    <span className="font-mono text-xl font-semibold tabular-nums text-pcnGreen sm:text-2xl">
      {value}
    </span>
    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  </div>
);

export const CoursesBrowser = ({ header, courses }: { header: ReactNode; courses: Course[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const stats = useMemo(
    () => ({
      hours: courses.reduce((total, course) => total + (course.hours ?? 0), 0),
      videos: courses.reduce((total, course) => total + (course.youtubeUrls?.length ?? 0), 0),
      community: courses.filter((course) => course.isMadeByCommunity).length,
    }),
    [courses],
  );

  const visible = useMemo(() => {
    const query = normalize(searchQuery.trim());
    const matchesFilter = FILTERS.find((f) => f.value === filter)!.matches;
    return courses
      .filter(matchesFilter)
      .filter(
        (course) =>
          !query ||
          normalize(`${course.name} ${course.description} ${course.teachedBy}`).includes(query),
      )
      .sort(byName);
  }, [courses, filter, searchQuery]);

  const sections = [
    { label: 'hechos en pcn', courses: visible.filter((course) => course.isMadeByCommunity) },
    { label: 'recomendados', courses: visible.filter((course) => !course.isMadeByCommunity) },
  ].filter((section) => section.courses.length > 0);

  return (
    <div className="mb-14">
      <StickyHeader>
        {header}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="curso, tema o autor"
            label="Buscar cursos"
            className="sm:max-w-sm"
          />
          {/* Flags scroll sideways on phones instead of wrapping into a second row. */}
          <div
            aria-label="Filtrar cursos"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            {FILTERS.map(({ value, flag, matches }) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'flex h-8 shrink-0 items-center gap-1.5 rounded-sm border px-3 font-mono text-xs transition-colors',
                    active
                      ? 'border-pcnGreen-600 bg-pcnGreen-100 text-pcnGreen'
                      : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-400 hover:text-foreground',
                  )}
                >
                  {flag}
                  <span className="text-[10px] tabular-nums opacity-60">
                    {courses.filter(matches).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </StickyHeader>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 border-l border-t border-pcnGreen-200 sm:grid-cols-4">
          <Stat value={courses.length} label="cursos" />
          <Stat value={`${stats.hours}h`} label="de contenido" />
          <Stat value={stats.videos} label="videos" />
          <Stat value={stats.community} label="hechos en pcn" />
        </div>

        {sections.length > 0 ? (
          sections.map((section) => (
            <section key={section.label}>
              <SectionHeading label={section.label} count={section.courses.length} />
              <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {section.courses.map((course, i) => (
                  <CourseRow key={course.id} course={course} index={i} />
                ))}
              </RuledGrid>
            </section>
          ))
        ) : (
          <div className="border border-dashed border-pcnGreen-200 px-4 py-6 font-mono text-xs leading-relaxed text-muted-foreground">
            <p>
              <span className="text-pcnGreen-500">$ </span>grep: sin resultados para &quot;
              <span className="text-foreground">{searchQuery}</span>&quot;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="mt-2 text-pcnGreen-600 underline-offset-4 hover:text-pcnGreen hover:underline"
            >
              limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
