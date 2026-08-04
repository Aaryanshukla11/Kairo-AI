import * as fs from 'fs';
import * as path from 'path';
import { DependencyNode, DependencyGraphData } from './validationTypes';
import { circularDependencyDetector } from './circularDependencyDetector';

export class DependencyGraph {
  private baseDir: string;

  constructor(baseDir: string = path.resolve(__dirname, '../../')) {
    this.baseDir = baseDir;
  }

  public generate(): DependencyGraphData {
    const nodes: DependencyNode[] = [];
    const coreDir = path.join(this.baseDir, 'core');
    const commonDir = path.join(this.baseDir, 'common');

    const fileList: string[] = [];
    this.scanDir(coreDir, fileList);
    this.scanDir(commonDir, fileList);

    const moduleMap = new Map<string, { exports: string[]; imports: string[]; layer: string }>();

    for (const file of fileList) {
      const relPath = path.relative(this.baseDir, file).replace(/\\/g, '/');
      const ext = path.extname(file);
      const isTs = ext === '.ts' || ext === '.tsx';
      if (!isTs) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      const imports: string[] = [];
      const exports: string[] = [];

      // Simple regex parser for imports and exports
      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
      const exportRegex = /export\s+(const|class|interface|type|enum|function|let|var)\s+(\w+)/g;
      const exportDefaultRegex = /export\s+default\s+(\w+)/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
          // Resolve relative path
          const absoluteImport = path.resolve(path.dirname(file), importPath);
          let resolvedRel = path.relative(this.baseDir, absoluteImport).replace(/\\/g, '/');
          if (resolvedRel.endsWith('.ts') || resolvedRel.endsWith('.tsx')) {
            resolvedRel = resolvedRel.replace(/\.tsx?$/, '');
          }
          imports.push(resolvedRel);
        } else if (importPath.startsWith('@common/')) {
          imports.push(importPath.replace('@common/', 'common/'));
        } else {
          // External or node_modules
          imports.push(importPath);
        }
      }

      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[2]);
      }
      while ((match = exportDefaultRegex.exec(content)) !== null) {
        exports.push('default:' + match[1]);
      }

      // Determine layer based on first path component inside core
      let layer = 'shared';
      if (relPath.startsWith('core/')) {
        const parts = relPath.split('/');
        layer = parts[1] || 'core';
      } else if (relPath.startsWith('common/')) {
        layer = 'common';
      }

      const nodeId = relPath.replace(/\.tsx?$/, '');
      moduleMap.set(nodeId, { exports, imports, layer });
    }

    // Populate node structures
    for (const [nodeId, info] of moduleMap.entries()) {
      // Filter imports to only keep workspace modules
      const internalImports = info.imports.filter(imp => {
        // Resolve absolute if needed, otherwise check map
        if (moduleMap.has(imp)) return true;
        // Check with index.ts or other resolution
        if (moduleMap.has(imp + '/index')) return true;
        return false;
      }).map(imp => {
        if (moduleMap.has(imp)) return imp;
        return imp + '/index';
      });

      nodes.push({
        id: nodeId,
        name: path.basename(nodeId),
        imports: internalImports,
        exports: info.exports,
        layer: info.layer
      });
    }

    const circularPaths = circularDependencyDetector.detect(nodes);
    
    // Unused modules (no other module imports them)
    const importedSet = new Set<string>();
    for (const node of nodes) {
      for (const imp of node.imports) {
        importedSet.add(imp);
      }
    }
    // Exclude index, entry files, and common/ext entrypoints
    const unusedModules = nodes
      .filter(node => !importedSet.has(node.id) && !node.id.endsWith('/index') && node.id !== 'extension/index' && node.id !== 'webview/index')
      .map(node => node.id);

    // Duplicate providers check (e.g. classes with same name in providers subfolders)
    const providerClasses = new Map<string, string[]>();
    for (const node of nodes) {
      if (node.id.includes('/providers/')) {
        for (const exp of node.exports) {
          if (!providerClasses.has(exp)) {
            providerClasses.set(exp, []);
          }
          providerClasses.get(exp)!.push(node.id);
        }
      }
    }
    const duplicateProviders: string[] = [];
    for (const [exp, paths] of providerClasses.entries()) {
      if (paths.length > 1) {
        duplicateProviders.push(`Class '${exp}' duplicated in: ${paths.join(', ')}`);
      }
    }

    // Invalid references, orphan modules, etc.
    const invalidReferences: string[] = [];
    const orphanModules: string[] = [];

    for (const node of nodes) {
      if (node.imports.length === 0 && !importedSet.has(node.id)) {
        orphanModules.push(node.id);
      }
    }

    return {
      nodes,
      circularPaths,
      unusedModules,
      duplicateProviders,
      missingImports: [],
      missingExports: [],
      invalidReferences,
      orphanModules
    };
  }

  private scanDir(dir: string, fileList: string[]): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          this.scanDir(fullPath, fileList);
        }
      } else if (entry.isFile()) {
        fileList.push(fullPath);
      }
    }
  }
}

export const dependencyGraph = new DependencyGraph();
