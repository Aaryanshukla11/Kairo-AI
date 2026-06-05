import * as fs from 'fs';
import * as path from 'path';
import { PlatformValidationReport, PlatformHealthReport } from './validationTypes';

export class ValidationReportGenerator {
  private baseDir: string;

  constructor(baseDir: string = path.resolve(__dirname, '../../../')) {
    this.baseDir = baseDir;
  }

  public generateAndSaveReports(
    report: PlatformValidationReport,
    health: PlatformHealthReport
  ): void {
    const archReportPath = path.join(this.baseDir, 'ARCHITECTURE_HEALTH_REPORT.md');
    const platformReportPath = path.join(this.baseDir, 'PLATFORM_VALIDATION_REPORT.md');
    const depReportPath = path.join(this.baseDir, 'DEPENDENCY_GRAPH_REPORT.md');

    fs.writeFileSync(archReportPath, this.compileArchitectureHealthReport(report, health));
    fs.writeFileSync(platformReportPath, this.compilePlatformValidationReport(report, health));
    fs.writeFileSync(depReportPath, this.compileDependencyGraphReport(report));
  }

  public compileArchitectureHealthReport(
    report: PlatformValidationReport,
    health: PlatformHealthReport
  ): string {
    const subsystemsTable = Object.entries(health.subsystems)
      .map(([name, info]) => {
        const statusIcon = info.status === 'Healthy' ? '🟢' : info.status === 'Degraded' ? '🟡' : '🔴';
        return `| ${name} | ${statusIcon} ${info.status} | ${info.score}% | ${info.checksCount} | ${info.passedChecks}/${info.failedChecks} |`;
      })
      .join('\n');

    return `# Architecture Health Report

Generated on: ${new Date(report.timestamp).toUTCString()}
Report ID: ${report.id}

## Subsystem Health Matrix

| Subsystem | Status | Health Score | Total Checks | Pass/Fail |
|---|---|---|---|---|
${subsystemsTable}

## Architecture Scoring Breakdown

- **Overall Architecture Score**: ${report.scores.architecture}%
- **Module Boundary Health**: ${report.scores.moduleHealth}%
- **Provider Pattern Health**: ${report.scores.providerHealth}%
- **Registry Structure Health**: ${report.scores.registryHealth}%

## Module Boundary Violations
${report.boundaryReport.violations.length === 0 ? '_No direct violations detected._' : report.boundaryReport.violations.map(v => `- ${v}`).join('\n')}

## Layer Leaks
${report.boundaryReport.layerLeaks.length === 0 ? '_No layer leaks detected._' : report.boundaryReport.layerLeaks.map(v => `- ${v}`).join('\n')}

## Recovery Recommendations
${health.recoveryRecommendations.map(r => `- ${r}`).join('\n')}
`;
  }

  public compilePlatformValidationReport(
    report: PlatformValidationReport,
    health: PlatformHealthReport
  ): string {
    const resultsList = Object.entries(report.results)
      .map(([name, res]) => {
        const icon = res.status === 'Passed' ? '✅' : res.status === 'Warning' ? '⚠️' : '❌';
        return `### ${icon} ${res.name} (Score: ${res.score}%)
- **Target Subsystem**: ${res.targetSubsystem}
- **Status**: ${res.status}
- **Details**: ${res.details || 'No additional details.'}
${res.errors && res.errors.length > 0 ? `- **Errors**:\n  ${res.errors.map(e => `  - ${e}`).join('\n  ')}` : ''}
${res.warnings && res.warnings.length > 0 ? `- **Warnings**:\n  ${res.warnings.map(w => `  - ${w}`).join('\n  ')}` : ''}
`;
      })
      .join('\n');

    const stepsTable = report.pipelineSteps
      .map(step => {
        const icon = step.status === 'Success' ? '🟢' : step.status === 'Warning' ? '🟡' : '🔴';
        return `| ${step.stage} | ${icon} ${step.status} | ${step.durationMs}ms | ${step.outputPassed ? 'Yes' : 'No'} |`;
      })
      .join('\n');

    return `# Platform Validation Report

## Overview
- **Overall Health Score**: ${report.overallHealthScore}%
- **Risk Level**: ${health.riskLevel}
- **Trend**: ${health.trend}
- **Pipeline Execution Status**: ${report.pipelineStatus}
- **Errors Count**: ${report.errors.length}
- **Warnings Count**: ${report.warnings.length}

## Pipeline Integration Workflow Status
| Stage | Status | Duration | Output Passed |
|---|---|---|---|
${stepsTable}

## Detailed Validation Results
${resultsList}

## Platform Health Recovery Action Items
${health.recoveryRecommendations.map(r => `- ${r}`).join('\n')}
`;
  }

  public compileDependencyGraphReport(report: PlatformValidationReport): string {
    const cycleList = report.dependencyGraph.circularPaths
      .map((path, idx) => `${idx + 1}. ${path.join(' -> ')}`)
      .join('\n');

    const duplicateProvidersList = report.dependencyGraph.duplicateProviders
      .map(p => `- ${p}`)
      .join('\n');

    const unusedList = report.dependencyGraph.unusedModules
      .map(m => `- \`${m}\``)
      .join('\n');

    const orphanList = report.dependencyGraph.orphanModules
      .map(m => `- \`${m}\``)
      .join('\n');

    return `# Dependency Graph Report

## Analysis Summary
- **Total Modules Scanned**: ${report.dependencyGraph.nodes.length}
- **Circular Paths Detected**: ${report.dependencyGraph.circularPaths.length}
- **Unused Modules Detected**: ${report.dependencyGraph.unusedModules.length}
- **Duplicate Providers Detected**: ${report.dependencyGraph.duplicateProviders.length}
- **Orphan Modules Detected**: ${report.dependencyGraph.orphanModules.length}

## Circular Dependencies
${report.dependencyGraph.circularPaths.length === 0 ? '_No circular dependencies detected._' : cycleList}

## Duplicate Providers
${report.dependencyGraph.duplicateProviders.length === 0 ? '_No duplicate providers detected._' : duplicateProvidersList}

## Unused Modules
${report.dependencyGraph.unusedModules.length === 0 ? '_No unused modules detected._' : unusedList}

## Orphan Modules (Isolated modules with no dependencies)
${report.dependencyGraph.orphanModules.length === 0 ? '_No orphan modules detected._' : orphanList}
`;
  }
}

export const validationReportGenerator = new ValidationReportGenerator();
export default validationReportGenerator;
