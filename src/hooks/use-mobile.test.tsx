import { act, renderHook } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;
  let listeners: Record<string, () => void>;
  let removeEventListener: jest.Mock;

  beforeEach(() => {
    listeners = {};
    removeEventListener = jest.fn();
    window.matchMedia = jest.fn().mockImplementation((media: string) => ({
      media,
      addEventListener: (type: string, listener: () => void) => (listeners[type] = listener),
      removeEventListener,
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  };

  it('is true below 768px and watches the breakpoint', () => {
    setWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('is false from 768px', () => {
    setWidth(768);
    expect(renderHook(() => useIsMobile()).result.current).toBe(false);
  });

  it('updates when the viewport crosses the breakpoint and stops listening on unmount', () => {
    setWidth(1024);
    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    setWidth(400);
    act(() => listeners.change());
    expect(result.current).toBe(true);

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', listeners.change);
  });
});
