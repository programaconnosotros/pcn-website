import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getCourseById } from '../courses';

const Course = ({ params: { courseId } }: { params: { courseId: string } }) => {
  const course = getCourseById(courseId);

  if (!course) return <div>El curso no existe.</div>;

  return (
    <div className="mt-4 md:px-20">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Cursos</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{course.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Heading2>{course.name}</Heading2>

      <div className="mt-12 pr-20">
        <Carousel>
          <CarouselContent>
            {course.youtubeUrls.map((classUrl) => (
              <CarouselItem key={classUrl}>
                <div className="w-full" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    className="h-full w-full"
                    src={classUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {course.youtubeUrls.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </div>

      {!course.isMadeByCommunity && (
        <p className="mt-4 text-sm text-muted-foreground md:mr-36">
          Este curso no fue creado por un miembro de la comunidad, fue publicado gratuitamente en
          YouTube y nos parece de muy buena calidad, por lo cual lo recomendamos. Embebemos el curso
          aquí para que las ganancias y estadísticas de ver el video, sean para el autor original
          del curso.
        </p>
      )}
    </div>
  );
};

export default Course;
