import { communityStats, type MemberProfile } from './community-stats';

const member = (overrides: Partial<MemberProfile> = {}): MemberProfile => ({
  countryOfOrigin: 'Argentina',
  province: 'Tucumán',
  operatingSystems: [],
  favoriteIde: null,
  specialties: [],
  createdAt: new Date('2025-06-01T12:00:00Z'),
  languages: [],
  ...overrides,
});

describe('communityStats', () => {
  it('counts each answer once per member, labeled and from most to least', () => {
    const stats = communityStats([
      member({
        operatingSystems: ['ubuntu', 'macos', 'ubuntu'],
        favoriteIde: 'neovim',
        languages: [{ language: 'typescript' }, { language: 'go' }],
        specialties: ['backend'],
      }),
      member({
        operatingSystems: ['macos'],
        favoriteIde: 'vscode',
        languages: [{ language: 'typescript' }],
      }),
      member({ operatingSystems: ['windows'], favoriteIde: 'vscode', countryOfOrigin: 'Chile' }),
      // Ids that left the catalogs don't show up
      member({ operatingSystems: ['templeos'], favoriteIde: 'notepad', countryOfOrigin: null }),
    ]);

    expect(stats.members).toBe(4);
    expect(stats.countryCount).toBe(2);
    expect(stats.operatingSystems).toEqual([
      { label: 'macOS', value: 2 },
      { label: 'Ubuntu', value: 1 },
      { label: 'Windows', value: 1 },
    ]);
    expect(stats.ides).toEqual([
      { label: 'VS Code', value: 2 },
      { label: 'Neovim', value: 1 },
    ]);
    expect(stats.languages).toEqual([
      { label: 'TypeScript', value: 2 },
      { label: 'Go', value: 1 },
    ]);
    expect(stats.specialties).toEqual([{ label: 'Backend Development', value: 1 }]);
    expect(stats.countries).toEqual([
      { label: 'Argentina', value: 2 },
      { label: 'Chile', value: 1 },
    ]);
  });

  it('measures Linux among those who said which OS they use', () => {
    expect(
      communityStats([
        member({ operatingSystems: ['arch', 'windows'] }),
        member({ operatingSystems: ['macos'] }),
        member(),
      ]).linuxShare,
    ).toBe(0.5);
    expect(communityStats([member()]).linuxShare).toBeNull();
  });

  it('counts provinces only for Argentina and sign-ups per year in order', () => {
    const stats = communityStats([
      member({ province: 'Salta', createdAt: new Date('2026-02-01T12:00:00Z') }),
      member({ province: null, createdAt: new Date('2024-02-01T12:00:00Z') }),
      member({ countryOfOrigin: 'Uruguay', province: 'Montevideo' }),
    ]);

    expect(stats.provinces).toEqual([{ label: 'Salta', value: 1 }]);
    expect(stats.joinedByYear).toEqual([
      { label: '2024', value: 1 },
      { label: '2025', value: 1 },
      { label: '2026', value: 1 },
    ]);
  });
});
