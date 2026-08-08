import { DogfoodingRunResult } from '../releaseTypes';
import { DogfoodingEventLog } from './workflowRecorder';

export class DogfoodingReport {
  public compileReport(result: DogfoodingRunResult, logs: DogfoodingEventLog[]): string {
    const listLogs = logs
      .map(log => `- **${log.stepName}**: ${log.status === 'Success' ? '🟢 SUCCESS' : '🔴 FAILED'} (${log.details || ''})`)
      .join('\n');

    return `# Dogfooding Run Report

Generated: ${new Date().toUTCString()}
Run ID: ${result.runId}

## Feature Request
"${result.featureRequest}"

## Self-Improvement Validation Lifecycle Logs
${listLogs}

## Verification Parameters Assertions
- **Planning successfully verified**: ${result.planningPassed ? '🟢 YES' : '🔴 NO'}
- **Code generation verified**: ${result.codeGenerated ? '🟢 YES' : '🔴 NO'}
- **Tests compilation checks validation**: ${result.testsExecuted ? '🟢 YES' : '🔴 NO'}
- **Patch formats validation**: ${result.patchProduced ? '🟢 YES' : '🔴 NO'}
- **Safe Edit sandbox checks validation**: ${result.safeEditPassed ? '🟢 YES' : '🔴 NO'}

## Exported Patch Contents
\`\`\`diff
${result.patchContent}
\`\`\`
`;
  }
}

export const dogfoodingReport = new DogfoodingReport();
