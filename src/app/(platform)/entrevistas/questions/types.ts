export type InterviewTrack = 'frontend' | 'backend' | 'agentic';
export type Seniority = 'junior' | 'semi-senior' | 'senior';

export interface InterviewQuestion {
  question: string;
  answer: string;
  topic: string;
}

export const TRACKS: { id: InterviewTrack; label: string; stack: string }[] = [
  { id: 'frontend', label: 'Frontend', stack: 'React.js' },
  { id: 'backend', label: 'Backend', stack: 'Node.js' },
  { id: 'agentic', label: 'Agentic engineering', stack: 'LLMs y agentes' },
];

export const SENIORITIES: { id: Seniority; label: string }[] = [
  { id: 'junior', label: 'Junior' },
  { id: 'semi-senior', label: 'Semi-senior' },
  { id: 'senior', label: 'Senior' },
];
