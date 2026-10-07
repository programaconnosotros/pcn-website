import { screen, within } from '@testing-library/react';
import { renderInPlatform } from '@/test/platform';
import { buildTile } from '@/test/gallery';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import {
  getGalleryFilterOptions,
  getGalleryItem,
  getGalleryNeighbours,
  listGalleryItems,
} from '@/lib/gallery';
import prisma from '@/lib/prisma';
import { Gallery } from '@/components/photo-gallery/gallery';
import { PhotoUploader } from '@/components/photo-gallery/photo-uploader';
import { PhotoEditForm } from '@/components/photo-gallery/photo-edit-form';
import { PhotoPeople } from '@/components/photo-gallery/photo-people';
import { PhotoKeyboardNav } from '@/components/photo-gallery/photo-keyboard-nav';
import { EventCoverKey } from '@/components/photo-gallery/event-cover-key';
import GaleriaLayout, { metadata as layoutMetadata } from './layout';
import GalleryPage from './page';
import Loading from './loading';
import UploadPhotosPage from './subir/page';
import EditPhotoPage from './[id]/editar/page';
import GalleryItemPage, { generateMetadata } from './[id]/page';
import ItemLoading from './[id]/loading';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/gallery', () => ({
  listGalleryItems: jest.fn(),
  getGalleryFilterOptions: jest.fn(),
  getGalleryItem: jest.fn(),
  getGalleryNeighbours: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { event: { findMany: jest.fn() } },
}));
jest.mock('@/components/photo-gallery/gallery', () => ({ Gallery: jest.fn(() => null) }));
jest.mock('@/components/photo-gallery/photo-uploader', () => ({
  PhotoUploader: jest.fn(() => null),
}));
jest.mock('@/components/photo-gallery/photo-edit-form', () => ({
  PhotoEditForm: jest.fn(() => null),
}));
jest.mock('@/components/photo-gallery/photo-actions-bar', () => ({
  PhotoActionsBar: () => null,
}));
jest.mock('@/components/photo-gallery/event-cover-key', () => ({
  EventCoverKey: jest.fn(() => null),
}));
jest.mock('@/components/photo-gallery/photo-people', () => ({ PhotoPeople: jest.fn(() => null) }));
jest.mock('@/components/photo-gallery/photo-keyboard-nav', () => ({
  PhotoKeyboardNav: jest.fn(() => null),
}));

const admin = { id: 'admin-1', name: 'Ada', image: null, role: 'ADMIN' };
const member = { id: 'user-1', name: 'Ana', image: 'ana.png', role: 'USER' };
const signIn = (user: typeof admin | null) =>
  jest.mocked(getCurrentSession).mockResolvedValue((user && { user }) as never);

const events = [
  { id: 'e1', name: 'Meetup', date: new Date('2030-05-10') },
  { id: 'e2', name: 'Conf', date: new Date('2030-04-10') },
];

const event = {
  id: 'e1',
  name: 'Meetup',
  date: new Date('2030-05-10'),
  isOnline: false,
  placeName: 'Club' as string | null,
  address: 'Calle 1' as string | null,
  city: 'Tucumán' as string | null,
  googleMapsUrl: null as string | null,
  coverPhotoId: null as string | null,
};

const buildItem = (overrides: Record<string, unknown> = {}) => ({
  ...buildTile(),
  width: 1200,
  height: 800,
  event: null,
  tags: [] as { taggedById: string; user: { id: string; name: string; image: string | null } }[],
  ...overrides,
});

const props = (id = 'photo-abc123', search: Record<string, string> = {}) => ({
  params: Promise.resolve({ id }),
  searchParams: Promise.resolve(search),
});

beforeEach(() => {
  signIn(null);
  jest.mocked(prisma.event.findMany).mockResolvedValue(events as never);
  jest.mocked(getGalleryNeighbours).mockResolvedValue({
    previous: null,
    next: null,
    previousId: null,
    nextId: null,
    index: 0,
    total: 1,
  });
});

