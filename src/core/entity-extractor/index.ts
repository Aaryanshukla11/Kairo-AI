import { typeDetector } from './detectors/type-detector';
import { techDetector } from './detectors/tech-detector';
import { featureDetector } from './detectors/feature-detector';
import { IEntityExtractionOutput, IEntity } from './types';

export class EntityExtractor {
  public extract(prompt: string): IEntityExtractionOutput {
    if (!prompt) {
      return this.emptyOutput();
    }

    const typeResult = typeDetector.detect(prompt);
    const techResult = techDetector.detect(prompt);
    const featureResult = featureDetector.detect(prompt);

    // Compute overall confidence score based on tech & type detections
    const detectedScores: number[] = [];
    
    const checkScore = (entity: IEntity<any>) => {
      if (entity.value !== null && entity.value !== 'UNKNOWN') {
        detectedScores.push(entity.confidence);
      }
    };

    checkScore(typeResult);
    Object.values(techResult).forEach(checkScore);

    // If nothing detected, confidence is low, else average of detected confidences
    const overallConfidence = detectedScores.length > 0
      ? parseFloat((detectedScores.reduce((a, b) => a + b, 0) / detectedScores.length).toFixed(2))
      : 0.1;

    const output: IEntityExtractionOutput = {
      projectName: techResult.projectName,
      projectType: typeResult,
      language: techResult.language,
      frontend: techResult.frontend,
      backend: techResult.backend,
      database: techResult.database,
      authMethod: techResult.authMethod,
      apiStyle: techResult.apiStyle,
      uiFramework: techResult.uiFramework,
      cssFramework: techResult.cssFramework,
      stateManagement: techResult.stateManagement,
      buildTool: techResult.buildTool,
      packageManager: techResult.packageManager,
      testingFramework: techResult.testingFramework,
      deploymentTarget: techResult.deploymentTarget,
      operatingSystem: techResult.operatingSystem,
      targetPlatform: techResult.targetPlatform,
      features: Object.freeze(featureResult.features),
      integrations: Object.freeze(featureResult.integrations),
      aiFeatures: Object.freeze(featureResult.aiFeatures),
      specialRequirements: Object.freeze(featureResult.specialRequirements),
      confidence: overallConfidence
    };

    return this.deepFreeze(output);
  }

  private emptyOutput(): IEntityExtractionOutput {
    const emptyEntity = { value: null, confidence: 0.0 };
    return this.deepFreeze({
      projectName: emptyEntity,
      projectType: { value: 'UNKNOWN', confidence: 0.0 },
      language: emptyEntity,
      frontend: emptyEntity,
      backend: emptyEntity,
      database: emptyEntity,
      authMethod: emptyEntity,
      apiStyle: emptyEntity,
      uiFramework: emptyEntity,
      cssFramework: emptyEntity,
      stateManagement: emptyEntity,
      buildTool: emptyEntity,
      packageManager: emptyEntity,
      testingFramework: emptyEntity,
      deploymentTarget: emptyEntity,
      operatingSystem: emptyEntity,
      targetPlatform: emptyEntity,
      features: [],
      integrations: [],
      aiFeatures: [],
      specialRequirements: [],
      confidence: 0.0
    });
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const entityExtractor = new EntityExtractor();
export default entityExtractor;
export * from './types';
export { TypeDetector } from './detectors/type-detector';
export { TechDetector } from './detectors/tech-detector';
export { FeatureDetector } from './detectors/feature-detector';
