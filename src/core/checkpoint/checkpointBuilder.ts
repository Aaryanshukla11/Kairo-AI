import { randomUUID } from 'crypto';
import { CheckpointInfo, CheckpointStatus } from './checkpointTypes';

export class CheckpointBuilder {
  /**
   * Constructs a new CheckpointInfo model.
   */
  public build(
    workspaceId: string, 
    transactionId: string, 
    affectedFiles: string[],
    workspaceHash: string,
    metadata?: Record<string, any>
  ): CheckpointInfo {
    return {
      id: randomUUID(),
      workspaceId,
      transactionId,
      timestamp: Date.now(),
      status: CheckpointStatus.Created,
      affectedFiles,
      workspaceHash,
      metadata
    };
  }
}

export const checkpointBuilder = new CheckpointBuilder();
