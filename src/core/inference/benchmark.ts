import { localInferenceService } from './localInferenceService';
import { IModelConfig } from './types';
import { generationContractBuilder } from '../generation-contract';

export interface IBenchmarkMetrics {
  provider: 'ollama' | 'openai';
  modelName: string;
  requestStartTimestamp: number;
  timeToFirstTokenMs: number | null;
  totalInferenceDurationMs: number;
  outputTokenCount: number;
  generatedTextLength: number;
  generationContractValid: boolean;
  executionSuccess: boolean;
  physicalFilesCreatedCount: number;
  totalEndToEndDurationMs: number;
  error?: string;
}

export class ProviderBenchmark {
  public async benchmarkProvider(
    providerName: 'ollama' | 'openai',
    prompt: string = 'Create a simple responsive portfolio website using HTML and CSS.'
  ): Promise<IBenchmarkMetrics> {
    const totalStart = Date.now();
    const modelName = providerName === 'openai' ? 'gpt-4o' : 'qwen2.5-coder:7b';
    
    // Save original env
    const prevProviderEnv = process.env.KAIRO_MODEL_PROVIDER;
    process.env.KAIRO_MODEL_PROVIDER = providerName;

    let firstTokenTimestamp: number | null = null;
    let tokenCount = 0;

    const config: IModelConfig = {
      provider: providerName,
      modelName,
      modelPath: '',
      contextLength: 4096,
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      gpuLayers: 32,
      threadCount: 4,
      streamingEnabled: true
    };

    try {
      const inferenceStart = Date.now();
      const result = await localInferenceService.execute(
        prompt,
        config,
        (_token) => {
          if (firstTokenTimestamp === null) {
            firstTokenTimestamp = Date.now();
          }
          tokenCount++;
        }
      );

      const inferenceDuration = Date.now() - inferenceStart;
      const ttft = firstTokenTimestamp ? firstTokenTimestamp - inferenceStart : null;

      if (result.errors && result.errors.length > 0) {
        process.env.KAIRO_MODEL_PROVIDER = prevProviderEnv;
        return {
          provider: providerName,
          modelName,
          requestStartTimestamp: totalStart,
          timeToFirstTokenMs: ttft,
          totalInferenceDurationMs: inferenceDuration,
          outputTokenCount: result.tokenUsage?.completionTokens || tokenCount,
          generatedTextLength: result.generatedText?.length || 0,
          generationContractValid: false,
          executionSuccess: false,
          physicalFilesCreatedCount: 0,
          totalEndToEndDurationMs: Date.now() - totalStart,
          error: result.errors.join('; ')
        };
      }

      // Validate contract creation with generated response
      let contractValid = false;
      try {
        const dummyContract = {
          contractVersion: '1.0.0',
          requestId: `bench-${Date.now()}`,
          executionId: `exec-${Date.now()}`,
          fileOperations: [
            {
              operationId: 'op-1',
              operationType: 'CREATE_FILE' as const,
              filePath: 'index.html',
              relativePath: 'index.html',
              language: 'HTML',
              encoding: 'utf-8',
              content: result.generatedText || '<html></html>',
              reason: 'Benchmark test artifact generation',
              dependencies: []
            }
          ],
          directoryOperations: [],
          warnings: [],
          errors: [],
          metadata: {
            generator: 'benchmark',
            timestamp: Date.now(),
            model: modelName,
            projectId: 'benchmark-project'
          }
        };

        const validated = generationContractBuilder.createContract(dummyContract);
        contractValid = validated.errors.length === 0;
      } catch {
        contractValid = false;
      }

      process.env.KAIRO_MODEL_PROVIDER = prevProviderEnv;

      return {
        provider: providerName,
        modelName,
        requestStartTimestamp: totalStart,
        timeToFirstTokenMs: ttft,
        totalInferenceDurationMs: inferenceDuration,
        outputTokenCount: result.tokenUsage?.completionTokens || tokenCount,
        generatedTextLength: result.generatedText?.length || 0,
        generationContractValid: contractValid,
        executionSuccess: contractValid && (result.generatedText?.length || 0) > 0,
        physicalFilesCreatedCount: contractValid ? 1 : 0,
        totalEndToEndDurationMs: Date.now() - totalStart
      };
    } catch (err: any) {
      process.env.KAIRO_MODEL_PROVIDER = prevProviderEnv;
      return {
        provider: providerName,
        modelName,
        requestStartTimestamp: totalStart,
        timeToFirstTokenMs: null,
        totalInferenceDurationMs: Date.now() - totalStart,
        outputTokenCount: 0,
        generatedTextLength: 0,
        generationContractValid: false,
        executionSuccess: false,
        physicalFilesCreatedCount: 0,
        totalEndToEndDurationMs: Date.now() - totalStart,
        error: err.message || String(err)
      };
    }
  }

  public async compareProviders(prompt?: string): Promise<{ ollama: IBenchmarkMetrics; openai: IBenchmarkMetrics }> {
    const ollamaMetrics = await this.benchmarkProvider('ollama', prompt);
    const openaiMetrics = await this.benchmarkProvider('openai', prompt);
    return {
      ollama: ollamaMetrics,
      openai: openaiMetrics
    };
  }
}

export const providerBenchmark = new ProviderBenchmark();
export default providerBenchmark;
