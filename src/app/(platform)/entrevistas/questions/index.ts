import { agenticQuestions } from './agentic';
import { backendQuestions } from './backend';
import { frontendQuestions } from './frontend';
import type { InterviewQuestion, InterviewTrack, Seniority } from './types';

export * from './types';

export const interviewQuestions: Record<InterviewTrack, Record<Seniority, InterviewQuestion[]>> = {
  frontend: frontendQuestions,
  backend: backendQuestions,
  agentic: agenticQuestions,
};
