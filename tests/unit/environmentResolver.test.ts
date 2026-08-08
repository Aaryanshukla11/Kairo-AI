import * as assert from 'assert';
import { environmentResolver } from '../../src/core/environment-resolver';
import { InMemoryFsAdapter } from '../../src/core/workspace-engine';

describe('Sprint 4 - Environment & Toolchain Resolver Tests', () => {

  it('should detect Node.js React Vite project with pnpm package manager', async () => {
    const fs = new InMemoryFsAdapter();
    
    // Simulate files structure
    fs.setFile('c:/app/pnpm-lock.yaml', 'pnpm lock content');
    fs.setFile('c:/app/package.json', JSON.stringify({
      dependencies: {
        'react': '^18.2.0'
      },
      devDependencies: {
        'vite': '^4.4.0'
      }
    }));

    const profile = await environmentResolver.resolve('c:/app', fs);

    assert.strictEqual(profile.packageManager, 'pnpm');
    assert.strictEqual(profile.runtime, 'Node.js');
    assert.strictEqual(profile.framework, 'React');
    assert.strictEqual(profile.buildTool, 'Vite');
    assert.strictEqual(profile.installCommand, 'pnpm install');
    assert.strictEqual(profile.devCommand, 'pnpm dev');

    // Verify immutability
    assert.throws(() => {
      (profile as any).runtime = 'Rust';
    }, /Cannot assign to read only property/);
  });

  it('should detect Java Spring Boot Maven project from pom.xml structure', async () => {
    const fs = new InMemoryFsAdapter();
    fs.setFile('c:/app/pom.xml', '<project></project>');

    const profile = await environmentResolver.resolve('c:/app', fs);

    assert.strictEqual(profile.runtime, 'Java');
    assert.strictEqual(profile.framework, 'Spring Boot');
    assert.strictEqual(profile.buildTool, 'Maven');
    assert.strictEqual(profile.installCommand, 'mvn install');
    assert.strictEqual(profile.devCommand, 'mvn spring-boot:run');
  });

});
