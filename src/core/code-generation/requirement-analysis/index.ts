import { promptParser } from './parser';
import { promptExtractor } from './extractor';
import { termNormalizer } from './normalizer';
import { requirementsValidator } from './validator';
import { clarificationEngine } from './clarification';
import { requirementBuilder } from './builder';
import { RequirementObject } from './types';
import { logger } from '../logger';

export class RequirementAnalysisEngine {
  public analyzePrompt(prompt: string): RequirementObject {
    logger.info(`[RequirementAnalysisEngine] Received prompt: "${prompt}"`);

    // 1. Parsing
    logger.debug(`[RequirementAnalysisEngine] Starting prompt parsing...`);
    const parsed = promptParser.parse(prompt);

    // 2. Extraction
    logger.debug(`[RequirementAnalysisEngine] Starting fields extraction...`);
    const extracted = promptExtractor.extract(parsed.tokens, parsed.cleaned);

    // 3. Normalization
    logger.debug(`[RequirementAnalysisEngine] Starting terms normalization...`);
    const normalizedFields = termNormalizer.normalize(extracted.fields);

    // 4. Validation
    logger.debug(`[RequirementAnalysisEngine] Starting stack validations checks...`);
    const validationReport = requirementsValidator.validate(normalizedFields);

    // 5. Clarification Question generation
    logger.debug(`[RequirementAnalysisEngine] Generating clarification questions...`);
    const clarification = clarificationEngine.getQuestions(normalizedFields, extracted.scores);

    // 6. Build immutable RequirementObject
    logger.debug(`[RequirementAnalysisEngine] Building final RequirementObject...`);
    const reqObj = requirementBuilder.build(
      prompt,
      parsed.cleaned,
      normalizedFields,
      extracted.scores,
      clarification.unresolved,
      clarification.questions,
      validationReport
    );

    logger.info(`[RequirementAnalysisEngine] Analysis complete. Extracted Project Type: '${reqObj.detectedValues.projectType || 'Unknown'}'. Validation: ${reqObj.validationReport.isValid ? 'VALID' : 'INVALID'}`);
    return reqObj;
  }
}

export const requirementAnalysisEngine = new RequirementAnalysisEngine();
export default requirementAnalysisEngine;
export * from './types';
export * from './parser';
export * from './extractor';
export * from './normalizer';
export * from './validator';
export * from './clarification';
export * from './builder';
