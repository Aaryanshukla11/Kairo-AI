import { architectureAnalyzer } from './architectureAnalyzer';
import { architectureGraph } from './architectureGraph';
import { architectureRules } from './architectureRules';
import { architectureValidator } from './architectureValidator';
import { architectureScorer } from './architectureScorer';
import { driftDetector } from './driftDetector';
import { boundaryAnalyzer } from './boundaryAnalyzer';
import { architectureMetrics } from './architectureMetrics';
import { ArchitectureEvents } from './architectureEvents';
import { ArchitectureReport, ArchEventType } from './architectureTypes';

export class ArchitectureBrain {
  constructor(private events: ArchitectureEvents) {}

  public async runArchitectureAnalysis(filesMap: { [path: string]: string }): Promise<ArchitectureReport> {
    this.events.emit(ArchEventType.ArchitectureAnalysisStarted, { filesCount: Object.keys(filesMap).length });

    const { nodes, edges } = architectureGraph.buildMockGraph();
    architectureValidator.validateGraphRequest({ nodes, edges });
    architectureValidator.validateMetadata({ strictLayers: true });
    architectureValidator.validateModuleGraph(nodes);

    const layerViolations = architectureRules.verifyRules(nodes, edges);
    for (const v of layerViolations) {
      this.events.emit(ArchEventType.ViolationDetected, { violation: v });
    }

    const boundaryViolations = boundaryAnalyzer.checkBoundaries(filesMap);
    for (const v of boundaryViolations) {
      this.events.emit(ArchEventType.ViolationDetected, { violation: v });
    }

    const activeFolders = ['src/core', 'src/webview', 'src/extension', 'src/common'];
    const prescribedFolders = ['src/core', 'src/webview', 'src/extension', 'src/common', 'src/cortex'];
    const driftViolations = driftDetector.detectDrift(activeFolders, prescribedFolders);
    for (const d of driftViolations) {
      this.events.emit(ArchEventType.DriftDetected, { drift: d });
    }

    const allViolations = [...layerViolations, ...boundaryViolations, ...driftViolations];
    const { score, technicalDebtHours, scalability, maintainability } = architectureScorer.calculateScores(
      allViolations,
      driftViolations.length
    );

    const recommendations = allViolations.map(v => `Refactor "${v.file}" to resolve ${v.type}: ${v.description}`);
    if (recommendations.length === 0) {
      recommendations.push('Structure complies fully with layer rules.');
    } else {
      this.events.emit(ArchEventType.RecommendationGenerated, { count: recommendations.length });
    }

    const report: ArchitectureReport = {
      architectureId: `arch-report-${Date.now()}`,
      architectureScore: score,
      technicalDebtScore: technicalDebtHours,
      layerViolations,
      boundaryViolations,
      dependencyIssues: allViolations.map(v => v.description),
      scalabilityScore: scalability,
      maintainabilityScore: maintainability,
      recommendations,
      nodes,
      edges
    };

    architectureMetrics.recordAudit(allViolations.length, technicalDebtHours);
    this.events.emit(ArchEventType.ArchitectureAnalysisCompleted, { report });

    return report;
  }
}
