import { WorkflowRetryItem, RetryPolicyType } from './workflowTypes';

export class WorkflowRetryManager {
  createRetryItem(workflowId: string, stageId: string, attempt: number, maxAttempts: number = 3, policy: RetryPolicyType = RetryPolicyType.ExponentialBackoff, error?: string): WorkflowRetryItem {
    let delayMs = 1000;
    if (policy === RetryPolicyType.ExponentialBackoff) {
      delayMs = Math.pow(2, attempt) * 1000;
    } else if (policy === RetryPolicyType.Immediate) {
      delayMs = 0;
    }

    return {
      id: `retry-${stageId}-${attempt}`,
      workflowId,
      stageId,
      attempt,
      maxAttempts,
      policy,
      delayMs,
      lastError: error || 'Execution transient timeout',
      timestamp: Date.now()
    };
  }
}

export const workflowRetryManager = new WorkflowRetryManager();
