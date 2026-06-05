export class ExecutionGate {
  public checkGate(blockingIssues: string[]): void {
    if (blockingIssues.length > 0) {
      throw new Error(`Safe Edit Engine execution blocked: Policy violations caught [${blockingIssues.join(', ')}]`);
    }
  }
}

export const executionGate = new ExecutionGate();
