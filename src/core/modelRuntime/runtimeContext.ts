import { RuntimeContext, WorkspaceContext } from './runtimeTypes';

export class RuntimeContextManager {
  private currentContext: RuntimeContext;
  private workspaceContext: WorkspaceContext | null = null;

  constructor() {
    this.currentContext = {
      runtimeId: `RT-${Date.now()}`,
      startTime: Date.now(),
      workspacePath: process.cwd(),
      environment: { ...process.env } as Record<string, string>,
      maxMemoryBytes: 8 * 1024 * 1024 * 1024, // 8 GB default
      maxVramBytes: 6 * 1024 * 1024 * 1024,  // 6 GB default
      threadLimit: 4
    };
  }

  public getContext(): RuntimeContext {
    return this.currentContext;
  }

  public updateContext(update: Partial<RuntimeContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...update
    };
  }

  public getWorkspaceContext(): WorkspaceContext | null {
    return this.workspaceContext;
  }

  public setWorkspaceContext(context: WorkspaceContext): void {
    this.workspaceContext = context;
  }
}

export const runtimeContextManager = new RuntimeContextManager();
