import { FineTuningMethod, TrainableParametersReport, LoRAConfig, QLoRAConfig } from './fineTuningTypes';
import { loraProvider, qloraProvider, fullFineTuneProvider, continuedPretrainingProvider, instructionTuningProvider, mockFineTuningProvider } from './providers';

export class AdaptationStrategy {
  public calculateParameters(
    method: FineTuningMethod,
    modelParameters: number,
    loraConfig?: LoRAConfig,
    qloraConfig?: QLoRAConfig
  ): TrainableParametersReport {
    switch (method) {
      case 'lora':
        if (!loraConfig) {
          throw new Error('LoRA configuration is required for lora method.');
        }
        return loraProvider.configureLoRA(loraConfig, modelParameters);
      case 'qlora':
        if (!qloraConfig) {
          throw new Error('QLoRA configuration is required for qlora method.');
        }
        return qloraProvider.configureQLoRA(qloraConfig, modelParameters);
      case 'full':
        return fullFineTuneProvider.configureFull(modelParameters);
      case 'continued_pretraining':
        return continuedPretrainingProvider.configureContinuedPretraining(modelParameters);
      case 'instruction_tuning':
        return instructionTuningProvider.configureInstructionTuning(modelParameters);
      default:
        return mockFineTuningProvider.configureMock(modelParameters);
    }
  }
}

export const adaptationStrategy = new AdaptationStrategy();
export default adaptationStrategy;
