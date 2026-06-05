import { ModelConfig } from './runtimeTypes';

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    modelId: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    parametersCount: 'Cloud',
    fileSizeGb: 0
  },
  {
    modelId: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    provider: 'Ollama',
    contextWindow: 32768,
    parametersCount: '7B',
    fileSizeGb: 4.5
  },
  {
    modelId: 'nomic-embed-text',
    name: 'Nomic Embed Text',
    provider: 'Ollama',
    contextWindow: 8192,
    parametersCount: '137M',
    fileSizeGb: 0.28
  }
];

export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048
};
