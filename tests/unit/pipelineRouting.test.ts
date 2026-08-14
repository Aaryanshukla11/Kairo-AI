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

describe('PipelineRouter Unit Tests — Dynamic Depth Classification', () => {
  const createMockCompiledRequest = (rawPrompt: string, intent: string = 'NEW_PROJECT'): IAIKernelCompiledRequest => {
    return {
      requestId: `req-test-${Date.now()}`,
      timestamp: Date.now(),
      rawPrompt,
      normalizedPrompt: rawPrompt.toLowerCase(),
      intent: intent as any,
      promptContext: {
        id: `ctx-${Date.now()}`,
        timestamp: Date.now(),
        rawPrompt,
        normalizedPrompt: rawPrompt.toLowerCase(),
        intent,
        confidence: 1.0,
        projectInfo: { name: 'Test', type: 'WEB' },
        workspaceInfo: { isEmpty: true, isProjectPresent: false, isMonorepo: false, hasGit: false },
        detectedTechnologies: {
          language: 'HTML', frontend: 'CSS', backend: null, database: null, authMethod: null,
          apiStyle: null, uiFramework: null, cssFramework: null, stateManagement: null, buildTool: null
        },
        detectedFeatures: [],
        existingFiles: [],
        dependencies: {},
        warnings: [],
        metadata: { length: rawPrompt.length, lineCount: 1, hasMarkdown: false }
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
    };
  };

  test('Scenario 1: Simple HTML/CSS project -> SMALL classification & correct agents/generators', () => {
    const req = createMockCompiledRequest('Create a simple personal portfolio website using HTML and CSS.');
    const decision = pipelineRouter.routeRequest(req);

    expect(decision.complexity).toBe('SMALL');
    expect(decision.selectedAgents).toEqual([
      'requirement-agent',
      'architecture-agent',
      'planner-agent',
      'generator-sdk-agent',
      'executor-agent',
      'reviewer-agent'
    ]);
    expect(decision.skippedAgents).toEqual([
      'project-intelligence-agent',
      'engineering-decision-agent',
      'workspace-agent',
      'project-manifest-agent'
    ]);
    expect(decision.selectedGenerators).toEqual(['ConfigGenerator', 'UIComponentGenerator']);
  });

  test('Scenario 2: Navbar modification -> SMALL classification', () => {
    const req = createMockCompiledRequest('Change navbar color to black.');
    const decision = pipelineRouter.routeRequest(req);

    expect(decision.complexity).toBe('SMALL');
    expect(decision.selectedAgents.length).toBe(6);
    expect(decision.skippedAgents.length).toBe(4);
  });

  test('Scenario 3: React dark mode -> MEDIUM classification', () => {
    const req = createMockCompiledRequest('Add dark mode to my React portfolio.');
    const decision = pipelineRouter.routeRequest(req);

    expect(decision.complexity).toBe('MEDIUM');
    expect(decision.selectedAgents).toContain('project-intelligence-agent');
    expect(decision.skippedAgents).toEqual([
      'engineering-decision-agent',
      'workspace-agent',
      'project-manifest-agent'
    ]);
  });

  test('Scenario 4: Product filtering -> MEDIUM classification', () => {
    const req = createMockCompiledRequest('Add product filtering to the existing website.');
    const decision = pipelineRouter.routeRequest(req);

    expect(decision.complexity).toBe('MEDIUM');
    expect(decision.selectedAgents.length).toBe(7);
  });

  test('Scenario 5: Commercial kitchen manufacturer website -> COMPLEX classification (10/10 agents)', () => {
    const req = createMockCompiledRequest('Create a commercial kitchen equipment manufacturer website.');
    const decision = pipelineRouter.routeRequest(req);

    expect(decision.complexity).toBe('COMPLEX');
    expect(decision.selectedAgents.length).toBe(10);
    expect(decision.skippedAgents.length).toBe(0);
    expect(decision.selectedAgents).toEqual([
      'requirement-agent',
      'project-intelligence-agent',
      'engineering-decision-agent',
      'architecture-agent',
      'workspace-agent',
      'project-manifest-agent',
      'planner-agent',
      'generator-sdk-agent',
      'executor-agent',
      'reviewer-agent'
    ]);
  });

  test('Scenario 6: Full-stack e-commerce platform -> COMPLEX classification (10/10 agents)', () => {
    const req = createMockCompiledRequest('Create a complete full-stack e-commerce platform.');
    const decision = pipelineRouter.routeRequest(req);

    expect(decision.complexity).toBe('COMPLEX');
    expect(decision.selectedAgents.length).toBe(10);
    expect(decision.skippedAgents.length).toBe(0);
  });
});
