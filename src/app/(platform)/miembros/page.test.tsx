import { render, screen } from '@testing-library/react';
import { fetchCommunityMembers } from '@/actions/users/fetch-community-members';
import { renderSectionCard } from '@/lib/og/section-cards';
import { expectOnlyPlaceholders } from '@/test/pages-m-z';
import MiembrosLayout, { metadata } from './layout';
import Loading from './loading';
import { MiembrosClient } from './miembros-client';
import Image, { alt, contentType, size } from './opengraph-image';
import MiembrosPage, { revalidate } from './page';

jest.mock('@/actions/users/fetch-community-members', () => ({ fetchCommunityMembers: jest.fn() }));
jest.mock('./miembros-client', () => ({
  MiembrosClient: jest.fn(() => <p>directorio</p>),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

describe('/miembros', () => {
  it('is titled "who" and shares a human-readable card', () => {
    expect(metadata.title).toBe('who');
    expect(metadata.openGraph).toMatchObject({
      title: 'Miembros | programaConNosotros',
      url: expect.stringMatching(/\/miembros$/),
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('renders its children untouched', () => {
    render(<MiembrosLayout>contenido</MiembrosLayout>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('is always fresh and hands the members to the directory', async () => {
    const members = [{ id: 'u1', name: 'Ana' }] as unknown as Awaited<
      ReturnType<typeof fetchCommunityMembers>
    >;
    jest.mocked(fetchCommunityMembers).mockResolvedValue(members);

    render(await MiembrosPage());

    expect(revalidate).toBe(0);
    expect(screen.getByText('directorio')).toBeInTheDocument();
    expect(jest.mocked(MiembrosClient).mock.calls[0][0]).toEqual({ members });
  });

  it('uses the members section card for link previews', async () => {
    expect(alt).toBe('miembros · programaConNosotros');
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe('image/png');
    await expect(Image()).resolves.toEqual({ section: 'miembros' });
    expect(renderSectionCard).toHaveBeenCalledWith('miembros');
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
