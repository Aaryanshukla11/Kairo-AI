import { 
  RequirementObject, 
  ExtractedFields, 
  ConfidenceScores, 
  ClarificationQuestion, 
  ValidationReport 
} from './types';

export class RequirementBuilder {
  public build(
    originalPrompt: string,
    normalizedPrompt: string,
    fields: ExtractedFields,
    scores: ConfidenceScores,
    unresolved: string[],
    questions: ClarificationQuestion[],
    report: ValidationReport
  ): RequirementObject {
    
    // Choose Strategy Hints based on project type and prompt modality
    let generationStrategy: RequirementObject['strategyHints']['generationStrategy'] = 'full_project';
    if (fields.modificationType === 'modification') {
      generationStrategy = 'file_modification';
    } else if (fields.projectType === 'API Service') {
      generationStrategy = 'api_only';
    }

    const generatorHints: string[] = [];
    const plannerHints: string[] = [];

    if (fields.frontendPreference) {
      generatorHints.push(`Setup basic boilerplate templates for frontend framework: ${fields.frontendPreference}`);
    }
    if (fields.databasePreference) {
      plannerHints.push(`Initialize schema migrations folders layout targeting database: ${fields.databasePreference}`);
    }

    const metadata = {
      timestamp: Date.now(),
      analyzerVersion: '1.0.0'
    };

    const obj: RequirementObject = {
      originalPrompt,
      normalizedPrompt,
      metadata,
      detectedValues: Object.freeze({ ...fields }),
      confidenceScores: Object.freeze({ ...scores }),
      unresolvedFields: Object.freeze([...unresolved]),
      clarificationQuestions: Object.freeze([...questions]),
      validationReport: Object.freeze({ ...report }),
      strategyHints: Object.freeze({
        generationStrategy,
        generatorHints: Object.freeze([...generatorHints]),
        plannerHints: Object.freeze([...plannerHints])
      })

    };

    return Object.freeze(obj);
  }
}

export const requirementBuilder = new RequirementBuilder();
export default requirementBuilder;
 