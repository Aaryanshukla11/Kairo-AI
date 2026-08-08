export interface IModelConfig {
  readonly provider: string;
  readonly modelName: string;
  readonly modelPath: string;
  readonly contextLength: number;
  readonly temperature: number;
  readonly topP: number;
  readonly topK: number;
  readonly maxTokens: number;
  readonly gpuLayers: number;
  readonly threadCount: number;
  readonly streamingEnabled: boolean;
}

export interface ILocalInferenceSession {
  readonly requestId: string;
  readonly modelName: string;
  readonly providerName: string;
  readonly prompt: string;
  readonly systemPrompt?: string;
  readonly parameters: Record<string, any>;
  readonly metadata: Record<string, any>;
}

export interface ITokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface ILocalInferenceResult {
  readonly generatedText: string;
  readonly tokenUsage: ITokenUsage;
  readonly executionTimeMs: number;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly providerInfo: {
    readonly providerName: string;
    readonly modelName: string;
  };
}

export interface ILocalInferenceProvider {
  readonly name: string;
  execute(
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult>;
}
