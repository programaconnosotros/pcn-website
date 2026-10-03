import type { InterviewTrack } from '../../questions/types';

/** Interview tracks plus the guides that apply to every track, like live coding. */
export type GuideId = InterviewTrack | 'live-coding';

export interface ChecklistItem {
  /** What you should be able to do or explain, e.g. "Comparar CSR, SSR, SSG e ISR". */
  text: string;
  /** The explanation itself, so the guide is enough to study it; backticks mark inline code. */
  explanation: string;
}

export interface GuideSection {
  /** Kebab-case slug, unique within the guide; read progress is stored under `<guide>/<id>`. */
  id: string;
  title: string;
  /** Paragraphs; backticks mark inline code. */
  body: string[];
  /** What you should be able to explain out loud before the interview, explained. */
  checklist: ChecklistItem[];
}

export interface InterviewGuide {
  track: GuideId;
  /** One sentence shown in the guide list. */
  summary: string;
  sections: GuideSection[];
}

/** The id a section's read mark is stored under. */
export const guideSectionKey = (guide: GuideId, sectionId: string) => `${guide}/${sectionId}`;
