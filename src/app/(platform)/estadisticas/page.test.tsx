import { screen } from '@testing-library/react';
import { getCommunityStats, type CommunityStats } from '@/lib/community-stats';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import EstadisticasPage, { metadata } from './page';

jest.mock('@/lib/community-stats', () => ({ getCommunityStats: jest.fn() }));

const stats = (overrides: Partial<CommunityStats> = {}): CommunityStats => ({
  members: 520,
  countryCount: 6,
  linuxShare: 0.42,
  languages: [
    { label: 'TypeScript', value: 120 },
    { label: 'Python', value: 80 },
  ],
  operatingSystems: [{ label: 'Windows', value: 90 }],
  ides: [{ label: 'VS Code', value: 200 }],
  countries: [{ label: 'Argentina', value: 480 }],
  provinces: [{ label: 'Tucumán', value: 300 }],
  specialties: [{ label: 'Backend Development', value: 40 }],
  joinedByYear: [{ label: '2025', value: 300 }],
  ...overrides,
});

describe('/estadisticas', () => {
  it('describes the page', () => {
    expect(metadata.description).toMatch(/lenguajes, sistemas operativos, IDEs/);
  });

  it('shows the totals and a ranking per profile field', async () => {
    jest.mocked(getCommunityStats).mockResolvedValue(stats());

    await renderPage(EstadisticasPage());

    expect(screen.getByText('520')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    for (const label of [
      'TypeScript',
      'Windows',
      'VS Code',
      'Argentina',
      'Tucumán',
      'Backend Development',
      '2025',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('200 miembros')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '/perfil' })).toHaveAttribute('href', '/perfil');
  });

  it('says when nobody filled a field yet', async () => {
    jest
      .mocked(getCommunityStats)
      .mockResolvedValue(stats({ ides: [], operatingSystems: [], linuxShare: null }));

    await renderPage(EstadisticasPage());

    expect(screen.getAllByText('todavía nadie lo cargó en su perfil')).toHaveLength(2);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
