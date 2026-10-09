import { prismaMock } from '@/test/prisma';
import { fetchCommunityMembers } from './fetch-community-members';

const row = (overrides = {}) => ({
  id: 'user-1',
  name: 'Ada',
  image: null,
  jobTitle: null,
  enterprise: null,
  positions: [],
  slogan: null,
  isCofounder: false,
  isAmbassador: false,
  createdAt: new Date('2025-01-01'),
  authoredProjects: [],
  projectMemberships: [],
  _count: { speakerTalks: 0, organizedEvents: 0 },
  ...overrides,
});

describe('fetchCommunityMembers', () => {
  it('never selects contact data', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    await fetchCommunityMembers();

    const { select } = prismaMock.user.findMany.mock.calls[0][0] as { select: object };
    expect(select).not.toHaveProperty('email');
    expect(select).not.toHaveProperty('phoneNumber');
    expect(select).not.toHaveProperty('password');
  });

  it('leaves suspended accounts out of the directory', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    await fetchCommunityMembers();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { suspendedAt: null } }),
    );
  });

  it('flattens the talk and event counts', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      row({ _count: { speakerTalks: 3, organizedEvents: 2 } }),
    ] as any);

    const [member] = await fetchCommunityMembers();
    expect(member).toMatchObject({ talks: 3, events: 2, projects: 0 });
    expect(member).not.toHaveProperty('_count');
  });

  it('counts a project once when the person is both author and member', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      row({
        authoredProjects: [{ id: 'p1' }, { id: 'p2' }],
        projectMemberships: [{ projectId: 'p1' }, { projectId: 'p3' }],
      }),
    ] as any);

    const [member] = await fetchCommunityMembers();
    expect(member.projects).toBe(3);
  });
});
