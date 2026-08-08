import { IPlanningModelProvider } from '../../planning-model-integration/types';
import { ICodingModelProvider } from '../../coding-runtime/types';
import { localInferenceService } from '../localInferenceService';
import { IPlanningSession } from '../../planning-session-builder/types';
import { IGeneratorSession } from '../../generator-session-builder/types';

export class OllamaPlanningProviderAdapter implements IPlanningModelProvider {
  public readonly providerId = 'ollama-planning';

  constructor(private readonly modelName: string = 'qwen2.5-coder:7b') {}

  public async execute(session: IPlanningSession): Promise<string> {
    const result = await localInferenceService.execute(
      session.userPromptPayload,
      {
        provider: 'ollama',
        modelName: this.modelName,
        modelPath: '',
        contextLength: 4096,
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxTokens: 2048,
        gpuLayers: 32,
        threadCount: 4,
        streamingEnabled: false,
        timeoutMs: 90000
      } as any
    );

    if (result.errors.length > 0) {
      throw new Error(`Planning model execution failed: ${result.errors.join('; ')}`);
    }

    return result.generatedText;
  }
}

export class OllamaCodingProviderAdapter implements ICodingModelProvider {
  public readonly providerId = 'ollama-coding';

  constructor(private readonly modelName: string = 'qwen2.5-coder:7b') {}

  public async executeStream(
    session: IGeneratorSession,
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const prompt = `System Role:
${session.systemRole}

User Instruction:
${session.promptDescription || 'Generate code for the project.'}
Target Platform: ${session.requestPayload.targetPlatform}

Technology Stack:
- Language: ${session.requestPayload.technologyStack.language}
- Frontend Framework: ${session.requestPayload.technologyStack.frontend || 'None'}
- Backend Framework: ${session.requestPayload.technologyStack.backend || 'None'}
- Database: ${session.requestPayload.technologyStack.database || 'None'}

Execution Guidelines:
${session.generationRules.map(rule => `- ${rule}`).join('\n')}
${session.architectureRules.map(rule => `- ${rule}`).join('\n')}

Coding Standards:
- Language Conventions: ${session.codingStandards.languageConventions}
- Naming Conventions: ${session.codingStandards.namingConventions}
- Formatting Rules: ${session.codingStandards.formattingRules}

Output format: You MUST return a JSON object conforming to the schema specification below:
${session.outputContractSpecification}`;

    const result = await localInferenceService.execute(
      prompt,
      {
        provider: 'ollama',
        modelName: this.modelName,
        modelPath: '',
        contextLength: 4096,
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxTokens: 2048,
        gpuLayers: 32,
        threadCount: 4,
        streamingEnabled: true,
        timeoutMs: 90000
      } as any,
      onChunk,
      signal
    );

    if (result.errors.length > 0) {
      throw new Error(`Coding model execution failed: ${result.errors.join('; ')}`);
    }

    return result.generatedText;
  }
}
