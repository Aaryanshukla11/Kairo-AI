import { IEnterpriseRequirement } from '../requirement-schema';
import { IProjectIntelligence } from './schemas';
import { projectClassifier } from './classifiers';
import { domainAndScalabilityAnalyzer } from './analyzers';
import { featureAndModuleDetector } from './detectors';
import { complexityScorer } from './scorers';
import { strategyPlanner } from './strategies';
import { summaryReporter } from './reports';
import { logger } from '../logger';

export class ProjectIntelligenceEngine {
  public analyze(req: IEnterpriseRequirement): IProjectIntelligence {
    logger.info(`[ProjectIntelligenceEngine] Analyzing requirement contract for project: '${req.identity.projectName}'`);

    // 1. Classification
    const category = projectClassifier.classify(req);

    // 2. Domain analysis
    const domain = domainAndScalabilityAnalyzer.analyzeDomain(category);

    // 3. Features & Modules Detection
    const features = featureAndModuleDetector.detectFeatures(category, req);
    const businessModules = featureAndModuleDetector.detectModules(category);

    // 4. Complexity Scoring
    const complexity = complexityScorer.calculateScores(category, features.length, req);

    // 5. Architecture & Generator Strategies
    const recommendedArchitectures = strategyPlanner.planArchitecture(category, complexity.technicalComplexity);
    const generatorStrategy = strategyPlanner.planGeneratorExecution(req.stack);

    // 6. Technology hints
    const technologyHints: string[] = [];
    if (req.stack.frontend) technologyHints.push('Frontend Required');
    if (req.stack.backend) technologyHints.push('Backend Required');
    if (req.stack.database) technologyHints.push('Database Required');
    if (category === 'Streaming Platform') {
      technologyHints.push('Realtime Recommended', 'Object Storage Recommended');
    }

    // 7. Scalability & risks
    const scalability = domainAndScalabilityAnalyzer.analyzeScalability(category);
    const risks: string[] = [];
    if (complexity.overallRisk > 70) {
      risks.push('High Complexity Stack', 'Compliance Critical');
    }

    // 8. Compile Reports Summaries
    const summaries = summaryReporter.compileSummaries(category, domain, complexity, features, generatorStrategy);

    const result: IProjectIntelligence = {
      category,
      domain,
      features,
      businessModules,
      complexity,
      recommendedArchitectures,
      generatorStrategy,
      technologyHints,
      scalability,
      risks,
      summaries
    };

    logger.info(`[ProjectIntelligenceEngine] Analysis completed. Category: ${category}, Domain: ${domain}, Overall Risk: ${complexity.overallRisk}`);
    return Object.freeze(result);
  }
}

export const projectIntelligenceEngine = new ProjectIntelligenceEngine();
export default projectIntelligenceEngine;
export * from './schemas';
export * from './classifiers';
export * from './analyzers';
export * from './detectors';
export * from './scorers';
export * from './strategies';
export * from './reports';
export { ProjectClassifier } from './classifiers';
export { DomainAndScalabilityAnalyzer } from './analyzers';
export { FeatureAndModuleDetector } from './detectors';
export { ComplexityScorer } from './scorers';
export { StrategyPlanner } from './strategies';
export { SummaryReporter } from './reports';
