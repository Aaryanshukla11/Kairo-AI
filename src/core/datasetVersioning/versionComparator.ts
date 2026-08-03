import { DatasetVersionModel, VersionComparisonModel } from './versionTypes';

export class VersionComparator {
  public compareVersions(v1: DatasetVersionModel, v2: DatasetVersionModel): VersionComparisonModel {
    const sampleCountDiff = v2.sampleCount - v1.sampleCount;
    const tokenCountDiff = v2.tokenEstimate - v1.tokenEstimate;
    
    const languagesV1 = new Set(v1.languages || []);
    const languagesV2 = new Set(v2.languages || []);

    const languagesAdded = Array.from(languagesV2).filter(lang => !languagesV1.has(lang));
    const languagesRemoved = Array.from(languagesV1).filter(lang => !languagesV2.has(lang));

    const qualityScoreDiff = (v2.qualityMetrics?.averageQualityScore || 0) - (v1.qualityMetrics?.averageQualityScore || 0);
    const checksumsMatch = v1.checksum === v2.checksum;

    return {
      v1: v1.version,
      v2: v2.version,
      sampleCountDiff,
      tokenCountDiff,
      languagesAdded,
      languagesRemoved,
      qualityScoreDiff,
      duplicatesRemovedDiff: 0, // stub or default
      cleaningRulesDiff: [],
      checksumsMatch
    };
  }
}

export const versionComparator = new VersionComparator();
export default versionComparator;
