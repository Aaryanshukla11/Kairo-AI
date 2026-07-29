import { debugAnalyzer } from './debugAnalyzer';
import { debugValidator } from './debugValidator';
import { debugMetrics } from './debugMetrics';
import { DebugEvents } from './debugEvents';
import { DebugReport, DebugEventType } from './debugTypes';

export class DebugBrain {
  constructor(private events: DebugEvents) {}

  public async runFailureAnalysis(diagnostics: any): Promise<DebugReport> {
    debugValidator.validateDiagnostics(diagnostics);
    debugValidator.validateLogs(diagnostics.logs || []);
    debugValidator.validateEnvironment(diagnostics.language || 'typescript', diagnostics.runtime || 'node');

    this.events.emit(DebugEventType.DebugStarted, { errorName: diagnostics.errorName });
    this.events.emit(DebugEventType.EvidenceCollected, { logsCount: (diagnostics.logs || []).length });

    const { report, hasCritical } = debugAnalyzer.analyze(diagnostics);

    this.events.emit(DebugEventType.RootCauseDetected, { cause: report.probableRootCause });
    
    for (const hyp of report.alternativeHypotheses) {
      this.events.emit(DebugEventType.HypothesisGenerated, { hypothesis: hyp });
    }

    debugMetrics.recordRun(hasCritical, report.confidenceScore);
    this.events.emit(DebugEventType.DebugCompleted, { report });

    return report;
  }
}
