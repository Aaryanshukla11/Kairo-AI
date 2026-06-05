import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceScanner } from './workspaceScanner';
import { WorkspaceIndexer } from './workspaceIndexer';
import { WorkspaceSummary } from './workspaceTypes';

export class WorkspaceEngine {
  private scanner = new WorkspaceScanner();
  private indexer = new WorkspaceIndexer();

  /**
   * Evaluates the active workspace directory to generate a structured project summary.
   * Throws an error if no workspace is active or found.
   */
  public getSummary(rootPath: string): WorkspaceSummary {
    if (!rootPath || !fs.existsSync(rootPath)) {
      throw new Error('Workspace Not Found');
    }

    const { rootFiles, hasGit, configs } = this.scanner.scanRoot(rootPath);
    const pkgInfo = this.indexer.parsePackageJson(rootPath);
    const sourceExtensions = this.scanner.detectSourceExtensions(rootPath);

    // 1. Project Name
    const projectName = pkgInfo.projectName || path.basename(rootPath);

    // 2. Framework Detection
    const framework = this.detectFramework(rootFiles, pkgInfo.dependencies, pkgInfo.devDependencies);

    // 3. Language Detection
    const language = this.detectLanguage(rootFiles, sourceExtensions);

    // 4. Package Manager Detection
    const packageManager = this.detectPackageManager(rootFiles, pkgInfo.packageManager);

    // 5. Build Tool Detection
    const buildTool = this.detectBuildTool(rootFiles, pkgInfo.dependencies, pkgInfo.devDependencies, framework);

    // 6. Entry Point Detection
    const entryPoint = this.detectEntryPoint(rootPath);

    // 7. Source Folder Detection
    const sourceFolder = this.detectSourceFolder(rootPath);

    return {
      projectName,
      framework,
      language,
      packageManager,
      buildTool,
      gitEnabled: hasGit,
      entryPoint,
      sourceFolder,
      configurationFiles: configs
    };
  }

  /**
   * Framework detection matching requested platforms:
   * React, Next.js, Vue, Angular, Node, Express, NestJS, Vite, Electron, Python, Java, C#, Rust, Go
   */
  private detectFramework(rootFiles: string[], deps: string[], devDeps: string[]): string {
    const allDeps = [...deps, ...devDeps];
    const fileSet = new Set(rootFiles);

    if (allDeps.includes('next') || fileSet.has('next.config.js') || fileSet.has('next.config.mjs')) {
      return 'Next.js';
    }
    if (allDeps.includes('electron') || fileSet.has('electron-builder.json')) {
      return 'Electron';
    }
    if (allDeps.includes('react') || allDeps.includes('react-dom')) {
      // If we also have vite config, let's keep React
      return 'React';
    }
    if (allDeps.includes('vue') || fileSet.has('vue.config.js')) {
      return 'Vue';
    }
    if (allDeps.includes('@angular/core') || fileSet.has('angular.json')) {
      return 'Angular';
    }
    if (allDeps.includes('@nestjs/core') || fileSet.has('nest-cli.json')) {
      return 'NestJS';
    }
    if (allDeps.includes('express')) {
      return 'Express';
    }
    if (allDeps.includes('vite') || fileSet.has('vite.config.ts') || fileSet.has('vite.config.js')) {
      return 'Vite';
    }
    if (fileSet.has('package.json')) {
      return 'Node';
    }
    if (fileSet.has('Cargo.toml')) {
      return 'Rust';
    }
    if (fileSet.has('go.mod')) {
      return 'Go';
    }
    if (fileSet.has('requirements.txt') || fileSet.has('pyproject.toml') || fileSet.has('setup.py')) {
      return 'Python';
    }
    if (fileSet.has('pom.xml') || fileSet.has('build.gradle')) {
      return 'Java';
    }
    
    const hasCsProj = rootFiles.some(f => f.endsWith('.csproj') || f.endsWith('.sln'));
    if (hasCsProj) {
      return 'C#';
    }

    return 'Unknown';
  }

  /**
   * Maps workspace parameters to direct programming language names.
   */
  private detectLanguage(rootFiles: string[], extensions: string[]): string {
    const fileSet = new Set(rootFiles);
    
    if (fileSet.has('tsconfig.json') || extensions.includes('.ts') || extensions.includes('.tsx')) {
      return 'TypeScript';
    }
    if (extensions.includes('.js') || extensions.includes('.jsx')) {
      return 'JavaScript';
    }
    if (fileSet.has('Cargo.toml') || extensions.includes('.rs')) {
      return 'Rust';
    }
    if (fileSet.has('go.mod') || extensions.includes('.go')) {
      return 'Go';
    }
    if (extensions.includes('.py')) {
      return 'Python';
    }
    if (extensions.includes('.java')) {
      return 'Java';
    }
    if (extensions.includes('.cs')) {
      return 'C#';
    }
    
    return 'TypeScript'; // Default fallback
  }

  /**
   * Checks locks or configurations to identify the active package manager.
   */
  private detectPackageManager(rootFiles: string[], pkgJsonPM: string): string {
    const fileSet = new Set(rootFiles);
    
    if (fileSet.has('pnpm-lock.yaml')) return 'pnpm';
    if (fileSet.has('yarn.lock')) return 'yarn';
    if (fileSet.has('bun.lockb')) return 'bun';
    if (fileSet.has('package-lock.json')) return 'npm';
    if (fileSet.has('Cargo.toml')) return 'cargo';
    if (fileSet.has('go.mod')) return 'go';
    if (fileSet.has('requirements.txt') || fileSet.has('pyproject.toml')) return 'pip';

    return pkgJsonPM || 'npm';
  }

  /**
   * Maps build configurations to standard compiling tool signatures.
   */
  private detectBuildTool(rootFiles: string[], deps: string[], devDeps: string[], framework: string): string {
    const allDeps = [...deps, ...devDeps];
    const fileSet = new Set(rootFiles);

    if (fileSet.has('vite.config.ts') || fileSet.has('vite.config.js') || fileSet.has('vite.config.mjs') || allDeps.includes('vite')) {
      return 'Vite';
    }
    if (framework === 'Next.js') {
      return 'Next';
    }
    if (fileSet.has('webpack.config.js') || allDeps.includes('webpack')) {
      return 'Webpack';
    }
    if (fileSet.has('Cargo.toml')) {
      return 'Cargo';
    }
    if (fileSet.has('go.mod')) {
      return 'Go Compiler';
    }
    if (fileSet.has('pom.xml')) {
      return 'Maven';
    }
    if (fileSet.has('build.gradle')) {
      return 'Gradle';
    }
    
    return 'npm';
  }

  /**
   * Scans candidates to resolve active entrypoint file paths.
   */
  private detectEntryPoint(rootPath: string): string {
    const candidates = [
      'src/main.tsx',
      'src/index.ts',
      'src/main.ts',
      'src/index.js',
      'src/App.tsx',
      'index.js',
      'main.py',
      'src/lib.rs',
      'src/main.rs',
      'main.go'
    ];

    for (const cand of candidates) {
      if (fs.existsSync(path.join(rootPath, cand))) {
        return cand;
      }
    }

    return 'index.js';
  }

  /**
   * Resolves the primary directory containing source elements.
   */
  private detectSourceFolder(rootPath: string): string {
    if (fs.existsSync(path.join(rootPath, 'src'))) return 'src';
    if (fs.existsSync(path.join(rootPath, 'lib'))) return 'lib';
    return '.';
  }
}

export const workspaceEngine = new WorkspaceEngine();
