import { generationCoordinator } from './generationCoordinator';
import { generationEvents } from './generationEvents';
import { GenerationArtifact } from './generationTypes';

export class GenerationEngine {
  public async generateCode(plan: any): Promise<GenerationArtifact> {
    return generationCoordinator.coordinate(plan);
  }

  public subscribe(listener: any): () => void {
    return generationEvents.subscribe(listener);
  }
}

export const generationEngine = new GenerationEngine();
