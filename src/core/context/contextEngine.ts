import { ProjectContext, ContextSelectionInfo, ContextPlannerInfo, ContextExecutionInfo, ContextGitInfo, ContextEventType } from './contextTypes';
import { contextBuilder } from './contextBuilder';
import { contextValidator } from './contextValidator';
import { ContextEvents } from './contextEvents';
import { Diagnostic } from '../diagnostics/diagnosticsTypes';

export class ContextEngine {
  private events = new ContextEvents();
  private activeContext: ProjectContext | null = null;

  constructor(private workspaceRoot: string) {}

  /**
   * Subscribes a listener to active context event changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  public buildContext(params: {
    filePaths: string[];
    selection: ContextSelectionInfo;
    planner: ContextPlannerInfo;
    execution: ContextExecutionInfo;
    git: ContextGitInfo;
    diagnostics: Diagnostic[];
    limitBytes?: number;
  }): ProjectContext {
    this.events.emit(ContextEventType.ContextRequested, '');

    const ctx = contextBuilder.build({
      rootPath: this.workspaceRoot,
      ...params
    });

    contextValidator.validate(ctx);
    this.activeContext = ctx;

    this.events.emit(ContextEventType.ContextBuilt, ctx.id, { context: ctx });
    return ctx;
  }

  public getActiveContext(): ProjectContext | null {
    return this.activeContext;
  }

  public expireContext(): void {
    if (this.activeContext) {
      const id = this.activeContext.id;
      this.activeContext = null;
      this.events.emit(ContextEventType.ContextExpired, id);
    }
  }
}
