import { render, screen, within } from '@testing-library/react';
import { AchievementsSection } from './achievements-section';
import { ActiveMembersCard } from './active-members-card';
import ASZSoftwareLogo from './asz-software-logo';
import BoweryLogo from './bowery-logo';
import { CommunityGrowthCard } from './community-growth-card';
import { CoursesCard } from './courses-card';
import { DiscordCard } from './discord-card';
import { FaqSection } from './faq-section';
import { FeatureBento } from './feature-bento';
import { HomeFooter } from './home-footer';
import { HomeSectionSkeleton } from './home-section-skeleton';
import { InterviewsSection } from './interviews-section';
import { JoinSection } from './join-section';
import { LatestChangesSection } from './latest-changes-section';
import { LatestConversationsSection } from './latest-conversations-section';
import { MainSponsorCard } from './main-sponsor-card';
import { MotivationalQuotes } from './motivational-quotes';
import { MusicSection } from './music-section';
import { PartnersMarquee } from './partners-marquee';
import { PartnersSection } from './partners-section';
import { PodcastCard } from './podcast-card';
import { RecommendedWatchSection } from './recommended-watch-section';
import { Reveal } from './reveal';
import { Eyebrow, SectionHeader } from './section-header';
import { SocialIcon } from './social-icon';
import { SocialLinks, socialNetworks } from './social-links';
import { TestimonialsSection } from './testimonials-section';

jest.mock('typewriter-effect', () => ({
  __esModule: true,
  default: ({ options }: { options: { strings: string[] } }) => (
    <span data-testid="typewriter">{options.strings.length}</span>
  ),
}));
jest.mock('@/components/music/music-grid', () => ({
  MusicGrid: ({ sets }: { sets: unknown[] }) => <p>{sets.length} radios</p>,
}));
jest.mock('@/components/videos/video-grid', () => ({
  VideoGrid: ({ videos }: { videos: unknown[] }) => <p>{videos.length} videos</p>,
}));
jest.mock('@/data/changelog', () => ({
  changelog: [
    { date: '2026-01-01', area: 'perfil', title: 'Viejo', description: 'd' },
    { date: '2026-03-01', area: 'eventos', title: 'Con link', description: 'd', href: '/eventos' },
    {
      date: '2026-02-01',
      area: 'admin',
      title: 'Solo admins',
      description: 'd',
      audience: 'admins',
    },
    { date: '2026-02-15', area: 'charlas', title: 'Sin link', description: 'd' },
    { date: '2025-12-01', area: 'x', title: 'Más viejo', description: 'd' },
    { date: '2025-11-01', area: 'x', title: 'Fuera del top', description: 'd' },
  ],
}));
jest.mock('@/data/partners', () => ({
  partners: [
    {
      name: 'Acme',
      kind: 'empresa',
      url: 'https://acme.test',
      logo: '/acme.svg',
      description: 'Empresa amiga',
      location: 'Remoto',
      showName: true,
      brandColor: '#f05a28',
    },
    {
      name: 'Plain',
      kind: 'empresa',
      url: 'https://plain.test',
      logo: '/plain.svg',
      description: 'Sin color',
      location: 'Remoto',
      showName: true,
      monochromeOnDark: true,
    },
    {
      name: 'Org',
      kind: 'organizacion',
      url: 'https://org.test',
      logo: '/org.svg',
      description: 'Una organización',
      location: 'Remoto',
    },
  ],
}));

