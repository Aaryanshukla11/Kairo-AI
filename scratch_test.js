const { pipelineControllerFacade } = require('./dist/core/pipeline-controller');
const { NodeFsAdapter } = require('./dist/core/workspace-engine/fs-adapter');
const fs = require('fs');
const path = require('path');

async function verifyPrompt(prompt, subDir) {
  console.log(`Running prompt: "${prompt}"...`);
  const targetDir = path.resolve(__dirname, 'scratch_output', subDir);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const fsAdapter = new NodeFsAdapter();

  // Run the pipeline using mock-coder to return the prompt-specific files
  const result = await pipelineControllerFacade.runPipeline(
    prompt,
    targetDir,
    {
      providerId: 'mock-planner',
      execute: async () => JSON.stringify({
        contractVersion: '1.0.0',
        requestId: 'req-123',
        executionId: 'exec-123',
        tasks: [{ taskId: 't1', taskName: 'Task', taskType: 'CREATE_STRUCTURE', priority: 'CRITICAL', dependencies: [], input: '', expectedOutput: '', owner: 'WorkspaceScaffolder', executionOrder: 1 }],
        warnings: [],
        errors: []
      })
    },
    {
      providerId: 'mock-coder',
      executeStream: async () => ''
    },
    fsAdapter
  );

  console.log(`Pipeline state result: ${result.state}`);
  console.log('Files generated:');
  const files = fs.readdirSync(targetDir);
  console.log(files);
  return { result, targetDir };
}

async function run() {
  try {
    await verifyPrompt('Create Calculator using HTML CSS', 'calculator');
    await verifyPrompt('Create Todo App using React', 'react_todo');
    await verifyPrompt('Create Express REST API', 'express_api');
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

run();
