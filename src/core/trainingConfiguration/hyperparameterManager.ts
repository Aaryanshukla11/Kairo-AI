import { TrainingHyperparameters } from './configurationTypes';
import {
  pretrainingProvider,
  finetuningProvider,
  instructionTuningProvider,
  evaluationProvider,
  customTrainingProvider
} from './providers';

export class HyperparameterManager {
  public resolveTemplate(type: string): TrainingHyperparameters {
    switch (type) {
      case 'Pretraining':
        return pretrainingProvider.getTemplate();
      case 'Fine-tuning':
        return finetuningProvider.getTemplate();
      case 'Instruction Tuning':
        return instructionTuningProvider.getTemplate();
      case 'Evaluation':
        return evaluationProvider.getTemplate();
      default:
        return customTrainingProvider.getTemplate();
    }
  }

  public customize(template: TrainingHyperparameters, overrides: Partial<TrainingHyperparameters>): TrainingHyperparameters {
    return {
      ...template,
      ...overrides
    };
  }
}

export const hyperparameterManager = new HyperparameterManager();
export default hyperparameterManager;
