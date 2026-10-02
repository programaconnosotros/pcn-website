import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { getPresignedUrl } from './get-presigned-url';
import { getImageUploadForm } from '@/lib/s3';

jest.mock('@/lib/s3', () => ({
  getImageUploadForm: jest.fn().mockResolvedValue({
    url: 'https://s3.example.com/bucket',
    fields: { key: 'k' },
    fileUrl: 'https://s3.example.com/file',
  }),
}));

const adminUser = {
  id: 'user-admin',
  name: 'Admin',
  email: 'admin@pcn.com',
  password: 'hash',
  emailVerified: true,
  role: 'ADMIN' as const,
  phoneNumber: null,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
const adminSession = {
  id: 'session-admin',
  userId: 'user-admin',
  expires: new Date('2027-01-01'),
  user: adminUser,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

describe('getPresignedUrl', () => {
  it('throws when there is no session cookie', async () => {
    mockCookies();

    await expect(getPresignedUrl({ contentType: 'image/jpeg' })).rejects.toThrow('No autorizado');
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-xxx' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(getPresignedUrl({ contentType: 'image/jpeg' })).rejects.toThrow('No autorizado');
  });

  it('throws when a regular user tries to upload to a non-profile folder', async () => {
    mockCookies({ sessionId: regularSession.id });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(getPresignedUrl({ contentType: 'image/jpeg', folder: 'events' })).rejects.toThrow(
      'No tienes permisos para subir archivos',
    );
    expect(getImageUploadForm).not.toHaveBeenCalled();
  });

  it('allows a regular user to upload to the profiles folder', async () => {
    mockCookies({ sessionId: regularSession.id });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    const result = await getPresignedUrl({
      contentType: 'image/jpeg',
      folder: 'profiles',
    });

    expect(result).toEqual({
      url: 'https://s3.example.com/bucket',
      fields: { key: 'k' },
      fileUrl: 'https://s3.example.com/file',
    });
    expect(getImageUploadForm).toHaveBeenCalledWith('image/jpeg', 'profiles');
  });

  it('allows a regular user to upload a project logo', async () => {
    mockCookies({ sessionId: regularSession.id });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await getPresignedUrl({
      contentType: 'image/png',
      folder: 'project-logos',
    });

    expect(getImageUploadForm).toHaveBeenCalledWith('image/png', 'project-logos');
  });

  it('allows an admin user to upload to any folder', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    const result = await getPresignedUrl({
      contentType: 'image/png',
      folder: 'events',
    });

    expect(result).toEqual({
      url: 'https://s3.example.com/bucket',
      fields: { key: 'k' },
      fileUrl: 'https://s3.example.com/file',
    });
    expect(getImageUploadForm).toHaveBeenCalledWith('image/png', 'events');
  });

  it('throws when the content type is not allowed', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await expect(getPresignedUrl({ contentType: 'application/pdf' })).rejects.toThrow(
      'Tipo de archivo no permitido',
    );
    expect(getImageUploadForm).not.toHaveBeenCalled();
  });

  it('uses the default folder "events" when no folder is specified', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await getPresignedUrl({ contentType: 'image/webp' });

    expect(getImageUploadForm).toHaveBeenCalledWith('image/webp', 'events');
  });
});
