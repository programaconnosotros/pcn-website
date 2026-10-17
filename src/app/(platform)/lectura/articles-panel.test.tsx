import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { addArticleAuthor, removeArticleAuthor } from '@/actions/articles/article-authors';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { mockRouter } from '@/test/dom';
import {
  ArticlesPanel,
  ALL_ARTICLE_CATEGORIES,
  isReadStatus,
  type ReadStatus,
} from './articles-panel';
import type { Article } from './articles';
import type { Writer } from './article-writers';

const mockMarks = {
  read: new Set<string>(),
  saved: new Set<string>(),
  toggle: jest.fn(),
  set: jest.fn(),
  isAuthenticated: true,
};
jest.mock('@/hooks/use-content-marks', () => ({
  useContentMarks: () => ({
    ids: (mark: 'read' | 'saved') => mockMarks[mark],
    toggle: mockMarks.toggle,
    set: mockMarks.set,
    isAuthenticated: mockMarks.isAuthenticated,
    isLoading: false,
  }),
}));
jest.mock('@/actions/articles/article-authors', () => ({
  addArticleAuthor: jest.fn(),
  removeArticleAuthor: jest.fn(),
}));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('@/actions/users/search-users-for-speaker', () => ({ searchUsersForSpeaker: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const recent = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10);

const article = (overrides: Partial<Article>): Article => ({
  id: 'a',
  title: 'Artículo',
  author: 'Autor Uno',
  source: 'blog.dev',
  category: 'IA',
  description: 'Descripción',
  url: 'https://blog.dev/a',
  avatar: '/a.png',
  date: '2023-01-01',
  language: 'es',
  ...overrides,
});

const articles = [
  article({
    id: '1',
    title: 'Loops con IA',
    date: recent,
    author: 'Addy Osmani',
    coauthors: ['Ana López'],
  }),
  article({
    id: '2',
    title: 'Microservicios',
    category: 'Arquitectura',
    author: 'Martin Fowler',
    source: 'martinfowler.com',
  }),
  article({ id: '3', title: 'Prompting', author: 'Agus S', date: '2020-06-01' }),
];

const writers: Record<string, Writer[]> = {
  '1': [{ id: 'u-ana', name: 'Ana López', image: '/ana.png' }],
  '3': [{ id: 'u-agus', name: 'Agustín Sánchez', image: null }],
};

const renderPanel = (props: Partial<Parameters<typeof ArticlesPanel>[0]> = {}) => {
  const handlers = { onCategoryChange: jest.fn(), onOpen: jest.fn(), onStatusChange: jest.fn() };
  render(
    <ArticlesPanel
      articles={articles}
      filteredArticles={articles}
      category={ALL_ARTICLE_CATEGORIES}
      status={'todos' as ReadStatus}
      writers={writers}
      isAdmin={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

const titles = () =>
  Array.from(document.querySelectorAll('article h2 button'), (b) => b.textContent);
const row = (title: string) => screen.getByRole('button', { name: title }).closest('article')!;

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ArticlesPanel', () => {
  beforeEach(() => {
    mockMarks.read = new Set(['2']);
    mockMarks.saved = new Set(['3']);
    mockMarks.isAuthenticated = true;
  });

  it('shows stats, progress, the category histogram and every article', () => {
    renderPanel();

    expect(screen.getByText(/^2020 → \d{4}$/)).toBeInTheDocument();
    expect(screen.getByText(/artículos$/)).toHaveTextContent('3/3 artículos');
    expect(screen.getByText(/fuentes$/)).toHaveTextContent('2 fuentes');
    expect(screen.getByText(/autores$/)).toHaveTextContent('4 autores');
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#todas 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '#IA 2' })).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /para leer \[1\]/ })).toBeInTheDocument();
    expect(titles()).toEqual(['Loops con IA', 'Microservicios', 'Prompting']);

    expect(within(row('Loops con IA')).getByText('new')).toBeInTheDocument();
    expect(within(row('Loops con IA')).getByText('0x01')).toBeInTheDocument();
    expect(within(row('Microservicios')).getByText('2023.01.01')).toBeInTheDocument();
    // A read article can't be saved for later
    expect(within(row('Microservicios')).queryByTitle(/lista para leer/)).not.toBeInTheDocument();
  });

  it('links co-authors and hand-tagged writers to their profiles', () => {
    renderPanel();

    const loops = row('Loops con IA');
    expect(within(loops).getByRole('link', { name: 'Ana López' })).toHaveAttribute(
      'href',
      '/perfil/u-ana',
    );
    expect(within(loops).getByText(/Addy Osmani/)).toBeInTheDocument();
    // A lone author tagged under another spelling is still that person
    expect(within(row('Prompting')).getByRole('link', { name: 'Agus S' })).toHaveAttribute(
      'href',
      '/perfil/u-agus',
    );
    expect(within(row('Microservicios')).queryByRole('link')).not.toBeInTheDocument();
  });

  it('opens articles, changes category and status', async () => {
    const user = userEvent.setup();
    const handlers = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Microservicios' }));
    expect(handlers.onOpen).toHaveBeenCalledWith(articles[1]);
    await user.click(screen.getByRole('button', { name: '#Arquitectura 1' }));
    expect(handlers.onCategoryChange).toHaveBeenCalledWith('Arquitectura');
    await user.click(screen.getByRole('button', { name: /sin leer/ }));
    expect(handlers.onStatusChange).toHaveBeenCalledWith('pendientes');
  });

  it.each([
    ['leidos', ['Microservicios']],
    ['pendientes', ['Loops con IA', 'Prompting']],
    ['para-leer', ['Prompting']],
  ] as const)('filters by status %s', (status, expected) => {
    renderPanel({ status });

    expect(titles()).toEqual(expected);
  });

  it('explains empty lists', () => {
    mockMarks.saved = new Set();
    renderPanel({ status: 'para-leer' });
    expect(screen.getByText(/tu lista está vacía/)).toBeInTheDocument();
  });

  it('says when no article matches the filters', () => {
    renderPanel({ filteredArticles: [] });

    expect(screen.getByText(/no hay artículos con esos filtros/)).toBeInTheDocument();
  });

  it('marks articles as read (taking them off the list) and saves them', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(within(row('Prompting')).getByTitle('Marcar como leído'));
    expect(mockMarks.set).toHaveBeenLastCalledWith([
      { contentId: '3', mark: 'read', value: true },
      { contentId: '3', mark: 'saved', value: false },
    ]);
    await user.click(within(row('Loops con IA')).getByTitle('Marcar como leído'));
    expect(mockMarks.set).toHaveBeenLastCalledWith([{ contentId: '1', mark: 'read', value: true }]);
    await user.click(within(row('Microservicios')).getByTitle('Desmarcar como leído'));
    expect(mockMarks.set).toHaveBeenLastCalledWith([
      { contentId: '2', mark: 'read', value: false },
    ]);

    await user.click(within(row('Loops con IA')).getByTitle('Guardar en mi lista para leer'));
    expect(mockMarks.toggle).toHaveBeenCalledWith('1', 'saved');
  });

  it('asks visitors to sign in and shows an empty progress bar', () => {
    mockMarks.isAuthenticated = false;
    mockMarks.read = new Set();
    renderPanel();

    expect(screen.getByText(/iniciá sesión para guardar lo que leés/)).toBeInTheDocument();
    expect(screen.getByText('░'.repeat(16))).toBeInTheDocument();
  });

  it('recognises the status values', () => {
    expect(isReadStatus('para-leer')).toBe(true);
    expect(isReadStatus('otra')).toBe(false);
    expect(isReadStatus(null)).toBe(false);
  });
});

describe('ArticleWriters (admins)', () => {
  beforeEach(() => {
    mockMarks.read = new Set();
    mockMarks.saved = new Set();
  });

  it('adds a writer from the search', async () => {
    jest.useFakeTimers();
    (addArticleAuthor as jest.Mock).mockResolvedValue(undefined);
    (searchCommunityMembers as jest.Mock).mockResolvedValue([
      { id: 'u9', name: 'Nuevo', image: null },
    ]);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPanel({ isAdmin: true });

    await user.click(within(row('Microservicios')).getByRole('button', { name: /escritor/ }));
    await user.type(
      within(row('Microservicios')).getByRole('textbox', { name: 'buscar escritor' }),
      'nu',
    );
    await act(async () => jest.advanceTimersByTime(200));
    await user.click(screen.getByText('Nuevo'));

    expect(addArticleAuthor).toHaveBeenCalledWith('2', 'u9');
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Nuevo figura como escritor del artículo'),
    );
    expect(mockRouter.refresh).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('removes a hand-tagged writer, keeps linked ones and reports errors', async () => {
    (removeArticleAuthor as jest.Mock).mockRejectedValueOnce(new Error('Sin permisos'));
    (removeArticleAuthor as jest.Mock).mockRejectedValueOnce('raro');
    const user = userEvent.setup();
    renderPanel({
      isAdmin: true,
      writers: {
        '1': [
          { id: 'u-ana', name: 'Ana López', image: null },
          { id: 'u-addy', name: 'Addy', image: null, linkedAuthor: 'Addy Osmani' },
        ],
      },
    });
    const loops = row('Loops con IA');

    await user.click(within(loops).getByRole('button', { name: /escritores \(2\)/ }));
    expect(within(loops).getByText('escrito por')).toBeInTheDocument();
    expect(
      within(loops).queryByRole('button', { name: 'Quitar a Addy como escritor' }),
    ).not.toBeInTheDocument();

    await user.click(
      within(loops).getByRole('button', { name: 'Quitar a Ana López como escritor' }),
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Sin permisos'));
    await user.click(
      within(loops).getByRole('button', { name: 'Quitar a Ana López como escritor' }),
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo guardar'));
    expect(removeArticleAuthor).toHaveBeenCalledWith('1', 'u-ana');

    await user.click(within(loops).getByRole('button', { name: 'listo' }));
    expect(within(loops).queryByText('escrito por')).not.toBeInTheDocument();
  });

  it('confirms a removal', async () => {
    (removeArticleAuthor as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPanel({ isAdmin: true });
    const loops = row('Loops con IA');

    await user.click(within(loops).getByRole('button', { name: /escritores \(1\)/ }));
    await user.click(
      within(loops).getByRole('button', { name: 'Quitar a Ana López como escritor' }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Ana López ya no figura como escritor'),
    );
  });
});
