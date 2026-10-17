import { Fragment, type ReactNode } from 'react';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { HighlightedCode } from './highlighted-code';
import type { TechExample, TechNote, TechNoteGroup } from '@/app/(platform)/desarrollo/tech-notes';

const REPO_BLOB_URL = 'https://github.com/programaconnosotros/pcn-website/blob/main';
const REPO_TREE_URL = 'https://github.com/programaconnosotros/pcn-website/tree/main';

/** Renders `backtick` spans in a note's prose as inline code. */
const renderInline = (text: string): ReactNode =>
  text.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
      <code
        key={index}
        className="bg-pcnGreen-100 px-1 font-mono text-[0.92em] wrap-break-word text-pcnGreen"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );

const Heading = ({ children }: { children: ReactNode }) => (
  <h4 className="mb-1.5 font-mono text-xs font-semibold">
    <span className="text-pcnGreen-500"># </span>
    {children}
  </h4>
);

const CodeBlock = ({ example }: { example: TechExample }) => (
  <figure className="min-w-0 border border-pcnGreen-200 bg-black/40">
    <figcaption className="flex items-center justify-between gap-3 border-b border-pcnGreen-200 px-3 py-1.5 font-mono text-[11px]">
      <a
        href={`${REPO_BLOB_URL}/${example.file}`}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 truncate text-pcnGreen-800 underline-offset-4 hover:text-pcnGreen hover:underline"
        title="Ver el archivo completo en GitHub"
      >
        ~/{example.file}
      </a>
      <span className="shrink-0 text-muted-foreground">{example.lang}</span>
    </figcaption>
    {example.caption && (
      <p className="border-b border-pcnGreen-200 px-3 py-1.5 text-xs leading-relaxed text-muted-foreground">
        {renderInline(example.caption)}
      </p>
    )}
    <HighlightedCode code={example.code} lang={example.lang} />
  </figure>
);

const Note = ({ note }: { note: TechNote }) => (
  <details
    id={`nota-${note.id}`}
    className={cn(
      ruledCellClassName,
      'min-w-0 group scroll-mt-32 hover:open:bg-transparent lg:scroll-mt-16',
    )}
  >
    <summary className="flex cursor-pointer list-none items-start gap-2 px-3 py-2.5 font-mono group-open:border-b group-open:border-pcnGreen-200 group-open:bg-background/95 group-open:backdrop-blur-sm lg:group-open:sticky lg:group-open:top-16 lg:group-open:z-5 [&::-webkit-details-marker]:hidden">
      <span
        aria-hidden
        className="w-3 shrink-0 text-sm text-pcnGreen-500 transition-transform group-open:rotate-90"
      >
        ›
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold group-open:text-pcnGreen">{note.name}</span>
        <span className="block text-xs text-muted-foreground">{note.tagline}</span>
      </span>
      <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
        {note.examples.length} {note.examples.length === 1 ? 'ejemplo' : 'ejemplos'}
      </span>
    </summary>

    <div className="space-y-4 px-3 py-4 sm:pl-8">
      <div>
        <Heading>qué es</Heading>
        <p className="text-sm leading-relaxed text-muted-foreground">{renderInline(note.what)}</p>
      </div>

      <div>
        <Heading>conceptos clave</Heading>
        <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[180px_1fr]">
          {note.concepts.map((concept) => (
            <div key={concept.term} className="contents">
              <dt className="font-mono text-pcnGreen">{concept.term}</dt>
              <dd className="leading-relaxed text-muted-foreground">
                {renderInline(concept.detail)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <Heading>cómo lo usamos acá</Heading>
        <div className="space-y-2">
          {note.usage.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
              {renderInline(paragraph)}
            </p>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        <Heading>ejemplos del repo</Heading>
        {note.examples.map((example) => (
          <CodeBlock key={`${example.file}-${example.code.slice(0, 24)}`} example={example} />
        ))}
      </div>

      <div className="flex flex-col items-start gap-1 font-mono text-xs">
        {note.sourcePath && (
          <a
            href={`${REPO_TREE_URL}/${note.sourcePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-full wrap-break-word text-pcnGreen underline-offset-4 hover:underline"
          >
            <span className="text-pcnGreen-500">$ </span>cd {note.sourcePath} → ver el código ↗
          </a>
        )}
        {note.docsUrl && (
          <a
            href={note.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pcnGreen underline-offset-4 hover:underline"
          >
            <span className="text-pcnGreen-500">$ </span>man {note.id} → documentación oficial ↗
          </a>
        )}
      </div>
    </div>
  </details>
);

export const TechNotes = ({ groups }: { groups: TechNoteGroup[] }) => (
  <div className="min-w-0 space-y-5">
    {groups.map((group) => (
      <div key={group.id} className="min-w-0">
        <h3 className="mb-2 bg-background/95 font-mono text-xs text-muted-foreground backdrop-blur-sm lg:sticky lg:top-9 lg:z-10 lg:py-1.5">
          <span className="text-pcnGreen-500">$ </span>ls notas/{group.id}{' '}
          <span className="text-pcnGreen-700"># {group.title}</span>
        </h3>
        <RuledGrid className="grid-cols-1">
          {group.notes.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </RuledGrid>
      </div>
    ))}
  </div>
);
