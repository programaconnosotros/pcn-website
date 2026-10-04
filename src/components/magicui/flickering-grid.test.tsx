import { act, render } from '@testing-library/react';
import { FlickeringGrid } from './flickering-grid';

type Observer = { callback: IntersectionObserverCallback; disconnect: jest.Mock };

let observers: Observer[] = [];
let frames: FrameRequestCallback[] = [];
const ctx = {
  fillStyle: '',
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [4, 244, 190, 255] })),
};

beforeEach(() => {
  observers = [];
  frames = [];
  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => ctx as unknown as CanvasRenderingContext2D);
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  globalThis.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
    const observer = { callback, observe: jest.fn(), disconnect: jest.fn() };
    observers.push(observer);
    return observer;
  }) as unknown as typeof IntersectionObserver;
});

afterEach(() => jest.restoreAllMocks());

const enterView = (isIntersecting = true) =>
  act(() => {
    observers
      .at(-1)!
      .callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
  });

describe('FlickeringGrid', () => {
  it('sizes the canvas to the given dimensions', () => {
    const { container } = render(
      <FlickeringGrid width={100} height={50} color="#04f4be" className="extra" />,
    );
    const canvas = container.querySelector('canvas')!;
    expect(canvas.style.width).toBe('100px');
    expect(canvas.style.height).toBe('50px');
    expect(container.firstElementChild).toHaveClass('extra');
    expect(ctx.getImageData).toHaveBeenCalled();
    // Out of view: no animation frames requested.
    expect(frames).toHaveLength(0);
  });

  it('draws the grid with the parsed color while in view and stops when it leaves', () => {
    render(<FlickeringGrid width={20} height={20} squareSize={4} gridGap={6} />);
    enterView();
    expect(frames.length).toBeGreaterThan(0);

    act(() => frames.at(-1)!(16));
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fillStyle).toMatch(/^rgba\(4, 244, 190,/);

    const requested = frames.length;
    enterView(false);
    // Leaving the view cancels the loop and schedules no new frames.
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    expect(frames).toHaveLength(requested);
  });

  it('falls back to the container size and copes without a 2d context', () => {
    (HTMLCanvasElement.prototype.getContext as jest.Mock).mockReturnValue(null);
    const { container } = render(<FlickeringGrid />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('disconnects its observers on unmount', () => {
    const { unmount } = render(<FlickeringGrid width={10} height={10} />);
    unmount();
    expect(observers.at(-1)!.disconnect).toHaveBeenCalled();
  });
});
