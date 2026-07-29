import * as vscode from 'vscode';
import { TerminalEngine } from './terminalEngine';
import { CommandInfo, TerminalEventListener } from './terminalTypes';

export class TerminalService {
  private activeEngine: TerminalEngine | null = null;

  private getEngine(): TerminalEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Terminal Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new TerminalEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to terminal execution events.
   */
  public subscribe(listener: TerminalEventListener): () => void {
    return this.getEngine().subscribe(listener);
  }

  /**
   * Executes a command string sequentially through the workspace terminal queue.
   */
  public executeCommand(commandStr: string, workingDirectory?: string, environment?: Record<string, string>): CommandInfo {
    return this.getEngine().executeCommand(commandStr, workingDirectory, environment);
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
