import { prismaMock } from '@/test/prisma';
import { isExistingPage } from './page-visit-targets';

describe('isExistingPage', () => {
  it('accepts fixed pages without touching the database', async () => {
    await expect(isExistingPage('/eventos')).resolves.toBe(true);
    expect(prismaMock.event.findUnique).not.toHaveBeenCalled();
  });

  it('rejects paths that are not a page of the site', async () => {
    await expect(isExistingPage('/eventos/abc/inventado')).resolves.toBe(false);
  });

  it('accepts a profile only when the user exists', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'cuser1' } as any);
    await expect(isExistingPage('/perfil/cuser1')).resolves.toBe(true);

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(isExistingPage('/perfil/estafa-reclama-tu-premio')).resolves.toBe(false);
  });

  it('accepts a guide that exists in the code and rejects a made-up one', async () => {
    await expect(isExistingPage('/entrevistas/guias/estafa')).resolves.toBe(false);
  });

  it('rejects segments that are not valid URL encoding', async () => {
    await expect(isExistingPage('/perfil/%E0%A4%A')).resolves.toBe(false);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
