import { OptimizerStateModel, LrScheduleType, ValidationReportModel } from './optimizerTypes';

export class OptimizerValidator {
  public validate(
    state: OptimizerStateModel,
    scheduler: LrScheduleType
  ): ValidationReportModel {
    const errors: string[] = [];

    // 1. Valid optimizer type
    const allowedOpt = ['Adam', 'AdamW', 'SGD', 'Lion', 'Future Optimizers'];
    if (!allowedOpt.includes(state.optimizerType)) {
      errors.push(`Validation Error: Unsupported optimizer type [${state.optimizerType}].`);
    }

    // 2. Compatible scheduler
    const allowedSch = [
      'Constant',
      'Linear',
      'Cosine',
      'Cosine Restart',
      'Polynomial',
      'Exponential',
      'Step Decay',
      'Custom Scheduler'
    ];
    if (!allowedSch.includes(scheduler)) {
      errors.push(`Validation Error: Unsupported learning rate scheduler [${scheduler}].`);
    }

    // 3. Learning rate range check
    if (state.learningRate <= 0 || state.learningRate > 10.0) {
      errors.push(`Validation Error: Out of bounds learning rate [${state.learningRate}].`);
    }

    // 4. State integrity checks
    if (state.stepCount < 0) {
      errors.push('Validation Error: Step count cannot be negative.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const optimizerValidator = new OptimizerValidator();
export default optimizerValidator;
