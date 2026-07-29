import { PromptAssemblyRequest, PromptPackage } from './promptTypes';
import { promptTemplateRegistry } from './promptTemplateRegistry';
import { promptCompressor } from './promptCompressor';

export class PromptBuilder {
  /**
   * Serializes components and calculates character counts for token estimating.
   */
  public build(request: PromptAssemblyRequest): PromptPackage {
    const template = promptTemplateRegistry.getTemplate(request.type);

    let context = request.retrievedContext || { files: [], symbols: [], dependencies: [], configs: [], documentation: [], confidenceScore: 0 };
    if (request.tokenLimit) {
      const charLimit = request.tokenLimit * 4;
      context = promptCompressor.compress(context, charLimit);
    }

    const projectContextStr = `Workspace Summary: ${request.workspaceSummary || 'None'}\nGit Summary: ${request.gitSummary || 'None'}`;
    
    const retrievedFilesStr = context.files.map(f => `- File: ${f.filePath} (size: ${f.size} bytes)`).join('\n');
    const retrievedSymbolsStr = context.symbols.map(s => `- Symbol: ${s.name} (${s.type}) in ${s.filePath}:${s.line}`).join('\n');
    const retrievedContextStr = `Retrieved Files:\n${retrievedFilesStr || 'None'}\nRetrieved Symbols:\n${retrievedSymbolsStr || 'None'}`;

    const execContextStr = `Diagnostics Logs:\n${request.diagnostics?.join('\n') || 'None'}`;

    const systemTokens = Math.ceil(template.systemPrompt.length / 4);
    const devTokens = Math.ceil(template.developerPrompt.length / 4);
    const userTokens = Math.ceil(request.prompt.length / 4);
    const contextTokens = Math.ceil((projectContextStr.length + retrievedContextStr.length + execContextStr.length) / 4);
    const totalTokens = systemTokens + devTokens + userTokens + contextTokens;

    return {
      systemPrompt: template.systemPrompt,
      developerPrompt: template.developerPrompt,
      userPrompt: request.prompt,
      projectContext: projectContextStr,
      retrievedContext: retrievedContextStr,
      executionContext: execContextStr,
      metadata: {
        promptType: request.type,
        compressionRatio: request.retrievedContext && request.retrievedContext.files.length > 0 
          ? Number((context.files.length / request.retrievedContext.files.length).toFixed(2)) 
          : 1.0,
        sourcesCount: context.files.length + context.symbols.length
      },
      estimatedTokens: totalTokens
    };
  }
}

export const promptBuilder = new PromptBuilder();
