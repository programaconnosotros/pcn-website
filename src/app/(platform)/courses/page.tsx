import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const Courses = () => (
  <div className="mt-4 md:px-20">
    <Heading2>Cursos</Heading2>

    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Git & GitHub</CardTitle>

          <CardDescription>
            Git permite que puedas controlar las versiones del código que desarrollas, y GitHub hace
            posible que puedas trabajar en equipo de una manera más eficiente. Este curso fue
            diseñado y dictado a los alumnos del primer año de ingeniería en sistemas de
            información, de la UTN-FRT.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Curso dictado por Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei.
          </p>

          <Link href="/courses/git-and-github">
            <Button>Ver curso</Button>
          </Link>
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
          <p className="text-sm text-muted-foreground">Curso dictado por Esteban Sánchez.</p>

          <Link href="/courses/vim">
            <Button>Ver curso</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>LaTeX</CardTitle>

          <CardDescription>
            Aprende a usar LaTeX, el sistema de composición de textos más utilizado en la academia.
            LaTeX permite crear documentos que se ven profesionales y que se diferencian de los
            documentos de texto típicos, además de que podés editarlos utilizando código,
            permitiendo que uses tu tiempo en lo que importa: escribir tu documento.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-row justify-between gap-4">
          <p className="text-sm text-muted-foreground">Curso dictado por Esteban Sánchez.</p>

          <Link href="/courses/latex">
            <Button>Ver curso</Button>
          </Link>
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
  </div>
);

export default Courses;
