export class WorkflowContext {
  private variables = new Map<string, any>();

  public set(key: string, value: any): void {
    this.variables.set(key, value);
  }

  public get(key: string): any {
    return this.variables.get(key);
  }

  public clear(): void {
    this.variables.clear();
  }
}
export const workflowContext = new WorkflowContext();
