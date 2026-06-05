import { randomUUID } from 'crypto';
import { ExecutionGraph } from '../executionGraph/graphTypes';
import { ExecutionNode, NodeStatus } from '../executionGraph/node';
import { graphEngine } from '../executionGraph/graphEngine';
import { executorValidator } from './executorValidator';
import { ExecutorQueue } from './executorQueue';
import { ExecutionContext } from './executionContext';
import { ExecutorState, ExecutorProgress } from './executorTypes';
import { ExecutorEventType, ExecutorEvent, ExecutorEventListener } from './executorEvents';

export class ExecutorEngine {
  private id = randomUUID();
  private state = ExecutorState.Idle;
  private currentGraph: ExecutionGraph | null = null;
  private queue = new ExecutorQueue();
  private context = new ExecutionContext();
  private listeners = new Set<ExecutorEventListener>();
  private isPaused = false;
  private isCancelled = false;

  public getId(): string {
    return this.id;
  }

  public getState(): ExecutorState {
    return this.state;
  }

  /**
   * Subscribes to executor events.
   */
  public subscribe(listener: ExecutorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: ExecutorEventType, payload?: any): void {
    const event: ExecutorEvent = {
      type,
      executorId: this.id,
      graphId: this.currentGraph?.id || '',
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in executor event listener:', err);
      }
    }
  }

  /**
   * Initializes and executes the given dependency graph sequentially.
   */
  public async execute(graph: ExecutionGraph): Promise<void> {
    executorValidator.validateGraphForExecution(graph);
    executorValidator.validateStateForStart(this.state);

    this.currentGraph = graph;
    this.state = ExecutorState.Preparing;
    this.isPaused = false;
    this.isCancelled = false;
    this.context.clear();
    
    this.context.log(`Initializing execution for graph ${graph.id}`);
    
    const orderedNodes = graphEngine.getExecutionOrder(graph);
    
    orderedNodes.forEach(node => {
      node.status = NodeStatus.Waiting;
    });

    this.queue.initialize(orderedNodes);
    
    this.state = ExecutorState.Running;
    this.emit(ExecutorEventType.ExecutionStarted);

    this.context.log('Execution loop started');
    
    // We launch this asynchronously so we don't block the extension host
    this.runLoop().catch(err => {
      console.error('[ExecutorEngine] Execution loop failed:', err);
    });
  }

  private async runLoop(): Promise<void> {
    while (this.state === ExecutorState.Running) {
      if (this.isPaused) {
        this.state = ExecutorState.Paused;
        this.emit(ExecutorEventType.ExecutionPaused);
        return;
      }

      if (this.isCancelled) {
        this.state = ExecutorState.Cancelled;
        this.emit(ExecutorEventType.ExecutionCancelled);
        return;
      }

      const nextNode = this.queue.getNext();
      if (!nextNode) {
        this.state = ExecutorState.Completed;
        this.emit(ExecutorEventType.ExecutionCompleted);
        this.context.log('Execution completed successfully');
        return;
      }

      await this.executeNode(nextNode);
    }
  }

  private async executeNode(node: ExecutionNode): Promise<void> {
    this.context.log(`Starting step ${node.id}: ${node.title}`);
    node.status = NodeStatus.Running;
    this.emit(ExecutorEventType.NodeStarted, { node });

    try {
      // Safe state machine trace delay (no terminal commands or file changes)
      const delayTime = 500;
      await new Promise(resolve => setTimeout(resolve, delayTime));

      // Check for pause/cancellation immediately after the step completes
      if (this.isCancelled) {
        node.status = NodeStatus.Skipped;
        return;
      }

      node.status = NodeStatus.Completed;
      this.emit(ExecutorEventType.NodeCompleted, { node });
      this.context.log(`Completed step ${node.id}: ${node.title}`);
    } catch (err: any) {
      node.status = NodeStatus.Failed;
      this.state = ExecutorState.Failed;
      this.emit(ExecutorEventType.NodeFailed, { node, error: err.message });
      this.emit(ExecutorEventType.ExecutionCompleted);
      this.context.log(`Failed step ${node.id}: ${node.title} - ${err.message}`);
      throw err;
    }
  }

  /**
   * Pauses active execution.
   */
  public pause(): void {
    if (this.state === ExecutorState.Running) {
      this.isPaused = true;
      this.context.log('Execution pause requested');
    }
  }

  /**
   * Resumes paused execution.
   */
  public resume(): void {
    if (this.state === ExecutorState.Paused) {
      this.isPaused = false;
      this.state = ExecutorState.Running;
      this.emit(ExecutorEventType.ExecutionResumed);
      this.context.log('Execution resumed');
      this.runLoop().catch(err => {
        console.error('Error resuming execution loop:', err);
      });
    }
  }

  /**
   * Cancels active execution.
   */
  public cancel(): void {
    if (
      this.state === ExecutorState.Running || 
      this.state === ExecutorState.Paused
    ) {
      this.isCancelled = true;
      this.isPaused = false;
      this.state = ExecutorState.Cancelled;
      this.emit(ExecutorEventType.ExecutionCancelled);
      this.context.log('Execution cancelled');
    }
  }

  /**
   * Compiles the progress metrics of current execution.
   */
  public getProgress(): ExecutorProgress {
    const nodes = this.queue.getNodes();
    const totalSteps = nodes.length;
    const completedSteps = nodes.filter(n => n.status === NodeStatus.Completed).length;
    const runningNode = nodes.find(n => n.status === NodeStatus.Running);
    const remainingSteps = totalSteps - completedSteps;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      status: this.state,
      currentStepId: runningNode?.id || null,
      currentStepTitle: runningNode?.title || null,
      completedSteps,
      remainingSteps,
      totalSteps,
      progressPercent
    };
  }

  public getLogs(): string[] {
    return this.context.getLogs();
  }
}
