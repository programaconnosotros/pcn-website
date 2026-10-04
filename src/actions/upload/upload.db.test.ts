import { getImageUploadForm } from '@/lib/s3';
import { getPresignedUrl } from '@/actions/upload/get-presigned-url';
import { getPresignedUrlPublic } from '@/actions/upload/get-presigned-url-public';
import { actAs } from '@/test/db/fixtures';
import { createAdmin, createAmbassador, createUser } from '@/test/db/content-fixtures';
import prisma from '@/lib/prisma';

// Formularios firmados de subida a S3: la sesión sale de la base real, S3 se reemplaza.

jest.mock('@/lib/s3', () => ({
  getImageUploadForm: jest.fn().mockResolvedValue({ url: 'https://s3.test', fields: { key: 'k' } }),
}));

describe('getPresignedUrl', () => {
  it('lets admins upload to any folder', async () => {
    await actAs((await createAdmin()).id);

    await expect(getPresignedUrl({ contentType: 'image/png' })).resolves.toEqual({
      url: 'https://s3.test',
      fields: { key: 'k' },
    });
    expect(getImageUploadForm).toHaveBeenCalledWith('image/png', 'events');
  });

  it('lets members upload only their profile picture or project logos', async () => {
    const user = await createAmbassador();
    await actAs(user.id);

    await getPresignedUrl({ contentType: 'image/webp', folder: 'profiles' });
    await getPresignedUrl({ contentType: 'image/jpeg', folder: 'project-logos' });
    await expect(getPresignedUrl({ contentType: 'image/png' })).rejects.toThrow(
      'No tienes permisos para subir archivos',
    );
    await expect(getPresignedUrl({ contentType: 'image/png', folder: 'gallery' })).rejects.toThrow(
      'No tienes permisos',
    );
    expect((getImageUploadForm as jest.Mock).mock.calls.map(([, folder]) => folder)).toEqual([
      'profiles',
      'project-logos',
    ]);
  });

  it('rejects anonymous visitors, expired sessions and non-image types', async () => {
    await actAs();
    await expect(getPresignedUrl({ contentType: 'image/png', folder: 'profiles' })).rejects.toThrow(
      'No autorizado',
    );

    const user = await createUser();
    await actAs(user.id);
    await expect(
      getPresignedUrl({ contentType: 'application/pdf', folder: 'profiles' }),
    ).rejects.toThrow('Tipo de archivo no permitido');
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await expect(getPresignedUrl({ contentType: 'image/png', folder: 'profiles' })).rejects.toThrow(
      'No autorizado',
    );
    expect(getImageUploadForm).not.toHaveBeenCalled();
  });
});

describe('getPresignedUrlPublic', () => {
  it('always uploads to registration-profiles and only images', async () => {
    await actAs();

    await getPresignedUrlPublic({ contentType: 'image/gif' });
    await expect(getPresignedUrlPublic({ contentType: 'text/html' })).rejects.toThrow(
      'Tipo de archivo no permitido',
    );
    expect(getImageUploadForm).toHaveBeenCalledTimes(1);
    expect(getImageUploadForm).toHaveBeenCalledWith('image/gif', 'registration-profiles');
  });
});
