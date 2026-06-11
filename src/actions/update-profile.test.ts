import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import type { ProfileFormData } from '@/schemas/profile-schema';
import { updateProfile } from './update-profile';

const validProfileData: ProfileFormData = {
  name: 'Test User',
  email: 'test@example.com',
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
  programmingLanguages: [],
};

const validProfileDataWithLanguages: ProfileFormData = {
  ...validProfileData,
  programmingLanguages: [
    { languageId: 'typescript', color: '#3178c6', logo: 'ts-logo.svg' },
    { languageId: 'python', color: '#3572A5', logo: 'py-logo.svg' },
  ],
};

const baseSession = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('updateProfile', () => {
  it('redirects to / when there is no sessionId cookie', async () => {
    mockCookies(); // no sessionId

    await expect(updateProfile(validProfileData)).rejects.toThrow('NEXT_REDIRECT:/');

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('redirects to / when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(updateProfile(validProfileData)).rejects.toThrow('NEXT_REDIRECT:/');

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('updates the user, deletes old languages, and revalidates the path on success', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.user.update.mockResolvedValue({} as any);
    prismaMock.userLanguage.deleteMany.mockResolvedValue({ count: 0 } as any);

    await updateProfile(validProfileData);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
      }),
    );
    expect(prismaMock.userLanguage.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(prismaMock.userLanguage.createMany).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/perfil');
  });

  it('creates new language entries when programmingLanguages are provided', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.user.update.mockResolvedValue({} as any);
    prismaMock.userLanguage.deleteMany.mockResolvedValue({ count: 0 } as any);
    prismaMock.userLanguage.createMany.mockResolvedValue({ count: 2 } as any);

    await updateProfile(validProfileDataWithLanguages);

    expect(prismaMock.userLanguage.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'user-1', language: 'typescript' }),
          expect.objectContaining({ userId: 'user-1', language: 'python' }),
        ]),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/perfil');
  });
});
