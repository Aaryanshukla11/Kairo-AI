import { ModelProvider } from './providers/baseProvider';
import { MockProvider } from './providers/mockProvider';
import { LlamaCppProvider } from './providers/llamaCppProvider';
import { OnnxProvider } from './providers/onnxProvider';
import { GgufProvider } from './providers/ggufProvider';
import { MlxProvider } from './providers/mlxProvider';

export class RuntimeRegistry {
  private providers = new Map<string, ModelProvider>();

  constructor() {
    // Register base providers
    this.registerProvider('MockProvider', new MockProvider());
    this.registerProvider('llama.cpp', new LlamaCppProvider());
    this.registerProvider('onnx', new OnnxProvider());
    this.registerProvider('gguf', new GgufProvider());
    this.registerProvider('mlx', new MlxProvider());
  }

  public registerProvider(name: string, provider: ModelProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  public getProvider(name: string): ModelProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  public listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const runtimeRegistry = new RuntimeRegistry();
