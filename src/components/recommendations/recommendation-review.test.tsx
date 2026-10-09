import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  approveRecommendation,
  rejectRecommendation,
  updateRecommendation,
} from '@/actions/recommendations/review-recommendations';
import type { ReviewRecommendation } from '@/lib/recommendations';
import { RecommendationReview } from './recommendation-review';

jest.mock('@/actions/recommendations/review-recommendations', () => ({
  approveRecommendation: jest.fn(),
  rejectRecommendation: jest.fn(),
  updateRecommendation: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const item = (overrides: Partial<ReviewRecommendation> = {}): ReviewRecommendation => ({
  id: 'r1',
  kind: 'VIDEO',
  slug: 'HqB3t7046QE',
  status: 'PENDING',
  title: 'Una charla',
  description: '',
  url: null,
  author: 'Javi Velasco',
  coauthors: [],
  source: 'Manfred',
  categories: [],
  language: 'es',
  publishedAt: new Date('2026-10-06'),
  year: null,
  imageUrl: null,
  isbn: null,
  durationSeconds: 2071,
  hours: null,
  youtubeUrls: [],
  isTalk: true,
  isMadeByCommunity: false,
  acceptDonations: false,
  position: 0,
  note: 'La mejor del año',
  submittedById: 'u1',
  reviewedById: null,
  reviewedAt: null,
  createdAt: new Date('2026-10-07T12:00:00Z'),
  updatedAt: new Date('2026-10-07T12:00:00Z'),
  submittedBy: { id: 'u1', name: 'Ana' },
  reviewedBy: null,
  ...overrides,
});

const items = [
  item(),
  item({
    id: 'r2',
    kind: 'BOOK',
    slug: 'clean-code',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    source: null,
    durationSeconds: null,
    note: null,
    url: 'https://amazon.com/clean',
  }),
  item({
    id: 'r3',
    kind: 'ARTICLE',
    slug: '1',
    status: 'APPROVED',
    title: 'Loop Engineering',
    submittedBy: null,
    submittedById: null,
  }),
];

describe('RecommendationReview', () => {
  it('lists the pending ones with who sent them, why, and what is missing', () => {
    render(<RecommendationReview items={items} />);

    expect(screen.getByRole('button', { name: /--pendientes 2/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText('Loop Engineering')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Una charla/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=HqB3t7046QE',
    );
    expect(screen.getByText('“La mejor del año”')).toBeInTheDocument();
    expect(screen.getAllByText(/por Ana/)).toHaveLength(2);
    const book = screen.getByText('Clean Code').closest('article')!;
    expect(
      within(book).getByText(/para publicarla falta: descripción, categorías/),
    ).toBeInTheDocument();
    expect(within(book).getByRole('button', { name: /aprobar/ })).toBeDisabled();
  });

  it('filters by status, kind and search', async () => {
    render(<RecommendationReview items={items} />);

    await userEvent.click(screen.getByRole('button', { name: 'libros' }));
    expect(screen.queryByText('Una charla')).not.toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'todo' }));
    await userEvent.click(screen.getByRole('button', { name: /--publicadas/ }));
    expect(screen.getByText('Loop Engineering')).toBeInTheDocument();
    expect(screen.getByText(/de la lista original/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /despublicar/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /--rechazadas/ }));
    expect(screen.getByText('No hay nada acá.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /--pendientes/ }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar recomendaciones' }), 'martin');
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.queryByText('Una charla')).not.toBeInTheDocument();
  });

  it('approves and rejects, refreshing the queue', async () => {
    jest.mocked(approveRecommendation).mockResolvedValue({ success: true });
    jest.mocked(rejectRecommendation).mockResolvedValue({ success: false, error: 'Ups' });
    render(<RecommendationReview items={items} />);
    const talk = screen.getByText('Una charla').closest('article')!;

    await userEvent.click(within(talk).getByRole('button', { name: /aprobar/ }));
    await waitFor(() => expect(approveRecommendation).toHaveBeenCalledWith('r1'));
    expect(toast.success).toHaveBeenCalledWith('Recomendación publicada');
    expect(refresh).toHaveBeenCalled();

    await userEvent.click(within(talk).getByRole('button', { name: /rechazar/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Ups'));
  });

  it('edits one with every field, then saves it', async () => {
    jest
      .mocked(updateRecommendation)
      .mockResolvedValueOnce({ success: false, error: 'Falta algo' })
      .mockResolvedValueOnce({ success: true });
    render(<RecommendationReview items={items} />);
    const talk = screen.getByText('Una charla').closest('article')!;

    await userEvent.click(within(talk).getByRole('button', { name: /editar/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('duración')).toHaveValue('34:31');
    expect(within(dialog).getByLabelText('canal')).toHaveValue('Manfred');
    await userEvent.clear(within(dialog).getByLabelText(/título/));
    await userEvent.type(within(dialog).getByLabelText(/título/), 'Charla corregida');

    await userEvent.click(within(dialog).getByRole('button', { name: /guardar/ }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Falta algo');

    await userEvent.click(within(dialog).getByRole('button', { name: /guardar/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(updateRecommendation).toHaveBeenLastCalledWith(
      'r1',
      expect.objectContaining({ title: 'Charla corregida', duration: '34:31' }),
    );
    expect(toast.success).toHaveBeenCalledWith('Recomendación guardada');
  });

  it('says when there is nothing to review', () => {
    render(<RecommendationReview items={[]} />);
    expect(screen.getByText('No hay recomendaciones para revisar.')).toBeInTheDocument();
  });
});
