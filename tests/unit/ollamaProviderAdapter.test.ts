import * as assert from 'assert';
import { OllamaPlanningProviderAdapter, OllamaCodingProviderAdapter } from '../../src/core/inference/providers/ollamaAdapter';
import { localInferenceService, providerRegistry, OllamaProvider } from '../../src/core/inference';
import { pipelineControllerFacade } from '../../src/core/pipeline-controller';

describe('Sprint 4A - Ollama Provider Adapter & Migration Tests', () => {
  let originalExecute: any;

  before(() => {
    originalExecute = localInferenceService.execute;
  });

  after(() => {
    localInferenceService.execute = originalExecute;
  });

  it('should delegate planning request to localInferenceService using adapter', async () => {
    localInferenceService.execute = async () => ({
      generatedText: '{"tasks":[]}',
      tokenUsage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      executionTimeMs: 5,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    });

    const adapter = new OllamaPlanningProviderAdapter();
    const res = await adapter.execute({ userPromptPayload: 'Hello', sessionId: '1' } as any);
    assert.strictEqual(res, '{"tasks":[]}');
  });

  it('should stream coding request via adapter and trigger onChunk callback', async () => {
    localInferenceService.execute = async (prompt, config, onChunk) => {
      if (onChunk) onChunk('chunk-data');
      return {
        generatedText: 'complete-code',
        tokenUsage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        executionTimeMs: 5,
        warnings: [],
        errors: [],
        providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
      };
    };

    const adapter = new OllamaCodingProviderAdapter();
    const chunks: string[] = [];
    const res = await adapter.executeStream(
      { userPromptPayload: 'Generate code', sessionId: '2' } as any,
      (c) => chunks.push(c)
    );

    assert.strictEqual(res, 'complete-code');
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0], 'chunk-data');
  });

  it('should throw structured error if Ollama server is not running and no mock fallback exists', async () => {
    // Force Ollama status check to fail
    const ollama = providerRegistry.getProvider('ollama') as OllamaProvider;
    const originalIsRunning = ollama.isServerRunning;
    ollama.isServerRunning = async () => false;

    try {
      await assert.rejects(
        pipelineControllerFacade.runPipeline('Create Calculator using HTML CSS', 'c:/mock'),
        /Ollama is not running/
      );
    } finally {
      ollama.isServerRunning = originalIsRunning;
    }
  });

});
