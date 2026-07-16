import { ApprovalRequest } from './ApprovalRequest';
import { RiskLevel } from '../planner/RiskLevel';

export interface ApprovalValidationResult {
  valid: boolean;
  errors: string[];
}

export class ApprovalValidator {
  public static validate(request: ApprovalRequest): ApprovalValidationResult {
    const errors: string[] = [];

    if (!request) {
      return { valid: false, errors: ['ApprovalRequest cannot be null.'] };
    }

    if (!request.id) errors.push('Approval Request must have an ID.');
    if (!request.planId) errors.push('Missing Plan ID.');
    if (!Object.values(RiskLevel).includes(request.riskLevel)) {
      errors.push('Invalid Risk Level.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
