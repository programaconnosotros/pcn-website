import type { CommunityMember } from '@/actions/users/fetch-community-members';
import { memberRoles, memberSearchText, toDirectoryMembers } from './directory-members';

const member = (overrides: Partial<CommunityMember> = {}): CommunityMember => ({
  id: 'm',
  name: 'Agustín Sánchez',
  image: 'https://cdn/a.jpg',
  jobTitle: 'QA',
  enterprise: 'Acme',
  positions: [],
  slogan: 'Programá',
  career: 'Sistemas',
  studyPlace: 'UTN',
  isCofounder: true,
  isAmbassador: false,
  createdAt: new Date('2024-01-01'),
  talks: 1,
  events: 2,
  projects: 3,
  ...overrides,
});

describe('memberRoles', () => {
  it('lists the current positions, or the old single job without them', () => {
    expect(
      memberRoles(
        member({
          positions: [
            { jobTitle: 'CTO', enterprise: 'PCN' },
            { jobTitle: '', enterprise: 'Solo empresa' },
            { jobTitle: '', enterprise: null },
          ],
        }),
      ),
    ).toEqual(['CTO @ PCN', 'Solo empresa']);
    expect(memberRoles(member())).toEqual(['QA @ Acme']);
    expect(memberRoles(member({ jobTitle: null, enterprise: null }))).toEqual([]);
  });
});

describe('toDirectoryMembers', () => {
  it('keeps only what the directory shows, with the roles joined', () => {
    const [slim] = toDirectoryMembers(
      [
        member({
          positions: [
            { jobTitle: 'CTO', enterprise: 'PCN' },
            { jobTitle: 'Dev', enterprise: null },
          ],
        }),
      ],
      (src) => src === 'https://cdn/a.jpg',
    );
    expect(slim).toEqual({
      id: 'm',
      name: 'Agustín Sánchez',
      image: 'https://cdn/a.jpg',
      optimizeImage: true,
      role: 'CTO @ PCN · Dev',
      slogan: 'Programá',
      career: 'Sistemas',
      studyPlace: 'UTN',
      isCofounder: true,
      isAmbassador: false,
      createdAt: new Date('2024-01-01'),
      talks: 1,
      events: 2,
      projects: 3,
    });
    expect(slim).not.toHaveProperty('positions');
  });

  it("doesn't optimize photos unless told it can", () => {
    expect(toDirectoryMembers([member()])[0].optimizeImage).toBe(false);
  });
});

describe('memberSearchText', () => {
  it('normalizes name, slogan, studies and roles once, without accents or case', () => {
    const [slim] = toDirectoryMembers([member()]);
    const text = memberSearchText(slim);
    for (const token of ['agustin', 'sanchez', 'programa', 'sistemas', 'utn', 'qa @ acme']) {
      expect(text).toContain(token);
    }
  });
});
