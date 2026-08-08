import { IPlanningSession } from './types';
import { IAIRequestOutput } from '../ai-request-builder/types';
import { instructionsManager } from './instructions';
import * as crypto from 'crypto';

export class SessionBuilder {
  public build(request: IAIRequestOutput): IPlanningSession {
    const sessionId = crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    const systemInstructions = instructionsManager.compileSystemInstructions();
    const injectedRules = instructionsManager.getPlanningRules();
    const outputSchemaSpecification = instructionsManager.getOutputSchemaSpecification();

    // Optimize tokens count: estimate size (length of prompt + schema + instructions divided by 4)
    const rawContentLength = 
      request.prompt.length + 
      systemInstructions.length + 
      outputSchemaSpecification.length + 
      JSON.stringify(request.stack).length;
    
    const estimatedTokenCount = Math.ceil(rawContentLength / 4);

    return {
      sessionId,
      timestamp,
      systemInstructions,
      injectedRules: Object.freeze(injectedRules),
      context: {
        project: {
          name: request.project.name,
          type: request.project.type
        },
        workspace: {
          isEmpty: request.workspace.isEmpty,
          isProjectPresent: request.workspace.isProjectPresent,
          isMonorepo: request.workspace.isMonorepo,
          hasGit: request.workspace.hasGit
        },
        stack: {
          language: request.stack.language,
          frontend: request.stack.frontend,
          backend: request.stack.backend,
          database: request.stack.database,
          authMethod: request.stack.authMethod,
          apiStyle: request.stack.apiStyle,
          uiFramework: request.stack.uiFramework,
          cssFramework: request.stack.cssFramework,
          stateManagement: request.stack.stateManagement,
          buildTool: request.stack.buildTool
        }
      },
      outputSchemaSpecification,
      userPromptPayload: request.prompt,
      metadata: {
        estimatedTokenCount,
        formatType: 'JSON_SCHEMA'
      }
    };
  }
}

export const sessionBuilder = new SessionBuilder();
export default sessionBuilder;
