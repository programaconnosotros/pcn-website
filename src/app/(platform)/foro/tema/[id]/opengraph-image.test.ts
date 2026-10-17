import { renderTerminalCard } from '@/lib/og/terminal-card';
import { getForumPost } from '@/lib/forum';
import Image, { alt } from './opengraph-image';

jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());
jest.mock('@/lib/forum', () => ({ getForumPost: jest.fn() }));

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('/foro/tema/[id] OG image', () => {
  it("shows the thread's title, author and replies", async () => {
    jest.mocked(getForumPost).mockResolvedValue({
      title: 'Monorepos con pnpm',
      author: { name: 'Ana' },
      category: { slug: 'ayuda' },
      comments: [{}, {}],
    } as never);
    await Image(params('p1'));
    expect(renderTerminalCard).toHaveBeenCalledWith({
      path: 'foro/ayuda',
      command: 'cat tema.md --por "Ana"',
      title: 'Monorepos con pnpm',
      meta: ['@Ana', '2 respuestas'],
    });
    expect(alt).toMatch(/programaConNosotros/);
  });

  it('falls back to the forum card for a missing thread', async () => {
    jest.mocked(getForumPost).mockResolvedValue(null);
    await Image(params('nope'));
    expect(renderTerminalCard).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: 'foro', title: 'El foro de la comunidad', meta: [] }),
    );
  });
});
