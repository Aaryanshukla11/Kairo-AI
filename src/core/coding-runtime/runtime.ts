import { IGeneratorSession } from '../generator-session-builder/types';
import { IRuntimeResponse, ICodingModelProvider, IRuntimeConfig, IUsageMetrics } from './types';
import * as crypto from 'crypto';

export class RuntimeController {
  public async executeSession(
    session: IGeneratorSession,
    provider: ICodingModelProvider,
    config: IRuntimeConfig,
    onChunk?: (chunk: string) => void,
    externalSignal?: AbortSignal
  ): Promise<IRuntimeResponse> {
    const startTime = Date.now();
    const responseId = crypto.randomUUID ? crypto.randomUUID() : `res-run-${Date.now()}`;
    const errors: string[] = [];

    // Create abort controller for timeout & manual cancellation integration
    const controller = new AbortController();
    const signal = controller.signal;

    // Connect external signal aborts
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => {
        controller.abort();
      });
    }

    // Set timeout trigger
    const timeoutHandle = setTimeout(() => {
      errors.push('Execution timed out.');
      controller.abort();
    }, config.timeoutMs);

    let attempt = 0;
    let rawJsonContent = '';
    let status: 'SUCCESS' | 'FAILED' | 'CANCELLED' = 'FAILED';

    while (attempt <= config.maxRetries) {
      try {
        if (signal.aborted) {
          status = 'CANCELLED';
          errors.push('Execution cancelled.');
          break;
        }

        rawJsonContent = await provider.executeStream(
          session,
          (chunk) => {
            if (onChunk) onChunk(chunk);
          },
          signal
        );

        status = 'SUCCESS';
        break;
      } catch (err: any) {
        attempt++;
        errors.push(`Attempt ${attempt} failed: ${err.message || err}`);
        
        if (signal.aborted) {
          status = 'CANCELLED';
          break;
        }

        if (attempt > config.maxRetries) {
          break;
        }
      }
    }

    clearTimeout(timeoutHandle);

    // Track usage metrics
    const durationMs = Date.now() - startTime;
    const inputTokens = Math.ceil(session.systemRole ? session.systemRole.length / 4 : 50);
    const outputTokens = Math.ceil(rawJsonContent.length / 4);
    
    // Read local memory usage
    const memUsage = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

    const metrics: IUsageMetrics = {
      durationMs,
      inputTokens,
      outputTokens,
      peakMemoryBytes: memUsage
    };

    return {
      responseId,
      timestamp: Date.now(),
      rawJsonContent,
      metrics,
      status,
      errors: Object.freeze([...errors])
    };
  }
}

export const runtimeController = new RuntimeController();
export default runtimeController;
