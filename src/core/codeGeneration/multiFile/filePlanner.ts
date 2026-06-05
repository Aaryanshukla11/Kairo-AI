import { FileOperation } from './generationTypes';

export class FilePlanner {
  public planFiles(plan: any): FileOperation[] {
    const rawOps = plan.operations || [];
    return rawOps.map((op: any) => ({
      filePath: op.filePath,
      operation: op.operation || 'create',
      dependencies: op.dependencies || [],
      originalPath: op.originalPath
    }));
  }
}

export const filePlanner = new FilePlanner();
