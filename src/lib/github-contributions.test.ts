import { getGitHubTotalContributions, githubLoginFromUrl } from './github-contributions';

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

const yearsResponse = (years: number[]) =>
  jsonResponse({ data: { user: { contributionsCollection: { contributionYears: years } } } });

const totalsResponse = (totals: Record<number, number>) =>
  jsonResponse({
    data: {
      user: Object.fromEntries(
        Object.entries(totals).map(([year, total]) => [
          `y${year}`,
          { contributionCalendar: { totalContributions: total } },
        ]),
      ),
    },
  });

describe('getGitHubTotalContributions', () => {
  const originalToken = process.env.GITHUB_TOKEN;
  let fetchMock: jest.Mock;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token';
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken;
    errorSpy.mockRestore();
  });

  it('sums the contributions of every year in one batched request', async () => {
    fetchMock
      .mockResolvedValueOnce(yearsResponse([2024, 2023, 2022]))
      .mockResolvedValueOnce(totalsResponse({ 2024: 120, 2023: 30, 2022: 5 }));

    await expect(getGitHubTotalContributions('octocat')).resolves.toBe(155);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.github.com/graphql');
    expect(init.cache).toBe('no-store');
    expect(init.headers.Authorization).toBe('Bearer test-token');
    const { query, variables } = JSON.parse(init.body);
    expect(variables).toEqual({ login: 'octocat' });
    expect(query).toContain('y2024: contributionsCollection(from: "2024-01-01T00:00:00Z"');
    expect(query).toContain('y2022: contributionsCollection');
  });

  it('returns null when the total is 0', async () => {
    fetchMock
      .mockResolvedValueOnce(yearsResponse([2024]))
      .mockResolvedValueOnce(totalsResponse({ 2024: 0 }));

    await expect(getGitHubTotalContributions('octocat')).resolves.toBeNull();
  });

  it('returns null when the user has no contribution years', async () => {
    fetchMock.mockResolvedValueOnce(yearsResponse([]));

    await expect(getGitHubTotalContributions('octocat')).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null and logs on an HTTP error', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Bad credentials' }, 401));

    await expect(getGitHubTotalContributions('octocat')).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns null and logs on GraphQL errors', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { user: null }, errors: [{ message: 'Could not resolve to a User' }] }),
    );

    await expect(getGitHubTotalContributions('ghost-user')).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns null when fetch rejects (e.g. timeout)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('The operation was aborted due to timeout'));

    await expect(getGitHubTotalContributions('octocat')).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns null without calling GitHub when there is no token', async () => {
    delete process.env.GITHUB_TOKEN;

    await expect(getGitHubTotalContributions('octocat')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null without calling GitHub when there is no login', async () => {
    await expect(getGitHubTotalContributions(null)).resolves.toBeNull();
    await expect(getGitHubTotalContributions('')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('githubLoginFromUrl', () => {
  it.each([
    ['https://github.com/octocat', 'octocat'],
    ['https://www.github.com/octo-cat/', 'octo-cat'],
    ['github.com/octocat?tab=repositories', 'octocat'],
    ['http://github.com/octocat/some-repo', 'octocat'],
    ['octocat', 'octocat'],
  ])('extracts the login from %s', (input, login) => {
    expect(githubLoginFromUrl(input)).toBe(login);
  });

  it.each([
    [null],
    [''],
    ['https://gitlab.com/octocat'],
    ['https://github.com/'],
    ['https://github.com/orgs/some-org'],
  ])('returns null for %s', (input) => {
    expect(githubLoginFromUrl(input)).toBeNull();
  });
});
