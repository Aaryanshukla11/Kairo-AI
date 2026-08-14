import { GeneratorRegistrySDK, globalGeneratorRegistrySDK } from './generatorRegistrySDK';
import { globalKairoEventBus } from '../../eventBus/runtime/kairoEventBus';
import {
  IGeneratorExecutionContext,
  IGeneratorSDKResult,
  IGeneratorExecutionResult,
  IGeneratorSDKLog,
  GeneratorSDKStage
} from './generatorSDKTypes';
import { generationContractBuilder } from '../../generation-contract';

import { ProjectSymbolGraph } from '../../projectManifest/projectSymbolGraph';

export class GeneratorSDK {
  private registry: GeneratorRegistrySDK;
  private logs: IGeneratorSDKLog[] = [];
  private listeners: Array<(log: IGeneratorSDKLog) => void> = [];
  public symbolGraph: ProjectSymbolGraph | null = null;

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
   * Constructs Dependency-Aware Execution Waves with File Conflict Resolution.
   */
  public buildExecutionWaves(tasks: readonly any[] | any[]): any[][] {
    const waves: any[][] = [];
    const completedTaskIds = new Set<string>();
    let remainingTasks = [...tasks];

    while (remainingTasks.length > 0) {
      const currentWave: any[] = [];
      const waveFiles = new Set<string>();
      const nextRemaining: any[] = [];

      for (const task of remainingTasks) {
        // Task dependencies must all be satisfied by previously completed waves
        const depsSatisfied = (task.dependencies || []).every((depId: string) => completedTaskIds.has(depId));

        if (depsSatisfied) {
          // File Conflict Check: Check if targetFiles overlap with existing files in current wave
          const taskFiles: string[] = task.targetFiles || [];
          const hasConflict = taskFiles.some(f => waveFiles.has(f));

          if (!hasConflict) {
            currentWave.push(task);
            taskFiles.forEach(f => waveFiles.add(f));
          } else {
            // Push task to subsequent wave to resolve file conflict
            nextRemaining.push(task);
          }
        } else {
          nextRemaining.push(task);
        }
      }

      // Safeguard against circular dependencies
      if (currentWave.length === 0 && nextRemaining.length > 0) {
        console.warn('[GeneratorSDK] Circular dependency or unresolved prerequisites detected. Executing remaining tasks sequentially.');
        currentWave.push(nextRemaining.shift());
      }

      currentWave.forEach(t => completedTaskIds.add(t.id));
      waves.push(currentWave);
      remainingTasks = nextRemaining;
    }

    return waves;
  }

