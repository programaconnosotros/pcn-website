import { TRACKS, type InterviewTrack } from '../../questions/types';
import { agenticGuide } from './agentic';
import { aiGuide } from './ai';
import { androidGuide } from './android';
import { devopsGuide } from './devops';
import { dotnetGuide } from './dotnet';
import { iosGuide } from './ios';
import { javaGuide } from './java';
import { liveCodingGuide } from './live-coding';
import { nodeGuide } from './node';
import { productEngineeringGuide } from './product-engineering';
import { projectManagerGuide } from './project-manager';
import { pythonGuide } from './python';
import { qaGuide } from './qa';
import { reactGuide } from './react';
import { reactNativeGuide } from './react-native';
import { securityGuide } from './security';
import { uxUiGuide } from './ux-ui';
import { softSkillsGuide } from './soft-skills';
import { techLeadGuide } from './tech-lead';
import { softwareArchitectGuide } from './software-architect';
import { endpointCourses, type RecommendedCourse } from '@/data/recommended-courses';
import type { InterviewGuide } from './types';

export * from './types';

export const interviewGuides: Record<InterviewTrack, InterviewGuide> = {
  react: reactGuide,
  ios: iosGuide,
  android: androidGuide,
  'react-native': reactNativeGuide,
  node: nodeGuide,
  python: pythonGuide,
  java: javaGuide,
  dotnet: dotnetGuide,
  ai: aiGuide,
  agentic: agenticGuide,
  qa: qaGuide,
  security: securityGuide,
  devops: devopsGuide,
  'ux-ui': uxUiGuide,
  'product-engineering': productEngineeringGuide,
  'project-manager': projectManagerGuide,
  'software-architect': softwareArchitectGuide,
  'tech-lead': techLeadGuide,
  'soft-skills': softSkillsGuide,
};

/** Guides that apply to every track, with where to practice what they teach. */
export const crossTrackGuides = [
  {
    id: 'live-coding' as const,
    label: 'Live coding',
    stack: 'método, patrones y práctica',
    guide: liveCodingGuide,
    practice: { href: '/entrevistas/live-coding', label: 'practicar ejercicios' },
  },
];

export interface GuideMeta {
  label: string;
  stack: string;
  guide: InterviewGuide;
  practice: { href: string; label: string };
  courses?: RecommendedCourse[];
}

/** Partner courses each track's guide recommends. */
export const trackCourses: Partial<Record<InterviewTrack, RecommendedCourse[]>> = {
  security: endpointCourses,
};

/** A guide with its label and where to practice it, for a track or a cross-track guide. */
export const getGuideMeta = (id: string): GuideMeta | undefined => {
  const crossTrack = crossTrackGuides.find((guide) => guide.id === id);
  if (crossTrack) return crossTrack;
  const track = TRACKS.find((option) => option.id === id);
  if (!track) return undefined;
  return {
    label: track.label,
    stack: track.stack,
    guide: interviewGuides[track.id],
    practice: { href: `/entrevistas?tipo=${track.id}`, label: 'simular entrevista' },
    courses: trackCourses[track.id],
  };
};

export const allGuideIds = [...TRACKS.map(({ id }) => id), ...crossTrackGuides.map(({ id }) => id)];

/** Guides in the same order as the simulator's tracks. */
export const orderedGuides = TRACKS.map((track) => ({
  ...track,
  guide: interviewGuides[track.id],
}));
