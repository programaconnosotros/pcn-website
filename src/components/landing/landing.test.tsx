import githubStats from '@/data/github-stats.json';
import { render, screen, within } from '@testing-library/react';
import { Activities } from './activities';
import { CallToAction } from './call-to-action';
import { CommunityHighlights } from './community-highlights';
import { Discord } from './discord';
import { Footer } from './footer';
import { FrequentlyAskedQuestions } from './frequently-asked-questions';
import { Hero } from './hero';
import { LightningTalks } from './lightning-talks';
import { Motivation } from './motivation';
import { PlatformFeatures } from './platform-features';
import { PlatformFeaturesLarge } from './platform-features-large';
import { ScrollArrow } from './scroll-arrow';
import { Team, teamSize } from './team';
import { Testimonial } from './testimonial';

// tsparticles needs a real canvas; the hero only places it as a backdrop.
jest.mock('../ui/sparkles', () => ({
  SparklesCore: () => <div data-testid="sparkles" />,
}));

describe('landing sections', () => {
  it('Hero shows the wordmark, the backdrop and the auth links', () => {
    render(<Hero />);
    expect(screen.getAllByText('programaConNosotros').length).toBeGreaterThan(0);
    expect(screen.getByTestId('sparkles')).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

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

  it('Team lists every member with links to their profiles', () => {
    render(<Team />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(teamSize);
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(teamSize);
  });

  it('FrequentlyAskedQuestions lists questions and answers', () => {
    render(<FrequentlyAskedQuestions />);
    expect(
      screen.getByText('¿Tengo que pagar algo para ser parte de la comunidad?'),
    ).toBeInTheDocument();
  });

  it('LightningTalks and Motivation render their photo carousels', () => {
    render(
      <>
        <LightningTalks />
        <Motivation />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'Lightning Talks' })).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(2);
    expect(screen.getAllByRole('button', { name: /previous slide/i }).length).toBe(2);
  });

  it.each([
    ['Activities', Activities],
    ['CallToAction', CallToAction],
    ['CommunityHighlights', CommunityHighlights],
    ['Discord', Discord],
    ['Footer', Footer],
    ['PlatformFeatures', PlatformFeatures],
    ['PlatformFeaturesLarge', PlatformFeaturesLarge],
    ['ScrollArrow', ScrollArrow],
    ['Testimonial', Testimonial],
  ])('%s renders', (_name, Section) => {
    const { container } = render(<Section />);
    expect(container.firstElementChild).toBeInTheDocument();
  });
});