describe('/galeria', () => {
  beforeEach(() => {
    jest.mocked(listGalleryItems).mockResolvedValue([buildTile()]);
    jest.mocked(getGalleryFilterOptions).mockResolvedValue({ events: [], people: [] } as never);
  });

  const galleryProps = () => jest.mocked(Gallery).mock.calls.at(-1)![0];

  it('sends old static gallery links back to the gallery', async () => {
    await expect(GalleryPage({ searchParams: Promise.resolve({ foto: '3' }) })).rejects.toThrow(
      'NEXT_REDIRECT:/galeria',
    );
  });

  it('shows the filtered items to visitors without upload or event editing', async () => {
    renderInPlatform(
      await GalleryPage({ searchParams: Promise.resolve({ tipo: 'videos', evento: 'e1' }) }),
    );
    const filter = { type: 'videos', eventId: 'e1', userId: undefined };
    expect(listGalleryItems).toHaveBeenCalledWith(filter);
    expect(galleryProps()).toMatchObject({ filter, canUpload: false, events: null });
    expect(prisma.event.findMany).not.toHaveBeenCalled();
  });

  it('lets admins upload and gives them every event', async () => {
    signIn(admin);
    renderInPlatform(await GalleryPage({ searchParams: Promise.resolve({}) }));
    expect(galleryProps()).toMatchObject({ canUpload: true, events });
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    );
  });

  it('has its metadata, layout, skeleton and social card', () => {
    expect(layoutMetadata.title).toBe('ls ~/galeria');
    renderInPlatform(
      <GaleriaLayout>
        <p>fotos</p>
      </GaleriaLayout>,
    );
    expect(screen.getByText('fotos')).toBeInTheDocument();
    expect(renderInPlatform(<Loading />).container.firstChild).not.toBeNull();
    expect(renderInPlatform(<ItemLoading />).container).toHaveTextContent('cargando foto');
  });
});

describe('/galeria/subir', () => {
  it('is only for admins', async () => {
    signIn(member as never);
    await expect(UploadPhotosPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      'NEXT_REDIRECT:/',
    );
  });

  it('preselects the event from the link when it exists', async () => {
    signIn(admin);
    renderInPlatform(await UploadPhotosPage({ searchParams: Promise.resolve({ evento: 'e2' }) }));
    expect(jest.mocked(PhotoUploader).mock.calls[0][0]).toEqual({
      events,
      defaultEventId: 'e2',
    });
  });

  it('ignores an unknown event', async () => {
    signIn(admin);
    renderInPlatform(await UploadPhotosPage({ searchParams: Promise.resolve({ evento: 'zz' }) }));
    expect(jest.mocked(PhotoUploader).mock.calls[0][0].defaultEventId).toBeNull();
  });
});

