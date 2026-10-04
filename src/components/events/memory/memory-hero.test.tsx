import { act, render, screen } from '@testing-library/react';
import { MemoryHero } from './memory-hero';

const base = {
  name: 'Meetup',
  date: new Date('2030-05-10T22:00:00Z'),
  catalogNumber: 3,
  stats: [{ value: 4, label: 'charlas' }],
};

describe('MemoryHero', () => {
  it('shows the photos as backdrop with place, stats and the cover picker', () => {
    const { container } = render(
      <MemoryHero
        {...base}
        place="Bar XYZ"
        covers={['/a.jpg']}
        flyer="/f.png"
        coverPicker={<button type="button">elegir</button>}
      />,
    );

    expect(screen.getByText('Nº 003 · así fue')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Meetup' })).toBeInTheDocument();
    expect(screen.getByText(/· Bar XYZ/)).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('4charlas');
    expect(screen.getByRole('button', { name: 'elegir' })).toBeInTheDocument();
    expect(container.querySelector('img[src="/a.jpg"]')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Flyer de Meetup' })).not.toBeInTheDocument();
  });

  it('hangs the flyer when there are no photos', () => {
    render(<MemoryHero {...base} place={null} covers={[]} flyer="/f.png" stats={[]} />);

    expect(screen.getByRole('img', { name: 'Flyer de Meetup' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders just the title without photos or flyer', () => {
    const { container } = render(
      <MemoryHero {...base} place={null} covers={[]} flyer={undefined} />,
    );

    expect(container.querySelector('img')).toBeNull();
  });
});

describe('MemoryCover (through MemoryHero)', () => {
  afterEach(() => jest.useRealTimers());

  it('cross-fades between several photos every 7 seconds', () => {
    jest.useFakeTimers();
    const { container } = render(
      <MemoryHero {...base} place={null} covers={['/a.jpg', '/b.jpg']} flyer={undefined} />,
    );
    const [a, b] = Array.from(container.querySelectorAll('img'));
    expect(a).toHaveClass('opacity-100');
    expect(b).toHaveClass('opacity-0');

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(a).toHaveClass('opacity-0');
    expect(b).toHaveClass('opacity-100');
  });

  it('stays on the first photo for reduced motion', () => {
    jest.useFakeTimers();
    const matchMedia = jest.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const { container } = render(
      <MemoryHero {...base} place={null} covers={['/a.jpg', '/b.jpg']} flyer={undefined} />,
    );

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(container.querySelector('img')).toHaveClass('opacity-100');
    matchMedia.mockRestore();
  });
});
