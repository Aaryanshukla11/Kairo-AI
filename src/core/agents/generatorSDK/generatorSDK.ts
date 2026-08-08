import { GeneratorRegistrySDK, globalGeneratorRegistrySDK } from './generatorRegistrySDK';
import {
  IGeneratorExecutionContext,
  IGeneratorSDKResult,
  IGeneratorExecutionResult,
  IGeneratorSDKLog,
  GeneratorSDKStage
} from './generatorSDKTypes';

export class GeneratorSDK {
  private registry: GeneratorRegistrySDK;
  private logs: IGeneratorSDKLog[] = [];
  private listeners: Array<(log: IGeneratorSDKLog) => void> = [];

  constructor(registry: GeneratorRegistrySDK = globalGeneratorRegistrySDK) {
    this.registry = registry;
  }

  public getLogs(): readonly IGeneratorSDKLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: (log: IGeneratorSDKLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitLog(stageLog: IGeneratorSDKLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[GeneratorSDK] Error in log listener:', err);
      }
    }
  }

  /**
   * Primary SDK execution framework entry point.
   * Enforces 7-stage common lifecycle across all registered generators.
   */
  public async executePlan(context: IGeneratorExecutionContext): Promise<IGeneratorSDKResult> {
    const startTime = Date.now();
    const requestId = context.requestId;
    const sessionId = context.sessionId;

    // STAGE 1: GENERATOR REGISTRATION & DISCOVERY
    const registeredGens = this.registry.list();
    this.emitLog({
      stage: 'GENERATOR_REGISTRATION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Discovered and verified ${registeredGens.length} registered generators in Generator Registry`,
      details: {
        requestId,
        sessionId,
        registeredGenerators: registeredGens.map(g => g.id)
      }
    });

    const tasks = context.generationPlan?.orderedTaskList || [];
    const results: IGeneratorExecutionResult[] = [];
    let totalArtifactsCount = 0;
    let planSuccess = true;

    for (const task of tasks) {
      const generator = this.registry.resolve(task.generatorId);
      if (!generator) {
        this.emitLog({
          stage: 'GENERATOR_EXECUTION',
          timestamp: Date.now(),
          status: 'FAILED',
          message: `Generator '${task.generatorId}' is not registered in SDK registry`,
          details: { requestId, sessionId, targetGenerator: task.generatorId }
        });
        planSuccess = false;
        continue;
      }

      try {
        // STAGE 2: GENERATOR INITIALIZATION & PREPARATION
        this.emitLog({
          stage: 'GENERATOR_INITIALIZATION',
          timestamp: Date.now(),
          status: 'SUCCESS',
          message: `Initializing generator '${generator.id}' for stage '${task.stage}'`,
          details: { requestId, sessionId, generatorId: generator.id, stage: task.stage }
        });

        await generator.initialize(context);
        await generator.prepare(context);

        // STAGE 3: GENERATOR EXECUTION
        this.emitLog({
          stage: 'GENERATOR_EXECUTION',
          timestamp: Date.now(),
          status: 'SUCCESS',
          message: `Executing generator '${generator.id}' for task '${task.id}'`,
          details: { requestId, sessionId, generatorId: generator.id, taskId: task.id }
        });

        const execResult = await generator.execute(context);

        // STAGE 4: VALIDATION
        const valResult = await generator.validate(context);
        this.emitLog({
          stage: 'VALIDATION',
          timestamp: Date.now(),
          status: valResult.valid ? 'SUCCESS' : 'FAILED',
          message: valResult.valid
            ? `Validation passed for generator '${generator.id}' (${execResult.generatedArtifacts.length} artifacts)`
            : `Validation failed for generator '${generator.id}'`,
          details: {
            requestId,
            sessionId,
            generatorId: generator.id,
            valid: valResult.valid,
            errors: valResult.errors
          }
        });

        if (!valResult.valid) {
          // STAGE 6: ROLLBACK ON VALIDATION FAILURE
          this.emitLog({
            stage: 'ROLLBACK',
            timestamp: Date.now(),
            status: 'WARNING',
            message: `Triggered rollback lifecycle for generator '${generator.id}'`,
            details: { requestId, sessionId, generatorId: generator.id }
          });
          await generator.rollback(context);
          planSuccess = false;
        } else {
          // STAGE 5: FINALIZATION
          this.emitLog({
            stage: 'FINALIZATION',
            timestamp: Date.now(),
            status: 'SUCCESS',
            message: `Finalizing artifacts for generator '${generator.id}'`,
            details: { requestId, sessionId, generatorId: generator.id }
          });
          await generator.finalize(context);

          results.push(execResult);
          totalArtifactsCount += execResult.generatedArtifacts.length;
        }

        // STAGE 7: DISPOSAL
        await generator.dispose();
      } catch (err: any) {
        this.emitLog({
          stage: 'ROLLBACK',
          timestamp: Date.now(),
          status: 'FAILED',
          message: `Generator execution error in '${generator.id}': ${err.message}`,
          details: { requestId, sessionId, generatorId: generator.id, error: err.message }
        });
        await generator.rollback(context);
        await generator.dispose();
        planSuccess = false;
      }
    }

    // STAGE 7: COMPLETION
    this.emitLog({
      stage: 'COMPLETION',
      timestamp: Date.now(),
      status: planSuccess ? 'SUCCESS' : 'FAILED',
      message: planSuccess
        ? `Generator SDK plan execution completed successfully (${results.length} generators executed, ${totalArtifactsCount} artifacts planned)`
        : 'Generator SDK plan execution encountered failures',
      details: {
        requestId,
        sessionId,
        executedGeneratorsCount: results.length,
        totalArtifactsCount,
        executionTimeMs: Date.now() - startTime
      }
    });

    return {
      requestId,
      sessionId,
      success: planSuccess,
      generatorResults: Object.freeze(results),
      totalArtifactsCount,
      executionTimeMs: Date.now() - startTime
    };
  }
}

export const generatorSDK = new GeneratorSDK();
