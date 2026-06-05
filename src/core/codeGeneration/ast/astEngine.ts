import { astCoordinator } from './astCoordinator';
import { astEvents } from './astEvents';
import { ASTArtifact } from './astTypes';

export class ASTEngine {
  public async generateAst(ir: any, language: string): Promise<ASTArtifact> {
    return astCoordinator.coordinate(ir, language);
  }

  public subscribe(listener: any): () => void {
    return astEvents.subscribe(listener);
  }
}

export const astEngine = new ASTEngine();
