import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollIndicator } from './scroll-indicator';
import { ScrollToTop } from './scroll-to-top';
import { ScrollHudButton } from './scroll-hud-button';

const setScroll = (scrollY: number, scrollHeight = 3000, innerHeight = 1000) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
};

const scrollTo = (y: number) =>
  act(() => {
    setScroll(y);
    fireEvent.scroll(window);
  });

beforeEach(() => {
  setScroll(0);
  window.scrollBy = jest.fn() as unknown as typeof window.scrollBy;
});

describe('ScrollIndicator', () => {
  it('shows at the top of a scrollable page and scrolls most of a screen down', async () => {
    render(<ScrollIndicator />);
    const button = screen.getByRole('button', { name: 'Bajar' });
    expect(button).toHaveTextContent('DN');

    await userEvent.click(button);
    expect(window.scrollBy).toHaveBeenCalledWith({ top: 850, behavior: 'smooth' });

    scrollTo(10);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Bajar' })).toBeNull());
  });

  it('stays hidden when the page fits the screen, rechecking on resize', () => {
    setScroll(0, 800);
    render(<ScrollIndicator />);
    expect(screen.queryByRole('button', { name: 'Bajar' })).toBeNull();

    act(() => {
      setScroll(0, 3000);
      fireEvent(window, new Event('resize'));
    });
    expect(screen.getByRole('button', { name: 'Bajar' })).toBeInTheDocument();
  });
});

describe('ScrollToTop', () => {
  it('appears after 300px with the scroll progress and goes back to the top', async () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole('button', { name: 'Volver arriba' })).toBeNull();

    scrollTo(1000);
    const button = screen.getByRole('button', { name: 'Volver arriba' });
    expect(button).toHaveTextContent('50');
    expect(button.querySelector('[style*="width"]')).toHaveStyle({ width: '50%' });

    await userEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    scrollTo(5000);
    expect(screen.getByRole('button', { name: 'Volver arriba' })).toHaveTextContent('100');
  });

  it('reports no progress when the page cannot scroll', () => {
    act(() => setScroll(400, 500, 1000));
    render(<ScrollToTop />);
    expect(screen.getByRole('button', { name: 'Volver arriba' })).toHaveTextContent('00');
    act(() => {
      fireEvent(window, new Event('resize'));
    });
  });
});

describe('ScrollHudButton', () => {
  it('renders without a progress rail by default and merges classes', async () => {
    const onClick = jest.fn();
    const { container } = render(
      <ScrollHudButton
        onClick={onClick}
        label="Ir"
        code="GO"
        icon={<span>↑</span>}
        className="x"
      />,
    );
    expect(container.firstChild).toHaveClass('x');
    expect(container.querySelector('[style*="width"]')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Ir' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
