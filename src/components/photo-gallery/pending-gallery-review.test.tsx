import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { approveGalleryItems, rejectGalleryItems } from '@/actions/gallery/gallery-actions';
import type { PendingGalleryItem } from '@/lib/gallery';
import { PendingGalleryReview } from './pending-gallery-review';

jest.mock('@/actions/gallery/gallery-actions', () => ({
  approveGalleryItems: jest.fn(),
  rejectGalleryItems: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const item = (overrides: Partial<PendingGalleryItem> = {}): PendingGalleryItem => ({
  id: 'p1',
  kind: 'PHOTO',
  src: 'gallery/x/full.webp',
  thumbSrc: 'gallery/x/thumb.webp',
  thumbUrl: 'https://cdn/thumb.webp',
  fullUrl: 'https://cdn/full.webp',
  takenAt: new Date('2030-05-10T21:00:00Z'),
  createdAt: new Date('2030-05-11T12:00:00Z'),
  description: 'En la oficina',
  working: true,
  event: null,
  uploadedBy: { id: 'u1', name: 'Ada', image: null },
  ...overrides,
});

describe('PendingGalleryReview', () => {
  it('says when there is nothing to review', () => {
    render(<PendingGalleryReview items={[]} />);
    expect(screen.getByText(/No hay fotos para revisar/)).toBeInTheDocument();
  });

  it('shows who uploaded each photo and where it would go', () => {
    render(
      <PendingGalleryReview
        items={[item(), item({ id: 'p2', working: false, event: { id: 'e1', name: 'Meetup' } })]}
      />,
    );
    const [first, second] = screen.getAllByRole('article');
    expect(within(first).getByRole('link', { name: 'Ada' })).toHaveAttribute('href', '/perfil/u1');
    expect(within(first).getByText('trabajando')).toBeInTheDocument();
    expect(within(first).getByText('En la oficina')).toBeInTheDocument();
    expect(within(first).getByRole('link', { name: 'Ver la foto en grande' })).toHaveAttribute(
      'href',
      'https://cdn/full.webp',
    );
    expect(within(second).queryByText('trabajando')).not.toBeInTheDocument();
    expect(within(second).getByText(/Meetup/)).toBeInTheDocument();
  });

  it('approves or rejects one photo, or approves them all', async () => {
    jest.mocked(approveGalleryItems).mockResolvedValue({ approved: 1 });
    jest.mocked(rejectGalleryItems).mockResolvedValue({ rejected: 1 });
    render(<PendingGalleryReview items={[item(), item({ id: 'p2' })]} />);
    const [first, second] = screen.getAllByRole('article');

    await userEvent.click(within(first).getByRole('button', { name: /aprobar/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Foto publicada'));
    expect(approveGalleryItems).toHaveBeenCalledWith(['p1']);

    await userEvent.click(within(second).getByRole('button', { name: /rechazar/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Foto rechazada'));
    expect(rejectGalleryItems).toHaveBeenCalledWith(['p2']);

    jest.mocked(approveGalleryItems).mockResolvedValue({ approved: 2 });
    await userEvent.click(screen.getByRole('button', { name: /aprobarTodas/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 fotos publicadas'));
    expect(approveGalleryItems).toHaveBeenLastCalledWith(['p1', 'p2']);
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it('says when the review fails', async () => {
    jest.mocked(approveGalleryItems).mockRejectedValue(new Error('boom'));
    render(<PendingGalleryReview items={[item()]} />);

    await userEvent.click(screen.getByRole('button', { name: /^aprobar$/ }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo revisar la foto'));
    expect(screen.getByRole('button', { name: /^aprobar$/ })).toBeEnabled();
  });
});