describe('SectionHeader', () => {
  it('renders eyebrow, title, description and the action link', () => {
    render(
      <SectionHeader
        eyebrow="Eventos"
        title="Próximos eventos"
        description="Sumate"
        action={{ label: 'Ver todos', href: '/eventos' }}
      />,
    );
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Próximos eventos' })).toBeInTheDocument();
    expect(screen.getByText('Sumate')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/eventos');
  });

  it('can be centered and left bare', () => {
    const { container } = render(<SectionHeader title="Solo título" align="center" />);
    expect(container.firstElementChild).toHaveClass('items-center');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('Eyebrow prefixes a comment marker', () => {
    render(<Eyebrow className="x">Hola</Eyebrow>);
    expect(screen.getByText('Hola')).toHaveClass('x');
    expect(screen.getByText('Hola')).toHaveTextContent('// Hola');
  });
});

describe('static home sections', () => {
  it('FeatureBento links every resource and the WhatsApp group', () => {
    render(<FeatureBento />);
    expect(screen.getByRole('link', { name: /eventos/ })).toHaveAttribute('href', '/eventos');
    expect(screen.getByRole('link', { name: /unirmeAlGrupo/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByText('// próximamente')).toBeInTheDocument();
  });

  it('HomeFooter shows the site map as a tree and the social networks', () => {
    render(<HomeFooter />);
    expect(screen.getByRole('link', { name: 'Volver arriba' })).toHaveAttribute('href', '#top');
    for (const network of socialNetworks) {
      expect(screen.getByRole('link', { name: network.name })).toHaveAttribute('href', network.url);
    }
    expect(screen.getAllByText('└──', { exact: false })).toHaveLength(3);
    expect(
      screen.getByText(`© 2020–${new Date().getFullYear()} programaConNosotros`),
    ).toBeInTheDocument();
  });

  it('SocialLinks lists every network', () => {
    render(<SocialLinks />);
    expect(screen.getAllByRole('link')).toHaveLength(socialNetworks.length);
    expect(screen.getByText('Charlas y cursos grabados')).toBeInTheDocument();
  });

  it('SocialIcon forwards svg props', () => {
    const { container } = render(<SocialIcon name="Discord" className="icon" />);
    expect(container.querySelector('svg')).toHaveClass('icon');
  });

  it('LatestChangesSection shows the 4 newest public changes, linked when they have a page', () => {
    render(<LatestChangesSection />);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(['Con link', 'Sin link', 'Viejo', 'Más viejo']);
    expect(screen.queryByText('Solo admins')).not.toBeInTheDocument();
    expect(screen.getByText('Con link').closest('a')).toHaveAttribute('href', '/eventos');
    expect(screen.getByText('Sin link').closest('a')).toBeNull();
  });

  it('LatestConversationsSection links the 3 newest conversations', () => {
    render(<LatestConversationsSection />);
    const links = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/conversaciones?'));
    expect(links).toHaveLength(3);
    const dates = links.map((link) => link.querySelector('time')!.getAttribute('datetime')!);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('PartnersSection groups partners by kind and can hide its heading', () => {
    const { rerender } = render(<PartnersSection />);
    expect(screen.getByRole('heading', { name: 'Partners' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '// empresas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acme' })).toHaveStyle({
      '--partner-brand': '#f05a28',
    });
    expect(screen.getByRole('heading', { name: 'Plain' })).toHaveClass('group-hover:text-pcnGreen');
    expect(screen.getByRole('img', { name: 'Plain' })).toHaveClass('invert');
    expect(screen.queryByRole('heading', { name: 'Org' })).not.toBeInTheDocument();
    expect(screen.getByText('Una organización')).toBeInTheDocument();

    rerender(<PartnersSection showHeading={false} />);
    expect(screen.queryByRole('heading', { name: 'Partners' })).not.toBeInTheDocument();
  });

  it('PartnersMarquee shows every partner logo', () => {
    render(<PartnersMarquee />);
    expect(screen.getAllByRole('img', { name: 'Acme' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Ver partners →' })).toHaveAttribute(
      'href',
      '/partners',
    );
  });

  it('TestimonialsSection renders nothing without testimonials', () => {
    const { container } = render(<TestimonialsSection testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('TestimonialsSection shows each quote with its author initials', () => {
    render(
      <TestimonialsSection
        testimonials={[
          {
            id: '1',
            body: 'Me encantó',
            user: { id: 'u', name: 'ada  lovelace king', image: null },
          },
        ]}
      />,
    );
    expect(screen.getByText('Me encantó')).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('ada lovelace king')).toBeInTheDocument();
  });

  it('InterviewsSection links every interview area and the guides', () => {
    render(<InterviewsSection />);
    expect(screen.getByRole('link', { name: /empezar\(\);/ })).toHaveAttribute(
      'href',
      '/entrevistas',
    );
    expect(screen.getByRole('link', { name: /Guías de preparación/ })).toHaveAttribute(
      'href',
      '/entrevistas/guias',
    );
    expect(screen.getAllByRole('link', { name: 'guía' }).length).toBeGreaterThan(1);
    expect(
      screen.getAllByRole('link').some((l) => l.getAttribute('href') === '/entrevistas?tipo=qa'),
    ).toBe(true);
  });

  it('HomeSectionSkeleton renders the requested number of cells', () => {
    const { container } = render(<HomeSectionSkeleton cells={3} cellClassName="h-10" />);
    expect(container.querySelectorAll('.h-10')).toHaveLength(3);
    const defaults = render(<HomeSectionSkeleton />);
    expect(defaults.container.querySelectorAll('.h-40')).toHaveLength(4);
  });

  it('Reveal wraps its content', () => {
    render(<Reveal className="x">contenido</Reveal>);
    expect(screen.getByText('contenido')).toHaveClass('reveal', 'x');
  });

  it('MotivationalQuotes feeds every quote to the typewriter', () => {
    render(<MotivationalQuotes />);
    expect(screen.getByTestId('typewriter')).toHaveTextContent('6');
  });

  it('MusicSection and RecommendedWatchSection pass their content down', () => {
    render(
      <>
        <MusicSection />
        <RecommendedWatchSection />
      </>,
    );
    expect(screen.getByText(/radios$/)).toBeInTheDocument();
    expect(screen.getAllByText('3 videos')).toHaveLength(2);
  });

  it('StatCard-based cards link to their pages', () => {
    render(
      <>
        <ActiveMembersCard />
        <CoursesCard />
        <CommunityGrowthCard />
      </>,
    );
    expect(screen.getByRole('link', { name: /Miembros activos/ })).toHaveAttribute(
      'href',
      '/members',
    );
    expect(screen.getByRole('link', { name: /Cursos/ })).toHaveAttribute('href', '/cursos');
    expect(screen.getByRole('link', { name: /Crecimiento/ })).toHaveAttribute('href', '/growth');
  });

  it.each([
    ['AchievementsSection', AchievementsSection, 'Ver logros'],
    ['FaqSection', FaqSection, 'Ver todas las preguntas'],
    ['JoinSection', JoinSection, /verRepositorio/],
    ['DiscordCard', DiscordCard, /abrirDiscord/],
  ])('%s renders its call to action', (_name, Section, name) => {
    render(<Section />);
    expect(screen.getByRole('link', { name })).toBeInTheDocument();
  });

  it('sponsor cards render', () => {
    render(
      <>
        <MainSponsorCard />
        <PodcastCard />
      </>,
    );
    expect(screen.getByRole('img', { name: 'ASZ Studio' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bowery' })).toBeInTheDocument();
    expect(screen.getByText('Próximamente.')).toBeInTheDocument();
    const standalone = render(
      <>
        <ASZSoftwareLogo />
        <BoweryLogo />
      </>,
    );
    expect(within(standalone.container).getByText('ASZ Software')).toBeInTheDocument();
  });
});
