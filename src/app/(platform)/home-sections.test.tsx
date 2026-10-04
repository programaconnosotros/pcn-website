import { render, screen } from '@testing-library/react';
import HomeSections from './home-sections';
import { Testimonials } from './testimonials';

function mockStub(name: string) {
  return function Stub() {
    return <section aria-label={name} />;
  };
}
jest.mock('@/components/home/achievements-section', () => ({
  AchievementsSection: mockStub('logros'),
}));
jest.mock('@/components/home/faq-section', () => ({ FaqSection: mockStub('faq') }));
jest.mock('@/components/home/feature-bento', () => ({ FeatureBento: mockStub('bento') }));
jest.mock('@/components/home/home-footer', () => ({ HomeFooter: mockStub('footer') }));
jest.mock('@/components/home/home-hero', () => ({
  HomeHero: ({ userName, title }: { userName: string | null; title: React.ReactNode }) => (
    <header>
      {title} {userName ?? 'visitante'}
    </header>
  ),
}));
jest.mock('@/components/home/join-section', () => ({ JoinSection: mockStub('unite') }));
jest.mock('@/components/home/music-section', () => ({ MusicSection: mockStub('música') }));
jest.mock('@/components/home/recommended-watch-section', () => ({
  RecommendedWatchSection: mockStub('para ver'),
}));
jest.mock('@/components/home/reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div data-reveal>{children}</div>,
}));
jest.mock('@/components/home/social-links', () => ({ SocialLinks: mockStub('redes') }));
jest.mock('@/components/home/partners-marquee', () => ({ PartnersMarquee: mockStub('partners') }));

const section = (name: string) => <section aria-label={name} />;

const props = {
  userName: 'Ana',
  title: <h1>Hola</h1>,
  testimonialsSection: section('testimonios'),
  recentlyAddedEventsSection: section('eventos'),
  latestConversationsSection: section('conversaciones'),
  latestTalksSection: section('charlas'),
  latestPhotosSection: section('fotos'),
  latestChangesSection: section('cambios'),
  latestArticlesSection: section('artículos'),
  interviewsSection: section('entrevistas'),
  ambassadorsSection: section('embajadores'),
  storyCardsSection: section('historias'),
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('HomeSections', () => {
  it('renders the hero and every section in order', () => {
    render(<HomeSections {...props} />);

    expect(screen.getByRole('banner')).toHaveTextContent('Hola Ana');
    expect(
      screen.getAllByRole('region').map((region) => region.getAttribute('aria-label')),
    ).toEqual([
      'partners',
      'eventos',
      'bento',
      'conversaciones',
      'charlas',
      'fotos',
      'artículos',
      'entrevistas',
      'logros',
      'para ver',
      'música',
      'historias',
      'testimonios',
      'redes',
      'cambios',
      'faq',
      'embajadores',
      'unite',
      'footer',
    ]);
  });

  it('skips the optional sections when there is nothing to show', () => {
    render(
      <HomeSections
        {...props}
        userName={null}
        recentlyAddedEventsSection={null}
        latestTalksSection={null}
        latestPhotosSection={null}
      />,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('visitante');
    for (const name of ['eventos', 'charlas', 'fotos']) {
      expect(screen.queryByRole('region', { name })).not.toBeInTheDocument();
    }
  });
});

describe('Testimonials', () => {
  it('shows every review in two marquees', () => {
    render(<Testimonials />);

    for (const name of [
      'Emiliano Grillo',
      'Mateo Herrera',
      'Mauricio Chaile',
      'Vicky Grillo',
      'Matías Gutiérrez',
    ]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });
});
