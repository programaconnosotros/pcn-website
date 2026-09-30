import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { communityCourses, Course, externalCourses } from './courses';
import type { Metadata } from 'next';

const allCourses = [...communityCourses, ...externalCourses].sort((a, b) =>
  a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Cursos',
  description:
    'Una selección curada de cursos sobre ingeniería de software, recomendados por la comunidad. Recursos gratuitos y pagos para crecer en tu carrera.',
  openGraph: {
    title: 'Cursos recomendados | programaConNosotros',
    description:
      'Una selección curada de cursos sobre ingeniería de software, recomendados por la comunidad. Recursos gratuitos y pagos para crecer en tu carrera.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/cursos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursos recomendados | programaConNosotros',
    description:
      'Una selección curada de cursos sobre ingeniería de software, recomendados por la comunidad. Recursos gratuitos y pagos para crecer en tu carrera.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const formatHours = (hours?: number) => (hours ? `${hours}h` : '');

const CourseRow = ({ course }: { course: Course }) => {
  const content = (
    <>
      {course.logo && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-white p-1">
          <Image
            src={course.logo}
            alt={`Logo de ${course.name}`}
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-sm">
          <h2 className="truncate font-semibold group-hover:text-pcnGreen">{course.name}</h2>
          {course.isMadeByCommunity && <Badge className="px-1.5 py-0 text-[10px]">pcn</Badge>}
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            {course.websiteUrl ? 'web' : formatHours(course.hours)}
            {course.websiteUrl ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500">@ </span>
          {course.teachedBy}
        </p>
      </div>
    </>
  );

  const className = cn(ruledCellClassName, 'group flex gap-3 p-3');

  return course.websiteUrl ? (
    <a href={course.websiteUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={`/cursos/${course.id}`} className={className}>
      {content}
    </Link>
  );
};

const communityCount = allCourses.filter((course) => course.isMadeByCommunity).length;

const Courses = () => (
  <>
    <div className="flex flex-1 flex-col p-4 pt-0">
      <PageTitle
        path="cursos"
        className="mt-4"
        meta={`${allCourses.length} cursos · ${communityCount} hechos en pcn`}
      />

      <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {allCourses.map((course) => (
          <CourseRow key={course.id} course={course} />
        ))}
      </RuledGrid>
    </div>
  </>
);

export default Courses;
