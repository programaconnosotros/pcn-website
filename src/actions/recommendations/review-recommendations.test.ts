import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { EMPTY_RECOMMENDATION_FORM } from '@/schemas/recommendation-schema';
import {
  approveRecommendation,
  rejectRecommendation,
  updateRecommendation,
} from './review-recommendations';

const member = { id: 'user-1', name: 'Ana', role: 'REGULAR' as const };
const admin = { id: 'admin-1', name: 'Admin', role: 'ADMIN' as const };

const loginAs = (user: typeof member | typeof admin) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const pendingVideo = {
  id: 'rec-1',
  kind: 'VIDEO',
  slug: 'HqB3t7046QE',
  status: 'PENDING',
  title: 'Charla',
  description: '',
  url: null,
  author: null,
  coauthors: [],
  source: 'Manfred',
  categories: [],
  language: 'es',
  publishedAt: new Date('2026-10-06'),
  durationSeconds: null,
  youtubeUrls: [],
};

beforeEach(() => {
  prismaMock.recommendation.findUnique.mockResolvedValue(pendingVideo as any);
  prismaMock.recommendation.findFirst.mockResolvedValue(null);
  prismaMock.recommendation.aggregate.mockResolvedValue({ _max: { position: 9 } } as any);
});

describe('reviewing recommendations', () => {
  it('is only for admins', async () => {
    loginAs(member);

    await expect(approveRecommendation('rec-1')).rejects.toThrow('No autorizado');
    await expect(rejectRecommendation('rec-1')).rejects.toThrow('No autorizado');
    await expect(updateRecommendation('rec-1', {})).rejects.toThrow('No autorizado');
    mockCookies();
    await expect(approveRecommendation('rec-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.recommendation.update).not.toHaveBeenCalled();
  });

  it('says when the recommendation does not exist', async () => {
    loginAs(admin);
    prismaMock.recommendation.findUnique.mockResolvedValue(null);

    const missing = { success: false, error: 'Recomendación no encontrada' };
    await expect(approveRecommendation('nope')).resolves.toEqual(missing);
    await expect(rejectRecommendation('nope')).resolves.toEqual(missing);
    await expect(updateRecommendation('nope', {})).resolves.toEqual(missing);
    await expect(approveRecommendation({ id: 'x' })).resolves.toEqual(missing);
  });

  it('does not publish what is missing fields the listing needs', async () => {
    loginAs(admin);

    await expect(approveRecommendation('rec-1')).resolves.toEqual({
      success: false,
      error: 'Para publicarla falta: duración',
    });
    expect(prismaMock.recommendation.update).not.toHaveBeenCalled();
  });

  it('publishes a complete one, crediting the admin, after the listed ones', async () => {
    loginAs(admin);
    prismaMock.recommendation.findUnique.mockResolvedValue({
      ...pendingVideo,
      durationSeconds: 2071,
    } as any);

    await expect(approveRecommendation('rec-1')).resolves.toEqual({ success: true });
    expect(prismaMock.recommendation.update).toHaveBeenCalledWith({
      where: { id: 'rec-1' },
      data: {
        status: 'APPROVED',
        reviewedById: 'admin-1',
        reviewedAt: expect.any(Date),
        position: 10,
      },
    });
  });

  it('rejects one, keeping it so nobody sends it again', async () => {
    loginAs(admin);

    await expect(rejectRecommendation('rec-1')).resolves.toEqual({ success: true });
    expect(prismaMock.recommendation.update).toHaveBeenCalledWith({
      where: { id: 'rec-1' },
      data: { status: 'REJECTED', reviewedById: 'admin-1', reviewedAt: expect.any(Date) },
    });
  });

  it('does nothing twice', async () => {
    loginAs(admin);
    prismaMock.recommendation.findUnique.mockResolvedValueOnce({
      ...pendingVideo,
      status: 'APPROVED',
    } as any);
    await expect(approveRecommendation('rec-1')).resolves.toEqual({ success: true });
    prismaMock.recommendation.findUnique.mockResolvedValueOnce({
      ...pendingVideo,
      status: 'REJECTED',
    } as any);
    await expect(rejectRecommendation('rec-1')).resolves.toEqual({ success: true });
    expect(prismaMock.recommendation.update).not.toHaveBeenCalled();
  });

  it('completes a recommendation with every field of the listing', async () => {
    loginAs(admin);

    await expect(
      updateRecommendation('rec-1', {
        ...EMPTY_RECOMMENDATION_FORM,
        url: 'https://youtu.be/HqB3t7046QE',
        title: 'Charla corregida',
        source: 'Manfred',
        duration: '34:31',
        publishedAt: '2026-10-06',
        note: 'nota',
      }),
    ).resolves.toEqual({ success: true });
    expect(prismaMock.recommendation.update).toHaveBeenCalledWith({
      where: { id: 'rec-1' },
      data: expect.objectContaining({ title: 'Charla corregida', durationSeconds: 2071 }),
    });
    const { data } = prismaMock.recommendation.update.mock.calls[0][0];
    expect(data).not.toHaveProperty('status');
    expect(data).not.toHaveProperty('slug');
  });

  it('never changes the video of a recommendation', async () => {
    loginAs(admin);

    await expect(
      updateRecommendation('rec-1', {
        ...EMPTY_RECOMMENDATION_FORM,
        url: 'https://youtu.be/6eBSHbLKuN0',
        title: 'Otra',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'El video no se puede cambiar: recomendá el otro aparte',
    });
  });

  it('keeps a published one complete and distinct from the rest', async () => {
    loginAs(admin);
    prismaMock.recommendation.findUnique.mockResolvedValue({
      ...pendingVideo,
      kind: 'ARTICLE',
      slug: '1',
      status: 'APPROVED',
    } as any);
    const article = {
      ...EMPTY_RECOMMENDATION_FORM,
      url: 'https://a.dev/post',
      title: 'Post',
      author: 'Ana',
    };

    await expect(updateRecommendation('rec-1', article)).resolves.toEqual({
      success: false,
      error: 'Para publicarla falta: descripción, categoría, fecha',
    });

    prismaMock.recommendation.findFirst.mockResolvedValue({
      id: 'other',
      status: 'APPROVED',
    } as any);
    await expect(
      updateRecommendation('rec-1', {
        ...article,
        description: 'd',
        categories: 'IA',
        publishedAt: '2026-01-01',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Ya está en la lista: alguien lo recomendó antes.',
    });
    expect(prismaMock.recommendation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: 'rec-1' } }) }),
    );
    expect(prismaMock.recommendation.update).not.toHaveBeenCalled();
  });
});