  /**
   * Primary SDK execution framework entry point.
   * Enforces 7-stage common lifecycle across all registered generators.
   */
  public async executePlan(context: IGeneratorExecutionContext): Promise<IGeneratorSDKResult> {
    const startTime = Date.now();
    const requestId = context.requestId;
    const sessionId = context.sessionId;

    console.log(`[GeneratorSDK][ENTER] - executionId: ${requestId}, sessionId: ${sessionId}`);

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

    if (!context.generationPlan) {
      console.log(`[GeneratorSDK][EXIT] - executionId: ${requestId}, status: FAILED (generationPlan undefined)`);
      throw new Error('[GeneratorSDK] Invalid Execution Context: generationPlan is undefined or missing.');
    }

    const tasks = context.generationPlan.orderedTaskList || [];
    console.log(`[GeneratorSDK][PLAN_RECEIVED] - executionId: ${requestId}, tasksCount: ${tasks.length}`);
    console.log(`[GeneratorSDK][TASKS_CREATED] - executionId: ${requestId}, tasksCount: ${tasks.length}`);

    if (tasks.length === 0) {
      console.log(`[GeneratorSDK][EXIT] - executionId: ${requestId}, status: FAILED (orderedTaskList empty)`);
      throw new Error('[GeneratorSDK] Invalid Generation Plan: orderedTaskList is empty or missing generator tasks.');
    }

    await globalKairoEventBus.publish({
      eventId: `evt-gen-start-${sessionId}-${Date.now()}`,
      eventType: 'GenerationStarted',
      timestamp: Date.now(),
      source: 'GeneratorSDK',
      priority: 'CRITICAL',
      correlationId: requestId,
      sessionId,
      payload: { requestId, sessionId, totalGenerators: tasks.length }
    });

    const results: IGeneratorExecutionResult[] = [];
    const contracts: any[] = [];
    let totalArtifactsCount = 0;
    let planSuccess = true;

    // Build Execution Waves
    const waves = this.buildExecutionWaves(tasks);
    console.log(`[GeneratorSDK][WAVES_BUILT] - executionId: ${requestId}, totalWaves: ${waves.length}`);
    waves.forEach((w, i) => {
      console.log(`  Wave ${i + 1} (${w.length} generators): [${w.map(t => t.generatorId).join(', ')}]`);
    });

    const failedTaskIds = new Set<string>();

    for (const wave of waves) {
      await Promise.all(
        wave.map(async (task) => {
          // Check if any prerequisite dependency failed
          const hasFailedDep = (task.dependencies || []).some((depId: string) => failedTaskIds.has(depId));
          if (hasFailedDep) {
            console.warn(`[GeneratorSDK] Skipping task '${task.id}' (${task.generatorId}) because prerequisite dependency failed.`);
            failedTaskIds.add(task.id);
            planSuccess = false;
            return;
          }

          const generator = this.registry.resolve(task.generatorId);
          if (!generator) {
            this.emitLog({
              stage: 'GENERATOR_EXECUTION',
              timestamp: Date.now(),
              status: 'FAILED',
              message: `Generator '${task.generatorId}' is not registered in SDK registry`,
              details: { requestId, sessionId, targetGenerator: task.generatorId }
            });
            failedTaskIds.add(task.id);
            planSuccess = false;
            throw new Error(`[GeneratorSDK] Generator '${task.generatorId}' is not registered in SDK registry.`);
          }

          console.log(`[GeneratorSDK][GENERATOR_SELECTED] - executionId: ${requestId}, generator: ${generator.id}, task: ${task.id}`);
          console.log(`[GeneratorSDK][GENERATOR_STARTED] - executionId: ${requestId}, generator: ${generator.id}`);
          const genStartTime = Date.now();

          await globalKairoEventBus.publish({
            eventId: `evt-gen-started-${generator.id}-${Date.now()}`,
            eventType: 'GeneratorStarted',
            timestamp: Date.now(),
            source: 'GeneratorSDK',
            priority: 'HIGH',
            correlationId: requestId,
            sessionId,
            payload: { requestId, sessionId, generator: generator.id, generatorName: generator.name }
          });

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
            const genDuration = Date.now() - genStartTime;
            console.log(`[GeneratorSDK][GENERATOR_COMPLETED] - executionId: ${requestId}, generator: ${generator.id}, artifactsCount: ${execResult.generatedArtifacts.length}, duration: ${genDuration}ms`);

            // Emit FileGenerationStarted and FileGenerationCompleted for each artifact
            for (const artifactPath of execResult.generatedArtifacts || []) {
              await globalKairoEventBus.publish({
                eventId: `evt-file-gen-start-${artifactPath}-${Date.now()}`,
                eventType: 'FileGenerationStarted',
                timestamp: Date.now(),
                source: 'GeneratorSDK',
                priority: 'HIGH',
                correlationId: requestId,
                sessionId,
                payload: {
                  requestId,
                  sessionId,
                  filePath: artifactPath,
                  generator: generator.id,
                  generatorName: generator.name,
                  status: 'GENERATING'
                }
              });

              await globalKairoEventBus.publish({
                eventId: `evt-file-gen-done-${artifactPath}-${Date.now()}`,
                eventType: 'FileGenerationCompleted',
                timestamp: Date.now(),
                source: 'GeneratorSDK',
                priority: 'HIGH',
                correlationId: requestId,
                sessionId,
                payload: {
                  requestId,
                  sessionId,
                  filePath: artifactPath,
                  generator: generator.id,
                  generatorName: generator.name,
                  status: 'GENERATED'
                }
              });
            }

            await globalKairoEventBus.publish({
              eventId: `evt-gen-done-${generator.id}-${Date.now()}`,
              eventType: 'GeneratorCompleted',
              timestamp: Date.now(),
              source: 'GeneratorSDK',
              priority: 'HIGH',
              correlationId: requestId,
              sessionId,
              payload: { requestId, sessionId, generator: generator.id, generatorName: generator.name, artifactsCount: execResult.generatedArtifacts.length }
            });

            // Build GenerationContract for each completed generator
            const fileOps = (execResult.generatedArtifacts || []).map((filePath: string, idx: number) => ({
              operationId: `op-${generator.id}-${idx}-${Date.now()}`,
              operationType: 'CREATE_FILE' as const,
              filePath: filePath.startsWith('/') || filePath.includes(':') ? filePath : `${context.customPayload?.workspacePath || '.'}/${filePath}`,
              relativePath: filePath,
              language: filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'TypeScript' : filePath.endsWith('.json') ? 'JSON' : 'Markdown',
              encoding: 'utf-8',
              content: `// Artifact generated by ${generator.name} (${generator.id})`,
              reason: `Generated by ${generator.id} for task ${task.id}`,
              dependencies: []
            }));

            const contractDraft = {
              contractVersion: '1.0.0',
              requestId: context.requestId,
              executionId: `exec-${generator.id}-${Date.now()}`,
              fileOperations: fileOps,
              directoryOperations: [],
              warnings: [],
              errors: [],
              metadata: {
                generator: generator.id,
                timestamp: Date.now(),
                model: 'qwen2.5-coder:7b',
                projectId: context.sessionId
              }
            };

            // Update SymbolGraph with generated artifacts
            for (const artifactPath of execResult.generatedArtifacts || []) {
              if (this.symbolGraph) {
                this.symbolGraph.parseAndRecordGeneratedCode(artifactPath, `// Code generated for ${artifactPath}`);
              }
            }

            // Cross-File Symbol Integrity Validation
            let isCrossFileValid = true;
            if (this.symbolGraph) {
              for (const artifactPath of execResult.generatedArtifacts || []) {
                const crossCheck = this.symbolGraph.validateCrossFileIntegrity(artifactPath, `// Code generated for ${artifactPath}`);
                if (!crossCheck.valid) {
                  isCrossFileValid = false;
                  console.warn(`[GeneratorSDK][CrossFileValidation] Repair Required for ${artifactPath}:`, crossCheck.issues);
                }
              }
            }

            const contract = generationContractBuilder.createContract(contractDraft);
            contracts.push(contract);
            console.log(`[GeneratorSDK][CONTRACT_CREATED] - executionId: ${requestId}, generator: ${generator.id}, opsCount: ${fileOps.length}`);

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
              failedTaskIds.add(task.id);
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
            failedTaskIds.add(task.id);
            planSuccess = false;
          }
        })
      );
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

    const isFinalSuccess = planSuccess && results.length > 0 && contracts.length > 0;
    console.log(`[GeneratorSDK][EXIT] - executionId: ${requestId}, totalContracts: ${contracts.length}, status: ${isFinalSuccess ? 'SUCCESS' : 'FAILED'}`);

    if (contracts.length > 0) {
      const workspacePath =
        context.customPayload?.workspacePath ||
        context.workspaceBlueprint?.workspaceRoot ||
        context.customPayload?.workspaceRoot ||
        context.requirementObject?.workspacePath;

      await globalKairoEventBus.publish({
        eventId: `evt-gen-completed-${sessionId}-${Date.now()}`,
        eventType: 'GenerationCompleted',
        timestamp: Date.now(),
        source: 'GeneratorSDK',
        priority: 'CRITICAL',
        correlationId: requestId,
        sessionId,
        payload: {
          requestId,
          sessionId,
          workspacePath,
          workspaceRoot: workspacePath,
          contracts,
          totalArtifactsCount
        }
      });
    }

    return {
      requestId,
      sessionId,
      success: isFinalSuccess,
      generatorResults: Object.freeze(results),
      contracts: Object.freeze(contracts),
      totalArtifactsCount,
      executionTimeMs: Date.now() - startTime
    };
  }
}

export const generatorSDK = new GeneratorSDK();
