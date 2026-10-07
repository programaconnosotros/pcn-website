import { screen } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { SetupLikeButton } from '@/components/setups/setup-like-button';
import { SetupOwnerActions } from '@/components/setups/setup-owner-actions';
import { fetchSetup, type SetupWithAuthor } from '@/lib/setups';
import { adminRow, renderPage, sessionRow, thrownBy } from '@/test/pages-m-z';
import SetupPage, { generateMetadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/setups', () => ({ fetchSetup: jest.fn() }));
jest.mock('@/components/setups/setup-like-button', () => ({
  SetupLikeButton: jest.fn(() => <button type="button">like</button>),
}));
jest.mock('@/components/setups/setup-owner-actions', () => ({
  SetupOwnerActions: jest.fn(() => <p>acciones del dueño</p>),
}));
jest.mock('@/components/ui/local-date-time', () => ({
  LocalDate: ({ date }: { date: Date }) => <time>{date.toISOString().slice(0, 10)}</time>,
}));

const buildSetup = (overrides: Partial<SetupWithAuthor> = {}) =>
  ({
    id: 's1',
    title: 'Mi escritorio',
    description: 'Monitor ultrawide\ny teclado split',
    imageUrl: 'https://cdn.example.com/setup.jpg',
    thumbUrl: 'https://cdn.example.com/setup-thumb.jpg',
    width: 1600,
    height: 900,
    date: new Date('2026-02-03T00:00:00Z'),
    createdAt: new Date('2026-02-04T12:00:00Z'),
    author: { id: 'author-1', name: 'Ana López', image: null },
    likes: [{ userId: 'fan-1' }, { userId: 'fan-2' }],
    ...overrides,
  }) as SetupWithAuthor;

const params = (id = 's1') => ({ params: Promise.resolve({ id }) });
const likeProps = () => jest.mocked(SetupLikeButton).mock.calls[0][0];

describe('/setups/[id] metadata', () => {
  it('names the setup and its author and shares the photo', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(buildSetup());

    const metadata = await generateMetadata(params());

    expect(fetchSetup).toHaveBeenCalledWith('s1');
    expect(metadata).toMatchObject({
      title: 'cat ~/setups/mi-escritorio',
      description: 'Monitor ultrawide\ny teclado split',
      openGraph: {
        title: 'Mi escritorio · setup de Ana López',
        url: '/setups/s1',
        type: 'article',
        images: [{ url: expect.stringContaining('setup.jpg'), alt: 'Mi escritorio' }],
      },
      twitter: { card: 'summary_large_image', title: 'Mi escritorio · setup de Ana López' },
    });
  });

  it('cuts long descriptions to 160 characters', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(buildSetup({ description: 'x'.repeat(300) }));

    expect((await generateMetadata(params())).description).toBe(`${'x'.repeat(157)}...`);
  });

  it('says when the setup does not exist', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(null);

    expect(await generateMetadata(params('nope'))).toEqual({
      title: { absolute: '404: no such file or directory' },
    });
  });
});

describe('/setups/[id]', () => {
  it('is not found when the setup does not exist', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(null);
    jest.mocked(getCurrentSession).mockResolvedValue(null);

    expect(await thrownBy(() => SetupPage(params('nope')))).toBe('NEXT_NOT_FOUND');
  });

  it('shows the photo, author and description to anonymous visitors without owner actions', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(buildSetup());
    jest.mocked(getCurrentSession).mockResolvedValue(null);

    await renderPage(SetupPage(params()));

    const photo = screen.getByRole('img', { name: 'Mi escritorio' });
    expect(photo).toHaveAttribute('src', 'https://cdn.example.com/setup.jpg');
    expect(photo).toHaveAttribute('width', '1600');
    expect(screen.getByRole('link', { name: /Ana López/ })).toHaveAttribute(
      'href',
      '/perfil/author-1',
    );
    expect(screen.getByText('03/02/2026')).toBeInTheDocument();
    expect(screen.getByText(/Monitor ultrawide/)).toBeInTheDocument();
    expect(screen.queryByText('acciones del dueño')).not.toBeInTheDocument();
    expect(likeProps()).toMatchObject({ setupId: 's1', likes: 2, liked: false, isLoggedIn: false });
  });

  it('knows when the member already liked it', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(buildSetup());
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ id: 'fan-2' }));

    await renderPage(SetupPage(params()));

    expect(likeProps()).toMatchObject({ liked: true, isLoggedIn: true });
    expect(screen.queryByText('acciones del dueño')).not.toBeInTheDocument();
  });

  it('lets the author edit and delete it, with the thumbnail as preview', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(buildSetup());
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ id: 'author-1' }));

    await renderPage(SetupPage(params()));

    expect(screen.getByText('acciones del dueño')).toBeInTheDocument();
    expect(jest.mocked(SetupOwnerActions).mock.calls[0][0]).toEqual({
      setup: {
        id: 's1',
        title: 'Mi escritorio',
        description: 'Monitor ultrawide\ny teclado split',
        date: '2026-02-03',
        imageUrl: 'https://cdn.example.com/setup-thumb.jpg',
      },
      canEdit: true,
    });
  });

  it('lets admins delete it but not edit it', async () => {
    jest.mocked(fetchSetup).mockResolvedValue(buildSetup());
    jest.mocked(getCurrentSession).mockResolvedValue(adminRow());

    await renderPage(SetupPage(params()));

    expect(jest.mocked(SetupOwnerActions).mock.calls[0][0].canEdit).toBe(false);
  });
});
