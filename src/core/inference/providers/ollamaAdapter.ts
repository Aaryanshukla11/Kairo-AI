import { IPlanningModelProvider } from '../../planning-model-integration/types';
import { ICodingModelProvider } from '../../coding-runtime/types';
import { localInferenceService } from '../localInferenceService';
import { IPlanningSession } from '../../planning-session-builder/types';
import { IGeneratorSession } from '../../generator-session-builder/types';

export class OllamaPlanningProviderAdapter implements IPlanningModelProvider {
  public readonly providerId = 'planning-adapter';

  constructor(private readonly modelName: string = 'gpt-4o') {}

  public async execute(session: IPlanningSession): Promise<string> {
    const effectiveProvider = (process.env.KAIRO_MODEL_PROVIDER || 'openai').trim().toLowerCase();
    const effectiveModel = effectiveProvider === 'openai'
      ? (process.env.OPENAI_MODEL || 'gpt-4o')
      : this.modelName;

    const result = await localInferenceService.execute(
      session.userPromptPayload,
      {
        provider: effectiveProvider,
        modelName: effectiveModel,
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
  public readonly providerId = 'coding-adapter';

  constructor(private readonly modelName: string = 'gpt-4o') {}

  public async executeStream(
    session: IGeneratorSession,
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const targetFilesList: string[] = (session as any).targetFiles || session.requestPayload?.targetFiles || [];
    const targetFilesStr = targetFilesList.length > 0
      ? `\nTarget Files to Generate:\n${targetFilesList.map((f: string) => `- ${f}`).join('\n')}\n`
      : '';

    const prompt = `System Role:
${session.systemRole}

User Request & Goal:
${session.promptDescription || 'Generate production-ready source code for the requested application.'}${targetFilesStr}
Target Platform: ${session.requestPayload.targetPlatform}

Technology Stack:
- Language: ${session.requestPayload.technologyStack.language}
- Frontend Framework: ${session.requestPayload.technologyStack.frontend || 'None'}
- Backend Framework: ${session.requestPayload.technologyStack.backend || 'None'}
- Database: ${session.requestPayload.technologyStack.database || 'None'}

Execution Guidelines:
- You MUST generate complete, high-quality, production-ready source code specifically fulfilling the User Request & Goal.
- If existing source code is provided in the prompt under 'RELEVANT EXISTING SOURCE FILES', perform incremental edits, extensions, or modifications directly on that code.
- PRESERVE all pre-existing code, HTML elements, styles, and logic while integrating the new requested features or changes.
- Return the COMPLETE updated file contents with the new changes integrated. Do NOT return empty or placeholder files.
${session.generationRules.map(rule => `- ${rule}`).join('\n')}
${session.architectureRules.map(rule => `- ${rule}`).join('\n')}

Coding Standards:
- Language Conventions: ${session.codingStandards.languageConventions}
- Naming Conventions: ${session.codingStandards.namingConventions}
- Formatting Rules: ${session.codingStandards.formattingRules}

Output format: You MUST return ONLY a valid JSON object matching the schema specification below:
${session.outputContractSpecification}`;

    const effectiveProvider = (process.env.KAIRO_MODEL_PROVIDER || 'openai').trim().toLowerCase();
    const effectiveModel = effectiveProvider === 'openai'
      ? (process.env.OPENAI_MODEL || 'gpt-4o')
      : this.modelName;

    const result = await localInferenceService.execute(
      prompt,
      {
        provider: effectiveProvider,
        modelName: effectiveModel,
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
