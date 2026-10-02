import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import type { Metadata } from 'next';
import {
  Database,
  GitBranch,
  GitPullRequest,
  Github,
  Globe,
  Layers,
  Package,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { Team, teamSize } from '@/components/landing/team';
import {
  CollaborationStats,
  CollaborationStatsSkeleton,
} from '@/components/desarrollo/collaboration-stats';
import { NextJsSVG } from '@/components/logos/NextJsSVG';
import { ReactSVG } from '@/components/logos/ReactSVG';
import { TypescriptSVG } from '@/components/logos/TypescriptSVG';
import { TailwindSVG } from '@/components/logos/TailwindSVG';
import { PrismaSVG } from '@/components/logos/PrismaSVG';
import { PostgresqlSVG } from '@/components/logos/PostgresqlSVG';
import { DockerSVG } from '@/components/logos/DockerSVG';
import { GitSVG } from '@/components/logos/GitSVG';
import { GitHubMarkSVG } from '@/components/logos/GitHubMarkSVG';
import { AwsSVG } from '@/components/logos/AwsSVG';
import { KamalSVG } from '@/components/logos/KamalSVG';
import { TechNotes } from '@/components/desarrollo/tech-notes';
import { techNoteGroups } from './tech-notes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Desarrollá el proyecto',
  description:
    'El website de PCN es open-source. Aprendé cómo sumarte al desarrollo, ganar experiencia real con un equipo y dejar tu huella en la comunidad.',
  openGraph: {
    title: 'Desarrollá el proyecto | programaConNosotros',
    description:
      'El website de PCN es open-source. Aprendé cómo sumarte al desarrollo, ganar experiencia real con un equipo y dejar tu huella en la comunidad.',
    url: `${SITE_URL}/desarrollo`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desarrollá el proyecto | programaConNosotros',
    description:
      'El website de PCN es open-source. Aprendé cómo sumarte al desarrollo, ganar experiencia real con un equipo y dejar tu huella en la comunidad.',
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
  { name: 'Kamal', icon: KamalSVG },
  { name: 'AWS', icon: AwsSVG },
  { name: 'Git', icon: GitSVG },
  { name: 'GitHub', icon: GitHubMarkSVG },
];

const architectureLayers = [
  {
    icon: Globe,
    area: 'App Router & páginas',
    description:
      'src/app — App Router de Next.js: el grupo (platform) con las secciones de la comunidad, autenticacion para login y registro, api para los route handlers, y archivos especiales como sitemap.ts, robots.ts, feed.xml y [shortcut] (atajos como /cowork que llevan al próximo evento)',
  },
  {
    icon: Server,
    area: 'Server actions',
    description:
      'src/actions — lógica de servidor agrupada por dominio: auth, events, gallery, talks, talk-proposals, articles, comments, notifications, badges, users y más',
  },
  {
    icon: Database,
    area: 'Base de datos',
    description:
      'Prisma ORM sobre PostgreSQL; esquema en prisma/schema.prisma con más de 70 migraciones versionadas',
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
      'src/lib — funciones compartidas: Prisma client, S3 y firma de CloudFront, procesamiento de fotos, email, calendario (ICS y Google Calendar), permisos de eventos, rate limiting, índice de búsqueda e imágenes de Open Graph',
  },
  {
    icon: Package,
    area: 'Hooks y contenido',
    description:
      'src/hooks — custom hooks de React; src/data — contenido estático versionado: changelog, preguntas frecuentes, partners y conversaciones',
  },
  {
    icon: Rocket,
    area: 'Deploy',
    description:
      'Kamal vía GitHub Actions — cada push a main aplica las migraciones pendientes y despliega automáticamente a producción',
  },
];

const toolchain = [
  {
    category: 'Frontend',
    tools: [
      'shadcn/ui + Radix',
      'React Hook Form',
      'TanStack Query',
      'TanStack Table',
      'Motion',
      'Sonner',
      'date-fns',
      'Embla Carousel',
      'Lucide',
    ],
  },
  {
    category: 'Backend & datos',
    tools: ['Prisma', 'Zod', 'bcryptjs', 'Nodemailer', 'React Email'],
  },
  {
    category: 'Imágenes y video',
    tools: ['AWS S3', 'CloudFront (URLs firmadas)', 'sharp', 'exifr', 'Mediabunny'],
  },
  {
    category: 'Testing & calidad',
    tools: [
      'Jest',
      'jest-mock-extended',
      'Playwright',
      'ESLint',
      'Prettier',
      'Husky',
      'lint-staged',
    ],
  },
  {
    category: 'Infraestructura & dev',
    tools: ['Docker Compose', 'Dev Containers', 'Portless', 'Kamal', 'GitHub Actions', 'MailHog'],
  },
];

const contributionSteps = [
  'Instalar Docker y Docker Compose',
  'Clonar el repositorio desde GitHub',
  'Crear el archivo .env usando .env.template como base',
  'Levantar todo con docker-compose up -d: Postgres, MailHog (localhost:18025) y la web en localhost:3000, que aplica las migraciones al arrancar',
  'Alternativa sin el contenedor web (Node 24+): pnpm install, docker-compose up -d database mailhog y pnpm dev, que sirve el sitio en https://pcn-website.localhost vía portless',
  'Opcional: si usás VS Code, abrí el proyecto con Dev Containers para desarrollar dentro del contenedor',
  'Cuando bajes migraciones nuevas, aplicalas con make apply-migrations (o pnpm apply-migrations)',
  'Opcional: poblar la base de datos con datos de prueba ejecutando pnpm populate-database',
  'Crear una branch, hacer los cambios y enviar una PR hacia testing; si cambia la UI, sumá capturas con pnpm screenshot',
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

const Code = ({ children }: { children: ReactNode }) => (
  <code className="bg-pcnGreen-100 px-1 font-mono text-pcnGreen">{children}</code>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="p-4">
    <h2 className="mb-3 font-mono text-sm font-semibold">
      <span className="text-pcnGreen-500">## </span>
      {title}
    </h2>
    {children}
  </section>
);

const DefinitionList = ({ items }: { items: { term: string; detail: string }[] }) => (
  <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[200px_1fr]">
    {items.map((item) => (
      <div key={item.term} className="contents">
        <dt className="font-mono text-pcnGreen">{item.term}</dt>
        <dd className="leading-relaxed text-muted-foreground">{item.detail}</dd>
      </div>
    ))}
  </dl>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="grid gap-x-6 gap-y-1 md:grid-cols-2">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
        <span className="shrink-0 font-mono text-pcnGreen-500">›</span>
        {item}
      </li>
    ))}
  </ul>
);

