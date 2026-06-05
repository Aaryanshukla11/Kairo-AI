export enum PromptType {
  Planning = 'Planning',
  Coding = 'Coding',
  Review = 'Review',
  Testing = 'Testing',
  Debugging = 'Debugging',
  Documentation = 'Documentation',
  Refactoring = 'Refactoring',
  Architecture = 'Architecture',
  Security = 'Security',
  Chat = 'Chat'
}

export interface PromptRequest {
  type: PromptType;
  userPrompt: string;
  compiledContext?: string;
  workspaceRules?: string[];
  conversationMemory?: string;
  modelCapabilities?: string[];
  executionContext?: string;
}

export interface PromptOptimizationReport {
  removedDuplicates: number;
  mergedContexts: number;
  formattedOk: boolean;
  notes: string[];
}

export interface PromptCompressionReport {
  originalTokens: number;
  compressedTokens: number;
  ratio: number;
}

export interface PromptMetrics {
  generationTimeMs: number;
  totalTokens: number;
  systemTokens: number;
  userTokens: number;
  contextTokens: number;
}

export interface PromptReport {
  reportId: string;
  timestamp: number;
  type: PromptType;
  templateName: string;
  optimization: PromptOptimizationReport;
  compression: PromptCompressionReport;
  metrics: PromptMetrics;
}

export interface CompiledPromptResult {
  compiledPrompt: string;
  systemPrompt: string;
  userPrompt: string;
  report: PromptReport;
}

export enum PromptCompilerEventType {
  RequestReceived = 'RequestReceived',
  TemplateLoaded = 'TemplateLoaded',
  ContextInjected = 'ContextInjected',
  PromptOptimized = 'PromptOptimized',
  PromptValidated = 'PromptValidated',
  CompilationCompleted = 'CompilationCompleted'
}

export interface PromptCompilerEvent {
  type: PromptCompilerEventType;
  timestamp: number;
  payload?: any;
}

export type PromptCompilerEventListener = (event: PromptCompilerEvent) => void;
