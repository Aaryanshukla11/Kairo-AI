import { PromptPackage } from '../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, ModelState, HealthReport } from './runtimeTypes';

export class RuntimeValidator {
  public validateInference(
    promptPkg: PromptPackage,
    state: ModelState,
    modelConfig: ModelConfig,
    promptTokens: number
  ): void {
    if (!promptPkg.userPrompt || !promptPkg.userPrompt.trim()) {
      throw new Error('Model runtime validation error: Prompt is required and cannot be empty');
    }

    if (state !== ModelState.Ready && state !== ModelState.Running && state !== ModelState.Idle && state !== ModelState.Loaded) {
      throw new Error(`Model runtime validation error: Model is not loaded. Current state is: ${state}`);
    }

    if (promptTokens > modelConfig.contextWindow) {
      throw new Error(
        `Model runtime validation error: Oversized context: Prompt contains ${promptTokens} tokens, which exceeds model context window of ${modelConfig.contextWindow}`
      );
    }
  }

  public validateConfig(config: GenerationConfig): void {
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2.0)) {
      throw new Error('Model runtime validation error: Temperature must be between 0.0 and 2.0');
    }
    if (config.topP !== undefined && (config.topP < 0 || config.topP > 1.0)) {
      throw new Error('Model runtime validation error: TopP must be between 0.0 and 1.0');
    }
  }

  public validateModelConfig(config: ModelConfig): void {
    if (!config.modelId) {
      throw new Error('Model runtime validation error: Model ID is required');
    }
    if (!config.name) {
      throw new Error('Model runtime validation error: Model name is required');
    }
    if (!config.provider) {
      throw new Error('Model runtime validation error: Model provider is required');
    }
    if (!config.contextWindow || config.contextWindow <= 0) {
      throw new Error('Model runtime validation error: Context window must be positive');
    }
  }

  public validateHealth(health: HealthReport): void {
    if (health.status === 'Unhealthy') {
      throw new Error(`Model runtime validation error: Runtime is unhealthy: ${health.details || 'Unknown error'}`);
    }
  }
}

export const runtimeValidator = new RuntimeValidator();
