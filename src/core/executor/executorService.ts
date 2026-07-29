import { ExecutionGraph } from '../executionGraph/graphTypes';
import { ExecutorEngine } from './executorEngine';
import { executorRegistry } from './executorRegistry';
import { ExecutorProgress } from './executorTypes';
import { ExecutorEventListener } from './executorEvents';

export class ExecutorService {
  private activeExecutor: ExecutorEngine | null = null;

  /**
   * Starts execution of a dependency graph.
   */
  public async startExecution(graph: ExecutionGraph, onEvent?: ExecutorEventListener): Promise<string> {
    if (this.activeExecutor) {
      const progress = this.activeExecutor.getProgress();
      if (
        progress.status === 'Running' ||
        progress.status === 'Preparing' ||
        progress.status === 'Queued'
      ) {
        throw new Error('Executor is already running a task.');
      }
    }

    const executor = new ExecutorEngine();
    executorRegistry.register(executor);
    this.activeExecutor = executor;

    if (onEvent) {
      executor.subscribe(onEvent);
    }

    await executor.execute(graph);
    return executor.getId();
  }

  /**
   * Pauses the currently running execution.
   */
  public pause(): void {
    if (this.activeExecutor) {
      this.activeExecutor.pause();
    }
  }

  /**
   * Resumes the paused execution.
   */
  public resume(): void {
    if (this.activeExecutor) {
      this.activeExecutor.resume();
    }
  }

  /**
   * Cancels execution.
   */
  public cancel(): void {
    if (this.activeExecutor) {
      this.activeExecutor.cancel();
    }
  }

  /**
   * Returns progress details of the active executor, or null if none exists.
   */
  public getProgress(): ExecutorProgress | null {
    if (this.activeExecutor) {
      return this.activeExecutor.getProgress();
    }
    return null;
  }

  /**
   * Returns current log entries.
   */
  public getLogs(): string[] {
    if (this.activeExecutor) {
      return this.activeExecutor.getLogs();
    }
    return [];
  }
}

export const executorService = new ExecutorService();
