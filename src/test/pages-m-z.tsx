// Helpers for the route tests (pages, layouts, loading and OG images) of the m–z platform
// folders and the routes outside (platform). Server components are async functions: await them
// and render what they return.
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { SessionWithUser } from '@/lib/session';
import { renderInPlatform } from '@/test/platform';

/** A row as `findSession` returns it: the session plus its user. */
export const sessionRow = (
  user: Partial<SessionWithUser['user']> & { role?: 'REGULAR' | 'ADMIN' } = {},
): SessionWithUser =>
  ({
    id: 'session-hash',
    userId: user.id ?? 'user-1',
    expires: new Date('2100-01-01T00:00:00Z'),
    user: {
      id: 'user-1',
      name: 'Ana López',
      email: 'ana@example.com',
      role: 'REGULAR',
      image: null,
      ...user,
    },
  }) as unknown as SessionWithUser;

export const adminRow = (user: Partial<SessionWithUser['user']> = {}) =>
  sessionRow({ id: 'admin-1', name: 'Admin', ...user, role: 'ADMIN' });

/** Awaits a server component's element and renders it inside the platform providers. */
export const renderPage = async (element: ReactNode | Promise<ReactNode>) =>
  renderInPlatform((await element) as ReactElement);

/** Runs a server component and returns the error it throws (redirect / notFound). */
export const thrownBy = async (run: () => unknown) => {
  try {
    await run();
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error('expected the page to throw');
};

/**
 * `@/lib/og/terminal-card` without `next/og` (which needs the Fetch API jsdom lacks):
 * `jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard())`.
 * The card resolves to the props it was drawn with.
 */
export const mockTerminalCard = () => ({
  OG_SIZE: { width: 1200, height: 630 },
  OG_CONTENT_TYPE: 'image/png',
  renderTerminalCard: jest.fn(async (props: unknown) => ({ card: props })),
});

/** `@/lib/og/section-cards` for the section OG images; a card resolves to its section key. */
export const mockSectionCards = () => ({
  renderSectionCard: jest.fn(async (key: string) => ({ section: key })),
  sectionCardAlt: (key: string) => `${key} · programaConNosotros`,
});

/** A `loading.tsx` shows skeleton placeholders and no text at all. */
export const expectOnlyPlaceholders = (element: ReactElement) => {
  const { container } = render(element);
  expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  expect(container).toHaveTextContent('');
  return container;
};
