import * as fs from 'fs';
import * as path from 'path';

export class ConfigIndexer {
  /**
   * Scans package dependencies and tsconfig flags to identify project framework and language environments.
   */
  public indexConfig(root: string): { framework: string; language: string } {
    let framework = 'Vanilla';
    let language = 'JavaScript';

    const tsconfig = path.join(root, 'tsconfig.json');
    if (fs.existsSync(tsconfig)) {
      language = 'TypeScript';
    }

    const packageJsonPath = path.join(root, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) {
          framework = 'Next.js';
        } else if (deps['react']) {
          framework = 'React';
        } else if (deps['vue']) {
          framework = 'Vue';
        } else if (deps['svelte']) {
          framework = 'Svelte';
        } else if (deps['express']) {
          framework = 'Express';
        }
      } catch {
        // Fallback
      }
    }

    return { framework, language };
  }
}

export const configIndexer = new ConfigIndexer();
