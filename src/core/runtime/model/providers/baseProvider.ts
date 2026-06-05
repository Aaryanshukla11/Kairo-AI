import { PromptPackage } from '../../../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, InferenceResult } from '../runtimeTypes';

export interface ModelProvider {
  name: string;
  loadModel(modelConfig: ModelConfig): Promise<void>;
  unloadModel(): Promise<void>;
  generate(
    promptPkg: PromptPackage,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult>;
}
