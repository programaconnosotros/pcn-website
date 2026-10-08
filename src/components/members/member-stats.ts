import type { CommunityMember } from '@/actions/users/fetch-community-members';

export type GrowthPoint = {
  /** First day of the month, UTC. */
  month: Date;
  /** Accounts that existed at the end of that month. */
  total: number;
  /** Accounts created that month. */
  joined: number;
};

const monthStart = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

/** Members over time, one point per month from the first account to `now`. */
export function memberGrowth(members: Pick<CommunityMember, 'createdAt'>[], now = new Date()) {
  if (!members.length) return [];
  const joinedByMonth = new Map<number, number>();
  for (const { createdAt } of members) {
    const key = monthStart(new Date(createdAt)).getTime();
    joinedByMonth.set(key, (joinedByMonth.get(key) ?? 0) + 1);
  }

  const first = Math.min(...joinedByMonth.keys());
  const last = monthStart(now).getTime();
  const points: GrowthPoint[] = [];
  let total = 0;
  for (let month = new Date(first); month.getTime() <= last;) {
    const joined = joinedByMonth.get(month.getTime()) ?? 0;
    total += joined;
    points.push({ month, total, joined });
    month = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
  }
  return points;
}

/** The headline numbers of the community, for the page's status panel. */
export function communitySummary(members: CommunityMember[], now = new Date()) {
  const growth = memberGrowth(members, now);
  const thisMonth = growth.at(-1)?.joined ?? 0;
  return {
    total: members.length,
    cofounders: members.filter((m) => m.isCofounder).length,
    ambassadors: members.filter((m) => m.isAmbassador).length,
    speakers: members.filter((m) => m.talks > 0).length,
    organizers: members.filter((m) => m.events > 0).length,
    builders: members.filter((m) => m.projects > 0).length,
    talks: members.reduce((sum, m) => sum + m.talks, 0),
    joinedThisMonth: thisMonth,
    since: growth[0]?.month.getUTCFullYear() ?? now.getUTCFullYear(),
    growth,
  };
}
