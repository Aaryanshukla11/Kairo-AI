import { Plan } from '../../common/planner';

export enum PlannerEventType {
  PLAN_CREATED = 'PLAN_CREATED',
  PLAN_ANALYZING = 'PLAN_ANALYZING',
  PLAN_READY = 'PLAN_READY',
  PLAN_REJECTED = 'PLAN_REJECTED'
}

export interface PlannerEvent {
  type: PlannerEventType;
  plan: Plan;
  timestamp: number;
}
