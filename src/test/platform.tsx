// Helpers for the platform component tests (consejos, proyectos, monitoreo, lectura, …).
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { Consejo } from '@/lib/consejos';
import type { SessionWithUser } from '@/lib/session';

/** A QueryClient without retries or caching between tests. */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });

/** `render` wrapped in a fresh QueryClientProvider; returns the client too. */
export const renderWithQuery = (
  ui: ReactElement,
  { client = createTestQueryClient(), ...options }: RenderOptions & { client?: QueryClient } = {},
) => {
  const result = render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
    ...options,
  });
  return { ...result, client };
};

/**
 * `render` inside the providers a platform page has (sidebar for PageTitle / StickyHeader, and
 * React Query); returns the QueryClient too.
 */
export const renderInPlatform = (
  ui: ReactElement,
  { client = createTestQueryClient(), ...options }: RenderOptions & { client?: QueryClient } = {},
) => {
  const result = render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>
        <SidebarProvider>{children}</SidebarProvider>
      </QueryClientProvider>
    ),
    ...options,
  });
  return { ...result, client };
};

/** A minimal `Response`-like object for mocking `fetch`. */
export const jsonResponse = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }) as Response;

type PromiseMessages = {
  success?: string | ((_value: unknown) => unknown);
  error?: string | ((_error: unknown) => unknown);
};

/**
 * A `sonner` module mock for `jest.mock('sonner', () => require('@/test/platform').mockSonner())`.
 * `toast.promise` behaves like the real one: it returns a toast id (not a promise) and, once the
 * promise settles, resolves the success / error message and reports it through
 * `toast.success` / `toast.error` so tests can assert on the text.
 */
export const mockSonner = () => {
  const toast = Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    message: jest.fn(),
    dismiss: jest.fn(),
    promise: jest.fn((promise: unknown, data: PromiseMessages = {}) => {
      const resolve = async (message: PromiseMessages['success'], value: unknown) =>
        typeof message === 'function' ? message(value) : message;
      const settled = Promise.resolve(typeof promise === 'function' ? promise() : promise).then(
        async (value) => toast.success(await resolve(data.success, value)),
        async (error) => toast.error(await resolve(data.error, error)),
      );
      return { unwrap: () => settled };
    }),
  });
  return { toast, Toaster: () => null };
};

/** A signed-in session for client components; only `user` matters to them. */
export const buildSession = (
  user: { id?: string; role?: 'USER' | 'ADMIN'; name?: string; email?: string } = {},
) =>
  ({
    id: 'session-1',
    user: {
      id: 'user-1',
      role: 'USER',
      name: 'Ana',
      email: 'ana@example.com',
      image: null,
      ...user,
    },
  }) as unknown as SessionWithUser;

/** A published consejo (pass `source` for an auto-extracted one). */
export const buildConsejo = (overrides: Partial<Consejo> = {}): Consejo => ({
  id: 'c1',
  content: 'Escribí tests. Leé código ajeno.',
  createdAt: '2025-03-10T15:00:00.000Z',
  author: { id: 'author-1', name: 'Bruno', image: null },
  likes: [],
  commentCount: 0,
  tags: [],
  source: null,
  ...overrides,
});

export const extractedSource = {
  title: 'Charla sobre testing',
  date: '2025-02-01',
  hash: 'abc1234',
  href: '/conversaciones/2025-02-01#abc1234',
};

/** A testimonial with its author, as the /testimonios pages receive it. */
export const buildTestimonial = (
  overrides: Partial<{ id: string; body: string; userId: string; featured: boolean }> & {
    user?: { id: string; name: string; image: string | null };
  } = {},
) => {
  const userId = overrides.userId ?? overrides.user?.id ?? 'user-1';
  return {
    id: 't1',
    body: 'La comunidad me ayudó muchísimo',
    featured: false,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
    userId,
    user: overrides.user ?? { id: userId, name: 'Ana López', image: null },
  };
};

type ProjectMember = {
  id: string;
  projectId: string;
  userId: string | null;
  memberName: string;
  role: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; image: string | null } | null;
};

/** A project member; pass `user: null` for someone without an account. */
export const buildProjectMember = (overrides: Partial<ProjectMember> = {}): ProjectMember => {
  const user =
    overrides.user === undefined
      ? {
          id: overrides.userId ?? 'cmember0001',
          name: overrides.memberName ?? 'Carla',
          image: null,
        }
      : overrides.user;
  return {
    id: 'pm1',
    projectId: 'p1',
    memberName: user?.name ?? 'Carla',
    role: null,
    order: 0,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
    userId: user?.id ?? null,
    user,
  };
};

/** A project as `fetchPublicProjects` returns it. */
export const buildProject = (
  overrides: Partial<{
    id: string;
    title: string;
    description: string;
    url: string;
    logoUrl: string;
    techStack: string[];
    order: number;
    isOpenSource: boolean;
    repoUrl: string | null;
    startYear: number | null;
    endYear: number | null;
    authorId: string | null;
    author: { id: string; name: string; image: string | null } | null;
    authorRole: string | null;
    createdAt: Date;
    members: ProjectMember[];
  }> = {},
) => {
  const author =
    overrides.author === undefined
      ? { id: 'author-1', name: 'Bruno Díaz', image: null }
      : overrides.author;
  return {
    id: 'p1',
    title: 'PCN Dashboard',
    description: 'Un tablero para la comunidad',
    url: 'https://dashboard.example.com/',
    logoUrl: '',
    techStack: [] as string[],
    order: 0,
    isOpenSource: false,
    repoUrl: null as string | null,
    startYear: null as number | null,
    endYear: null as number | null,
    authorRole: null as string | null,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    members: [] as ProjectMember[],
    ...overrides,
    authorId: author?.id ?? null,
    author,
  };
};
