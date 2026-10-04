import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { useConsejosNav, ConsejosNavProvider } from '@/components/advises/consejos-nav';
import { buildConsejo, extractedSource, renderInPlatform } from '@/test/platform';
import { ConsejosClient } from './consejos-client';

jest.mock('@/actions/advises/like-advise', () => ({ toggleLike: jest.fn() }));
jest.mock('@actions/advises/delete-advise', () => ({ deleteAdvise: jest.fn() }));
jest.mock('@/actions/advises/edit-advise', () => ({ editAdvise: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const consejos = [
  buildConsejo({
    id: 'a',
    content: 'Hacé tests de todo',
    createdAt: '2025-03-03T00:00:00.000Z',
    likes: [{ userId: 'x' }, { userId: 'y' }],
    commentCount: 1,
  }),
  buildConsejo({
    id: 'b',
    content: 'Usá git todos los días',
    createdAt: '2025-03-02T00:00:00.000Z',
    author: { id: 'u2', name: 'Carla', image: null },
    commentCount: 5,
  }),
  buildConsejo({
    id: 'c',
    content: 'Practicá entrevistas',
    createdAt: '2025-03-01T00:00:00.000Z',
    author: { id: null, name: 'Diego', image: null },
    likes: null,
    tags: ['entrevistas'],
    source: extractedSource,
  }),
];

const NavIds = () => <output aria-label="ids">{useConsejosNav().ids.join(',')}</output>;

const renderClient = (list = consejos, fortuneId: string | null = 'b') =>
  renderInPlatform(
    <ConsejosNavProvider>
      <ConsejosClient
        consejos={list}
        session={null}
        fortuneId={fortuneId}
        addButton={<button type="button">nuevo</button>}
      />
      <NavIds />
    </ConsejosNavProvider>,
  );

const cards = () =>
  screen.getAllByRole('article').map((card) => within(card).getAllByRole('link')[0].textContent);

const pick = async (user: UserEvent, trigger: string, option: RegExp) => {
  await user.click(screen.getByRole('combobox', { name: trigger }));
  await user.click(screen.getByRole('option', { name: option }));
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ConsejosClient', () => {
  it('shows stats, the fortune and every consejo newest first', () => {
    renderClient();

    expect(screen.getByText('3 consejos de la comunidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'nuevo' })).toBeInTheDocument();
    const stat = (label: string) => screen.getByText(label).nextSibling;
    expect(stat('autores')).toHaveTextContent('3');
    expect(stat('auto-extraídos')).toHaveTextContent('1');
    expect(stat('me gusta')).toHaveTextContent('2');
    expect(screen.getByText('$ fortune --consejos').closest('a')).toHaveAttribute(
      'href',
      '/consejos/b',
    );
    expect(cards()).toEqual([
      'Hacé tests de todo',
      'Usá git todos los días',
      'Practicá entrevistas',
    ]);
    expect(screen.getByLabelText('ids')).toHaveTextContent('a,b,c');
  });

  it('marks an auto-extracted fortune', () => {
    renderClient(consejos, 'c');

    expect(screen.getByText('[auto]')).toBeInTheDocument();
  });

  it('shows an empty state without consejos', () => {
    renderClient([], null);

    expect(screen.getByText('No hay consejos para ver aún.')).toBeInTheDocument();
  });

  it('searches and reports when nothing matches', async () => {
    const user = userEvent.setup();
    renderClient();

    await user.type(screen.getByRole('textbox', { name: /Buscar consejos/ }), 'git');
    expect(cards()).toEqual(['Usá git todos los días']);
    expect(screen.getByLabelText('ids')).toHaveTextContent('b');
    // While searching the stats and the fortune step aside
    expect(screen.getByText('$ fortune --consejos').closest('a')?.parentElement).toHaveClass(
      'hidden',
    );

    await user.type(screen.getByRole('textbox', { name: /Buscar consejos/ }), 'zzz');
    expect(screen.getByText(/0 resultados/)).toHaveTextContent('0 resultados para "gitzzz"');
  });

  it('filters by origin', async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole('radio', { name: 'auto' }));
    expect(cards()).toEqual(['Practicá entrevistas']);
    await user.click(screen.getByRole('radio', { name: 'manual' }));
    expect(cards()).toHaveLength(2);
    await user.click(screen.getByRole('radio', { name: 'todos' }));
    expect(cards()).toHaveLength(3);
  });

  it('filters by topic and author', async () => {
    const user = userEvent.setup();
    renderClient();

    await pick(user, 'Tema', /#entrevistas/);
    expect(cards()).toEqual(['Practicá entrevistas']);
    await pick(user, 'Tema', /--tema=\*/);

    await pick(user, 'Autor', /@Carla/);
    expect(cards()).toEqual(['Usá git todos los días']);
    await pick(user, 'Autor', /--autor=\*/);
    expect(cards()).toHaveLength(3);
  });

  it('sorts and resets', async () => {
    const user = userEvent.setup();
    renderClient();

    await pick(user, 'Orden', /--sort=comentados/);
    expect(cards()[0]).toBe('Usá git todos los días');
    await pick(user, 'Orden', /--sort=antiguos/);
    expect(cards()[0]).toBe('Practicá entrevistas');

    await user.click(screen.getByRole('button', { name: 'reset' }));
    expect(cards()[0]).toBe('Hacé tests de todo');
    expect(screen.queryByRole('button', { name: 'reset' })).not.toBeInTheDocument();
  });

  it('shows 0 results without a query', async () => {
    const user = userEvent.setup();
    renderClient([consejos[0]]);

    await user.click(screen.getByRole('radio', { name: 'auto' }));

    expect(screen.getByText(/0 resultados/)).toHaveTextContent(/^\$ 0 resultados$/);
  });
});
