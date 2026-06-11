import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ExternalLink, Laptop, TvMinimalPlay } from 'lucide-react';
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

const CourseCard = ({ course }: { course: Course }) => {
  const ViewButton = () =>
    course.websiteUrl ? (
      <a href={course.websiteUrl} target="_blank" rel="noopener noreferrer" className="w-full">
        <Button className="flex w-full flex-row items-center gap-2">
          Ver curso
          <ExternalLink className="h-5 w-5" />
        </Button>
      </a>
    ) : (
      <Link href={`/cursos/${course.id}`} className="w-full">
        <Button className="flex w-full flex-row items-center gap-2">
          Ver curso
          <TvMinimalPlay className="h-5 w-5" />
        </Button>
      </Link>
    );

  return (
    <Card className="flex flex-col justify-between border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 md:min-h-[320px]">
      <div>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            {course.logo && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5 dark:bg-neutral-100">
                <Image
                  src={course.logo}
                  alt={`Logo de ${course.name}`}
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <CardTitle>{course.name}</CardTitle>
            {course.isMadeByCommunity && (
              <Badge className="border-pcnPurple/30 bg-pcnPurple/10 text-pcnPurple dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:text-pcnGreen">
                Made in PCN
              </Badge>
            )}
          </div>

          <div className="shrink-0">
            {course.websiteUrl ? (
              <Badge variant="outline">Interactivo</Badge>
            ) : (
              <Badge variant="outline">
                {course.hours} {course.hours === 1 ? 'hora' : 'horas'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-2 flex flex-1 flex-col text-sm">
          {course.description}
        </CardContent>
      </div>

      <CardFooter className="flex flex-col items-center gap-4">
        <ViewButton />
        <p className="text-xs text-muted-foreground">Curso dictado por {course.teachedBy}.</p>
      </CardFooter>
    </Card>
  );
};

const Courses = () => (
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
            <BreadcrumbItem>
              <BreadcrumbPage>Cursos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex w-full flex-row items-center justify-between">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <Laptop className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Cursos</span>
            </Heading2>
          </div>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {allCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  </>
);

export default Courses;