const REPO_URL = 'https://github.com/programaconnosotros/pcn-website';

const techNoteCount = techNoteGroups.reduce((total, group) => total + group.notes.length, 0);

const DesarrolloPage = () => (
  <>
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <div className="flex items-start justify-between gap-4">
            <PageTitle
              path="desarrollo"
              className="flex-1"
              meta="open-source · cualquier persona puede contribuir"
            />
            <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="pcn" size="sm" className="flex flex-row items-center gap-2">
                <Github className="h-4 w-4" />
                abrirGitHub();
              </Button>
            </Link>
          </div>
        </StickyHeader>

        <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <Section title="Arquitectura del proyecto">
            <DefinitionList
              items={architectureLayers.map((layer) => ({
                term: layer.area,
                detail: layer.description,
              }))}
            />
          </Section>

          <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-pcnGreen-200">
            <Section title="Tecnologías que usamos">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm">
                {technologies.map((tech) => (
                  <li key={tech.name} className="flex items-center gap-2">
                    <tech.icon className="h-4 w-4 text-pcnGreen" />
                    {tech.name}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                También usamos shadcn/ui para los componentes de interfaz.{' '}
                <a
                  href="#notas"
                  className="font-mono text-pcnGreen underline-offset-4 hover:underline"
                >
                  Leé cómo usamos cada una ↓
                </a>
              </p>
            </Section>

            <div className="border-t border-pcnGreen-200 lg:border-t-0">
              <Section title="Cómo contribuir">
                <ol className="space-y-1">
                  {contributionSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-2 text-sm leading-6">
                      <span className="shrink-0 font-mono text-pcnGreen-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          </div>

          <section id="notas" className="scroll-mt-24">
            <Section title={`Notas teóricas del stack (${techNoteCount})`}>
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Una guía para aprender con este proyecto: qué es cada tecnología, los conceptos que
                tenés que conocer y cómo la usamos acá, con fragmentos reales del código. Tocá el
                nombre del archivo de cada ejemplo para leerlo completo en GitHub.
              </p>
              <TechNotes groups={techNoteGroups} />
            </Section>
          </section>

          <Section title="Herramientas de desarrollo">
            <DefinitionList
              items={toolchain.map((group) => ({
                term: group.category,
                detail: group.tools.join(' · '),
              }))}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              ¿Querés conocer más herramientas del ecosistema?{' '}
              <Link
                href="/herramientas"
                className="font-mono text-pcnGreen underline-offset-4 hover:underline"
              >
                ~/herramientas →
              </Link>
            </p>
          </Section>

          <Section title="Convenciones de contribución">
            <DefinitionList
              items={conventions.map((item) => ({ term: item.title, detail: item.detail }))}
            />
          </Section>

          <Section title="Testing y calidad">
            <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[200px_1fr]">
              <dt className="font-mono text-pcnGreen">Tests unitarios (Jest)</dt>
              <dd className="leading-relaxed text-muted-foreground">
                Más de 90 archivos de test (<Code>*.test.ts</Code>) colocalizados junto al código
                que prueban: server actions, <Code>src/lib</Code>, schemas y route handlers. Se
                ejecutan con <Code>pnpm test</Code> o en modo watch con <Code>pnpm test:watch</Code>
                .
              </dd>
              <dt className="font-mono text-pcnGreen">Tests E2E (Playwright)</dt>
              <dd className="leading-relaxed text-muted-foreground">
                Tests end-to-end en <Code>tests/</Code> que corren en Chromium, Firefox y WebKit. Se
                ejecutan con <Code>npx playwright test</Code>.
              </dd>
              <dt className="font-mono text-pcnGreen">Calidad automatizada</dt>
              <dd className="leading-relaxed text-muted-foreground">
                El hook pre-push de Husky ejecuta lint, format check, tests y build antes de cada
                push. No se puede pushear código que rompa alguno de estos checks.
              </dd>
            </dl>
          </Section>

          <Section title="Estadísticas de colaboración">
            <Suspense fallback={<CollaborationStatsSkeleton />}>
              <CollaborationStats />
            </Suspense>
          </Section>

          <Section title={`Team de desarrollo (${teamSize})`}>
            <Team />
          </Section>

          <Section title="Por qué contribuir">
            <BulletList items={benefits} />
          </Section>

          <div className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <p className="font-mono text-sm">
              <span className="text-pcnGreen-500">$ </span>
              ¿Listo para empezar? Elegí un issue o proponé una mejora.
            </p>
            <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="pcn" size="sm" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                irAlRepositorio();
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default DesarrolloPage;
