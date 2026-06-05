import { editPlanner } from './editPlanner';
import { editEvents } from './editEvents';
import { EditOperation, IncrementalEditPlan } from './editTypes';

export class IncrementalEngine {
  public async generateEditPlan(
    filePath: string,
    fileContent: string,
    ops: EditOperation[]
  ): Promise<IncrementalEditPlan> {
    return editPlanner.planEdits(filePath, fileContent, ops);
  }

  public subscribe(listener: any): () => void {
    return editEvents.subscribe(listener);
  }
}

export const incrementalEngine = new IncrementalEngine();
