import { IGeneratorSession } from '../generator-session-builder/types';

export interface ICodingModelProvider {
  readonly providerId: string;
  executeStream(
    session: IGeneratorSession,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string>;
}

export interface IRuntimeConfig {
  readonly timeoutMs: number;
  readonly maxRetries: number;
}

export interface IUsageMetrics {
  readonly durationMs: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly peakMemoryBytes: number;
}

export interface IRuntimeResponse {
  readonly responseId: string;
  readonly timestamp: number;
  readonly rawJsonContent: string;
  readonly metrics: IUsageMetrics;
  readonly status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  readonly errors: readonly string[];
}
