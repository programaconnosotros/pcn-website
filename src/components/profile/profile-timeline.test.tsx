import { render, screen, within } from '@testing-library/react';
import { ProfileTimeline, type TimelineItem } from './profile-timeline';

const items: TimelineItem[] = [
  {
    id: 'a',
    kind: 'articulo',
    day: '2024-03-20',
    title: 'Escribió “Clean code”',
    href: 'https://blog.example.com/clean-code',
  },
  { id: 'b', kind: 'setup', day: '2024-03-02', title: 'Compartió su setup', href: '/setups/s1' },
  { id: 'c', kind: 'alta', day: '2024-01-10', title: 'Se sumó a programaConNosotros' },
];

describe('ProfileTimeline', () => {
  it('groups the items by month, newest first, with their day and kind', () => {
    render(<ProfileTimeline items={items} />);

    const months = screen.getAllByRole('heading', { level: 2 });
    expect(months.map((heading) => heading.textContent)).toEqual([
      '>marzo de 2024[2]',
      '>enero de 2024[1]',
    ]);
    const march = within(screen.getByRole('region', { name: 'marzo de 2024' }));
    expect(march.getAllByRole('listitem')).toHaveLength(2);
    expect(march.getByText('setup')).toBeInTheDocument();
  });

  it('opens outside links in a new tab and leaves items without a page unlinked', () => {
    render(<ProfileTimeline items={items} />);

    expect(screen.getByRole('link', { name: /Clean code/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /Compartió su setup/ })).not.toHaveAttribute('target');
    expect(screen.getByText('Se sumó a programaConNosotros').closest('a')).toBeNull();
  });
});
