import { agenticQuestions } from './agentic';
import { aiQuestions } from './ai';
import { androidQuestions } from './android';
import { awsQuestions } from './aws';
import { azureQuestions } from './azure';
import { cypressQuestions } from './cypress';
import { devopsQuestions } from './devops';
import { dockerQuestions } from './docker';
import { dotnetQuestions } from './dotnet';
import { figmaQuestions } from './figma';
import { frontendQuestions } from './frontend';
import { gcpQuestions } from './gcp';
import { githubActionsQuestions } from './github-actions';
import { iosQuestions } from './ios';
import { javaQuestions } from './java';
import { k6Questions } from './k6';
import { kubernetesQuestions } from './kubernetes';
import { linuxQuestions } from './linux';
import { nodeQuestions } from './node';
import { observabilityQuestions } from './observability';
import { playwrightQuestions } from './playwright';
import { productEngineeringQuestions } from './product-engineering';
import { projectManagerQuestions } from './project-manager';
import { pythonQuestions } from './python';
import { qaQuestions } from './qa';
import { qaAutomationQuestions } from './qa-automation';
import { reactNativeQuestions } from './react-native';
import { securityQuestions } from './security';
import { terraformQuestions } from './terraform';
import { uxUiQuestions } from './ux-ui';
import { vercelQuestions } from './vercel';
import { softSkillsQuestions } from './soft-skills';
import { techLeadQuestions } from './tech-lead';
import { softwareArchitectQuestions } from './software-architect';
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
  devops: devopsQuestions,
  'ux-ui': uxUiQuestions,
  'product-engineering': productEngineeringQuestions,
  'project-manager': projectManagerQuestions,
  'software-architect': softwareArchitectQuestions,
  'tech-lead': techLeadQuestions,
  'soft-skills': softSkillsQuestions,
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
  aws: awsQuestions,
  azure: azureQuestions,
  gcp: gcpQuestions,
  vercel: vercelQuestions,
  docker: dockerQuestions,
  kubernetes: kubernetesQuestions,
  terraform: terraformQuestions,
  'github-actions': githubActionsQuestions,
  linux: linuxQuestions,
  observability: observabilityQuestions,
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
