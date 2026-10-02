// Theory notes on the website's stack, rendered by `TechNotes` on /desarrollo.
//
// Every example is a real (sometimes trimmed) excerpt of this repo, with the path it comes
// from so people can go read the whole file. Lines elided from an excerpt are marked with
// `// …`. When you change one of these files in a way that breaks an excerpt, update it here.
//
// Inline code in prose goes between backticks: `TechNotes` renders it as <code>.

export type TechExample = {
  /** Path relative to the repo root, e.g. `src/lib/prisma.ts`. */
  file: string;
  /** Language label shown in the header of the code block. */
  lang: string;
  /** What to look at in this excerpt. */
  caption?: string;
  code: string;
};

export type TechNote = {
  /** Anchor id (`#nota-<id>`). */
  id: string;
  name: string;
  /** One-line summary shown while the note is collapsed. */
  tagline: string;
  /** "Qué es": the theory, independent from this project. */
  what: string;
  concepts: { term: string; detail: string }[];
  /** "Cómo lo usamos acá": paragraphs about this repo. */
  usage: string[];
  examples: TechExample[];
  /** Official docs of the technology. */
  docsUrl?: string;
  /** Folder of this repo where the note's code lives (for notes about the site's own modules). */
  sourcePath?: string;
};

export type TechNoteGroup = {
  id: string;
  title: string;
  notes: TechNote[];
};

