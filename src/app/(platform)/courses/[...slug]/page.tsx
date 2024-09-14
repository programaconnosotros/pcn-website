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
import { getCourseBySlug } from '../courses';

const Course = ({ params: { slug } }: { params: { slug: string[] } }) => {
  const course = getCourseBySlug(slug[0]);

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
    </div>
  );
};

export default Course;
