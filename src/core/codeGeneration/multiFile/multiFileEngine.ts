import { generationCoordinator } from './generationCoordinator';
import { multiFileEvents } from './generationEvents';
import { MultiFilePlan } from './generationTypes';

export class MultiFileEngine {
  public async generateMultiFilePlan(plan: any): Promise<MultiFilePlan> {
    return generationCoordinator.coordinate(plan);
  }

  public subscribe(listener: any): () => void {
    return multiFileEvents.subscribe(listener);
  }
}

export const multiFileEngine = new MultiFileEngine();
