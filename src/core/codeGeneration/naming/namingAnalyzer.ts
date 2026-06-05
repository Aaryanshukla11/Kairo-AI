import { namingGenerator } from './namingGenerator';
import { namingEvents } from './namingEvents';
import { namingMetrics } from './namingMetrics';
import { NamingReport, NamingEventType } from './namingTypes';
import { namingRegistry } from './namingRegistry';
import { typescriptNaming } from './providers/typescriptNaming';
import { javascriptNaming } from './providers/javascriptNaming';
import { reactNaming } from './providers/reactNaming';
import { nodeNaming } from './providers/nodeNaming';

export class NamingAnalyzer {
  constructor() {
    namingRegistry.register(typescriptNaming);
    namingRegistry.register(javascriptNaming);
    namingRegistry.register(reactNaming);
    namingRegistry.register(nodeNaming);
  }

  public analyzeAndGenerate(
    baseTerm: string,
    symbolType: string,
    casing: 'camelCase' | 'snakeCase' | 'PascalCase',
    existingFiles: string[]
  ): NamingReport {
    namingEvents.emit(NamingEventType.NamingStarted, { baseTerm, symbolType });

    namingEvents.emit(NamingEventType.SemanticAnalyzed, { symbolType });

    const report = namingGenerator.generateCandidates(baseTerm, symbolType, casing, existingFiles);

    namingEvents.emit(NamingEventType.CandidateGenerated, { report });

    if (report.collisionStatus !== 'none') {
      namingEvents.emit(NamingEventType.CollisionDetected, { report });
      namingMetrics.record(true);
    } else {
      namingMetrics.record(false);
    }

    namingEvents.emit(NamingEventType.NameValidated, { report });
    namingEvents.emit(NamingEventType.NamingCompleted, { report });

    return report;
  }
}

export const namingAnalyzer = new NamingAnalyzer();
