export type InterviewArea =
  | 'frontend'
  | 'backend'
  | 'ai'
  | 'agentic'
  | 'qa'
  | 'product-engineering'
  | 'project-manager';
export type InterviewTrack =
  | 'react'
  | 'ios'
  | 'android'
  | 'react-native'
  | 'node'
  | 'python'
  | 'java'
  | 'dotnet'
  | 'ai'
  | 'agentic'
  | 'qa'
  | 'product-engineering'
  | 'project-manager';
export type QaTool = 'cypress' | 'playwright' | 'k6';
export type Seniority = 'junior' | 'semi-senior' | 'senior';

export interface InterviewQuestion {
  question: string;
  answer: string;
  topic: string;
}

export const AREAS: { id: InterviewArea; label: string; stack: string }[] = [
  { id: 'frontend', label: 'Frontend', stack: 'React.js · iOS · Android · React Native' },
  { id: 'backend', label: 'Backend', stack: 'Node.js · Python · Java · .NET' },
  { id: 'ai', label: 'AI engineering', stack: 'construir agentes de IA' },
  { id: 'agentic', label: 'Agentic engineering', stack: 'desarrollar con agentes' },
  { id: 'qa', label: 'Quality engineering', stack: 'testing manual y automatizado' },
  {
    id: 'product-engineering',
    label: 'Product engineering',
    stack: 'qué construir, cómo medirlo',
  },
  { id: 'project-manager', label: 'Project manager', stack: 'planificación, riesgos y equipos' },
];

// Areas with more than one track (frontend, backend) ask for the technology after picking the area.
export const TRACKS: {
  id: InterviewTrack;
  area: InterviewArea;
  label: string;
  technology?: string;
  stack: string;
}[] = [
  {
    id: 'react',
    area: 'frontend',
    label: 'Frontend · React.js',
    technology: 'React.js',
    stack: 'web, hooks, Next.js',
  },
  {
    id: 'ios',
    area: 'frontend',
    label: 'Frontend · iOS',
    technology: 'iOS',
    stack: 'Swift, SwiftUI, UIKit',
  },
  {
    id: 'android',
    area: 'frontend',
    label: 'Frontend · Android',
    technology: 'Android',
    stack: 'Kotlin, Jetpack Compose',
  },
  {
    id: 'react-native',
    area: 'frontend',
    label: 'Frontend · React Native',
    technology: 'React Native',
    stack: 'Expo, iOS y Android',
  },
  {
    id: 'node',
    area: 'backend',
    label: 'Backend · Node.js',
    technology: 'Node.js',
    stack: 'Express, NestJS',
  },
  {
    id: 'python',
    area: 'backend',
    label: 'Backend · Python',
    technology: 'Python',
    stack: 'Django, FastAPI',
  },
  {
    id: 'java',
    area: 'backend',
    label: 'Backend · Java',
    technology: 'Java',
    stack: 'Spring Boot',
  },
  {
    id: 'dotnet',
    area: 'backend',
    label: 'Backend · .NET',
    technology: '.NET',
    stack: 'C#, ASP.NET Core',
  },
  { id: 'ai', area: 'ai', label: 'AI engineering', stack: 'construir agentes de IA' },
  {
    id: 'agentic',
    area: 'agentic',
    label: 'Agentic engineering',
    stack: 'desarrollar con agentes',
  },
  {
    id: 'qa',
    area: 'qa',
    label: 'Quality engineering',
    stack: 'testing manual y automatizado',
  },
  {
    id: 'product-engineering',
    area: 'product-engineering',
    label: 'Product engineering',
    stack: 'qué construir, cómo medirlo',
  },
  {
    id: 'project-manager',
    area: 'project-manager',
    label: 'Project manager',
    stack: 'planificación, riesgos y equipos',
  },
];

// Quality engineering asks whether the role includes automated testing and, if so, which tools.
export const QA_TOOLS: { id: QaTool; label: string; stack: string }[] = [
  { id: 'cypress', label: 'Cypress', stack: 'E2E' },
  { id: 'playwright', label: 'Playwright', stack: 'E2E · API' },
  { id: 'k6', label: 'k6', stack: 'performance' },
];

export const SENIORITIES: { id: Seniority; label: string }[] = [
  { id: 'junior', label: 'Junior' },
  { id: 'semi-senior', label: 'Semi-senior' },
  { id: 'senior', label: 'Senior' },
];
