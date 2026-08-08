import { IGenerationContract } from '../generation-contract/types';

export interface IValidationIssue {
  readonly code: string;
  readonly severity: 'ERROR' | 'WARNING';
  readonly message: string;
  readonly path?: string;
}

export interface IValidationReport {
  readonly isValid: boolean;
  readonly timestamp: number;
  readonly issues: readonly IValidationIssue[];
}

export interface IValidationResult {
  readonly report: IValidationReport;
  readonly validatedContract: IGenerationContract | null;
}
