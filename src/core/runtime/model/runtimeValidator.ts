import { PromptPackage } from '../../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, ModelState } from './runtimeTypes';

export class RuntimeValidator {
  /**
   * Validates model state, context windows, and prompt content.
   */
  public validateInference(promptPkg: PromptPackage, state: ModelState, modelConfig: ModelConfig, promptTokens: number): void {
    if (!promptPkg.userPrompt || !promptPkg.userPrompt.trim()) {
      throw new Error('Model runtime validation error: Prompt is required and cannot be empty');
    }

    if (state !== ModelState.Ready) {
      throw new Error(`Model runtime validation error: Model is not loaded. Current state is: ${state}`);
    }

    if (promptTokens > modelConfig.contextWindow) {
      throw new Error(`Model runtime validation error: Oversized context: Prompt contains ${promptTokens} tokens, which exceeds model context window of ${modelConfig.contextWindow}`);
    }
  }

  /**
   * Asserts config limits.
   */
  public validateConfig(config: GenerationConfig): void {
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2.0)) {
      throw new Error('Model runtime validation error: Temperature must be between 0.0 and 2.0');
    }
    if (config.topP !== undefined && (config.topP < 0 || config.topP > 1.0)) {
      throw new Error('Model runtime validation error: TopP must be between 0.0 and 1.0');
    }
  }
}

export const runtimeValidator = new RuntimeValidator();
