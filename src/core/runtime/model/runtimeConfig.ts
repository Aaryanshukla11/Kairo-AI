import { ModelConfig } from './runtimeTypes';

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    modelId: 'qwen-2.5-7b-coder',
    name: 'Qwen 2.5 7B Coder (GGUF Mock)',
    provider: 'MockProvider',
    contextWindow: 32768,
    parametersCount: '7B',
    fileSizeGb: 4.5
  },
  {
    modelId: 'llama-3-8b-instruct',
    name: 'Llama 3 8B Instruct (GGUF Mock)',
    provider: 'MockProvider',
    contextWindow: 8192,
    parametersCount: '8B',
    fileSizeGb: 4.9
  }
];

export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048
};
