import { ExecutorTaskState } from './executorTypes';

export class ExecutionState {
  public currentTaskId: string = '';
  public status: ExecutorTaskState = ExecutorTaskState.Pending;
  public progress: number = 0;
  public isPaused: boolean = false;
  public isCancelled: boolean = false;
  public logs: string[] = [];

  public log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  public reset(): void {
    this.currentTaskId = '';
    this.status = ExecutorTaskState.Pending;
    this.progress = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.logs = [];
  }
}

export const executionState = new ExecutionState();
