export interface DogfoodingEventLog {
  stepName: string;
  status: 'Pending' | 'Success' | 'Failed';
  timestamp: number;
  details?: string;
}

export class WorkflowRecorder {
  private events: DogfoodingEventLog[] = [];

  public logStep(stepName: string, status: 'Pending' | 'Success' | 'Failed', details?: string): void {
    this.events.push({
      stepName,
      status,
      timestamp: Date.now(),
      details
    });
  }

  public getLogs(): DogfoodingEventLog[] {
    return [...this.events];
  }

  public clear(): void {
    this.events = [];
  }
}

export const workflowRecorder = new WorkflowRecorder();
