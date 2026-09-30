import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { getContentMarks } from './get-content-marks';
import { setContentMark } from './set-content-mark';

const session = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const key = { userId: 'user-1', contentType: 'article', contentId: '7', mark: 'read' };

describe('getContentMarks', () => {
  it('returns no marks for anonymous visitors', async () => {
    mockCookies();

    await expect(getContentMarks('article')).resolves.toEqual({
      isAuthenticated: false,
      marks: [],
    });
    expect(prismaMock.contentMark.findMany).not.toHaveBeenCalled();
  });

  it("returns the user's marks for that content type", async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session as any);
    prismaMock.contentMark.findMany.mockResolvedValue([{ contentId: '7', mark: 'read' }] as any);

    await expect(getContentMarks('article')).resolves.toEqual({
      isAuthenticated: true,
      marks: [{ contentId: '7', mark: 'read' }],
    });
    expect(prismaMock.contentMark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', contentType: 'article' } }),
    );
  });

  it('rejects unknown content types', async () => {
    await expect(getContentMarks('podcast' as any)).rejects.toThrow('Tipo de contenido inválido');
  });
});

describe('setContentMark', () => {
  it('throws when the user is not logged in', async () => {
    mockCookies();

    await expect(setContentMark('article', '7', 'read', true)).rejects.toThrow(
      'Debes estar autenticado',
    );
    expect(prismaMock.contentMark.upsert).not.toHaveBeenCalled();
  });

  it('rejects marks that do not apply to the content type', async () => {
    mockCookies({ sessionId: 'session-1' });

    await expect(setContentMark('article', '7', 'liked', true)).rejects.toThrow('Marca inválida');
    expect(prismaMock.contentMark.upsert).not.toHaveBeenCalled();
  });

  it('creates the mark when turning it on', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session as any);

    await expect(setContentMark('article', '7', 'read', true)).resolves.toEqual({
      success: true,
    });
    expect(prismaMock.contentMark.upsert).toHaveBeenCalledWith({
      where: { userId_contentType_contentId_mark: key },
      create: key,
      update: {},
    });
  });

  it('saves articles to the reading list', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session as any);

    await setContentMark('article', '7', 'saved', true);

    const saved = { ...key, mark: 'saved' };
    expect(prismaMock.contentMark.upsert).toHaveBeenCalledWith({
      where: { userId_contentType_contentId_mark: saved },
      create: saved,
      update: {},
    });
  });

  it('removes the mark when turning it off', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session as any);

    await setContentMark('article', '7', 'read', false);

    expect(prismaMock.contentMark.deleteMany).toHaveBeenCalledWith({ where: key });
    expect(prismaMock.contentMark.upsert).not.toHaveBeenCalled();
  });
});
