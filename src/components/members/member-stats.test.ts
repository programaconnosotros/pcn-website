import type { CommunityMember } from '@/actions/users/fetch-community-members';
import { communitySummary, memberGrowth } from './member-stats';

const member = (createdAt: string, overrides: Partial<CommunityMember> = {}) =>
  ({
    id: createdAt,
    name: 'M',
    isCofounder: false,
    isAmbassador: false,
    talks: 0,
    events: 0,
    projects: 0,
    createdAt: new Date(createdAt),
    ...overrides,
  }) as CommunityMember;

const NOW = new Date('2026-04-15T12:00:00Z');

describe('memberGrowth', () => {
  it('counts members at the end of each month, including months nobody joined', () => {
    const points = memberGrowth(
      [member('2026-01-03'), member('2026-01-20'), member('2026-03-02')],
      NOW,
    );
    expect(
      points.map(({ month, total, joined }) => [month.toISOString().slice(0, 7), total, joined]),
    ).toEqual([
      ['2026-01', 2, 2],
      ['2026-02', 2, 0],
      ['2026-03', 3, 1],
      ['2026-04', 3, 0],
    ]);
  });

  it('is empty without members', () => {
    expect(memberGrowth([], NOW)).toEqual([]);
  });
});

describe('communitySummary', () => {
  it('adds up the roles, the talks and who joined this month', () => {
    const summary = communitySummary(
      [
        member('2025-06-01', { isCofounder: true, isAmbassador: true, talks: 2, projects: 1 }),
        member('2026-04-02', { talks: 1, events: 3 }),
        member('2026-04-10'),
      ],
      NOW,
    );
    expect(summary).toMatchObject({
      total: 3,
      cofounders: 1,
      ambassadors: 1,
      speakers: 2,
      organizers: 1,
      builders: 1,
      talks: 3,
      joinedThisMonth: 2,
      since: 2025,
    });
  });
});
