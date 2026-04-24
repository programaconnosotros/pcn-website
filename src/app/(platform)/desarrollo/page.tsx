import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
import type { Metadata } from 'next';
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
import { CheckCircle2, Code2, Github, GitBranch, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Team } from '@/components/landing/team';
import { NextJsSVG } from '@/components/logos/NextJsSVG';
import { ReactSVG } from '@/components/logos/ReactSVG';
import { TypescriptSVG } from '@/components/logos/TypescriptSVG';
import { TailwindSVG } from '@/components/logos/TailwindSVG';
import { PrismaSVG } from '@/components/logos/PrismaSVG';
import { PostgresqlSVG } from '@/components/logos/PostgresqlSVG';
import { DockerSVG } from '@/components/logos/DockerSVG';
import { GitSVG } from '@/components/logos/GitSVG';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Desarrollo del Proyecto (PCN)',
  description:
    'Aprende como contribuir al desarrollo del website de programaConNosotros. Proyecto open-source con Next.js, TypeScript y Tailwind CSS.',
  openGraph: {
    title: 'Desarrollo del Proyecto (PCN)',
    description:
      'Aprende como contribuir al desarrollo del website de programaConNosotros. Proyecto open-source con Next.js, TypeScript y Tailwind CSS.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/desarrollo`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desarrollo del Proyecto (PCN)',
    description:
      'Aprende como contribuir al desarrollo del website de programaConNosotros. Proyecto open-source con Next.js, TypeScript y Tailwind CSS.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const technologies = [
  { name: 'Next.js', icon: NextJsSVG },
  { name: 'React', icon: ReactSVG },
  { name: 'TypeScript', icon: TypescriptSVG },
  { name: 'Tailwind CSS', icon: TailwindSVG },
  { name: 'Prisma', icon: PrismaSVG },
  { name: 'PostgreSQL', icon: PostgresqlSVG },
  { name: 'Docker', icon: DockerSVG },
  { name: 'Git', icon: GitSVG },
];

const contributionSteps = [
  'Instalar Docker y Docker Compose',
  'Clonar el repositorio desde GitHub',
  'Configurar las variables de entorno (.env)',
  'Ejecutar docker-compose up -d para levantar la base de datos',
  'Correr las migraciones con npx prisma migrate dev',
  'Iniciar el servidor de desarrollo con npm run dev',
  'Crear un branch, hacer los cambios y enviar un PR',
];

const benefits = [
  'Mejorá tus habilidades trabajando con código de producción real',
  'Aprendé de otros desarrolladores de la comunidad',
  'Fortalecé tu portafolio con contribuciones reales en GitHub',
  'Conocé a otros miembros de PCN y expandí tu red',
  'Ayudá a otros desarrolladores a crecer en su carrera',
];

const DesarrolloPage = () => (
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
              <BreadcrumbPage>Desarrollo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <div className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <Code2 className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Desarrollo</span>
            </Heading2>

            <Link
              href="https://github.com/programaconnosotros/pcn-website"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="pcn" className="flex flex-row items-center gap-2">
                Ver repositorio en GitHub
                <Github className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <p className="mb-8 max-w-3xl text-lg text-muted-foreground">
          Este sitio web es un proyecto open-source y cualquier persona puede contribuir al
          desarrollo. Es una excelente oportunidad para aprender, practicar y conocer a otros
          desarrolladores de la comunidad.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Tecnologías que usamos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <tech.icon className="h-6 w-6 text-pcnPurple dark:text-pcnGreen" />
                    <span className="font-medium">{tech.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                También usamos shadcn/ui para los componentes de interfaz.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Cómo contribuir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {contributionSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pcnPurple/10 text-xs font-medium text-pcnPurple dark:bg-pcnGreen/10 dark:text-pcnGreen">
                      {index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
              Por qué contribuir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pcnPurple dark:text-pcnGreen" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Team />

        <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-pcnPurple/30 bg-pcnPurple/5 p-8 dark:border-pcnGreen/30 dark:bg-pcnGreen/5">
          <Heading3 className="m-0 text-center">¿Listo para empezar?</Heading3>
          <p className="max-w-md text-center text-muted-foreground">
            Revisá el repositorio, elegí un issue que te interese, o proponé una mejora. Toda
            contribución es bienvenida.
          </p>
          <Link
            href="https://github.com/programaconnosotros/pcn-website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="pcn" size="lg" className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Ir al repositorio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </>
);

export default DesarrolloPage;
