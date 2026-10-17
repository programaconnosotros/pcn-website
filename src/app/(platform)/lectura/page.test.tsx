import { render, screen } from '@testing-library/react';
import { getAdminUser } from '@/lib/admin';
import { getArticleWriters } from '@/lib/article-writers';
import LecturaLayout, { metadata } from './layout';
import Loading from './loading';
import LecturaPage from './page';
import { ReadingPage } from './reading-page';
import { testArticles, testBooks } from '@/test/recommendations';

jest.mock('@/lib/admin', () => ({ getAdminUser: jest.fn() }));
jest.mock('@/lib/article-writers', () => ({ getArticleWriters: jest.fn() }));
jest.mock('./reading-page', () => ({ ReadingPage: jest.fn(() => null) }));
jest.mock('@/lib/recommendations', () => require('@/test/recommendations').mockRecommendations());

const articleWriters = { 'articulo-1': [{ id: 'u1', name: 'Ana', image: null }] };

describe('LecturaPage', () => {
  beforeEach(() => {
    jest.mocked(getArticleWriters).mockResolvedValue(articleWriters as never);
  });

  it('passes the articles, the books and their writers to the reading page', async () => {
    jest.mocked(getAdminUser).mockResolvedValue(null);
    render(await LecturaPage());

    expect(jest.mocked(ReadingPage).mock.calls[0][0]).toEqual({
      articles: testArticles,
      books: testBooks,
      articleWriters,
      isAdmin: false,
    });
  });

  it('tells the reading page when the viewer is an admin', async () => {
    jest.mocked(getAdminUser).mockResolvedValue({ id: 'admin' } as never);
    render(await LecturaPage());

    expect(jest.mocked(ReadingPage).mock.calls[0][0]).toMatchObject({ isAdmin: true });
  });
});

describe('lectura layout', () => {
  it('has a terminal tab title and a readable share card', () => {
    expect(metadata.title).toBe('ls ~/lectura');
    expect(metadata.openGraph).toMatchObject({
      title: 'Lectura | programaConNosotros',
      url: expect.stringMatching(/\/lectura$/),
    });
  });

  it('renders its page untouched', () => {
    render(
      <LecturaLayout>
        <p>artículos</p>
      </LecturaLayout>,
    );
    expect(screen.getByText('artículos')).toBeInTheDocument();
  });
});

describe('lectura loading', () => {
  it('shows only placeholders', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container.textContent).toBe('');
  });
});
