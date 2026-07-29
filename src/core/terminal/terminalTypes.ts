export enum CommandStatus {
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  TimedOut = 'TimedOut'
}

export interface CommandInfo {
  id: string;
  command: string;
  workingDirectory: string;
  environment?: Record<string, string>;
  status: CommandStatus;
  startedAt?: number;
  finishedAt?: number;
  exitCode?: number | null;
  stdout: string;
  stderr: string;
}

export enum TerminalEventType {
  CommandQueued = 'CommandQueued',
  CommandStarted = 'CommandStarted',
  OutputReceived = 'OutputReceived',
  CommandCompleted = 'CommandCompleted',
  CommandFailed = 'CommandFailed',
  CommandCancelled = 'CommandCancelled'
}

export interface TerminalEvent {
  type: TerminalEventType;
  commandId: string;
  timestamp: number;
  payload?: any;
}

export type TerminalEventListener = (event: TerminalEvent) => void;
