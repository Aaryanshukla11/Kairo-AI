import { PromptPackage } from '../../promptAssembly/promptTypes';

export interface PlannerContextInput {
  conversationState: any;
  promptPkg: PromptPackage;
  workspaceContext: string;
  projectIndex: any;
  retrievedContext: string;
  plannerHistory: any[];
}

export class PlannerContext {
  private currentInput: PlannerContextInput | null = null;

  public setInput(input: PlannerContextInput): void {
    this.currentInput = input;
  }

  public getInput(): PlannerContextInput | null {
    return this.currentInput;
  }
}

export const plannerContext = new PlannerContext();
