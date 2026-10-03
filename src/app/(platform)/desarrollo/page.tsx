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
  MessageCircle,
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
import { TechNotes } from '@/components/desarrollo/tech-notes';
import { technologies, toolchain } from '@/components/desarrollo/technologies';
import { techNoteGroups } from './tech-notes';
import { DesarrolloToc } from '@/components/desarrollo/desarrollo-toc';
import { DbDiagram } from '@/components/desarrollo/db-diagram';
import { ArchitectureDiagram } from '@/components/desarrollo/architecture-diagram';
import { architectureViews } from './architecture';
import { DB_SCHEMA_UPDATED_AT, dbEnums, dbModels, dbRelations } from './db-schema';
import type { TocSection } from '@/components/ui/table-of-contents';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'pnpm dev',
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

// Section titles stay pinned, just below the page header, while you read them (on large screens;
// small ones get the index bar).
const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section
    id={id}
    className="scroll-mt-32 p-4 lg:scroll-mt-[calc(var(--sticky-header-offset,0px)+1rem)]"
  >
    <h2 className="mb-3 bg-background/95 font-mono text-sm font-semibold backdrop-blur lg:sticky lg:top-[var(--sticky-header-offset,0px)] lg:z-20 lg:-mx-4 lg:-mt-4 lg:px-4 lg:py-2">
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
// Grupo donde charlamos el desarrollo del sitio; abierto también a quien solo quiera leer.
const DEV_CHAT_URL = 'https://chat.whatsapp.com/LAHHq1vtgY6ApnPCyZXX4X';

const techNoteCount = techNoteGroups.reduce((total, group) => total + group.notes.length, 0);

const relationsToUser = dbRelations.filter((relation) => relation.to === 'User').length;
// Many-to-many tables: a composite unique made of two foreign keys.
const joinTables = dbModels
  .filter((model) =>
    model.uniques.some(
      (columns) =>
        columns.filter((column) => model.fields.some((f) => f.name === column && f.fk)).length >= 2,
    ),
  )
  .map((model) => model.name);
const schemaUpdatedAt = new Date(`${DB_SCHEMA_UPDATED_AT}T12:00:00Z`).toLocaleDateString('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const databaseDesign = [
  {
    term: 'Identificadores',
    detail:
      'Todas las tablas usan un id de texto generado con cuid(): no revela cuántas filas hay ni en qué orden se crearon, y se puede generar sin consultar la base.',
  },
  {
    term: 'User en el centro',
    detail: `Casi todo cuelga de un usuario: ${relationsToUser} de las ${dbRelations.length} relaciones apuntan a User (autor de un consejo, inscripto a un evento, orador de una charla, quien subió una foto…).`,
  },
  {
    term: 'Tablas intermedias',
    detail: `Las relaciones muchos a muchos tienen su propia tabla con una restricción única compuesta, así no se puede, por ejemplo, inscribir dos veces a la misma persona: ${joinTables.join(', ')}.`,
  },
  {
    term: 'Qué pasa al borrar',
    detail:
      'Cascade cuando la fila no tiene sentido sin su padre (likes, inscripciones, sesiones); SetNull cuando la historia tiene que sobrevivir aunque se borre el usuario (fotos subidas, oradores de charlas, logs de errores).',
  },
  {
    term: 'Gente sin cuenta',
    detail:
      'Los oradores de charlas y propuestas y los miembros de proyectos tienen userId opcional y guardan su nombre aparte: una charla puede tener un orador que no tiene cuenta en el sitio.',
  },
  {
    term: 'Contenido en el código',
    detail:
      'Los artículos de /lectura viven en el repo, no en la base: ArticleAuthor y ContentMark los referencian por id (articleId, contentType + contentId) sin clave foránea.',
  },
  {
    term: 'Enums',
    detail: dbEnums.map((e) => `${e.name} (${e.values.join(', ')})`).join(' · '),
  },
  {
    term: 'Migraciones',
    detail:
      'Cada cambio al esquema es una migración SQL versionada en prisma/migrations; el deploy aplica las pendientes antes de levantar la versión nueva.',
  },
];

const section = (id: string, title: string): TocSection => ({ id, title });

// Index on the left: the page's sections, with every stack note under its group.
const tocSections: TocSection[] = [
  section('arquitectura', 'Arquitectura'),
  section('diagramas', 'Diagramas de arquitectura'),
  ...architectureViews.map((view) => ({
    id: `diagrama-${view.id}`,
    title: view.title,
    group: 'diagramas',
  })),
  section('tecnologias', 'Tecnologías'),
  section('contribuir', 'Cómo contribuir'),
  section('base-de-datos', 'Base de datos'),
  section('notas', 'Notas del stack'),
  ...techNoteGroups.flatMap((group) =>
    group.notes.map((note) => ({
      id: `nota-${note.id}`,
      title: note.name,
      group: `notas/${group.id}`,
    })),
  ),
  section('herramientas', 'Herramientas'),
  section('convenciones', 'Convenciones'),
  section('testing', 'Testing y calidad'),
  section('estadisticas', 'Estadísticas'),
  section('team', 'Team de desarrollo'),
  section('por-que-contribuir', 'Por qué contribuir'),
];

