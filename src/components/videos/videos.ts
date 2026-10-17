import type { Language } from '@/components/ui/language-filter';
import { splitPeople } from '@/lib/people-names';

// The videos themselves live in the database (Recommendation, kind VIDEO): read them with
// `getVideos`, `getExternalTalks` and `getOtherVideos` from `@/lib/recommendations`.

export interface Video {
  /** YouTube video id. */
  id: string;
  title: string;
  /** Who presents it, when it differs from the channel that published it. */
  speaker?: string;
  channel: string;
  /** Publication date on YouTube, ISO YYYY-MM-DD. */
  date: string;
  durationSeconds: number;
  /** Language the video is spoken in. */
  language: Language;
  /** Conference talks, also listed under "externas" on /charlas. */
  isTalk?: boolean;
}

/** The people credited in a video's `speaker`, one name each. */
export const videoSpeakers = (video: Pick<Video, 'speaker'>) => splitPeople(video.speaker);
