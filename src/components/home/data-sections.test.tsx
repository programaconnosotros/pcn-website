import { render, screen } from '@testing-library/react';
import { articles } from '@/app/(platform)/lectura/articles';
import { AdvisesCard } from './advises-card';
import { AmbassadorsSection } from './ambassadors-section';
import { LatestArticlesSection } from './latest-articles';
import { LatestPhotosSection } from './latest-photos-section';
import { LatestTalksSection } from './latest-talks-section';
import { TalksCard } from './talks-card';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    advise: { count: jest.fn() },
    talk: { count: jest.fn() },
    user: { findMany: jest.fn() },
  },
}));
jest.mock('@/lib/cache', () => ({
  cached: (_name: string, fn: (..._args: unknown[]) => unknown) => fn,
}));
jest.mock('@/lib/article-writers', () => ({ getArticleWriters: jest.fn() }));
jest.mock('@/lib/gallery', () => ({ listLatestGalleryItems: jest.fn() }));
jest.mock('@/actions/talks/fetch-public-talks', () => ({ fetchPublicTalks: jest.fn() }));
jest.mock('@/components/courses/related-articles', () => ({
  RelatedArticles: ({
    articles,
    avatars,
  }: {
    articles: { id: string; title: string }[];
    avatars: Record<string, string>;
  }) => (
    <ul>
      {articles.map((article) => (
        <li key={article.id}>
          {article.title} {avatars[article.id] ?? 'sin-avatar'}
        </li>
      ))}
    </ul>
  ),
}));
jest.mock('@/components/photo-gallery/photo-card', () => ({
  PhotoCard: ({
    photo,
    href,
    index,
    total,
  }: {
    photo: { id: string };
    href: string;
    index: number;
    total: number;
  }) => (
    <a href={href}>
      foto {photo.id} {index + 1}/{total}
    </a>
  ),
}));
jest.mock('./latest-talks-grid', () => ({
  LatestTalksGrid: ({ talks, total }: { talks: unknown[]; total: number }) => (
    <p>
      {talks.length} de {total} charlas
    </p>
  ),
}));

const mockPrisma = jest.requireMock('@/lib/prisma').default;
const { getArticleWriters } = jest.requireMock('@/lib/article-writers');
const { listLatestGalleryItems } = jest.requireMock('@/lib/gallery');
const { fetchPublicTalks } = jest.requireMock('@/actions/talks/fetch-public-talks');

describe('home sections with data', () => {
  it('AdvisesCard and TalksCard link to their pages', async () => {
    mockPrisma.advise.count.mockResolvedValue(12);
    mockPrisma.talk.count.mockResolvedValue(30);
    render(
      <>
        {await AdvisesCard()}
        {await TalksCard()}
      </>,
    );
    expect(screen.getByRole('link', { name: /Consejos/ })).toHaveAttribute('href', '/consejos');
    expect(screen.getByRole('link', { name: /Charlas/ })).toHaveAttribute('href', '/charlas');
  });

  it('AmbassadorsSection lists ambassadors with their initials and profile links', async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'ada lovelace byron', image: null },
      { id: 'u2', name: 'Linus', image: '/linus.png' },
    ]);
    render(await AmbassadorsSection());

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isAmbassador: true } }),
    );
    expect(screen.getByRole('link', { name: /ada lovelace byron/ })).toHaveAttribute(
      'href',
      '/perfil/u1',
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('— 2', { exact: false })).toBeInTheDocument();
  });

  it('AmbassadorsSection invites people when there are no ambassadors yet', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    render(await AmbassadorsSection());
    expect(screen.getByText(/Estamos sumando a las primeras personas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /quieroSerAmbassador/ })).toBeInTheDocument();
  });

  it('LatestArticlesSection shows the 6 newest articles with the writer photo when there is one', async () => {
    const [first, second] = articles;
    getArticleWriters.mockResolvedValue({
      [first.id]: [{ image: null }, { image: '/writer.png' }],
      [second.id]: [{ image: null }],
    });
    render(await LatestArticlesSection());

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveTextContent('/writer.png');
    expect(items[1]).toHaveTextContent('sin-avatar');
  });

  it('LatestPhotosSection renders nothing without photos', async () => {
    listLatestGalleryItems.mockResolvedValue([]);
    expect(await LatestPhotosSection()).toBeNull();
  });

  it('LatestPhotosSection links each photo to its gallery page', async () => {
    listLatestGalleryItems.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
    render((await LatestPhotosSection())!);
    expect(listLatestGalleryItems).toHaveBeenCalledWith(8);
    expect(screen.getByRole('link', { name: 'foto p2 2/2' })).toHaveAttribute(
      'href',
      '/galeria/p2',
    );
  });

  it('LatestTalksSection renders nothing without talks', async () => {
    fetchPublicTalks.mockResolvedValue([]);
    expect(await LatestTalksSection()).toBeNull();
  });

  it('LatestTalksSection shows the 4 newest talks out of all of them', async () => {
    fetchPublicTalks.mockResolvedValue(Array.from({ length: 6 }, (_, i) => ({ id: String(i) })));
    render((await LatestTalksSection())!);
    expect(screen.getByText('4 de 6 charlas')).toBeInTheDocument();
  });
});
