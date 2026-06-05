import * as assert from 'assert';
import { pipelineRouter } from '../../src/core/orchestrator/pipelineRouter';
import { IAIKernelCompiledRequest } from '../../src/core/ai-kernel/types';

const expect = (actual: any) => ({
  toBe: (expected: any) => assert.strictEqual(actual, expected),
  toEqual: (expected: any) => assert.deepStrictEqual(actual, expected),
  toContain: (expected: any) => {
    if (typeof actual === 'string') {
      assert.ok(actual.includes(expected), `Expected '${actual}' to contain '${expected}'`);
    } else if (Array.isArray(actual)) {
      assert.ok(actual.includes(expected), `Expected array to contain '${expected}'`);
    }
  }
});

describe('Ollama Optimization #2 — Adaptive Generation Budget & Safety', () => {
  const createMockReq = (prompt: string): IAIKernelCompiledRequest => ({
    requestId: `req-${Date.now()}`,
    timestamp: Date.now(),
    rawPrompt: prompt,
    normalizedPrompt: prompt.toLowerCase(),
    intent: 'NEW_PROJECT' as any,
    promptContext: {
      id: `ctx-${Date.now()}`,
      timestamp: Date.now(),
      rawPrompt: prompt,
      normalizedPrompt: prompt.toLowerCase(),
      intent: 'NEW_PROJECT',
      confidence: 1.0,
      projectInfo: { name: 'Test', type: 'WEB' },
      workspaceInfo: { isEmpty: true, isProjectPresent: false, isMonorepo: false, hasGit: false },
      detectedTechnologies: {
        language: null, frontend: null, backend: null, database: null, authMethod: null,
        apiStyle: null, uiFramework: null, cssFramework: null, stateManagement: null, buildTool: null
      },
      detectedFeatures: [],
      existingFiles: [],
      dependencies: {},
      warnings: [],
      metadata: { length: prompt.length, lineCount: 1, hasMarkdown: false }
    } as any,
    aiRequest: {} as any,
    memories: [],
    knowledge: { indexedFiles: [], relevantSymbols: [], matchedContext: [] },
    routingDecision: {
      requestId: `req-${Date.now()}`,
      selectedModel: { modelId: 'qwen2.5-coder:7b', name: 'Qwen 7B', type: 'Coding Model' },
      modelType: 'Coding Model',
      reason: 'Test',
      fallbackModels: [],
      metadata: { contextWindow: 8192, latencyMs: 50, capabilities: ['code'] }
    } as any,
    kernelLogs: [],
    workspacePath: undefined
  });

  test('SMALL Task receives bounded adaptive budget (num_predict=1024, temp=0.1)', () => {
    const decision = pipelineRouter.routeRequest(createMockReq('Create a simple HTML/CSS portfolio.'));
    expect(decision.complexity).toBe('SMALL');
    expect(decision.generationBudget.num_predict).toBe(1024);
    expect(decision.generationBudget.temperature).toBe(0.1);
  });

  test('MEDIUM Task receives adaptive budget (num_predict=2048, temp=0.2)', () => {
    const decision = pipelineRouter.routeRequest(createMockReq('Add dark mode with localStorage to the existing React portfolio.'));
    expect(decision.complexity).toBe('MEDIUM');
    expect(decision.generationBudget.num_predict).toBe(2048);
    expect(decision.generationBudget.temperature).toBe(0.2);
  });

  test('COMPLEX Task receives large adaptive budget (num_predict=4096, temp=0.2)', () => {
    const decision = pipelineRouter.routeRequest(createMockReq('Create a commercial kitchen equipment manufacturer website with React, TypeScript, catalog, filtering, contact form.'));
    expect(decision.complexity).toBe('COMPLEX');
    expect(decision.generationBudget.num_predict).toBe(4096);
    expect(decision.generationBudget.temperature).toBe(0.2);
  });
});
