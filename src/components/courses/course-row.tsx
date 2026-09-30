import type { Course } from '@/app/(platform)/cursos/courses';
import { Badge } from '@/components/ui/badge';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ChevronRight, Globe, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, '');

export const CourseRow = ({ course, index }: { course: Course; index: number }) => {
  const isExternal = Boolean(course.websiteUrl);
  const videos = course.youtubeUrls?.length ?? 0;
  const Arrow = isExternal ? ArrowUpRight : ChevronRight;

  const content = (
    <>
      <div className="relative shrink-0 self-start">
        <div className="flex size-12 items-center justify-center rounded-sm bg-white p-1.5 ring-1 ring-pcnGreen-200 transition-[box-shadow] group-hover:shadow-[0_0_16px_-4px_rgba(4,244,190,0.7)] group-hover:ring-pcnGreen-600 sm:size-10 sm:p-1">
          {course.logo && (
            <Image
              src={course.logo}
              alt={`Logo de ${course.name}`}
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <span className="absolute -bottom-1.5 -right-1.5 rounded-sm border border-pcnGreen-200 bg-background px-1 font-mono text-[9px] tabular-nums leading-3 text-pcnGreen-600">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 font-mono text-base font-semibold leading-snug transition-colors group-hover:text-pcnGreen sm:text-sm">
            {course.name}
            {course.isMadeByCommunity && (
              <Badge className="ml-2 px-1.5 py-0 align-middle text-[10px]">pcn</Badge>
            )}
          </h3>
          <Arrow className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-pcnGreen sm:mt-0.5 sm:size-3.5" />
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:line-clamp-2 sm:text-xs">
          {course.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-xs text-muted-foreground/80 sm:text-[11px]">
          {isExternal ? (
            <span className="flex items-center gap-1.5 text-pcnGreen-700">
              <Globe className="size-3.5 sm:size-3" />
              {hostname(course.websiteUrl!)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-pcnGreen-700">
              <PlayCircle className="size-3.5 sm:size-3" />
              {videos} {videos === 1 ? 'video' : 'videos'}
              {course.hours ? (
                <span className="text-muted-foreground/60">· {course.hours}h</span>
              ) : null}
            </span>
          )}
          <span className="min-w-0 max-w-full truncate">
            <span className="text-pcnGreen-500">@ </span>
            {course.teachedBy}
          </span>
        </div>
      </div>
    </>
  );

  const className = cn(
    ruledCellClassName,
    'group flex gap-4 p-4 sm:gap-3 sm:p-3',
    'hover:shadow-[inset_2px_0_0_#04f4be] focus-visible:shadow-[inset_2px_0_0_#04f4be] focus-visible:outline-none',
  );

  return isExternal ? (
    <a href={course.websiteUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={`/cursos/${course.id}`} className={className}>
      {content}
    </Link>
  );
};
