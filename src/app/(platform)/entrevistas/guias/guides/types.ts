import type { InterviewTrack } from '../../questions/types';

export interface GuideSection {
  /** Kebab-case slug, unique within the guide; read progress is stored under `<track>/<id>`. */
  id: string;
  title: string;
  /** Paragraphs; backticks mark inline code. */
  body: string[];
  /** What you should be able to explain out loud before the interview. */
  checklist: string[];
}

export interface InterviewGuide {
  track: InterviewTrack;
  /** One sentence shown in the guide list. */
  summary: string;
  sections: GuideSection[];
}

/** The id a section's read mark is stored under. */
export const guideSectionKey = (track: InterviewTrack, sectionId: string) =>
  `${track}/${sectionId}`;
