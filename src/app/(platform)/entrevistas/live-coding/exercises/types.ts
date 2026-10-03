import type { InterviewTrack, Seniority } from '../../questions/types';

/** A live coding statement to solve on your own; the site never runs or grades solutions. */
export interface CodingExercise {
  /** Kebab-case slug, unique within the track; solved marks are stored under `<track>/<id>`. */
  id: string;
  title: string;
  /** Rough time an interviewer would give, e.g. `30 min`. */
  duration: string;
  /** The statement as the interviewer would present it; paragraphs, backticks mark code. */
  statement: string[];
  /** Concrete requirements the solution must meet. */
  requirements: string[];
  /** Questions or extensions interviewers usually ask once the base works. */
  followUps: string[];
  /** What the interviewer is really evaluating with this exercise. */
  evaluates: string;
}

export type LeetCodeDifficulty = 'Easy' | 'Medium' | 'Hard';

/** A LeetCode problem worth practicing; linked as `https://leetcode.com/problems/<slug>/`. */
export interface LeetCodeProblem {
  slug: string;
  title: string;
  difficulty: LeetCodeDifficulty;
  /** Why it's useful for this track and seniority (pattern, typical question…). */
  why: string;
}

export interface TrackPractice {
  track: InterviewTrack;
  exercises: Record<Seniority, CodingExercise[]>;
  leetcode: Record<Seniority, LeetCodeProblem[]>;
}

export const leetCodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;

/** The id an exercise's solved mark is stored under. */
export const exerciseKey = (track: InterviewTrack, exerciseId: string) => `${track}/${exerciseId}`;
