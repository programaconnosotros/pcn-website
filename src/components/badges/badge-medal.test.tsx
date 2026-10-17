import { render } from '@testing-library/react';
import { BADGE_TONES } from '@/lib/badges';
import { BadgeMedal } from './badge-medal';

describe('BadgeMedal', () => {
  it('renders a large shining medal with its engraving', () => {
    const { container } = render(<BadgeMedal icon="trophy" tone="gold" className="extra" />);

    const medal = container.firstElementChild as HTMLElement;
    expect(medal).toHaveAttribute('aria-hidden');
    expect(medal).toHaveClass('extra');
    expect(medal.style.width).toBe('60px');
    expect(medal.style.filter).toContain(BADGE_TONES.gold.glow);
    expect(container.querySelector('.badge-shine')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveStyle({ width: '26px' });
  });

  it('renders small medals without the engraving or the idle shine', () => {
    const { container } = render(<BadgeMedal icon="star" tone="cyan" size="sm" />);

    expect((container.firstElementChild as HTMLElement).style.width).toBe('22px');
    expect(container.querySelector('.badge-shine')).toBeNull();
    expect(container.querySelector('svg')).toHaveStyle({ width: '11px' });
  });
});
