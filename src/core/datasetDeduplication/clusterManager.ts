import { DuplicateCluster } from './deduplicationTypes';
import { CleanedSample } from '../datasetCleaning/cleaningTypes';

export class ClusterManager {
  private clusters: DuplicateCluster[] = [];

  public createCluster(
    clusterId: string,
    representative: CleanedSample,
    duplicates: CleanedSample[],
    similarities: Record<string, number>
  ): DuplicateCluster {
    const languagesSet = new Set<string>();
    const qualityScores: Record<string, number> = {};
    const provenanceMap: any = {};

    const allSamples = [representative, ...duplicates];

    for (const sample of allSamples) {
      if (sample.provenance?.language) {
        languagesSet.add(sample.provenance.language);
      }
      qualityScores[sample.provenance?.sampleId || sample.filePath] = sample.qualityScore || 0;
      provenanceMap[sample.provenance?.sampleId || sample.filePath] = sample.provenance;
    }

    const cluster: DuplicateCluster = {
      clusterId,
      representativeSample: representative,
      duplicateSamples: duplicates,
      similarityScores: similarities,
      languages: Array.from(languagesSet),
      qualityScores,
      provenance: provenanceMap,
      resolutionDecision: 'Pending'
    };

    this.clusters.push(cluster);
    return cluster;
  }

  public getClusters(): DuplicateCluster[] {
    return [...this.clusters];
  }

  public clear(): void {
    this.clusters = [];
  }
}

export const clusterManager = new ClusterManager();
export default clusterManager;
