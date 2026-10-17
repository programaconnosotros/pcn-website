import { render, screen } from '@testing-library/react';
import { Team } from '@/components/landing/team';
import { getIdentityMap } from '@/lib/identity-links';
import { ContributorsSection } from './contributors-section';

jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/lib/github-stats', () => ({
  getCollaborationStats: async () => ({ commits: 1918, mergedPrs: 101 }),
}));
jest.mock('@/components/landing/team', () => ({
  teamSize: 17,
  Team: jest.fn(() => <ul aria-label="team" />),
}));

describe('ContributorsSection', () => {
  it('credits everyone who built the site, linked to their PCN profiles', async () => {
    const profiles = { 'agustin-sanc': { id: 'u1', name: 'Agus', image: null } };
    jest.mocked(getIdentityMap).mockResolvedValue(profiles);

    render(await ContributorsSection());

    expect(getIdentityMap).toHaveBeenCalledWith('github');
    expect(jest.mocked(Team).mock.calls[0][0]).toEqual({ profiles });
    expect(
      screen.getByRole('heading', { name: /personas detrás de esta web/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/17 colaboradores · 1\.918 commits · 101/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver cómo se desarrolla/ })).toHaveAttribute(
      'href',
      '/desarrollo',
    );
  });
});
