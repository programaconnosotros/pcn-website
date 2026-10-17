import { render } from '@testing-library/react';
import { Marquee } from './marquee';

describe('Marquee', () => {
  it('repeats its children horizontally by default', () => {
    const { container, getAllByText } = render(
      <Marquee data-testid="m">
        <span>logo</span>
      </Marquee>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass('flex-row');
    expect(getAllByText('logo')).toHaveLength(4);
    expect(root.firstElementChild).toHaveClass('animate-marquee');
    expect(root.firstElementChild).not.toHaveClass('[animation-direction:reverse]');
  });

  it('supports vertical, reverse, pause on hover and a custom repeat count', () => {
    const { container, getAllByText } = render(
      <Marquee vertical reverse pauseOnHover repeat={2} className="extra">
        <span>logo</span>
      </Marquee>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass('flex-col', 'extra');
    expect(getAllByText('logo')).toHaveLength(2);
    expect(root.firstElementChild).toHaveClass(
      'animate-marquee-vertical',
      '[animation-direction:reverse]',
      'group-hover:[animation-play-state:paused]',
    );
  });
});
