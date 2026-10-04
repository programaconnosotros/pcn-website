import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';
import { ImageCarousel } from './image-carousel';
import { mockRouter } from '@/test/dom';

jest.mock('embla-carousel-react', () => ({ __esModule: true, default: jest.fn() }));
const emblaMock = useEmblaCarousel as unknown as jest.Mock;

type Handler = (_api: unknown) => void;
const makeApi = (prev: boolean, next: boolean) => {
  const handlers: Record<string, Handler[]> = {};
  const api = {
    canScrollPrev: jest.fn(() => prev),
    canScrollNext: jest.fn(() => next),
    scrollPrev: jest.fn(),
    scrollNext: jest.fn(),
    on: jest.fn((event: string, handler: Handler) => {
      (handlers[event] ??= []).push(handler);
    }),
    off: jest.fn(),
    emit: (event: string) => handlers[event]?.forEach((handler) => handler(api)),
  };
  return api;
};

const Slides = (props: React.ComponentProps<typeof Carousel>) => (
  <Carousel {...props}>
    <CarouselContent>
      <CarouselItem>uno</CarouselItem>
      <CarouselItem>dos</CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);

describe('Carousel', () => {
  it('scrolls with its buttons and arrow keys, and reports its API', async () => {
    const api = makeApi(false, true);
    emblaMock.mockReturnValue([jest.fn(), api]);
    const setApi = jest.fn();
    render(<Slides setApi={setApi} />);

    expect(setApi).toHaveBeenCalledWith(api);
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    const next = screen.getByRole('button', { name: 'Next slide' });
    expect(next).toBeEnabled();

    await userEvent.click(next);
    expect(api.scrollNext).toHaveBeenCalledTimes(1);

    const region = screen.getByRole('region');
    fireEvent.keyDown(region, { key: 'ArrowRight' });
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    fireEvent.keyDown(region, { key: 'Enter' });
    expect(api.scrollNext).toHaveBeenCalledTimes(2);
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);

    // Selecting a slide refreshes which buttons are enabled.
    api.canScrollPrev.mockReturnValue(true);
    api.canScrollNext.mockReturnValue(false);
    act(() => api.emit('select'));
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it('lays out vertically and works before Embla is ready', async () => {
    emblaMock.mockReturnValue([jest.fn(), undefined]);
    render(<Slides orientation="vertical" />);
    expect(useEmblaCarousel).toHaveBeenCalledWith({ axis: 'y' }, undefined);
    expect(screen.getAllByRole('group')[0]).toHaveClass('pt-4');
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
  });

  it('requires the parts to live inside a Carousel', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CarouselItem />)).toThrow(
      'useCarousel must be used within a <Carousel />',
    );
    (console.error as jest.Mock).mockRestore();
  });
});

describe('ImageCarousel', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('cycles the images until hovered and opens the gallery on click', () => {
    render(<ImageCarousel images={['/a.png', '/b.png']} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Imagen 1');
    act(() => jest.advanceTimersByTime(300));
    expect(screen.getByRole('img')).toHaveAttribute('src', '/b.png');
    act(() => jest.advanceTimersByTime(300));
    expect(screen.getByRole('img')).toHaveAttribute('src', '/a.png');

    fireEvent.mouseEnter(img.parentElement!);
    expect(screen.getByText('Ver todas las fotos')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(900));
    expect(screen.getByRole('img')).toHaveAttribute('src', '/a.png');

    fireEvent.click(img.parentElement!);
    expect(mockRouter.push).toHaveBeenCalledWith('/photos');
    fireEvent.mouseLeave(img.parentElement!);
    expect(screen.queryByText('Ver todas las fotos')).toBeNull();
  });

  it('says when there are no images', () => {
    render(<ImageCarousel images={[]} />);
    expect(screen.getByText('No hay imágenes disponibles')).toBeInTheDocument();
  });
});
