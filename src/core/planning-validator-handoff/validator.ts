import { IPlanningContract } from '../planning-contract/types';
import { IValidationError, IValidationReport } from './types';
import { safetyValidator } from './safety';
import { planningContractValidator } from '../planning-contract/validator';

export class PlanningContractValidatorCoordinator {
  public validateContract(contract: IPlanningContract): IValidationReport {
    const errors: IValidationError[] = [];
    const warnings: string[] = [];

    // 1. Version validation
    if (!contract.contractVersion || !/^\d+\.\d+\.\d+$/.test(contract.contractVersion)) {
      errors.push({
        errorId: 'version-invalid',
        category: 'VERSION',
        description: `Unsupported planning contract version format: '${contract.contractVersion}'`,
        severity: 'CRITICAL',
        affectedTask: null,
        suggestedResolution: 'Regenerate plan contract with standard semantic version (e.g. 1.0.0).'
      });
    }

    // 2. Invoke base planning validator schema and dependency validation rules
    const baseResult = planningContractValidator.validate(contract);
    for (const baseErr of baseResult.errors) {
      let category: 'SCHEMA' | 'DEPENDENCY' | 'EXECUTION' = 'SCHEMA';
      if (baseErr.includes('dependency') || baseErr.includes('references')) {
        category = 'DEPENDENCY';
      }
      errors.push({
        errorId: `base-err-${errors.length}`,
        category,
        description: baseErr,
        severity: 'CRITICAL',
        affectedTask: null,
        suggestedResolution: 'Correct task dependencies structure and schema fields.'
      });
    }

    for (const baseWarn of baseResult.warnings) {
      warnings.push(baseWarn);
    }

    // 3. Task details validation
    for (const task of contract.taskGraph) {
      if (!task.taskId || !task.taskName || !task.description || !task.expectedOutput || !task.owner) {
        errors.push({
          errorId: `task-incomplete-${task.taskId}`,
          category: 'TASK',
          description: `Task '${task.taskId || 'unknown'}' contains incomplete fields (missing ID, name, description, output or owner).`,
          severity: 'CRITICAL',
          affectedTask: task.taskId || null,
          suggestedResolution: 'Fully specify description, expectedOutput, and owner parameters in all tasks.'
        });
      }
    }

    // 4. Safety Validation
    const safetyErrors = safetyValidator.validateSafety(contract.taskGraph);
    for (const sErr of safetyErrors) {
      errors.push(sErr);
    }

    // 5. Warnings checks (non-blocking features warnings)
    if (!contract.executionPhases.some(p => p.phaseName.toLowerCase().includes('test'))) {
      warnings.push('Testing phase absent.');
    }
    if (!contract.executionPhases.some(p => p.phaseName.toLowerCase().includes('doc'))) {
      warnings.push('Documentation phase absent.');
    }

    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings)
    };
  }
}

export const planningContractValidatorCoordinator = new PlanningContractValidatorCoordinator();
export default planningContractValidatorCoordinator;
