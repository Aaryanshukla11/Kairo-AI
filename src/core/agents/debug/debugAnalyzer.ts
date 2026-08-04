import { diagnosticsCollector } from './diagnosticsCollector';
import { stackTraceAnalyzer } from './stackTraceAnalyzer';
import { logAnalyzer } from './logAnalyzer';
import { rootCauseEngine } from './rootCauseEngine';
import { hypothesisEngine } from './hypothesisEngine';
import { DebugReport } from './debugTypes';

export class DebugAnalyzer {
  public analyze(rawDiagnostics: any): { report: DebugReport; hasCritical: boolean } {
    const evidence = diagnosticsCollector.collect(rawDiagnostics);
    
    // Parse stack trace frames
    const stackFrames = stackTraceAnalyzer.parse(rawDiagnostics.stackTrace || '');

    // Analyze logs
    const logAudit = logAnalyzer.analyze(evidence.logs);

    // Root cause resolution
    const resolution = rootCauseEngine.resolve(
      evidence.errorName,
      evidence.message,
      stackFrames
    );

    // Hypotheses generator
    const hypotheses = hypothesisEngine.generate(
      evidence.errorName,
      evidence.message,
      logAudit.hasCritical
    );

    // Confidence score calculation: Base (80) - Risk modifiers
    let confidenceScore = 80;
    if (logAudit.hasCritical) confidenceScore += 10;
    if (stackFrames.length === 0) confidenceScore -= 25;

    const finalScore = Math.max(10, Math.min(100, confidenceScore));

    const suggestedNextActions = [
      'Inspect line boundaries matching stack trace frames.',
      'Check environment configs settings files.'
    ];

    if (logAudit.hasCritical) {
      suggestedNextActions.unshift('Restart application host runtime to clear cached thread parameters.');
    }

    const report: DebugReport = {
      debugId: `dbg-report-${Date.now()}`,
      failureSummary: `Failed execution with unhandled ${evidence.errorName}: ${evidence.message}`,
      probableRootCause: resolution.probableCause,
      alternativeHypotheses: hypotheses,
      confidenceScore: finalScore,
      affectedComponents: resolution.affectedComponents,
      suggestedNextActions,
      relatedFiles: resolution.relatedFiles
    };

    return {
      report,
      hasCritical: logAudit.hasCritical
    };
  }
}

export const debugAnalyzer = new DebugAnalyzer();
