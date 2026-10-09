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

  it('hides the other markers while placing someone', async () => {
    renderPhoto();
    expect(screen.getByRole('link', { name: 'Ana' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ubicar a Beto' }));
    expect(screen.queryByRole('link', { name: 'Ana' })).not.toBeInTheDocument();
  });

  it('on touch screens, hides the markers until the photo is tapped, and toggles them', () => {
    const matchMedia = jest
      .spyOn(window, 'matchMedia')
      .mockImplementation(
        (query: string) => ({ matches: query === '(hover: none)' }) as MediaQueryList,
      );
    renderPhoto();
    const ana = screen.getByRole('link', { name: 'Ana' });
    const canvas = screen.getByRole('img', { name: 'la foto' }).parentElement!;
    expect(ana).toHaveClass('opacity-0');
    expect(screen.getByText(/tocá para ver/)).toBeInTheDocument();

    fireEvent.click(canvas);
    expect(ana).toHaveClass('opacity-100');
    expect(screen.queryByText(/tocá para ver/)).not.toBeInTheDocument();

    // Tapping a marker opens the profile without hiding the rest
    fireEvent.click(ana);
    expect(ana).toHaveClass('opacity-100');

    fireEvent.click(canvas);
    expect(ana).toHaveClass('opacity-0');
    matchMedia.mockRestore();
  });

  it('keeps hover for mouse screens: a click on the photo does nothing', () => {
    renderPhoto();
    const ana = screen.getByRole('link', { name: 'Ana' });
    fireEvent.click(screen.getByRole('img', { name: 'la foto' }).parentElement!);
    expect(ana).toHaveClass('opacity-0');
  });
});
