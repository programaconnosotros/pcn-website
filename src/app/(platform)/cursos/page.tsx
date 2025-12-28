import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
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
import { TvMinimalPlay } from 'lucide-react';
import Link from 'next/link';
import { communityCourses, Course, externalCourses } from './courses';

const CourseCard = ({ course }: { course: Course }) => {
  const ViewButton = () => (
    <Link href={`/cursos/${course.id}`} className="w-full">
      <Button className="flex w-full flex-row items-center gap-2">
        Ver curso
        <TvMinimalPlay className="h-5 w-5" />
      </Button>
    </Link>
  );

  return (
    <Card className="flex flex-col justify-between border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20 md:min-h-[320px]">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{course.name}</CardTitle>

          <Badge variant="outline">
            {course.hours} {course.hours === 1 ? 'hora' : 'horas'}
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col text-sm">{course.description}</CardContent>
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
            <Heading2 className="m-0">Cursos</Heading2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {communityCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <Heading3 className="mt-12">Cursos externos recomendados</Heading3>

        <div className="mb-14 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {externalCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  </>
);

export default Courses;