export const techNoteGroups: TechNoteGroup[] = [
  {
    id: 'framework',
    title: 'framework',
    notes: [
      {
        id: 'nextjs-app-router',
        name: 'Next.js · App Router',
        tagline: 'el sistema de archivos es el router',
        what: 'Next.js es un framework de React que suma lo que React solo no trae: ruteo, renderizado en el servidor, caché, optimización de imágenes y fuentes, y un build listo para producción. El App Router (la carpeta `app/`) arma las rutas a partir de carpetas: cada carpeta es un segmento de la URL y ciertos archivos con nombre especial definen qué se renderiza en ese segmento.',
        concepts: [
          {
            term: 'page.tsx',
            detail:
              'Hace que la carpeta sea una ruta pública. Sin `page.tsx` la carpeta existe pero no se puede visitar.',
          },
          {
            term: 'layout.tsx',
            detail:
              'UI compartida que envuelve a todas las páginas de abajo y no se vuelve a montar al navegar entre ellas (por eso el sidebar no parpadea).',
          },
          {
            term: 'loading.tsx',
            detail:
              'Skeleton que Next muestra al instante mientras la página se resuelve en el servidor. Por dentro es un `<Suspense>` automático.',
          },
          {
            term: '(grupo)',
            detail:
              'Una carpeta entre paréntesis agrupa rutas para compartir un layout sin agregar nada a la URL: `(platform)/desarrollo` responde en `/desarrollo`.',
          },
          {
            term: '[param]',
            detail:
              'Segmento dinámico: `consejos/[id]` atiende `/consejos/abc123` y recibe `{ id: "abc123" }` en `params`.',
          },
          {
            term: 'archivos de metadata',
            detail:
              '`sitemap.ts`, `robots.ts` y `opengraph-image.tsx` generan `/sitemap.xml`, `/robots.txt` y la imagen que se ve al compartir el link.',
          },
        ],
        usage: [
          'Todo el sitio vive en `src/app`. Las secciones de la comunidad están dentro del grupo `(platform)`, que comparte el layout con sidebar, navegación mobile y PCN OS. Las pantallas de login y registro están en `autenticacion/`, que tiene su propio layout más simple.',
          'Casi todas las páginas exportan `metadata` (o `generateMetadata` si dependen de la base) para el título, la descripción y las tarjetas de Open Graph, y muchas tienen su `opengraph-image.tsx` que dibuja una tarjeta con estética de terminal.',
        ],
        examples: [
          {
            file: 'src/app',
            lang: 'tree',
            caption: 'Un recorte del árbol de rutas y qué URL genera cada archivo.',
            code: `src/app/
├── layout.tsx               # layout raíz: <html>, fuentes, providers
├── (platform)/              # grupo: comparte sidebar, no aparece en la URL
│   ├── layout.tsx
│   ├── desarrollo/
│   │   ├── page.tsx         # → /desarrollo
│   │   ├── loading.tsx      # skeleton mientras carga
│   │   └── opengraph-image.tsx
│   └── consejos/[id]/
│       └── page.tsx         # → /consejos/:id
├── autenticacion/           # → /autenticacion/iniciar-sesion, /registro…
├── api/search/route.ts      # → GET /api/search?q=…
├── sitemap.ts               # → /sitemap.xml
└── robots.ts                # → /robots.txt`,
          },
          {
            file: 'src/app/(platform)/consejos/[id]/opengraph-image.tsx',
            lang: 'tsx',
            caption:
              'La imagen para redes de cada consejo se genera con los datos del consejo. `params` es una Promise en Next 15+.',
            code: `export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Consejo de la comunidad programaConNosotros';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const advise = await prisma.advise.findUnique({
    where: { id },
    select: { content: true, author: { select: { name: true } } },
  });

  return renderTerminalCard({
    path: 'consejos',
    command: advise ? \`fortune --from "\${advise.author.name}"\` : 'fortune',
    title: advise ? \`“\${advise.content}”\` : 'Consejos de la comunidad',
    meta: advise ? [\`@\${advise.author.name}\`] : [],
  });
}`,
          },
        ],
        docsUrl: 'https://nextjs.org/docs/app',
      },
      {
        id: 'server-components',
        name: 'React Server Components',
        tagline: 'componentes que corren solo en el servidor',
        what: 'En el App Router todo componente es, por defecto, un Server Component: se ejecuta en el servidor, puede ser `async`, puede leer la base de datos o secretos directamente, y al navegador le llega solo el HTML resultante (su código no se suma al bundle de JavaScript). Cuando necesitás estado, efectos o eventos del navegador, marcás el archivo con `"use client"` y pasa a ser un Client Component.',
        concepts: [
          {
            term: 'async components',
            detail:
              'Un Server Component puede hacer `await` adentro del cuerpo: no hace falta `useEffect` ni un endpoint intermedio para traer datos.',
          },
          {
            term: '"use client"',
            detail:
              'Marca la frontera: ese archivo y todo lo que importe se manda al navegador. Conviene poner la frontera lo más abajo posible del árbol.',
          },
          {
            term: 'props serializables',
            detail:
              'De servidor a cliente solo pasan datos que se puedan serializar (strings, números, objetos planos, fechas, JSX). Funciones no, salvo server actions.',
          },
          {
            term: 'APIs dinámicas',
            detail:
              '`cookies()`, `headers()` y `params` son asíncronas desde Next 15: siempre van con `await`.',
          },
        ],
        usage: [
          'Las páginas leen la base con Prisma directamente desde el componente. Por ejemplo, la página de un consejo busca el consejo y su autor sin pasar por una API.',
          'Los componentes interactivos (formularios, el buscador, PCN OS, el cursor hacker) son Client Components, y las páginas los usan como hojas del árbol.',
        ],
        examples: [
          {
            file: 'src/app/(platform)/consejos/[id]/page.tsx',
            lang: 'tsx',
            caption:
              '`generateMetadata` corre en el servidor, espera `params` y consulta la base para armar el título de la pestaña.',
            code: `export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const advise = await prisma.advise.findUnique({
    where: { id: params.id },
    select: {
      content: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  // …
}

export default async function AdvisePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sessionId = (await cookies()).get('sessionId');
  // …
}`,
          },
        ],
        docsUrl: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
      },
      {
        id: 'streaming',
        name: 'Streaming y Suspense',
        tagline: 'mandar la página por partes',
        what: 'Con streaming, el servidor manda el HTML a medida que lo tiene listo en vez de esperar a que termine todo. `<Suspense>` marca una parte que puede tardar: mientras se resuelve se muestra el `fallback` y, cuando los datos llegan, React reemplaza el skeleton por el contenido sin recargar.',
        concepts: [
          {
            term: '<Suspense fallback>',
            detail:
              'Envuelve un componente async lento. El resto de la página se ve enseguida; solo esa parte espera.',
          },
          {
            term: 'loading.tsx',
            detail:
              'Un Suspense a nivel de ruta: cubre la página entera mientras se resuelve, ideal para que la navegación responda al instante.',
          },
          {
            term: 'caché de fetch',
            detail:
              '`fetch(url, { next: { revalidate: 3600 } })` guarda la respuesta y la vuelve a pedir como mucho una vez por hora.',
          },
        ],
        usage: [
          'Esta misma página es el ejemplo: las estadísticas de colaboración piden datos a la API de GitHub, que puede tardar, así que van dentro de un `<Suspense>` con un skeleton. El resto de /desarrollo se muestra sin esperar.',
          'Cada sección tiene además su `loading.tsx` con skeletons que imitan la forma real de la página.',
        ],
        examples: [
          {
            file: 'src/app/(platform)/desarrollo/page.tsx',
            lang: 'tsx',
            code: `<Section title="Estadísticas de colaboración">
  <Suspense fallback={<CollaborationStatsSkeleton />}>
    <CollaborationStats />
  </Suspense>
</Section>`,
          },
          {
            file: 'src/app/(platform)/desarrollo/loading.tsx',
            lang: 'tsx',
            code: `export default function Loading() {
  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <ProseSkeleton paragraphs={8} />
        </div>
      </div>
    </>
  );
}`,
          },
        ],
        docsUrl: 'https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming',
      },
      {
        id: 'server-actions',
        name: 'Server Actions',
        tagline: 'funciones del servidor que llamás desde el cliente',
        what: 'Una Server Action es una función `async` en un archivo marcado con `"use server"`. Desde un componente del cliente la llamás como cualquier función, pero Next la ejecuta en el servidor a través de un POST que arma solo. Reemplazan a la mayoría de los endpoints REST para mutaciones: crear, editar, borrar.',
        concepts: [
          {
            term: '"use server"',
            detail:
              'Todas las funciones exportadas del archivo pasan a ser endpoints. Por eso cada una tiene que validar sus argumentos y chequear permisos: cualquiera puede invocarlas.',
          },
          {
            term: 'revalidatePath',
            detail:
              'Después de mutar, invalida la caché de una ruta para que la próxima visita muestre los datos nuevos.',
          },
          {
            term: 'redirect',
            detail:
              'Corta la ejecución lanzando una excepción especial y manda al usuario a otra URL.',
          },
        ],
        usage: [
          'Las acciones viven en `src/actions`, agrupadas por dominio (`auth`, `events`, `testimonials`, `talks`…), un archivo por acción y su test al lado.',
          'Todas siguen el mismo patrón: límite de envíos, validación con Zod, sesión desde la cookie, escritura con Prisma y `revalidatePath` de las páginas afectadas.',
        ],
        examples: [
          {
            file: 'src/actions/testimonials/create-testimonial.ts',
            lang: 'ts',
            code: `'use server';

import prisma from '@/lib/prisma';
import { testimonialSchema, TestimonialFormData } from '@/schemas/testimonial-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
// …

export const createTestimonial = async (data: TestimonialFormData) => {
  await enforceRateLimit('createContent');

  const validatedData = testimonialSchema.parse(data);

  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('Debes estar autenticado para crear un testimonio');
  }
  // …
  const testimonial = await prisma.testimonial.create({
    data: {
      body: validatedData.body,
      userId: session.userId,
    },
  });
  // …
  revalidatePath('/testimonios');
};`,
          },
        ],
        docsUrl: 'https://nextjs.org/docs/app/getting-started/updating-data',
      },
      {
        id: 'route-handlers',
        name: 'Route Handlers y Proxy',
        tagline: 'endpoints HTTP y la capa antes del request',
        what: 'Un `route.ts` dentro de `app/` define un endpoint HTTP: exportás funciones con el nombre del método (`GET`, `POST`…) que reciben un `Request` y devuelven un `Response`. El `proxy.ts` (antes llamado `middleware.ts`, renombrado en Next 16) corre antes de cada request que matchee su `matcher` y puede redirigir, reescribir o tocar headers.',
        concepts: [
          {
            term: 'route.ts',
            detail:
              'Útil cuando el que llama no es un componente React: el buscador global, feeds, webhooks, descargas.',
          },
          {
            term: 'Response.json()',
            detail: 'La API web estándar para devolver JSON, sin helpers propios de Next.',
          },
          {
            term: 'proxy.ts',
            detail:
              'Se ejecuta antes de renderizar. Next recomienda usarlo como último recurso y resolver la autorización cerca de los datos.',
          },
        ],
        usage: [
          'El buscador (⌘K) consulta `/api/search`, que mezcla un índice estático de las páginas con eventos, charlas, consejos y proyectos de la base.',
          'El proxy está preparado para `/perfil`, pero hoy deja pasar todo: los permisos se verifican en cada página y cada server action.',
        ],
        examples: [
          {
            file: 'src/app/api/search/route.ts',
            lang: 'ts',
            code: `export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH);

  if (!query) {
    return Response.json({ query, results: [] } satisfies SearchResponse);
  }

  let databaseEntries: Awaited<ReturnType<typeof loadDatabaseEntries>> = [];
  try {
    databaseEntries = await loadDatabaseEntries(query);
  } catch (error) {
    // Static content is still searchable when the database is unavailable.
    console.error('search: database lookup failed', error);
  // …
}`,
          },
          {
            file: 'src/proxy.ts',
            lang: 'ts',
            code: `export function proxy(_request: NextRequest) {
  // …
  return NextResponse.next();
}

export const config = {
  matcher: ['/perfil/:path*'],
};`,
          },
        ],
        docsUrl: 'https://nextjs.org/docs/app/api-reference/file-conventions/route',
      },
    ],
  },
  {
    id: 'frontend',
    title: 'frontend',
    notes: [
      {
        id: 'react',
        name: 'React 19',
        tagline: 'la UI como función del estado',
        what: 'React es una librería para construir interfaces con componentes: funciones que reciben props y devuelven JSX. Cuando cambia el estado, React vuelve a ejecutar el componente y actualiza en el DOM solo lo que cambió. Los hooks (`useState`, `useEffect`, `useMemo`…) son la forma de darle estado y efectos a esas funciones.',
        concepts: [
          {
            term: 'componentes',
            detail: 'Piezas reutilizables y componibles. Se nombran en PascalCase y devuelven JSX.',
          },
          {
            term: 'hooks',
            detail:
              'Funciones `use…` que solo se llaman en el nivel superior de un componente o de otro hook, nunca dentro de ifs o loops.',
          },
          {
            term: 'custom hooks',
            detail:
              'Extraen lógica con estado a una función reutilizable (por ejemplo `useContentMarks`).',
          },
          {
            term: 'context / providers',
            detail:
              'Comparten un valor con todo un subárbol sin pasarlo prop por prop. Así se inyectan el tema y el cliente de React Query.',
          },
        ],
        usage: [
          'Los componentes están en `src/components`, agrupados por feature (`events/`, `talks/`, `os/`…). Los hooks propios están en `src/hooks`.',
          'El layout raíz monta los providers globales una sola vez. Como necesitan estado del navegador, cada provider es un Client Component chico que recibe `children`.',
        ],
        examples: [
          {
            file: 'src/components/react-query-provider.tsx',
            lang: 'tsx',
            caption:
              'El `useState` asegura que el `QueryClient` se cree una sola vez por pestaña y no en cada render.',
            code: `'use client';

import { useState, type PropsWithChildren } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState(new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};`,
          },
        ],
        docsUrl: 'https://react.dev/learn',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        tagline: 'JavaScript con tipos que se chequean antes de correr',
        what: 'TypeScript agrega tipos estáticos a JavaScript. El compilador revisa que uses bien cada valor (que no llames a algo que puede ser `null`, que no le pases un string a algo que espera un número) y después borra los tipos: en runtime es JavaScript normal. El editor usa esa información para autocompletar y refactorizar.',
        concepts: [
          {
            term: 'uniones discriminadas',
            detail:
              'Un tipo que es "una de varias formas" distinguidas por un campo común. Al chequear ese campo, TS sabe qué otros campos existen.',
          },
          {
            term: 'satisfies',
            detail:
              'Valida que un valor cumpla un tipo sin perder el tipo literal más preciso que infiere TS.',
          },
          {
            term: 'tipos derivados',
            detail:
              '`z.infer`, `ReturnType`, `Awaited` y `keyof typeof` sacan tipos de código que ya existe, así hay una sola fuente de verdad.',
          },
        ],
        usage: [
          'Todo el proyecto es TypeScript en modo estricto. Prisma genera los tipos de cada modelo y Zod los de cada formulario, así que casi nunca escribimos tipos a mano para los datos.',
          'Antes de pushear, `pnpm build` corre el chequeo de tipos: si no compila, no se pushea.',
        ],
        examples: [
          {
            file: 'src/actions/auth/sign-in.ts',
            lang: 'ts',
            caption:
              'El resultado es una unión discriminada por `success` y `error`: quien llama sabe que `email` solo existe en el caso `EMAIL_NOT_VERIFIED`.',
            code: `export const signIn = async (
  data: z.infer<typeof formSchema>,
): Promise<
  | { success: true; redirectTo: string }
  | { success: false; error: 'INVALID_CREDENTIALS' }
  | { success: false; error: 'EMAIL_NOT_VERIFIED'; email: string }
> => {`,
          },
          {
            file: 'src/lib/rate-limit.ts',
            lang: 'ts',
            caption:
              '`satisfies` chequea la forma de cada regla y `keyof typeof` convierte las claves en un tipo: `enforceRateLimit("typo")` no compila.',
            code: `export const RATE_LIMITS = {
  signIn: { limit: 20, windowSeconds: 15 * 60 },
  signUp: { limit: 5, windowSeconds: 60 * 60 },
  // …
  photoDownload: { limit: 30, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;`,
          },
        ],
        docsUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        tagline: 'estilos con clases utilitarias',
        what: 'Tailwind es un framework de CSS "utility-first": en vez de escribir hojas de estilo con clases semánticas, componés el diseño con clases chicas que hacen una sola cosa (`p-4`, `font-mono`, `border-b`). En el build escanea el código y genera solo el CSS de las clases que usás. Los variants (`hover:`, `md:`, `dark:`) aplican una clase bajo una condición.',
        concepts: [
          {
            term: 'design tokens',
            detail:
              'Colores, fuentes y espaciados se definen en `tailwind.config.ts` y se usan como clases (`text-pcnGreen`, `border-pcnGreen-200`).',
          },
          {
            term: 'variants custom',
            detail:
              'Con un plugin podés crear tus propios prefijos condicionales con `addVariant`.',
          },
          {
            term: 'valores arbitrarios',
            detail:
              'Corchetes para valores puntuales fuera de la escala: `text-[11px]`, `pb-[env(safe-area-inset-bottom)]`.',
          },
          {
            term: 'cn()',
            detail:
              '`clsx` arma la lista de clases condicionales y `tailwind-merge` resuelve conflictos (si pasás `p-2` y `p-4`, gana la última).',
          },
        ],
        usage: [
          'La paleta `pcnGreen` es el verde fósforo del sitio con 9 niveles de opacidad. Las líneas finas de las grillas son `border-pcnGreen-200`.',
          'Definimos dos variants propios para PCN OS: `os:` aplica en pantallas grandes cuando la página es el escritorio, y `embedded:` cuando la página está dentro de una ventana de PCN OS (un iframe). Un script en el layout raíz marca `data-embedded` en `<html>` antes del primer paint para que no haya parpadeo.',
        ],
        examples: [
          {
            file: 'tailwind.config.ts',
            lang: 'ts',
            code: `// PCN OS variants:
// - \`os:\` applies on large screens when the page is the desktop host (not inside a window).
// - \`embedded:\` applies when the page is rendered inside a PCN OS window (an iframe).
// The \`data-embedded\` attribute is set before paint by the script in the root layout.
function addPcnOsVariants({ addVariant }: any) {
  addVariant('os', '@media (min-width: 1024px) { html:not([data-embedded]) & }');
  addVariant('embedded', 'html[data-embedded] &');
}`,
          },
          {
            file: 'src/components/ui/mobile-nav.tsx',
            lang: 'tsx',
            caption:
              'La barra de navegación mobile se oculta en desktop (`md:hidden`) y dentro de una ventana de PCN OS (`embedded:hidden`).',
            code: `className="pointer-events-auto fixed inset-x-0 bottom-0 z-[60] bg-transparent pb-[env(safe-area-inset-bottom)] embedded:hidden md:hidden"`,
          },
          {
            file: 'src/components/ui/ruled-grid.tsx',
            lang: 'tsx',
            caption:
              'La grilla "con reglas" del sitio: celdas que comparten líneas finas en vez de flotar como tarjetas.',
            code: `// A grid whose cells share hairlines instead of floating as separate cards:
// the grid draws the top/left edge and every cell draws its own bottom/right.
export const RuledGrid = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid border-l border-t border-pcnGreen-200', className)} {...props} />
);`,
          },
        ],
        docsUrl: 'https://tailwindcss.com/docs',
      },
      {
        id: 'shadcn',
        name: 'shadcn/ui + Radix',
        tagline: 'componentes accesibles que son tuyos',
        what: 'shadcn/ui no es una dependencia: es una colección de componentes que copiás a tu repo y modificás a gusto. Por debajo usan Radix UI, primitivas sin estilos que resuelven la parte difícil (foco, teclado, ARIA, portales) de diálogos, menús, tabs o selects. Los estilos los ponés vos con Tailwind.',
        concepts: [
          {
            term: 'primitivas headless',
            detail:
              'Radix da el comportamiento y la accesibilidad; la apariencia queda 100% en tus manos.',
          },
          {
            term: 'cva',
            detail:
              '`class-variance-authority` define variantes (`variant`, `size`) como un mapa de clases, con tipos generados para las props.',
          },
          {
            term: 'Slot / asChild',
            detail:
              'Permite que un `<Button asChild>` le pase sus estilos al hijo, por ejemplo un `<Link>`, sin anidar un botón dentro de un link.',
          },
        ],
        usage: [
          'Los componentes están en `src/components/ui` y fueron rediseñados con la estética de terminal: botones con texto en mono que se leen como llamadas a funciones (`abrirGitHub();`), tabs, diálogos y menús con bordes en verde fósforo.',
        ],
        examples: [
          {
            file: 'src/components/ui/button.tsx',
            lang: 'tsx',
            code: `// Buttons with a fill and a border label their action as a function call, e.g. \`crearEvento();\`.
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-mono text-sm font-medium …',
  {
    variants: {
      variant: {
        default: primaryCta,
        destructive:
          'border border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20 …',
        outline: secondaryCta,
        ghost: 'text-foreground/80 hover:bg-pcnGreen-100 hover:text-pcnGreen',
        link: 'text-pcnGreen underline-offset-4 hover:underline',
        pcn: primaryCta,
        // …
      },
    },
  },
);`,
          },
        ],
        docsUrl: 'https://ui.shadcn.com/docs',
      },
      {
        id: 'forms',
        name: 'Zod + React Hook Form',
        tagline: 'un schema, validado en el cliente y en el servidor',
        what: 'Zod describe la forma de los datos con un schema y lo valida en runtime: `schema.parse(x)` devuelve el dato tipado o lanza un error con mensajes por campo. React Hook Form maneja el estado de los formularios sin re-renderizar todo en cada tecla; con `zodResolver` usa el schema de Zod para validar.',
        concepts: [
          {
            term: 'schema',
            detail:
              'Fuente de verdad de un formulario: reglas, mensajes de error y, con `z.infer`, también el tipo TypeScript.',
          },
          {
            term: 'zodResolver',
            detail: 'Conecta el schema a `useForm` para validar y mostrar los errores por campo.',
          },
          {
            term: 'doble validación',
            detail:
              'El cliente valida para dar feedback rápido; el servidor vuelve a validar porque el cliente no es confiable.',
          },
        ],
        usage: [
          'Los schemas viven en `src/schemas` y se importan desde los dos lados: el formulario los usa con `zodResolver` y la server action hace `parse` con el mismo schema.',
        ],
        examples: [
          {
            file: 'src/schemas/testimonial-schema.ts',
            lang: 'ts',
            code: `import { z } from 'zod';

export const testimonialSchema = z.object({
  body: z.string().min(10, { message: 'El testimonio debe tener al menos 10 caracteres' }),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;`,
          },
          {
            file: 'src/components/talk-proposals/new-talk-proposal-form.tsx',
            lang: 'tsx',
            caption:
              'Un formulario con una lista dinámica de oradores: `useFieldArray` agrega y saca filas.',
            code: `const form = useForm<TalkProposalFormData>({
  resolver: zodResolver(talkProposalSchema),
  defaultValues: {
    title: '',
    description: '',
    speakers: [defaults.firstSpeaker],
  },
});

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'speakers',
});`,
          },
        ],
        docsUrl: 'https://zod.dev',
      },
      {
        id: 'react-query',
        name: 'TanStack Query',
        tagline: 'estado del servidor en el cliente',
        what: 'TanStack Query (React Query) cachea en el cliente datos que vienen del servidor. Cada consulta tiene una `queryKey`; la librería deduplica pedidos, los reintenta, los refresca cuando quedan viejos y permite actualizaciones optimistas: mostrar el cambio antes de que el servidor confirme y deshacerlo si falla.',
        concepts: [
          {
            term: 'useQuery',
            detail: 'Lee y cachea. `staleTime` define cuánto tiempo el dato se considera fresco.',
          },
          {
            term: 'useMutation',
            detail: 'Escribe. Tiene hooks de ciclo de vida: `onMutate`, `onError`, `onSettled`.',
          },
          {
            term: 'optimistic update',
            detail:
              'En `onMutate` guardás el estado anterior y escribís el nuevo en la caché; en `onError` lo restaurás.',
          },
        ],
        usage: [
          'Lo usamos donde la UI tiene que responder al instante, como marcar un artículo como leído o un video como visto. Las funciones de la query son server actions, así que no hay endpoints intermedios.',
        ],
        examples: [
          {
            file: 'src/hooks/use-content-marks.ts',
            lang: 'ts',
            code: `const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () => getContentMarks(contentType),
  staleTime: 60 * 1000,
});
// …
const mutation = useMutation({
  mutationFn: async (changes: SetMarkInput[]) => { /* … */ },
  onMutate: async (changes) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<MarksData>(queryKey);
    queryClient.setQueryData<MarksData>(queryKey, (current) => { /* … */ });
    return { previous };
  },
  onError: (_error, _changes, context) => {
    queryClient.setQueryData(queryKey, context?.previous);
    toast.error('No pudimos guardar el cambio. Probá de nuevo.');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey }),
});`,
          },
        ],
        docsUrl: 'https://tanstack.com/query/latest/docs/framework/react/overview',
      },
    ],
  },
  {
    id: 'datos',
    title: 'backend y datos',
    notes: [
      {
        id: 'prisma',
        name: 'Prisma',
        tagline: 'ORM con tipos generados y migraciones',
        what: 'Prisma es un ORM para Node.js. Describís los modelos en `schema.prisma`, Prisma genera un cliente con tipos para cada tabla y relación, y Prisma Migrate convierte los cambios del schema en archivos SQL versionados que se aplican en orden en cada base.',
        concepts: [
          {
            term: 'schema.prisma',
            detail:
              'Modelos, campos, relaciones, índices y enums en un solo archivo, que es la fuente de verdad de la base.',
          },
          {
            term: 'Prisma Client',
            detail:
              '`prisma.user.findUnique({ where, select, include })`: consultas tipadas, con autocompletado de campos y relaciones.',
          },
          {
            term: 'migraciones',
            detail:
              'Cada cambio del schema es una carpeta en `prisma/migrations` con su `migration.sql`. En producción se aplican con `prisma migrate deploy`.',
          },
          {
            term: 'singleton',
            detail:
              'En desarrollo el hot reload recarga módulos; guardar el cliente en `globalThis` evita abrir una conexión nueva en cada recarga.',
          },
        ],
        usage: [
          'El schema tiene decenas de modelos (usuarios, sesiones, eventos, charlas, galería, proyectos…) y más de 70 migraciones desde 2024. El cliente se regenera solo en `postinstall` y `prebuild`.',
          'Para un cambio de schema: editás `schema.prisma`, creás la migración con `pnpm create-migration <nombre>`, revisás el SQL generado y lo commiteás junto con el cambio.',
        ],
        examples: [
          {
            file: 'prisma/schema.prisma',
            lang: 'prisma',
            code: `model Testimonial {
  id        String   @id @default(cuid())
  body      String
  userId    String // Usuario que creó el testimonio (requerido)
  featured  Boolean  @default(false) // Si aparece en la home page
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@index([featured])
}`,
          },
          {
            file: 'prisma/migrations/20261008130000_add_user_instagram_url/migration.sql',
            lang: 'sql',
            code: `-- AlterTable
ALTER TABLE "User" ADD COLUMN "instagramUrl" TEXT;`,
          },
          {
            file: 'src/lib/prisma.ts',
            lang: 'ts',
            code: `import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;`,
          },
        ],
        docsUrl: 'https://www.prisma.io/docs',
      },
      {
        id: 'postgres',
        name: 'PostgreSQL',
        tagline: 'la base de datos relacional',
        what: 'PostgreSQL es una base de datos relacional open-source: tablas con filas y columnas tipadas, relaciones con claves foráneas, transacciones ACID e índices para que las consultas no recorran la tabla entera. Se consulta con SQL; en este proyecto casi siempre a través de Prisma.',
        concepts: [
          {
            term: 'claves foráneas',
            detail:
              '`onDelete: Cascade` en Prisma se traduce a una FK que borra las filas hijas al borrar la madre.',
          },
          {
            term: 'índices',
            detail:
              'Aceleran filtros y ordenamientos frecuentes (`@@index([createdAt])`) a cambio de un poco más de costo al escribir.',
          },
          {
            term: 'búsqueda sin mayúsculas',
            detail:
              '`mode: "insensitive"` en Prisma usa `ILIKE` de Postgres para buscar ignorando mayúsculas.',
          },
        ],
        usage: [
          'En local Postgres corre en Docker Compose. Cada git worktree tiene además su propia base aislada, creada por `scripts/setup-worktree-db.sh`, así podés probar migraciones en una branch sin romper la de otra.',
        ],
        examples: [
          {
            file: 'docker-compose.yml',
            lang: 'yaml',
            code: `database:
  image: postgres:13
  container_name: pcn-db
  restart: always
  environment:
    - POSTGRES_USER=\${POSTGRES_USER}
    - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    - POSTGRES_DB=\${POSTGRES_DB}
  ports:
    - '5432:5432'
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U $\${POSTGRES_USER} -d $\${POSTGRES_DB}']
    interval: 5s
    timeout: 5s
    retries: 5`,
          },
          {
            file: 'src/app/api/search/route.ts',
            lang: 'ts',
            code: `const contains = { contains: query, mode: 'insensitive' as const };
const [events, talks, advises, projects] = await Promise.all([
  prisma.event.findMany({
    where: { deletedAt: null, OR: [{ name: contains }, { description: contains }] },
    orderBy: { date: 'desc' },
    take: DB_CANDIDATES,
    // …
  }),
  // …
]);`,
          },
        ],
        docsUrl: 'https://www.postgresql.org/docs/current/tutorial.html',
      },
      {
        id: 'auth',
        name: 'Autenticación propia',
        tagline: 'sesiones en la base + cookie httpOnly',
        what: 'Autenticar es verificar quién sos; autorizar es decidir qué podés hacer. Un esquema clásico de sesiones: al loguearte, el servidor crea un registro de sesión y te manda su id en una cookie `httpOnly` (JavaScript no la puede leer). En cada request el servidor busca esa sesión para saber quién sos. Las contraseñas nunca se guardan en texto plano, sino como hash con un algoritmo lento como bcrypt.',
        concepts: [
          {
            term: 'bcrypt',
            detail:
              'Hash con sal y costo configurable: aunque se filtre la base, recuperar las contraseñas es carísimo.',
          },
          {
            term: 'cookie httpOnly',
            detail:
              'Protege la sesión de scripts inyectados (XSS). `sameSite: "lax"` ayuda contra CSRF y `secure` la limita a HTTPS.',
          },
          {
            term: 'rate limiting',
            detail:
              'Limitar intentos por usuario o IP frena ataques de fuerza bruta y el spam de formularios.',
          },
          {
            term: 'mensajes genéricos',
            detail:
              'Responder "credenciales inválidas" tanto si el email no existe como si la contraseña está mal evita revelar qué emails están registrados.',
          },
        ],
        usage: [
          'No usamos un proveedor externo: el modelo `Session` vive en Postgres y la cookie se llama `sessionId`. `getCurrentSession()` la resuelve en Server Components y server actions. Registrarse requiere verificar el email con un código de 6 dígitos.',
          'Todos los formularios pasan por `enforceRateLimit`, una ventana deslizante en memoria (alcanza porque el sitio corre en un solo proceso). Los admins no tienen límite.',
        ],
        examples: [
          {
            file: 'src/actions/auth/sign-in.ts',
            lang: 'ts',
            code: `const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
  return { success: false, error: 'INVALID_CREDENTIALS' };
}

if (!user.emailVerified) {
  return { success: false, error: 'EMAIL_NOT_VERIFIED', email };
}

const session = await prisma.session.create({
  data: {
    userId: user.id,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  },
});

(await cookies()).set('sessionId', session.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
});`,
          },
          {
            file: 'src/actions/auth/get-current-session.ts',
            lang: 'ts',
            code: `export const getCurrentSession = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) return null;

  return prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });
};`,
          },
        ],
        docsUrl:
          'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
      },
      {
        id: 'aws',
        name: 'AWS S3 + CloudFront',
        tagline: 'archivos subidos directo del navegador',
        what: 'S3 es el almacenamiento de objetos de AWS: guardás archivos (imágenes, videos) en un "bucket" bajo una clave. CloudFront es su CDN: copia esos archivos en servidores cerca de cada visitante. Una URL prefirmada es un permiso temporal firmado por el servidor para que el navegador suba o baje un archivo puntual sin conocer las credenciales.',
        concepts: [
          {
            term: 'URL prefirmada',
            detail:
              'El archivo va del navegador a S3 sin pasar por nuestro servidor, que solo firma el permiso (válido 5 minutos).',
          },
          {
            term: 'Cache-Control immutable',
            detail:
              'Si la clave cambia cada vez que cambia el archivo, se puede cachear para siempre.',
          },
          {
            term: 'remotePatterns',
            detail:
              'Lista de dominios desde los que `next/image` acepta optimizar imágenes remotas.',
          },
        ],
        usage: [
          'Los flyers de eventos, las fotos de perfil, los logos de proyectos y la galería se guardan en S3 y se sirven por CloudFront.',
          'Los archivos de la galería son privados: CloudFront solo los entrega con una URL firmada que generamos al renderizar. Cómo se optimizan las fotos y los videos antes de llegar ahí está en la nota de la galería, más abajo.',
        ],
        examples: [
          {
            file: 'src/lib/s3.ts',
            lang: 'ts',
            code: `const uniqueFileName = \`\${folder}/\${Date.now()}-\${crypto.randomUUID()}.\${extension}\`;

const command = new PutObjectCommand({
  Bucket: S3_BUCKET,
  Key: uniqueFileName,
  ContentType: contentType,
});

// URL válida por 5 minutos
// Firmar host y content-type para que el navegador pueda enviar el content-type correcto
const uploadUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 300,
  signableHeaders: new Set(['host', 'content-type']),
});

return { uploadUrl, fileUrl: publicFileUrl(uniqueFileName), key: uniqueFileName };`,
          },
          {
            file: 'next.config.mjs',
            lang: 'js',
            code: `// CloudFront CDN for uploaded event flyers / photos
...(process.env.AWS_CLOUDFRONT_URL
  ? [{ protocol: 'https', hostname: new URL(process.env.AWS_CLOUDFRONT_URL).hostname }]
  : []),`,
          },
        ],
        docsUrl: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html',
      },
      {
        id: 'email',
        name: 'Nodemailer + MailHog',
        tagline: 'emails reales en prod, atrapados en local',
        what: 'Nodemailer es la librería estándar de Node para mandar emails por SMTP. MailHog es un servidor SMTP falso para desarrollo: acepta todos los emails y los muestra en una interfaz web, así podés probar flujos de verificación sin mandarle nada a nadie.',
        concepts: [
          {
            term: 'SMTP',
            detail: 'El protocolo con el que los servidores se pasan emails.',
          },
          {
            term: 'transport',
            detail:
              'La configuración de a dónde manda Nodemailer: un host SMTP cualquiera o un servicio conocido como Gmail.',
          },
        ],
        usage: [
          'Los códigos de verificación de cuenta y de recuperación de contraseña se mandan por email. Con Docker Compose, MailHog queda en http://localhost:18025 para ver lo que el sitio "envió".',
        ],
        examples: [
          {
            file: 'src/lib/email.ts',
            lang: 'ts',
            code: `return nodemailer.createTransport({
  host: smtpHost,
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  ...(smtpUser && smtpPass ? { auth: { user: smtpUser, pass: smtpPass } } : {}),
});
// …
// Modo producción: Gmail requiere credenciales obligatoriamente
return nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});`,
          },
        ],
        docsUrl: 'https://nodemailer.com/about/',
      },
      {
        id: 'github-api',
        name: 'GitHub REST API',
        tagline: 'las estadísticas de esta página',
        what: 'GitHub expone una API REST pública para leer repos, commits, pull requests y contribuidores. Sin token permite 60 requests por hora por IP; con token, muchas más. Algunos endpoints de estadísticas se calculan en segundo plano y responden `202` hasta que el resultado está listo.',
        concepts: [
          {
            term: 'paginación',
            detail:
              'Las listas vienen de a páginas; el header `Link` trae la URL de la última página, que sirve para contar sin bajar todo.',
          },
          {
            term: 'revalidate',
            detail:
              'Cachear la respuesta en Next mantiene el uso de la API muy por debajo del límite.',
          },
          {
            term: 'Promise.all',
            detail: 'Los pedidos independientes salen en paralelo en vez de uno atrás del otro.',
          },
        ],
        usage: [
          'La sección "Estadísticas de colaboración" de esta página sale de `src/lib/github-stats.ts`: estrellas, commits, PRs mergeadas, tiempo mediano hasta el merge y el ranking de contribuidores. Si GitHub no responde, la sección se oculta en vez de romper la página.',
        ],
        examples: [
          {
            file: 'src/lib/github-stats.ts',
            lang: 'ts',
            code: `const response = await fetch(\`\${API}\${path}\`, {
  headers,
  next: { revalidate: REVALIDATE_SECONDS },
  signal: AbortSignal.timeout(8000),
});
if (!response.ok) throw new Error(\`GitHub \${path} responded \${response.status}\`);
// …

/** Total item count of a paginated endpoint, read from the \`rel="last"\` page of \`per_page=1\`. */
const countFromLinkHeader = (response: Response, fallback: number) => {
  const match = response.headers.get('link')?.match(/[?&]page=(\\d+)>; rel="last"/);
  return match ? Number(match[1]) : fallback;
};`,
          },
        ],
        docsUrl: 'https://docs.github.com/en/rest',
      },
    ],
  },
  {
    id: 'calidad',
    title: 'testing y calidad',
    notes: [
      {
        id: 'jest',
        name: 'Jest',
        tagline: 'tests unitarios de las server actions',
        what: 'Jest es un framework de testing para JavaScript: corre archivos `*.test.ts`, te da `describe`/`it`/`expect` y un sistema de mocks para reemplazar dependencias (la base, las cookies) por dobles controlados. Un test unitario prueba una unidad aislada: rápido y determinista.',
        concepts: [
          {
            term: 'jest.mock',
            detail:
              'Reemplaza un módulo entero. Se "hoistea" arriba del archivo, antes de los imports.',
          },
          {
            term: 'mockDeep',
            detail:
              '`jest-mock-extended` crea un mock tipado de todo el cliente de Prisma, con cada método como `jest.fn()`.',
          },
          {
            term: 'Arrange · Act · Assert',
            detail:
              'Preparás los mocks, llamás a la función y verificás el resultado y los efectos.',
          },
        ],
        usage: [
          'Cada server action tiene su test al lado (`sign-in.ts` → `sign-in.test.ts`). `jest.setup.ts` mockea globalmente Prisma, `next/headers`, `next/cache` y `next/navigation`, así los tests no necesitan base ni servidor.',
        ],
        examples: [
          {
            file: 'jest.setup.ts',
            lang: 'ts',
            code: `jest.mock('@/lib/prisma', () => {
  const { mockDeep } = require('jest-mock-extended');
  return {
    __esModule: true,
    default: mockDeep(),
  };
});
// …
// redirect() normally throws to interrupt control flow; replicate that here so
// tests can assert on it with .rejects.toThrow('NEXT_REDIRECT:/some/path')
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(\`NEXT_REDIRECT:\${url}\`);
  }),
}));`,
          },
          {
            file: 'src/actions/auth/sign-in.test.ts',
            lang: 'ts',
            code: `it('returns INVALID_CREDENTIALS when password is wrong', async () => {
  prismaMock.user.findUnique.mockResolvedValue(baseUser as any);
  (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

  const result = await signIn(validInput);

  expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
  expect(prismaMock.session.create).not.toHaveBeenCalled();
});`,
          },
        ],
        docsUrl: 'https://jestjs.io/docs/getting-started',
      },
      {
        id: 'playwright',
        name: 'Playwright',
        tagline: 'un navegador de verdad, manejado por código',
        what: 'Playwright controla Chromium, Firefox y WebKit desde código. Sirve para tests end-to-end (abrir la página, hacer clic, verificar lo que se ve, como lo haría una persona) y para automatizar el navegador en general, por ejemplo sacar capturas.',
        concepts: [
          {
            term: 'E2E',
            detail:
              'Prueba el sistema entero: frontend, backend y base juntos. Más lento que un unitario, pero agarra errores de integración.',
          },
          {
            term: 'locators',
            detail:
              '`page.getByRole(…)` busca elementos como los ve un usuario (rol y texto) y no por clases CSS frágiles.',
          },
          {
            term: 'projects',
            detail: 'Un mismo test corre en varios navegadores o tamaños de pantalla.',
          },
        ],
        usage: [
          'Los tests E2E están en `tests/` y corren en los tres motores. Además usamos Playwright para las capturas de las PRs: `pnpm screenshot /ruta` abre cada ruta en Chromium y guarda la página completa.',
        ],
        examples: [
          {
            file: 'tests/example.spec.ts',
            lang: 'ts',
            code: `test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page).toHaveTitle('programaConNosotros');
});`,
          },
          {
            file: 'scripts/pr-screenshots.mjs',
            lang: 'js',
            code: `const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});

for (const route of routes) {
  // …
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
}`,
          },
        ],
        docsUrl: 'https://playwright.dev/docs/intro',
      },
      {
        id: 'git-hooks',
        name: 'ESLint · Prettier · Husky',
        tagline: 'la calidad se chequea sola antes de pushear',
        what: 'ESLint analiza el código buscando errores y malas prácticas (por ejemplo, romper las reglas de los hooks). Prettier lo formatea siempre igual, así nadie discute de comas. Husky instala git hooks: scripts que git corre antes de un commit o de un push. lint-staged corre comandos solo sobre los archivos que estás commiteando.',
        concepts: [
          {
            term: 'pre-commit',
            detail: 'Corre al hacer `git commit`. Acá: Prettier sobre los archivos staged.',
          },
          {
            term: 'pre-push',
            detail:
              'Corre al hacer `git push` y lo cancela si algo falla: lint, formato, tests y build.',
          },
          {
            term: 'eslint-config-prettier',
            detail: 'Apaga las reglas de ESLint que se pisarían con Prettier.',
          },
        ],
        usage: [
          'Prettier usa `prettier-plugin-tailwindcss`, que además ordena las clases de Tailwind en un orden consistente.',
        ],
        examples: [
          {
            file: '.husky/pre-push',
            lang: 'sh',
            code: `pnpm lint
pnpm format:check
pnpm test
pnpm build`,
          },
          {
            file: 'package.json',
            lang: 'json',
            code: `"lint-staged": {
  "*.{js,jsx,ts,tsx,json,jsonc,css,scss,md,mjs,cjs}": "prettier --write"
}`,
          },
        ],
        docsUrl: 'https://typicode.github.io/husky/',
      },
    ],
  },
  {
    id: 'infra',
    title: 'infraestructura',
    notes: [
      {
        id: 'docker',
        name: 'Docker y Docker Compose',
        tagline: 'el mismo entorno en todas las máquinas',
        what: 'Docker empaqueta una aplicación con todo lo que necesita (sistema, Node, dependencias) en una imagen; un contenedor es esa imagen corriendo, aislado del resto. Docker Compose levanta varios contenedores relacionados (web, base, mail) con un solo comando y los conecta en una red privada donde se encuentran por nombre.',
        concepts: [
          {
            term: 'Dockerfile',
            detail: 'La receta paso a paso para construir la imagen.',
          },
          {
            term: 'volúmenes',
            detail:
              'Montan carpetas del host en el contenedor: así el código que editás se ve adentro sin reconstruir.',
          },
          {
            term: 'healthcheck + depends_on',
            detail:
              'La web arranca recién cuando Postgres responde, no cuando su contenedor apenas existe.',
          },
        ],
        usage: [
          '`docker-compose up -d` levanta la web, Postgres y MailHog para desarrollar. En producción se construye `Dockerfile.prod`, que instala dependencias y hace el build de Next dentro de la imagen.',
        ],
        examples: [
          {
            file: 'Dockerfile.prod',
            lang: 'dockerfile',
            code: `FROM node:24.16.0
WORKDIR /app
COPY . .
RUN npm install -g pnpm@9.4.0
RUN pnpm install \\
		&& pnpm run build
EXPOSE 3000
CMD ["pnpm", "start"]`,
          },
          {
            file: 'docker-compose.yml',
            lang: 'yaml',
            code: `web:
  build: .
  container_name: pcn-web
  restart: always
  ports:
    - '3000:3000'
  volumes:
    - .:/app
    - /app/node_modules
  depends_on:
    database:
      condition: service_healthy
    mailhog:
      condition: service_started`,
          },
        ],
        docsUrl: 'https://docs.docker.com/get-started/',
      },
      {
        id: 'kamal',
        name: 'Kamal + GitHub Actions',
        tagline: 'push a main = deploy a producción',
        what: 'GitHub Actions ejecuta workflows (CI/CD) en máquinas de GitHub cuando pasa algo en el repo, por ejemplo un push. Kamal es una herramienta de deploy: construye la imagen Docker, la sube a un registry, se conecta por SSH a tus servidores y reemplaza el contenedor viejo por el nuevo sin downtime, con un proxy que maneja HTTPS.',
        concepts: [
          {
            term: 'CI/CD',
            detail:
              'Integración y entrega continuas: cada cambio aprobado llega a producción de forma automática y repetible.',
          },
          {
            term: 'registry',
            detail:
              'Donde se guardan las imágenes construidas (en este caso, Amazon ECR) para que el servidor las descargue.',
          },
          {
            term: 'zero-downtime',
            detail:
              'kamal-proxy solo pasa el tráfico al contenedor nuevo cuando responde bien; recién ahí apaga el viejo.',
          },
          {
            term: 'secretos',
            detail:
              'Las credenciales viven en GitHub Secrets y llegan como variables de entorno; nunca se commitean.',
          },
        ],
        usage: [
          'Trabajamos en branches, las mergeamos a `testing` y de ahí a `main`. Cada push a `main` dispara el workflow: instala dependencias, aplica las migraciones pendientes con `prisma migrate deploy` y corre `kamal deploy`. El healthcheck que usa Kamal es la ruta `/up`.',
        ],
        examples: [
          {
            file: '.github/workflows/deployment.yml',
            lang: 'yaml',
            code: `on:
  workflow_dispatch:
  push:
    branches:
      - main
# …
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Prisma Migrations
        run: pnpm prisma migrate deploy

      - name: Run Kamal deploy
        run: kamal deploy`,
          },
          {
            file: 'config/deploy.yml',
            lang: 'yaml',
            code: `service: pcn-website
# …
proxy:
  host: programaconnosotros.com
  ssl: true
  app_port: 3000
# …
builder:
  arch: amd64
  context: .
  dockerfile: Dockerfile.prod
  cache:
    type: gha`,
          },
        ],
        docsUrl: 'https://kamal-deploy.org/docs/installation/',
      },
      {
        id: 'portless',
        name: 'pnpm · portless · worktrees',
        tagline: 'un entorno local por branch, sin pelear por puertos',
        what: 'pnpm es un package manager que guarda cada versión de cada paquete una sola vez en disco y la enlaza en cada proyecto: instala rápido y es estricto con las dependencias no declaradas. portless le da a cada servidor de desarrollo una URL estable `https://<nombre>.localhost` en vez de un puerto. Los git worktrees permiten tener varias branches del mismo repo en carpetas distintas al mismo tiempo.',
        concepts: [
          {
            term: 'lockfile',
            detail:
              '`pnpm-lock.yaml` fija la versión exacta de cada dependencia; `--frozen-lockfile` falla si no coincide con `package.json`.',
          },
          {
            term: 'overrides',
            detail:
              'Fuerzan la versión de una dependencia transitiva, por ejemplo para tapar una vulnerabilidad.',
          },
          {
            term: 'git worktree',
            detail:
              'Otra carpeta con otra branch del mismo repo, sin clonar de nuevo: ideal para revisar una PR sin frenar lo tuyo.',
          },
        ],
        usage: [
          '`pnpm dev` corre Next a través de portless: el checkout principal responde en `https://pcn-website.localhost` y un worktree en la branch `foo` en `https://foo.pcn-website.localhost`. Cada worktree tiene su propia base de datos, creada automáticamente.',
        ],
        examples: [
          {
            file: 'package.json',
            lang: 'json',
            code: `"dev": "portless run next dev",
"dev:docker": "next dev",
"setup-worktree-db": "bash scripts/setup-worktree-db.sh",`,
          },
          {
            file: 'scripts/setup-worktree-db.sh',
            lang: 'bash',
            code: `# ── 4. Derive the per-worktree database name ─────────────────────────────────
WORKTREE_BASENAME=$(basename "$CUR")
# lowercase, replace non-alphanumeric runs with _, strip trailing underscores
DB_NAME="pcn_$(echo "$WORKTREE_BASENAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_' | sed 's/_*$//')"`,
          },
        ],
        docsUrl: 'https://pnpm.io/motivation',
      },
    ],
  },
  {
    id: 'modulos',
    title: 'módulos del sitio',
    notes: [
      {
        id: 'galeria',
        name: 'Galería · fotos y videos optimizados',
        tagline: 'del celular a la CDN: WebP, H.264 y URLs firmadas',
        what: 'Optimizar medios es achicar lo que baja cada visitante sin que se note: redimensionar al tamaño en que realmente se va a ver, recomprimir en formatos modernos (WebP para fotos, H.264 en MP4 para video), borrar metadatos que no hacen falta y servir una versión chica (thumbnail) en las grillas y la grande solo cuando alguien la abre. Una foto de celular pesa entre 3 y 10 MB y un minuto de video 4K cientos de MB; servidos tal cual, una grilla de fotos se vuelve inusable con datos móviles.',
        concepts: [
          {
            term: 'WebP',
            detail:
              'Formato de imagen de Google que pesa bastante menos que JPEG a calidad similar y que hoy soportan todos los navegadores.',
          },
          {
            term: 'EXIF',
            detail:
              'Metadatos que la cámara guarda en la foto: fecha, modelo, orientación y, muchas veces, la ubicación GPS exacta. Publicarlos tal cual es un problema de privacidad.',
          },
          {
            term: 'orientación',
            detail:
              'El sensor guarda la foto siempre "acostada" y un flag EXIF dice cómo girarla. Si borrás los metadatos sin aplicar antes ese giro, la foto queda de costado.',
          },
          {
            term: 'thumbnail',
            detail:
              'Versión chica de la imagen para grillas y listados. La original solo se descarga al abrirla.',
          },
          {
            term: 'WebCodecs',
            detail:
              'API del navegador que da acceso a los encoders y decoders de video del sistema: permite recomprimir un video en la compu del que lo sube, sin servidores de transcodificación.',
          },
          {
            term: 'H.264 vs HEVC',
            detail:
              'Codecs de video. Los iPhone graban en HEVC, que no todos los navegadores reproducen; H.264 en un MP4 se ve en todos lados.',
          },
          {
            term: 'fast start',
            detail:
              'Poner el índice del MP4 (el átomo `moov`) al principio del archivo para que el video arranque mientras se sigue descargando.',
          },
          {
            term: 'presigned POST',
            detail:
              'A diferencia del PUT prefirmado, lleva una policy con condiciones que S3 hace cumplir, como `content-length-range` para limitar el tamaño.',
          },
          {
            term: 'URL firmada de CloudFront',
            detail:
              'URL con una firma y una fecha de vencimiento: sin ella la CDN no entrega el archivo, así nadie puede listar ni enlazar los archivos para siempre.',
          },
          {
            term: 'loading="lazy"',
            detail:
              'El navegador posterga la descarga de una imagen hasta que está por entrar en pantalla.',
          },
        ],
        usage: [
          'Solo los admins suben contenido, desde `/galeria/subir`. Los archivos nunca pasan por nuestro servidor de ida: el navegador los manda directo a S3 con URLs prefirmadas, de a uno por vez, y después una server action termina el trabajo. Mientras sube, la página pide un wake lock para que el celular no apague la pantalla y avisa antes de cerrar la pestaña.',
          'Fotos: en el navegador, `exifr` lee la fecha en que se sacó (`DateTimeOriginal` o `CreateDate`, y si no hay EXIF la fecha del archivo) para precompletar el formulario. HEIC se rechaza porque sharp no lo decodifica. El original va a `gallery/originals/` con un PUT prefirmado de 5 minutos; después `createPhoto` lo baja, `optimizePhoto` lo gira según el EXIF y genera dos WebP sin metadatos (GPS incluido): `full` de 2560 px a calidad 80 y `thumb` de 640 px a calidad 70. Se guardan bajo una carpeta con UUID, se borra el original y se crea el `GalleryItem` con el ancho y el alto.',
          'Videos: antes de subirlo, `readVideo` carga el archivo en un `<video>` oculto para leer duración y medidas y captura un cuadro (al segundo 1, o a un décimo en clips cortos) en un canvas como portada JPEG de hasta 1280 px; si el navegador no puede, la portada es negra. Después `compressVideo` lo recodifica en el navegador con Mediabunny (WebCodecs): H.264 + AAC en MP4 con fast start, lado corto de hasta 1080 px, hasta 30 fps y 5 Mbps, más o menos 40 MB por minuto. Si el navegador no puede (sin `VideoEncoder`, o Firefox, que no codifica AAC y perdería el audio) o el resultado no es más chico, se sube el original.',
          'El video se sube con un presigned POST de 15 minutos cuya policy rechaza más de 500 MB. `createVideo` verifica con un HEAD que el archivo llegó y convierte la portada a WebP (1280 px, calidad 75) con sharp. No hay ffmpeg ni transcodificación en el servidor: todo el trabajo pesado lo hace el navegador de quien sube.',
          'Todo lo que está bajo `gallery/` se guarda con `Cache-Control: public, max-age=31536000, immutable` (cada archivo nuevo es una clave nueva, así que nunca hay que invalidar caché) y CloudFront solo lo entrega con URL firmada. `signGalleryItem` firma al renderizar la página, con vencimiento al final de la hora siguiente: la misma foto tiene la misma URL durante toda una hora, así el navegador y la CDN la cachean.',
          'En la UI, la grilla usa solo los thumbnails de 640 px con `<img loading="lazy" decoding="async">`; al pasar las 94 fotos viejas a thumbnails, la grilla pasó de ~16 MB a 3,3 MB. Cada foto o video tiene su página `/galeria/[id]` con la versión grande o un `<video preload="metadata">` con la portada, que reproduce el MP4 progresivo y salta con range requests. Las flechas del teclado navegan y `router.prefetch` precalienta las vecinas. Los filtros por tipo, evento y persona viven en la URL, y la descarga del original pasa por `/api/galeria/[id]/descargar`, con rate limit de 30 por hora, que devuelve una URL prefirmada de S3 con `Content-Disposition: attachment`.',
        ],
        examples: [
          {
            file: 'src/lib/photo-processing.ts',
            lang: 'ts',
            caption:
              '`.rotate()` sin argumentos aplica la orientación del EXIF; sharp no copia los metadatos a la salida salvo que se lo pidas, así que el GPS desaparece. `clone()` reusa la misma decodificación para las dos versiones.',
            code: `export const FULL_SIZE = 2560;
export const THUMB_SIZE = 640;

const resize = { fit: 'inside', withoutEnlargement: true } as const;

export async function optimizePhoto(input: Buffer) {
  const image = sharp(input, { failOn: 'none' }).rotate();

  const [full, thumb] = await Promise.all([
    image
      .clone()
      .resize({ width: FULL_SIZE, height: FULL_SIZE, ...resize })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true }),
    image
      .clone()
      .resize({ width: THUMB_SIZE, height: THUMB_SIZE, ...resize })
      .webp({ quality: 70 })
      .toBuffer(),
  ]);

  return { full: full.data, thumb, width: full.info.width, height: full.info.height };
}`,
          },
          {
            file: 'src/components/photo-gallery/upload-media.ts',
            lang: 'ts',
            caption:
              'La fecha de la foto sale del EXIF en el navegador. `exifr` se importa dinámicamente para no sumarlo al bundle de las páginas que no suben fotos.',
            code: `export async function readTakenAt(file: File) {
  if (!isVideo(file)) {
    try {
      const { default: exifr } = await import('exifr');
      const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']);
      const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
      if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
    } catch {
      // No EXIF: fall back to the file date.
    }
  }
  return new Date(file.lastModified);
}`,
          },
          {
            file: 'src/components/photo-gallery/upload-media.ts',
            lang: 'ts',
            caption:
              'La compresión de video corre en el navegador. Si la conversión perdiera una pista (audio o video) o el navegador no puede codificar H.264, devuelve `null` y se sube el original.',
            code: `// Videos are re-encoded in the browser before uploading: H.264 (plays everywhere, unlike the
// HEVC iPhones record) with the short side capped at 1080p, at a bitrate that keeps a minute
// around 40 MB instead of the hundreds a 4K phone clip weighs.
const COMPRESSED_MAX_SHORT_SIDE = 1080;
// 60 fps phone clips come out at twice the bitrate; 30 is plenty for event videos.
const COMPRESSED_MAX_FRAME_RATE = 30;
const COMPRESSED_VIDEO_BITRATE = 5_000_000;
const COMPRESSED_AUDIO_BITRATE = 128_000;
// …
    if (!(await canEncodeVideo('avc', { ...size, quality }))) return null;

    const target = new BufferTarget();
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
    const conversion = await Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: {
        codec: 'avc',
        ...size,
        fit: 'contain',
        frameRate,
        quality,
        // Bake the phone's rotation into the frames so every player shows it upright.
        allowTransformationMetadata: false,
        forceTranscode: true,
      },
      audio: { codec: 'aac', quality: new Quality({ bitrate: COMPRESSED_AUDIO_BITRATE }) },
      showWarnings: false,
    });
    // Keep both picture and sound: Firefox, for one, can't encode AAC and would drop the audio.
    const audioTrack = await input.getPrimaryAudioTrack();
    const keepsAll = [track, audioTrack].every((t) => !t || conversion.utilizedTracks.includes(t));
    if (!conversion.isValid || !keepsAll) return null;`,
          },
          {
            file: 'src/components/photo-gallery/photo-uploader.tsx',
            lang: 'tsx',
            caption:
              'El flujo de un video: comprimir, subir con POST firmado, subir la portada y recién ahí crear el registro.',
            code: `if (item.video) {
  update(item.key, { status: 'compressing' });
  const compressed = await compressVideo(item.file, (progress) =>
    update(item.key, { progress }),
  ).catch(() => null);
  const file = compressed?.file ?? item.file;

  update(item.key, { status: 'uploading', progress: 0, uploadedSize: compressed?.file.size });
  const { url, fields, key } = await getVideoUploadUrl(file.type, file.size);
  await postFile(url, fields, file, (progress) => update(item.key, { progress }));

  const poster = await getPhotoUploadUrl('poster.jpg', 'image/jpeg');
  await putFile(poster.uploadUrl, item.video.poster, 'image/jpeg');

  created = await createVideo(key, poster.key, {
  // …`,
          },
          {
            file: 'src/lib/s3.ts',
            lang: 'ts',
            caption:
              'Con un POST firmado es S3 el que rechaza un archivo de más de `maxBytes`, aunque alguien manipule el navegador.',
            code: `export async function getPresignedPost(key: string, contentType: string, maxBytes: number) {
  return createPresignedPost(s3Client, {
    Bucket: S3_BUCKET,
    Key: key,
    Conditions: [
      ['content-length-range', 1, maxBytes],
      ['eq', '$Content-Type', contentType],
    ],
    Fields: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
    Expires: 15 * 60,
  });
}`,
          },
          {
            file: 'src/lib/gallery-signing.ts',
            lang: 'ts',
            caption:
              'El vencimiento se redondea a la hora para que la URL no cambie en cada render y se pueda cachear.',
            code: `export function signGallerySrc(src: string, now = Date.now()) {
  const expiresAt = new Date(Math.ceil(now / HOUR_MS) * HOUR_MS + HOUR_MS);
  if (!isSignedGallerySrc(src)) return { url: src, expiresAt };
  if (!KEY_PAIR_ID || !PRIVATE_KEY) throw new Error('Falta configurar la firma de CloudFront');

  const url = getSignedUrl({
    url: src,
    keyPairId: KEY_PAIR_ID,
    privateKey: PRIVATE_KEY,
    dateLessThan: expiresAt.toISOString(),
  });
  return { url, expiresAt };
}
// …
export const signGalleryItem = <T extends { src: string; thumbSrc: string }>(item: T) => ({
  ...item,
  thumbUrl: signGallerySrc(item.thumbSrc).url,
  fullUrl: signGallerySrc(item.src).url,
});`,
          },
          {
            file: 'src/components/photo-gallery/photo-card.tsx',
            lang: 'tsx',
            caption:
              'En la grilla solo se cargan los thumbnails, y recién cuando están por entrar en pantalla.',
            code: `{/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src={photo.thumbUrl}
  alt=""
  loading="lazy"
  decoding="async"
  className="h-full w-full object-cover object-top brightness-[0.8] saturate-[0.7] …"
/>`,
          },
        ],
        docsUrl: 'https://sharp.pixelplumbing.com/api-output#webp',
        sourcePath: 'src/components/photo-gallery',
      },
    ],
  },
];
