import { PatchClassificationReport, PatchType } from './classificationTypes';
import { classifierRules } from './classifierRules';

export class PatchClassifier {
  public classify(patchContent: string, targetFile: string): PatchClassificationReport {
    const scores = new Map<PatchType, number>();
    const tags: string[] = [];

    // Scan content for keywords
    const lowerContent = (patchContent + ' ' + targetFile).toLowerCase();

    for (const rule of classifierRules) {
      let matches = 0;
      for (const kw of rule.keywords) {
        if (lowerContent.includes(kw)) {
          matches++;
        }
      }
      if (matches > 0) {
        const currentScore = scores.get(rule.type) || 0;
        scores.set(rule.type, currentScore + matches * rule.weight);
        tags.push(rule.type);
      }
    }

    // Determine primary type
    let primaryType: PatchType = 'Experimental';
    let highestScore = 0;
    for (const [type, score] of scores.entries()) {
      if (score > highestScore) {
        highestScore = score;
        primaryType = type;
      }
    }

    return {
      primaryType,
      confidence: highestScore > 0 ? Math.min(1.0, 0.5 + highestScore / 10) : 0.4,
      tags: Array.from(new Set(tags))
    };
  }
}
export const patchClassifier = new PatchClassifier();
