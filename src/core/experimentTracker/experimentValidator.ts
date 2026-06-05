import { ExperimentModel } from './experimentTypes';

export class ExperimentValidator {
  public validate(experiment: ExperimentModel): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Artifacts exist check
    if (experiment.artifacts.length === 0) {
      errors.push('Validation Error: Experiment must register at least one artifact (e.g. weights, configs, or logs).');
    }

    // 2. Configurations valid check
    if (!experiment.trainingConfiguration) {
      errors.push('Validation Error: Training configuration parameters are required.');
    }

    // 3. Dataset compatible check
    if (!experiment.datasetVersion) {
      errors.push('Validation Error: Incompatible dataset. Dataset version is required.');
    }

    // 4. Tokenizer compatible check
    if (!experiment.tokenizerVersion) {
      errors.push('Validation Error: Incompatible tokenizer. Tokenizer version is required.');
    }

    // 5. Checkpoint valid check
    if (experiment.experimentType.includes('tuning') && !experiment.checkpointVersion) {
      errors.push('Validation Error: tuning experiments require a valid parent checkpoint version.');
    }

    // 6. Replay reproducible check
    if (experiment.randomSeed === undefined || experiment.randomSeed < 0) {
      errors.push('Validation Error: Random seed is missing or invalid for replay reproducibility.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const experimentValidator = new ExperimentValidator();
export default experimentValidator;
