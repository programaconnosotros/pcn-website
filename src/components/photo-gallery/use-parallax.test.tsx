import { useRef } from 'react';
import { act, render } from '@testing-library/react';
import { useParallax } from './use-parallax';

type ObserverCallback = (_entries: { target: Element; isIntersecting: boolean }[]) => void;

// The hook creates one shared observer the first time it's used, so the stub goes in first.
let callback: ObserverCallback;
const observe = jest.fn();
const unobserve = jest.fn();
window.IntersectionObserver = jest.fn((cb: ObserverCallback) => {
  callback = cb;
  return { observe, unobserve, disconnect: jest.fn() };
}) as unknown as typeof IntersectionObserver;

const Frame = () => {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref);
  return <div ref={ref} data-testid="frame" />;
};

describe('useParallax', () => {
  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((fn) => {
      fn(0);
      return 1;
    });
  });

  it('sets --parallax while the element is on screen and listens to scroll only then', () => {
    const addListener = jest.spyOn(window, 'addEventListener');
    const removeListener = jest.spyOn(window, 'removeEventListener');
    const { getByTestId, unmount } = render(<Frame />);
    const frame = getByTestId('frame');
    frame.getBoundingClientRect = () => ({ top: 0, height: 100 }) as DOMRect;
    expect(observe).toHaveBeenCalledWith(frame);

    act(() => callback([{ target: frame, isIntersecting: true }]));
    expect(addListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    const progress = Number(frame.style.getPropertyValue('--parallax'));
    expect(progress).toBeGreaterThan(-1);
    expect(progress).toBeLessThanOrEqual(1);

    // Scrolling while visible updates it again
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    act(() => callback([{ target: frame, isIntersecting: false }]));
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));

    act(() => callback([{ target: frame, isIntersecting: true }]));
    unmount();
    expect(unobserve).toHaveBeenCalledWith(frame);
  });

  it('stays still for reduced motion', () => {
    const matchMedia = jest
      .spyOn(window, 'matchMedia')
      .mockReturnValue({ matches: true } as MediaQueryList);

    render(<Frame />);

    expect(observe).not.toHaveBeenCalled();
    matchMedia.mockRestore();
  });
});
