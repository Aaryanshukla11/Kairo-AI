import * as assert from 'assert';
import { pipelineControllerFacade } from '../../src/core/pipeline-controller';
import { IPlanningModelProvider } from '../../src/core/planning-model-integration/types';
import { InMemoryFsAdapter } from '../../src/core/workspace-engine';

describe('Sprint 4 - Pipeline Controller Integration Tests', () => {

  const dummyProvider: IPlanningModelProvider = {
    providerId: 'test-qwen',
    executeStream: async (session) => {
      return JSON.stringify({
        contractVersion: '1.0.0',
        requestId: session.requestId,
        executionId: 'exec-12345',
        tasks: [
          {
            taskId: 't1',
            taskName: 'Create App Directory',
            taskType: 'CREATE_STRUCTURE',
            description: 'Initialize directory schema layouts',
            priority: 'CRITICAL',
            dependencies: [],
            input: 'Workspace root',
            expectedOutput: 'Clean folders layout',
            owner: 'WorkspaceScaffolder',
            executionOrder: 1
          }
        ],
        warnings: []
      });
    }
  };

  it('should execute end-to-end planning & generation pipeline and fire event updates', async () => {
    const events: string[] = [];
    pipelineControllerFacade.subscribe('*', (ev: any) => {
      events.push(ev.eventType);
    });

    const fs = new InMemoryFsAdapter();

    // Run the pipeline controller facade
    const result = await pipelineControllerFacade.runPipeline(
      'Create Calculator using HTML CSS',
      'c:/mock/workspace',
      dummyProvider,
      {
        providerId: 'mock-coder',
        executeStream: async () => JSON.stringify({
          generatedFiles: [{ path: 'index.html', content: 'Calc' }],
          modifiedFiles: [],
          createdDirectories: []
        })
      },
      fs
    );

    assert.strictEqual(result.state, 'SUCCESS');
    assert.ok(result.developmentRequest);
    assert.ok(result.generationResult);
    assert.ok(result.workspaceReport);
    
    // Check files were generated in the fs adapter
    assert.ok(await fs.exists('c:/mock/workspace/index.html'));

    // Check that events fired in order
    assert.ok(events.includes('PromptReceived'));
    assert.ok(events.includes('PromptParsed'));
    assert.ok(events.includes('PlanningStarted'));
    assert.ok(events.includes('PlanningCompleted'));
    assert.ok(events.includes('ValidationStarted'));
    assert.ok(events.includes('ValidationCompleted'));
    assert.ok(events.includes('DevelopmentRequestCreated'));
    assert.ok(events.includes('GeneratorSessionCreated'));
    assert.ok(events.includes('CodingRuntimeInvoked'));
    assert.ok(events.includes('LLMResponseReceived'));
    assert.ok(events.includes('GenerationContractCreated'));
    assert.ok(events.includes('WorkspaceEngineStarted'));
    assert.ok(events.includes('FilesGenerated'));
    assert.ok(events.includes('ReviewChangesUpdated'));
    assert.ok(events.includes('PipelineCompleted'));

    // Verify immutability
    assert.throws(() => {
      (result as any).state = 'IDLE';
    }, /Cannot assign to read only property/);
  });

  it('should handle cancellation stop actions correctly', async () => {
    // Start running then immediately stop
    const promise = pipelineControllerFacade.runPipeline(
      'Create a new project',
      'c:/mock/workspace',
      dummyProvider
    );
    pipelineControllerFacade.stopPipeline();

    const result = await promise;
    assert.ok(result.state === 'CANCELLED' || result.state === 'FAILED');
  });

});
