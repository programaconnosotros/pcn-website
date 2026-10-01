import { agenticQuestions } from './agentic';
import { aiQuestions } from './ai';
import { dotnetQuestions } from './dotnet';
import { javaQuestions } from './java';
import { nodeQuestions } from './node';
import { pythonQuestions } from './python';
import { frontendQuestions } from './frontend';
import type { InterviewQuestion, InterviewTrack, Seniority } from './types';

export * from './types';

export const interviewQuestions: Record<InterviewTrack, Record<Seniority, InterviewQuestion[]>> = {
  frontend: frontendQuestions,
  node: nodeQuestions,
  python: pythonQuestions,
  java: javaQuestions,
  dotnet: dotnetQuestions,
  ai: aiQuestions,
  agentic: agenticQuestions,
};
