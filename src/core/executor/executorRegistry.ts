import { ExecutorEngine } from './executorEngine';

export class ExecutorRegistry {
  private executors = new Map<string, ExecutorEngine>();

  /**
   * Registers a new ExecutorEngine in memory.
   */
  public register(executor: ExecutorEngine): void {
    this.executors.set(executor.getId(), executor);
  }

  /**
   * Retrieves an ExecutorEngine using its ID.
   */
  public getById(id: string): ExecutorEngine | undefined {
    return this.executors.get(id);
  }

  /**
   * De-registers an ExecutorEngine.
   */
  public remove(id: string): void {
    this.executors.delete(id);
  }

  /**
   * Resets the registry cache.
   */
  public clear(): void {
    this.executors.clear();
  }
}

export const executorRegistry = new ExecutorRegistry();
