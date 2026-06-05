import { symbolAnalyzer } from './symbolAnalyzer';
import { symbolResolver } from './symbolResolver';
import { symbolGraph } from './symbolGraph';
import { symbolValidator } from './symbolValidator';
import { namespaceResolver } from './namespaceResolver';
import { referenceResolver } from './referenceResolver';
import { symbolEvents } from './symbolEvents';
import { symbolMetrics } from './symbolMetrics';
import { SymbolDefinition, SymbolResolutionReport, SymbolEventType } from './symbolTypes';
import { symbolRegistry } from './symbolRegistry';
import { typescriptSymbols } from './providers/typescriptSymbols';
import { javascriptSymbols } from './providers/javascriptSymbols';
import { reactSymbols } from './providers/reactSymbols';
import { nodeSymbols } from './providers/nodeSymbols';

export class SymbolEngine {
  constructor() {
    symbolRegistry.register(typescriptSymbols);
    symbolRegistry.register(javascriptSymbols);
    symbolRegistry.register(reactSymbols);
    symbolRegistry.register(nodeSymbols);
  }

  public async resolveSymbols(
    targetFile: string,
    fileContent: string,
    requiredSymbols: string[]
  ): Promise<SymbolResolutionReport> {
    symbolEvents.emit(SymbolEventType.ResolutionStarted, { targetFile });

    const namespace = namespaceResolver.resolveNamespace(targetFile);
    symbolEvents.emit(SymbolEventType.NamespaceResolved, { namespace });

    const defined = symbolAnalyzer.parseExisting(fileContent, namespace);
    symbolEvents.emit(SymbolEventType.CandidateFound, { candidates: defined });

    const resolved: SymbolDefinition[] = [...defined];
    for (const sym of requiredSymbols) {
      const matched = symbolResolver.resolveMatch(sym, namespace);
      symbolEvents.emit(SymbolEventType.ReferenceResolved, { symbol: sym, matched });
      resolved.push(matched);
    }

    symbolValidator.validateDefinitions(resolved);
    for (const sym of resolved) {
      symbolValidator.validateVisibility(sym, targetFile);
    }
    symbolEvents.emit(SymbolEventType.SymbolValidated, { count: resolved.length });

    const nodes = resolved.map(s => s.name);
    const refGraph = symbolGraph.buildGraph(nodes);

    const report: SymbolResolutionReport = {
      resolvedSymbols: resolved,
      unresolvedSymbols: [],
      referenceGraph: refGraph,
      namespaceInfo: [namespace],
      visibility: 'public',
      diagnostics: [],
      confidence: 0.95
    };

    symbolMetrics.record(0);
    symbolEvents.emit(SymbolEventType.ResolutionCompleted, { report });

    return report;
  }

  public subscribe(listener: any): () => void {
    return symbolEvents.subscribe(listener);
  }
}

export const symbolEngine = new SymbolEngine();
