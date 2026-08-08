import { ILogger } from '../interfaces';
import { LogLevel } from '../types';

export class StructuredLogger implements ILogger {
  private level: LogLevel = 'INFO';
  private logs: string[] = [];

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public getLogs(): string[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  private shouldLog(msgLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'WARNING', 'ERROR'];
    return levels.indexOf(msgLevel) >= levels.indexOf(this.level);
  }

  private write(level: LogLevel, message: string, context?: any): void {
    if (!this.shouldLog(level)) return;
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level}] ${message} ${context ? JSON.stringify(context) : ''}`;
    this.logs.push(formatted);
    console.log(formatted);
  }

  public trace(message: string, context?: any): void {
    this.write('TRACE', message, context);
  }

  public debug(message: string, context?: any): void {
    this.write('DEBUG', message, context);
  }

  public info(message: string, context?: any): void {
    this.write('INFO', message, context);
  }

  public warn(message: string, context?: any): void {
    this.write('WARNING', message, context);
  }

  public error(message: string, context?: any): void {
    this.write('ERROR', message, context);
  }
}

export const logger = new StructuredLogger();
export default logger;
