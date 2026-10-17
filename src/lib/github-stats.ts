import snapshot from '@/data/github-stats.json';

// The website repo's GitHub numbers, as of the last snapshot. The site never calls GitHub while
// rendering: `pnpm github:stats` (scripts/update-github-stats.mjs) refreshes
// src/data/github-stats.json — see the `actualizar-stats-github` skill.

export type ContributorStat = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  commits: number;
  mergedPrs: number;
  /** Lines added across all their commits, or `null` if GitHub never had the stats ready. */
  linesAdded: number | null;
  /** Lines deleted across all their commits, or `null` if GitHub never had the stats ready. */
  linesDeleted: number | null;
  /** Start (ISO) of the first week with one of their commits, or `null` when unknown. */
  firstContributionWeek: string | null;
  /** Their merged PRs, newest first (missing in snapshots taken before it was collected). */
  pulls?: ContributorPull[];
};

export type ContributorPull = { number: number; title: string; mergedAt: string };

export type LanguageShare = { name: string; percent: number };

export type CollaborationStats = {
  /** When the snapshot was taken (ISO). */
  updatedAt: string;
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
  /** Commits per week for the 52 weeks before the snapshot, oldest first. */
  weeklyCommits: number[];
  /** Share of the repo's code per language (by bytes, as GitHub measures it), largest first. */
  languages: LanguageShare[];
  /** Lines currently in the repo: every line ever added minus every line deleted. */
  linesOfCode: number | null;
  topContributors: ContributorStat[];
};

const stats = snapshot as CollaborationStats;

/** Collaboration numbers for the website repo, from the committed snapshot. */
export const getCollaborationStats = async (): Promise<CollaborationStats> => stats;
