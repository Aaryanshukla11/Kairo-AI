export type ConstraintType =
  | 'Must Run Before'
  | 'Must Run After'
  | 'Mutually Exclusive'
  | 'Requires Approval'
  | 'Requires Checkpoint'
  | 'Resource Locked';

export interface TaskConstraint {
  constraintId: string;
  taskId: string;
  type: ConstraintType;
  targetTaskId?: string;
  description: string;
  isSatisfied: boolean;
}
