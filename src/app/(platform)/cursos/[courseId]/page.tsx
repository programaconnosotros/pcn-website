import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoursePlayer } from '@/components/courses/course-player';
import { PageTitle } from '@/components/ui/page-title';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { getCourseById } from '../courses';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await props.params;
  const course = getCourseById(courseId);

  if (!course) {
    return {
      title: 'Curso no encontrado',
      description: 'El curso que buscas no existe.',
    };
  }

  const title = course.name;
  const description =
    course.description.length > 160
      ? course.description.substring(0, 157) + '…'
      : course.description;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | programaConNosotros`,
      description,
      images: [`${SITE_URL}/pcn-link-preview.png`],
      url: `${SITE_URL}/cursos/${courseId}`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | programaConNosotros`,
      description,
      images: [`${SITE_URL}/pcn-link-preview.png`],
    },
  };
}

const Course = async (props: { params: Promise<{ courseId: string }> }) => {
  const params = await props.params;

  const { courseId } = params;

  const course = getCourseById(courseId);

  if (!course) return <div>El curso no existe.</div>;

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
          {course.teachedBy}
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
          <PageTitle
            path={`cursos/${course.id}`}
            meta={[
              course.websiteUrl ? 'interactivo' : `${course.hours}h`,
              course.isMadeByCommunity && 'hecho en pcn',
            ]
              .filter(Boolean)
              .join(' · ')}
          />

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
                      Ir al curso
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Course;
