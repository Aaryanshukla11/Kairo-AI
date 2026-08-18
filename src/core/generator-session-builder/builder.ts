import { IGeneratorSession } from './types';
import { IDevelopmentRequest } from '../planning-validator-handoff/types';
import { codingInstructionsManager } from './instructions';
import * as crypto from 'crypto';

export class SessionBuilder {
  public build(request: IDevelopmentRequest): IGeneratorSession {
    const sessionId = crypto.randomUUID ? crypto.randomUUID() : `gen-session-${Date.now()}`;
    const timestamp = Date.now();

    const systemRole = codingInstructionsManager.getSystemRole();
    const generationRules = codingInstructionsManager.getGenerationRules();
    const architectureRules = codingInstructionsManager.getArchitectureRules();
    const codingStandards = codingInstructionsManager.getCodingStandards();
    const outputContractSpecification = codingInstructionsManager.getOutputContractSpecification();

    const MAX_TOTAL_CONTEXT_BUDGET_TOKENS = 12000; // ~48,000 characters

    let historyEntries: Array<{ role: string; text: string }> = [];
    if (request.metadata && (request.metadata as any).conversationHistory) {
      const rawHist = (request.metadata as any).conversationHistory;
      if (Array.isArray(rawHist)) {
        historyEntries = [...rawHist];
      }
    }

    let sourceEntries: Array<{ filePath: string; content: string }> = [];
    if (request.metadata && (request.metadata as any).sourceCodeContext) {
      const rawSources = (request.metadata as any).sourceCodeContext;
      if (Array.isArray(rawSources)) {
        sourceEntries = rawSources.map((s: any) => ({ filePath: s.filePath, content: s.content }));
      }
    }

    // Context Reduction Helper
    const buildSystemRoleWithBudget = (hist: Array<{ role: string; text: string }>, srcs: Array<{ filePath: string; content: string }>): string => {
      let roleText = systemRole;
      if (hist.length > 0) {
        roleText += `\n\n--- RECENT CONVERSATION HISTORY ---\n` +
          hist.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
      }
      if (srcs.length > 0) {
        roleText += `\n\n--- RELEVANT EXISTING SOURCE FILES ---\n` +
          srcs.map(s => `File: ${s.filePath}\n\`\`\`\n${s.content}\n\`\`\``).join('\n\n');
      }
      return roleText;
    };

    let enhancedSystemRole = buildSystemRoleWithBudget(historyEntries, sourceEntries);
    let rawContentLength = 
      enhancedSystemRole.length + 
      generationRules.join(' ').length + 
      architectureRules.join(' ').length + 
      outputContractSpecification.length + 
      JSON.stringify(request.technologyStack).length;

    let estimatedTokenCount = Math.ceil(rawContentLength / 4);

    // Reduction Strategy: If token count exceeds budget, reduce history first, then source code
    if (estimatedTokenCount > MAX_TOTAL_CONTEXT_BUDGET_TOKENS && historyEntries.length > 2) {
      while (historyEntries.length > 2 && estimatedTokenCount > MAX_TOTAL_CONTEXT_BUDGET_TOKENS) {
        historyEntries.shift(); // Evict oldest historical entry
        enhancedSystemRole = buildSystemRoleWithBudget(historyEntries, sourceEntries);
        rawContentLength = enhancedSystemRole.length + generationRules.join(' ').length + architectureRules.join(' ').length + outputContractSpecification.length + JSON.stringify(request.technologyStack).length;
        estimatedTokenCount = Math.ceil(rawContentLength / 4);
      }
    }

    if (estimatedTokenCount > MAX_TOTAL_CONTEXT_BUDGET_TOKENS && sourceEntries.length > 0) {
      sourceEntries = sourceEntries.map(s => ({
        filePath: s.filePath,
        content: s.content.substring(0, 800) + (s.content.length > 800 ? '\n...[TRUNCATED FOR CONTEXT BUDGET]' : '')
      }));
      enhancedSystemRole = buildSystemRoleWithBudget(historyEntries, sourceEntries);
      rawContentLength = enhancedSystemRole.length + generationRules.join(' ').length + architectureRules.join(' ').length + outputContractSpecification.length + JSON.stringify(request.technologyStack).length;
      estimatedTokenCount = Math.ceil(rawContentLength / 4);
    }

    return {
      sessionId,
      timestamp,
      systemRole: enhancedSystemRole,
      generationRules: Object.freeze(generationRules),
      architectureRules: Object.freeze(architectureRules),
      codingStandards: {
        languageConventions: codingStandards.languageConventions,
        namingConventions: codingStandards.namingConventions,
        formattingRules: codingStandards.formattingRules
      },
      outputContractSpecification,
      requestPayload: {
        requestId: request.requestId,
        targetPlatform: request.projectInfo.targetPlatform,
        technologyStack: {
          language: request.technologyStack.language,
          frontend: request.technologyStack.frontend,
          backend: request.technologyStack.backend,
          database: request.technologyStack.database
        },
        targetFiles: (request as any).targetFiles || []
      },
      promptDescription: request.projectInfo.description,
      conversationHistory: (request.metadata as any)?.conversationHistory,
      sourceCodeContext: (request.metadata as any)?.sourceCodeContext,
      targetFiles: (request as any).targetFiles || [],
      metadata: {
        estimatedTokenCount,
        formatType: 'JSON_OUTPUT'
      }
    };
  }
}

export const sessionBuilder = new SessionBuilder();
export default sessionBuilder;
