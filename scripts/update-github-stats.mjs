// Takes a snapshot of the website repo's GitHub numbers into src/data/github-stats.json, which
// /desarrollo, the profiles and /vinculos read. The site never calls GitHub at runtime: run
// this (`pnpm github:stats`, see the `actualizar-stats-github` skill) to refresh them.
//
// Uses GITHUB_TOKEN, or the token of the `gh` CLI, when there is one (60 requests/hour
// without a token is enough for a run, but not for many in a row).
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const REPO = 'programaconnosotros/pcn-website';
const API = `https://api.github.com/repos/${REPO}`;
const OUT = 'src/data/github-stats.json';

// GitHub answers the /stats/* endpoints with 202 while it computes them in the background.
const STATS_ATTEMPTS = 10;
const STATS_RETRY_MS = 3000;

const token = (() => {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
})();

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token && { Authorization: `Bearer ${token}` }),
};

const github = async (path) => {
  const response = await fetch(`${API}${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub ${path} respondió ${response.status}`);
  return response;
};

/** A /stats/* endpoint, or `null` if GitHub is still computing it after every retry. */
const githubStats = async (path) => {
  for (let attempt = 1; attempt <= STATS_ATTEMPTS; attempt++) {
    const response = await github(path);
    if (response.status === 200) return response.json();
    await new Promise((resolve) => setTimeout(resolve, STATS_RETRY_MS));
  }
  console.warn(`! ${path}: GitHub todavía lo está calculando, queda el valor anterior`);
  return null;
};

/** Total item count of a paginated endpoint, read from the `rel="last"` page of `per_page=1`. */
const countFromLinkHeader = (response, fallback) => {
  const match = response.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  return match ? Number(match[1]) : fallback;
};

const fetchAllPulls = async () => {
  const pulls = [];
  for (let page = 1; ; page++) {
    const batch = await (await github(`/pulls?state=all&per_page=100&page=${page}`)).json();
    pulls.push(...batch);
    if (batch.length < 100) return pulls;
  }
};

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
const previousContributor = (login) =>
  previous?.topContributors.find((contributor) => contributor.login === login);

const [repo, contributors, commitsResponse, participation, pulls, activity, languages, frequency] =
  await Promise.all([
    github('').then((res) => res.json()),
    github('/contributors?per_page=100').then((res) => res.json()),
    github('/commits?per_page=1'),
    githubStats('/stats/participation'),
    fetchAllPulls(),
    githubStats('/stats/contributors'),
    github('/languages').then((res) => res.json()),
    githubStats('/stats/code_frequency'),
  ]);

const humans = contributors.filter((contributor) => contributor.type !== 'Bot');
const merged = pulls.filter((pull) => pull.merged_at);

const mergedByAuthor = new Map();
for (const pull of merged) {
  const login = pull.user?.login;
  if (login) mergedByAuthor.set(login, (mergedByAuthor.get(login) ?? 0) + 1);
}

const activityByAuthor = new Map();
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
    : previous?.linesOfCode ?? null;

const topContributors = humans
  .map((contributor) => {
    const stats = activityByAuthor.get(contributor.login);
    const before = previousContributor(contributor.login);
    return {
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      htmlUrl: contributor.html_url,
      commits: contributor.contributions,
      mergedPrs: mergedByAuthor.get(contributor.login) ?? 0,
      linesAdded: activity ? stats?.added ?? 0 : before?.linesAdded ?? null,
      linesDeleted: activity ? stats?.deleted ?? 0 : before?.linesDeleted ?? null,
      firstContributionWeek: activity
        ? stats?.firstWeek ?? null
        : before?.firstContributionWeek ?? null,
    };
  })
  .sort((a, b) => b.mergedPrs - a.mergedPrs || b.commits - a.commits);

const snapshot = {
  updatedAt: new Date().toISOString(),
  stars: repo.stargazers_count,
  forks: repo.forks_count,
  commits: countFromLinkHeader(commitsResponse, 1),
  contributors: humans.length,
  mergedPrs: merged.length,
  openPrs: pulls.filter((pull) => pull.state === 'open').length,
  medianHoursToMerge: median(
    merged.map((pull) => (Date.parse(pull.merged_at) - Date.parse(pull.created_at)) / 3_600_000),
  ),
  createdAt: repo.created_at,
  pushedAt: repo.pushed_at,
  weeklyCommits: participation?.all ?? previous?.weeklyCommits ?? [],
  languages: languageBytes > 0 ? languageShares : previous?.languages ?? [],
  linesOfCode,
  topContributors,
};

writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `${OUT}: ${snapshot.commits} commits, ${snapshot.mergedPrs} PRs mergeadas, ` +
    `${snapshot.contributors} contribuidores, ${snapshot.linesOfCode ?? '?'} líneas`,
);
