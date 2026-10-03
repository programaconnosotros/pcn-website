import { TRACKS, type InterviewTrack } from '../../questions/types';
import { agenticGuide } from './agentic';
import { aiGuide } from './ai';
import { androidGuide } from './android';
import { dotnetGuide } from './dotnet';
import { iosGuide } from './ios';
import { javaGuide } from './java';
import { nodeGuide } from './node';
import { productEngineeringGuide } from './product-engineering';
import { projectManagerGuide } from './project-manager';
import { pythonGuide } from './python';
import { qaGuide } from './qa';
import { reactGuide } from './react';
import { reactNativeGuide } from './react-native';
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
  'product-engineering': productEngineeringGuide,
  'project-manager': projectManagerGuide,
};

export const getInterviewGuide = (track: string) =>
  Object.hasOwn(interviewGuides, track) ? interviewGuides[track as InterviewTrack] : undefined;

/** Guides in the same order as the simulator's tracks. */
export const orderedGuides = TRACKS.map((track) => ({
  ...track,
  guide: interviewGuides[track.id],
}));
