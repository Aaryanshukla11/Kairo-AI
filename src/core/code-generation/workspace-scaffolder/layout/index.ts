import { IArchitectureBlueprint } from '../../architecture-generator';

export class WorkspaceLayoutEngine {
  public decideLayoutType(
    blueprint: IArchitectureBlueprint
  ): 'SingleApplication' | 'Monorepo' | 'MultiPackage' {
    
    if (blueprint.systemArchitecture === 'Microservices') {
      return 'Monorepo';
    }
    
    if (blueprint.modules.length > 3) {
      return 'MultiPackage';
    }

    return 'SingleApplication';
  }
}

export const workspaceLayoutEngine = new WorkspaceLayoutEngine();
export default workspaceLayoutEngine;
