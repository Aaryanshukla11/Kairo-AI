import { RetrievedContext } from '../retriever/retrieverTypes';

export enum PromptType {
  CodeGen = 'Code Generation',
  BugFix = 'Bug Fixing',
  Explanation = 'Explanation',
  Refactor = 'Refactoring',
  Testing = 'Testing',
  ArchReview = 'Architecture Review',
  Documentation = 'Documentation'
}

export interface PromptAssemblyRequest {
  prompt: string;
  type: PromptType;
  retrievedContext?: RetrievedContext;
  workspaceSummary?: string;
  gitSummary?: string;
  diagnostics?: string[];
  tokenLimit?: number;
}

export interface PromptPackage {
  systemPrompt: string;
  developerPrompt: string;
  userPrompt: string;
  projectContext: string;
  retrievedContext: string;
  executionContext: string;
  metadata: Record<string, any>;
  estimatedTokens: number;
}

export enum PromptAssemblyEventType {
  PromptRequested = 'PromptRequested',
  PromptBuilt = 'PromptBuilt',
  PromptCompressed = 'PromptCompressed',
  PromptValidated = 'PromptValidated'
}

export interface PromptAssemblyEvent {
  type: PromptAssemblyEventType;
  promptType: PromptType;
  timestamp: number;
  payload?: any;
}

export type PromptAssemblyEventListener = (event: PromptAssemblyEvent) => void;
