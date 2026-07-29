export class ExecutionContext {
  private variables = new Map<string, any>();
  private logs: string[] = [];

  /**
   * Retrieves a variable from the execution context.
   */
  public getVariable(key: string): any {
    return this.variables.get(key);
  }

  /**
   * Stores a variable in the execution context.
   */
  public setVariable(key: string, value: any): void {
    this.variables.set(key, value);
  }

  /**
   * Appends a log entry to the execution trace.
   */
  public log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Returns all logs recorded during execution.
   */
  public getLogs(): string[] {
    return this.logs;
  }

  /**
   * Resets variables and log traces.
   */
  public clear(): void {
    this.variables.clear();
    this.logs = [];
  }
}
