import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { projectContextFacade } from '../../src/core/project-context-analyzer';

describe('Sprint 1 - Project Context Analyzer Module Tests', () => {
  const tempDir = path.join(__dirname, 'temp-test-workspace');

  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should analyze empty workspace correctly', () => {
    const result = projectContextFacade.analyzeWorkspace(tempDir);
    assert.strictEqual(result.workspace.isEmpty, true);
    assert.strictEqual(result.workspace.isProjectPresent, false);
    assert.strictEqual(result.projectType, 'Unknown');
  });

  it('should detect React, Node, package manager, and entry points correctly', () => {
    // Write package.json with dependencies
    const packageJson = {
      name: 'test-app',
      dependencies: {
        react: '^18.0.0',
        express: '^4.18.0',
        pg: '^8.7.0'
      },
      devDependencies: {
        typescript: '^4.9.0',
        jest: '^29.0.0'
      }
    };
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Write lock file to simulate npm
    fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '{}');

    // Create entry points
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src/main.ts'), 'console.log("hello");');
    fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

    const result = projectContextFacade.analyzeWorkspace(tempDir);

    // Verify workspace flags
    assert.strictEqual(result.workspace.isEmpty, false);
    assert.strictEqual(result.workspace.isProjectPresent, true);
    assert.strictEqual(result.workspace.packageManager, 'npm');

    // Verify tech stack
    assert.strictEqual(result.techStack.language, 'TypeScript');
    assert.strictEqual(result.techStack.frontendFramework, 'React');
    assert.strictEqual(result.techStack.backendFramework, 'Express');
    assert.strictEqual(result.techStack.database, 'PostgreSQL');
    assert.strictEqual(result.techStack.testingFramework, 'Jest');

    // Verify files & entry points lists
    assert.ok(result.importantFiles.includes('package.json'));
    assert.ok(result.importantFiles.includes('tsconfig.json'));
    assert.ok(result.entryPoints.includes('src/main.ts'));

    // Verify health defaults to missing node_modules when lock is present but folder is not
    assert.strictEqual(result.projectHealth, 'Missing Dependencies');
  });

  it('should verify immutability of context returns', () => {
    const result = projectContextFacade.analyzeWorkspace(tempDir);
    assert.throws(() => {
      (result as any).projectType = 'HackProject';
    }, /Cannot assign to read only property/);
  });

});
