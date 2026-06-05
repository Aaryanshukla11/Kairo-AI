import { IComplexityScores } from '../schemas';
import { IEnterpriseRequirement } from '../../requirement-schema';

export class ComplexityScorer {
  public calculateScores(
    category: string,
    featuresCount: number,
    req: IEnterpriseRequirement
  ): IComplexityScores {
    let tech = 30;
    let business = 20;

    // 1. Calculate tech complexity weights
    if (category === 'Streaming Platform') {
      tech += 50;
      business += 35;
    } else if (category === 'Hospital Management') {
      tech += 35;
      business += 45;
    } else if (category === 'Ecommerce') {
      tech += 30;
      business += 35;
    }

    // 2. Adjust based on feature count
    tech += featuresCount * 5;
    if (tech > 100) tech = 100;
    if (business > 100) business = 100;

    const maintenance = Math.round((tech + business) / 2);
    const deployment = req.stack.deployment === 'Docker' ? 65 : 40;
    const testing = req.stack.testing ? 55 : 30;

    const projectComplexity = Math.round((tech + business + maintenance) / 3);
    const overallRisk = Math.round((tech * 0.4) + (business * 0.4) + (maintenance * 0.2));

    return {
      projectComplexity,
      technicalComplexity: tech,
      businessComplexity: business,
      maintenanceComplexity: maintenance,
      deploymentComplexity: deployment,
      testingComplexity: testing,
      overallRisk
    };
  }
}

export const complexityScorer = new ComplexityScorer();
export default complexityScorer;
