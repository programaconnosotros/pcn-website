import { act, render } from '@testing-library/react';
import { NumberTicker } from './number-ticker';

// A minimal motion value: `set` notifies `on('change')` listeners right away, and the spring is
// the same value, so the ticker shows its target without animating.
let inView = true;
jest.mock('motion/react', () => {
  const makeValue = (initial: number) => {
    const listeners = new Set<(_v: number) => void>();
    let current = initial;
    return {
      get: () => current,
      set: (v: number) => {
        current = v;
        listeners.forEach((l) => l(v));
      },
      on: (_event: string, listener: (_v: number) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  };
  const { useRef } = jest.requireActual('react');
  return {
    useInView: () => inView,
    useMotionValue: (initial: number) => {
      const ref = useRef(null);
      ref.current ??= makeValue(initial);
      return ref.current;
    },
    useSpring: (value: unknown) => value,
  };
});

describe('NumberTicker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    inView = true;
  });
  afterEach(() => jest.useRealTimers());

  it('counts up to the value once in view, after the delay', () => {
    const { container } = render(<NumberTicker value={1234} delay={1} className="big" />);
    const span = container.querySelector('span')!;
    expect(span).toHaveClass('big');
    expect(span).toHaveTextContent('');

    act(() => jest.advanceTimersByTime(1000));
    expect(span).toHaveTextContent('1,234');
  });

  it('counts down to zero and formats decimals', () => {
    const { container } = render(<NumberTicker value={5} direction="down" decimalPlaces={2} />);
    act(() => jest.runAllTimers());
    expect(container.querySelector('span')).toHaveTextContent('0.00');
  });

  it('shows 0 right away when the value is 0', () => {
    const { container } = render(<NumberTicker value={0} />);
    expect(container.querySelector('span')).toHaveTextContent('0');
  });

  it('waits while out of view', () => {
    inView = false;
    const { container } = render(<NumberTicker value={7} />);
    act(() => jest.runAllTimers());
    expect(container.querySelector('span')).toHaveTextContent('');
  });
});
