import { dependencyAnalyzer } from './dependencyAnalyzer';
import { dependencyValidator } from './dependencyValidator';
import { dependencyGraph } from './dependencyGraph';
import { dependencyResolver } from './dependencyResolver';
import { compatibilityEngine } from './compatibilityEngine';
import { impactAnalyzer } from './impactAnalyzer';
import { licenseAnalyzer } from './licenseAnalyzer';
import { dependencyMetrics } from './dependencyMetrics';
import { DependencyEvents } from './dependencyEvents';
import { DependencyReport, HealthLevel, DepEventType } from './dependencyTypes';
import * as fs from 'fs';

export class DependencyBrain {
  constructor(private events: DependencyEvents) {}

  public async runDependencyAnalysis(packageJsonPath: string): Promise<DependencyReport> {
    this.events.emit(DepEventType.DependencyScanStarted, { path: packageJsonPath });

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`Dependency validation error: Manifest not found at ${packageJsonPath}`);
    }

    const raw = fs.readFileSync(packageJsonPath, 'utf-8');
    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch (err) {
      throw new Error('Dependency validation error: package.json is corrupted and failed to parse');
    }

    dependencyValidator.validateManifest(manifest);
    dependencyValidator.validatePackageManager('npm');

    const { nodes, edges } = dependencyAnalyzer.parseManifest(manifest);
    const resolvedEdges = dependencyResolver.resolveTransitive(edges);

    dependencyValidator.validateGraph(nodes, resolvedEdges);

    const circularDependencies = dependencyGraph.findCycles(resolvedEdges);
    if (circularDependencies.length > 0) {
      this.events.emit(DepEventType.CircularDependencyDetected, { cycles: circularDependencies });
    }

    const versionConflicts = compatibilityEngine.findConflicts(nodes);
    if (versionConflicts.length > 0) {
      this.events.emit(DepEventType.ConflictDetected, { conflicts: versionConflicts });
    }

    const packagesNames = nodes.map(n => n.name);
    const licenseSummary = licenseAnalyzer.parseLicenses(packagesNames);
    const impactAnalysis = impactAnalyzer.analyzeImpact(resolvedEdges);

    const compatibilityScore = Math.max(10, 100 - versionConflicts.length * 15);
    const healthLevel = circularDependencies.length > 0 ? HealthLevel.Critical : (versionConflicts.length > 0 ? HealthLevel.Warning : HealthLevel.Healthy);

    const recommendations = versionConflicts.map(v => `Resolve version conflict in ${v.packageName} (resolved: ${v.resolved}, required: ${v.required}).`);
    if (circularDependencies.length > 0) {
      recommendations.unshift('Break circular dependency loops in module imports graph.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Ecosystem is clean. No adjustments recommended.');
    }

    const report: DependencyReport = {
      dependencyId: `dep-report-${Date.now()}`,
      nodes,
      edges: resolvedEdges,
      circularDependencies,
      versionConflicts,
      compatibilityScore,
      healthLevel,
      licenseSummary,
      impactAnalysis,
      recommendations
    };

    dependencyMetrics.recordScan(nodes.length, circularDependencies.length);
    this.events.emit(DepEventType.DependencyAnalysisCompleted, { report });

    return report;
  }
}
