import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import { TableOfContents, type TocSection } from '@/components/ui/table-of-contents';
import { ComponentGallery, HeaderRowDemo } from '@/components/desarrollo/diseno/component-gallery';
import { documentedComponents } from '@/components/desarrollo/diseno/component-list';
import { ForcedStateStyles } from '@/components/desarrollo/diseno/forced-state-styles';
import { GreenScale, SemanticSwatches } from '@/components/desarrollo/diseno/token-swatches';
import { cn } from '@/lib/utils';
import {
  borderRules,
  cursorRules,
  darkModeRules,
  designDebt,
  iconRules,
  milestones,
  motionRules,
  prChecklist,
  principles,
  spacingRules,
  typeScale,
  voiceRules,
  type Rule,
} from './design-system';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const REPO_URL = 'https://github.com/programaconnosotros/pcn-website';
const DESCRIPTION =
  'El design system del website de PCN: cómo encontramos la estética de terminal, los principios de diseño para gente nerd, los tokens y cada componente con sus estados.';

export const metadata: Metadata = {
  title: 'Diseño UX/UI',
  description: DESCRIPTION,
  openGraph: {
    title: 'Diseño UX/UI | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/desarrollo/diseno`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diseño UX/UI | programaConNosotros',
    description: DESCRIPTION,
  },
};

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

const SubHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-2 mt-5 font-mono text-sm text-pcnGreen first:mt-0">
    <span className="text-pcnGreen-500">### </span>
    {children}
  </h3>
);

const Lead = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{children}</p>
);

const Code = ({ children }: { children: ReactNode }) => (
  <code className="bg-pcnGreen-100 px-1 font-mono text-pcnGreen">{children}</code>
);

const DefinitionList = ({ items }: { items: Rule[] }) => (
  <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[200px_1fr]">
    {items.map((item) => (
      <div key={item.term} className="contents">
        <dt className="font-mono text-pcnGreen">{item.term}</dt>
        <dd className="leading-relaxed text-muted-foreground">{item.detail}</dd>
      </div>
    ))}
  </dl>
);

const pad = (n: number) => String(n).padStart(2, '0');

const voiceExamples = [
  { yes: 'crearEvento();', no: 'Crear evento' },
  { yes: '~/eventos/meetup', no: 'Inicio > Eventos > Meetup' },
  { yes: '$ sin resultados para "cobol"', no: '¡Ups! No encontramos nada' },
  { yes: '> HANDLE', no: 'Nombre de usuario *' },
  { yes: '// se ve en tu perfil', no: 'Este campo será visible públicamente' },
  { yes: 'ERR ese handle ya está en uso', no: 'Error: campo inválido' },
];

const tocSections: TocSection[] = [
  { id: 'audiencia', title: 'Para quién es' },
  { id: 'historia', title: 'Cómo llegamos acá' },
  { id: 'principios', title: 'Principios' },
  { id: 'color', title: 'Color' },
  { id: 'tipografia', title: 'Tipografía' },
  { id: 'espaciado', title: 'Espaciado y densidad' },
  { id: 'bordes', title: 'Bordes y hairlines' },
  { id: 'movimiento', title: 'Movimiento' },
  { id: 'cursor', title: 'Cursor' },
  { id: 'iconografia', title: 'Iconografía' },
  { id: 'modo-oscuro', title: 'Modo oscuro' },
  { id: 'voz', title: 'Voz y copy' },
  { id: 'componentes', title: 'Componentes' },
  ...documentedComponents.map((component) => ({
    id: `componente-${component.id}`,
    title: component.name,
    group: 'componentes',
  })),
  { id: 'deuda', title: 'Deuda de diseño' },
  { id: 'checklist', title: 'Checklist de PR' },
];