const DesarrolloPage = () => (
  <>
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader pinnedOnDesktop>
          <div className="flex items-start justify-between gap-4">
            <PageTitle
              path="desarrollo"
              className="flex-1"
              meta="open-source · cualquier persona puede contribuir"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Link href={DEV_CHAT_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="flex flex-row items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  unirseAlGrupo();
                </Button>
              </Link>
              <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="pcn" size="sm" className="flex flex-row items-center gap-2">
                  <Github className="h-4 w-4" />
                  abrirGitHub();
                </Button>
              </Link>
            </div>
          </div>
        </StickyHeader>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <DesarrolloToc sections={tocSections} />
          <div className="min-w-0 flex-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
            <Section id="arquitectura" title="Arquitectura del proyecto">
              <DefinitionList
                items={architectureLayers.map((layer) => ({
                  term: layer.area,
                  detail: layer.description,
                }))}
              />
            </Section>

            <Section id="diagramas" title="Diagramas de arquitectura">
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                El mismo sistema visto desde {architectureViews.length} ángulos: cómo se reparte la
                lógica, dónde corre cada pieza, cómo llega un cambio a producción, cómo se levanta
                en tu máquina y cómo colaboran las piezas en una petición real. Debajo de cada
                diagrama está explicado cada componente.
              </p>
              <div className="space-y-6">
                {architectureViews.map((view) => (
                  <div
                    key={view.id}
                    id={`diagrama-${view.id}`}
                    className="scroll-mt-32 lg:scroll-mt-[calc(var(--sticky-header-offset,0px)+3rem)]"
                  >
                    <h3 className="mb-2 font-mono text-sm text-pcnGreen">
                      <span className="text-pcnGreen-500">### </span>
                      {view.title}
                    </h3>
                    <p className="mb-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {view.summary}
                    </p>
                    <ArchitectureDiagram id={view.id} title={view.title} source={view.source} />
                    <div className="mt-3">
                      <DefinitionList items={view.components} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-pcnGreen-200">
              <Section id="tecnologias" title="Tecnologías que usamos">
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
                <Section id="contribuir" title="Cómo contribuir">
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
                  <p className="mt-4 border-l-2 border-pcnGreen-500 pl-3 text-xs leading-relaxed text-muted-foreground">
                    Charlamos el desarrollo del sitio en un{' '}
                    <a
                      href={DEV_CHAT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-pcnGreen underline-offset-4 hover:underline"
                    >
                      grupo de WhatsApp ↗
                    </a>
                    . No hace falta que vayas a programar: podés sumarte a leer lo que hablamos si
                    te sirve, o preguntar lo que quieras.
                  </p>
                </Section>
              </div>
            </div>

            <Section id="base-de-datos" title="Diseño de la base de datos">
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                PostgreSQL con Prisma: {dbModels.length} modelos y {dbRelations.length} relaciones,
                definidos en <Code>prisma/schema.prisma</Code>. Estas son las decisiones que dan
                forma al esquema, y abajo el diagrama completo de entidades y relaciones.
              </p>
              <DefinitionList items={databaseDesign} />
              <div className="mt-4">
                <DbDiagram models={dbModels} relations={dbRelations} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                <span className="text-pcnGreen-500">$ </span>pnpm db:diagram{' '}
                <span className="text-pcnGreen-700"># regenera el diagrama desde el schema</span> ·
                última actualización: {schemaUpdatedAt}
              </p>
            </Section>

            <Section id="notas" title={`Notas teóricas del stack (${techNoteCount})`}>
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Una guía para aprender con este proyecto: qué es cada tecnología, los conceptos que
                tenés que conocer y cómo la usamos acá, con fragmentos reales del código. Al final,
                cómo funcionan por dentro módulos del sitio como la galería y los eventos. Tocá el
                nombre del archivo de cada ejemplo para leerlo completo en GitHub.
              </p>
              <TechNotes groups={techNoteGroups} />
            </Section>

            <Section id="herramientas" title="Herramientas de desarrollo">
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

            <Section id="convenciones" title="Convenciones de contribución">
              <DefinitionList
                items={conventions.map((item) => ({ term: item.title, detail: item.detail }))}
              />
            </Section>

            <Section id="testing" title="Testing y calidad">
              <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[200px_1fr]">
                <dt className="font-mono text-pcnGreen">Tests unitarios (Jest)</dt>
                <dd className="leading-relaxed text-muted-foreground">
                  Más de 90 archivos de test (<Code>*.test.ts</Code>) colocalizados junto al código
                  que prueban: server actions, <Code>src/lib</Code>, schemas y route handlers. Se
                  ejecutan con <Code>pnpm test</Code> o en modo watch con{' '}
                  <Code>pnpm test:watch</Code>.
                </dd>
                <dt className="font-mono text-pcnGreen">Tests E2E (Playwright)</dt>
                <dd className="leading-relaxed text-muted-foreground">
                  Tests end-to-end en <Code>tests/</Code> que corren en Chromium, Firefox y WebKit.
                  Se ejecutan con <Code>npx playwright test</Code>.
                </dd>
                <dt className="font-mono text-pcnGreen">Calidad automatizada</dt>
                <dd className="leading-relaxed text-muted-foreground">
                  El hook pre-push de Husky ejecuta lint, format check, tests y build antes de cada
                  push. No se puede pushear código que rompa alguno de estos checks.
                </dd>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Las técnicas, los checks y todos los casos de prueba, manuales y automatizados, en{' '}
                <Link
                  href="/desarrollo/calidad"
                  className="font-mono text-pcnGreen underline-offset-4 hover:underline"
                >
                  ~/desarrollo/calidad →
                </Link>
              </p>
            </Section>

            <Section id="estadisticas" title="Estadísticas de colaboración">
              <Suspense fallback={<CollaborationStatsSkeleton />}>
                <CollaborationStats />
              </Suspense>
            </Section>

            <Section id="team" title={`Team de desarrollo (${teamSize})`}>
              <Team />
            </Section>

            <Section id="por-que-contribuir" title="Por qué contribuir">
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
    </div>
  </>
);

export default DesarrolloPage;
