import * as vscode from 'vscode';
import { TerminalEngine } from './terminalEngine';
import { CommandInfo, TerminalEventListener } from './terminalTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class TerminalService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: TerminalEngine | null = null;
  private pendingSubscriptions: TerminalEventListener[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new TerminalEngine(rootPath);
    this.state = 'READY';
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): TerminalEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to terminal execution events.
   */
  public subscribe(listener: TerminalEventListener): () => void {
    const engine = this.getEngine();
    if (!engine) {
      this.pendingSubscriptions.push(listener);
      return () => {
        this.pendingSubscriptions = this.pendingSubscriptions.filter(l => l !== listener);
      };
    }
    return engine.subscribe(listener);
  }

  /**
   * Executes a command string sequentially through the workspace terminal queue.
   */
  public executeCommand(commandStr: string, workingDirectory?: string, environment?: Record<string, string>): CommandInfo {
    const engine = this.getEngine();
    if (!engine) {
      return {
        commandId: 'none',
        command: commandStr,
        status: 'Failed',
        timestamp: Date.now()
      };
    }
    return engine.executeCommand(commandStr, workingDirectory, environment);
  }

  /**
   * Cancels active command execution.
   */
  public cancel(): void {
    if (this.activeEngine) {
      this.activeEngine.cancel();
    }
  }

  /**
   * Fetches the history list of all executed commands.
   */
  public getCommands(): CommandInfo[] {
    return this.activeEngine ? this.activeEngine.getCommands() : [];
  }

  /**
   * Returns details of the currently active running command.
   */
  public getActiveCommand(): CommandInfo | null {
    return this.activeEngine ? this.activeEngine.getActiveCommand() : null;
  }
}

export const terminalService = new TerminalService();
export default terminalService;
