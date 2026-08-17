import { IPromptContext } from '../prompt-context-builder/types';
import { IAIRequestOutput } from '../ai-request-builder/types';
import { IRoutingDecision } from '../prompt-model-router/types';
import { Memory } from '../agents/memory/memoryTypes';

export type KernelStage = 
  | 'CONTEXT_BUILDER'
  | 'MEMORY_ENGINE'
  | 'KNOWLEDGE_ENGINE'
  | 'MODEL_ROUTER'
  | 'ORCHESTRATOR_HANDOFF';

export interface IKernelStageLog {
  readonly stage: KernelStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IAIKernelRequest {
  readonly rawPrompt: string;
  readonly workspacePath?: string;
  readonly requestId?: string;
  readonly metadata?: Record<string, any>;
  readonly provider?: any;
  readonly codingProvider?: any;
  readonly fsAdapter?: any;
}

export interface IAIKernelKnowledgeContext {
  readonly indexedFiles: readonly string[];
  readonly relevantSymbols: readonly string[];
  readonly matchedContext: readonly string[];
}

export interface IAIKernelCompiledRequest {
  readonly requestId: string;
  readonly timestamp: number;
  readonly rawPrompt: string;
  readonly normalizedPrompt: string;
  readonly intent: string;
  readonly promptContext: IPromptContext;
  readonly aiRequest: IAIRequestOutput;
  readonly memories: readonly Memory[];
  readonly knowledge: IAIKernelKnowledgeContext;
  readonly routingDecision: IRoutingDecision;
  readonly kernelLogs: readonly IKernelStageLog[];
  readonly workspacePath?: string;
  readonly provider?: any;
  readonly codingProvider?: any;
  readonly fsAdapter?: any;
  readonly orchestrationResult?: any;
}

export interface IAIKernel {
  processPrompt(
    input: string | IAIKernelRequest,
    workspacePath?: string
  ): Promise<IAIKernelCompiledRequest>;
  getLogs(): readonly IKernelStageLog[];
  getLastCompiledRequest(): IAIKernelCompiledRequest | null;
  subscribe(listener: (log: IKernelStageLog) => void): () => void;
  clearHistory(): void;
}
