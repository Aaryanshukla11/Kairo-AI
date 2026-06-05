import { randomUUID } from 'crypto';
import { CommandInfo, CommandStatus, TerminalEventType, TerminalEventListener } from './terminalTypes';
import { commandValidator } from './commandValidator';
import { TerminalEvents } from './terminalEvents';
import { TerminalQueue } from './terminalQueue';
import { TerminalSession } from './terminalSession';

export class TerminalEngine {
  private events = new TerminalEvents();
  private queue = new TerminalQueue();
  private session: TerminalSession;
  private isProcessing = false;

  constructor(private workspaceRoot: string) {
    this.session = new TerminalSession(this.events);
  }

  /**
   * Subscribes to terminal events.
   */
  public subscribe(listener: TerminalEventListener): () => void {
    return this.events.subscribe(listener);
  }

  /**
   * Submits a command line string to run inside the execution queue.
   */
  public executeCommand(commandStr: string, workingDirectory?: string, environment?: Record<string, string>): CommandInfo {
    const wd = workingDirectory || this.workspaceRoot;
    commandValidator.validate(commandStr, wd, this.workspaceRoot);

    const running = this.session.getActiveCommand();
    if (running && running.command === commandStr && running.workingDirectory === wd) {
      throw new Error(`Command execution rejected: Duplicate command is already running: "${commandStr}"`);
    }

    const command: CommandInfo = {
      id: randomUUID(),
      command: commandStr,
      workingDirectory: wd,
      environment,
      status: CommandStatus.Queued,
      stdout: '',
      stderr: ''
    };

    this.queue.enqueue(command);
    this.events.emit(TerminalEventType.CommandQueued, command.id, { command });

    this.processQueue().catch(err => {
      console.error('[TerminalEngine] Error in processQueue:', err);
    });

    return command;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        const next = this.queue.getNext();
        if (!next) break;

        await this.session.execute(next);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Cancels the active process.
   */
  public cancel(): void {
    this.session.cancel();
  }

  public getCommands(): CommandInfo[] {
    return this.queue.getCommands();
  }

  public getActiveCommand(): CommandInfo | null {
    return this.session.getActiveCommand();
  }
}
