import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CommunityMember } from '@/actions/users/fetch-community-members';
import { renderInPlatform } from '@/test/platform';
import { MiembrosClient } from './miembros-client';

const member = (overrides: Partial<CommunityMember>): CommunityMember => ({
  id: 'm',
  name: 'Miembro',
  image: null,
  jobTitle: null,
  enterprise: null,
  positions: [],
  slogan: null,
  career: null,
  studyPlace: null,
  isCofounder: false,
  isAmbassador: false,
  createdAt: new Date('2024-01-01'),
  talks: 0,
  events: 0,
  projects: 0,
  ...overrides,
});

const members = [
  member({
    id: 'a',
    name: 'Agustín Sánchez',
    isCofounder: true,
    isAmbassador: true,
    positions: [
      { jobTitle: 'CTO', enterprise: 'PCN' },
      { jobTitle: 'Dev', enterprise: null },
    ],
    slogan: 'Programá con nosotros',
    talks: 1,
    events: 3,
    projects: 2,
  }),
  member({ id: 'b', name: 'Bruno', jobTitle: 'QA', enterprise: 'Acme', talks: 4 }),
  member({ id: 'c', name: 'Carla', isAmbassador: true, career: 'Sistemas', events: 1 }),
  member({ id: 'd', name: 'Diego' }),
];

const sectionNames = (id: string) =>
  Array.from(
    document.getElementById(id)?.querySelectorAll('a span.font-medium') ?? [],
    (span) => span.textContent,
  );

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('MiembrosClient', () => {
  it('groups members into sections with their stats', () => {
    renderInPlatform(<MiembrosClient members={members} />);

    expect(sectionNames('co-founders')).toEqual(['Agustín Sánchez']);
    expect(sectionNames('ambassadors')).toEqual(['Agustín Sánchez', 'Carla']);
    expect(sectionNames('speakers')).toEqual(['Bruno', 'Agustín Sánchez']);
    expect(sectionNames('organizadores')).toEqual(['Agustín Sánchez', 'Carla']);
    expect(sectionNames('builders')).toEqual(['Agustín Sánchez']);
    expect(sectionNames('todos')).toEqual(['Diego', 'Carla', 'Bruno', 'Agustín Sánchez']);

    const [agustin] = within(document.getElementById('co-founders')!).getAllByRole('link');
    expect(agustin).toHaveAttribute('href', '/perfil/a');
    expect(agustin).toHaveTextContent('CTO @ PCN · Dev');
    expect(agustin).toHaveTextContent('"Programá con nosotros"');
    expect(agustin).toHaveTextContent('1 charla3 eventos2 proyectos');
    expect(agustin).toHaveTextContent('co-founder');
    expect(within(document.getElementById('speakers')!).getAllByRole('link')[0]).toHaveTextContent(
      'QA @ Acme',
    );
    expect(screen.getByRole('link', { name: '#builders' })).toHaveAttribute('href', '#builders');
    expect(screen.getByText(/ miembros$/)).toHaveTextContent('4/4 miembros');
  });

  it('searches by name, role and studies', async () => {
    const user = userEvent.setup();
    renderInPlatform(<MiembrosClient members={members} />);
    const search = screen.getByRole('textbox', { name: 'Buscar miembros' });

    await user.type(search, 'acme');
    expect(sectionNames('todos')).toEqual(['Bruno']);
    expect(document.getElementById('co-founders')).toBeNull();

    await user.clear(search);
    await user.type(search, 'sistemas');
    expect(sectionNames('todos')).toEqual(['Carla']);
    expect(screen.getByText(/ miembros$/)).toHaveTextContent('1/4 miembros');
  });

  it('says when nobody matches', async () => {
    const user = userEvent.setup();
    renderInPlatform(<MiembrosClient members={members} />);

    await user.type(screen.getByRole('textbox', { name: 'Buscar miembros' }), 'nadie');

    expect(screen.getByText(/0 resultados/)).toHaveTextContent('0 resultados para "nadie"');
  });

  it('shows 0 results without a query when there are no members', () => {
    renderInPlatform(<MiembrosClient members={[]} />);

    expect(screen.getByText(/0 resultados/)).toHaveTextContent(/^\$ 0 resultados$/);
  });

  it('shows the community status panel, but not while searching', async () => {
    renderInPlatform(<MiembrosClient members={members} />);
    expect(screen.getByRole('region', { name: 'La comunidad en números' })).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar miembros' }), 'bruno');
    expect(
      screen.queryByRole('region', { name: 'La comunidad en números' }),
    ).not.toBeInTheDocument();
  });

  it('numbers each member by when they joined', () => {
    renderInPlatform(<MiembrosClient members={members} />);
    const todos = document.getElementById('todos')!;
    // Newest first: Diego joined last
    expect(
      within(todos)
        .getAllByText(/^#\d{4}$/)
        .map((n) => n.textContent),
    ).toEqual(['#0004', '#0003', '#0002', '#0001']);
  });
});
