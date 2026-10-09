import { existsSync } from 'node:fs';
import path from 'node:path';
import prisma from '@/lib/prisma';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';
import {
  getArticles,
  getBooks,
  getCourseById,
  getCourses,
  getExternalTalks,
  getVideos,
} from '@/lib/recommendations';
import { EMPTY_RECOMMENDATION_FORM, missingToPublish } from '@/schemas/recommendation-schema';
import { submitRecommendation } from './submit-recommendation';
import {
  approveRecommendation,
  rejectRecommendation,
  updateRecommendation,
} from './review-recommendations';
import { getMyRecommendations } from './get-my-recommendations';

// Recomendaciones contra Postgres real: lo que cargó la migración de datos y el circuito de un
// miembro que recomienda, un admin que lo revisa y la lista pública.

jest.mock('@/lib/youtube-metadata', () => ({
  fetchYoutubeMetadata: jest.fn(async () => ({
    channel: 'Canal de prueba',
    durationSeconds: 754,
    publishedAt: new Date('2026-10-01T00:00:00.000Z'),
  })),
}));

// A YouTube id nobody listed: 11 characters.
const newVideoId = () => `t${uid()}${uid()}`.slice(0, 11);

describe('the lists the data migration loaded', () => {
  it('has every kind, approved, without a submitter and complete enough to list', async () => {
    const counts = await prisma.recommendation.groupBy({
      by: ['kind'],
      where: { status: 'APPROVED', submittedById: null },
      _count: { _all: true },
    });
    const byKind = Object.fromEntries(counts.map((row) => [row.kind, row._count._all]));
    expect(byKind.VIDEO).toBeGreaterThanOrEqual(69);
    expect(byKind.ARTICLE).toBeGreaterThanOrEqual(121);
    expect(byKind.BOOK).toBeGreaterThanOrEqual(80);
    expect(byKind.COURSE).toBeGreaterThanOrEqual(13);

    const legacy = await prisma.recommendation.findMany({
      where: { id: { startsWith: 'legacy_' } },
    });
    for (const item of legacy)
      expect([item.slug, missingToPublish(item.kind, item)]).toEqual([item.slug, []]);
  });

  it('keeps the ids other tables and URLs point to', async () => {
    expect((await getCourseById('git-and-github'))?.name).toBe('Git & GitHub');
    const articles = await getArticles();
    expect(articles.find((article) => article.id === '1')?.title).toBe('Loop Engineering');
    const talks = await getExternalTalks();
    expect(talks.find((video) => video.id === 'HqB3t7046QE')).toMatchObject({
      title: "AI Won't Replace Craftsmanship",
      channel: 'Manfred',
      date: '2026-10-06',
      isTalk: true,
    });
  });

  it('lists videos and articles newest first and books by title', async () => {
    const videos = await getVideos();
    const articles = await getArticles();
    const books = await getBooks();
    expect(videos.map((video) => video.date)).toEqual(
      [...videos.map((video) => video.date)].sort().reverse(),
    );
    expect(articles.map((article) => article.date)).toEqual(
      [...articles.map((article) => article.date)].sort().reverse(),
    );
    expect(books.map((book) => book.title)).toEqual(
      [...books.map((book) => book.title)].sort((a, b) => a.localeCompare(b)),
    );
    const { communityCourses, externalCourses } = await getCourses();
    expect(communityCourses.every((course) => course.isMadeByCommunity)).toBe(true);
    expect(externalCourses.length).toBeGreaterThan(0);
  });

  it('only points to images that exist in /public', async () => {
    const local = await prisma.recommendation.findMany({
      where: { imageUrl: { startsWith: '/' } },
      select: { imageUrl: true },
    });
    expect(local.length).toBeGreaterThan(0);
    for (const { imageUrl } of local) {
      expect([imageUrl, existsSync(path.join(process.cwd(), 'public', imageUrl!))]).toEqual([
        imageUrl,
        true,
      ]);
    }
  });
});

