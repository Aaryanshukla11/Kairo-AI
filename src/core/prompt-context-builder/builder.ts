import { IPromptProcessorOutput } from '../prompt-processor/types';
import { IEntityExtractionOutput } from '../entity-extractor/types';
import { IProjectContextOutput } from '../project-context-analyzer/types';
import { IPromptContext } from './types';
import { promptContextValidator } from './validator';

export class Builder {
  public build(
    processorOutput: IPromptProcessorOutput,
    extractorOutput: IEntityExtractionOutput,
    analyzerOutput: IProjectContextOutput
  ): IPromptContext {
    // Generate warnings
    const warnings = promptContextValidator.validate(
      processorOutput.intent,
      extractorOutput,
      analyzerOutput
    );

    // Merge technologies with preference to prompt extraction, falling back to workspace context
    const language = extractorOutput.language.value || analyzerOutput.techStack.language;
    const frontend = extractorOutput.frontend.value || analyzerOutput.techStack.frontendFramework;
    const backend = extractorOutput.backend.value || analyzerOutput.techStack.backendFramework;
    const database = extractorOutput.database.value || analyzerOutput.techStack.database;
    const authMethod = extractorOutput.authMethod.value || analyzerOutput.techStack.authLibrary;
    const apiStyle = extractorOutput.apiStyle.value;
    const uiFramework = extractorOutput.uiFramework.value || analyzerOutput.techStack.uiLibrary;
    const cssFramework = extractorOutput.cssFramework.value || analyzerOutput.techStack.cssFramework;
    const stateManagement = extractorOutput.stateManagement.value || analyzerOutput.techStack.stateManagement;
    const buildTool = extractorOutput.buildTool.value || analyzerOutput.techStack.buildTool;

    return {
      id: processorOutput.id,
      timestamp: processorOutput.timestamp,
      rawPrompt: processorOutput.rawPrompt,
      normalizedPrompt: processorOutput.normalizedPrompt,
      intent: processorOutput.intent,
      confidence: processorOutput.confidence,
      projectInfo: {
        name: extractorOutput.projectName.value,
        type: extractorOutput.projectType.value || 'Unknown'
      },
      workspaceInfo: {
        isEmpty: analyzerOutput.workspace.isEmpty,
        isProjectPresent: analyzerOutput.workspace.isProjectPresent,
        isMonorepo: analyzerOutput.workspace.isMonorepo,
        hasGit: analyzerOutput.workspace.hasGit
      },
      detectedTechnologies: {
        language,
        frontend,
        backend,
        database,
        authMethod,
        apiStyle,
        uiFramework,
        cssFramework,
        stateManagement,
        buildTool
      },
      detectedFeatures: Object.freeze([...extractorOutput.features]),
      existingFiles: Object.freeze([...analyzerOutput.importantFiles]),
      dependencies: analyzerOutput.dependencies.installed,
      warnings: Object.freeze(warnings),
      metadata: {
        length: processorOutput.metadata.length,
        lineCount: processorOutput.metadata.lineCount,
        hasMarkdown: processorOutput.metadata.hasMarkdown
      }
    };
  }
}

export const builder = new Builder();
export default builder;
