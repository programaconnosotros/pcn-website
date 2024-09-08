import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Courses = () => (
  <div className="mt-4 md:px-20">
    <Heading2>Cursos</Heading2>

    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Git & GitHub</CardTitle>

          <CardDescription>
            Aprende a usar Git y GitHub, los sistemas de control de versiones más populares.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-row justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Autores: Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei.
          </p>

          <Link href="/courses/git-and-github">
            <Button>Ver curso</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vim</CardTitle>

          <CardDescription>
            Aprende a usar VIM, el editor de texto más poderoso del mundo.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-row justify-between gap-4">
          <p className="text-sm text-muted-foreground">Autor: Esteban Sánchez</p>

          <Link href="/courses/vim">
            <Button>Ver curso</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LaTeX</CardTitle>

          <CardDescription>
            Aprende a usar LaTeX, el sistema de composición de textos más utilizado en la academia.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-row justify-between gap-4">
          <p className="text-sm text-muted-foreground">Autor: Esteban Sánchez</p>

          <Link href="/courses/latex">
            <Button>Ver curso</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  </div>
);

export default Courses;
