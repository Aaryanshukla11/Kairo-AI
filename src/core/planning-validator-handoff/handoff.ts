import { IPlanningContract } from '../planning-contract/types';
import { IDevelopmentRequest } from './types';

export class HandoffBuilder {
  public compileHandoff(contract: IPlanningContract, warnings: readonly string[]): IDevelopmentRequest {
    const dependencies = contract.taskGraph.flatMap(t => t.dependencies);
    const uniqueDependencies = Array.from(new Set(dependencies));

    return {
      requestId: contract.requestId,
      projectInfo: {
        name: contract.projectInfo.name,
        type: contract.projectInfo.type,
        description: contract.projectInfo.description,
        targetPlatform: contract.projectInfo.targetPlatform,
        language: contract.projectInfo.language,
        frontendFramework: contract.projectInfo.frontendFramework,
        backendFramework: contract.projectInfo.backendFramework,
        database: contract.projectInfo.database,
        authentication: contract.projectInfo.authentication,
        deploymentTarget: contract.projectInfo.deploymentTarget
      },
      technologyStack: {
        language: contract.projectInfo.language,
        frontend: contract.projectInfo.frontendFramework,
        backend: contract.projectInfo.backendFramework,
        database: contract.projectInfo.database
      },
      executionPhases: Object.freeze(contract.executionPhases.map(p => ({
        phaseId: p.phaseId,
        phaseName: p.phaseName,
        taskIds: Object.freeze([...p.taskIds])
      }))),
      validatedTaskGraph: Object.freeze(contract.taskGraph.map(t => ({
        ...t,
        dependencies: Object.freeze([...t.dependencies])
      }))),
      dependencies: Object.freeze(uniqueDependencies),
      warnings: Object.freeze([...warnings]),
      metadata: {
        generatedAt: contract.metadata.generatedAt,
        validatedAt: Date.now(),
        schemaVersion: contract.contractVersion
      }
    };
  }
}

export const handoffBuilder = new HandoffBuilder();
export default handoffBuilder;
