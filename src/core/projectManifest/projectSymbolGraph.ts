export interface ISymbolDefinition {
  name: string;
  kind: 'type' | 'interface' | 'function' | 'class' | 'const' | 'variable' | 'component';
  filePath: string;
  isExported: boolean;
  typeSignature?: string;
}

export interface IFileDependencyNode {
  filePath: string;
  exports: ISymbolDefinition[];
  imports: Array<{
    sourceFilePath: string;
    importedSymbols: string[];
    rawImportPath: string;
  }>;
  dependencies: string[]; // List of filePaths this file depends on
  dependents: string[];   // List of filePaths that depend on this file
}

export interface IProjectSingleSourceOfTruth {
  sessionId: string;
  requestId: string;
  requirements: {
    prompt: string;
    intent: string;
    features: string[];
  };
  techStack: string[];
  architectureBlueprint?: any;
  folderStructure: string[];
  files: Record<string, IFileDependencyNode>;
  apiContracts: Array<{
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    requestBodyType?: string;
    responseType?: string;
  }>;
  dataModels: Array<{
    modelName: string;
    fields: Record<string, string>;
  }>;
  designSystem: {
    primaryColor: string;
    fontFamily: string;
    responsiveBreakpoints: string[];
  };
}

export class ProjectSymbolGraph {
  private state: IProjectSingleSourceOfTruth;

  constructor(sessionId: string, requestId: string, prompt: string, techStack: string[] = []) {
    this.state = {
      sessionId,
      requestId,
      requirements: {
        prompt,
        intent: 'NEW_PROJECT',
        features: []
      },
      techStack,
      folderStructure: [],
      files: {},
      apiContracts: [],
      dataModels: [],
      designSystem: {
        primaryColor: '#3b82f6',
        fontFamily: 'Inter, sans-serif',
        responsiveBreakpoints: ['sm: 640px', 'md: 768px', 'lg: 1024px', 'xl: 1280px']
      }
    };
  }

  public getState(): Readonly<IProjectSingleSourceOfTruth> {
    return this.state;
  }

  public registerFile(filePath: string, exports: ISymbolDefinition[] = [], rawImports: Array<{ sourceFilePath: string; importedSymbols: string[]; rawImportPath: string }> = []): void {
    if (!this.state.files[filePath]) {
      this.state.files[filePath] = {
        filePath,
        exports: [],
        imports: [],
        dependencies: [],
        dependents: []
      };
      if (!this.state.folderStructure.includes(filePath)) {
        this.state.folderStructure.push(filePath);
      }
    }

    const fileNode = this.state.files[filePath];
    fileNode.exports = exports;
    fileNode.imports = rawImports;

    // Recompute dependency relationships
    rawImports.forEach(imp => {
      if (imp.sourceFilePath && this.state.files[imp.sourceFilePath]) {
        if (!fileNode.dependencies.includes(imp.sourceFilePath)) {
          fileNode.dependencies.push(imp.sourceFilePath);
        }
        const targetNode = this.state.files[imp.sourceFilePath];
        if (!targetNode.dependents.includes(filePath)) {
          targetNode.dependents.push(filePath);
        }
      }
    });
  }

  public parseAndRecordGeneratedCode(filePath: string, code: string): void {
    const exports: ISymbolDefinition[] = [];
    const imports: Array<{ sourceFilePath: string; importedSymbols: string[]; rawImportPath: string }> = [];

    // Extract export statements
    const exportTypeRegex = /export\ (?:type|interface|class|function|const)\ ([A-Za-z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = exportTypeRegex.exec(code)) !== null) {
      exports.push({
        name: match[1],
        kind: match[0].includes('interface') ? 'interface' : match[0].includes('type') ? 'type' : 'const',
        filePath,
        isExported: true
      });
    }

    // Extract import statements
    const importRegex = /import\ \{([^}]+)\}\ from\ ['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(code)) !== null) {
      const symbols = match[1].split(',').map(s => s.trim()).filter(Boolean);
      const rawPath = match[2];
      imports.push({
        sourceFilePath: rawPath,
        importedSymbols: symbols,
        rawImportPath: rawPath
      });
    }

    this.registerFile(filePath, exports, imports);
  }

  public getRelevantContextForGenerator(targetFiles: string[]): {
    projectState: IProjectSingleSourceOfTruth;
    relevantExports: ISymbolDefinition[];
    relevantFiles: string[];
  } {
    const relevantFilesSet = new Set<string>(targetFiles);
    const relevantExports: ISymbolDefinition[] = [];

    targetFiles.forEach(tf => {
      const node = this.state.files[tf];
      if (node) {
        node.dependencies.forEach(d => relevantFilesSet.add(d));
      }
    });

    Object.values(this.state.files).forEach(f => {
      if (relevantFilesSet.has(f.filePath)) {
        relevantExports.push(...f.exports);
      }
    });

    return {
      projectState: this.state,
      relevantExports,
      relevantFiles: Array.from(relevantFilesSet)
    };
  }

  public validateCrossFileIntegrity(filePath: string, code: string): {
    valid: boolean;
    issues: Array<{
      issueType: 'MISSING_EXPORT' | 'INVALID_IMPORT' | 'SYNTAX_ERROR';
      exactProblem: string;
      affectedSymbol: string;
      suggestedFix: string;
    }>;
  } {
    const issues: Array<{
      issueType: 'MISSING_EXPORT' | 'INVALID_IMPORT' | 'SYNTAX_ERROR';
      exactProblem: string;
      affectedSymbol: string;
      suggestedFix: string;
    }> = [];

    const importRegex = /import\ \{([^}]+)\}\ from\ ['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    const allExportedSymbols = new Set<string>();
    Object.values(this.state.files).forEach(f => {
      f.exports.forEach(e => allExportedSymbols.add(e.name));
    });

    while ((match = importRegex.exec(code)) !== null) {
      const symbols = match[1].split(',').map(s => s.trim()).filter(Boolean);
      const rawPath = match[2];

      symbols.forEach(sym => {
        // If symbol starts with uppercase (type/component) and is not in global React scope, check symbol graph
        if (/^[A-Z]/.test(sym) && !['React', 'useState', 'useEffect', 'useContext', 'useRef', 'FC'].includes(sym)) {
          if (allExportedSymbols.size > 0 && !allExportedSymbols.has(sym)) {
            issues.push({
              issueType: 'MISSING_EXPORT',
              exactProblem: `Imported symbol '${sym}' from '${rawPath}' is not exported by any file in the project.`,
              affectedSymbol: sym,
              suggestedFix: `Export interface or component '${sym}' in '${rawPath}' or update import name.`
            });
          }
        }
      });
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
