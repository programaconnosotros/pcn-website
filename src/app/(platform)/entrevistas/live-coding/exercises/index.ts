import type { InterviewTrack } from '../../questions/types';
import { agenticPractice } from './agentic';
import { aiPractice } from './ai';
import { androidPractice } from './android';
import { dotnetPractice } from './dotnet';
import { iosPractice } from './ios';
import { javaPractice } from './java';
import { nodePractice } from './node';
import { pythonPractice } from './python';
import { qaPractice } from './qa';
import { reactPractice } from './react';
import { reactNativePractice } from './react-native';
import type { TrackPractice } from './types';

export * from './types';

// Product engineering and project management interviews rarely include live coding.
export const livePractices: Partial<Record<InterviewTrack, TrackPractice>> = {
  react: reactPractice,
  ios: iosPractice,
  android: androidPractice,
  'react-native': reactNativePractice,
  node: nodePractice,
  python: pythonPractice,
  java: javaPractice,
  dotnet: dotnetPractice,
  ai: aiPractice,
  agentic: agenticPractice,
  qa: qaPractice,
};

export const getLivePractice = (track: string) =>
  Object.hasOwn(livePractices, track) ? livePractices[track as InterviewTrack] : undefined;
