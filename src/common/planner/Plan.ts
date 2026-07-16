import { PlanStatus } from './PlanStatus';
import { PlanStep } from './PlanStep';
import { RiskLevel } from './RiskLevel';
import { PlanMetadata } from './PlanMetadata';

export interface Plan {
  readonly id: string;
  readonly sessionId: string;
  readonly promptId: string;
  readonly createdAt: number;
  readonly status: PlanStatus;
  readonly summary: string;
  readonly estimatedSteps: number;
  readonly estimatedDuration: number;
  readonly riskLevel: RiskLevel;
  readonly approvalRequired: boolean;
  readonly steps: PlanStep[];
  readonly metadata: PlanMetadata;
}
