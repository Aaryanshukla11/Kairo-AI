export class TerminalStateAnalyzer {
  public getBackgroundTasks(): string[] {
    return [];
  }
  public getRunningCommands(): string[] {
    return [];
  }
}
export const terminalStateAnalyzer = new TerminalStateAnalyzer();