describe('/galeria/[id]/editar', () => {
  it('is only for admins', async () => {
    await expect(EditPhotoPage({ params: Promise.resolve({ id: 'x' }) })).rejects.toThrow(
      'NEXT_REDIRECT:/',
    );
  });

  it('is not found for a missing photo', async () => {
    signIn(admin);
    jest.mocked(getGalleryItem).mockResolvedValue(null);
    await expect(EditPhotoPage({ params: Promise.resolve({ id: 'x' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });

  it('edits the photo with the list of events', async () => {
    signIn(admin);
    const photo = buildItem();
    jest.mocked(getGalleryItem).mockResolvedValue(photo as never);
    renderInPlatform(await EditPhotoPage({ params: Promise.resolve({ id: photo.id }) }));
    expect(jest.mocked(PhotoEditForm).mock.calls[0][0]).toEqual({ photo, events });
    expect(screen.getByRole('link', { name: /pcn-.*abc123\.webp/ })).toHaveAttribute(
      'href',
      `/galeria/${photo.id}`,
    );
  });
});

describe('/galeria/[id]', () => {
  describe('metadata', () => {
    it('is missing for an unknown photo', async () => {
      jest.mocked(getGalleryItem).mockResolvedValue(null);
      expect(await generateMetadata(props('x'))).toEqual({
        title: { absolute: '404: no such file or directory' },
      });
    });

    it('names who is in the photo and uses the full image', async () => {
      jest.mocked(getGalleryItem).mockResolvedValue(
        buildItem({
          description: 'Brindis',
          tags: [{ taggedById: 'u', user: { id: 'u1', name: 'Ana', image: null } }],
        }) as never,
      );
      const meta = await generateMetadata(props());
      expect(meta.description).toBe('Con Ana. Galería de programaConNosotros.');
      expect(meta.title).toBe('open ~/galeria/brindis');
      expect(meta.openGraph).toMatchObject({
        title: 'Brindis',
        url: '/galeria/photo-abc123',
        images: [{ url: expect.stringContaining(encodeURIComponent('full.webp')), alt: 'Brindis' }],
      });
    });

    it('uses the poster of a video and a generic description', async () => {
      jest.mocked(getGalleryItem).mockResolvedValue(buildItem({ kind: 'VIDEO' }) as never);
      const meta = await generateMetadata(props());
      expect(meta.description).toBe('Galería de fotos de la comunidad programaConNosotros.');
      expect(meta.twitter).toMatchObject({
        images: [{ url: expect.stringContaining(encodeURIComponent('thumb.webp')) }],
      });
    });
  });

  it('is not found for a missing photo', async () => {
    jest.mocked(getGalleryItem).mockResolvedValue(null);
    await expect(GalleryItemPage(props('x'))).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('shows a photo to a visitor, without navigation or editing', async () => {
    jest.mocked(getGalleryItem).mockResolvedValue(buildItem() as never);
    renderInPlatform(await GalleryItemPage(props()));

    expect(screen.getByRole('img', { name: 'Foto de la comunidad' })).toHaveAttribute(
      'src',
      'https://cdn.dev/full.webp',
    );
    expect(screen.queryByRole('navigation', { name: 'Fotos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Editar o eliminar' })).not.toBeInTheDocument();
    expect(screen.queryByText('evento')).not.toBeInTheDocument();
    expect(jest.mocked(PhotoPeople).mock.calls[0][0]).toMatchObject({
      viewer: null,
      isAdmin: false,
    });
    expect(jest.mocked(PhotoKeyboardNav).mock.calls[0][0]).toEqual({
      previousHref: null,
      nextHref: null,
    });
  });

  it('lays wide photos across the page and keeps tall ones beside their details', async () => {
    jest.mocked(getGalleryItem).mockResolvedValue(buildItem({ width: 1600, height: 900 }) as never);
    const wide = renderInPlatform(await GalleryItemPage(props()));
    expect(wide.container.querySelector('[data-layout]')).toHaveAttribute(
      'data-layout',
      'landscape',
    );
    wide.unmount();

    jest.mocked(getGalleryItem).mockResolvedValue(buildItem({ width: 900, height: 1600 }) as never);
    const tall = renderInPlatform(await GalleryItemPage(props()));
    expect(tall.container.querySelector('[data-layout]')).toHaveAttribute(
      'data-layout',
      'portrait',
    );
    // The grid's thumbnail shows while the full photo loads.
    expect(
      screen.getByRole('img', { name: 'Foto de la comunidad' }).style.backgroundImage,
    ).toContain('url(');
  });

  it('keeps the filters in prev/next links and the counter', async () => {
    signIn(member as never);
    jest
      .mocked(getGalleryItem)
      .mockResolvedValue(buildItem({ event, description: 'Charla' }) as never);
    jest.mocked(getGalleryNeighbours).mockResolvedValue({
      previous: { id: 'p0', kind: 'PHOTO', thumbUrl: '/p0-t.webp', fullUrl: '/p0.webp' },
      next: { id: 'n1', kind: 'VIDEO', thumbUrl: '/n1-t.webp', fullUrl: '/n1.mp4' },
      previousId: 'p0',
      nextId: 'n1',
      index: 2,
      total: 12,
    });
    renderInPlatform(await GalleryItemPage(props('photo-abc123', { evento: 'e1' })));

    const nav = screen.getByRole('navigation', { name: 'Fotos' });
    expect(within(nav).getByRole('link', { name: 'Anterior' })).toHaveAttribute(
      'href',
      '/galeria/p0?evento=e1',
    );
    expect(within(nav).getByRole('link', { name: 'Siguiente' })).toHaveAttribute(
      'href',
      '/galeria/n1?evento=e1',
    );
    expect(screen.getByText('10')).toBeInTheDocument();
    // The event the visitor filtered by shows in the breadcrumb.
    expect(screen.getAllByRole('link', { name: 'Meetup' })[0]).toHaveAttribute(
      'href',
      '/galeria?evento=e1',
    );
    expect(screen.getByText('Charla', { selector: 'p' })).toBeInTheDocument();
    expect(jest.mocked(PhotoPeople).mock.calls[0][0].viewer).toEqual({
      id: 'user-1',
      name: 'Ana',
      image: 'ana.png',
    });
  });

  it('links the place of the event to a maps search', async () => {
    jest.mocked(getGalleryItem).mockResolvedValue(buildItem({ event }) as never);
    renderInPlatform(await GalleryItemPage(props()));

    expect(screen.getByRole('link', { name: 'Meetup' })).toHaveAttribute('href', '/eventos/e1');
    const place = screen.getByRole('link', { name: 'Club, Tucumán' });
    expect(place.getAttribute('href')).toMatch(/google\.com\/maps/);
  });

  it('prefers the event maps link, and shows online or missing places as text', async () => {
    jest
      .mocked(getGalleryItem)
      .mockResolvedValueOnce(
        buildItem({ event: { ...event, googleMapsUrl: 'https://maps.app/x' } }) as never,
      );
    const first = renderInPlatform(await GalleryItemPage(props()));
    expect(screen.getByRole('link', { name: 'Club, Tucumán' })).toHaveAttribute(
      'href',
      'https://maps.app/x',
    );
    first.unmount();

    jest
      .mocked(getGalleryItem)
      .mockResolvedValueOnce(
        buildItem({ event: { ...event, isOnline: true, city: null } }) as never,
      );
    const second = renderInPlatform(await GalleryItemPage(props()));
    expect(screen.getByText('online')).toBeInTheDocument();
    second.unmount();

    jest.mocked(getGalleryItem).mockResolvedValueOnce(
      buildItem({
        event: { ...event, placeName: null, address: null, city: 'Salta' },
      }) as never,
    );
    const third = renderInPlatform(await GalleryItemPage(props()));
    expect(screen.getByText('Salta')).not.toHaveAttribute('href');
    third.unmount();

    jest
      .mocked(getGalleryItem)
      .mockResolvedValueOnce(
        buildItem({ event: { ...event, placeName: null, address: null, city: null } }) as never,
      );
    renderInPlatform(await GalleryItemPage(props()));
    expect(screen.getByText('sin datos')).toBeInTheDocument();
  });

  it('plays a video with its duration', async () => {
    jest
      .mocked(getGalleryItem)
      .mockResolvedValue(buildItem({ kind: 'VIDEO', durationSeconds: 65, width: null }) as never);
    const { container } = renderInPlatform(await GalleryItemPage(props()));
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('poster', 'https://cdn.dev/thumb.webp');
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('lets admins edit the photo and set it as the event cover', async () => {
    signIn(admin);
    jest
      .mocked(getGalleryItem)
      .mockResolvedValue(buildItem({ event: { ...event, coverPhotoId: 'photo-abc123' } }) as never);
    renderInPlatform(await GalleryItemPage(props()));

    expect(screen.getByRole('link', { name: 'Editar o eliminar' })).toHaveAttribute(
      'href',
      '/galeria/photo-abc123/editar',
    );
    expect(jest.mocked(EventCoverKey).mock.calls[0][0]).toEqual({
      eventId: 'e1',
      photoId: 'photo-abc123',
      isCover: true,
    });
    expect(jest.mocked(PhotoPeople).mock.calls[0][0].isAdmin).toBe(true);
  });

  it('does not offer a video as the event cover', async () => {
    signIn(admin);
    jest.mocked(getGalleryItem).mockResolvedValue(buildItem({ kind: 'VIDEO', event }) as never);
    renderInPlatform(await GalleryItemPage(props()));
    expect(EventCoverKey).not.toHaveBeenCalled();
  });
});
