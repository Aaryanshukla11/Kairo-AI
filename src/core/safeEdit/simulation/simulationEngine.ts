import { SimulationReport } from './simulationTypes';
import { virtualWorkspaceEngine } from '../../virtualWorkspace/virtualWorkspaceEngine';
import { simulationValidator } from './simulationValidator';
import { simulationMetrics } from './simulationMetrics';
import { simulationEvents } from './simulationEvents';

export class SimulationEngine {
  public async simulate(targetFile: string, patchContent: string): Promise<SimulationReport> {
    const startTime = Date.now();
    simulationEvents.emit('SimulationStarted', { targetFile });

    // Execute dry run inside Virtual Workspace
    const dryRunReport = await virtualWorkspaceEngine.simulateExecution(targetFile, patchContent);

    // Validate outcomes
    const validationResult = simulationValidator.validate(dryRunReport);
    const durationMs = Date.now() - startTime;

    const report: SimulationReport = {
      success: validationResult.success,
      dryRunReport,
      error: validationResult.error,
      durationMs
    };

    simulationMetrics.record(validationResult.success);
    simulationEvents.emit('SimulationCompleted', report);

    return report;
  }
}
export const simulationEngine = new SimulationEngine();
