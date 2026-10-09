import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { RateLimitError, enforceRateLimit } from '@/lib/rate-limit';
import { fetchYoutubeMetadata } from '@/lib/youtube-metadata';
import { EMPTY_RECOMMENDATION_FORM } from '@/schemas/recommendation-schema';
import { submitRecommendation } from './submit-recommendation';

jest.mock('@/actions/notifications/notify-admins', () => ({ notifyAdmins: jest.fn() }));
jest.mock('@/lib/youtube-metadata', () => ({ fetchYoutubeMetadata: jest.fn(async () => ({})) }));

const member = { id: 'user-1', name: 'Ana', role: 'REGULAR' as const };
const admin = { id: 'admin-1', name: 'Admin', role: 'ADMIN' as const };

const loginAs = (user: typeof member | typeof admin) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const video = {
  ...EMPTY_RECOMMENDATION_FORM,
  url: 'https://www.youtube.com/watch?v=HqB3t7046QE',
  title: 'AI Won’t Replace Craftsmanship',
  isTalk: true,
  note: 'La mejor charla del año',
};

const book = { ...EMPTY_RECOMMENDATION_FORM, title: 'Clean Code', author: 'Robert C. Martin' };

beforeEach(() => {
  prismaMock.recommendation.findFirst.mockResolvedValue(null);
  prismaMock.recommendation.findMany.mockResolvedValue([]);
  prismaMock.recommendation.create.mockResolvedValue({ id: 'rec-1' } as any);
  prismaMock.recommendation.aggregate.mockResolvedValue({ _max: { position: 41 } } as any);
});

