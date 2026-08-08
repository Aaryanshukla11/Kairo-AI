import { IPlanningSession } from '../planning-session-builder/types';
import { IPlanningContract } from '../planning-contract/types';
import { planningContractBuilder } from '../planning-contract';
import { IPlanningModelProvider, IExecutionConfig, IExecutionStats } from './types';
import { retryExecutor } from './retry';

export class PipelineExecutor {
  public async executePipeline(
    session: IPlanningSession,
    provider: IPlanningModelProvider,
    config: IExecutionConfig,
    logCallback: (stats: IExecutionStats) => void
  ): Promise<IPlanningContract> {
    const startTime = Date.now();
    let retryCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Session verification check
    if (!session.userPromptPayload || !session.sessionId) {
      throw new Error('Invalid Planning Session: userPromptPayload and sessionId are required.');
    }

    let rawResponse = '';
    try {
      // 2. Execute model calling with retries
      rawResponse = await retryExecutor.executeWithRetry(
        async () => {
          return await provider.execute(session);
        },
        config.maxRetries,
        (err, attempt) => {
          retryCount = attempt;
          errors.push(`Attempt ${attempt} failed: ${err.message || err}`);
        }
      );
    } catch (modelErr: any) {
      const stats: IExecutionStats = {
        requestId: session.sessionId,
        modelId: provider.providerId,
        durationMs: Date.now() - startTime,
        retryCount,
        status: 'FAILED',
        errors: Object.freeze([...errors, modelErr.message || String(modelErr)]),
        warnings: Object.freeze([])
      };
      logCallback(stats);
      throw new Error(`Planning model integration failed after ${retryCount} retries: ${modelErr.message || modelErr}`);
    }

    // 3. Parse JSON response
    let parsedContract: any;
    try {
      parsedContract = JSON.parse(rawResponse);
    } catch (jsonErr: any) {
      const stats: IExecutionStats = {
        requestId: session.sessionId,
        modelId: provider.providerId,
        durationMs: Date.now() - startTime,
        retryCount,
        status: 'FAILED',
        errors: Object.freeze([...errors, `Invalid JSON output: ${jsonErr.message}`]),
        warnings: Object.freeze([])
      };
      logCallback(stats);
      throw new Error(`Planning model output is not valid JSON: ${jsonErr.message}`);
    }

    // 4. Validate Response format using PlanningContractBuilder
    let finalContract: IPlanningContract;
    try {
      // Assemble and validate inside contract builder
      finalContract = planningContractBuilder.createContract(parsedContract);
    } catch (contractErr: any) {
      const stats: IExecutionStats = {
        requestId: session.sessionId,
        modelId: provider.providerId,
        durationMs: Date.now() - startTime,
        retryCount,
        status: 'FAILED',
        errors: Object.freeze([...errors, `Contract validation failed: ${contractErr.message}`]),
        warnings: Object.freeze([])
      };
      logCallback(stats);
      throw new Error(`Planning contract structure schema check failed: ${contractErr.message}`);
    }

    // Check if validation errors were added to contract
    if (finalContract.errors.length > 0) {
      const stats: IExecutionStats = {
        requestId: session.sessionId,
        modelId: provider.providerId,
        durationMs: Date.now() - startTime,
        retryCount,
        status: 'FAILED',
        errors: Object.freeze([...errors, ...finalContract.errors]),
        warnings: Object.freeze([...finalContract.warnings])
      };
      logCallback(stats);
      throw new Error(`Planning contract validation returned errors: ${finalContract.errors.join('; ')}`);
    }

    // 5. Success logging stats
    const durationMs = Date.now() - startTime;
    const stats: IExecutionStats = {
      requestId: session.sessionId,
      modelId: provider.providerId,
      durationMs,
      retryCount,
      status: 'SUCCESS',
      errors: Object.freeze([...errors]),
      warnings: Object.freeze([...finalContract.warnings])
    };
    logCallback(stats);

    return finalContract;
  }
}

export const pipelineExecutor = new PipelineExecutor();
export default pipelineExecutor;
