import { screen, within } from '@testing-library/react';
import { documentedComponents } from '@/components/desarrollo/diseno/component-list';
import type { TocSection } from '@/components/ui/table-of-contents';
import { renderInPlatform } from '@/test/platform';
import { milestones, prChecklist, principles, typeScale } from './design-system';
import DisenoPage, { metadata } from './page';

// The live component gallery, the swatches (they read CSS variables) and the TOC have their own
// tests; stubs keep this one about what the page puts together.
jest.mock('@/components/desarrollo/diseno/component-gallery', () => ({
  ComponentGallery: () => <div data-testid="component-gallery" />,
  HeaderRowDemo: () => <div data-testid="header-row-demo" />,
}));
jest.mock('@/components/desarrollo/diseno/forced-state-styles', () => ({
  ForcedStateStyles: () => null,
}));
jest.mock('@/components/desarrollo/diseno/token-swatches', () => ({
  GreenScale: () => <div data-testid="green-scale" />,
  SemanticSwatches: () => <div data-testid="semantic-swatches" />,
}));
jest.mock('@/components/ui/table-of-contents', () => ({
  TableOfContents: ({ sections, label }: { sections: TocSection[]; label: string }) => (
    <ol aria-label={label}>
      {sections.map((section) => (
        <li key={section.id}>{section.id}</li>
      ))}
    </ol>
  ),
}));

const REPO = 'https://github.com/programaconnosotros/pcn-website';

describe('DisenoPage', () => {
  beforeEach(() => renderInPlatform(<DisenoPage />));

  it('has SEO metadata for /desarrollo/diseno', () => {
    expect(metadata.title).toBe('Diseño UX/UI');
    expect(metadata.openGraph).toMatchObject({
      title: 'Diseño UX/UI | programaConNosotros',
      url: expect.stringMatching(/\/desarrollo\/diseno$/),
    });
  });

  it('links back to /desarrollo and to the UI components on GitHub', () => {
    for (const back of screen.getAllByRole('link', { name: /volver/ })) {
      expect(back).toHaveAttribute('href', '/desarrollo');
    }
    expect(screen.getByRole('link', { name: /verCodigo/ })).toHaveAttribute(
      'href',
      `${REPO}/tree/main/src/components/ui`,
    );
  });

  it('indexes the sections and every documented component', () => {
    const ids = Array.from(
      screen.getByRole('list', { name: 'Índice' }).querySelectorAll('li'),
      (li) => li.textContent,
    );
    expect(ids).toEqual(expect.arrayContaining(['audiencia', 'componentes', 'checklist']));
    for (const component of documentedComponents) {
      expect(ids).toContain(`componente-${component.id}`);
    }
    expect(
      screen.getByRole('heading', { name: `## Componentes (${documentedComponents.length})` }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('component-gallery')).toBeInTheDocument();
  });

  it('tells the history with links to each milestone commit', () => {
    const history = within(document.getElementById('historia')!);
    const first = milestones[0];
    expect(history.getByRole('heading', { name: first.title })).toBeInTheDocument();
    expect(history.getByRole('link', { name: first.commits[0].slice(0, 7) })).toHaveAttribute(
      'href',
      `${REPO}/commit/${first.commits[0]}`,
    );
  });

  it('numbers the principles and shows the type scale', () => {
    expect(screen.getByRole('heading', { name: `01 ${principles[0].title}` })).toBeInTheDocument();
    const mono = typeScale.filter((step) => step.mono).length;
    expect(screen.queryAllByText('~/programaConNosotros')).toHaveLength(mono);
    expect(screen.queryAllByText('Programá con nosotros')).toHaveLength(typeScale.length - mono);
  });

  it('lists the PR checklist as unchecked boxes', () => {
    const checklist = within(document.getElementById('checklist')!);
    expect(checklist.getAllByText('[ ]')).toHaveLength(prChecklist.length);
  });
});
