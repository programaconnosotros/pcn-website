import { unstable_cache } from 'next/cache';

const REPO = 'programaconnosotros/pcn-website';
const API = `https://api.github.com/repos/${REPO}`;

/** Refresh the numbers at most once an hour: plenty for a public page, and it keeps the
 * unauthenticated GitHub API usage (60 requests/hour per IP) well under the limit. */
const REVALIDATE_SECONDS = 3600;

export type ContributorStat = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  commits: number;
  mergedPrs: number;
  /** Lines added across all their commits, or `null` while GitHub computes the stats. */
  linesAdded: number | null;
  /** Lines deleted across all their commits, or `null` while GitHub computes the stats. */
  linesDeleted: number | null;
  /** Start (ISO) of the first week with one of their commits, or `null` when unknown. */
  firstContributionWeek: string | null;
};

export type LanguageShare = { name: string; percent: number };

export type CollaborationStats = {
  stars: number;
  forks: number;
  commits: number;
  contributors: number;
  mergedPrs: number;
  openPrs: number;
  /** Median hours between opening a PR and merging it. */
  medianHoursToMerge: number | null;
  createdAt: string;
  pushedAt: string;
  /** Commits per week for the last 52 weeks, oldest first. Empty while GitHub computes it. */
  weeklyCommits: number[];
  /** Share of the repo's code per language (by bytes, as GitHub measures it), largest first. */
  languages: LanguageShare[];
  /** Lines currently in the repo: every line ever added minus every line deleted. */
  linesOfCode: number | null;
  topContributors: ContributorStat[];
};

type GitHubRepo = {
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  pushed_at: string;
};

type GitHubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
};

type GitHubPull = {
  state: 'open' | 'closed';
  created_at: string;
  merged_at: string | null;
  user: { login: string } | null;
};

type GitHubContributorActivity = {
  author: { login: string } | null;
  weeks: { w: number; a: number; d: number; c: number }[];
};

/** `[weekTimestamp, additions, deletions]` per week; deletions are negative. */
type GitHubCodeFrequency = [number, number, number][];

const github = async (path: string) => {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(`${API}${path}`, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub ${path} responded ${response.status}`);
  return response;
};

const STATS_ATTEMPTS = 3;
const STATS_RETRY_MS = 1500;

/**
 * A `/stats/*` endpoint. GitHub answers 202 with no body while it computes them, so retry a
 * few times and throw if they are still not ready: `unstable_cache` keeps only successful
 * results, so a 202 is never cached for the hour and the next render asks again.
 */
const githubStats = unstable_cache(
  async <T>(path: string): Promise<T> => {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    for (let attempt = 1; attempt <= STATS_ATTEMPTS; attempt++) {
      const response = await fetch(`${API}${path}`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      if (response.status === 200) return response.json();
      if (response.status !== 202) throw new Error(`GitHub ${path} responded ${response.status}`);
      if (attempt < STATS_ATTEMPTS) await new Promise((r) => setTimeout(r, STATS_RETRY_MS));
    }
    throw new Error(`GitHub ${path} is still computing`);
  },
  ['github-stats'],
  { revalidate: REVALIDATE_SECONDS },
);

const optionalStats = <T>(path: string) => githubStats<T>(path).catch(() => null);

/** Total item count of a paginated endpoint, read from the `rel="last"` page of `per_page=1`. */
const countFromLinkHeader = (response: Response, fallback: number) => {
  const match = response.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  return match ? Number(match[1]) : fallback;
};

const fetchAllPulls = async () => {
  const pulls: GitHubPull[] = [];
  // 10 pages × 100 is far beyond the current PR count; the loop stops at the first short page.
  for (let page = 1; page <= 10; page++) {
    const batch: GitHubPull[] = await (
      await github(`/pulls?state=all&per_page=100&page=${page}`)
    ).json();
    pulls.push(...batch);
    if (batch.length < 100) break;
  }
  return pulls;
};

const median = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** Collaboration numbers for the website repo, or `null` when GitHub can't be reached. */
export const getCollaborationStats = async (): Promise<CollaborationStats | null> => {
  try {
    const [
      repo,
      contributors,
      commitsResponse,
      participation,
      pulls,
      activity,
      languages,
      frequency,
    ] = await Promise.all([
      github('').then((res) => res.json() as Promise<GitHubRepo>),
      github('/contributors?per_page=100').then(
        (res) => res.json() as Promise<GitHubContributor[]>,
      ),
      github('/commits?per_page=1'),
      optionalStats<{ all?: number[] }>('/stats/participation'),
      fetchAllPulls(),
      optionalStats<GitHubContributorActivity[]>('/stats/contributors'),
      github('/languages')
        .then((res) => res.json() as Promise<Record<string, number>>)
        .catch(() => ({}) as Record<string, number>),
      optionalStats<GitHubCodeFrequency>('/stats/code_frequency'),
    ]);

    const humans = contributors.filter((contributor) => contributor.type !== 'Bot');
    const merged = pulls.filter((pull) => pull.merged_at);

    const mergedByAuthor = new Map<string, number>();
    for (const pull of merged) {
      const login = pull.user?.login;
      if (login) mergedByAuthor.set(login, (mergedByAuthor.get(login) ?? 0) + 1);
    }

    const activityByAuthor = new Map<
      string,
      { added: number; deleted: number; firstWeek: string | null }
    >();
    for (const { author, weeks } of activity ?? []) {
      if (!author) continue;
      const first = weeks.find((week) => week.c > 0);
      activityByAuthor.set(author.login, {
        added: weeks.reduce((sum, week) => sum + week.a, 0),
        deleted: weeks.reduce((sum, week) => sum + week.d, 0),
        firstWeek: first ? new Date(first.w * 1000).toISOString() : null,
      });
    }

    const languageBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languageShares = Object.entries(languages)
      .map(([name, bytes]) => ({ name, percent: (bytes / languageBytes) * 100 }))
      .sort((a, b) => b.percent - a.percent);

    // code_frequency covers every commit; the per-author totals are the fallback while it computes.
    const linesOfCode = frequency
      ? frequency.reduce((sum, [, added, deleted]) => sum + added + deleted, 0)
      : activity
        ? [...activityByAuthor.values()].reduce((sum, a) => sum + a.added - a.deleted, 0)
        : null;

    const hoursToMerge = merged.map(
      (pull) => (Date.parse(pull.merged_at!) - Date.parse(pull.created_at)) / 3_600_000,
    );

    const topContributors = humans
      .map((contributor) => ({
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        htmlUrl: contributor.html_url,
        commits: contributor.contributions,
        mergedPrs: mergedByAuthor.get(contributor.login) ?? 0,
        linesAdded: activity ? activityByAuthor.get(contributor.login)?.added ?? 0 : null,
        linesDeleted: activity ? activityByAuthor.get(contributor.login)?.deleted ?? 0 : null,
        firstContributionWeek: activityByAuthor.get(contributor.login)?.firstWeek ?? null,
      }))
      .sort((a, b) => b.mergedPrs - a.mergedPrs || b.commits - a.commits);

    return {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      commits: countFromLinkHeader(commitsResponse, 1),
      contributors: humans.length,
      mergedPrs: merged.length,
      openPrs: pulls.filter((pull) => pull.state === 'open').length,
      medianHoursToMerge: median(hoursToMerge),
      createdAt: repo.created_at,
      pushedAt: repo.pushed_at,
      weeklyCommits: participation?.all ?? [],
      languages: languageBytes > 0 ? languageShares : [],
      linesOfCode,
      topContributors,
    };
  } catch (error) {
    console.error('Failed to load collaboration stats from GitHub', error);
    return null;
  }
};