describe('submitRecommendation', () => {
  it('asks anonymous visitors to sign in, without writing', async () => {
    mockCookies();

    await expect(submitRecommendation('VIDEO', video)).resolves.toEqual({
      success: false,
      error: 'Iniciá sesión para recomendar',
    });
    expect(prismaMock.recommendation.create).not.toHaveBeenCalled();
  });

  it('saves what a member recommends as pending, credited to them, and tells the admins', async () => {
    loginAs(member);
    jest.mocked(fetchYoutubeMetadata).mockResolvedValue({
      channel: 'Manfred',
      durationSeconds: 2071,
      publishedAt: new Date('2026-10-06T00:00:00.000Z'),
    });

    await expect(submitRecommendation('VIDEO', video)).resolves.toEqual({
      success: true,
      status: 'PENDING',
    });

    expect(enforceRateLimit).toHaveBeenCalledWith('recommendation');
    expect(fetchYoutubeMetadata).toHaveBeenCalledWith('HqB3t7046QE');
    expect(prismaMock.recommendation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        kind: 'VIDEO',
        slug: 'HqB3t7046QE',
        status: 'PENDING',
        title: 'AI Won’t Replace Craftsmanship',
        source: 'Manfred',
        durationSeconds: 2071,
        publishedAt: new Date('2026-10-06T00:00:00.000Z'),
        isTalk: true,
        note: 'La mejor charla del año',
        submittedById: 'user-1',
      }),
      select: { id: true },
    });
    const { data } = prismaMock.recommendation.create.mock.calls[0][0];
    expect(data).not.toHaveProperty('reviewedById');
    expect(notifyAdmins).toHaveBeenCalledWith({
      type: 'recommendation_pending',
      title: 'Nueva recomendación: un video',
      message:
        'Ana recomendó "AI Won’t Replace Craftsmanship". Revisala en /admin/recomendaciones.',
      metadata: { recommendationId: 'rec-1', kind: 'VIDEO', userId: 'user-1' },
    });
  });

  it('ignores the fields only admins set and anything outside the form', async () => {
    loginAs(member);

    await submitRecommendation('BOOK', {
      ...book,
      imageUrl: 'https://evil.dev/cover.png',
      status: 'APPROVED',
      submittedById: 'someone-else',
    });

    const { data } = prismaMock.recommendation.create.mock.calls[0][0];
    expect(data).toMatchObject({ status: 'PENDING', submittedById: 'user-1', imageUrl: null });
  });

  it('gives a new book a slug from its title that no other book uses', async () => {
    loginAs(member);
    prismaMock.recommendation.findMany.mockResolvedValue([
      { slug: 'clean-code' },
      { slug: 'clean-code-2' },
    ] as any);

    await submitRecommendation('BOOK', book);

    expect(prismaMock.recommendation.create.mock.calls[0][0].data.slug).toBe('clean-code-3');
  });

  it('says when it is already listed, pending or rejected', async () => {
    loginAs(member);
    for (const [status, error] of [
      ['APPROVED', 'Ya está en la lista: alguien lo recomendó antes.'],
      ['PENDING', 'Alguien ya lo recomendó y está esperando que un admin lo revise.'],
      ['REJECTED', 'Ya lo revisamos y decidimos no sumarlo.'],
    ]) {
      prismaMock.recommendation.findFirst.mockResolvedValueOnce({ id: 'x', status } as any);
      await expect(submitRecommendation('VIDEO', video)).resolves.toEqual({
        success: false,
        error,
      });
    }
    expect(prismaMock.recommendation.findFirst).toHaveBeenCalledWith({
      where: { kind: 'VIDEO', OR: [{ slug: 'HqB3t7046QE' }] },
      select: { id: true, status: true },
    });
    expect(prismaMock.recommendation.create).not.toHaveBeenCalled();
  });

  it('turns a duplicate that slipped in at the same time into the pending message', async () => {
    loginAs(member);
    prismaMock.recommendation.create.mockRejectedValue({ code: 'P2002' });

    await expect(submitRecommendation('VIDEO', video)).resolves.toEqual({
      success: false,
      error: 'Alguien ya lo recomendó y está esperando que un admin lo revise.',
    });
    expect(notifyAdmins).not.toHaveBeenCalled();
  });

  it('returns what is wrong with the form', async () => {
    loginAs(member);

    await expect(
      submitRecommendation('VIDEO', { ...video, url: 'https://vimeo.com/1' }),
    ).resolves.toEqual({ success: false, error: 'El link tiene que ser de un video de YouTube' });
    await expect(submitRecommendation('PODCAST', video)).resolves.toEqual({
      success: false,
      error: 'Tipo de recomendación inválido',
    });
    expect(prismaMock.recommendation.create).not.toHaveBeenCalled();
  });

  it('stops members who recommend too much', async () => {
    loginAs(member);
    jest.mocked(enforceRateLimit).mockRejectedValueOnce(new RateLimitError('recommendation', 600));

    await expect(submitRecommendation('VIDEO', video)).rejects.toMatchObject({
      digest: 'RATE_LIMIT:recommendation:600',
    });
    expect(prismaMock.recommendation.create).not.toHaveBeenCalled();
  });

  it('publishes what an admin recommends right away, when it has everything', async () => {
    loginAs(admin);

    await expect(
      submitRecommendation('BOOK', {
        ...book,
        description: 'Código limpio',
        categories: 'Programación',
      }),
    ).resolves.toEqual({ success: true, status: 'APPROVED' });

    expect(enforceRateLimit).not.toHaveBeenCalled();
    expect(prismaMock.recommendation.create.mock.calls[0][0].data).toMatchObject({
      status: 'APPROVED',
      submittedById: 'admin-1',
      reviewedById: 'admin-1',
      reviewedAt: expect.any(Date),
      position: 42,
    });
    expect(notifyAdmins).not.toHaveBeenCalled();
  });

  it('tells an admin what is missing to publish it', async () => {
    loginAs(admin);

    await expect(submitRecommendation('BOOK', book)).resolves.toEqual({
      success: false,
      error: 'Para publicarlo falta: descripción, categorías',
    });
    expect(prismaMock.recommendation.create).not.toHaveBeenCalled();
  });
});
