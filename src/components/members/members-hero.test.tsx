import { fireEvent, render, screen } from '@testing-library/react';
import type { CommunityMember } from '@/actions/users/fetch-community-members';
import { MembersHero } from './members-hero';
import { MemberGrowthChart } from './member-growth-chart';

const member = (id: string, createdAt: string, overrides: Partial<CommunityMember> = {}) =>
  ({
    id,
    name: `Persona ${id}`,
    image: null,
    isCofounder: false,
    isAmbassador: false,
    talks: 0,
    events: 0,
    projects: 0,
    createdAt: new Date(createdAt),
    ...overrides,
  }) as CommunityMember;

describe('MembersHero', () => {
  it('shows the real counts and a wall with everyone, linked to their profile', () => {
    render(
      <MembersHero
        members={[
          member('a', '2024-01-10', { isAmbassador: true, talks: 2, image: '/a.png' }),
          member('b', '2024-03-10', { projects: 1 }),
        ]}
      />,
    );

    expect(screen.getByText('nodos conectados').nextSibling).toHaveTextContent('2');
    expect(screen.getByText('desde 2024')).toBeInTheDocument();
    expect(screen.getByText('charlas dadas').nextSibling).toHaveTextContent('2');
    const wall = screen.getByRole('list', { name: 'Todos los miembros' });
    expect(wall.querySelectorAll('a')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Persona a' })).toHaveAttribute('href', '/perfil/a');
    // Without a photo, the initials
    expect(screen.getByRole('link', { name: 'Persona b' })).toHaveTextContent('PB');
  });
});

describe('MemberGrowthChart', () => {
  const points = [
    { month: new Date('2024-01-01T00:00:00Z'), total: 2, joined: 2 },
    { month: new Date('2024-02-01T00:00:00Z'), total: 2, joined: 0 },
    { month: new Date('2024-03-01T00:00:00Z'), total: 5, joined: 3 },
  ];

  it('needs at least two months', () => {
    const { container } = render(<MemberGrowthChart points={points.slice(0, 1)} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the month in focus, moving with the arrow keys', () => {
    render(<MemberGrowthChart points={points} />);
    const chart = screen.getByRole('img', { name: 'Miembros por mes: de 2 a 5' });

    fireEvent.keyDown(chart, { key: 'ArrowLeft' });
    expect(screen.getByRole('status')).toHaveTextContent('feb 2024');
    expect(screen.getByRole('status')).toHaveTextContent('2 miembros');
    expect(screen.getByRole('status')).not.toHaveTextContent('+');

    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(screen.getByRole('status')).toHaveTextContent('5 miembros · +3');

    fireEvent.blur(chart);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