describe('recommending and reviewing', () => {
  it('keeps a member’s video out of the list until an admin approves it', async () => {
    const [member, admin] = await Promise.all([quickUser(), quickUser({ role: 'ADMIN' })]);
    const youtubeId = newVideoId();
    await actAs(member.id);

    await expect(
      submitRecommendation('VIDEO', {
        ...EMPTY_RECOMMENDATION_FORM,
        url: `https://youtu.be/${youtubeId}`,
        title: 'Una charla nueva',
        isTalk: true,
        note: 'vale la pena',
      }),
    ).resolves.toEqual({ success: true, status: 'PENDING' });
    expect(expiredModel('Recommendation')).toBe(true);

    const saved = await prisma.recommendation.findUniqueOrThrow({
      where: { kind_slug: { kind: 'VIDEO', slug: youtubeId } },
    });
    expect(saved).toMatchObject({
      status: 'PENDING',
      submittedById: member.id,
      source: 'Canal de prueba',
      durationSeconds: 754,
      note: 'vale la pena',
    });
    expect((await getVideos()).some((video) => video.id === youtubeId)).toBe(false);
    expect((await getMyRecommendations('VIDEO')).items).toEqual([
      expect.objectContaining({ id: saved.id, status: 'PENDING' }),
    ]);

    // The admin finds it in their notifications, linking to the queue.
    const notification = await prisma.notification.findFirst({
      where: { userId: admin.id, type: 'recommendation_pending' },
      orderBy: { createdAt: 'desc' },
    });
    expect(notification?.message).toContain('/admin/recomendaciones');
    expect(JSON.parse(notification!.metadata!)).toMatchObject({ recommendationId: saved.id });

    // The same video again is a duplicate.
    await expect(
      submitRecommendation('VIDEO', {
        ...EMPTY_RECOMMENDATION_FORM,
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        title: 'Otra vez',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Alguien ya lo recomendó y está esperando que un admin lo revise.',
    });

    // Members can't review it.
    await expect(approveRecommendation(saved.id)).rejects.toThrow('No autorizado');

    await actAs(admin.id);
    await expect(approveRecommendation(saved.id)).resolves.toEqual({ success: true });
    const talks = await getExternalTalks();
    expect(talks.find((video) => video.id === youtubeId)).toMatchObject({
      title: 'Una charla nueva',
      channel: 'Canal de prueba',
      durationSeconds: 754,
      date: '2026-10-01',
    });
    expect(
      await prisma.recommendation.findUnique({
        where: { id: saved.id },
        select: { reviewedById: true },
      }),
    ).toEqual({ reviewedById: admin.id });

    await actAs(member.id);
    expect((await getMyRecommendations('VIDEO')).items).toEqual([]);
  });

  it('lets an admin complete a book before publishing it, or reject it', async () => {
    const [member, admin] = await Promise.all([quickUser(), quickUser({ role: 'ADMIN' })]);
    const title = `Libro ${uid()}`;
    await actAs(member.id);
    await submitRecommendation('BOOK', {
      ...EMPTY_RECOMMENDATION_FORM,
      title,
      author: 'Ana',
      isbn: '978-0-13-235088-4',
    });
    const book = await prisma.recommendation.findFirstOrThrow({ where: { kind: 'BOOK', title } });
    expect(book.slug).toMatch(/^libro-/);

    await actAs(admin.id);
    await expect(approveRecommendation(book.id)).resolves.toEqual({
      success: false,
      error: 'Para publicarla falta: descripción, categorías',
    });
    await expect(
      updateRecommendation(book.id, {
        ...EMPTY_RECOMMENDATION_FORM,
        title,
        author: 'Ana',
        description: 'Un libro',
        categories: 'Programación',
        imageUrl: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
      }),
    ).resolves.toEqual({ success: true });
    await expect(approveRecommendation(book.id)).resolves.toEqual({ success: true });
    expect((await getBooks()).find((item) => item.title === title)).toMatchObject({
      cover: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
      categories: ['Programación'],
    });

    // Taking it down keeps it as rejected, out of the list and of new submissions.
    await expect(rejectRecommendation(book.id)).resolves.toEqual({ success: true });
    expect((await getBooks()).some((item) => item.title === title)).toBe(false);
    await actAs(member.id);
    await expect(
      submitRecommendation('BOOK', { ...EMPTY_RECOMMENDATION_FORM, title, author: 'Ana' }),
    ).resolves.toEqual({ success: false, error: 'Ya lo revisamos y decidimos no sumarlo.' });
    expect((await getMyRecommendations('BOOK')).items).toEqual([
      expect.objectContaining({ id: book.id, status: 'REJECTED' }),
    ]);
  });

  it('publishes what an admin recommends right away', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const name = `Curso ${uid()}`;
    await actAs(admin.id);

    await expect(
      submitRecommendation('COURSE', {
        ...EMPTY_RECOMMENDATION_FORM,
        url: `https://cursos.dev/${uid()}`,
        title: name,
        author: 'Vercel',
        description: 'Un curso',
      }),
    ).resolves.toEqual({ success: true, status: 'APPROVED' });
    expect((await getCourses()).externalCourses.some((course) => course.name === name)).toBe(true);
  });

  it('asks anonymous visitors to sign in', async () => {
    await actAs();
    await expect(submitRecommendation('VIDEO', EMPTY_RECOMMENDATION_FORM)).resolves.toEqual({
      success: false,
      error: 'Iniciá sesión para recomendar',
    });
    expect(await getMyRecommendations('VIDEO')).toEqual({
      isAuthenticated: false,
      isAdmin: false,
      items: [],
    });
  });
});
