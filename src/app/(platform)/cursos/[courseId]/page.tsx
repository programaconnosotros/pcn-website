import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoursePlayer } from '@/components/courses/course-player';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { communityCourses, courseTeachers, externalCourses, getCourseById } from '../courses';
import { getIdentityMap } from '@/lib/identity-links';
import Link from 'next/link';
import { Fragment } from 'react';
import { articles } from '../../lectura/articles';
import { CourseRow } from '@/components/courses/course-row';
import { RelatedArticles } from '@/components/courses/related-articles';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { rankRelated } from '@/lib/related';
import type { Metadata } from 'next';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await props.params;
  const course = getCourseById(courseId);

  if (!course) {
    return {
      title: { absolute: MISSING_TAB_TITLE },
      description: 'El curso que buscas no existe.',
    };
  }

  const title = course.name;
  const description =
    course.description.length > 160
      ? course.description.substring(0, 157) + '…'
      : course.description;

  return {
    title: tabTitle.cat('cursos', course.name),
    description,
    openGraph: {
      title: `${title} | programaConNosotros`,
      description,
      url: `${SITE_URL}/cursos/${courseId}`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | programaConNosotros`,
      description,
    },
  };
}

const RELATED_COURSES = 3;
const RELATED_ARTICLES = 3;

const courseText = (course: { name: string; description: string }) =>
  `${course.name} ${course.description}`;

const SectionHeading = ({ command, label }: { command: string; label: string }) => (
  <h2 className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-pcnGreen-500 uppercase">
    <span className="text-pcnGreen/60">#</span>
    {label}
    <span className="tracking-normal text-muted-foreground/60 normal-case">{command}</span>
    <span className="h-px flex-1 bg-pcnGreen-200" />
  </h2>
);

const Course = async (props: { params: Promise<{ courseId: string }> }) => {
  const params = await props.params;

  const { courseId } = params;

  const course = getCourseById(courseId);

  if (!course) return <div>El curso no existe.</div>;

  // Teachers who are platform users, linked in /vinculos.
  const teacherProfiles = await getIdentityMap('cursos');

  // Community courses first, then the newest, so ties in relevance favor what we made.
  const otherCourses = [...communityCourses, ...externalCourses]
    .filter((other) => other.id !== course.id)
    .sort(
      (a, b) =>
        Number(b.isMadeByCommunity) - Number(a.isMadeByCommunity) ||
        b.date.getTime() - a.date.getTime(),
    );
  const relatedCourses = rankRelated(courseText(course), otherCourses, courseText).slice(
    0,
    RELATED_COURSES,
  );
  const relatedArticles = rankRelated(
    courseText(course),
    [...articles].sort((a, b) => b.date.localeCompare(a.date)),
    (article) => `${article.title} ${article.description} ${article.category}`,
  ).slice(0, RELATED_ARTICLES);

  const info = (
    <section className="flex gap-3 p-4">
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
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-sm">
          <h2 className="font-semibold">{course.name}</h2>
          {course.isMadeByCommunity && <Badge className="px-1.5 py-0 text-[10px]">pcn</Badge>}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{course.description}</p>
        <p className="font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500">@ </span>
          {courseTeachers(course).some((name) => teacherProfiles[name])
            ? courseTeachers(course).map((name, index) => (
                <Fragment key={name}>
                  {index > 0 && ', '}
                  {teacherProfiles[name] ? (
                    <Link
                      href={`/perfil/${teacherProfiles[name].id}`}
                      className="text-pcnGreen-700 underline-offset-2 hover:text-pcnGreen hover:underline"
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </Fragment>
              ))
            : course.teachedBy}
        </p>
      </div>
    </section>
  );

  const disclaimer = !course.isMadeByCommunity && (
    <p className="p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
      <span className="text-pcnGreen-500"># </span>
      Este curso no fue creado por un miembro de la comunidad, fue publicado gratuitamente en
      YouTube y nos parece de muy buena calidad, por lo cual lo recomendamos. Embebemos el curso
      aquí para que las ganancias y estadísticas de ver el video, sean para el autor original del
      curso.
    </p>
  );

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle
              path={`cursos/${course.id}`}
              meta={[
                course.websiteUrl ? 'interactivo' : `${course.hours}h`,
                course.isMadeByCommunity && 'hecho en pcn',
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          </StickyHeader>

          {course.youtubeUrls && course.youtubeUrls.length > 0 ? (
            <CoursePlayer videoUrls={course.youtubeUrls}>
              {info}
              {disclaimer}
            </CoursePlayer>
          ) : (
            <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
              {info}
              {course.websiteUrl && (
                <div className="p-4">
                  <a href={course.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="flex flex-row items-center gap-2">
                      irAlCurso();
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}

          <section className="mt-10">
            <SectionHeading label="seguí aprendiendo" command="ls ../cursos | sort -r" />
            <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
              {relatedCourses.map((related, index) => (
                <CourseRow key={related.id} course={related} index={index} />
              ))}
            </RuledGrid>
          </section>

          <section className="mt-8 mb-14">
            <SectionHeading label="para leer" command="cat ~/lectura/articulos" />
            <RelatedArticles articles={relatedArticles} />
          </section>
        </div>
      </div>
    </>
  );
};

export default Course;
