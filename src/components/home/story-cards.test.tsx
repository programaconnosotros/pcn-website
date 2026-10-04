import { act, render } from '@testing-library/react';
import { StoryCards } from './story-cards';

const currentPhotos = (container: HTMLElement) =>
  [...container.querySelectorAll('img.opacity-70')].map((img) => img.getAttribute('src'));

describe('StoryCards', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('links both cards and falls back to a default photo when a card has none', () => {
    const { container, getByRole } = render(
      <StoryCards photos={{ historia: [], galeria: ['/g.webp'] }} />,
    );
    expect(getByRole('link', { name: /Cómo llegamos hasta acá/ })).toHaveAttribute(
      'href',
      '/historia',
    );
    expect(getByRole('link', { name: /Recuerdos de la comunidad/ })).toHaveAttribute(
      'href',
      '/galeria',
    );
    expect(currentPhotos(container)).toEqual(['/IMG_8959.webp', '/g.webp']);

    // A single photo never rotates.
    act(() => jest.advanceTimersByTime(10_000));
    expect(currentPhotos(container)).toEqual(['/IMG_8959.webp', '/g.webp']);
  });

  it('cycles through every photo, preloading the next, and reshuffles without repeating', () => {
    const { container } = render(
      <StoryCards photos={{ historia: ['/a', '/b', '/c'], galeria: ['/g'] }} />,
    );
    const historia = () => currentPhotos(container)[0];
    expect(historia()).toBe('/a');
    // The upcoming photo is already in the DOM, hidden.
    expect(container.querySelector('img[src="/b"]')).toHaveClass('opacity-0');

    act(() => jest.advanceTimersByTime(2000));
    expect(historia()).toBe('/b');
    // The outgoing photo stays as a fading layer.
    expect(container.querySelector('img[src="/a"]')).toHaveClass('opacity-0');

    act(() => jest.advanceTimersByTime(2000));
    expect(historia()).toBe('/c');

    // The new round shuffles to [c, b, a]; c just closed the last round, so it moves to the back.
    jest.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    act(() => jest.advanceTimersByTime(2000));
    expect(historia()).toBe('/b');
  });

  it('starts the second card one second after the first', () => {
    const { container } = render(
      <StoryCards photos={{ historia: ['/a', '/b'], galeria: ['/x', '/y'] }} />,
    );
    act(() => jest.advanceTimersByTime(2000));
    expect(currentPhotos(container)).toEqual(['/b', '/x']);
    act(() => jest.advanceTimersByTime(1000));
    expect(currentPhotos(container)).toEqual(['/b', '/y']);
  });

  it('keeps still when the user prefers reduced motion', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: true,
    })) as typeof window.matchMedia;
    try {
      const { container } = render(
        <StoryCards photos={{ historia: ['/a', '/b'], galeria: ['/x', '/y'] }} />,
      );
      act(() => jest.advanceTimersByTime(10_000));
      expect(currentPhotos(container)).toEqual(['/a', '/x']);
    } finally {
      window.matchMedia = original;
    }
  });

  it('stops rotating once unmounted', () => {
    const clear = jest.spyOn(globalThis, 'clearInterval');
    const { unmount } = render(<StoryCards photos={{ historia: ['/a', '/b'], galeria: [] }} />);
    act(() => jest.advanceTimersByTime(2500));
    unmount();
    expect(clear).toHaveBeenCalled();
  });
});
