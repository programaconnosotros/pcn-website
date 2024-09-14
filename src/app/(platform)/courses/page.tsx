import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Send, TvMinimalPlay } from 'lucide-react';
import { Heading3 } from '@/components/ui/heading-3';

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
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Git & GitHub</CardTitle>

            <CardDescription>
              Git permite que puedas controlar las versiones del código que desarrollas, y GitHub
              hace posible que puedas trabajar en equipo de una manera más eficiente. Este curso fue
              diseñado y dictado a los alumnos del primer año de ingeniería en sistemas de
              información, de la UTN-FRT.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <ViewButton href="/courses/git-and-github" />

            <p className="text-xs text-muted-foreground">
              Curso dictado por Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei.
            </p>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Vim</CardTitle>

            <CardDescription>
              Aprendé a usar Vim, el editor de texto más poderoso del mundo. Vim permite editar y
              navegar código de una manera súper veloz. Podés usar Vim en la consola o instalar un
              plugin dentro de tu IDE favorito para agilizar tu codificación usando los atajos de
              teclado de Vim.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <ViewButton href="/courses/vim" />
            <p className="text-sm text-muted-foreground">Curso dictado por Esteban Sánchez.</p>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>LaTeX</CardTitle>

            <CardDescription>
              Aprende a usar LaTeX, el sistema de composición de textos más utilizado en la
              academia. LaTeX permite crear documentos que se ven profesionales y que se diferencian
              de los documentos de texto típicos, además de que podés editarlos utilizando código,
              permitiendo que uses tu tiempo en lo que importa: escribir tu documento.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row justify-between gap-4">
            <ViewButton href="/courses/latex" />
            <p className="text-sm text-muted-foreground">Curso dictado por Esteban Sánchez.</p>
          </CardFooter>
        </Card>

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
