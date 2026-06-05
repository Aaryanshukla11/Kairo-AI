export type HTNLevel = 'Feature' | 'Milestone' | 'Task' | 'Subtask' | 'Atomic Action';

export interface HTNNode {
  id: string;
  level: HTNLevel;
  title: string;
  objective: string;
  preconditions: string[];
  postconditions: string[];
  dependencies: string[];
  successCriteria: string[];
  failureRecovery: string;
  children: HTNNode[];
}
