import { BaseSafeRule } from './safeRule';
import { ruleRegistry } from './ruleRegistry';

export class RuleLoader {
  public loadDefaultRules(): void {
    // SAFE-001: Dependency Safety
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          'SAFE-001',
          'Block Dependency Alterations',
          'Dependency',
          'High',
          'Checks if package.json dependencies are directly altered.',
          ['ts', 'js', 'json'],
          ['FilesystemSafetyProvider'],
          'Pre-Execution'
        );
      }
      public validate(patchContent: string, context: any) {
        if (context.targetFile && context.targetFile.endsWith('package.json')) {
          if (patchContent.includes('"dependencies"') || patchContent.includes('"devDependencies"')) {
            return { valid: false, error: 'Direct modification of dependencies in package.json is prohibited' };
          }
        }
        return { valid: true };
      }
    }());

    // SAFE-002: Filesystem Safety
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          'SAFE-002',
          'Unsafe Deletions Guard',
          'Filesystem',
          'Critical',
          'Blocks direct rm -rf or unlink deletions in commands.',
          ['ts', 'js', 'sh'],
          ['FilesystemSafetyProvider'],
          'Pre-Execution'
        );
      }
      public validate(patchContent: string) {
        if (patchContent.includes('rm -rf') || patchContent.includes('fs.unlink')) {
          return { valid: false, error: 'Contains unsafe file deletion command patterns' };
        }
        return { valid: true };
      }
    }());

    // SAFE-003: Architecture Safety
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          'SAFE-003',
          'Architecture Boundary Validation',
          'Architecture',
          'High',
          'Blocks layer boundary violations where core imports webview.',
          ['ts', 'js'],
          ['FilesystemSafetyProvider'],
          'Pre-Execution'
        );
      }
      public validate(patchContent: string, context: any) {
        if (context.targetFile && !context.targetFile.includes('/webview/') && patchContent.includes('import') && patchContent.includes('/webview/')) {
          return { valid: false, error: 'Layer boundary violation - non-webview file importing webview resources' };
        }
        return { valid: true };
      }
    }());

    // SAFE-004: Secrets exposure
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          'SAFE-004',
          'Credentials Leak check',
          'Security',
          'Critical',
          'Blocks committing passwords or API keys.',
          ['ts', 'js', 'json'],
          [],
          'Pre-Execution'
        );
      }
      public validate(patchContent: string) {
        if (patchContent.includes('const password = "') || patchContent.includes('apiKey = "')) {
          return { valid: false, error: 'Potential secret exposure detected in code text' };
        }
        return { valid: true };
      }
    }());
  }
}
export const ruleLoader = new RuleLoader();
