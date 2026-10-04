import { render, screen } from '@testing-library/react';
import { EventPhotos } from './event-photos';

const photos = [
  { id: 'p1', kind: 'PHOTO' as const, description: 'La charla', thumbUrl: '/p1.jpg' },
  { id: 'p2', kind: 'VIDEO' as const, description: null, thumbUrl: '/p2.jpg' },
  { id: 'p3', kind: 'PHOTO' as const, description: null, thumbUrl: '/p3.jpg' },
];

describe('EventPhotos', () => {
  it('links every thumbnail to the gallery within the event, plus upload for admins', () => {
    render(<EventPhotos eventId="e1" photos={photos} total={10} canUpload />);

    expect(screen.getByRole('link', { name: 'La charla' })).toHaveAttribute(
      'href',
      '/galeria/p1?evento=e1',
    );
    expect(screen.getByRole('img', { name: 'Video 2 del evento' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Foto 3 del evento' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'subir fotos y videos →' })).toHaveAttribute(
      'href',
      '/galeria/subir?evento=e1',
    );
    expect(screen.getByRole('link', { name: 'ver los 10 en la galería →' })).toHaveAttribute(
      'href',
      '/galeria?evento=e1',
    );
  });

  it('shows the empty state without links for visitors', () => {
    render(<EventPhotos eventId="e1" photos={[]} total={0} canUpload={false} />);

    expect(screen.getByText('Todavía no hay fotos ni videos.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('says "ver todo" for a single item', () => {
    render(<EventPhotos eventId="e1" photos={photos.slice(0, 1)} total={1} canUpload={false} />);

    expect(screen.getByRole('link', { name: 'ver todo en la galería →' })).toBeInTheDocument();
  });
});
