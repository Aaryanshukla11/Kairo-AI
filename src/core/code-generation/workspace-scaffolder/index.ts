import { IArchitectureBlueprint } from '../architecture-generator';
import { IWorkspaceBlueprint, IScaffoldingStep } from './schema';
import { workspaceLayoutEngine } from './layout';
import { packageDesigner } from './packages';
import { folderScaffolderOwnership } from './ownership';
import { scaffoldingRulesModeler } from './rules';
import { scaffolderIntegrityValidator } from './validation';
import { logger } from '../logger';

export class WorkspaceScaffolderEngine {
  public generateBlueprint(
    archBlueprint: IArchitectureBlueprint
  ): IWorkspaceBlueprint {
    logger.info(`[WorkspaceScaffolderEngine] Structuring workspace layout plans for architecture: '${archBlueprint.systemArchitecture}'`);

    // 1. Decide repository structure type
    const workspaceType = workspaceLayoutEngine.decideLayoutType(archBlueprint);

    // 2. Package design specifications
    const packages = packageDesigner.designPackages(workspaceType, archBlueprint);

    // 3. Ownership mapping
    const { folders, ownershipMap } = folderScaffolderOwnership.assignOwnership(packages, workspaceType);

    // 4. Dependencies and build strategy
    const dependencyRules = scaffoldingRulesModeler.getDependencyRules(workspaceType);
    const buildStrategy = scaffoldingRulesModeler.getBuildStrategy(workspaceType);
    const configurationLocations = scaffoldingRulesModeler.getConfigurationLocations(workspaceType);

    // 5. Scaffolding Plan steps execution sequencing
    const steps: IScaffoldingStep[] = [];
    
    // Sort packages so packages/libraries compile before apps
    const sorted = [...packages].sort((a, b) => {
      const isLibraryA = a.location.startsWith('packages/');
      const isLibraryB = b.location.startsWith('packages/');
      if (isLibraryA && !isLibraryB) return -1;
      if (!isLibraryA && isLibraryB) return 1;
      return 0;
    });

    sorted.forEach((p, idx) => {
      let generatorId = 'FrontendGenerator';
      if (p.location.includes('backend')) generatorId = 'BackendGenerator';
      else if (p.location.includes('database')) generatorId = 'DatabaseGenerator';
      else if (p.location.includes('types')) generatorId = 'TypesGenerator';

      steps.push({
        name: `Scaffold ${p.name}`,
        description: `Compile folders structure blueprints and config setups for ${p.name} inside ${p.location}`,
        targetPath: p.location,
        generatorId,
        executionPriority: (idx + 1) * 10
      });
    });

    const scaffoldingPlan = { steps };

    // 6. Integrity check
    const validationReport = scaffolderIntegrityValidator.validate(packages);

    const result: IWorkspaceBlueprint = {
      workspaceType,
      packages,
      folders,
      ownershipMap,
      dependencyRules,
      buildStrategy,
      configurationLocations,
      scaffoldingPlan,
      validationReport
    };

    logger.info(`[WorkspaceScaffolderEngine] Generated workspace layout. Scaffolding Steps Count: ${steps.length}. Status: ${validationReport.isValid ? 'VALID' : 'INVALID'}`);
    return Object.freeze(result);
  }
}

export const workspaceScaffolderEngine = new WorkspaceScaffolderEngine();
export default workspaceScaffolderEngine;
export * from './schema';
export * from './layout';
export * from './packages';
export * from './ownership';
export * from './rules';
export * from './validation';
export { WorkspaceLayoutEngine } from './layout';
export { PackageDesigner } from './packages';
export { FolderScaffolderOwnership } from './ownership';
export { ScaffoldingRulesModeler } from './rules';
export { ScaffolderIntegrityValidator } from './validation';
