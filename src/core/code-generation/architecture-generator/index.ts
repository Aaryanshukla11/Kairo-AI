import { IEngineeringDecision } from '../engineering-decision';
import { IArchitectureBlueprint } from './schema';
import { layerDesigner } from './layers';
import { moduleDesigner } from './modules';
import { dependencyGraphBuilder } from './dependency-graph';
import { communicationModeler } from './communication';
import { patternSelector } from './patterns';
import { architectureValidator } from './validation';
import { logger } from '../logger';

export class ArchitectureGeneratorEngine {
  public generateBlueprint(decision: IEngineeringDecision): IArchitectureBlueprint {
    logger.info(`[ArchitectureGeneratorEngine] Formulating system blueprint for target pattern: '${decision.profile.architecturePattern}'`);

    const systemArchitecture = decision.profile.architecturePattern;

    // 1. Layer boundaries design
    const layers = layerDesigner.designLayers(systemArchitecture);

    // 2. Modules mapping
    const modules = moduleDesigner.designModules(decision);

    // 3. Dependency graph compilation
    const dependencyGraph = dependencyGraphBuilder.buildGraph(modules);
    const cycles = dependencyGraphBuilder.detectCycles(dependencyGraph.nodes, dependencyGraph.edges);

    // 4. Communication models rules
    const communicationRules = communicationModeler.getCommunicationRules(systemArchitecture);

    // 5. Design patterns
    const designPatterns = patternSelector.selectPatterns(decision);

    // Naming constraints
    const namingConventions = {
      services: 'Suffix Service, e.g. PatientService',
      repositories: 'Suffix Repository, e.g. PatientRepository',
      controllers: 'Suffix Controller, e.g. PatientController'
    };

    // 6. Validations check
    const validationReport = architectureValidator.validate(modules, dependencyGraph.edges, cycles);

    const result: IArchitectureBlueprint = {
      systemArchitecture,
      layers,
      modules,
      dependencyGraph,
      communicationRules,
      designPatterns,
      namingConventions,
      validationReport
    };

    logger.info(`[ArchitectureGeneratorEngine] Formulated blueprint successfully. Modules Count: ${modules.length}. Status: ${validationReport.isValid ? 'VALID' : 'INVALID'}`);
    return Object.freeze(result);
  }
}

export const architectureGeneratorEngine = new ArchitectureGeneratorEngine();
export default architectureGeneratorEngine;
export * from './schema';
export * from './layers';
export * from './modules';
export * from './dependency-graph';
export * from './communication';
export * from './patterns';
export * from './validation';
export { LayerDesigner } from './layers';
export { ModuleDesigner } from './modules';
export { DependencyGraphBuilder } from './dependency-graph';
export { CommunicationModeler } from './communication';
export { PatternSelector } from './patterns';
export { ArchitectureValidator } from './validation';
