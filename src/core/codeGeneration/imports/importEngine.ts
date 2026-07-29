import { importAnalyzer } from './importAnalyzer';
import { importResolver } from './importResolver';
import { importOptimizer } from './importOptimizer';
import { importSorter } from './importSorter';
import { importValidator } from './importValidator';
import { aliasResolver } from './aliasResolver';
import { importEvents } from './importEvents';
import { importMetrics } from './importMetrics';
import { ImportStatement, ImportResolutionReport, ImportEventType } from './importTypes';
import { importRegistry } from './importRegistry';
import { typescriptImports } from './providers/typescriptImports';
import { javascriptImports } from './providers/javascriptImports';
import { reactImports } from './providers/reactImports';
import { nodeImports } from './providers/nodeImports';

export class ImportEngine {
  constructor() {
    importRegistry.register(typescriptImports);
    importRegistry.register(javascriptImports);
    importRegistry.register(reactImports);
    importRegistry.register(nodeImports);
  }

  public async resolveImports(
    targetFile: string,
    fileContent: string,
    requiredSymbols: string[]
  ): Promise<ImportResolutionReport> {
    importEvents.emit(ImportEventType.ImportAnalysisStarted, { targetFile });

    const existing = importAnalyzer.parseExisting(fileContent);

    const resolved: ImportStatement[] = [...existing];
    for (const sym of requiredSymbols) {
      const matched = importResolver.resolveMatch(sym);
      importEvents.emit(ImportEventType.SymbolResolved, { symbol: sym, matched });
      resolved.push(matched);
    }

    const { optimized, duplicates } = importOptimizer.optimize(resolved);
    importEvents.emit(ImportEventType.ImportOptimized, { optimizedCount: optimized.length });

    const sorted = importSorter.sort(optimized);

    importValidator.validateImports(sorted, targetFile);
    importEvents.emit(ImportEventType.ImportValidated, { sortedCount: sorted.length });

    const aliasResolution = aliasResolver.getAliases();

    const report: ImportResolutionReport = {
      targetFile,
      resolvedImports: sorted,
      missingImports: requiredSymbols.filter(s => !fileContent.includes(s)),
      duplicateImports: duplicates,
      unusedImports: [],
      aliasResolution,
      diagnostics: [],
      confidence: 0.95
    };

    importMetrics.record(0);
    importEvents.emit(ImportEventType.ImportResolutionCompleted, { report });

    return report;
  }

  public subscribe(listener: any): () => void {
    return importEvents.subscribe(listener);
  }
}

export const importEngine = new ImportEngine();
