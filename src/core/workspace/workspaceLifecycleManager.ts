import * as vscode from 'vscode';

export type WorkspaceLifecycleState =
  | 'NOT_INITIALIZED'
  | 'WAITING_FOR_WORKSPACE'
  | 'INITIALIZING'
  | 'READY'
  | 'DISPOSED'
  | 'FAILED';

export interface ILazyWorkspaceService {
  state: WorkspaceLifecycleState;
  initialize(rootPath: string): void;
  reset(): void;
}

export class WorkspaceLifecycleManager {
  private state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private services: Set<ILazyWorkspaceService> = new Set();
  private stateChangeListeners: ((state: WorkspaceLifecycleState) => void)[] = [];
  private currentWorkspaceRoot: string | null = null;

  constructor() {
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  public registerService(service: ILazyWorkspaceService): void {
    this.services.add(service);
    // If we are already ready, initialize it immediately
    if (this.state === 'READY' && this.currentWorkspaceRoot) {
      try {
        service.initialize(this.currentWorkspaceRoot);
      } catch {
        service.state = 'FAILED';
      }
    } else {
      service.state = this.state;
    }
  }

  public getState(): WorkspaceLifecycleState {
    return this.state;
  }

  public onDidChangeState(listener: (state: WorkspaceLifecycleState) => void): vscode.Disposable {
    this.stateChangeListeners.push(listener);
    return {
      dispose: () => {
        this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
      }
    };
  }

  private setState(newState: WorkspaceLifecycleState): void {
    if (this.state !== newState) {
      this.state = newState;
      for (const service of this.services) {
        service.state = newState;
      }
      for (const listener of this.stateChangeListeners) {
        listener(newState);
      }
    }
  }

  public setupWorkspaceListeners(context: vscode.ExtensionContext): void {
    // 1. Initial check
    this.checkAndInitialize();

    // 2. Subscribe to change events
    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.checkAndInitialize();
    });
    context.subscriptions.push(disposable);
  }

  private checkAndInitialize(): void {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      this.currentWorkspaceRoot = null;
      this.setState('WAITING_FOR_WORKSPACE');
      for (const service of this.services) {
        service.reset();
      }
      return;
    }

    const rootPath = folders[0].uri.fsPath;
    if (this.currentWorkspaceRoot === rootPath && this.state === 'READY') {
      return; // Already initialized for this folder
    }

    this.currentWorkspaceRoot = rootPath;
    this.setState('INITIALIZING');

    try {
      for (const service of this.services) {
        service.initialize(rootPath);
      }
      this.setState('READY');
    } catch (e) {
      this.setState('FAILED');
    }
  }
}

export const workspaceLifecycleManager = new WorkspaceLifecycleManager();
export default workspaceLifecycleManager;
