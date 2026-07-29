import { ChildProcess, spawn } from 'child_process';
import { CommandInfo, CommandStatus, TerminalEventType } from './terminalTypes';
import { TerminalEvents } from './terminalEvents';

export class TerminalSession {
  private activeProcess: ChildProcess | null = null;
  private activeCommand: CommandInfo | null = null;

  constructor(private events: TerminalEvents) {}

  /**
   * Executes a Whitelisted Command by spawning shell subprocesses.
   */
  public execute(command: CommandInfo): Promise<number | null> {
    this.activeCommand = command;
    command.status = CommandStatus.Running;
    command.startedAt = Date.now();
    this.events.emit(TerminalEventType.CommandStarted, command.id, { command });

    return new Promise((resolve) => {
      try {
        this.activeProcess = spawn(command.command, [], {
          cwd: command.workingDirectory,
          env: { ...process.env, ...command.environment },
          shell: true
        });

        // 5-minute timeout safety
        const timeoutDuration = 300000;
        const timeoutId = setTimeout(() => {
          if (this.activeProcess) {
            this.activeProcess.kill();
            command.status = CommandStatus.TimedOut;
            command.finishedAt = Date.now();
            this.events.emit(TerminalEventType.CommandFailed, command.id, { error: 'Command execution timed out' });
            resolve(null);
          }
        }, timeoutDuration);

        this.activeProcess.stdout?.on('data', (data) => {
          const text = data.toString();
          command.stdout += text;
          this.events.emit(TerminalEventType.OutputReceived, command.id, { chunk: text, type: 'stdout' });
        });

        this.activeProcess.stderr?.on('data', (data) => {
          const text = data.toString();
          command.stderr += text;
          this.events.emit(TerminalEventType.OutputReceived, command.id, { chunk: text, type: 'stderr' });
        });

        this.activeProcess.on('error', (err) => {
          clearTimeout(timeoutId);
          command.status = CommandStatus.Failed;
          command.stderr += `\nError: ${err.message}`;
          command.finishedAt = Date.now();
          this.events.emit(TerminalEventType.CommandFailed, command.id, { error: err.message });
          resolve(null);
        });

        this.activeProcess.on('close', (code) => {
          clearTimeout(timeoutId);
          
          if (command.status === CommandStatus.Running) {
            command.exitCode = code;
            command.finishedAt = Date.now();
            
            if (code === 0) {
              command.status = CommandStatus.Completed;
              this.events.emit(TerminalEventType.CommandCompleted, command.id, { exitCode: code });
            } else {
              command.status = CommandStatus.Failed;
              this.events.emit(TerminalEventType.CommandFailed, command.id, { exitCode: code });
            }
          }
          this.activeProcess = null;
          this.activeCommand = null;
          resolve(code);
        });
      } catch (err: any) {
        command.status = CommandStatus.Failed;
        command.stderr += `\nException: ${err.message}`;
        command.finishedAt = Date.now();
        this.events.emit(TerminalEventType.CommandFailed, command.id, { error: err.message });
        resolve(null);
      }
    });
  }

  /**
   * Kills active command subprocesses.
   */
  public cancel(): void {
    if (this.activeProcess) {
      this.activeProcess.kill();
      if (this.activeCommand) {
        this.activeCommand.status = CommandStatus.Cancelled;
        this.activeCommand.finishedAt = Date.now();
        this.events.emit(TerminalEventType.CommandCancelled, this.activeCommand.id);
      }
      this.activeProcess = null;
      this.activeCommand = null;
    }
  }

  public getActiveCommand(): CommandInfo | null {
    return this.activeCommand;
  }
}
