import { render, screen } from '@testing-library/react';
import type { EventMemoryItem } from '@/lib/gallery';
import { MemoryMosaic } from './memory-mosaic';

const item = (id: string, overrides: Partial<EventMemoryItem> = {}) =>
  ({
    id,
    kind: 'PHOTO',
    src: '',
    thumbSrc: '',
    thumbUrl: `/t/${id}`,
    fullUrl: `/f/${id}`,
    width: 1000,
    height: 1000,
    durationSeconds: null,
    takenAt: new Date('2030-05-10T22:00:00Z'),
    description: null,
    ...overrides,
  }) as EventMemoryItem;

describe('MemoryMosaic', () => {
  it('shapes tiles after their photos and links each to the gallery', () => {
    render(
      <MemoryMosaic
        eventId="e1"
        total={5}
        items={[
          item('feature', { width: 1600, height: 900, description: 'Apertura' }),
          item('wide', { width: 1600, height: 900 }),
          item('tall', { width: 600, height: 900 }),
          item('square'),
          item('video', { kind: 'VIDEO', width: null, durationSeconds: 75 }),
        ]}
      />,
    );

    const feature = screen.getByRole('link', { name: 'Foto 1 de 5: Apertura' });
    expect(feature).toHaveAttribute('href', '/galeria/feature?evento=e1');
    expect(feature).toHaveClass('col-span-2', 'row-span-2');
    expect(screen.getByRole('link', { name: 'Foto 2 de 5' })).toHaveClass('col-span-2');
    expect(screen.getByRole('link', { name: 'Foto 2 de 5' })).not.toHaveClass('row-span-2');
    expect(screen.getByRole('link', { name: 'Foto 3 de 5' })).toHaveClass('row-span-2');
    expect(screen.getByRole('link', { name: 'Foto 4 de 5' }).className).not.toMatch(/span/);
    expect(screen.getByRole('link', { name: 'Video 5 de 5' })).toHaveTextContent('1:15 ·');
    expect(screen.queryByText(/ver todo en la galería/)).not.toBeInTheDocument();
  });

  it('links to the rest when there are more items than shown', () => {
    render(<MemoryMosaic eventId="e1" total={40} items={[item('a')]} />);

    expect(screen.getByRole('link', { name: /\+39/ })).toHaveAttribute(
      'href',
      '/galeria?evento=e1',
    );
  });
});
