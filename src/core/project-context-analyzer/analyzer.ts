import * as fs from 'fs';
import * as path from 'path';
import { IProjectContextOutput, IWorkspaceInfo, ITechStackInfo, IDependencyInfo } from './types';

export class ProjectContextAnalyzer {
  public analyze(rootDir: string): IProjectContextOutput {
    if (!fs.existsSync(rootDir)) {
      return this.getDefaultContext();
    }

    const files = this.safelyReadDir(rootDir);
    const hasGit = fs.existsSync(path.join(rootDir, '.git'));
    const isEmpty = files.length === 0 || (files.length === 1 && files[0] === '.git');

    // Detect package manager lock files
    let packageManager: string | null = null;
    if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
      packageManager = 'npm';
    } else if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) {
      packageManager = 'yarn';
    } else if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    }

    // Detect Monorepo flags
    const hasApps = fs.existsSync(path.join(rootDir, 'apps')) && fs.statSync(path.join(rootDir, 'apps')).isDirectory();
    const hasPackages = fs.existsSync(path.join(rootDir, 'packages')) && fs.statSync(path.join(rootDir, 'packages')).isDirectory();
    const isMonorepo = hasApps || hasPackages;

    let appsCount = 0;
    let packagesCount = 0;
    if (hasApps) {
      appsCount = this.safelyReadDir(path.join(rootDir, 'apps')).length;
    }
    if (hasPackages) {
      packagesCount = this.safelyReadDir(path.join(rootDir, 'packages')).length;
    }

    const packageJsonPath = path.join(rootDir, 'package.json');
    const hasPackageJson = fs.existsSync(packageJsonPath);
    const isProjectPresent = hasPackageJson || fs.existsSync(path.join(rootDir, 'requirements.txt')) || fs.existsSync(path.join(rootDir, 'Cargo.toml'));

    const workspace: IWorkspaceInfo = {
      isEmpty,
      isProjectPresent,
      isMonorepo,
      appsCount,
      packagesCount,
      hasGit,
      packageManager
    };

    // Analyze dependencies
    let dependencies: Record<string, string> = {};
    if (hasPackageJson) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        dependencies = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {})
        };
      } catch (err) {
        // Corrupted package.json
      }
    }

    // Detect Tech Stack
    const techStack = this.detectTechStack(rootDir, dependencies);

    // Detect Important Files
    const importantFilesList = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'vite.config.js',
      'next.config.js',
      'next.config.mjs',
      'tailwind.config.js',
      'docker-compose.yml',
      'Dockerfile',
      '.env',
      'README.md'
    ];
    const importantFiles = importantFilesList.filter(f => fs.existsSync(path.join(rootDir, f)));

    // Detect Entry Points
    const entryPointsList = [
      'src/index.ts',
      'src/main.ts',
      'src/main.tsx',
      'src/App.tsx',
      'index.js',
      'server.js',
      'app.js'
    ];
    const entryPoints = entryPointsList.filter(e => fs.existsSync(path.join(rootDir, e)));

    // Detect Project Type
    let projectType = 'Unknown';
    if (techStack.frontendFramework === 'Next.js') {
      projectType = 'Next.js';
    } else if (techStack.frontendFramework === 'React') {
      projectType = 'React';
    } else if (techStack.frontendFramework === 'Vue') {
      projectType = 'Vue';
    } else if (techStack.backendFramework === 'NestJS') {
      projectType = 'NestJS';
    } else if (techStack.backendFramework === 'Express') {
      projectType = 'Express';
    } else if (techStack.backendFramework === 'Node.js') {
      projectType = 'Node.js';
    }

    // Generate Health Summary
    let projectHealth: IProjectContextOutput['projectHealth'] = 'Healthy';
    if (hasPackageJson) {
      try {
        JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      } catch (e) {
        projectHealth = 'Configuration Error';
      }
    }
    
    // Check if node_modules is missing when dependencies exist
    if (hasPackageJson && Object.keys(dependencies).length > 0 && !fs.existsSync(path.join(rootDir, 'node_modules'))) {
      projectHealth = 'Missing Dependencies';
    }

    const dependencyInfo: IDependencyInfo = {
      installed: Object.freeze(dependencies),
      missing: [],
      unused: [],
      peerIssues: []
    };

    return {
      workspace,
      projectType,
      techStack,
      importantFiles: Object.freeze(importantFiles),
      entryPoints: Object.freeze(entryPoints),
      dependencies: dependencyInfo,
      projectHealth
    };
  }

  private detectTechStack(rootDir: string, deps: Record<string, string>): ITechStackInfo {
    const hasDep = (name: string) => Object.prototype.hasOwnProperty.call(deps, name);

    let language: string | null = null;
    if (fs.existsSync(path.join(rootDir, 'tsconfig.json')) || hasDep('typescript')) {
      language = 'TypeScript';
    } else if (hasDep('javascript') || fs.existsSync(path.join(rootDir, 'package.json'))) {
      language = 'JavaScript';
    }

    let frontendFramework: string | null = null;
    if (hasDep('next')) {
      frontendFramework = 'Next.js';
    } else if (hasDep('react')) {
      frontendFramework = 'React';
    } else if (hasDep('vue')) {
      frontendFramework = 'Vue';
    } else if (hasDep('@angular/core')) {
      frontendFramework = 'Angular';
    } else if (hasDep('svelte')) {
      frontendFramework = 'Svelte';
    }

    let backendFramework: string | null = null;
    if (hasDep('@nestjs/core')) {
      backendFramework = 'NestJS';
    } else if (hasDep('express')) {
      backendFramework = 'Express';
    } else if (hasDep('koa')) {
      backendFramework = 'Koa';
    } else if (fs.existsSync(path.join(rootDir, 'package.json'))) {
      backendFramework = 'Node.js';
    }

    let database: string | null = null;
    if (hasDep('pg') || hasDep('postgres')) {
      database = 'PostgreSQL';
    } else if (hasDep('mysql') || hasDep('mysql2')) {
      database = 'MySQL';
    } else if (hasDep('mongodb') || hasDep('mongoose')) {
      database = 'MongoDB';
    } else if (hasDep('sqlite3')) {
      database = 'SQLite';
    }

    let orm: string | null = null;
    if (hasDep('@prisma/client') || hasDep('prisma')) {
      orm = 'Prisma';
    } else if (hasDep('sequelize')) {
      orm = 'Sequelize';
    } else if (hasDep('typeorm')) {
      orm = 'TypeORM';
    } else if (hasDep('mongoose')) {
      orm = 'Mongoose';
    }

    let authLibrary: string | null = null;
    if (hasDep('jsonwebtoken') || hasDep('jose')) {
      authLibrary = 'JWT';
    } else if (hasDep('next-auth')) {
      authLibrary = 'NextAuth';
    } else if (hasDep('passport')) {
      authLibrary = 'Passport.js';
    }

    let uiLibrary: string | null = null;
    if (hasDep('@mui/material')) {
      uiLibrary = 'Material UI';
    } else if (hasDep('antd')) {
      uiLibrary = 'Ant Design';
    } else if (hasDep('@chakra-ui/react')) {
      uiLibrary = 'Chakra UI';
    }

    let cssFramework: string | null = null;
    if (hasDep('tailwindcss')) {
      cssFramework = 'Tailwind CSS';
    } else if (hasDep('bootstrap')) {
      cssFramework = 'Bootstrap';
    }

    let stateManagement: string | null = null;
    if (hasDep('redux') || hasDep('@reduxjs/toolkit')) {
      stateManagement = 'Redux';
    } else if (hasDep('zustand')) {
      stateManagement = 'Zustand';
    } else if (hasDep('mobx')) {
      stateManagement = 'MobX';
    }

    let testingFramework: string | null = null;
    if (hasDep('jest')) {
      testingFramework = 'Jest';
    } else if (hasDep('vitest')) {
      testingFramework = 'Vitest';
    } else if (hasDep('cypress')) {
      testingFramework = 'Cypress';
    }

    let buildTool: string | null = null;
    if (hasDep('vite')) {
      buildTool = 'Vite';
    } else if (hasDep('webpack')) {
      buildTool = 'Webpack';
    }

    return {
      language,
      frontendFramework,
      backendFramework,
      database,
      orm,
      authLibrary,
      uiLibrary,
      cssFramework,
      stateManagement,
      testingFramework,
      buildTool
    };
  }

  private safelyReadDir(dir: string): string[] {
    try {
      return fs.readdirSync(dir);
    } catch {
      return [];
    }
  }

  public getDefaultContext(): IProjectContextOutput {
    return {
      workspace: {
        isEmpty: true,
        isProjectPresent: false,
        isMonorepo: false,
        appsCount: 0,
        packagesCount: 0,
        hasGit: false,
        packageManager: null
      },
      projectType: 'Unknown',
      techStack: {
        language: null,
        frontendFramework: null,
        backendFramework: null,
        database: null,
        orm: null,
        authLibrary: null,
        uiLibrary: null,
        cssFramework: null,
        stateManagement: null,
        testingFramework: null,
        buildTool: null
      },
      importantFiles: [],
      entryPoints: [],
      dependencies: {
        installed: {},
        missing: [],
        unused: [],
        peerIssues: []
      },
      projectHealth: 'Incomplete Project'
    };
  }
}

export const projectContextAnalyzer = new ProjectContextAnalyzer();
export default projectContextAnalyzer;
