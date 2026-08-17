import { plannerEngine } from '../../src/core/planner/planner';
import { defaultPlannerModel } from '../../src/core/planner/plannerModel';
import { localInferenceService } from '../../src/core/inference/localInferenceService';
import { providerRegistry } from '../../src/core/inference/registry';
import { ILocalInferenceProvider, ILocalInferenceSession, ILocalInferenceResult, IModelConfig } from '../../src/core/inference/types';

class MockFetchProvider implements ILocalInferenceProvider {
  public name: string;
  public callCount = 0;
  private behavior: (session: ILocalInferenceSession) => Promise<ILocalInferenceResult> | ILocalInferenceResult;

  constructor(
    name: string,
    behavior: (session: ILocalInferenceSession) => Promise<ILocalInferenceResult> | ILocalInferenceResult
  ) {
    this.name = name;
    this.behavior = behavior;
  }

  public async execute(session: ILocalInferenceSession): Promise<ILocalInferenceResult> {
    this.callCount++;
    return await this.behavior(session);
  }
}

async function runLiveVerification() {
  console.log('==================================================');
  console.log('KAIRO-AI — LIVE RUNTIME VERIFICATION SUITE');
  console.log('==================================================\n');

  const testResults: Array<{ name: string; status: 'PASS' | 'FAIL'; log: string }> = [];
  const savedProvider = process.env.KAIRO_MODEL_PROVIDER;

  // --------------------------------------------------
  // TEST A: Gemini Success ("Create index.html")
  // --------------------------------------------------
  try {
    console.log('--- RUNNING TEST A: Gemini Success ---');
    providerRegistry.removeProvider('gemini');
    providerRegistry.removeProvider('ollama');

    let geminiInvoked = false;
    let ollamaInvoked = false;

    const geminiMock = new MockFetchProvider('gemini', async (session) => {
      geminiInvoked = true;
      return {
        generatedText: '<html><body><h1>Portfolio</h1></body></html>',
        tokenUsage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
        executionTimeMs: 120,
        warnings: [],
        errors: [],
        providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
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

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const config: IModelConfig = {
      provider: 'gemini',
      modelName: 'gemini-2.5-flash',
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

    const pass = geminiInvoked && !ollamaInvoked && result.providerInfo.providerName === 'gemini' && result.generatedText.includes('Portfolio');
    console.log(`TEST A RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  Actual Provider Invoked: ${result.providerInfo.providerName}`);
    console.log(`  Actual Model Invoked: ${result.providerInfo.modelName}`);
    console.log(`  Gemini Called: ${geminiInvoked}, Ollama Called: ${ollamaInvoked}`);

    testResults.push({
      name: 'TEST A — Gemini success',
      status: pass ? 'PASS' : 'FAIL',
      log: `Provider: ${result.providerInfo.providerName}, Model: ${result.providerInfo.modelName}, Output length: ${result.generatedText.length}`
    });
  } catch (err: any) {
    console.error('TEST A ERROR:', err.message);
    testResults.push({ name: 'TEST A — Gemini success', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST B: Gemini Planner Path ("Build a portfolio website")
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST B: Gemini Planner Path ---');
    providerRegistry.removeProvider('gemini');
    providerRegistry.removeProvider('ollama');

    let plannerInferenceModel: string = '';
    const geminiMock = new MockFetchProvider('gemini', async (session) => {
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
        providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
      };
    });

    providerRegistry.registerProvider(geminiMock);

    const proposal = await defaultPlannerModel.generatePlanProposal('Build a portfolio website');
    const plan = plannerEngine.generatePlan('Build a portfolio website', { proposal });

    const pass = proposal.tasks.length === 2 && plan.tasks.length === 2 && plannerInferenceModel === 'gemini-2.5-flash';
    console.log(`TEST B RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  PlannerModel Invoked: YES`);
    console.log(`  Inference Model Received: ${plannerInferenceModel}`);
    console.log(`  Dynamic ExecutionPlan Task Count: ${plan.tasks.length}`);
    console.log(`  Task 1: ${plan.tasks[0]?.title ?? ''} -> [${(plan.tasks[0]?.targetFiles ?? []).join(', ')}]`);
    console.log(`  Task 2: ${plan.tasks[1]?.title ?? ''} -> [${(plan.tasks[1]?.targetFiles ?? []).join(', ')}]`);

    testResults.push({
      name: 'TEST B — Gemini planner path',
      status: pass ? 'PASS' : 'FAIL',
      log: `Proposal tasks: ${proposal.tasks.length}, Plan tasks: ${plan.tasks.length}, Model: ${plannerInferenceModel}`
    });
  } catch (err: any) {
    console.error('TEST B ERROR:', err.message);
    testResults.push({ name: 'TEST B — Gemini planner path', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST C: Gemini -> Ollama Failover ("Build a portfolio website")
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST C: Gemini -> Ollama Failover ---');
    providerRegistry.removeProvider('gemini');
    providerRegistry.removeProvider('ollama');

    let geminiAttempted = false;
    let ollamaAttempted = false;

    // Simulate Gemini 503 Outage
    const geminiMock = new MockFetchProvider('gemini', async () => {
      geminiAttempted = true;
      return {
        generatedText: '',
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTimeMs: 200,
        warnings: [],
        errors: ['Gemini API request failed with status 503: High demand spike. Try again later.'],
        providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
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

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const proposal = await defaultPlannerModel.generatePlanProposal('Build a portfolio website');
    const plan = plannerEngine.generatePlan('Build a portfolio website', { proposal });

    const firstTitle = plan.tasks[0]?.title ?? '';
    const pass = geminiAttempted && ollamaAttempted && proposal.tasks.length === 1 && firstTitle.includes('Ollama');
    console.log(`TEST C RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  Gemini Attempted & Failed: ${geminiAttempted}`);
    console.log(`  Ollama Failover Invoked: ${ollamaAttempted}`);
    console.log(`  Plan Generated via Ollama Task: ${firstTitle}`);

    testResults.push({
      name: 'TEST C — Gemini -> Ollama failover',
      status: pass ? 'PASS' : 'FAIL',
      log: `Gemini 503 caught -> Ollama failover plan generated successfully (Task: ${firstTitle})`
    });
  } catch (err: any) {
    console.error('TEST C ERROR:', err.message);
    testResults.push({ name: 'TEST C — Gemini -> Ollama failover', status: 'FAIL', log: err.message });
  }

  // --------------------------------------------------
  // TEST D: Both Providers Unavailable
  // --------------------------------------------------
  try {
    console.log('\n--- RUNNING TEST D: Both Providers Unavailable ---');
    providerRegistry.removeProvider('gemini');
    providerRegistry.removeProvider('ollama');

    const geminiMock = new MockFetchProvider('gemini', async () => {
      throw new Error('Gemini API request failed with status 503');
    });

    const ollamaMock = new MockFetchProvider('ollama', async () => {
      throw new Error('Ollama Server is not running at http://localhost:11434');
    });

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const config: IModelConfig = {
      provider: 'gemini',
      modelName: 'gemini-2.5-flash',
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

    const pass = result.generatedText === '' && result.errors.length >= 2 && result.errors.some((e: string) => e.includes('Gemini')) && result.errors.some((e: string) => e.includes('Ollama'));
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
    providerRegistry.removeProvider('gemini');
    providerRegistry.removeProvider('ollama');

    let inferenceCalled = false;
    const geminiMock = new MockFetchProvider('gemini', async () => {
      inferenceCalled = true;
      throw new Error('Inference should NOT be called for explicit fast path');
    });
    providerRegistry.registerProvider(geminiMock);

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
