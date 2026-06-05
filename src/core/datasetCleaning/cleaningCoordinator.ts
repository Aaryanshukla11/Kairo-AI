import { CollectedFileItem } from '../datasetCollector/collectorTypes';
import { CleanedSample, RejectedSample, CleaningRulesConfig } from './cleaningTypes';
import { invalidSampleDetector } from './invalidSampleDetector';
import { sampleNormalizer } from './sampleNormalizer';
import { repairEngine } from './repairEngine';
import { qualityScorer } from './qualityScorer';
import { sourceCodeCleaner, markdownCleaner, jsonCleaner, textCleaner, documentationCleaner } from './providers';

export class CleaningCoordinator {
  public processSample(
    sample: CollectedFileItem,
    config: CleaningRulesConfig
  ): { status: 'accepted' | 'rejected' | 'repaired'; cleanedSample?: CleanedSample; rejectedSample?: RejectedSample; normalizationsApplied: string[] } {
    
    const normalizationsApplied: string[] = [];

    // 1. Initial validation / Rejection checks
    const initialValidation = invalidSampleDetector.detectInvalidSample(sample, config);
    if (initialValidation.isInvalid) {
      // Check if sample is recoverable
      const repairRes = repairEngine.repairSample(sample);
      if (repairRes.repairsApplied.length > 0) {
        // Retry validation with repaired sample
        const repairedSample: CollectedFileItem = {
          ...sample,
          content: repairRes.repairedContent,
          provenance: repairRes.repairedProvenance
        };
        const secondValidation = invalidSampleDetector.detectInvalidSample(repairedSample, config);
        
        if (!secondValidation.isInvalid) {
          // Repaired successfully
          const normResult = sampleNormalizer.normalizeSample(repairedSample);
          const finalContent = this.applyFileTypeCleaner(sample.filePath, normResult.content);
          
          const quality = qualityScorer.evaluateQuality({
            ...repairedSample,
            content: finalContent,
            provenance: normResult.provenance
          });

          // Check minimum quality score constraint
          if (config.minQualityScoreAllowed && quality.overallScore < config.minQualityScoreAllowed) {
            return {
              status: 'rejected',
              rejectedSample: {
                filePath: sample.filePath,
                originalContent: sample.content,
                provenance: sample.provenance,
                rejectionReasons: [`Quality score ${quality.overallScore} is below minimum allowed ${config.minQualityScoreAllowed}`]
              },
              normalizationsApplied: []
            };
          }

          const allNorms = [...repairRes.repairsApplied, ...normResult.normalizationsApplied];

          return {
            status: 'repaired',
            cleanedSample: {
              filePath: sample.filePath,
              content: finalContent,
              originalSizeBytes: sample.content ? sample.content.length : 0,
              cleanedSizeBytes: finalContent.length,
              provenance: normResult.provenance,
              qualityScore: quality.overallScore,
              normalizationsApplied: allNorms
            },
            normalizationsApplied: allNorms
          };
        }
      }

      // If unrecoverable, return rejected
      return {
        status: 'rejected',
        rejectedSample: {
          filePath: sample.filePath,
          originalContent: sample.content || '',
          provenance: sample.provenance || { filePath: sample.filePath } as any,
          rejectionReasons: initialValidation.reasons
        },
        normalizationsApplied: []
      };
    }

    // 2. Normalization flow
    const normResult = sampleNormalizer.normalizeSample(sample);
    const finalContent = this.applyFileTypeCleaner(sample.filePath, normResult.content);
    const quality = qualityScorer.evaluateQuality({
      ...sample,
      content: finalContent,
      provenance: normResult.provenance
    });

    if (config.minQualityScoreAllowed && quality.overallScore < config.minQualityScoreAllowed) {
      return {
        status: 'rejected',
        rejectedSample: {
          filePath: sample.filePath,
          originalContent: sample.content,
          provenance: sample.provenance,
          rejectionReasons: [`Quality score ${quality.overallScore} is below minimum allowed ${config.minQualityScoreAllowed}`]
        },
        normalizationsApplied: []
      };
    }

    return {
      status: 'accepted',
      cleanedSample: {
        filePath: sample.filePath,
        content: finalContent,
        originalSizeBytes: sample.content ? sample.content.length : 0,
        cleanedSizeBytes: finalContent.length,
        provenance: normResult.provenance,
        qualityScore: quality.overallScore,
        normalizationsApplied: normResult.normalizationsApplied
      },
      normalizationsApplied: normResult.normalizationsApplied
    };
  }

  private applyFileTypeCleaner(filePath: string, content: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'js':
      case 'py':
      case 'java':
      case 'go':
      case 'rs':
        return sourceCodeCleaner.cleanSourceCode(content).content;
      case 'md':
      case 'markdown':
        return markdownCleaner.cleanMarkdown(content).content;
      case 'json':
        return jsonCleaner.cleanJson(content).content;
      default:
        return textCleaner.cleanText(content).content;
    }
  }
}

export const cleaningCoordinator = new CleaningCoordinator();
