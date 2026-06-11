import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  CheckCircle2,
  Code2,
  Database,
  FlaskConical,
  Github,
  GitBranch,
  GitPullRequest,
  Globe,
  Layers,
  Package,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
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
  title: 'Desarrollá el proyecto',
  description:
    'El website de PCN es open-source. Aprendé cómo sumarte al desarrollo, ganar experiencia real con un equipo y dejar tu huella en la comunidad.',
  openGraph: {
    title: 'Desarrollá el proyecto | programaConNosotros',
    description:
      'El website de PCN es open-source. Aprendé cómo sumarte al desarrollo, ganar experiencia real con un equipo y dejar tu huella en la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/desarrollo`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desarrollá el proyecto | programaConNosotros',
    description:
      'El website de PCN es open-source. Aprendé cómo sumarte al desarrollo, ganar experiencia real con un equipo y dejar tu huella en la comunidad.',
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

const architectureLayers = [
  {
    icon: Globe,
    area: 'App Router & páginas',
    description:
      'src/app — rutas organizadas en grupos (platform), autenticacion y api usando el App Router de Next.js',
  },
  {
    icon: Server,
    area: 'Server actions',
    description:
      'src/actions — lógica de servidor agrupada por dominio: auth, events, talks, testimonials, users y más',
  },
  {
    icon: Database,
    area: 'Base de datos',
    description:
      'Prisma ORM sobre PostgreSQL; esquema en prisma/schema.prisma con más de 50 migraciones versionadas',
  },
  {
    icon: ShieldCheck,
    area: 'Validación',
    description:
      'Zod — schemas en src/schemas, reutilizados tanto en forms del cliente como en server actions',
  },
  {
    icon: Layers,
    area: 'Componentes & UI',
    description:
      'src/components — componentes React agrupados por feature; src/components/ui contiene la librería shadcn/ui',
  },
  {
    icon: Wrench,
    area: 'Utilidades',
    description:
      'src/lib — funciones compartidas: Prisma client, S3, email, utils y validaciones reutilizables',
  },
  {
    icon: Rocket,
    area: 'Deploy',
    description:
      'Kamal vía GitHub Actions — cada push a main dispara un deploy automático a producción',
  },
];

const toolchain = [
  {
    category: 'Frontend',
    tools: ['React Hook Form', 'TanStack Query', 'TanStack Table', 'Framer Motion', 'shadcn/ui'],
  },
  {
    category: 'Backend & datos',
    tools: ['AWS S3', 'Nodemailer', 'Zod', 'bcryptjs'],
  },
  {
    category: 'Testing & calidad',
    tools: ['Jest', 'Playwright', 'ESLint', 'Prettier', 'Husky'],
  },
  {
    category: 'Infraestructura & dev',
    tools: ['Docker Compose', 'Portless', 'Kamal', 'MailHog'],
  },
];

const contributionSteps = [
  'Instalar Docker y Docker Compose',
  'Clonar el repositorio desde GitHub',
  'Crear el archivo .env usando .env.template como base',
  'Levantar los contenedores con docker-compose up -d (incluye base de datos y web)',
  'Opcional: si usás VS Code, abrí el proyecto con Dev Containers para desarrollar dentro del contenedor',
  'Aplicar las migraciones con make apply-migrations (o pnpm apply-migrations en Windows)',
  'Opcional: poblar la base de datos con datos de prueba ejecutando pnpm populate-database',
  'Crear una branch, hacer los cambios y enviar una PR hacia testing',
];

const conventions = [
  {
    icon: GitBranch,
    title: 'Flujo de Git',
    detail:
      'Trabajá en tu propia branch y abrí una PR hacia testing. Nunca se hacen cambios directos en main ni testing. Una vez aprobada la PR, el equipo mergea testing a main.',
  },
  {
    icon: GitPullRequest,
    title: 'Título de la PR',
    detail: 'El formato es: [ID del ticket de Notion] - Título del ticket en Notion.',
  },
  {
    icon: Package,
    title: 'pnpm es obligatorio',
    detail:
      'Este proyecto usa pnpm como package manager. No uses npm ni yarn — el proyecto está configurado para pnpm@9.4.0.',
  },
  {
    icon: Sparkles,
    title: 'Pre-commit',
    detail:
      'Prettier formatea automáticamente los archivos modificados vía lint-staged. No necesitás formatearlo a mano.',
  },
  {
    icon: ShieldCheck,
    title: 'Pre-push',
    detail:
      'Antes de pushear, Husky corre pnpm lint, pnpm format:check, pnpm test y pnpm build. Todos deben pasar.',
  },
];

const benefits = [
  'Mejorá tus habilidades trabajando con código de producción real',
  'Aprendé de otros desarrolladores de la comunidad',
  'Fortalecé tu portafolio con contribuciones reales en GitHub',
  'Conocé a otros miembros de PCN y expandí tu red',
  'Ayudá a otros desarrolladores a crecer en su carrera',
];

const CARD_CLASS =
  'border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800';

const LAYER_ITEM_CLASS =
  'flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800';

const ICON_CHIP_CLASS =
  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10';

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
        {/* Title row */}
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

        {/* Intro */}
        <p className="mb-6 max-w-3xl text-lg text-muted-foreground">
          Este sitio web es un proyecto open-source y cualquier persona puede contribuir al
          desarrollo. En esta página encontrás todo lo que necesitás saber: el stack tecnológico, la
          arquitectura del proyecto, las convenciones de trabajo y cómo empezar.
        </p>

        {/* Arquitectura del proyecto */}
        <Card className={`mb-6 ${CARD_CLASS}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
              Arquitectura del proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              El proyecto sigue las convenciones del App Router de Next.js. Cada capa tiene una
              responsabilidad clara:
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {architectureLayers.map((layer) => (
                <div key={layer.area} className={LAYER_ITEM_CLASS}>
                  <div className={ICON_CHIP_CLASS}>
                    <layer.icon className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{layer.area}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{layer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech stack + setup steps (2-col) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className={CARD_CLASS}>
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

          <Card className={CARD_CLASS}>
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

        {/* Herramientas de desarrollo */}
        <Card className={`mt-6 ${CARD_CLASS}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
              Herramientas de desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolchain.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.tools.map((tool) => (
                      <Badge
                        key={tool}
                        variant="secondary"
                        className="border border-pcnPurple/20 bg-pcnPurple/5 text-pcnPurple dark:border-pcnGreen/20 dark:bg-pcnGreen/5 dark:text-pcnGreen"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              ¿Querés conocer más herramientas del ecosistema?{' '}
              <Link
                href="/herramientas"
                className="font-medium text-pcnPurple underline-offset-4 hover:underline dark:text-pcnGreen"
              >
                Explorá el catálogo completo →
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Convenciones de contribución */}
        <Card className={`mt-6 ${CARD_CLASS}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
              Convenciones de contribución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {conventions.map((item) => (
                <div key={item.title} className={LAYER_ITEM_CLASS}>
                  <div className={ICON_CHIP_CLASS}>
                    <item.icon className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing y calidad */}
        <Card className={`mt-6 ${CARD_CLASS}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
              Testing y calidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm font-semibold">Tests unitarios (Jest)</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Más de 70 tests colocalizados junto a los server actions (
                  <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">*.test.ts</code>
                  ). Se ejecutan con{' '}
                  <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                    pnpm test
                  </code>{' '}
                  o en modo watch con{' '}
                  <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                    pnpm test:watch
                  </code>
                  .
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm font-semibold">Tests E2E (Playwright)</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tests end-to-end en{' '}
                  <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">tests/</code>{' '}
                  que corren en Chromium, Firefox y WebKit. Se ejecutan con{' '}
                  <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                    npx playwright test
                  </code>
                  .
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm font-semibold">Calidad automatizada</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  El hook pre-push de Husky ejecuta lint, format check, tests y build antes de cada
                  push. No se puede pushear código que rompa alguno de estos checks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Por qué contribuir */}
        <Card className={`mt-6 ${CARD_CLASS}`}>
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

        {/* CTA */}
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
