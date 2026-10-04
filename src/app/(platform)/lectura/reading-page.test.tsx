import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { jsonResponse, renderInPlatform } from '@/test/platform';
import { ReadingPage } from './reading-page';

jest.mock('./articles', () => {
  const list = [
    {
      id: 'a1',
      title: 'Loop Engineering',
      author: 'Addy Osmani',
      coauthors: ['Ana López'],
      source: 'addyosmani.com',
      category: 'IA',
      description: 'Sobre loops de agentes',
      url: 'https://addyosmani.com/loop',
      avatar: '/addy.png',
      date: '2025-03-05',
      language: 'en',
    },
    {
      id: 'a2',
      title: 'Monolitos modulares',
      author: 'Martin Fowler',
      source: 'martinfowler.com',
      category: 'Arquitectura',
      description: 'Cuándo partir un monolito',
      url: 'https://martinfowler.com/mono',
      avatar: '/martin.png',
      date: '2024-01-10',
      language: 'es',
    },
  ];
  return {
    articles: list,
    articleAuthors: (article: { author: string; coauthors?: string[] }) => [
      article.author,
      ...(article.coauthors ?? []),
    ],
  };
});

const mockMarks = { saved: new Set<string>(), read: new Set<string>() };
jest.mock('@/hooks/use-content-marks', () => ({
  useContentMarks: () => ({
    ids: (mark: 'read' | 'saved') => mockMarks[mark],
    toggle: jest.fn(),
    set: jest.fn(),
    isAuthenticated: true,
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

const articleTitles = () =>
  Array.from(document.querySelectorAll('article h2 button'), (button) => button.textContent);
const bookTitles = () =>
  Array.from(
    document.querySelectorAll('[role="tabpanel"]:not([hidden]) h2.md\\:truncate'),
    (h) => h.textContent,
  );
const search = () =>
  screen.getByRole('textbox', { name: 'Buscar por título, autor o descripción' });

// The books tab renders the whole catalog; give its tests some room
jest.setTimeout(20_000);

const toBooks = (user: UserEvent) => user.click(screen.getByRole('tab', { name: 'Libros' }));

describe('ReadingPage', () => {
  beforeEach(() => {
    mockMarks.saved = new Set(['a2']);
    mockMarks.read = new Set();
  });
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('opens on the articles with the reading list count', () => {
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);

    expect(screen.getByRole('tab', { name: /Artículos/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTitle('1 en tu lista para leer')).toHaveTextContent('1');
    expect(articleTitles()).toEqual(['Loop Engineering', 'Monolitos modulares']);
    expect(screen.getByRole('link', { name: /AgusLogs/ })).toHaveAttribute(
      'href',
      'https://aguslogs.com/',
    );
  });

  it('searches articles by co-author, source and language', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);

    await user.type(search(), 'ana lópez');
    expect(articleTitles()).toEqual(['Loop Engineering']);
    await user.clear(search());
    await user.type(search(), 'martinfowler');
    expect(articleTitles()).toEqual(['Monolitos modulares']);
    await user.clear(search());

    await user.click(screen.getByRole('button', { name: 'en' }));
    expect(articleTitles()).toEqual(['Loop Engineering']);
  });

  it('filters articles by category and reading status, keeping the status in the URL', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);

    await user.click(screen.getByRole('button', { name: '#Arquitectura 1' }));
    expect(articleTitles()).toEqual(['Monolitos modulares']);
    await user.click(screen.getByRole('button', { name: '#todas 2' }));

    await user.click(screen.getByRole('button', { name: /para leer \[1\]/ }));
    expect(articleTitles()).toEqual(['Monolitos modulares']);
    expect(window.location.search).toBe('?lista=para-leer');
    await user.click(screen.getByRole('button', { name: 'todos', pressed: false }));
    expect(window.location.search).toBe('');
  });

  it('opens straight into a reading list from ?lista=', () => {
    window.history.replaceState(null, '', '/lectura?lista=para-leer');
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);

    expect(articleTitles()).toEqual(['Monolitos modulares']);
  });

  it('ignores an unknown ?lista=', () => {
    window.history.replaceState(null, '', '/lectura?lista=otra');
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);

    expect(articleTitles()).toHaveLength(2);
  });

  it('reads an article in the web reader', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ embeddable: false }));
    const user = userEvent.setup();
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);

    await user.click(screen.getByRole('button', { name: 'Loop Engineering' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Addy Osmani, Ana López · addyosmani.com')).toBeInTheDocument();
    expect(within(dialog).getByText('AO')).toBeInTheDocument();
    expect(await within(dialog).findByText(/no permite mostrarse embebido/)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists books, filters them by category and search and says when none match', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);
    await toBooks(user);

    const all = bookTitles();
    expect(all.length).toBeGreaterThan(10);
    expect([...all].sort((a, b) => a!.localeCompare(b!))).toEqual(all);
    expect(
      screen.getAllByRole('link', { name: /Hands-On Large Language Models/ })[0],
    ).toHaveAttribute('target', '_blank');

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Gestión' }));
    expect(bookTitles()).toContain('The Mythical Man-Month');
    expect(bookTitles()).not.toContain('Clean Code');

    await user.click(search());
    await user.paste('zzzz');
    expect(
      screen.getByText('No se encontraron libros con los filtros seleccionados.'),
    ).toBeInTheDocument();
  });

  it('finds books by author and resets the category when switching tabs', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ReadingPage articleWriters={{}} isAdmin={false} />);
    await toBooks(user);

    await user.click(search());
    await user.paste('fowler');
    expect(bookTitles()).toContain('Refactoring');

    await user.click(screen.getByRole('tab', { name: /Artículos/ }));
    expect(articleTitles()).toEqual(['Monolitos modulares']);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
