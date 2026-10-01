import { agenticQuestions } from './agentic';
import { aiQuestions } from './ai';
import { cypressQuestions } from './cypress';
import { dotnetQuestions } from './dotnet';
import { javaQuestions } from './java';
import { k6Questions } from './k6';
import { nodeQuestions } from './node';
import { playwrightQuestions } from './playwright';
import { pythonQuestions } from './python';
import { qaQuestions } from './qa';
import { qaAutomationQuestions } from './qa-automation';
import { frontendQuestions } from './frontend';
import type { InterviewQuestion, InterviewTrack, QaTool, Seniority } from './types';

export * from './types';

export const interviewQuestions: Record<InterviewTrack, Record<Seniority, InterviewQuestion[]>> = {
  frontend: frontendQuestions,
  node: nodeQuestions,
  python: pythonQuestions,
  java: javaQuestions,
  dotnet: dotnetQuestions,
  ai: aiQuestions,
  agentic: agenticQuestions,
  qa: qaQuestions,
};

// Quality engineering adds general automation questions plus one bank per selected tool.
export const qaToolQuestions: Record<QaTool, Record<Seniority, InterviewQuestion[]>> = {
  cypress: cypressQuestions,
  playwright: playwrightQuestions,
  k6: k6Questions,
};

export interface QaOptions {
  automated: boolean;
  tools: QaTool[];
}

export const getInterviewQuestions = (
  track: InterviewTrack,
  seniority: Seniority,
  qa?: QaOptions,
): InterviewQuestion[] => {
  const questions = interviewQuestions[track][seniority];
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
      : [interviewQuestions[track]],
  );
