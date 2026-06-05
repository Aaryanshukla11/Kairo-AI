export class ExecutionContext {
  private blackboard = new Map<string, any>();

  public get(key: string): any {
    return this.blackboard.get(key);
  }

  public set(key: string, value: any): void {
    this.blackboard.set(key, value);
  }

  public getBlackboard(): Record<string, any> {
    return Object.fromEntries(this.blackboard.entries());
  }

  public clear(): void {
    this.blackboard.clear();
  }
}

export const executionContext = new ExecutionContext();
