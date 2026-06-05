import { IAIRequestOutput } from './types';
import { IPromptContext } from '../prompt-context-builder/types';
import { prioritySystem } from './priority';
import { tokenOptimizer } from './optimizer';

export class Builder {
  public compile(context: IPromptContext): IAIRequestOutput {
    // 1. Assign Priorities
    const rawRequirements = prioritySystem.assignPriorities(context);

    // 2. Token Optimization
    const requirements = tokenOptimizer.optimizeRequirements(rawRequirements);

    // 3. Compile output
    return {
      requestId: context.id,
      timestamp: context.timestamp,
      prompt: context.normalizedPrompt,
      intent: context.intent,
      project: {
        name: context.projectInfo.name,
        type: context.projectInfo.type
      },
      workspace: {
        isEmpty: context.workspaceInfo.isEmpty,
        isProjectPresent: context.workspaceInfo.isProjectPresent,
        isMonorepo: context.workspaceInfo.isMonorepo,
        hasGit: context.workspaceInfo.hasGit
      },
      stack: {
        language: context.detectedTechnologies.language,
        frontend: context.detectedTechnologies.frontend,
        backend: context.detectedTechnologies.backend,
        database: context.detectedTechnologies.database,
        authMethod: context.detectedTechnologies.authMethod,
        apiStyle: context.detectedTechnologies.apiStyle,
        uiFramework: context.detectedTechnologies.uiFramework,
        cssFramework: context.detectedTechnologies.cssFramework,
        stateManagement: context.detectedTechnologies.stateManagement,
        buildTool: context.detectedTechnologies.buildTool
      },
      requirements: Object.freeze(requirements),
      metadata: {
        length: context.metadata.length,
        lineCount: context.metadata.lineCount,
        hasMarkdown: context.metadata.hasMarkdown
      },
      warnings: Object.freeze([...context.warnings])
    };
  }
}

export const builder = new Builder();
export default builder;
