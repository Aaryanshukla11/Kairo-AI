import { TrainingSessionModel } from '../trainingEngine/trainingTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { ValidationMode } from './validationTypes';

export class ValidationScheduler {
  public shouldTriggerValidation(
    mode: ValidationMode,
    session: TrainingSessionModel,
    config: TrainingConfigModel
  ): boolean {
    const step = session.currentStep;
    if (step <= 0) {
      return false;
    }

    switch (mode) {
      case 'epoch_end': {
        const stepsPerEpoch = Math.ceil(session.totalSteps / session.totalEpochs);
        return step % stepsPerEpoch === 0;
      }
      case 'fixed_interval': {
        const frequency = config.evaluationFrequency || 100;
        return step % frequency === 0;
      }
      case 'checkpoint':
        // Whenever checkpoint is created, usually evaluated at scheduling time
        return session.checkpointId !== undefined && session.checkpointId !== '';
      case 'manual':
      case 'continuous':
        return true;
      default:
        return false;
    }
  }
}

export const validationScheduler = new ValidationScheduler();
export default validationScheduler;
