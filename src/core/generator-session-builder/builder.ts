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

    // Optimize tokens count: estimate size (length of role + rules + schema + stack divided by 4)
    const rawContentLength = 
      systemRole.length + 
      generationRules.join(' ').length + 
      architectureRules.join(' ').length + 
      outputContractSpecification.length + 
      JSON.stringify(request.technologyStack).length;

    const estimatedTokenCount = Math.ceil(rawContentLength / 4);

    return {
      sessionId,
      timestamp,
      systemRole,
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
        }
      },
      promptDescription: request.projectInfo.description,
      metadata: {
        estimatedTokenCount,
        formatType: 'JSON_OUTPUT'
      }
    };
  }
}

export const sessionBuilder = new SessionBuilder();
export default sessionBuilder;
