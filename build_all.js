const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

async function main() {
  console.log('Building extension...');
  // Ensure dist folder exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  await esbuild.build({
    entryPoints: ['src/extension/index.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    platform: 'node',
    format: 'cjs',
  });
  console.log('Extension built successfully.');

  console.log('Compiling TypeScript tests...');
  // Compile using tsconfig.test.json
  const configPath = ts.findConfigFile(
    "./",
    ts.sys.fileExists,
    "tsconfig.test.json"
  );
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.test.json'.");
  }

  const readConfigFileResult = ts.readConfigFile(configPath, ts.sys.readFile);
  if (readConfigFileResult.error) {
    throw new Error(readConfigFileResult.error.messageText);
  }

  const jsonConfigFileContent = ts.parseJsonConfigFileContent(
    readConfigFileResult.config,
    ts.sys,
    "./"
  );

  const program = ts.createProgram(jsonConfigFileContent.fileNames, jsonConfigFileContent.options);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });

  if (emitResult.emitSkipped) {
    throw new Error("TypeScript compilation failed.");
  }
  console.log('TypeScript compilation succeeded.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
