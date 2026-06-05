import { VirtualWorkspaceReport } from '../../virtualWorkspace/virtualWorkspaceTypes';

export interface SimulationReport {
  success: boolean;
  dryRunReport: VirtualWorkspaceReport;
  error?: string;
  durationMs: number;
}
export type SimulationEventListener = (event: any) => void;
