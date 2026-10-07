import { prismaMock } from '@/test/prisma';
import { getSpecialists, specialtiesFromTitle } from './specialists';

describe('specialtiesFromTitle', () => {
  it.each([
    ['Sr. Frontend Developer', ['web-frontend']],
    ['Full-Stack Engineer', ['fullstack']],
    ['Tech Lead & Sr. Backend', ['backend', 'tech-lead']],
    ['Ssr. QA Engineer', ['qa']],
    ['Diseñadora UX/UI', ['ui-ux-design']],
    ['Engineering Manager', ['engineering-management']],
    ['Software Architect', ['software-architect']],
  ])('%s → %j', (title, expected) => {
    expect(specialtiesFromTitle(title).sort()).toEqual([...expected].sort());
  });

  it('matches whole words only and ignores empty titles', () => {
    expect(specialtiesFromTitle('Builder de comunidades')).toEqual([]);
    expect(specialtiesFromTitle('Social media manager')).toEqual([]);
    expect(specialtiesFromTitle(null)).toEqual([]);
  });
});

describe('getSpecialists', () => {
  it('lists those who marked a specialty first, then those inferred from their job', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'Ana', image: null, specialties: [], jobTitle: 'Backend Developer' },
      { id: 'u2', name: 'Beto', image: 'b.jpg', specialties: ['backend'], jobTitle: 'Gerente' },
      // Marked specialties win over the job title.
      { id: 'u3', name: 'Caro', image: null, specialties: ['qa'], jobTitle: 'Backend Dev' },
    ] as never);

    const specialists = await getSpecialists();
    expect(specialists.backend).toEqual([
      { id: 'u2', name: 'Beto', image: 'b.jpg', explicit: true },
      { id: 'u1', name: 'Ana', image: null, explicit: false },
    ]);
    expect(specialists.qa.map((s) => s.id)).toEqual(['u3']);
    expect(specialists.devops).toEqual([]);
  });
});
