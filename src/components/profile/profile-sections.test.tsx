import { render, screen, within } from '@testing-library/react';
import {
  ContributionChangelog,
  ContributionStats,
  ConversationRows,
  EmptyLine,
  OrganizedEvents,
  PhotoGrid,
  ProfileStat,
  ProjectRows,
  SectionHeading,
  isProfileTab,
} from './profile-sections';

const contributor = (login: string, linesAdded: number | null) => ({
  login,
  avatarUrl: `https://avatars.githubusercontent.com/${login}`,
  htmlUrl: `https://github.com/${login}`,
  commits: 1200,
  mergedPrs: 5,
  linesAdded,
  linesDeleted: 0,
  firstContributionWeek: null,
});

describe('profile sections', () => {
  it('renders headings, empty lines and stats with or without a link', () => {
    render(
      <>
        <SectionHeading label="proyectos" count={3} href="/perfil/u1?tab=proyectos" />
        <SectionHeading label="charlas" />
        <EmptyLine>sin datos</EmptyLine>
        <ProfileStat label="charlas" value={2} href="/perfil/u1?tab=charlas" />
        <ProfileStat label="fotos" value={9} />
      </>,
    );

    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('#proyectos(3)ver todo');
    expect(screen.getByRole('link', { name: 'ver todo' })).toHaveAttribute(
      'href',
      '/perfil/u1?tab=proyectos',
    );
    expect(screen.getByText('sin datos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /charlas\s*2/ })).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(isProfileTab('fotos')).toBe(true);
    expect(isProfileTab('otra')).toBe(false);
  });

  it('lists projects with logo or initials, role and stack', () => {
    render(
      <ProjectRows
        projects={[
          {
            id: 'p1',
            title: 'pcn web',
            description: 'El sitio',
            logoUrl: '',
            techStack: ['Next', 'Prisma'],
            role: 'autor',
          },
          {
            id: 'p2',
            title: 'Bot',
            description: 'Un bot',
            logoUrl: 'https://cdn.dev/l.png',
            techStack: [],
            role: 'colaborador',
          },
        ]}
      />,
    );

    const web = screen.getByRole('link', { name: /pcn web/ });
    expect(web).toHaveAttribute('href', '/proyectos/p1');
    expect(web).toHaveTextContent('PC');
    expect(web).toHaveTextContent('# Next · Prisma');
    expect(screen.getByRole('link', { name: /Bot/ })).toHaveTextContent('colaborador');
  });

  it('shows upcoming organized events as posters and past ones as framed flyers', () => {
    const event = (id: string, name: string, date: Date, overrides = {}) => ({
      id,
      name,
      date,
      endDate: null,
      description: `Sobre ${name}`,
      isOnline: false,
      placeName: 'Bar',
      city: 'Córdoba',
      flyerImages: [`/${id}.png`],
      markedAsFull: false,
      capacity: null,
      _count: { registrations: 12, galleryItems: 3, talks: 2 },
      ...overrides,
    });
    render(
      <OrganizedEvents
        events={
          [
            event('e1', 'Hackatón', new Date(2099, 6, 10), { isOnline: true }),
            event('e2', 'Meetup', new Date(2099, 4, 10)),
            event('e3', 'Primer meetup', new Date(2020, 4, 10)),
          ] as never
        }
      />,
    );

    const upcoming = screen.getByRole('heading', { name: /próximos/ }).parentElement!;
    // Soonest first.
    expect(
      within(upcoming)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/eventos/e2', '/eventos/e1']);
    expect(within(upcoming).getByRole('img', { name: 'Flyer de Meetup' })).toBeInTheDocument();
    expect(within(upcoming).getByText('online')).toBeInTheDocument();

    const past = screen.getByRole('heading', { name: /realizados/ }).parentElement!;
    const exhibit = within(past).getByRole('link', { name: /Primer meetup/ });
    expect(exhibit).toHaveAttribute('href', '/eventos/e3');
    expect(exhibit).toHaveTextContent('12 inscriptos · 2 charlas · 3 fotos');
    expect(exhibit).not.toHaveTextContent('Nº');
  });

  it('leaves out the group labels when every event is on the same side', () => {
    render(
      <OrganizedEvents
        events={
          [
            {
              id: 'e1',
              name: 'Primer meetup',
              date: new Date(2020, 4, 10),
              endDate: null,
              isOnline: false,
              placeName: null,
              city: null,
              flyerImages: [],
              _count: { registrations: 0, galleryItems: 0, talks: 0 },
            },
          ] as never
        }
      />,
    );

    expect(screen.getByRole('link', { name: /Primer meetup/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /realizados/ })).not.toBeInTheDocument();
  });

  it('shows photos and videos the person is in', () => {
    render(
      <PhotoGrid
        className="grid-cols-2"
        photos={[
          { id: 'f1', kind: 'PHOTO', description: 'Brindis', thumbUrl: '/a.jpg' },
          { id: 'v1', kind: 'VIDEO', description: null, thumbUrl: '/b.jpg' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Brindis' })).toHaveAttribute('href', '/galeria/f1');
    expect(screen.getByRole('img', { name: 'Foto de la comunidad' })).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('lists conversations', () => {
    render(
      <ConversationRows
        conversations={[
          {
            title: 'IA',
            date: '2030-05-10',
            summary: 'Hablamos de IA',
            participants: ['Ada', 'Bruno'],
          },
        ]}
      />,
    );

    expect(screen.getByRole('link')).toHaveTextContent(
      '2030-05-10 · 2 participantesIAHablamos de IA',
    );
  });

  it('sums the contributions and their share of the total', () => {
    render(
      <ContributionStats
        contributions={[contributor('ada', 1000), contributor('ada-alt', 500)]}
        totals={{ mergedPrs: 40, commits: 9000 }}
      />,
    );

    expect(screen.getByText('PRs mergeadas').nextSibling).toHaveTextContent('10');
    expect(screen.getByText('commits').nextSibling).toHaveTextContent('2.400');
    expect(screen.getByText('líneas agregadas').nextSibling).toHaveTextContent('+1.500');
    expect(screen.getByText('del total').nextSibling).toHaveTextContent('25%');
    expect(screen.getByText(/gh pr list --author ada,ada-alt/)).toBeInTheDocument();
    expect(within(screen.getAllByRole('listitem')[0]).getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/ada',
    );
  });

  it('shows a dash while GitHub computes the lines, and 0% without merged PRs', () => {
    render(
      <ContributionStats
        contributions={[contributor('ada', null)]}
        totals={{ mergedPrs: 0, commits: 0 }}
      />,
    );

    expect(screen.getByText('líneas agregadas').nextSibling).toHaveTextContent('—');
    expect(screen.getByText('del total').nextSibling).toHaveTextContent('0%');
  });

  it('lists what the person built as changelog entries, with their date and co-authors', () => {
    const entry = (title: string, date: string, logins: string[] = []) => ({
      date,
      area: 'eventos',
      title,
      description: `${title}, explicado`,
      adminOnly: false,
      authors: logins.map((login) => ({ login, user: null })),
    });
    const { container } = render(<ContributionChangelog entries={[]} />);
    expect(container).toBeEmptyDOMElement();

    render(
      <ContributionChangelog
        entries={[
          entry('Lista de espera', '2026-10-02', ['gmanavarro']),
          entry('Setups', '2026-09-01'),
        ]}
      />,
    );
    const list = screen.getByRole('region', { name: 'Lo que construyó' });
    expect(list).toHaveTextContent('(2)');
    expect(within(list).getByText('2026-10-02')).toBeInTheDocument();
    expect(within(list).getByText('Lista de espera, explicado')).toBeInTheDocument();
    expect(within(list).getByText('gmanavarro')).toBeInTheDocument();
  });
});
