import { FailureType } from './recoveryTypes';

export class FailureClassifier {
  classify(errMessage?: string, stageId?: string): FailureType {
    const msg = (errMessage || '').toLowerCase();
    if (msg.includes('timeout')) return FailureType.Timeout;
    if (msg.includes('policy') || msg.includes('permission')) return FailureType.PolicyFailure;
    if (msg.includes('dependency') || msg.includes('cycle')) return FailureType.DependencyFailure;
    if (msg.includes('workspace') || msg.includes('file')) return FailureType.WorkspaceFailure;
    if (msg.includes('memory') || msg.includes('resource')) return FailureType.ResourceFailure;
    if (msg.includes('validation')) return FailureType.ValidationFailure;
    if (msg.includes('cancel')) return FailureType.UserCancellation;

    return FailureType.ExecutionFailure;
  }
}

export const failureClassifier = new FailureClassifier();
