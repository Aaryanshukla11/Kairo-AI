import { WorkflowContextModel } from './workflowTypes';

export class WorkflowContextManager {
  createContext(workflowId: string, initialVariables: Record<string, any> = {}): WorkflowContextModel {
    return {
      workflowId,
      startTime: Date.now(),
      variables: { ...initialVariables },
      environment: 'production-emulator',
      sessionToken: `sess-${workflowId}-${Date.now()}`
    };
  }
}

export const workflowContextManager = new WorkflowContextManager();
