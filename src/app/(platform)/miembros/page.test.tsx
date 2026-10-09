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

  it('is always fresh and hands the directory only what it shows', async () => {
    const original = process.env.AWS_CLOUDFRONT_URL;
    process.env.AWS_CLOUDFRONT_URL = 'https://cdn.example.net';
    const base = {
      jobTitle: 'Dev',
      enterprise: 'Acme',
      positions: [],
      slogan: null,
      career: 'Sistemas',
      studyPlace: null,
      isCofounder: false,
      isAmbassador: false,
      createdAt: new Date('2024-01-01'),
      talks: 0,
      events: 0,
      projects: 0,
    };
    jest.mocked(fetchCommunityMembers).mockResolvedValue([
      { ...base, id: 'u1', name: 'Ana', image: 'https://cdn.example.net/ana.jpg' },
      { ...base, id: 'u2', name: 'Beto', image: 'https://lh3.googleusercontent.com/beto' },
    ]);

    try {
      render(await MiembrosPage());
    } finally {
      process.env.AWS_CLOUDFRONT_URL = original;
    }

    expect(revalidate).toBe(0);
    expect(screen.getByText('directorio')).toBeInTheDocument();
    const [ana, beto] = jest.mocked(MiembrosClient).mock.calls[0][0].members;
    expect(ana).toEqual({
      id: 'u1',
      name: 'Ana',
      image: 'https://cdn.example.net/ana.jpg',
      optimizeImage: true,
      role: 'Dev @ Acme',
      slogan: null,
      career: 'Sistemas',
      studyPlace: null,
      isCofounder: false,
      isAmbassador: false,
      createdAt: new Date('2024-01-01'),
      talks: 0,
      events: 0,
      projects: 0,
    });
    // A host next/image isn't allowed to fetch stays a plain image.
    expect(beto).toMatchObject({ name: 'Beto', optimizeImage: false });
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
