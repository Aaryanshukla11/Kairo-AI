import { WorkflowGraph } from './workflowTypes';

export class WorkflowRegistry {
  private registry = new Map<string, WorkflowGraph>();

  register(workflow: WorkflowGraph): void {
    this.registry.set(workflow.id, workflow);
  }

  get(id: string): WorkflowGraph | undefined {
    return this.registry.get(id);
  }

  has(id: string): boolean {
    return this.registry.has(id);
  }

  list(): WorkflowGraph[] {
    return Array.from(this.registry.values());
  }

  clear(): void {
    this.registry.clear();
  }
}

export const workflowRegistry = new WorkflowRegistry();
