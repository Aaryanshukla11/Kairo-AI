const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');

console.log('Compiling TypeScript codebase via compiler API...');
const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.test.json');
const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(readResult.config, ts.sys, './');

const program = ts.createProgram(config.fileNames, config.options);
const emitResult = program.emit();

const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
let errorCount = 0;
diagnostics.forEach(diag => {
  if (diag.category === ts.DiagnosticCategory.Error) {
    errorCount++;
    const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    if (diag.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
      console.error(`Compilation Error: ${diag.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.error(`Compilation Error: ${message}`);
    }
  }
});

if (errorCount > 0 || emitResult.emitSkipped) {
  console.error(`BUILD FAILED with ${errorCount} errors.`);
  process.exit(1);
}

console.log('BUILD SUCCESSFUL! 0 compilation errors.\n');

const esbuild = require('esbuild');
const { build: buildVite } = require('vite');

async function buildBundles() {
  console.log('Bundling extension backend via esbuild -> dist/extension.js...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'extension', 'index.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'dist', 'extension.js'),
    external: ['vscode'],
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    logLevel: 'warning'
  });

  console.log('Bundling webview UI via vite -> dist/webview/main.js...');
  await buildVite({
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    logLevel: 'warn'
  });
  console.log('Bundles compiled successfully!\n');
}

buildBundles().then(() => {
  console.log('Running Mocha test suites...');
  const mocha = new Mocha();
  const testFiles = [
    path.join(__dirname, 'dist', 'tests', 'unit', 'aiKernel.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'orchestrator.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'agentManager.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'requirementAgent.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'projectIntelligenceAgent.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'engineeringDecisionAgent.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'architectureAgentBlueprint.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'workspaceAgentBlueprint.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'projectManifestAgent.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'plannerAgentGenerationPlan.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'generatorSDK.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'backendGeneratorSDK.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'productionGeneratorsSDK.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'fullSuiteGeneratorsSDK.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'executionEngineEventBus.test.js'),
    path.join(__dirname, 'dist', 'tests', 'unit', 'productionIntegrationV1.test.js'),
    path.join(__dirname, 'dist', 'tests', 'integration', 'aiKernelFlow.test.js'),
    path.join(__dirname, 'dist', 'tests', 'integration', 'orchestratorFlow.test.js')
  ];

  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      mocha.addFile(file);
    } else {
      console.warn(`Test file not found: ${file}`);
    }
  });

  mocha.run(failures => {
    if (failures > 0) {
      console.error(`${failures} test(s) failed.`);
      process.exit(1);
    } else {
      console.log('ALL TESTS PASSED SUCCESSFULLY!');
    }
  });
}).catch(err => {
  console.error('Bundle compilation failed:', err);
  process.exit(1);
});
