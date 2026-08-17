import { toolService } from '../../toolCalling';
import { checkpointService } from '../../checkpoint';
import { ExecutionQueue } from './executionQueue';
import { executionState } from './executionState';
import { executorBrain } from './executorBrain';
import { ExecutionReport, ExecutorEventType } from './executorTypes';
import { ExecutionEvents } from './executionEvents';

export class ExecutionCoordinator {
  private queue = new ExecutionQueue();

  constructor(private events: ExecutionEvents) {}

  /**
   * Runs sequential queues, checks cancellation/pauses, and communicates with toolService.
   */
  public async executePlan(plan: any): Promise<ExecutionReport> {
    const start = Date.now();
    executionState.reset();
    executionState.status = 'Running' as any;
    this.events.emit(ExecutorEventType.ExecutionStarted, { planId: plan.id });

    // Checkpoint Support: Create workspace checkpoint before starting execution
    let checkpointId: string | undefined;
    try {
      const folders = vscode.workspace.workspaceFolders;
      const workspaceId = folders && folders.length > 0 ? folders[0].name : 'default-workspace';
      const transactionId = `tx-${plan.id}-${Date.now()}`;
      
      const affectedFiles: string[] = [];
      if (plan.tasks) {
        for (const t of plan.tasks) {
          if (t.affectedFiles) {
            affectedFiles.push(...t.affectedFiles);
          }
        }
      }

      const cp = checkpointService.createCheckpoint(
        workspaceId,
        transactionId,
        Array.from(new Set(affectedFiles)),
        { planId: plan.id }
      );
      checkpointId = cp.id;
      executionState.log(`Created workspace checkpoint: ${checkpointId}`);
    } catch (checkpointError: any) {
      executionState.log(`Warning: Failed to create workspace checkpoint: ${checkpointError.message}`);
    }

    this.queue.setQueue(plan.tasks || []);

    const completedTasks: string[] = [];
    const skippedTasks: string[] = [];
    const failedTasks: string[] = [];
    const toolUsage: string[] = [];
    const generatedArtifacts: string[] = [];

    const totalTasks = plan.tasks ? plan.tasks.length : 1;

    while (!this.queue.isEmpty()) {
      if (executionState.isCancelled) {
        executionState.status = 'Cancelled' as any;
        executionState.log('Plan execution cancelled by user request.');
        this.events.emit(ExecutorEventType.ExecutionCancelled, { planId: plan.id });
        break;
      }

      if (executionState.isPaused) {
        executionState.status = 'Paused' as any;
        executionState.log('Plan execution paused.');
        this.events.emit(ExecutorEventType.ExecutionPaused, { planId: plan.id });
        
        await new Promise<void>(resolve => {
          const interval = setInterval(() => {
            if (!executionState.isPaused || executionState.isCancelled) {
              clearInterval(interval);
              resolve();
            }
          }, 200);
        });
        if (executionState.isCancelled) continue;
        executionState.status = 'Running' as any;
        this.events.emit(ExecutorEventType.ExecutionResumed, { planId: plan.id });
      }

      const task = this.queue.next();
      if (!task) {
        break;
      }

      executionState.currentTaskId = task.id;
      executionState.log(`Starting execution for task: ${task.title}`);
      this.events.emit(ExecutorEventType.TaskStarted, { taskId: task.id });

      let attempts = 0;
      const maxAttempts = 3; // 1 initial + 2 retries
      let taskSuccess = false;
      let lastError: any = null;

      while (attempts < maxAttempts && !taskSuccess) {
        try {
          attempts++;
          const toolCall = executorBrain.resolveToolCall(task);
          this.events.emit(ExecutorEventType.ToolInvoked, { taskId: task.id, toolId: toolCall.toolId });
          
          executionState.log(`Invoking tool: "${toolCall.toolId}" (Attempt ${attempts}/${maxAttempts})`);
          const result = await toolService.executeTool(toolCall.toolId, toolCall.args);
          
          toolUsage.push(toolCall.toolId);
          if (toolCall.toolId === 'filesystem-tool' && task.affectedFiles.length > 0) {
            generatedArtifacts.push(task.affectedFiles[0]);
          }

          completedTasks.push(task.id);
          this.queue.dequeue(task.id);
          this.events.emit(ExecutorEventType.TaskCompleted, { taskId: task.id, result });
          taskSuccess = true;
        } catch (err: any) {
          lastError = err;
          executionState.log(`Attempt ${attempts} failed for task "${task.id}" with error: ${err.message}`);
          if (attempts < maxAttempts) {
            // Delay before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!taskSuccess) {
        failedTasks.push(task.id);
        this.events.emit(ExecutorEventType.TaskFailed, { taskId: task.id, error: lastError?.message || 'Task failed' });
        executionState.status = 'Failed' as any;
        break;
      }

      executionState.progress = Math.round((completedTasks.length / totalTasks) * 100);
    }

    if (executionState.status !== 'Failed' && executionState.status !== 'Cancelled') {
      executionState.status = 'Completed' as any;
    } else if (executionState.status === 'Failed' && checkpointId) {
      // Rollback trigger on execution failure
      try {
        executionState.log(`Triggering rollback to checkpoint: ${checkpointId}`);
        checkpointService.restoreCheckpoint(checkpointId);
        executionState.log('Rollback completed successfully.');
      } catch (rollbackError: any) {
        executionState.log(`Error during rollback: ${rollbackError.message}`);
      }
    }

    const latency = Date.now() - start;
    this.events.emit(ExecutorEventType.ExecutionCompleted, { planId: plan.id });

    return {
      executionId: `exec-${Date.now()}`,
      planId: plan.id,
      completedTasks,
      skippedTasks,
      failedTasks,
      executionTimeMs: latency,
      toolUsage,
      generatedArtifacts,
      logs: [...executionState.logs]
    };
  }
}
