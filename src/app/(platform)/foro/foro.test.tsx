import { render, screen } from '@testing-library/react';
import { renderInPlatform } from '@/test/platform';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { getForumPost, listForumCategories, listForumPosts } from '@/lib/forum';
import ForoPage, { metadata } from './page';
import ForoCategoryPage, { generateMetadata as categoryMetadata } from './categoria/[slug]/page';
import NewForumPostPage from './nuevo/page';
import ForumThreadPage, { generateMetadata as threadMetadata } from './tema/[id]/page';
import EditForumPostPage from './tema/[id]/editar/page';
import Loading from './loading';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/forum', () => ({
  listForumCategories: jest.fn(),
  listForumPosts: jest.fn(),
  getForumPost: jest.fn(),
}));
jest.mock('@/actions/forum/posts', () => ({}));
jest.mock('@/actions/forum/engagement', () => ({ toggleForumPostLike: jest.fn() }));
jest.mock('@/actions/advice/like-advice', () => ({ toggleLike: jest.fn() }));
jest.mock('@/components/forum/forum-post-form', () => ({
  ForumPostForm: (props: { defaultCategoryId?: string; post?: { id: string } }) => (
    <p data-testid="form">{props.post?.id ?? props.defaultCategoryId ?? 'nuevo'}</p>
  ),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

const categories = [
  {
    id: 'cat-1',
    slug: 'general',
    name: 'General',
    description: 'De todo',
    position: 0,
    _count: { posts: 2 },
  },
  {
    id: 'cat-2',
    slug: 'ayuda',
    name: 'Ayuda',
    description: 'Preguntas',
    position: 1,
    _count: { posts: 1 },
  },
];
/** The pages hand off to the async ForumIndex: render what it resolves to. */
const resolve = async (element: React.ReactElement) => {
  const { type, props } = element as React.ReactElement<
    object,
    (_props: object) => Promise<React.ReactElement>
  >;
  return type(props);
};
const session = (id = 'u1', role = 'USER') => ({ user: { id, role } }) as never;
const params = <T,>(value: T) => ({ params: Promise.resolve(value) });
const post = {
  id: 'p1',
  title: 'Monorepos',
  content: 'Hola **todos**, ¿cómo organizan los monorepos?',
  isPinned: true,
  isLocked: false,
  authorId: 'u1',
  categoryId: 'cat-2',
  createdAt: new Date('2026-10-01T10:00:00Z'),
  updatedAt: new Date('2026-10-02T10:00:00Z'),
  author: { id: 'u1', name: 'Ana', image: null },
  category: { id: 'cat-2', slug: 'ayuda', name: 'Ayuda' },
  likes: [{ userId: 'u2' }],
  comments: [
    {
      id: 'c1',
      content: 'Turborepo',
      authorId: 'u2',
      postId: 'p1',
      parentCommentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'u2', name: 'Bruno', image: null },
    },
  ],
};

beforeEach(() => {
  jest.mocked(listForumCategories).mockResolvedValue(categories as never);
  jest.mocked(listForumPosts).mockResolvedValue([]);
  jest.mocked(getForumPost).mockResolvedValue(post as never);
  jest.mocked(getCurrentSession).mockResolvedValue(null);
});

describe('/foro', () => {
  it('lists every thread with the categories and the famous forums', async () => {
    renderInPlatform(await resolve(ForoPage()));
    expect(metadata.title).toBeTruthy();
    expect(screen.getByText('3 temas en 2 categorías')).toBeInTheDocument();
    expect(listForumPosts).toHaveBeenCalledWith(null);
    expect(screen.getByRole('link', { name: /#ayuda/ })).toHaveAttribute(
      'href',
      '/foro/categoria/ayuda',
    );
    expect(screen.getByRole('link', { name: /Hacker News/ })).toBeInTheDocument();
    // Visitors are sent to sign in before opening a thread
    expect(screen.getByRole('link', { name: /nuevoTema/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion?redirect=%2Fforo%2Fnuevo',
    );
  });

  it('shows one category and opens new threads in it', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(session());
    renderInPlatform(await resolve(await ForoCategoryPage(params({ slug: 'ayuda' }))));
    expect(listForumPosts).toHaveBeenCalledWith('cat-2');
    expect(screen.getByText('Preguntas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nuevoTema/ })).toHaveAttribute(
      'href',
      '/foro/nuevo?categoria=ayuda',
    );
    expect((await categoryMetadata(params({ slug: 'ayuda' }))).description).toBe('Preguntas');
  });

  it('404s an unknown category', async () => {
    await expect(ForoCategoryPage(params({ slug: 'nada' }))).rejects.toThrow('NEXT_NOT_FOUND');
    expect((await categoryMetadata(params({ slug: 'nada' }))).title).toBeTruthy();
  });

  it('has a loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('/foro/nuevo', () => {
  it('sends visitors to sign in and preselects the category for members', async () => {
    await expect(NewForumPostPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      'NEXT_REDIRECT:/autenticacion/iniciar-sesion?redirect=/foro/nuevo',
    );
    jest.mocked(getCurrentSession).mockResolvedValue(session());
    renderInPlatform(
      await NewForumPostPage({ searchParams: Promise.resolve({ categoria: 'ayuda' }) }),
    );
    expect(screen.getByTestId('form')).toHaveTextContent('cat-2');
  });
});

describe('/foro/tema/[id]', () => {
  it('renders the thread in markdown with its replies', async () => {
    renderInPlatform(await ForumThreadPage(params({ id: 'p1' })));
    expect(screen.getByRole('heading', { level: 2, name: /Monorepos/ })).toBeInTheDocument();
    expect(screen.getByText('todos', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByLabelText('Fijado')).toBeInTheDocument();
    expect(screen.getByText(/editado/)).toBeInTheDocument();
    expect(screen.getByText('Turborepo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /editar/ })).not.toBeInTheDocument();
  });

  it('gives its author the edit controls', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(session('u1'));
    renderInPlatform(await ForumThreadPage(params({ id: 'p1' })));
    expect(screen.getByRole('link', { name: /editar/ })).toBeInTheDocument();
  });

  it('describes the thread and 404s a missing one', async () => {
    const meta = await threadMetadata(params({ id: 'p1' }));
    expect(meta.description).toBe('Hola todos, ¿cómo organizan los monorepos?');
    jest.mocked(getForumPost).mockResolvedValue(null);
    expect((await threadMetadata(params({ id: 'x' }))).title).toBeTruthy();
    await expect(ForumThreadPage(params({ id: 'x' }))).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe('/foro/tema/[id]/editar', () => {
  it('only lets the author or an admin in', async () => {
    await expect(EditForumPostPage(params({ id: 'p1' }))).rejects.toThrow(/iniciar-sesion/);
    jest.mocked(getCurrentSession).mockResolvedValue(session('u2'));
    await expect(EditForumPostPage(params({ id: 'p1' }))).rejects.toThrow(
      'NEXT_REDIRECT:/foro/tema/p1',
    );
    jest.mocked(getCurrentSession).mockResolvedValue(session('u9', 'ADMIN'));
    renderInPlatform(await EditForumPostPage(params({ id: 'p1' })));
    expect(screen.getByTestId('form')).toHaveTextContent('p1');
    jest.mocked(getForumPost).mockResolvedValue(null);
    await expect(EditForumPostPage(params({ id: 'x' }))).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
