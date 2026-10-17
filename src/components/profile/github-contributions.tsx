import { getGitHubTotalContributions, githubLoginFromUrl } from '@/lib/github-contributions';
import { Github } from '@/components/icons/brand-icons';

const numberFormat = new Intl.NumberFormat('es-AR');

/**
 * Total GitHub contributions of a member, across all their years, fetched live on every visit.
 * Meant to be wrapped in <Suspense> so the profile never waits on GitHub; renders nothing when the
 * member has no GitHub linked, has no contributions or the API fails.
 */
export const GitHubContributions = async ({ gitHubUrl }: { gitHubUrl: string | null }) => {
  const login = githubLoginFromUrl(gitHubUrl);
  const total = await getGitHubTotalContributions(login);
  if (!login || !total) return null;

  return (
    <a
      href={`https://github.com/${login}`}
      target="_blank"
      rel="noopener noreferrer"
      title={`${login} en GitHub`}
      className="flex group items-center justify-between gap-3 px-4 py-2.5 font-mono text-xs transition-colors hover:bg-pcnGreen/[0.04]"
    >
      <span className="flex items-center gap-2 text-muted-foreground">
        <Github className="size-3.5 shrink-0 text-pcnGreen-600 group-hover:text-pcnGreen" />
        contribuciones en github
      </span>
      <span className="font-semibold text-pcnGreen tabular-nums">{numberFormat.format(total)}</span>
    </a>
  );
};
