import { prismaMock } from '@/test/prisma';
import { revalidatePath } from 'next/cache';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { getSessionUser } from '@/actions/projects/get-session-user';
import { getIdentityMap } from '@/lib/identity-links';
import { hideExtractedConsejo, restoreExtractedConsejo } from './hide-extracted-consejo';

jest.mock('@/actions/projects/get-session-user', () => ({ getSessionUser: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));

const [consejo] = extractedConsejos;
const member = { id: 'u-member', role: 'USER' };

beforeEach(() => {
  jest.mocked(getIdentityMap).mockResolvedValue({
    [consejo.member]: { id: 'u-member', name: consejo.member, image: null },
  } as never);
});

describe('hideExtractedConsejo', () => {
  it('lets the member it is attributed to take it down', async () => {
    jest.mocked(getSessionUser).mockResolvedValue(member as never);

    await hideExtractedConsejo(consejo.id);

    expect(prismaMock.hiddenConsejo.upsert).toHaveBeenCalledWith({
      where: { extractedId: consejo.id },
      create: { extractedId: consejo.id, hiddenById: 'u-member' },
      update: {},
    });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
    expect(revalidatePath).toHaveBeenCalledWith('/perfil/u-member');
  });

  it('lets admins take down anyone’s', async () => {
    jest.mocked(getSessionUser).mockResolvedValue({ id: 'admin', role: 'ADMIN' } as never);
    await hideExtractedConsejo(consejo.id);
    expect(prismaMock.hiddenConsejo.upsert).toHaveBeenCalled();
    expect(getIdentityMap).not.toHaveBeenCalled();
  });

  it('refuses everyone else, anonymous visitors and unknown ids', async () => {
    jest.mocked(getSessionUser).mockResolvedValue({ id: 'u-other', role: 'USER' } as never);
    await expect(hideExtractedConsejo(consejo.id)).rejects.toThrow(/Solo la persona/);

    jest.mocked(getSessionUser).mockResolvedValue(null);
    await expect(hideExtractedConsejo(consejo.id)).rejects.toThrow('Debes estar autenticado');

    await expect(hideExtractedConsejo('auto-inventado')).rejects.toThrow('Consejo no encontrado');
    await expect(hideExtractedConsejo('adv-1')).rejects.toThrow();
    expect(prismaMock.hiddenConsejo.upsert).not.toHaveBeenCalled();
  });
});

describe('restoreExtractedConsejo', () => {
  it('brings it back for its member', async () => {
    jest.mocked(getSessionUser).mockResolvedValue(member as never);
    await restoreExtractedConsejo(consejo.id);
    expect(prismaMock.hiddenConsejo.deleteMany).toHaveBeenCalledWith({
      where: { extractedId: consejo.id },
    });
  });
});
