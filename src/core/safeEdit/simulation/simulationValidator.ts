import { VirtualWorkspaceReport } from '../../virtualWorkspace/virtualWorkspaceTypes';

export class SimulationValidator {
  public validate(report: VirtualWorkspaceReport): { success: boolean; error?: string } {
    if (!report.syntaxVerificationPassed) {
      return { success: false, error: 'Syntax compilation failure in virtual workspace AST check.' };
    }
    if (!report.importsVerified) {
      return { success: false, error: 'Relative import verification failed in virtual workspace.' };
    }
    return { success: true };
  }
}
export const simulationValidator = new SimulationValidator();
