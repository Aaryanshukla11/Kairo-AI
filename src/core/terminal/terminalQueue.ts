import { CommandInfo, CommandStatus } from './terminalTypes';

export class TerminalQueue {
  private queue: CommandInfo[] = [];

  /**
   * Pushes a new command into the sequential execution queue.
   */
  public enqueue(command: CommandInfo): void {
    this.queue.push(command);
  }

  /**
   * Retrieves the next command in Queued state.
   */
  public getNext(): CommandInfo | undefined {
    return this.queue.find(c => c.status === CommandStatus.Queued);
  }

  /**
   * Finds the currently active command.
   */
  public findRunning(): CommandInfo | undefined {
    return this.queue.find(c => c.status === CommandStatus.Running);
  }

  public getCommands(): CommandInfo[] {
    return this.queue;
  }

  public clear(): void {
    this.queue = [];
  }
}