const DisenoPage = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <ForcedStateStyles />
    <div className="mt-4">
      <StickyHeader pinnedOnDesktop>
        <div className="flex items-start justify-between gap-4">
          <PageTitle
            path="desarrollo/diseno"
            className="min-w-0 flex-1"
            meta="design system · hecho para gente nerd"
          />
          <div className="flex flex-wrap justify-end gap-2">
            {/* On phones the ~/desarrollo crumb is the way back; there is no room for both buttons. */}
            <Link href="/desarrollo" className="max-sm:hidden">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                volver();
              </Button>
            </Link>
            <Link
              href={`${REPO_URL}/tree/main/src/components/ui`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="pcn" size="sm" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                verCodigo();
              </Button>
            </Link>
          </div>
        </div>
      </StickyHeader>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <TableOfContents sections={tocSections} path="desarrollo/diseno" label="Índice" />
        <div className="min-w-0 flex-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <Section id="audiencia" title="Para quién es este website">
            <p className="mb-3 max-w-3xl border-l-2 border-pcnGreen-500 pl-3 font-mono text-sm leading-relaxed text-foreground">
              No es un sitio para cualquier persona. Es para gente súper nerd, apasionada por el
              software, y está optimizado para que esa gente tenga una gran experiencia.
            </p>
            <Lead>
              Esa es la decisión de diseño de la que salen todas las demás. Un sitio para todo el
              mundo tiene que explicar cada cosa, esconder la densidad y sonar neutro; uno para
              nerds puede hablar en el idioma de la terminal, mostrar mucha información por
              pantalla, premiar a quien usa el teclado y esconder detalles para quien los busque
              (probá <Code>?</Code>, <Code>⌘K</Code> o <Code>gg</Code>). El sitio no se achica para
              gustarle a todo el mundo: quien llega con curiosidad aprende el idioma rápido.
            </Lead>
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-pcnGreen-500">$ </span>
              pro · moderno · hacky · compacto · al grano
            </p>
          </Section>

          <Section id="historia" title="Cómo llegamos a esta estética">
            <Lead>
              La estética actual no salió de un Figma: se fue encontrando commit a commit, sacando
              cosas más que agregándolas. Esta es la historia contada desde <Code>git log</Code>;
              cada hito linkea a sus commits.
            </Lead>
            <ol className="relative space-y-4 border-l border-pcnGreen-200 pl-4">
              {milestones.map((milestone) => (
                <li key={milestone.date} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2.5 border border-pcnGreen bg-background" />
                  <p className="font-mono text-[11px] text-pcnGreen-600">{milestone.date}</p>
                  <h3 className="font-mono text-sm font-semibold">{milestone.title}</h3>
                  <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                    {milestone.detail}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-2 font-mono text-[10px]">
                    {milestone.commits.map((sha) => (
                      <a
                        key={sha}
                        href={`${REPO_URL}/commit/${sha}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pcnGreen-500 underline-offset-2 hover:text-pcnGreen hover:underline"
                      >
                        {sha.slice(0, 7)}
                      </a>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="principios" title="Principios de diseño">
            <Lead>Ocho reglas, en orden de importancia. Cuando dos chocan, gana la de arriba.</Lead>
            <RuledGrid className="grid-cols-1 xl:grid-cols-2">
              {principles.map((principle, index) => (
                <div key={principle.title} className={cn(ruledCellClassName, 'p-3')}>
                  <h3 className="font-mono text-sm font-semibold">
                    <span className="text-pcnGreen-500">{pad(index + 1)} </span>
                    {principle.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {principle.why}
                  </p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 font-mono text-[11px]">
                    <dt className="text-pcnGreen">✓ sí</dt>
                    <dd className="text-foreground/80">{principle.doThis}</dd>
                    <dt className="text-red-400">✗ no</dt>
                    <dd className="text-foreground/60">{principle.notThis}</dd>
                  </dl>
                </div>
              ))}
            </RuledGrid>
          </Section>

          <Section id="color" title="Color">
            <Lead>
              Negro con un tinte verde y un único acento: el verde fósforo <Code>#04f4be</Code>. Los
              tokens semánticos de shadcn viven en <Code>src/app/globals.css</Code> (bloque{' '}
              <Code>.dark</Code>) y la escala <Code>pcnGreen</Code> en{' '}
              <Code>tailwind.config.ts</Code>. Los valores de abajo se leen en vivo de las variables
              CSS de esta página.
            </Lead>
            <SubHeading>Tokens semánticos</SubHeading>
            <SemanticSwatches />
            <SubHeading>Escala pcnGreen: un color, diez opacidades</SubHeading>
            <p className="mb-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              En lugar de tonos más claros u oscuros, la escala es el mismo verde con más o menos
              alfa: sobre negro se lee como fósforo más o menos encendido y nunca desentona.
            </p>
            <GreenScale />
            <SubHeading>Los otros colores</SubHeading>
            <DefinitionList
              items={[
                {
                  term: 'red-500 / red-400',
                  detail: 'Errores, borrar y el badge "En curso". Nunca decorativo.',
                },
                { term: 'amber-400', detail: 'Advertencias (toasts y avisos de cupo).' },
                {
                  term: 'pcnPurple',
                  detail:
                    'Herencia de la marca original; queda en un puñado de lugares y no se usa en UI nueva.',
                },
                {
                  term: 'Marcas de terceros',
                  detail:
                    'Logos y colores de YouTube, partners, etc. solo dentro de su propio contexto.',
                },
              ]}
            />
          </Section>

          <Section id="tipografia" title="Tipografía">
            <Lead>
              Geist es la única familia del sitio: <Code>font-sans</Code> (Geist Sans) para leer y{' '}
              <Code>font-mono</Code> (Geist Mono) para todo lo que es chrome de terminal: títulos,
              labels, botones, meta, fechas y campos. <Code>font-serif</Code> está remapeada a Geist
              Sans para que nunca entre otra familia.
            </Lead>
            <RuledGrid className="mb-4 grid-cols-1 md:grid-cols-2">
              <div className={cn(ruledCellClassName, 'p-3')}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-pcnGreen-600">
                  font-sans · Geist Sans
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  Una comunidad de gente que programa, comparte lo que aprende y se junta a hacer
                  cosas. El cuerpo de texto se lee cómodo en párrafos largos.
                </p>
              </div>
              <div className={cn(ruledCellClassName, 'p-3')}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-pcnGreen-600">
                  font-mono · Geist Mono
                </p>
                <p className="mt-2 font-mono text-sm leading-relaxed">
                  ~/eventos $ grep -i meetup
                  <br />
                  crearEvento(); 0O 1lI {'{}'} =&gt; !=
                </p>
              </div>
            </RuledGrid>
            <RuledGrid className="grid-cols-1">
              {typeScale.map((step) => (
                <div
                  key={step.className}
                  className={cn(
                    ruledCellClassName,
                    'grid items-baseline gap-x-4 gap-y-1 px-3 py-2 sm:grid-cols-[110px_1fr_1.2fr]',
                  )}
                >
                  <span className="font-mono text-[11px] text-pcnGreen-600">
                    {step.className} · {step.size}
                  </span>
                  <span className={cn(step.className, step.mono && 'font-mono', 'truncate')}>
                    {step.mono ? '~/programaConNosotros' : 'Programá con nosotros'}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.use}</span>
                </div>
              ))}
            </RuledGrid>
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              Pesos: 400 para texto, 500 para controles y 600 (<Code>font-semibold</Code>) para
              títulos; nunca bold extremo. Labels y tabs en UPPERCASE con{' '}
              <Code>tracking-[0.14em]</Code>; el resto en minúscula o como se escribe.
            </p>
          </Section>

          <Section id="espaciado" title="Espaciado, densidad y alturas">
            <Lead>
              Escala de Tailwind (múltiplos de 4px) usada con disciplina: pocas medidas que se
              repiten en todo el sitio. Lo más importante es la altura de los controles, porque es
              lo que hace que una fila se vea prolija.
            </Lead>
            <DefinitionList items={spacingRules} />
            <SubHeading>Una fila de header: todo mide h-8</SubHeading>
            <div className="border border-dashed border-pcnGreen-200 p-3">
              <HeaderRowDemo />
            </div>
          </Section>

          <Section id="bordes" title="Bordes, hairlines y esquinas">
            <DefinitionList items={borderRules} />
            <SubHeading>Líneas compartidas, no cards</SubHeading>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 font-mono text-[11px] text-pcnGreen">✓ RuledGrid</p>
                <RuledGrid className="grid-cols-2">
                  {['eventos', 'charlas', 'galería', 'cursos'].map((label) => (
                    <div key={label} className={cn(ruledCellClassName, 'p-3 font-mono text-xs')}>
                      ~/{label}
                    </div>
                  ))}
                </RuledGrid>
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] text-red-400">✗ cards con gap</p>
                <div className="grid grid-cols-2 gap-3 opacity-60">
                  {['eventos', 'charlas', 'galería', 'cursos'].map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs shadow-lg"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="movimiento" title="Movimiento">
            <Lead>
              El movimiento cuenta qué está pasando: algo se enfocó, algo falló, algo está cargando.
              Las animaciones viven en <Code>tailwind.config.ts</Code> y <Code>globals.css</Code>.
            </Lead>
            <DefinitionList items={motionRules} />
          </Section>

          <Section id="cursor" title="Cursor">
            <Lead>
              Con mouse, el puntero es parte de la terminal: marca qué es clickeable y qué va a
              pasar al hacer click. Vive en <Code>hacker-cursor.tsx</Code> y{' '}
              <Code>globals.css</Code>.
            </Lead>
            <DefinitionList items={cursorRules} />
          </Section>

          <Section id="iconografia" title="Iconografía">
            <DefinitionList items={iconRules} />
          </Section>

          <Section id="modo-oscuro" title="Modo oscuro">
            <DefinitionList items={darkModeRules} />
          </Section>

          <Section id="voz" title="Voz y copy">
            <DefinitionList items={voiceRules} />
            <SubHeading>Así sí, así no</SubHeading>
            <RuledGrid className="grid-cols-1 sm:grid-cols-2">
              {voiceExamples.map((example) => (
                <div
                  key={example.yes}
                  className={cn(ruledCellClassName, 'space-y-1 px-3 py-2 font-mono text-xs')}
                >
                  <p className="text-pcnGreen">✓ {example.yes}</p>
                  <p className="text-muted-foreground/70 line-through decoration-red-400/60">
                    ✗ {example.no}
                  </p>
                </div>
              ))}
            </RuledGrid>
          </Section>

          <Section id="componentes" title={`Componentes (${documentedComponents.length})`}>
            <Lead>
              Los componentes reales del sitio, importados de <Code>src/components</Code>: no son
              capturas ni copias. Cada uno muestra sus estados uno al lado del otro; los de
              interacción (<Code>:hover</Code>, <Code>:focus</Code>, <Code>:active</Code>) se
              fuerzan copiando las reglas CSS del sitio a un wrapper con{' '}
              <Code>data-force-state</Code>, como el addon de pseudo-estados de Storybook. Con el
              selector de estado mirás uno solo y en <Code>$ probalo</Code> lo usás de verdad.
            </Lead>
            <ComponentGallery />
          </Section>

          <Section id="deuda" title="Deuda de diseño">
            <Lead>
              Lo que todavía no sigue estas reglas. Si tocás alguno de estos archivos, es un buen
              momento para alinearlo.
            </Lead>
            <DefinitionList items={designDebt} />
          </Section>

          <Section id="checklist" title="Checklist para una PR de UI">
            <ul className="space-y-1">
              {prChecklist.map((item) => (
                <li key={item} className="flex items-start gap-2 font-mono text-xs leading-5">
                  <span className="shrink-0 text-pcnGreen-500">[ ]</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <p className="font-mono text-sm">
              <span className="text-pcnGreen-500">$ </span>
              ¿Algo de esto no te cierra? Proponé un cambio.
            </p>
            <Link href="/desarrollo">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                volver();
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DisenoPage;
