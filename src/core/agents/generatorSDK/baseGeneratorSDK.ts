import { IGeneratorExecutionContext, IGeneratorExecutionResult } from './generatorSDKTypes';

export abstract class BaseSDKGenerator {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly version: string;
  public abstract readonly description: string;
  public abstract readonly capabilities: readonly string[];
  public abstract readonly priority: number;

  /**
   * Stage 1: Initialize generator environment and state.
   */
  public async initialize(context: IGeneratorExecutionContext): Promise<void> {
    // Default no-op initialization
  }

  /**
   * Stage 2: Prepare inputs and dependencies.
   */
  public async prepare(context: IGeneratorExecutionContext): Promise<void> {
    // Default no-op preparation
  }

  /**
   * Stage 3: Perform generator execution logic.
   */
  public abstract execute(context: IGeneratorExecutionContext): Promise<IGeneratorExecutionResult>;

  /**
   * Stage 4: Validate generated artifacts and metadata.
   */
  public async validate(context: IGeneratorExecutionContext): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  /**
   * Stage 5: Finalize generator execution artifacts.
   */
  public async finalize(context: IGeneratorExecutionContext): Promise<void> {
    // Default no-op finalization
  }

  /**
   * Stage 6: Rollback generated artifacts on failure.
   */
  public async rollback(context: IGeneratorExecutionContext): Promise<void> {
    // Default no-op rollback
  }

  /**
   * Stage 7: Clean up allocated resources.
   */
  public async dispose(): Promise<void> {
    // Default no-op disposal
  }
}
