import { PromptRequest } from './promptTypes';

export class PromptAssembler {
  public assembleSystemPrompt(
    systemInstructions: string,
    developerInstructions: string,
    workspaceRules: string[] = []
  ): string {
    let result = `${systemInstructions}\n\n`;
    result += `Developer Instructions:\n${developerInstructions}\n\n`;
    if (workspaceRules.length > 0) {
      result += `Workspace Conventions Rules:\n`;
      workspaceRules.forEach((rule, idx) => {
        result += `${idx + 1}. ${rule}\n`;
      });
      result += `\n`;
    }
    return result.trim();
  }

  public assembleUserPrompt(request: PromptRequest): string {
    let result = '';
    if (request.conversationMemory) {
      result += `=== CONVERSATION LOGS HISTORY ===\n${request.conversationMemory}\n\n`;
    }
    if (request.compiledContext) {
      result += `=== CONTEXT INJECTED ===\n${request.compiledContext}\n\n`;
    }
    if (request.executionContext) {
      result += `=== RUNTIME EXECUTION PLAN STATE ===\n${request.executionContext}\n\n`;
    }
    result += `User Request:\n${request.userPrompt}`;
    return result.trim();
  }
}

export const promptAssembler = new PromptAssembler();
