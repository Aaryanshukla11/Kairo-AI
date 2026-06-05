import { ActionType } from './ActionType';

export interface PlanStep {
  stepId: string;
  title: string;
  description: string;
  actionType: ActionType;
  target: string;
  status: string; // E.g., PENDING, IN_PROGRESS, COMPLETED, FAILED
  futureDependencies: string[];
  estimatedDuration: number;
}
