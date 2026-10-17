// Live total of a user's GitHub contributions across every year they were active. Unlike the
// committed snapshot in src/data/github-stats.json, this hits the GitHub GraphQL API on every call
// (no caching), so a profile always shows the current number.

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const TIMEOUT_MS = 5000;

// GitHub logins: alphanumerics and single hyphens, up to 39 characters.
const LOGIN_PATTERN = /^[a-z\d](?:[a-z\d-]{0,38})$/i;

// Top-level github.com paths that aren't user profiles.
const RESERVED_PATHS = new Set([
  'orgs',
  'settings',
  'login',
  'join',
  'about',
  'features',
  'pricing',
  'explore',
  'topics',
  'marketplace',
  'sponsors',
]);

/** Extracts the login from a profile URL such as `https://github.com/octocat` (or a bare login). */
export const githubLoginFromUrl = (value: string | null | undefined): string | null => {
  const raw = value?.trim();
  if (!raw) return null;

  if (LOGIN_PATTERN.test(raw)) return raw;

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') return null;

    const login = url.pathname.split('/').filter(Boolean)[0];
    if (!login || RESERVED_PATHS.has(login.toLowerCase()) || !LOGIN_PATTERN.test(login)) {
      return null;
    }
    return login;
  } catch {
    return null;
  }
};

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

const githubGraphQL = async <T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'programaconnosotros-website',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL responded ${response.status}`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${body.errors.map((e) => e.message).join('; ')}`);
  }
  if (!body.data) {
    throw new Error('GitHub GraphQL returned no data');
  }
  return body.data;
};

/**
 * Total contributions of `login` summed over all of its contribution years, or `null` when there
 * is nothing to show: no login, no GITHUB_TOKEN (GraphQL requires one), a total of 0, or any API
 * error (logged, never thrown, so a GitHub hiccup can't break the profile page).
 */
export const getGitHubTotalContributions = async (
  login: string | null | undefined,
): Promise<number | null> => {
  const token = process.env.GITHUB_TOKEN;
  if (!login || !token) return null;

  try {
    const yearsData = await githubGraphQL<{
      user: { contributionsCollection: { contributionYears: number[] } } | null;
    }>(
      token,
      'query($login: String!) { user(login: $login) { contributionsCollection { contributionYears } } }',
      { login },
    );

    const years = yearsData.user?.contributionsCollection.contributionYears ?? [];
    if (years.length === 0) return null;

    // contributionsCollection spans at most one year, so ask for each one under its own alias,
    // all in a single request.
    const fields = years
      .map(
        (year) =>
          `y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") { contributionCalendar { totalContributions } }`,
      )
      .join('\n');

    const totalsData = await githubGraphQL<{
      user: Record<string, { contributionCalendar: { totalContributions: number } }> | null;
    }>(token, `query($login: String!) { user(login: $login) { ${fields} } }`, { login });

    if (!totalsData.user) return null;

    const total = Object.values(totalsData.user).reduce(
      (sum, collection) => sum + (collection?.contributionCalendar?.totalContributions ?? 0),
      0,
    );
    return total > 0 ? total : null;
  } catch (error) {
    console.error(`Error fetching GitHub contributions for ${login}:`, error);
    return null;
  }
};
