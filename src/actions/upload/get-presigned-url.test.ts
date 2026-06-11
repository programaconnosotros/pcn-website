import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { getPresignedUrl } from './get-presigned-url';
import { getPresignedUploadUrl } from '@/lib/s3';

jest.mock('@/lib/s3', () => ({
  getPresignedUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: 'https://s3.example.com/presigned',
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

    await expect(
      getPresignedUrl({ fileName: 'img.jpg', contentType: 'image/jpeg' }),
    ).rejects.toThrow('No autorizado');
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-xxx' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(
      getPresignedUrl({ fileName: 'img.jpg', contentType: 'image/jpeg' }),
    ).rejects.toThrow('No autorizado');
  });

  it('throws when a regular user tries to upload to a non-profile folder', async () => {
    mockCookies({ sessionId: regularSession.id });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(
      getPresignedUrl({ fileName: 'img.jpg', contentType: 'image/jpeg', folder: 'events' }),
    ).rejects.toThrow('No tienes permisos para subir archivos');
    expect(getPresignedUploadUrl).not.toHaveBeenCalled();
  });

  it('allows a regular user to upload to the profiles folder', async () => {
    mockCookies({ sessionId: regularSession.id });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    const result = await getPresignedUrl({
      fileName: 'avatar.jpg',
      contentType: 'image/jpeg',
      folder: 'profiles',
    });

    expect(result).toEqual({
      uploadUrl: 'https://s3.example.com/presigned',
      fileUrl: 'https://s3.example.com/file',
    });
    expect(getPresignedUploadUrl).toHaveBeenCalledWith('avatar.jpg', 'image/jpeg', 'profiles');
  });

  it('allows an admin user to upload to any folder', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    const result = await getPresignedUrl({
      fileName: 'banner.png',
      contentType: 'image/png',
      folder: 'events',
    });

    expect(result).toEqual({
      uploadUrl: 'https://s3.example.com/presigned',
      fileUrl: 'https://s3.example.com/file',
    });
    expect(getPresignedUploadUrl).toHaveBeenCalledWith('banner.png', 'image/png', 'events');
  });

  it('throws when the content type is not allowed', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await expect(
      getPresignedUrl({ fileName: 'doc.pdf', contentType: 'application/pdf' }),
    ).rejects.toThrow('Tipo de archivo no permitido');
    expect(getPresignedUploadUrl).not.toHaveBeenCalled();
  });

  it('uses the default folder "events" when no folder is specified', async () => {
    mockCookies({ sessionId: adminSession.id });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await getPresignedUrl({ fileName: 'img.webp', contentType: 'image/webp' });

    expect(getPresignedUploadUrl).toHaveBeenCalledWith('img.webp', 'image/webp', 'events');
  });
});
