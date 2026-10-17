import { render, screen, within } from '@testing-library/react';
import type { TechNoteGroup } from '@/app/(platform)/desarrollo/tech-notes';
import { TechNotes } from './tech-notes';

// The real one is an async server component that runs shiki.
jest.mock('./highlighted-code', () => ({
  HighlightedCode: ({ code, lang }: { code: string; lang: string }) => (
    <pre data-lang={lang}>{code}</pre>
  ),
}));

const groups: TechNoteGroup[] = [
  {
    id: 'framework',
    title: 'el framework',
    notes: [
      {
        id: 'nextjs',
        name: 'Next.js',
        tagline: 'el router',
        what: 'Usa `app/` para rutear y ` sueltos',
        concepts: [{ term: 'page.tsx', detail: 'hace pública la `carpeta`' }],
        usage: ['Las rutas viven en `src/app`.'],
        examples: [
          {
            file: 'src/app/page.tsx',
            lang: 'tsx',
            caption: 'mirá `export default`',
            code: 'export default function Page() {}',
          },
        ],
        docsUrl: 'https://nextjs.org/docs',
        sourcePath: 'src/app',
      },
      {
        id: 'prisma',
        name: 'Prisma',
        tagline: 'el ORM',
        what: 'Un ORM.',
        concepts: [],
        usage: [],
        examples: [
          { file: 'a.ts', lang: 'ts', code: 'const a = 1;' },
          { file: 'b.ts', lang: 'ts', code: 'const b = 2;' },
        ],
      },
    ],
  },
];

describe('TechNotes', () => {
  it('renders each group with its notes as collapsible details', () => {
    const { container } = render(<TechNotes groups={groups} />);

    expect(screen.getByText(/ls notas\/framework/)).toBeInTheDocument();
    expect(screen.getByText('# el framework')).toBeInTheDocument();
    expect(container.querySelector('details#nota-nextjs')).not.toBeNull();
    expect(container.querySelector('details#nota-prisma')).not.toBeNull();
    expect(screen.getByText('1 ejemplo')).toBeInTheDocument();
    expect(screen.getByText('2 ejemplos')).toBeInTheDocument();
  });

  it('turns backtick spans into inline code and leaves lone backticks as text', () => {
    const { container } = render(<TechNotes groups={groups} />);
    const codes = Array.from(container.querySelectorAll('code')).map((c) => c.textContent);

    expect(codes).toEqual(['app/', 'carpeta', 'src/app', 'export default']);
    expect(screen.getByText(/para rutear y ` sueltos/)).toBeInTheDocument();
  });

  it('links examples, the source folder and the docs', () => {
    render(<TechNotes groups={groups} />);

    expect(screen.getByRole('link', { name: '~/src/app/page.tsx' })).toHaveAttribute(
      'href',
      'https://github.com/programaconnosotros/pcn-website/blob/main/src/app/page.tsx',
    );
    expect(screen.getByRole('link', { name: /cd src\/app/ })).toHaveAttribute(
      'href',
      'https://github.com/programaconnosotros/pcn-website/tree/main/src/app',
    );
    expect(screen.getByRole('link', { name: /man nextjs/ })).toHaveAttribute(
      'href',
      'https://nextjs.org/docs',
    );
    expect(screen.queryByRole('link', { name: /man prisma/ })).not.toBeInTheDocument();
    expect(screen.getByText('export default function Page() {}')).toHaveAttribute(
      'data-lang',
      'tsx',
    );
  });

  it('omits the caption when an example has none', () => {
    const { container } = render(<TechNotes groups={groups} />);
    const prisma = container.querySelector<HTMLElement>('#nota-prisma')!;
    expect(within(prisma).getAllByRole('figure')).toHaveLength(2);
    expect(within(prisma).queryByText(/mirá/)).not.toBeInTheDocument();
  });
});
