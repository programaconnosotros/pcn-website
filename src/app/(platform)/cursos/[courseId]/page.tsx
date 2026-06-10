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
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
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

          <div className={`mt-6${course.youtubeUrls.length > 1 ? ' px-12' : ''}`}>
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

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle>Descripción</CardTitle>
                {course.isMadeByCommunity && (
                  <Badge className="border-pcnPurple/30 bg-pcnPurple/10 text-pcnPurple dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:text-pcnGreen">
                    Made in PCN
                  </Badge>
                )}
              </div>
              <div className="shrink-0">
                <Badge variant="outline">
                  {course.hours} {course.hours === 1 ? 'hora' : 'horas'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm">{course.description}</CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Dictado por {course.teachedBy}
            </CardFooter>
          </Card>

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
