import githubStats from '@/data/github-stats.json';
import { render, screen, within } from '@testing-library/react';
import { Team, teamSize } from './team';

// tsparticles needs a real canvas; the hero only places it as a backdrop.

describe('landing sections', () => {
  it('Team includes every contributor in the GitHub snapshot, even the ones not listed by hand', () => {
    const { container } = render(<Team />);
    const githubLinks = [...container.querySelectorAll('a[href^="https://github.com/"]')].map(
      (link) => link.getAttribute('href')!.split('/').pop()!.toLowerCase(),
    );
    for (const { login } of githubStats.topContributors)
      expect(githubLinks).toContain(login.toLowerCase());
    expect(screen.getByText('shadownrx')).toBeInTheDocument();
    expect(teamSize).toBeGreaterThanOrEqual(githubStats.topContributors.length);
  });

  it('Team links each member to their PCN profile when their GitHub login is linked', () => {
    render(<Team profiles={{ 'Agustin-Sanc': { id: 'u1', name: 'Agustín', image: null } }} />);
    expect(screen.getByRole('link', { name: 'Agus' })).toHaveAttribute('href', '/perfil/u1');
  });

  it('Team lists every member with links to their profiles', () => {
    render(<Team />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(teamSize);
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(teamSize);
  });
});
