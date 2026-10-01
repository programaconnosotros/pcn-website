export type InterviewTrack = 'frontend' | 'backend' | 'ai' | 'agentic';
export type Seniority = 'junior' | 'semi-senior' | 'senior';

export interface InterviewQuestion {
  question: string;
  answer: string;
  topic: string;
}

export const TRACKS: { id: InterviewTrack; label: string; stack: string }[] = [
  { id: 'frontend', label: 'Frontend', stack: 'React.js' },
  { id: 'backend', label: 'Backend', stack: 'Node.js' },
  { id: 'ai', label: 'AI engineering', stack: 'construir agentes de IA' },
  { id: 'agentic', label: 'Agentic engineering', stack: 'desarrollar con agentes' },
];

export const SENIORITIES: { id: Seniority; label: string }[] = [
  { id: 'junior', label: 'Junior' },
  { id: 'semi-senior', label: 'Semi-senior' },
  { id: 'senior', label: 'Senior' },
];
