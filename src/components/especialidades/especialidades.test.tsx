import { render, screen } from '@testing-library/react';
import { InfluencerCard } from '@/components/influencers/influencer-card';
import { renderInPlatform } from '@/test/platform';
import { SpecialtyCard } from './specialty-card';
import { specialties, specialtyGroups } from './specialties';
import { TableOfContents } from './table-of-contents';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('especialidades', () => {
  it('renders a specialty with plain and described items', () => {
    const Icon = () => <svg data-testid="icon" />;
    render(
      <SpecialtyCard
        specialty={{
          ...specialties[0],
          id: 'frontend',
          title: 'Frontend',
          summary: 'Interfaces',
          icon: Icon as never,
          idealFor: 'quienes disfrutan lo visual',
          sections: [
            { heading: 'Tecnologías', items: ['React', 'CSS'] },
            { heading: 'Roles', items: [{ label: 'UI dev', description: 'arma interfaces' }] },
          ],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Frontend' })).toBeInTheDocument();
    expect(screen.getByText('React').closest('ul')).toHaveClass('sm:grid-cols-2');
    expect(screen.getByText('UI dev:').closest('ul')).not.toHaveClass('sm:grid-cols-2');
    expect(screen.getByText('quienes disfrutan lo visual')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('lists every specialty in the table of contents', () => {
    Element.prototype.scrollTo = jest.fn() as unknown as typeof Element.prototype.scrollTo;
    renderInPlatform(<TableOfContents />);

    const first = specialtyGroups[0].specialties[0];
    expect(screen.getAllByRole('link', { name: new RegExp(first.title) })[0]).toHaveAttribute(
      'href',
      `#${first.id}`,
    );
  });
});

describe('InfluencerCard', () => {
  it('shows the influencer with platform links', () => {
    render(
      <InfluencerCard
        influencer={{
          id: 'i1',
          name: 'MiduDev',
          image: 'midu.webp',
          description: 'Streams de programación',
          platforms: {
            youtube: 'https://youtube.com/midu',
            twitter: 'https://x.com/midu',
            github: undefined,
            page: 'https://midu.dev',
          },
          specialties: ['JavaScript', 'React'],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'MiduDev' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://youtube.com/midu',
    );
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Página' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument();
    expect(screen.getByText('JavaScript · React')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('keeps absolute image paths and labels unknown platforms', () => {
    render(
      <InfluencerCard
        influencer={{
          id: 'i2',
          name: 'Otro',
          image: '/x.png',
          description: '',
          platforms: { tiktok: 'https://tiktok.com/x' } as never,
          specialties: [],
        }}
      />,
    );

    expect(screen.getByRole('link', { name: 'tiktok' })).toHaveAttribute(
      'href',
      'https://tiktok.com/x',
    );
  });
});
