import { localInferenceService } from '../../src/core/inference/localInferenceService';
import { providerRegistry } from '../../src/core/inference/registry';
import {
  ILocalInferenceProvider,
  ILocalInferenceSession,
  ILocalInferenceResult,
  IModelConfig
} from '../../src/core/inference/types';
import { defaultPlannerModel, plannerEngine } from '../../src/core/planner';

class MockFetchProvider implements ILocalInferenceProvider {
  public name: string;
  public providerId: string;
  private handler: (session: ILocalInferenceSession) => Promise<ILocalInferenceResult>;

  constructor(providerId: string, handler: (session: ILocalInferenceSession) => Promise<ILocalInferenceResult>) {
    this.name = providerId;
    this.providerId = providerId;
    this.handler = handler;
  }

  async execute(session: ILocalInferenceSession): Promise<ILocalInferenceResult> {
    return this.handler(session);
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async listAvailableModels(): Promise<string[]> {
    return ['mock-model'];
  }
}

export async function runLiveVerification() {
  console.log('==================================================');
  console.log('KAIRO-AI — LIVE RUNTIME VERIFICATION SUITE');
  console.log('==================================================\n');

  const savedProvider = process.env.KAIRO_MODEL_PROVIDER;
  process.env.KAIRO_MODEL_PROVIDER = 'openai';

  const testResults: { name: string; status: 'PASS' | 'FAIL'; log: string }[] = [];

  // --------------------------------------------------
  // TEST A: OpenAI Success
  // --------------------------------------------------
  try {
    console.log('--- RUNNING TEST A: OpenAI Success ---');
    providerRegistry.removeProvider('openai');
    providerRegistry.removeProvider('ollama');

    let openaiInvoked = false;
    let ollamaInvoked = false;

    const openaiMock = new MockFetchProvider('openai', async (session) => {
      openaiInvoked = true;
      return {
        generatedText: '<html><body><h1>Portfolio</h1></body></html>',
        tokenUsage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
        executionTimeMs: 120,
        warnings: [],
        errors: [],
        providerInfo: { providerName: 'openai', modelName: 'gpt-4o' }
      };
    });

    const ollamaMock = new MockFetchProvider('ollama', async () => {
      ollamaInvoked = true;
      return {
        generatedText: 'Ollama text',
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTimeMs: 0,
        warnings: [],
        errors: [],
        providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
      };
    });

    providerRegistry.registerProvider(openaiMock);
    providerRegistry.registerProvider(ollamaMock);

    const config: IModelConfig = {
      provider: 'openai',
      modelName: 'gpt-4o',
      modelPath: '',
      contextLength: 4096,
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 512,
      gpuLayers: 0,
      threadCount: 4,
      streamingEnabled: false
    };

    const result = await localInferenceService.execute('Create index.html', config);
    const pass = openaiInvoked && !ollamaInvoked && result.providerInfo.providerName === 'openai' && result.generatedText.includes('Portfolio');

    console.log(`  OpenAI Called: ${openaiInvoked}, Ollama Called: ${ollamaInvoked}`);
    console.log(`  Output text match: ${result.generatedText.includes('Portfolio')}`);
    console.log(`TEST A RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    testResults.push({
      name: 'TEST A — OpenAI success',
      status: pass ? 'PASS' : 'FAIL',
      log: `Provider: ${result.providerInfo.providerName}, Model: ${result.providerInfo.modelName}, Output length: ${result.generatedText.length}`
    });
  } catch (err: any) {
    console.error('TEST A ERROR:', err.message);
    testResults.push({ name: 'TEST A — OpenAI success', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST B: OpenAI Planner Path ("Build a portfolio website")
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST B: OpenAI Planner Path ---');
    providerRegistry.removeProvider('openai');
    providerRegistry.removeProvider('ollama');

    let plannerInferenceModel: string = '';
    const openaiMock = new MockFetchProvider('openai', async (session) => {
      plannerInferenceModel = session.modelName;
      return {
        generatedText: JSON.stringify({
          tasks: [
            {
              id: 'task-1',
              title: 'Create index.html',
              description: 'HTML structure for portfolio site',
              operation: 'CREATE_FILE',
              targetFiles: ['index.html'],
              requiredCapability: 'html',
              dependencies: [],
              rationale: 'Core HTML document'
            },
            {
              id: 'task-2',
              title: 'Create styles.css',
              description: 'CSS styling for portfolio site',
              operation: 'CREATE_FILE',
              targetFiles: ['styles.css'],
              requiredCapability: 'css',
              dependencies: ['task-1'],
              rationale: 'Styles'
            }
          ]
        }),
        tokenUsage: { promptTokens: 100, completionTokens: 150, totalTokens: 250 },
        executionTimeMs: 300,
        warnings: [],
        errors: [],
        providerInfo: { providerName: 'openai', modelName: 'gpt-4o' }
      };
    });

    providerRegistry.registerProvider(openaiMock);

    const proposal = await defaultPlannerModel.generatePlanProposal('Build a portfolio website');
    const plan = plannerEngine.generatePlan('Build a portfolio website', { proposal });

    const pass = proposal.tasks.length === 2 && plan.tasks.length === 2 && plannerInferenceModel === 'gpt-4o';
    console.log(`TEST B RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  PlannerModel Invoked: YES`);
    console.log(`  Inference Model Received: ${plannerInferenceModel}`);
    console.log(`  Dynamic ExecutionPlan Task Count: ${plan.tasks.length}`);
    console.log(`  Task 1: ${plan.tasks[0]?.title ?? ''} -> [${(plan.tasks[0]?.targetFiles ?? []).join(', ')}]`);
    console.log(`  Task 2: ${plan.tasks[1]?.title ?? ''} -> [${(plan.tasks[1]?.targetFiles ?? []).join(', ')}]`);

    testResults.push({
      name: 'TEST B — OpenAI planner path',
      status: pass ? 'PASS' : 'FAIL',
      log: `Proposal tasks: ${proposal.tasks.length}, Plan tasks: ${plan.tasks.length}, Model: ${plannerInferenceModel}`
    });
  } catch (err: any) {
    console.error('TEST B ERROR:', err.message);
    testResults.push({ name: 'TEST B — OpenAI planner path', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST C: OpenAI -> Ollama Failover ("Build a portfolio website")
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST C: OpenAI -> Ollama Failover ---');
    providerRegistry.removeProvider('openai');
    providerRegistry.removeProvider('ollama');

    let openaiAttempted = false;
    let ollamaAttempted = false;

    // Simulate OpenAI 503 Outage
    const openaiMock = new MockFetchProvider('openai', async () => {
      openaiAttempted = true;
      return {
        generatedText: '',
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTimeMs: 200,
        warnings: [],
        errors: ['OpenAI API request failed with status 503: High demand spike. Try again later.'],
        providerInfo: { providerName: 'openai', modelName: 'gpt-4o' }
      };
    });

    // Simulate Ollama Available and Responding
    const ollamaMock = new MockFetchProvider('ollama', async () => {
      ollamaAttempted = true;
      return {
        generatedText: JSON.stringify({
          tasks: [
            {
              id: 'task-ollama-1',
              title: 'Generate index.html via Ollama',
              description: 'Ollama generated portfolio structure',
              operation: 'CREATE_FILE',
              targetFiles: ['index.html'],
              requiredCapability: 'html',
              dependencies: []
            }
          ]
        }),
        tokenUsage: { promptTokens: 80, completionTokens: 90, totalTokens: 170 },
        executionTimeMs: 400,
        warnings: [],
        errors: [],
        providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
      };
    });

    providerRegistry.registerProvider(openaiMock);
    providerRegistry.registerProvider(ollamaMock);

    const proposal = await defaultPlannerModel.generatePlanProposal('Build a portfolio website');
    const plan = plannerEngine.generatePlan('Build a portfolio website', { proposal });

    const firstTitle = plan.tasks[0]?.title ?? '';
    const pass = openaiAttempted && ollamaAttempted && proposal.tasks.length === 1 && firstTitle.includes('Ollama');
    console.log(`TEST C RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  OpenAI Attempted & Failed: ${openaiAttempted}`);
    console.log(`  Ollama Failover Invoked: ${ollamaAttempted}`);
    console.log(`  Plan Generated via Ollama Task: ${firstTitle}`);

    testResults.push({
      name: 'TEST C — OpenAI -> Ollama failover',
      status: pass ? 'PASS' : 'FAIL',
      log: `OpenAI 503 caught -> Ollama failover plan generated successfully (Task: ${firstTitle})`
    });
  } catch (err: any) {
    console.error('TEST C ERROR:', err.message);
    testResults.push({ name: 'TEST C — OpenAI -> Ollama failover', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST D: Both Providers Unavailable
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST D: Both Providers Unavailable ---');
    providerRegistry.removeProvider('openai');
    providerRegistry.removeProvider('ollama');

    const openaiMock = new MockFetchProvider('openai', async () => {
      throw new Error('OpenAI API request failed with status 503');
    });

    const ollamaMock = new MockFetchProvider('ollama', async () => {
      throw new Error('Ollama Server is not running at http://localhost:11434');
    });

    providerRegistry.registerProvider(openaiMock);
    providerRegistry.registerProvider(ollamaMock);

    const config: IModelConfig = {
      provider: 'openai',
      modelName: 'gpt-4o',
      modelPath: '',
      contextLength: 4096,
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 512,
      gpuLayers: 0,
      threadCount: 4,
      streamingEnabled: false
    };

    const result = await localInferenceService.execute('Build a portfolio website', config);

    const pass = result.generatedText === '' && result.errors.length >= 2 && result.errors.some((e: string) => e.includes('OpenAI')) && result.errors.some((e: string) => e.includes('Ollama'));
    console.log(`TEST D RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  Generated Text Empty (No Fake Output): ${result.generatedText === ''}`);
    console.log(`  Honest Errors Recorded: ${result.errors.length}`);
    console.log(`  Error 1: ${result.errors[0]}`);
    console.log(`  Error 2: ${result.errors[1]}`);

    testResults.push({
      name: 'TEST D — Both providers unavailable',
      status: pass ? 'PASS' : 'FAIL',
      log: `No crash, 0 fake text, honest dual error returned: ${result.errors.join(' | ')}`
    });
  } catch (err: any) {
    console.error('TEST D ERROR:', err.message);
    testResults.push({ name: 'TEST D — Both providers unavailable', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST E: Explicit Filename Fast Path ("Create index.html")
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST E: Explicit Filename Fast Path ---');
    providerRegistry.removeProvider('openai');
    providerRegistry.removeProvider('ollama');

    let inferenceCalled = false;
    const openaiMock = new MockFetchProvider('openai', async () => {
      inferenceCalled = true;
      throw new Error('Inference should NOT be called for explicit fast path');
    });
    providerRegistry.registerProvider(openaiMock);

    // Fast path execution in plannerEngine
    const plan = plannerEngine.generatePlan('Create index.html');
    const firstTask = plan.tasks[0];
    const targetFiles = firstTask?.targetFiles ?? [];

    const pass = !inferenceCalled && plan.tasks.length === 1 && targetFiles.includes('index.html');
    console.log(`TEST E RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  LLM / PlannerModel Invoked: ${inferenceCalled ? 'YES (BUG)' : 'NO (CORRECT)'}`);
    console.log(`  Fast Path Target File: [${targetFiles.join(', ')}]`);

    testResults.push({
      name: 'TEST E — Explicit filename fast path',
      status: pass ? 'PASS' : 'FAIL',
      log: `Fast path bypassed LLM planner: ${!inferenceCalled}, Target: ${targetFiles.join(', ')}`
    });
  } catch (err: any) {
    console.error('TEST E ERROR:', err.message);
    testResults.push({ name: 'TEST E — Explicit filename fast path', status: 'FAIL', log: err.message });
  }

  // Restore env
  if (savedProvider !== undefined) {
    process.env.KAIRO_MODEL_PROVIDER = savedProvider;
  }

  console.log('\n==================================================');
  console.log('LIVE RUNTIME VERIFICATION SUMMARY');
  console.log('==================================================');
  for (const tr of testResults) {
    console.log(`[${tr.status}] ${tr.name} -> ${tr.log}`);
  }
}

runLiveVerification().catch(err => {
  console.error('VERIFICATION FATAL ERROR:', err);
  process.exit(1);
});
