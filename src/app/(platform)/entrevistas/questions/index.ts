import { agenticQuestions } from './agentic';
import { aiQuestions } from './ai';
import { androidQuestions } from './android';
import { cypressQuestions } from './cypress';
import { dotnetQuestions } from './dotnet';
import { figmaQuestions } from './figma';
import { iosQuestions } from './ios';
import { javaQuestions } from './java';
import { k6Questions } from './k6';
import { nodeQuestions } from './node';
import { playwrightQuestions } from './playwright';
import { pythonQuestions } from './python';
import { productEngineeringQuestions } from './product-engineering';
import { projectManagerQuestions } from './project-manager';
import { qaQuestions } from './qa';
import { qaAutomationQuestions } from './qa-automation';
import { reactNativeQuestions } from './react-native';
import { securityQuestions } from './security';
import { uxUiQuestions } from './ux-ui';
import { frontendQuestions } from './frontend';
import {
  TRACK_TOOLS,
  type InterviewQuestion,
  type InterviewTrack,
  type QaTool,
  type Seniority,
  type TrackTool,
} from './types';

export * from './types';

export const interviewQuestions: Record<InterviewTrack, Record<Seniority, InterviewQuestion[]>> = {
  react: frontendQuestions,
  ios: iosQuestions,
  android: androidQuestions,
  'react-native': reactNativeQuestions,
  node: nodeQuestions,
  python: pythonQuestions,
  java: javaQuestions,
  dotnet: dotnetQuestions,
  ai: aiQuestions,
  agentic: agenticQuestions,
  qa: qaQuestions,
  security: securityQuestions,
  'ux-ui': uxUiQuestions,
  'product-engineering': productEngineeringQuestions,
  'project-manager': projectManagerQuestions,
};

// Quality engineering adds general automation questions plus one bank per selected tool.
export const qaToolQuestions: Record<QaTool, Record<Seniority, InterviewQuestion[]>> = {
  cypress: cypressQuestions,
  playwright: playwrightQuestions,
  k6: k6Questions,
};

// Tracks with tools (see TRACK_TOOLS) add one bank per selected tool to their general questions.
export const trackToolQuestions: Record<TrackTool, Record<Seniority, InterviewQuestion[]>> = {
  figma: figmaQuestions,
};

export interface QaOptions {
  automated: boolean;
  tools: QaTool[];
}

export const getInterviewQuestions = (
  track: InterviewTrack,
  seniority: Seniority,
  qa?: QaOptions,
  tools: TrackTool[] = [],
): InterviewQuestion[] => {
  const questions = interviewQuestions[track][seniority];
  if (TRACK_TOOLS[track]) {
    return [...questions, ...tools.flatMap((tool) => trackToolQuestions[tool][seniority])];
  }
  if (track !== 'qa' || !qa?.automated) return questions;
  return [
    ...questions,
    ...qaAutomationQuestions[seniority],
    ...qa.tools.flatMap((tool) => qaToolQuestions[tool][seniority]),
  ];
};

const countAll = (banks: Record<Seniority, InterviewQuestion[]>[]) =>
  banks.flatMap((bySeniority) => Object.values(bySeniority)).flat().length;

export const trackQuestionCount = (track: InterviewTrack) =>
  countAll(
    track === 'qa'
      ? [qaQuestions, qaAutomationQuestions, ...Object.values(qaToolQuestions)]
      : [
          interviewQuestions[track],
          ...(TRACK_TOOLS[track]?.tools.map(({ id }) => trackToolQuestions[id]) ?? []),
        ],
  );
