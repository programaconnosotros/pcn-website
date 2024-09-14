import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Send, TvMinimalPlay } from 'lucide-react';
import { Heading3 } from '@/components/ui/heading-3';
import { communityCourses } from './[...slug]/courses';

const Courses = () => {
  const ViewButton = ({ href }: { href: string }) => (
    <Link href={href}>
      <Button className="flex flex-row items-center gap-2">
        Ver curso
        <TvMinimalPlay className="h-5 w-5" />
      </Button>
    </Link>
  );

  return (
    <div className="mt-4 md:px-20">
      <Heading2>Cursos</Heading2>

      <Heading3 className="mt-4">Realizados por la comunidad</Heading3>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {communityCourses.map((course) => (
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-row justify-between gap-4">
              <ViewButton href={`/courses/${course.slug}`} />
              <p className="text-sm text-muted-foreground">Curso dictado por {course.teachedBy}.</p>
            </CardFooter>
          </Card>
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
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>HTML & CSS</CardTitle>

            <CardDescription>
              HTML y CSS son los lenguajes que nos permiten crear las páginas web que usamos todos
              los días. Este curso es una excelente introducción a estos lenguajes, y está
              recomendado para todos aquellos que quieran aprender a crear sus propias páginas web.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <ViewButton href="/courses/html-and-css" />

            <p className="text-sm text-muted-foreground">Curso dictado por Dalto.</p>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>JavaScript</CardTitle>

            <CardDescription>
              JavaScript es el lenguaje de programación más utilizado en el mundo, y es fundamental
              para cualquier desarrollador web. Este curso es una excelente introducción a este
              lenguaje, y está recomendado para todos aquellos que quieran aprender a programar.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <ViewButton href="/courses/javascript" />
            <p className="text-sm text-muted-foreground">Curso dictado por Dalto.</p>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Desarrollo web con Python y JavaScript</CardTitle>

            <CardDescription>
              Este curso fue dictado en Harvard y es una buena introducción a diferentes fundamentos
              de desarrollo web, aplicados con Python y JavaScript.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <ViewButton href="/courses/web-programming-with-python-and-js" />
            <p className="text-sm text-muted-foreground">Curso dictado por Hardvard CS50.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Courses;
