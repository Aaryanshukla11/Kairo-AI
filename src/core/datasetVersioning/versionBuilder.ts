import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { DatasetVersionModel } from './versionTypes';

export class VersionBuilder {
  public buildVersion(
    datasetId: string,
    version: string,
    checksum: string,
    samples: CleanedSample[],
    parentVersion?: string
  ): DatasetVersionModel {
    const languages = new Set<string>();
    const licenses = new Set<string>();
    let totalQuality = 0;

    for (const sample of samples) {
      if (sample.provenance?.language) {
        languages.add(sample.provenance.language);
      }
      if (sample.provenance?.license) {
        licenses.add(sample.provenance.license);
      }
      totalQuality += sample.qualityScore || 0;
    }

    const sampleCount = samples.length;
    const avgQuality = sampleCount > 0 ? Math.round(totalQuality / sampleCount) : 0;
    
    // Very simple token estimation: 1 word ~ 1.3 tokens fallback
    const tokenEstimate = samples.reduce((sum, s) => {
      const words = (s.content || '').split(/\s+/).length;
      return sum + Math.round(words * 1.3);
    }, 0);

    return {
      datasetId,
      version,
      parentVersion,
      creationTime: Date.now(),
      pipelineVersion: '1.0.0',
      builderVersion: '1.0.0',
      checksum,
      sampleCount,
      tokenEstimate,
      languages: Array.from(languages),
      licenses: Array.from(licenses),
      qualityMetrics: {
        averageQualityScore: avgQuality,
        syntaxValidity: 100, // mock fallback summaries
        metadataCompleteness: 100
      }
    };
  }
}

export const versionBuilder = new VersionBuilder();
export default versionBuilder;
