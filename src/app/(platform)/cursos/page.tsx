import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
import { Send, TvMinimalPlay } from 'lucide-react';
import Link from 'next/link';
import { communityCourses, Course, externalCourses } from './courses';

const AddCourseCard = () => (
  <Card className="flex flex-col justify-between bg-neutral-100 dark:bg-neutral-900">
    <div>
      <CardHeader>
        <CardTitle>¿Quéres sumar tu curso?</CardTitle>
      </CardHeader>

      <CardContent className="text-sm">
        Si querés sumar tu curso a esta página para que puedan verlo todos los miembros de la
        comunidad, contactanos clickeando el botón de abajo!
      </CardContent>
    </div>

    <CardFooter className="flex flex-row justify-between gap-4">
      <Link className="block" href="https://wa.me/5493815777562">
        <Button className="mt-4 flex flex-row items-center gap-2">
          Contactar
          <Send className="h-5 w-5" />
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

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
    <Card className="flex flex-col justify-between md:min-h-[320px]">
      <div>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{course.name}</CardTitle>

          <Badge variant="outline">
            {course.hours} {course.hours === 1 ? 'hora' : 'horas'}
          </Badge>
        </CardHeader>

        <CardContent className="text-sm">{course.description}</CardContent>
      </div>

      <CardFooter className="flex flex-col items-center gap-4">
        <ViewButton />
        <p className="text-xs text-muted-foreground">Curso dictado por {course.teachedBy}.</p>
      </CardFooter>
    </Card>
  );
};

const Courses = () => (
  <div className="mt-4 md:px-20">
    <Heading2>Cursos</Heading2>

    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {communityCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}

      <AddCourseCard />
    </div>

    <Heading3 className="mt-12">Cursos externos recomendados</Heading3>

    <div className="mb-14 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {externalCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  </div>
);

export default Courses;
