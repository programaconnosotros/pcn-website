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
};

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
  weeks: { a: number; d: number; c: number }[];
};

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
    const [repo, contributors, commitsResponse, participation, pulls, activity] = await Promise.all(
      [
        github('').then((res) => res.json() as Promise<GitHubRepo>),
        github('/contributors?per_page=100').then(
          (res) => res.json() as Promise<GitHubContributor[]>,
        ),
        github('/commits?per_page=1'),
        // Returns 202 with an empty body while GitHub computes the stats; treat that as no data.
        github('/stats/participation')
          .then((res) => (res.status === 200 ? res.json() : null))
          .catch(() => null) as Promise<{ all?: number[] } | null>,
        fetchAllPulls(),
        github('/stats/contributors')
          .then((res) => (res.status === 200 ? res.json() : null))
          .catch(() => null) as Promise<GitHubContributorActivity[] | null>,
      ],
    );

    const humans = contributors.filter((contributor) => contributor.type !== 'Bot');
    const merged = pulls.filter((pull) => pull.merged_at);

    const mergedByAuthor = new Map<string, number>();
    for (const pull of merged) {
      const login = pull.user?.login;
      if (login) mergedByAuthor.set(login, (mergedByAuthor.get(login) ?? 0) + 1);
    }

    const linesAddedByAuthor = new Map<string, number>();
    for (const { author, weeks } of activity ?? []) {
      if (author) {
        linesAddedByAuthor.set(
          author.login,
          weeks.reduce((sum, week) => sum + week.a, 0),
        );
      }
    }

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
        linesAdded: activity ? linesAddedByAuthor.get(contributor.login) ?? 0 : null,
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
      topContributors,
    };
  } catch (error) {
    console.error('Failed to load collaboration stats from GitHub', error);
    return null;
  }
};
