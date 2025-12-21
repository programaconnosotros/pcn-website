import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

const testimonios = [
  {
    name: 'Emiliano Grillo',
    body: 'PCN es una comunidad llena de potencial, con gente que le gusta aprender, compartir y enseñar lo aprendido, donde te podes sentir libre de preguntar sin sentir presiones o miedos. Es un entorno nutritivo repleto de gente nutritiva que aporta conocimientos, aprendizajes, experiencias, oportunidades y consejos que van de avanzados a novatos y de novatos a avanzados, lo que demuestra que siempre se aprende algo nuevo y que todos tenemos algo para enseñar.',
  },
  {
    name: 'Mateo Herrera',
    body: 'PCN es un espacio donde las personas comparten generosamente sus conocimientos, se apoyan mutuamente y crecen juntas en el mundo de la programación. Gracias a PCN no solo aprendí cosas nuevas de código, sino que también conocí gente increíble, con la que puedo hablar de proyectos, dudas, ideas y hasta compartir juntadas en persona. Es una comunidad que te hace sentir acompañado en este camino que a veces puede ser solitario, y eso lo valoro muchísimo.',
  },
  {
    name: 'Mauricio Chaile',
    body: 'PCN es una gran comunidad de la cual aprender muchas cosas pero sobre todo para inspirarme y compartir sobre esto que nos gusta que es el software',
  },
  {
    name: 'Vicky Grillo',
    body: 'PCN es mucho más que una comunidad de desarrollo. Es un espacio donde se comparte conocimiento, se hacen amigos, se organizan charlas y eventos, y sobre todo, donde se da la oportunidad de tener esa primera experiencia laboral que muchas veces es tan difícil de conseguir. Aprendí un montón, conocí gente brillante y me sentí parte de algo que realmente impulsa a los que estamos empezando.',
  },
  {
    name: 'Matías Gutiérrez',
    body: 'PCN es una comunidad hermosa llena de gente muy inteligente y humilde, dispuestos a aprender y enseñar sin importar seniority ni nada de esas cosas. La verdad que estoy orgulloso de poder formar parte de ella',
  },
];

const TestimoniosPage = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

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
              <BreadcrumbItem>
                <BreadcrumbPage>Testimonios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full flex-row items-center justify-between">
              <Heading2 className="m-0">Testimonios</Heading2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar testimonio
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Próximamente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mb-14">
            <p className="mb-6 text-left text-muted-foreground">
              Conocé las experiencias de miembros de nuestra comunidad
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonios.map((testimonio, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{testimonio.name}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{testimonio.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimoniosPage;

