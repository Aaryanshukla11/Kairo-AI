import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { DuplicateCluster } from './deduplicationTypes';

export class DuplicateResolver {
  public resolveDuplicates(cluster: DuplicateCluster): DuplicateCluster {
    const all = [cluster.representativeSample, ...cluster.duplicateSamples];

    // Sort by rules:
    // 1. Quality score (descending)
    // 2. Metadata completeness (count of fields in provenance)
    // 3. Collection time (newest version preferred - collectionTime descending)
    all.sort((a, b) => {
      if ((b.qualityScore || 0) !== (a.qualityScore || 0)) {
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      }

      const metaA = this.getMetadataCount(a);
      const metaB = this.getMetadataCount(b);
      if (metaB !== metaA) {
        return metaB - metaA;
      }

      const timeA = a.provenance?.collectionTime || 0;
      const timeB = b.provenance?.collectionTime || 0;
      return timeB - timeA;
    });

    const representative = all[0];
    const duplicates = all.slice(1);

    return {
      ...cluster,
      representativeSample: representative,
      duplicateSamples: duplicates,
      resolutionDecision: `Resolved: Selected sample ${representative.provenance?.sampleId || representative.filePath} (Quality: ${representative.qualityScore}) as representative.`
    };
  }

  private getMetadataCount(sample: CleanedSample): number {
    if (!sample.provenance) return 0;
    return Object.values(sample.provenance).filter(v => v !== undefined && v !== null && v !== '').length;
  }
}

export const duplicateResolver = new DuplicateResolver();
export default duplicateResolver;
