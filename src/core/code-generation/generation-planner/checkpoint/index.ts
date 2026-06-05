import { ICheckpointNode } from '../schema';

export class CheckpointModeler {
  public designCheckpoints(): ICheckpointNode[] {
    return [
      {
        checkpointId: 'checkpoint-workspace',
        checkpointName: 'Workspace Ready',
        dependentTaskIds: ['task-scaffold-workspace']
      },
      {
        checkpointId: 'checkpoint-database',
        checkpointName: 'Database Schema Ready',
        dependentTaskIds: ['task-generate-database'],
        rollbackCheckpointId: 'checkpoint-workspace'
      },
      {
        checkpointId: 'checkpoint-backend',
        checkpointName: 'Backend Ready',
        dependentTaskIds: ['task-generate-backend'],
        rollbackCheckpointId: 'checkpoint-database'
      },
      {
        checkpointId: 'checkpoint-frontend',
        checkpointName: 'Frontend Ready',
        dependentTaskIds: ['task-generate-frontend'],
        rollbackCheckpointId: 'checkpoint-backend'
      }
    ];
  }
}

export const checkpointModeler = new CheckpointModeler();
export default checkpointModeler;
