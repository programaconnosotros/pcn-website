import { ENDPOINT_TRAININGS_URL, type RecommendedCourse } from '@/data/recommended-courses';
import { InterviewsPanel } from '@/components/interviews/interviews-layout';
import { ArrowUpRight, GraduationCap } from 'lucide-react';

/** Courses from our partners that go deeper on what a guide covers. */
export const RecommendedCourses = ({
  courses,
  className,
}: {
  courses: RecommendedCourse[];
  className?: string;
}) => (
  <InterviewsPanel command="cursos --recomendados" meta="partner" className={className}>
    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
      Para profundizar con práctica guiada, te recomendamos los cursos de{' '}
      <span className="text-pcnGreen">{courses[0]?.provider}</span>, partner de la comunidad.
    </p>
    <ul className="space-y-2">
      {courses.map((course) => (
        <li key={course.url}>
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 border border-pcnGreen-200 p-2 transition-colors hover:border-pcnGreen-500 hover:bg-pcnGreen/[0.04]"
          >
            <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-pcnGreen-500" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-xs font-semibold group-hover:text-pcnGreen">{course.name}</span>
              <span className="text-[11px] text-muted-foreground">{course.description}</span>
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-pcnGreen">
              inscribirme
              <ArrowUpRight className="size-3" />
            </span>
          </a>
        </li>
      ))}
    </ul>
    <a
      href={ENDPOINT_TRAININGS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-pcnGreen"
    >
      ver todas sus capacitaciones
      <ArrowUpRight className="size-3" />
    </a>
  </InterviewsPanel>
);
