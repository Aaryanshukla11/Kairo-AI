import * as fs from 'fs';
import * as path from 'path';

export class WorkspaceIndexer {
  /**
   * Parses package.json if it exists to extract dependencies and project metadata.
   */
  public parsePackageJson(rootPath: string): { 
    projectName: string;
    dependencies: string[];
    devDependencies: string[];
    packageManager: string;
  } {
    const result = {
      projectName: '',
      dependencies: [] as string[],
      devDependencies: [] as string[],
      packageManager: 'npm' // default fallback
    };

    const packageJsonPath = path.join(rootPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return result;
    }

    try {
      const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      result.projectName = content.name || '';
      
      if (content.dependencies) {
        result.dependencies = Object.keys(content.dependencies);
      }
      if (content.devDependencies) {
        result.devDependencies = Object.keys(content.devDependencies);
      }
      
      if (content.packageManager) {
        result.packageManager = content.packageManager.split('@')[0];
      }
    } catch (e) {
      console.error('Error parsing package.json:', e);
    }

    return result;
  }
}
