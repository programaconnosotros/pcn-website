import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DbModel, DbRelation } from '@/app/(platform)/desarrollo/db-schema';
import { DbDiagram } from './db-diagram';
import { loadMermaid } from './mermaid';

jest.mock('./mermaid', () => ({ loadMermaid: jest.fn() }));

const renderMock = jest.fn();

const models: DbModel[] = [
  {
    name: 'User',
    domain: 'comunidad',
    uniques: [],
    fields: [
      { name: 'id', type: 'String', pk: true },
      { name: 'email', type: 'String', unique: true },
      { name: 'bio', type: 'String', optional: true },
      { name: 'tags', type: 'String', list: true },
    ],
  },
  {
    name: 'Event',
    domain: 'eventos',
    uniques: [],
    fields: [
      { name: 'id', type: 'String', pk: true },
      { name: 'authorId', type: 'String', fk: true },
    ],
  },
  { name: 'Talk', domain: 'charlas', uniques: [], fields: [{ name: 'id', type: 'String' }] },
];

const relations: DbRelation[] = [
  { from: 'Event', to: 'User', label: 'author', optional: false, many: true, onDelete: null },
  { from: 'Talk', to: 'Event', label: 'event', optional: true, many: false, onDelete: null },
];

const lastSource = () => renderMock.mock.calls.at(-1)?.[1] as string;

describe('DbDiagram', () => {
  beforeEach(() => {
    jest.mocked(loadMermaid).mockResolvedValue({ render: renderMock } as never);
    renderMock.mockResolvedValue({ svg: '<svg viewBox="0 0 2000 10"><text>er</text></svg>' });
  });
  afterEach(() => jest.restoreAllMocks());

  it('shows every model without columns in the "todo" view', async () => {
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1032);
    render(<DbDiagram models={models} relations={relations} />);

    expect(await screen.findByText('er')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('3 modelos · 2 relaciones')).toBeInTheDocument();
    // Only the domains that have models get a tab
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      '[todo]',
      'comunidad',
      'eventos',
      'charlas',
    ]);
    expect(lastSource()).toBe(
      [
        'erDiagram',
        '  direction LR',
        '  User',
        '  Event',
        '  Talk',
        '  User ||--o{ Event : author',
        '  Event |o--o| Talk : event',
      ].join('\n'),
    );
  });

  it('shows a domain with its columns and keys plus the relations that touch it', async () => {
    render(<DbDiagram models={models} relations={relations} />);
    await screen.findByText('er');

    await userEvent.click(screen.getByRole('tab', { name: 'comunidad' }));

    expect(screen.getByRole('tab', { name: '[comunidad]' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('1 modelos · 1 relaciones')).toBeInTheDocument();
    expect(await screen.findByText('er')).toBeInTheDocument();
    expect(lastSource()).toBe(
      [
        'erDiagram',
        '  direction LR',
        '  User {',
        '    String id PK',
        '    String email UK',
        '    String bio "opcional"',
        '    String[] tags',
        '  }',
        '  User ||--o{ Event : author',
      ].join('\n'),
    );
    expect(renderMock.mock.calls.at(-1)?.[0]).toMatch(/^db-.*-comunidad$/);

    await userEvent.click(screen.getByRole('tab', { name: 'eventos' }));
    expect(await screen.findByText('er')).toBeInTheDocument();
    expect(lastSource()).toContain('    String authorId FK');
  });

  it('zooms between 10% and 200% and resets to the fitted zoom', async () => {
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    render(<DbDiagram models={models} relations={relations} />);
    expect(await screen.findByText('10%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alejar' })).toBeDisabled();

    const zoomIn = screen.getByRole('button', { name: 'Acercar' });
    for (let i = 0; i < 10; i++) await userEvent.click(zoomIn);
    expect(screen.getByText('200%')).toBeInTheDocument();
    expect(zoomIn).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Alejar' }));
    expect(screen.getByText('180%')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ajustar al ancho' }));
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('keeps 100% without a viewBox and reports render errors', async () => {
    renderMock.mockResolvedValueOnce({ svg: '<svg><text>plano</text></svg>' });
    render(<DbDiagram models={models} relations={relations} />);
    expect(await screen.findByText('plano')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    renderMock.mockRejectedValueOnce(new Error('bad'));
    await userEvent.click(screen.getByRole('tab', { name: 'charlas' }));
    expect(await screen.findByText('no se pudo dibujar el diagrama')).toBeInTheDocument();
  });

  it('drops a render that resolves after the view changed', async () => {
    let resolveFirst!: (_value: { svg: string }) => void;
    renderMock.mockReturnValueOnce(new Promise((r) => (resolveFirst = r)));
    renderMock.mockRejectedValueOnce(new Error('stale-safe'));
    render(<DbDiagram models={models} relations={relations} />);

    await userEvent.click(screen.getByRole('tab', { name: 'comunidad' }));
    expect(await screen.findByText('no se pudo dibujar el diagrama')).toBeInTheDocument();
    resolveFirst({ svg: '<svg><text>viejo</text></svg>' });
    await Promise.resolve();
    expect(screen.queryByText('viejo')).not.toBeInTheDocument();
  });
});
