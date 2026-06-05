import { performanceAnalyzer } from './performanceAnalyzer';
import { performanceValidator } from './performanceValidator';
import { performanceMetrics } from './performanceMetrics';
import { PerformanceEvents } from './performanceEvents';
import { PerformanceReport, PerformanceEventType } from './performanceTypes';

export class PerformanceBrain {
  constructor(private events: PerformanceEvents) {}

  public async runProfilerAudit(filePath: string): Promise<PerformanceReport> {
    this.events.emit(PerformanceEventType.AnalysisStarted, { file: filePath });

    const report = performanceAnalyzer.runAnalysis(filePath);

    performanceValidator.validateMetrics({
      buildTimeMs: report.buildTimeMs,
      memoryUsageMb: report.memoryUsageMb
    });

    for (const b of report.detectedBottlenecks) {
      this.events.emit(PerformanceEventType.BottleneckDetected, { bottleneck: b });
    }

    for (const s of report.optimizationSuggestions) {
      this.events.emit(PerformanceEventType.OptimizationSuggested, { suggestion: s });
    }

    performanceMetrics.recordRun(report.overallScore, report.buildTimeMs);
    this.events.emit(PerformanceEventType.PerformanceAnalysisCompleted, { report });

    return report;
  }
}
