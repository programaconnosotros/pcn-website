import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setGalleryTagPosition } from '@/actions/gallery/gallery-tags';
import { PhotoTagCanvas, PhotoTagsProvider, usePhotoTags } from './photo-tags';

jest.mock('@/actions/gallery/gallery-tags', () => ({ setGalleryTagPosition: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const PlaceButton = () => {
  const tags = usePhotoTags()!;
  return (
    <button type="button" onClick={() => tags.startPlacing({ id: 'u2', name: 'Beto' })}>
      ubicar a Beto
    </button>
  );
};

const renderPhoto = () =>
  render(
    <PhotoTagsProvider
      photoId="p1"
      initial={[
        { id: 'u1', name: 'Ana', position: { x: 0.25, y: 0.5 } },
        { id: 'u2', name: 'Beto', position: null },
      ]}
    >
      <PhotoTagCanvas>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="la foto" src="/p.webp" />
      </PhotoTagCanvas>
      <PlaceButton />
    </PhotoTagsProvider>,
  );

describe('PhotoTagCanvas', () => {
  it('marks where each placed person is, linking to their profile', () => {
    renderPhoto();
    const ana = screen.getByRole('link', { name: 'Ana' });
    expect(ana).toHaveAttribute('href', '/perfil/u1');
    expect(ana).toHaveStyle({ left: '25%', top: '50%' });
    expect(screen.queryByRole('link', { name: 'Beto' })).not.toBeInTheDocument();
  });

  it('places someone where the photo is clicked', async () => {
    jest.mocked(setGalleryTagPosition).mockResolvedValue({ position: { x: 0.5, y: 0.25 } });
    renderPhoto();
    await userEvent.click(screen.getByRole('button', { name: 'ubicar a Beto' }));
    expect(screen.getByText(/tocá dónde está Beto/)).toBeInTheDocument();

    const canvas = screen.getByRole('img', { name: 'la foto' }).parentElement!;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    fireEvent.click(canvas, { clientX: 100, clientY: 25 });

    await waitFor(() =>
      expect(setGalleryTagPosition).toHaveBeenCalledWith('p1', 'u2', { x: 0.5, y: 0.25 }),
    );
    expect(screen.getByRole('link', { name: 'Beto' })).toHaveStyle({ left: '50%', top: '25%' });
    expect(screen.queryByText(/tocá dónde está/)).not.toBeInTheDocument();
  });
});
