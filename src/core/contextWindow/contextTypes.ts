export enum ContextPriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Background = 'Background'
}

export interface ContextItem {
  id: string;
  source: 'workspace' | 'conversation' | 'memory' | 'retrieval' | 'diagnostics' | 'execution' | string;
  content: string;
  tokenCount: number;
  priority: ContextPriority;
  score: number; // Relevance score [0, 1]
  metadata?: Record<string, any>;
}

export interface TokenAllocation {
  systemPrompt: number;
  userPrompt: number;
  workspace: number;
  conversation: number;
  memory: number;
  retrievedContext: number;
  diagnostics: number;
  toolResults: number;
  available: number;
  totalLimit: number;
}

export interface ContextCompressionReport {
  originalTokens: number;
  compressedTokens: number;
  ratio: number;
  technique: string;
}

export interface PriorityReport {
  criticalTokens: number;
  highTokens: number;
  mediumTokens: number;
  lowTokens: number;
  backgroundTokens: number;
}

export interface ContextReport {
  reportId: string;
  timestamp: number;
  totalTokens: number;
  allocation: TokenAllocation;
  compression: ContextCompressionReport;
  priorities: PriorityReport;
  cacheHit: boolean;
}

export enum ContextEventType {
  ContextCollected = 'ContextCollected',
  ContextRanked = 'ContextRanked',
  ContextCompressed = 'ContextCompressed',
  TokensAllocated = 'TokensAllocated',
  ContextAssembled = 'ContextAssembled',
  ContextValidated = 'ContextValidated',
  ContextCacheHit = 'ContextCacheHit'
}

export interface ContextEvent {
  type: ContextEventType;
  timestamp: number;
  payload?: any;
}

export type ContextEventListener = (event: ContextEvent) => void;
