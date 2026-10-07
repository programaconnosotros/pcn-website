export type InterviewArea =
  | 'frontend'
  | 'backend'
  | 'ai'
  | 'agentic'
  | 'qa'
  | 'security'
  | 'devops'
  | 'ux-ui'
  | 'product-engineering'
  | 'project-manager'
  | 'soft-skills'
  | 'tech-lead';
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
  | 'security'
  | 'devops'
  | 'ux-ui'
  | 'product-engineering'
  | 'project-manager'
  | 'soft-skills'
  | 'tech-lead';
export type QaTool = 'cypress' | 'playwright' | 'k6';
/** Tools a track can add on top of its general questions, one question bank each. */
export type TrackTool =
  | 'figma'
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'vercel'
  | 'docker'
  | 'kubernetes'
  | 'terraform'
  | 'github-actions'
  | 'linux'
  | 'observability';
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
  { id: 'security', label: 'Seguridad informática', stack: 'AppSec, pentesting y defensa' },
  { id: 'devops', label: 'DevOps', stack: 'cloud, contenedores, IaC y CI/CD' },
  { id: 'ux-ui', label: 'Diseño UX/UI', stack: 'research, interacción, visual y Figma' },
  {
    id: 'product-engineering',
    label: 'Product engineering',
    stack: 'qué construir, cómo medirlo',
  },
  { id: 'project-manager', label: 'Project manager', stack: 'planificación, riesgos y equipos' },
  {
    id: 'soft-skills',
    label: 'Soft skills y liderazgo',
    stack: 'comunicación, conflictos y liderazgo',
  },
  { id: 'tech-lead', label: 'Tech lead', stack: 'decisiones técnicas, equipo y entrega' },
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
    id: 'security',
    area: 'security',
    label: 'Seguridad informática',
    stack: 'AppSec, pentesting y defensa',
  },
  {
    id: 'devops',
    area: 'devops',
    label: 'DevOps',
    stack: 'cloud, contenedores, IaC y CI/CD',
  },
  {
    id: 'ux-ui',
    area: 'ux-ui',
    label: 'Diseño UX/UI',
    stack: 'research, interacción, visual y Figma',
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
  {
    id: 'soft-skills',
    area: 'soft-skills',
    label: 'Soft skills y liderazgo',
    stack: 'comunicación, conflictos y liderazgo',
  },
  {
    id: 'tech-lead',
    area: 'tech-lead',
    label: 'Tech lead',
    stack: 'decisiones técnicas, equipo y entrega',
  },
];

// Quality engineering asks whether the role includes automated testing and, if so, which tools.
export const QA_TOOLS: { id: QaTool; label: string; stack: string }[] = [
  { id: 'cypress', label: 'Cypress', stack: 'E2E' },
  { id: 'playwright', label: 'Playwright', stack: 'E2E · API' },
  { id: 'k6', label: 'k6', stack: 'performance' },
];

export interface TrackToolOption {
  id: TrackTool;
  label: string;
  stack: string;
}

/**
 * Tracks whose role can include specific tools: the general questions always enter and each
 * selected tool adds its own bank. `required` asks for at least one tool before starting.
 */
export const TRACK_TOOLS: Partial<
  Record<InterviewTrack, { title: string; required: boolean; tools: TrackToolOption[] }>
> = {
  devops: {
    title: 'tecnologías',
    required: true,
    tools: [
      { id: 'aws', label: 'AWS', stack: 'IAM, VPC, EC2, S3, EKS' },
      { id: 'azure', label: 'Azure', stack: 'Entra ID, AKS, App Service' },
      { id: 'gcp', label: 'Google Cloud Platform', stack: 'IAM, GKE, Cloud Run' },
      { id: 'vercel', label: 'Vercel', stack: 'deploys, previews, caché' },
      { id: 'docker', label: 'Docker', stack: 'imágenes, Dockerfile, compose' },
      { id: 'kubernetes', label: 'Kubernetes', stack: 'pods, deployments, Helm' },
      { id: 'terraform', label: 'Terraform', stack: 'IaC, state, módulos' },
      { id: 'github-actions', label: 'CI/CD', stack: 'GitHub Actions, pipelines' },
      { id: 'linux', label: 'Linux y redes', stack: 'procesos, DNS, TCP/IP' },
      { id: 'observability', label: 'Observabilidad', stack: 'Prometheus, Grafana' },
    ],
  },
  'ux-ui': {
    title: 'herramientas',
    required: false,
    tools: [
      {
        id: 'figma',
        label: 'Figma',
        stack: 'auto layout, componentes, variables, Dev Mode',
      },
    ],
  },
};

export const SENIORITIES: { id: Seniority; label: string }[] = [
  { id: 'junior', label: 'Junior' },
  { id: 'semi-senior', label: 'Semi-senior' },
  { id: 'senior', label: 'Senior' },
];
