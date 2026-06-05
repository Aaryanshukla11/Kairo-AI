export class TrainingValidator {
  public validateInputs(
    datasetVersion: string,
    tokenizerVersion: string,
    config: any,
    checkpoint: any,
    hardware: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Dataset valid check
    if (!datasetVersion || datasetVersion.length === 0) {
      errors.push('Validation Error: Dataset version must be a valid non-empty string.');
    }

    // 2. Tokenizer compatible check
    if (!tokenizerVersion || tokenizerVersion.length === 0) {
      errors.push('Validation Error: Tokenizer version must be a valid non-empty string.');
    }

    // 3. Configuration valid check
    if (!config || !config.hyperparameters) {
      errors.push('Validation Error: Training configuration has invalid or missing hyperparameters.');
    }

    // 4. Checkpoint valid check
    if (checkpoint && (!checkpoint.checkpointId || checkpoint.trainingStep === undefined)) {
      errors.push('Validation Error: Restorable checkpoint contains malformed configurations.');
    }

    // 5. Hardware compatible check
    if (!hardware || !hardware.deviceType) {
      errors.push('Validation Error: Hardware profile is required to check GPU compatibility.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const trainingValidator = new TrainingValidator();
export default trainingValidator;
