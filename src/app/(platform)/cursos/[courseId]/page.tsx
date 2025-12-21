import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Heading2 } from '@/components/ui/heading-2';
import { getCourseById } from '../courses';

const Course = ({ params: { courseId } }: { params: { courseId: string } }) => {
  const course = getCourseById(courseId);

  if (!course) return <div>El curso no existe.</div>;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/cursos">Cursos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{course.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0">{course.name}</Heading2>
          </div>

          <div className="mt-6 px-12">
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
            <p className="mt-4 text-sm text-muted-foreground">
              Este curso no fue creado por un miembro de la comunidad, fue publicado gratuitamente
              en YouTube y nos parece de muy buena calidad, por lo cual lo recomendamos. Embebemos
              el curso aquí para que las ganancias y estadísticas de ver el video, sean para el
              autor original del curso.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Course;
