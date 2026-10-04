import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventFlyerCarousel } from './event-flyer-carousel';

const listeners: Record<string, () => void> = {};
let selected = 0;
const api = {
  selectedScrollSnap: jest.fn(() => selected),
  on: jest.fn((name: string, fn: () => void) => {
    listeners[name] = fn;
  }),
  off: jest.fn(),
  scrollPrev: jest.fn(),
  scrollNext: jest.fn(),
  scrollTo: jest.fn(),
};

jest.mock('@/components/ui/carousel', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    Carousel: ({
      setApi,
      children,
    }: {
      setApi: (_a: unknown) => void;
      children: React.ReactNode;
    }) => {
      useEffect(() => setApi(api), [setApi]);
      return <div>{children}</div>;
    },
    CarouselContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('EventFlyerCarousel', () => {
  beforeEach(() => {
    selected = 0;
  });

  it('shows a placeholder without images', () => {
    render(<EventFlyerCarousel images={[]} eventName="Meetup" variant="detail" />);

    expect(screen.getByRole('img', { name: 'PCN' })).toBeInTheDocument();
  });

  it('shows a single flyer without controls', () => {
    render(<EventFlyerCarousel images={['/a.png']} eventName="Meetup" variant="detail" />);

    expect(screen.getByRole('img', { name: 'Flyer de Meetup' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('navigates between flyers and tracks the selected dot', async () => {
    const onParentClick = jest.fn();
    const { unmount } = render(
      <div onClick={onParentClick}>
        <EventFlyerCarousel images={['/a.png', '/b.png']} eventName="Meetup" />
      </div>,
    );

    expect(
      screen.getByRole('img', { name: 'Flyer de Meetup – imagen 2 de 2' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Imagen anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ir a imagen 2' }));

    expect(api.scrollNext).toHaveBeenCalled();
    expect(api.scrollPrev).toHaveBeenCalled();
    expect(api.scrollTo).toHaveBeenCalledWith(1);
    expect(onParentClick).not.toHaveBeenCalled();

    selected = 1;
    act(() => listeners.select());
    expect(screen.getByRole('button', { name: 'Ir a imagen 2' })).toHaveClass('w-4');
    expect(screen.getByRole('button', { name: 'Ir a imagen 1' })).toHaveClass('w-1.5');

    unmount();
    expect(api.off).toHaveBeenCalledWith('select', listeners.select);
  });
});
