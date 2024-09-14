import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Send, TvMinimalPlay } from 'lucide-react';
import { Heading3 } from '@/components/ui/heading-3';
import { communityCourses, Course, externalCourses } from './courses';

const CourseCard = ({ course }: { course: Course }) => {
  const ViewButton = () => (
    <Link href={`/courses/${course.slug}`}>
      <Button className="flex flex-row items-center gap-2">
        Ver curso
        <TvMinimalPlay className="h-5 w-5" />
      </Button>
    </Link>
  );

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-row justify-between gap-4">
        <ViewButton />
        <p className="text-sm text-muted-foreground">Curso dictado por {course.teachedBy}.</p>
      </CardFooter>
    </Card>
  );
};

const Courses = () => {
  return (
    <div className="mt-4 md:px-20">
      <Heading2>Cursos</Heading2>

      <Heading3 className="mt-4">Realizados por la comunidad</Heading3>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {communityCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>¿Quéres sumar tu curso aquí?</CardTitle>

            <CardDescription>
              Si querés sumar tu curso a esta página para que puedan verlo todos los miembros de la
              comunidad, contactanos clickeando el botón de abajo!
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <Link className="block" href="https://wa.me/5493815777562">
              <Button className="mt-4 flex flex-row items-center gap-2">
                Contactar
                <Send className="h-5 w-5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Heading3 className="mt-12">Cursos externos sugeridos por la comunidad</Heading3>

      <div className="mb-14 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {externalCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;
