import { testingStrategies } from './testingStrategies';
import { testingPlanner } from './testingPlanner';
import { testingRunner } from './testingRunner';
import { testingCoverage } from './testingCoverage';
import { testingMetrics } from './testingMetrics';
import { testingValidator } from './testingValidator';
import { TestingEvents } from './testingEvents';
import { TestingReport, TestingEventType } from './testingTypes';

export class TestingBrain {
  constructor(private events: TestingEvents) {}

  public async runTestingWorkflow(executionReport: any, framework: string = 'simulated'): Promise<TestingReport> {
    let folders: any = undefined;
    try {
      const vscode = require('vscode');
      folders = vscode?.workspace?.workspaceFolders;
    } catch {}
    testingValidator.validateRequest(executionReport, folders as any);
    testingValidator.validateFramework(framework);

    this.events.emit(TestingEventType.TestingStarted, { executionId: executionReport.executionId });

    const affectedFiles = executionReport.generatedArtifacts || [];
    const riskLevel = testingStrategies.determineRiskLevel(affectedFiles);
    const testTypes = testingStrategies.recommendTestTypes(riskLevel);
    
    this.events.emit(TestingEventType.StrategySelected, { riskLevel, testTypes });

    const testPlan = testingPlanner.createTestPlan(executionReport.planId, riskLevel, testTypes, affectedFiles);

    const runResult = await testingRunner.execute(testPlan);
    
    const passed = runResult.passedTests || [];
    const failed = runResult.failedTests || [];
    const skipped = runResult.skippedTests || [];
    const warnings = runResult.warnings || [];
    const recommendations = runResult.recommendations || [];

    for (const t of passed) {
      this.events.emit(TestingEventType.TestPassed, { testName: t });
    }
    for (const t of failed) {
      this.events.emit(TestingEventType.TestFailed, { testName: t });
    }

    const coverage = testingCoverage.estimate(testPlan);
    this.events.emit(TestingEventType.CoverageCalculated, { coverage });

    let riskPenalty = 0;
    if (riskLevel === 'Critical') riskPenalty = 25;
    else if (riskLevel === 'High') riskPenalty = 15;
    else if (riskLevel === 'Medium') riskPenalty = 8;
    else if (riskLevel === 'Low') riskPenalty = 3;

    const confidenceScore = Math.max(0, Math.min(100, 100 - (failed.length * 12) - (warnings.length * 6) - riskPenalty));
    const duration = runResult.durationMs || 0;

    testingMetrics.recordRun(duration, passed.length, failed.length, confidenceScore, coverage);

    const report: TestingReport = {
      testingId: `test-run-${Date.now()}`,
      coverageEstimate: coverage,
      confidenceScore,
      passedTests: passed,
      failedTests: failed,
      skippedTests: skipped,
      warnings,
      recommendations,
      durationMs: duration
    };

    this.events.emit(TestingEventType.TestingCompleted, { report });

    return report;
  }
}
