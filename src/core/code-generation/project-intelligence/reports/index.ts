import { IComplexityScores, IGeneratorStep, IFeatureMetadata } from '../schemas';

export class SummaryReporter {
  public compileSummaries(
    category: string,
    domain: string,
    complexity: IComplexityScores,
    features: IFeatureMetadata[],
    steps: IGeneratorStep[]
  ): {
    businessSummary: string;
    engineeringSummary: string;
    complexitySummary: string;
    generatorSummary: string;
  } {
    const businessSummary = `This is a ${category} application targeting the ${domain} domain. It is planned with ${features.length} core functional features.`;
    
    const engineeringSummary = `Recommended design involves modular architectures, mapping ${steps.filter(s => s.required).length} code generation stages from database layouts to testing containers.`;
    
    const complexitySummary = `Overall Complexity Score: ${complexity.projectComplexity}/100. Technical Complexity: ${complexity.technicalComplexity}/100. Risk level is evaluated at ${complexity.overallRisk}/100.`;
    
    const generatorSummary = `Pipeline execution strategy runs generators in sequence: ${steps.filter(s => s.required).map(s => s.generatorId).join(' -> ')}.`;

    return {
      businessSummary,
      engineeringSummary,
      complexitySummary,
      generatorSummary
    };
  }
}

export const summaryReporter = new SummaryReporter();
export default summaryReporter;
