import { render, screen } from '@testing-library/react';
import { adrs } from '@/app/(platform)/desarrollo/adrs';
import { AdrList } from './adr-list';

describe('AdrList', () => {
  it('renders every ADR as a collapsible row with its anchor, number and status', () => {
    const { container } = render(<AdrList adrs={adrs} />);
    expect(container.querySelectorAll('details')).toHaveLength(adrs.length);
    const first = adrs[0];
    expect(container.querySelector(`#adr-${first.slug}`)).not.toBeNull();
    expect(screen.getByText('ADR-001')).toBeInTheDocument();
    expect(screen.getByText(first.title)).toBeInTheDocument();
  });

  it('links a superseded ADR to the one that replaces it', () => {
    const replaced = {
      ...adrs[0],
      number: 98,
      slug: 'vieja',
      status: 'reemplazada' as const,
      supersededBy: 99,
    };
    const replacement = { ...adrs[1], number: 99, slug: 'nueva' };
    render(<AdrList adrs={[replaced, replacement]} />);
    expect(screen.getByRole('link', { name: 'ADR-099' })).toHaveAttribute('href', '#adr-nueva');
  });
});
