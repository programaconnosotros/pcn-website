import { render, screen, within } from '@testing-library/react';
import type { TechnologyTimeline } from '@/data/opiniones-tecnologia';
import { OpinionTimeline, stanceTally } from './opinion-timeline';

const opinion = (date: string, stance: 'positiva' | 'mixta' | 'negativa', hash: string) => ({
  date,
  stance,
  text: `Opinión del ${date}`,
  conversation: { title: `Charla ${hash}`, hash, href: `/conversaciones#${hash}` },
});

const timeline: TechnologyTimeline = {
  slug: 'docker',
  name: 'Docker',
  summary: 'Lo que pensó el grupo de Docker.',
  opinions: [
    opinion('2025-07-30', 'mixta', 'aaaaaaa'),
    opinion('2025-09-01', 'mixta', 'bbbbbbb'),
    opinion('2026-01-15', 'positiva', 'ccccccc'),
    opinion('2026-03-02', 'negativa', 'ddddddd'),
  ],
};

describe('OpinionTimeline', () => {
  it('lists every opinion as a commit with its date, stance and conversation link', () => {
    render(<OpinionTimeline {...timeline} />);

    const section = screen.getByRole('region', { name: 'Docker' });
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByRole('link', { name: '#aaaaaaa' })).toHaveAttribute(
      'href',
      '/conversaciones#aaaaaaa',
    );
    expect(within(items[0]).getByText('[dividido]')).toBeInTheDocument();
    expect(items[0].querySelector('time')).toHaveAttribute('dateTime', '2025-07-30');
    expect(within(section).getByText('git log --graph --docker')).toBeInTheDocument();
  });

  it('colors the spine from the previous stance and marks turns and HEAD', () => {
    render(<OpinionTimeline {...timeline} />);
    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveAttribute('data-first');
    expect(items[0].style.getPropertyValue('--prev')).toBe('#fbbf24');
    expect(items[2].style.getPropertyValue('--prev')).toBe('#fbbf24');
    expect(items[2].style.getPropertyValue('--node')).toBe('#04f4be');

    // A turn only where the stance changed from the previous opinion.
    expect(within(items[1]).queryByText('giro')).not.toBeInTheDocument();
    expect(within(items[2]).getByText('giro')).toBeInTheDocument();
    expect(within(items[3]).getByText('giro')).toBeInTheDocument();

    // The newest opinion is HEAD, and the header says where the group stands now.
    expect(items[3]).toHaveAttribute('data-head');
    expect(within(items[3]).getByText('HEAD')).toBeInTheDocument();
    expect(items.filter((item) => item.hasAttribute('data-head'))).toHaveLength(1);
    expect(screen.getByText('HEAD →').parentElement).toHaveTextContent('HEAD → en contra');
  });

  it('keeps the graph out of the accessibility tree', () => {
    const { container } = render(<OpinionTimeline {...timeline} />);
    for (const part of container.querySelectorAll('.opinion-node, .opinion-rail')) {
      expect(part.closest('[aria-hidden]')).not.toBeNull();
    }
  });

  it('sums up the stances in the header', () => {
    render(<OpinionTimeline {...timeline} />);
    expect(
      screen.getByText('4 commits · 1 a favor · 2 dividido · 1 en contra'),
    ).toBeInTheDocument();
    expect(stanceTally(['positiva'])).toBe('1 a favor');
    expect(stanceTally([])).toBe('');
  });
});
