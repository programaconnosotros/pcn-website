import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { deleteObjectsOrLog, getPresignedPost, headObject, putImmutableObject } from '@/lib/s3';
import {
  addProjectPhoto,
  addProjectVideo,
  deleteProjectMedia,
  getProjectImageUploadForm,
  getProjectVideoUploadForm,
} from './project-media';

jest.mock('@/lib/s3', () => ({
  getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('original')),
  putImmutableObject: jest.fn().mockResolvedValue(undefined),
  deleteObjectsOrLog: jest.fn().mockResolvedValue(undefined),
  headObject: jest.fn().mockResolvedValue({ size: 10, contentType: 'video/mp4' }),
  publicFileUrl: (key: string) => `https://cdn.example.com/${key}`,
  getPresignedPost: jest.fn().mockResolvedValue({ url: 'https://s3.example.com', fields: {} }),
}));

jest.mock('@/lib/photo-processing', () => ({
  optimizePhoto: jest.fn().mockResolvedValue({
    full: Buffer.from('full'),
    thumb: Buffer.from('thumb'),
    width: 2560,
    height: 1440,
  }),
  optimizePoster: jest.fn().mockResolvedValue(Buffer.from('poster')),
}));

const author = { id: 'user-1', role: 'REGULAR' as const };
const collaborator = { id: 'user-2', role: 'REGULAR' as const };
const stranger = { id: 'user-3', role: 'REGULAR' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const project = (media = 0) => ({
  id: 'proj-1',
  authorId: author.id,
  members: [{ userId: collaborator.id }],
  _count: { media },
});

const uuid = '3f0c8a2e-5b1d-4c6a-9e2f-1a2b3c4d5e6f';
const originalKey = (userId: string) => `projects/originals/${userId}/${uuid}.jpg`;
const videoKey = `projects/proj-1/${uuid}/video.mp4`;
const metadata = { durationSeconds: 12, width: 1920, height: 1080 };

beforeEach(() => {
  prismaMock.projectMedia.aggregate.mockResolvedValue({ _max: { order: 1 } } as any);
  prismaMock.projectMedia.create.mockResolvedValue({ id: 'm1' } as any);
});

describe('project media uploads', () => {
  it('requires a session', async () => {
    mockCookies({});
    await expect(getProjectImageUploadForm('proj-1', 'image/jpeg')).rejects.toThrow(
      'Debes estar autenticado',
    );
  });

  it('only lets the team upload', async () => {
    loginAs(stranger);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);
    await expect(getProjectImageUploadForm('proj-1', 'image/jpeg')).rejects.toThrow(
      'No tenés permisos',
    );
  });

  it('signs a photo upload into the uploader own folder', async () => {
    loginAs(collaborator);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);

    const { key } = await getProjectImageUploadForm('proj-1', 'image/png');

    expect(key).toMatch(/^projects\/originals\/user-2\/[0-9a-f-]{36}\.png$/);
    expect(getPresignedPost).toHaveBeenCalledWith(key, 'image/png', expect.any(Number));
  });

  it('rejects other file types and projects that are full', async () => {
    loginAs(author);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);
    await expect(getProjectImageUploadForm('proj-1', 'image/svg+xml')).rejects.toThrow(
      'Formato no soportado',
    );
    await expect(getProjectVideoUploadForm('proj-1', 'video/avi', 10)).rejects.toThrow(
      'Formato no soportado',
    );
    await expect(
      getProjectVideoUploadForm('proj-1', 'video/mp4', 10 * 1024 * 1024 * 1024),
    ).rejects.toThrow('pesa más de');

    prismaMock.project.findUnique.mockResolvedValue(project(24) as any);
    await expect(getProjectImageUploadForm('proj-1', 'image/jpeg')).rejects.toThrow('hasta 24');
  });

  it('signs a video upload into the project folder', async () => {
    loginAs(author);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);

    const { key } = await getProjectVideoUploadForm('proj-1', 'video/mp4', 1000);

    expect(key).toMatch(/^projects\/proj-1\/[0-9a-f-]{36}\/video\.mp4$/);
  });
});

describe('addProjectPhoto', () => {
  it('optimizes the photo, stores both sizes and adds it last', async () => {
    loginAs(author);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);

    await addProjectPhoto('proj-1', originalKey(author.id));

    expect(putImmutableObject).toHaveBeenCalledTimes(2);
    expect(deleteObjectsOrLog).toHaveBeenCalledWith([originalKey(author.id)]);
    const { data } = prismaMock.projectMedia.create.mock.calls[0][0];
    expect(data).toMatchObject({ projectId: 'proj-1', kind: 'PHOTO', width: 2560, order: 2 });
    expect(data.src).toMatch(/^https:\/\/cdn\.example\.com\/projects\/proj-1\/.+\/full\.webp$/);
    expect(revalidatePath).toHaveBeenCalledWith('/proyectos/proj-1');
  });

  it("rejects someone else's original", async () => {
    loginAs(author);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);
    await expect(addProjectPhoto('proj-1', originalKey(collaborator.id))).rejects.toThrow(
      'Archivo inválido',
    );
    expect(prismaMock.projectMedia.create).not.toHaveBeenCalled();
  });
});

describe('addProjectVideo', () => {
  it('saves the uploaded video with its poster and metadata', async () => {
    loginAs(author);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);

    await addProjectVideo('proj-1', videoKey, originalKey(author.id), metadata);

    const { data } = prismaMock.projectMedia.create.mock.calls[0][0];
    expect(data).toMatchObject({
      ...metadata,
      kind: 'VIDEO',
      src: `https://cdn.example.com/${videoKey}`,
      thumbSrc: `https://cdn.example.com/projects/proj-1/${uuid}/poster.webp`,
      storageKeys: [videoKey, `projects/proj-1/${uuid}/poster.webp`],
    });
  });

  it("rejects a video from another project's folder or one that never finished uploading", async () => {
    loginAs(author);
    prismaMock.project.findUnique.mockResolvedValue(project() as any);
    await expect(
      addProjectVideo(
        'proj-1',
        `projects/proj-2/${uuid}/video.mp4`,
        originalKey(author.id),
        metadata,
      ),
    ).rejects.toThrow('Archivo inválido');

    jest.mocked(headObject).mockResolvedValueOnce(null);
    await expect(
      addProjectVideo('proj-1', videoKey, originalKey(author.id), metadata),
    ).rejects.toThrow('no se terminó de subir');
    expect(prismaMock.projectMedia.create).not.toHaveBeenCalled();
  });
});

describe('deleteProjectMedia', () => {
  const media = {
    id: 'm1',
    storageKeys: ['projects/proj-1/x/full.webp', 'projects/proj-1/x/thumb.webp'],
    project: { id: 'proj-1', authorId: author.id, members: [{ userId: collaborator.id }] },
  };

  it('lets the team remove a file and deletes it from S3', async () => {
    loginAs(collaborator);
    prismaMock.projectMedia.findUnique.mockResolvedValue(media as any);

    await deleteProjectMedia('m1');

    expect(prismaMock.projectMedia.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
    expect(deleteObjectsOrLog).toHaveBeenCalledWith(media.storageKeys);
  });

  it('rejects anyone outside the team', async () => {
    loginAs(stranger);
    prismaMock.projectMedia.findUnique.mockResolvedValue(media as any);
    await expect(deleteProjectMedia('m1')).rejects.toThrow('No tenés permisos');
    expect(prismaMock.projectMedia.delete).not.toHaveBeenCalled();
  });
});
