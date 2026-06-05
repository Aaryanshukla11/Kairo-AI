import { IPlanningSession } from '../planning-session-builder/types';

export interface IPlanningModelProvider {
  readonly providerId: string;
  execute(session: IPlanningSession): Promise<string>;
}

export interface IExecutionConfig {
  readonly maxRetries: number;
  readonly timeoutMs: number;
}

export interface IExecutionStats {
  readonly requestId: string;
  readonly modelId: string;
  readonly durationMs: number;
  readonly retryCount: number;
  readonly status: 'SUCCESS' | 'FAILED';
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
