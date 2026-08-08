const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');

function compileTS() {
  console.log('Compiling TypeScript...');
  const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.test.json");
  if (!configPath) throw new Error("Could not find tsconfig.test.json");

  const readConfigFileResult = ts.readConfigFile(configPath, ts.sys.readFile);
  const jsonConfigFileContent = ts.parseJsonConfigFileContent(readConfigFileResult.config, ts.sys, "./");

  const program = ts.createProgram(jsonConfigFileContent.fileNames, jsonConfigFileContent.options);
  const emitResult = program.emit();

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  let errorCount = 0;
  diagnostics.forEach(diag => {
    if (diag.category === ts.DiagnosticCategory.Error) {
      errorCount++;
      const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
      if (diag.file) {
        const { line, character } = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
        console.error(`ERROR: ${diag.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.error(`ERROR: ${message}`);
      }
    }
  });

  if (emitResult.emitSkipped || errorCount > 0) {
    throw new Error(`TypeScript compilation failed with ${errorCount} errors.`);
  }
  console.log('TypeScript compilation succeeded cleanly!');
}

function runMochaTests() {
  console.log('\nRunning Mocha tests for AI Kernel...');
  const mocha = new Mocha();

  const testFiles = [
    path.join(__dirname, 'dist', 'tests', 'unit', 'aiKernel.test.js'),
    path.join(__dirname, 'dist', 'tests', 'integration', 'aiKernelFlow.test.js')
  ];

  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      mocha.addFile(file);
    } else {
      console.warn(`Test file not found: ${file}`);
    }
  });

  mocha.run(failures => {
    if (failures) {
      console.error(`${failures} test(s) failed.`);
      process.exit(1);
    } else {
      console.log('All AI Kernel tests passed successfully!');
    }
  });
}

try {
  compileTS();
  runMochaTests();
} catch (err) {
  console.error('Execution failed:', err);
  process.exit(1);
}
