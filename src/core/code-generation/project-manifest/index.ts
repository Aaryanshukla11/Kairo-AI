import { IWorkspaceBlueprint } from '../workspace-scaffolder';
import { IProjectManifest } from './schema';
import { generatorOwnershipMapper } from './ownership';
import { fileDependencyAnalyzer } from './dependency';
import { executionPlanner } from './execution';
import { rollbackPlanner } from './rollback';
import { manifestValidator } from './validation';
import { logger } from '../logger';

export class ProjectManifestEngine {
  public generateManifest(
    workspaceBlueprint: IWorkspaceBlueprint
  ): IProjectManifest {
    logger.info(`[ProjectManifestEngine] Generating project manifest for workspace layout: '${workspaceBlueprint.workspaceType}'`);

    const projectName = 'Hospital App Scaffolding Manifest';
    const schemaVersion = '1.0.0';

    // 1. Plan logical files mapping
    const plannedFiles = generatorOwnershipMapper.planFiles(workspaceBlueprint);

    // 2. Analyze file dependencies
    const depCheck = fileDependencyAnalyzer.verifyGraph(plannedFiles);

    // 3. Generate execution plan
    const steps = executionPlanner.generatePlan(workspaceBlueprint);
    const executionPlan = { steps };

    // 4. Generate rollback checkpoints strategy
    const checkpoints = rollbackPlanner.generateCheckpoints(steps);
    const rollbackStrategy = { checkpoints };

    // 5. Run manifest validation
    const validationReport = manifestValidator.validate(plannedFiles, steps);
    if (!depCheck.valid) {
      validationReport.isValid = false;
      validationReport.violations.push(`Circular file dependency loop detected: ${depCheck.cycles.join(' -> ')}`);
    }

    const result: IProjectManifest = {
      projectName,
      schemaVersion,
      plannedFiles,
      executionPlan,
      rollbackStrategy,
      validationReport
    };

    logger.info(`[ProjectManifestEngine] Formulated project manifest successfully. Planned Files Count: ${plannedFiles.length}. Status: ${validationReport.isValid ? 'VALID' : 'INVALID'}`);
    return Object.freeze(result);
  }
}

export const projectManifestEngine = new ProjectManifestEngine();
export default projectManifestEngine;
export * from './schema';
export * from './ownership';
export * from './dependency';
export * from './execution';
export * from './rollback';
export * from './validation';
export { GeneratorOwnershipMapper } from './ownership';
export { FileDependencyAnalyzer } from './dependency';
export { ExecutionPlanner } from './execution';
export { RollbackPlanner } from './rollback';
export { ManifestValidator } from './validation';
