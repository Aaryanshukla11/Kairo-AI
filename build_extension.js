const esbuild = require('esbuild');
const { build: buildVite } = require('vite');
const path = require('path');

async function main() {
  console.log('Compiling VS Code Extension Backend...');
  await esbuild.build({
    entryPoints: ['src/extension/index.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    logLevel: 'info'
  });

  console.log('\nCompiling Sidebar Webview UI...');
  await buildVite({
    configFile: path.resolve(__dirname, 'vite.config.ts')
  });

  console.log('\nExtension and Webview build completed successfully!');
}

main().catch(err => {
  console.error('Build execution failed:', err);
  process.exit(1);
});
